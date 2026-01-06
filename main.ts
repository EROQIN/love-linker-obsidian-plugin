import {
  MarkdownView,
  Notice,
  Plugin,
  TFile,
  normalizePath
} from "obsidian";
import { LoveLinkerSettingTab } from "./settings";
import { DEFAULT_SETTINGS, type AccentOption, type LoveLinkerSettings } from "./types";
import {
  formatDate,
  buildFrontmatterTemplate,
  getFrontmatterEndLine,
  isValidDate,
  parseFrontmatterBlock,
  slugify,
  suggestSlugFromFilename
} from "./frontmatter";
import { validateFrontmatter } from "./validation";
import {
  NewArticleModal,
  SlugConflictModal,
  SlugInputModal,
  type ConflictChoice,
  type NewArticleFormData,
  type SlugModalResult
} from "./modals";
import { PublishPanelView, VIEW_TYPE } from "./publishView";
import { WebDavClient, WebDavError } from "./webdavClient";
import type { ManifestItem, ManifestPayload } from "./webdavTypes";

export default class LoveLinkerPublisherPlugin extends Plugin {
  settings: LoveLinkerSettings = DEFAULT_SETTINGS;
  private webdav!: WebDavClient;
  private publishView?: PublishPanelView;

  async onload() {
    await this.loadSettings();
    this.webdav = new WebDavClient(() => this.settings);

    this.addSettingTab(new LoveLinkerSettingTab(this.app, this));

    this.registerView(VIEW_TYPE, (leaf) => {
      this.publishView = new PublishPanelView(leaf, this);
      return this.publishView;
    });

    this.addRibbonIcon("paper-plane", "打开 Love Linker 发布面板", () => {
      this.activatePublishView();
    });

    this.addCommand({
      id: "love-linker-open-panel",
      name: "打开发布面板",
      callback: () => this.activatePublishView()
    });

    this.addCommand({
      id: "love-linker-new-article",
      name: "新建文章",
      callback: () => this.openNewArticleModal()
    });

    this.addCommand({
      id: "love-linker-push-current",
      name: "推送/更新当前文档到 WebDAV",
      callback: () => this.pushCurrentFile()
    });

    this.addCommand({
      id: "love-linker-add-frontmatter",
      name: "补全当前文档 frontmatter",
      callback: () => this.addFrontmatterFieldsToCurrentFile()
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFile && this.isMarkdownFile(file)) {
          menu.addItem((item) => {
            item
              .setTitle("推送/更新到 WebDAV")
              .setIcon("paper-plane")
              .onClick(() => this.pushCurrentFile({ file }));
          });
        }
      })
    );

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.publishView?.refreshFileStatus();
      })
    );

    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        const active = this.app.workspace.getActiveFile();
        if (active && file.path === active.path) {
          this.publishView?.refreshFileStatus();
        }
      })
    );
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (this.settings.defaultExtension !== "md") {
      this.settings.defaultExtension = "md";
    }
    if (this.settings.defaultCoverUrl === "https://your-image-host/cover.svg") {
      this.settings.defaultCoverUrl = "";
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.publishView?.refreshRemoteInfo();
  }

  getRemoteInfo() {
    return {
      baseUrl: this.settings.webdavBaseUrl.trim(),
      contentDir: this.settings.webdavContentDir.trim() || "milestones"
    };
  }

  async activatePublishView() {
    const leaf = this.app.workspace.getRightLeaf(true);
    if (!leaf) {
      new Notice("无法打开侧边栏，请检查工作区布局。", 3000);
      return;
    }
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
    this.publishView = leaf.view as PublishPanelView;
    this.publishView?.refresh();
  }

  getAccentOptions(): AccentOption[] {
    const options: AccentOption[] = [];
    for (const line of this.settings.accentOptions) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const [value, label] = trimmed.split("|").map((part) => part.trim());
      if (!value) continue;
      options.push({ value, label: label || value });
    }

    if (options.length === 0) {
      options.push({ value: this.settings.defaultAccent, label: this.settings.defaultAccent });
    }

    const hasDefault = options.some((option) => option.value === this.settings.defaultAccent);
    if (!hasDefault && this.settings.defaultAccent.trim()) {
      options.unshift({
        value: this.settings.defaultAccent,
        label: `${this.settings.defaultAccent}（默认）`
      });
    }

    return options;
  }

  async openNewArticleModal() {
    const modal = new NewArticleModal(this.app, {
      accentOptions: this.getAccentOptions(),
      defaultAccent: this.settings.defaultAccent,
      defaultCover: this.settings.defaultCoverUrl,
      defaultExtension: this.settings.defaultExtension,
      onSubmit: async (data) => this.createNewArticle(data)
    });
    modal.open();
  }

  async createNewArticle(data: NewArticleFormData) {
    const folder = this.settings.localContentFolder.trim() || "milestones";
    const date = isValidDate(data.date) ? data.date : formatDate(new Date());
    const fileName = this.resolveNewFileName(data.fileName, date);
    if (!fileName) return false;
    const filePath = normalizePath(`${folder}/${fileName}`);

    if (this.app.vault.getAbstractFileByPath(filePath)) {
      new Notice("文件已存在，请修改文件名。", 4000);
      return false;
    }

    await this.ensureFolder(folder);

    const content = buildFrontmatterTemplate({
      title: data.title,
      date,
      place: data.place,
      accent: data.accent,
      cover: data.cover || this.settings.defaultCoverUrl,
      excerpt: data.excerpt,
      tags: data.tags,
      visibility: data.visibility
    });

    const file = await this.app.vault.create(filePath, content);
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file, { active: true });

    const view = leaf.view instanceof MarkdownView ? leaf.view : null;
    if (view) {
      const endLine = getFrontmatterEndLine(content);
      const cursorLine = endLine >= 0 ? endLine + 1 : 0;
      view.editor.setCursor({ line: cursorLine, ch: 0 });
      view.editor.focus();
    }

    new Notice("已创建新文档。", 3000);
    this.publishView?.refreshFileStatus();
    return true;
  }

  async pushCurrentFile(options?: { file?: TFile; progress?: (message: string) => void }) {
    const progress = options?.progress ?? (() => undefined);
    const file = options?.file ?? this.app.workspace.getActiveFile();

    if (!file || !this.isMarkdownFile(file)) {
      new Notice("请先打开一个 Markdown 文件。", 3000);
      return;
    }

    await this.saveFileIfOpen(file);

    progress("正在解析 frontmatter...");
    const raw = await this.app.vault.read(file);
    const parsed = await this.readFrontmatter(file, raw);
    if (!parsed.hasFrontmatter) {
      new Notice("未检测到 frontmatter，请先创建 YAML 块。", 4000);
      return;
    }
    if (parsed.error || !parsed.data) {
      new Notice("frontmatter 解析失败，请检查 YAML 格式。", 4000);
      return;
    }

    const validation = validateFrontmatter(parsed.data, this.getAccentOptions());
    if (!validation.ok) {
      new Notice(`校验失败：${validation.errors.join("；")}`, 5000);
      return;
    }
    if (validation.warnings.length > 0) {
      new Notice(`提示：${validation.warnings.join("；")}`, 4000);
    }
    if (validation.isPrivate) {
      new Notice("该文章为 private，网站可能不会生成或出现在首页。", 5000);
    }

    const extension = file.extension.toLowerCase() === "md" ? "md" : "mdx";
    let slugResult = await this.promptSlug(
      this.suggestSlug(file, parsed.data),
      extension
    );
    if (!slugResult) return;

    if (slugResult.forcePrivate) {
      progress("正在更新 visibility 为 private...");
      await this.updateVisibility(file, "private");
      await this.saveFileIfOpen(file);
    }

    progress("正在确认远端目录...");
    const folderReady = await this.ensureRemoteContentDir();
    if (!folderReady) return;

    progress("正在拉取 manifest...");
    const manifest = await this.fetchManifest();
    if (!manifest) return;

    const resolved = await this.applySlugToManifest(manifest.items, slugResult, extension);
    if (!resolved) return;

    slugResult = resolved.slugResult;
    const manifestText = JSON.stringify({ items: resolved.items }, null, 2) + "\n";

    let fileUploaded = false;

    if (!slugResult.manifestOnly) {
      progress("正在上传文档...");
      try {
        const latest = await this.app.vault.read(file);
        await this.webdav.putText(
          [this.settings.webdavContentDir, slugResult.fileName],
          latest,
          "text/markdown; charset=utf-8"
        );
        fileUploaded = true;
        new Notice("文档已上传。", 3000);
      } catch (error) {
        new Notice(this.formatWebDavError(error, "上传文档"), 5000);
        return;
      }
    } else {
      progress("已跳过文档上传（仅更新 manifest）");
    }

    progress("正在更新 manifest...");
    try {
      await this.webdav.putText(
        [this.settings.webdavContentDir, this.settings.webdavManifestFile],
        manifestText,
        "application/json; charset=utf-8"
      );
      new Notice("manifest 已更新，网站将在 ISR 周期内自动刷新。", 4000);
    } catch (error) {
      if (fileUploaded) {
        new Notice(
          "远端 manifest 更新失败，网站可能无法访问该文章。请重试或手动修复。",
          6000
        );
      } else {
        new Notice(this.formatWebDavError(error, "更新 manifest"), 5000);
      }
      return;
    }

    progress("正在写入 slug...");
    await this.updateSlug(file, slugResult.slug);
    await this.saveFileIfOpen(file);

    progress("推送/更新完成");
    this.publishView?.loadManifestPreview();
  }

  async testConnection() {
    try {
      await this.webdav.checkConnection();
      new Notice("连接成功。", 3000);
      return true;
    } catch (error) {
      new Notice(this.formatWebDavError(error, "测试连接"), 5000);
      return false;
    }
  }

  async fetchManifestPreview() {
    try {
      const payload = await this.webdav.getJson<ManifestPayload>([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
      const items = this.normalizeManifestItems(payload.items);
      return { items, limit: this.settings.manifestPreviewLimit };
    } catch (error) {
      new Notice(this.formatWebDavError(error, "读取 manifest"), 5000);
      return null;
    }
  }

  async getActiveFileStatus() {
    const file = this.app.workspace.getActiveFile();
    if (!file || !this.isMarkdownFile(file)) {
      return {
        file: null,
        hasFrontmatter: false,
        validation: { ok: false, errors: [], warnings: [], isPrivate: false }
      };
    }

    const parsed = await this.readFrontmatter(file);
    if (!parsed.hasFrontmatter) {
      return {
        file,
        hasFrontmatter: false,
        validation: { ok: false, errors: [], warnings: [], isPrivate: false }
      };
    }

    if (parsed.error || !parsed.data) {
      return {
        file,
        hasFrontmatter: true,
        validation: {
          ok: false,
          errors: ["frontmatter 解析失败"],
          warnings: [],
          isPrivate: false
        }
      };
    }

    const validation = validateFrontmatter(parsed.data, this.getAccentOptions());
    return { file, hasFrontmatter: true, validation };
  }

  private async saveFileIfOpen(file: TFile) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view?.file?.path === file.path) {
      await view.save();
    }
  }

  private async readFrontmatter(file: TFile, raw?: string) {
    const cached = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (cached && Object.keys(cached).length > 0) {
      return { data: cached, hasFrontmatter: true, error: null as unknown };
    }
    const text = raw ?? (await this.app.vault.read(file));
    const parsed = parseFrontmatterBlock(text);
    return { data: parsed.data, hasFrontmatter: parsed.hasFrontmatter, error: parsed.error };
  }

  private async ensureFolder(folder: string) {
    const normalized = normalizePath(folder);
    if (this.app.vault.getAbstractFileByPath(normalized)) return;
    await this.app.vault.createFolder(normalized);
  }

  private isMarkdownFile(file: TFile) {
    const ext = file.extension.toLowerCase();
    return ext === "md";
  }

  private suggestSlug(file: TFile, frontmatter: Record<string, unknown>) {
    const frontmatterSlug = frontmatter.slug ? String(frontmatter.slug).trim() : "";
    if (frontmatterSlug) {
      return frontmatterSlug;
    }
    const base = suggestSlugFromFilename(file.basename);
    if (base && base !== file.basename) {
      return slugify(base);
    }
    const title = frontmatter.title ? String(frontmatter.title) : "";
    return slugify(title || base);
  }

  private async promptSlug(defaultSlug: string, extension: "md" | "mdx") {
    return await new Promise<SlugModalResult | null>((resolve) => {
      let resolved = false;
      const modal = new SlugInputModal(this.app, {
        defaultSlug,
        extension,
        onSubmit: (result) => {
          resolved = true;
          resolve(result);
        }
      });
      modal.onClose = () => {
        if (!resolved) resolve(null);
      };
      modal.open();
    });
  }

  private async promptConflict(slug: string, existingFile: string) {
    return await new Promise<ConflictChoice>((resolve) => {
      const modal = new SlugConflictModal(this.app, {
        slug,
        existingFile,
        onResolve: resolve
      });
      modal.open();
    });
  }

  private async fetchManifest(): Promise<ManifestPayload | null> {
    try {
      const payload = await this.webdav.getJson<ManifestPayload>([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
      return { items: this.normalizeManifestItems(payload.items) };
    } catch (error) {
      if (error instanceof WebDavError && error.status === 404) {
        new Notice("未找到 manifest.json，将在首次推送时自动创建。", 4000);
        return { items: [] };
      }
      new Notice(this.formatWebDavError(error, "读取 manifest"), 5000);
      return null;
    }
  }

  private normalizeManifestItems(items: ManifestItem[] | undefined): ManifestItem[] {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => ({
        ...item,
        slug: String(item.slug ?? "").trim(),
        file: String(item.file ?? "").trim()
      }))
      .filter((item) => item.slug && item.file)
      .sort((a, b) => a.slug.localeCompare(b.slug));
  }

  private async applySlugToManifest(
    items: ManifestItem[],
    slugResult: SlugModalResult,
    extension: "md" | "mdx"
  ) {
    let currentResult = slugResult;
    const workingItems = [...items];

    while (true) {
      const existing = workingItems.find((item) => item.slug === currentResult.slug);
      if (!existing) break;

      const choice = await this.promptConflict(currentResult.slug, existing.file);
      if (choice === "cancel") return null;
      if (choice === "change") {
        const next = await this.promptSlug(currentResult.slug, extension);
        if (!next) return null;
        currentResult = next;
        continue;
      }
      if (choice === "overwrite") {
        existing.file = currentResult.fileName;
        break;
      }
    }

    const hasSlug = workingItems.some((item) => item.slug === currentResult.slug);
    if (!hasSlug) {
      workingItems.push({ slug: currentResult.slug, file: currentResult.fileName });
    }

    return { items: this.normalizeManifestItems(workingItems), slugResult: currentResult };
  }

  private async updateVisibility(file: TFile, visibility: "public" | "private") {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.visibility = visibility;
    });
  }

  private async updateSlug(file: TFile, slug: string) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.slug = slug;
    });
  }

  private async addFrontmatterFieldsToCurrentFile() {
    const file = this.app.workspace.getActiveFile();
    if (!file || !this.isMarkdownFile(file)) {
      new Notice("请先打开一个 Markdown 文件。", 3000);
      return;
    }

    await this.saveFileIfOpen(file);
    const today = formatDate(new Date());

    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      if (frontmatter.title == null) frontmatter.title = "";
      if (!isValidDate(String(frontmatter.date ?? ""))) frontmatter.date = today;
      if (frontmatter.place == null) frontmatter.place = "";
      if (frontmatter.accent == null) frontmatter.accent = "";
      if (frontmatter.cover == null) frontmatter.cover = "";
      if (frontmatter.excerpt == null) frontmatter.excerpt = "";
      if (frontmatter.tags == null) frontmatter.tags = [];
      if (!String(frontmatter.visibility ?? "").trim()) frontmatter.visibility = "public";
    });

    await this.saveFileIfOpen(file);
    new Notice("已补全 frontmatter 字段。", 3000);
    this.publishView?.refreshFileStatus();
  }

  private resolveNewFileName(raw: string, date: string) {
    const trimmed = raw.trim();
    const fallbackBase = `${date}-${slugify("milestone")}`;
    const base = trimmed || fallbackBase;
    if (/[\\/]/.test(base)) {
      new Notice("文件名不能包含斜杠。", 3000);
      return null;
    }
    if (base.endsWith(`.${this.settings.defaultExtension}`) || base.includes(".")) {
      return base;
    }
    return `${base}.${this.settings.defaultExtension}`;
  }

  private async ensureRemoteContentDir() {
    try {
      const parts = this.settings.webdavContentDir
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean);
      const path: string[] = [];
      for (const part of parts) {
        path.push(part);
        await this.webdav.ensureDirectory(path);
      }
      return true;
    } catch (error) {
      new Notice(this.formatWebDavError(error, "创建远端目录"), 5000);
      return false;
    }
  }

  private formatWebDavError(error: unknown, action: string) {
    if (error instanceof WebDavError) {
      if (error.status === 401 || error.status === 403) {
        return `${action}失败：鉴权失败，请检查用户名/密码。`;
      }
      if (error.status === 404) {
        return `${action}失败：远端资源不存在。`;
      }
      if (error.status) {
        return `${action}失败：HTTP ${error.status}`;
      }
      return `${action}失败：${error.message}`;
    }
    if (error instanceof Error) {
      return `${action}失败：${error.message}`;
    }
    return `${action}失败：未知错误。`;
  }
}
