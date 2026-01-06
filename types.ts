export type LoveLinkerSettings = {
  webdavBaseUrl: string;
  webdavUsername: string;
  webdavPassword: string;
  webdavContentDir: string;
  webdavManifestFile: string;
  localContentFolder: string;
  defaultExtension: "md" | "mdx";
  defaultAccent: string;
  accentOptions: string[];
  defaultCoverUrl: string;
  manifestPreviewLimit: number;
};

export type AccentOption = {
  value: string;
  label: string;
};

export type FrontmatterData = {
  title: string;
  date: string;
  excerpt: string;
  place?: string;
  cover?: string;
  accent?: string;
  tags?: string[];
  visibility?: "public" | "private" | string;
};

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  isPrivate: boolean;
};

export const DEFAULT_SETTINGS: LoveLinkerSettings = {
  webdavBaseUrl: "",
  webdavUsername: "",
  webdavPassword: "",
  webdavContentDir: "milestones",
  webdavManifestFile: "manifest.json",
  localContentFolder: "milestones",
  defaultExtension: "mdx",
  defaultAccent: "coral",
  accentOptions: [
    "coral|珊瑚红",
    "peach|桃杏",
    "amber|琥珀黄",
    "sea|海蓝",
    "sky|天蓝",
    "ink|墨黑",
    "paper|纸白"
  ],
  defaultCoverUrl: "https://your-image-host/cover.svg",
  manifestPreviewLimit: 10
};
