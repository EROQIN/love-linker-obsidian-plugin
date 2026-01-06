export type ManifestItem = {
  slug: string;
  file: string;
  title?: string;
  date?: string;
  excerpt?: string;
  place?: string;
  cover?: string;
  accent?: string;
  tags?: string[];
  visibility?: "public" | "private";
};

export type ManifestPayload = {
  items: ManifestItem[];
};
