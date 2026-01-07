import { requestUrl } from "obsidian";
import type { LoveLinkerSettings } from "./types";

export class WebDavError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "WebDavError";
    this.status = status;
  }
}

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const normalizeSegment = (value: string) => value.trim().replace(/^\/+|\/+$/g, "");

const encodePath = (value: string) =>
  value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const encodeUtf8Bytes = (value: string) => {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value);
  }
  const encoded = encodeURIComponent(value);
  const bytes: number[] = [];
  for (let i = 0; i < encoded.length; i += 1) {
    const char = encoded[i];
    if (char === "%") {
      const hex = encoded.slice(i + 1, i + 3);
      bytes.push(parseInt(hex, 16));
      i += 2;
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }
  return new Uint8Array(bytes);
};

const encodeBase64 = (value: string) => {
  if (typeof btoa === "function") {
    return btoa(
      encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
    );
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }
  const bytes = encodeUtf8Bytes(value);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    output += chars[(triple >> 18) & 63];
    output += chars[(triple >> 12) & 63];
    output += i + 1 < bytes.length ? chars[(triple >> 6) & 63] : "=";
    output += i + 2 < bytes.length ? chars[triple & 63] : "=";
  }
  return output;
};

export class WebDavClient {
  constructor(private getSettings: () => LoveLinkerSettings) {}

  buildUrl(pathParts: string[]) {
    const settings = this.getSettings();
    const baseUrl = normalizeBaseUrl(settings.webdavBaseUrl);
    if (!baseUrl) throw new WebDavError("未配置 WEBDAV_BASE_URL。请先在设置中填写。", 0);

    const path = pathParts
      .map((part) => normalizeSegment(part))
      .filter(Boolean)
      .map(encodePath)
      .join("/");

    return `${baseUrl}/${path}`;
  }

  private getAuthHeader() {
    const settings = this.getSettings();
    if (!settings.webdavUsername || !settings.webdavPassword) {
      throw new WebDavError("未配置 WEBDAV_USERNAME 或 WEBDAV_PASSWORD。", 0);
    }
    const token = encodeBase64(`${settings.webdavUsername}:${settings.webdavPassword}`);
    return `Basic ${token}`;
  }

  async getText(pathParts: string[]) {
    const url = this.buildUrl(pathParts);
    const response = await requestUrl({
      url,
      method: "GET",
      headers: {
        Authorization: this.getAuthHeader()
      }
    });

    if (response.status < 200 || response.status >= 300) {
      throw new WebDavError(`WebDAV 请求失败 (${response.status})`, response.status);
    }

    return response.text;
  }

  async getJson<T>(pathParts: string[]): Promise<T> {
    const text = await this.getText(pathParts);
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new WebDavError("远端返回的 JSON 解析失败。", 0);
    }
  }

  async checkConnection() {
    const url = this.buildUrl([]);
    const response = await requestUrl({
      url,
      method: "PROPFIND",
      headers: {
        Authorization: this.getAuthHeader(),
        Depth: "0"
      }
    });

    if (response.status < 200 || response.status >= 300) {
      throw new WebDavError(`WebDAV 连接失败 (${response.status})`, response.status);
    }
  }

  async ensureDirectory(pathParts: string[]) {
    const url = this.buildUrl(pathParts);
    const authHeader = this.getAuthHeader();
    const existsResponse = await requestUrl({
      url,
      method: "PROPFIND",
      headers: {
        Authorization: authHeader,
        Depth: "0"
      },
      throw: false
    });

    if (existsResponse.status >= 200 && existsResponse.status < 300) {
      return;
    }
    if (existsResponse.status === 401 || existsResponse.status === 403) {
      throw new WebDavError(`WebDAV 目录访问失败 (${existsResponse.status})`, existsResponse.status);
    }

    const createResponse = await requestUrl({
      url,
      method: "MKCOL",
      headers: {
        Authorization: authHeader
      },
      throw: false
    });

    if (createResponse.status >= 200 && createResponse.status < 300) {
      return;
    }
    if (
      createResponse.status === 301 ||
      createResponse.status === 302 ||
      createResponse.status === 307 ||
      createResponse.status === 308 ||
      createResponse.status === 405
    ) {
      return;
    }
    throw new WebDavError(`WebDAV 目录创建失败 (${createResponse.status})`, createResponse.status);
  }

  async putText(pathParts: string[], text: string, contentType: string) {
    const url = this.buildUrl(pathParts);
    const response = await requestUrl({
      url,
      method: "PUT",
      body: text,
      contentType,
      headers: {
        Authorization: this.getAuthHeader()
      }
    });

    if (response.status < 200 || response.status >= 300) {
      throw new WebDavError(`WebDAV 上传失败 (${response.status})`, response.status);
    }
  }
}
