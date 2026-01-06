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
  buildFrontmatterTemplate,
  getFrontmatterEndLine,
  parseFrontmatterBlock,
  slugify,
  suggestSlugFromFilename
} from "./frontmatter";
import { validateFrontmatter } from "./validation";
import {
  ConfirmModal,
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
      name: "推送当前文档到 WebDAV",
      callback: () => this.pushCurrentFile()
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFile && this.isMarkdownFile(file)) {
          menu.addItem((item) => {
            item
              .setTitle("推送到 WebDAV")
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
    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      new Notice("无法打开侧边栏，请检查工作区布局。", 3000);
      return;
    }
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
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
      defaultCover: this.settings.defaultCoverUrl || "https://your-image-host/cover.svg",
      defaultExtension: this.settings.defaultExtension,
      onSubmit: async (data) => this.createNewArticle(data)
    });
    modal.open();
  }

  async createNewArticle(data: NewArticleFormData) {
    const folder = this.settings.localContentFolder.trim() || "milestones";
    const slug = slugify(data.title);
    const fileName = `${data.date}-${slug}.${this.settings.defaultExtension}`;
    const filePath = normalizePath(`${folder}/${fileName}`);

    if (this.app.vault.getAbstractFileByPath(filePath)) {
      new Notice("文件已存在，请修改标题或日期。", 4000);
      return false;
    }

    await this.ensureFolder(folder);

    const content = buildFrontmatterTemplate({
      title: data.title,
      date: data.date,
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
      new Notice("请先打开一个 Markdown/MDX 文件。", 3000);
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

    progress("正在拉取 manifest...");
    const manifest = await this.fetchManifestWithPrompt();
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

    progress("推送完成");
    this.publishView?.loadManifestPreview();
  }

  async testConnection() {
    try {
      await this.webdav.getText([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
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
    return ext === "md" || ext === "mdx";
  }

  private suggestSlug(file: TFile, frontmatter: Record<string, unknown>) {
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

  private async promptConfirm(title: string, message: string) {
    return await new Promise<"confirm" | "cancel">((resolve) => {
      const modal = new ConfirmModal(this.app, {
        title,
        message,
        confirmText: "是",
        cancelText: "否",
        onResolve: resolve
      });
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

  private async fetchManifestWithPrompt(): Promise<ManifestPayload | null> {
    try {
      const payload = await this.webdav.getJson<ManifestPayload>([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
      return { items: this.normalizeManifestItems(payload.items) };
    } catch (error) {
      if (error instanceof WebDavError && error.status === 404) {
        const choice = await this.promptConfirm(
          "未找到 manifest",
          "远端未找到 manifest.json，是否创建新的 manifest？"
        );
        if (choice === "confirm") {
          return { items: [] };
        }
        return null;
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

  private formatWebDavError(error: unknown, action: string) {
    if (error instanceof WebDavError) {
      if (error.status === 401 || error.status === 403) {
        return `${action}失败：鉴权失败，请检查用户名/密码。`;
      }
      if (error.status === 404) {
        return `${action}失败：未找到 manifest.json。`;
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
