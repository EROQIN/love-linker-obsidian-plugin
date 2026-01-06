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
    const token = Buffer.from(
      `${settings.webdavUsername}:${settings.webdavPassword}`,
      "utf8"
    ).toString("base64");
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
