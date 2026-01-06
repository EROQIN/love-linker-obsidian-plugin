import { parseYaml } from "obsidian";
import type { FrontmatterData } from "./types";

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const formatDate = (value: Date) => {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const isValidDate = (value: string) => {
  if (!DATE_REGEX.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().startsWith(value);
};

export const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "milestone";
};

export const parseTagsInput = (value: string) => {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const escapeYamlString = (value: string) => {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
};

const buildYamlArray = (tags: string[]) => {
  if (!tags || tags.length === 0) return "[]";
  const escaped = tags.map((tag) => `\"${escapeYamlString(tag)}\"`);
  return `[${escaped.join(", ")}]`;
};

export const buildFrontmatterTemplate = (data: FrontmatterData) => {
  const title = escapeYamlString(data.title);
  const date = escapeYamlString(data.date);
  const place = escapeYamlString(data.place ?? "");
  const accent = escapeYamlString(data.accent ?? "");
  const cover = escapeYamlString(data.cover ?? "");
  const excerpt = escapeYamlString(data.excerpt);
  const tags = buildYamlArray(data.tags ?? []);
  const visibility = escapeYamlString(data.visibility ?? "public");

  return [
    "---",
    `title: \"${title}\"`,
    `date: \"${date}\"`,
    `place: \"${place}\"`,
    `accent: \"${accent}\"`,
    `cover: \"${cover}\"`,
    `excerpt: \"${excerpt}\"`,
    `tags: ${tags}`,
    `visibility: \"${visibility}\"`,
    "---",
    ""
  ].join("\n");
};

export const parseFrontmatterBlock = (text: string) => {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) {
    return { data: null as Record<string, unknown> | null, hasFrontmatter: false };
  }

  try {
    const data = (parseYaml(match[1]) as Record<string, unknown>) ?? {};
    return { data, hasFrontmatter: true };
  } catch (error) {
    return { data: null as Record<string, unknown> | null, hasFrontmatter: true, error };
  }
};

export const getFrontmatterEndLine = (text: string) => {
  const lines = text.split("\n");
  let delimiterCount = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      delimiterCount += 1;
      if (delimiterCount === 2) return i;
    }
  }
  return 0;
};

export const suggestSlugFromFilename = (basename: string) => {
  const match = basename.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  if (match && match[1]) return match[1];
  return basename;
};
