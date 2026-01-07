export type LoveLinkerSettings = {
  webdavBaseUrl: string;
  webdavUsername: string;
  webdavPassword: string;
  webdavContentDir: string;
  webdavManifestFile: string;
  webdavTrashDir: string;
  localContentFolder: string;
  defaultExtension: "md" | "mdx";
  defaultAccent: string;
  accentOptions: string[];
  defaultCoverUrl: string;
  manifestPreviewLimit: number;
  autoOpenPanel: boolean;
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

export type FrontmatterEditState = {
  title: string;
  date: string;
  place: string;
  visibility: "public" | "private";
  accent: string;
  cover: string;
  tags: string;
  excerpt: string;
};

export const DEFAULT_SETTINGS: LoveLinkerSettings = {
  webdavBaseUrl: "",
  webdavUsername: "",
  webdavPassword: "",
  webdavContentDir: "milestones",
  webdavManifestFile: "manifest.json",
  webdavTrashDir: "_trash",
  localContentFolder: "milestones",
  defaultExtension: "md",
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
  defaultCoverUrl: "",
  manifestPreviewLimit: 10,
  autoOpenPanel: true
};
