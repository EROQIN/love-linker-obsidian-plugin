import type { AccentOption, FrontmatterData, ValidationResult } from "./types";
import { isValidDate } from "./frontmatter";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isHexColor = (value: string) => /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);

const toStringValue = (value: unknown) => (typeof value === "string" ? value : "");
const toOptionalString = (value: unknown) => (typeof value === "string" ? value : undefined);

export const normalizeFrontmatter = (data: Record<string, unknown>): FrontmatterData => {
  const tags = Array.isArray(data.tags)
    ? data.tags
        .map((tag) => (typeof tag === "string" || typeof tag === "number" ? String(tag) : ""))
        .filter((tag) => tag.length > 0)
    : undefined;

  return {
    title: toStringValue(data.title),
    date: toStringValue(data.date),
    excerpt: toStringValue(data.excerpt),
    place: toOptionalString(data.place),
    cover: toOptionalString(data.cover),
    accent: toOptionalString(data.accent),
    tags,
    visibility: toOptionalString(data.visibility)
  };
};

export const validateFrontmatter = (
  data: Record<string, unknown> | null,
  accentOptions: AccentOption[]
): ValidationResult => {
  const result: ValidationResult = { ok: false, errors: [], warnings: [], isPrivate: false };
  if (!data) {
    result.errors.push("未读取到 YAML frontmatter。请在文件开头添加 --- 块。");
    return result;
  }

  const normalized = normalizeFrontmatter(data);

  if (!isNonEmptyString(normalized.title)) {
    result.errors.push("缺少 title，或不是字符串。");
  }

  if (!isNonEmptyString(normalized.date) || !isValidDate(normalized.date)) {
    result.errors.push("date 必须为 YYYY-MM-DD 且是有效日期。");
  }

  if (!isNonEmptyString(normalized.excerpt)) {
    result.errors.push("缺少 excerpt，或不是字符串。");
  }

  if (normalized.visibility && normalized.visibility !== "public" && normalized.visibility !== "private") {
    result.errors.push("visibility 只能是 public 或 private。");
  }

  if (normalized.visibility === "private") {
    result.isPrivate = true;
  }

  if (data.tags && !Array.isArray(data.tags)) {
    result.warnings.push("tags 应为数组，例如 [\"旅途\", \"潮声\"]。");
  }

  if (normalized.accent && normalized.accent.trim()) {
    const accentKeys = accentOptions.map((option) => option.value);
    if (!accentKeys.includes(normalized.accent) && !isHexColor(normalized.accent)) {
      result.warnings.push("accent 不在调色板中（或不是 #hex），网站可能会给出警告。");
    }
  }

  result.ok = result.errors.length === 0;
  return result;
};
