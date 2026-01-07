import {
  MarkdownView,
  Notice,
  Plugin,
  TFile,
  normalizePath
} from "obsidian";
import { LoveLinkerSettingTab } from "./settings";
import {
  DEFAULT_SETTINGS,
  type AccentOption,
  type FrontmatterEditState,
  type LoveLinkerSettings
} from "./types";
import {
  formatDate,
  buildFrontmatterTemplate,
  getFrontmatterEndLine,
  isValidDate,
  parseTagsInput,
  parseFrontmatterBlock,
  slugify,
  suggestSlugFromFilename
} from "./frontmatter";
import { normalizeFrontmatter, validateFrontmatter } from "./validation";
import {
  AccentSelectModal,
  FrontmatterRepairModal,
  NewArticleModal,
  SlugConflictModal,
  SlugInputModal,
  SlugPromptModal,
  UnpublishConfirmModal,
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
      this.ensurePublishViewSingleInstance();
    });

    this.addCommand({
      id: "love-linker-open-panel",
      name: "打开发布面板",
      callback: () => this.ensurePublishViewSingleInstance()
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
      name: "补全/修复当前文档属性",
      callback: () => this.repairCurrentFrontmatterWithPrompt()
    });

    this.addCommand({
      id: "love-linker-update-accent",
      name: "修改当前文档 accent",
      callback: () => this.openAccentModal()
    });

    this.addCommand({
      id: "love-linker-unpublish-current",
      name: "下线当前文章（仅移除 manifest）",
      callback: () => this.unpublishCurrentFile({ deleteRemote: false })
    });

    this.addCommand({
      id: "love-linker-delete-current",
      name: "彻底删除当前文章（移除 manifest + 删除远端文件）",
      callback: () => this.unpublishCurrentFile({ deleteRemote: true })
    });

    this.app.workspace.onLayoutReady(() => {
      if (this.settings.autoOpenPanel) {
        this.ensurePublishViewSingleInstance({ reveal: false });
      }
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
        this.publishView?.scheduleRefresh();
      })
    );

    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        this.publishView?.scheduleRefresh();
      })
    );

    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        const active = this.app.workspace.getActiveFile();
        if (active && file.path === active.path) {
          this.publishView?.scheduleRefresh();
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
    if (!this.settings.webdavTrashDir.trim()) {
      this.settings.webdavTrashDir = "_trash";
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

  hasWebdavConfig() {
    return Boolean(
      this.settings.webdavBaseUrl.trim() &&
        this.settings.webdavUsername.trim() &&
        this.settings.webdavPassword.trim()
    );
  }

  async ensurePublishViewSingleInstance(options?: { reveal?: boolean }) {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    let leaf = leaves[0];

    if (leaves.length > 1) {
      leaves.slice(1).forEach((extra) => extra.detach());
    }

    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getRightLeaf(true);
    }

    if (!leaf) {
      new Notice("无法打开侧边栏，请检查工作区布局。", 3000);
      return;
    }

    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    if (options?.reveal !== false) {
      this.app.workspace.revealLeaf(leaf);
    }
    this.publishView = leaf.view as PublishPanelView;
    this.publishView?.refresh();
  }

  openSettings() {
    const setting = this.app as unknown as {
      setting?: { open?: () => void; openTabById?: (id: string) => void };
    };
    setting.setting?.open?.();
    setting.setting?.openTabById?.("love-linker-publisher");
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
    const report = (message: string) => {
      progress(message);
      this.publishView?.setStatusMessage(message);
    };
    const file = options?.file ?? this.app.workspace.getActiveFile();

    this.publishView?.resetPushProgress();
    this.publishView?.setStepStatus("delete", "skipped", "推送不涉及删除");

    if (!file || !this.isMarkdownFile(file)) {
      new Notice("请先打开一个 Markdown 文件。", 3000);
      this.publishView?.setStepStatus("validate", "error", "未打开 Markdown 文件");
      return;
    }

    this.publishView?.setStepStatus("validate", "running", "正在解析 frontmatter...");
    report("正在解析 frontmatter...");

    await this.saveFileIfOpen(file);

    const raw = await this.app.vault.read(file);
    const parsed = await this.readFrontmatter(file, raw);
    if (!parsed.hasFrontmatter) {
      new Notice("未检测到 frontmatter，请先创建 YAML 块。", 4000);
      this.publishView?.setStepStatus("validate", "error", "未检测到 frontmatter");
      report("frontmatter 缺失");
      return;
    }
    if (parsed.error || !parsed.data) {
      new Notice("frontmatter 解析失败，请检查 YAML 格式。", 4000);
      this.publishView?.setStepStatus("validate", "error", "YAML 解析失败");
      report("frontmatter 解析失败");
      return;
    }

    const validation = validateFrontmatter(parsed.data, this.getAccentOptions());
    if (!validation.ok) {
      new Notice(`校验失败：${validation.errors.join("；")}`, 5000);
      this.publishView?.setStepStatus("validate", "error", validation.errors.join("；"));
      report("校验失败");
      return;
    }
    this.publishView?.setStepStatus("validate", "success");

    if (validation.warnings.length > 0) {
      new Notice(`提示：${validation.warnings.join("；")}`, 4000);
    }
    if (validation.isPrivate) {
      new Notice("该文章为 private，网站可能不会生成或出现在首页。", 5000);
    }

    const extension = "md";
    let slugResult = await this.promptSlug(
      this.suggestSlug(file, parsed.data),
      extension
    );
    if (!slugResult) return;

    if (slugResult.forcePrivate) {
      report("正在更新 visibility 为 private...");
      await this.updateVisibility(file, "private");
      await this.saveFileIfOpen(file);
    }

    this.publishView?.setStepStatus("manifest", "running", "正在确认远端目录...");
    report("正在确认远端目录...");
    const folderReady = await this.ensureRemoteContentDir();
    if (!folderReady) {
      this.publishView?.setStepStatus("manifest", "error", "远端目录创建失败");
      report("远端目录创建失败");
      return;
    }

    this.publishView?.setStepStatus("manifest", "running", "正在拉取 manifest...");
    report("正在拉取 manifest...");
    const manifest = await this.fetchManifest();
    if (!manifest) {
      this.publishView?.setStepStatus("manifest", "error", "读取 manifest 失败");
      report("读取 manifest 失败");
      return;
    }
    this.publishView?.setStepStatus("manifest", "success");

    const resolved = await this.applySlugToManifest(manifest.items, slugResult, extension);
    if (!resolved) return;

    slugResult = resolved.slugResult;
    const manifestText = JSON.stringify({ items: resolved.items }, null, 2) + "\n";

    let fileUploaded = false;

    if (!slugResult.manifestOnly) {
      this.publishView?.setStepStatus("upload", "running", "正在上传文档...");
      report("正在上传文档...");
      try {
        const latest = await this.app.vault.read(file);
        await this.webdav.putText(
          [this.settings.webdavContentDir, slugResult.fileName],
          latest,
          "text/markdown; charset=utf-8"
        );
        fileUploaded = true;
        this.publishView?.setStepStatus("upload", "success");
        new Notice("文档已上传。", 3000);
      } catch (error) {
        new Notice(this.formatWebDavError(error, "上传文档"), 5000);
        this.publishView?.setStepStatus("upload", "error", this.formatWebDavError(error, "上传文档"));
        report("上传文档失败");
        return;
      }
    } else {
      this.publishView?.setStepStatus("upload", "skipped", "仅更新 manifest");
      report("已跳过文档上传（仅更新 manifest）");
    }

    this.publishView?.setStepStatus("update", "running", "正在更新 manifest...");
    report("正在更新 manifest...");
    try {
      await this.webdav.putText(
        [this.settings.webdavContentDir, this.settings.webdavManifestFile],
        manifestText,
        "application/json; charset=utf-8"
      );
      this.publishView?.setStepStatus("update", "success");
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
      this.publishView?.setStepStatus("update", "error", this.formatWebDavError(error, "更新 manifest"));
      report("更新 manifest 失败");
      return;
    }

    report("正在写入 slug...");
    await this.updateSlug(file, slugResult.slug);
    await this.saveFileIfOpen(file);

    report("推送/更新完成");
    this.publishView?.loadManifestPreview();
  }

  async testConnection(options?: { silent?: boolean }) {
    if (!this.hasWebdavConfig()) {
      const message = "未配置 WebDAV，请先在设置中填写。";
      if (!options?.silent) {
        new Notice(message, 4000);
      }
      return { ok: false, status: "unconfigured", message };
    }

    try {
      await this.webdav.getText([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
      const message = "连接成功。";
      if (!options?.silent) {
        new Notice(message, 3000);
      }
      return { ok: true, status: "ok", message };
    } catch (error) {
      if (error instanceof WebDavError && error.status === 404) {
        const message = "远端 manifest.json 不存在，可在首次推送时自动创建。";
        if (!options?.silent) {
          new Notice(message, 4000);
        }
        return { ok: false, status: "manifest_missing", message, statusCode: 404 };
      }
      const message = this.formatWebDavError(error, "测试连接");
      if (!options?.silent) {
        new Notice(message, 5000);
      }
      return {
        ok: false,
        status: error instanceof WebDavError && (error.status === 401 || error.status === 403)
          ? "auth_failed"
          : "error",
        message,
        statusCode: error instanceof WebDavError ? error.status : undefined
      };
    }
  }

  async fetchManifestPreview(options?: { silent?: boolean }) {
    try {
      const payload = await this.webdav.getJson<ManifestPayload>([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
      const items = this.normalizeManifestItems(payload.items);
      return { items, limit: this.settings.manifestPreviewLimit, status: "ok" as const };
    } catch (error) {
      if (error instanceof WebDavError && error.status === 404) {
        const message = "远端 manifest.json 不存在，可在首次推送时自动创建。";
        if (!options?.silent) {
          new Notice(message, 4000);
        }
        return { items: [], limit: this.settings.manifestPreviewLimit, status: "manifest_missing" as const };
      }
      if (!options?.silent) {
        new Notice(this.formatWebDavError(error, "读取 manifest"), 5000);
      }
      return { items: [], limit: this.settings.manifestPreviewLimit, status: "error" as const };
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

  async getActiveFrontmatter() {
    const file = this.app.workspace.getActiveFile();
    if (!file || !this.isMarkdownFile(file)) {
      return { file: null, data: null as Record<string, unknown> | null, hasFrontmatter: false };
    }

    const parsed = await this.readFrontmatter(file);
    return {
      file,
      data: parsed.data ?? {},
      hasFrontmatter: parsed.hasFrontmatter
    };
  }

  async getActiveSlugCandidate() {
    const active = this.app.workspace.getActiveFile();
    if (!active || !this.isMarkdownFile(active)) return "";
    const parsed = await this.readFrontmatter(active);
    if (!parsed.data) return "";
    return this.suggestSlug(active, parsed.data);
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

  private suggestUnpublishSlug(file: TFile, frontmatter: Record<string, unknown>) {
    const frontmatterSlug = frontmatter.slug ? String(frontmatter.slug).trim() : "";
    if (frontmatterSlug) return frontmatterSlug;
    const base = suggestSlugFromFilename(file.basename);
    if (base && base !== file.basename) return slugify(base);
    const title = frontmatter.title ? String(frontmatter.title) : "";
    if (title) return slugify(title);
    return "";
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

  private async promptSlugInput(defaultSlug: string) {
    return await new Promise<string | null>((resolve) => {
      let resolved = false;
      const modal = new SlugPromptModal(this.app, {
        title: "输入 slug",
        description: "未检测到当前文档 slug，请输入要下线/删除的 slug。",
        defaultValue: defaultSlug,
        onSubmit: (value) => {
          resolved = true;
          resolve(value);
        }
      });
      modal.onClose = () => {
        if (!resolved) resolve(null);
      };
      modal.open();
    });
  }

  private async promptUnpublishConfirm(options: {
    mode: "unpublish" | "delete";
    slug: string;
    file: string;
    remotePath: string;
    mismatchNote?: string;
  }) {
    return await new Promise<"confirm" | "cancel">((resolve) => {
      const modal = new UnpublishConfirmModal(this.app, {
        ...options,
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

  private async fetchManifestForUnpublish(): Promise<ManifestPayload | null> {
    try {
      const payload = await this.webdav.getJson<ManifestPayload>([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
      return { items: this.normalizeManifestItems(payload.items) };
    } catch (error) {
      if (error instanceof WebDavError && error.status === 404) {
        new Notice("未找到 manifest.json，无法下线/删除。", 4000);
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

  private async updateSlug(file: TFile, slug: string) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.slug = slug;
    });
  }

  async repairCurrentFrontmatterWithPrompt() {
    const file = this.app.workspace.getActiveFile();
    if (!file || !this.isMarkdownFile(file)) {
      new Notice("请先打开一个 Markdown 文件。", 3000);
      return;
    }

    await this.saveFileIfOpen(file);

    const raw = await this.app.vault.read(file);
    const parsed = await this.readFrontmatter(file, raw);
    const frontmatter = parsed.data ?? {};
    const normalized = normalizeFrontmatter(frontmatter);
    const changes = [] as Array<{
      key: string;
      label: string;
      value: string;
      note?: string;
      editable?: boolean;
    }>;
    const values: Record<string, string> = {};
    const today = formatDate(new Date());

    if (!normalized.title.trim()) {
      const title = this.humanizeTitleFromFilename(file.basename);
      values.title = title;
      changes.push({ key: "title", label: "title", value: title });
    }

    const dateFromFilename = this.extractDateFromFilename(file.basename);
    if (!isValidDate(normalized.date)) {
      const date = dateFromFilename ?? today;
      values.date = date;
      changes.push({
        key: "date",
        label: "date",
        value: date,
        note: normalized.date ? `原值：${normalized.date}` : "未检测到日期"
      });
    }

    if (!normalized.excerpt.trim()) {
      const excerpt = this.extractExcerptFromContent(raw);
      values.excerpt = excerpt;
      changes.push({
        key: "excerpt",
        label: "excerpt",
        value: excerpt,
        note: excerpt ? "来自正文首段（可编辑）" : "未检测到正文，将留空",
        editable: true
      });
    }

    if (Array.isArray(frontmatter.tags)) {
      // keep
    } else if (typeof frontmatter.tags === "string") {
      const tags = parseTagsInput(frontmatter.tags);
      values.tags = tags.join(", ");
      changes.push({
        key: "tags",
        label: "tags",
        value: tags.join(", "),
        note: "已从逗号分隔文本转换为数组"
      });
    } else if (frontmatter.tags == null) {
      values.tags = "";
      changes.push({ key: "tags", label: "tags", value: "", note: "未设置，将写入空数组" });
    }

    const visibilityValue = String(frontmatter.visibility ?? "").trim();
    if (!visibilityValue || (visibilityValue !== "public" && visibilityValue !== "private")) {
      values.visibility = "public";
      changes.push({
        key: "visibility",
        label: "visibility",
        value: "public",
        note: visibilityValue ? `原值：${visibilityValue}` : "未设置"
      });
    }

    const accentValue = String(frontmatter.accent ?? "").trim();
    if (!accentValue) {
      const accent = this.settings.defaultAccent || this.getAccentOptions()[0]?.value || "";
      values.accent = accent;
      changes.push({
        key: "accent",
        label: "accent",
        value: accent || "（空）",
        note: accent ? "使用默认 accent" : "未配置默认值"
      });
    }

    if (changes.length === 0) {
      new Notice("未发现需要修复的字段。", 3000);
      return;
    }

    const modal = new FrontmatterRepairModal(this.app, {
      changes,
      onResolve: async (choice, updatedValues) => {
        if (choice !== "confirm") return;
        await this.app.fileManager.processFrontMatter(file, (fm) => {
          if (values.title !== undefined) fm.title = updatedValues.title ?? values.title;
          if (values.date !== undefined) fm.date = updatedValues.date ?? values.date;
          if (values.excerpt !== undefined) fm.excerpt = updatedValues.excerpt ?? values.excerpt;
          if (values.visibility !== undefined) fm.visibility = values.visibility;
          if (values.accent !== undefined) fm.accent = values.accent;
          if (values.tags !== undefined) fm.tags = parseTagsInput(updatedValues.tags ?? values.tags);
        });
        await this.saveFileIfOpen(file);
        new Notice("已补全/修复 frontmatter。", 3000);
        this.publishView?.refresh();
      }
    });
    modal.open();
  }

  async openAccentModal(file?: TFile) {
    const target = file ?? this.app.workspace.getActiveFile();
    if (!target || !this.isMarkdownFile(target)) {
      new Notice("请先打开一个 Markdown 文件。", 3000);
      return;
    }

    const parsed = await this.readFrontmatter(target);
    const currentAccent = parsed.data?.accent ? String(parsed.data.accent).trim() : "";

    const modal = new AccentSelectModal(this.app, {
      options: this.getAccentOptions(),
      current: currentAccent,
      onSubmit: async (value) => {
        await this.app.fileManager.processFrontMatter(target, (frontmatter) => {
          frontmatter.accent = value;
        });
        await this.saveFileIfOpen(target);
        new Notice("accent 已更新。", 3000);
        this.publishView?.refresh();
      }
    });
    modal.open();
  }

  async updateFrontmatterFromForm(file: TFile, data: FrontmatterEditState) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.title = data.title.trim();
      frontmatter.date = data.date.trim();
      frontmatter.place = data.place.trim();
      frontmatter.cover = data.cover.trim();
      frontmatter.excerpt = data.excerpt.trim();
      frontmatter.visibility = data.visibility;
      frontmatter.accent = data.accent.trim();
      frontmatter.tags = parseTagsInput(data.tags);
    });
    await this.saveFileIfOpen(file);
  }

  async unpublishCurrentFile(options: { deleteRemote: boolean }) {
    const file = this.app.workspace.getActiveFile();
    if (!file || !this.isMarkdownFile(file)) {
      new Notice("请先打开一个 Markdown 文件。", 3000);
      return;
    }

    await this.saveFileIfOpen(file);
    const parsed = await this.readFrontmatter(file);
    const slug = this.suggestUnpublishSlug(file, parsed.data ?? {});
    const resolvedSlug = slug || (await this.promptSlugInput(""));
    if (!resolvedSlug) return;

    await this.unpublishBySlug(resolvedSlug, {
      deleteRemote: options.deleteRemote,
      sourceFile: file
    });
  }

  async unpublishBySlug(
    slug: string,
    options: { deleteRemote: boolean; fileHint?: string; sourceFile?: TFile }
  ) {
    if (!this.hasWebdavConfig()) {
      new Notice("未配置 WebDAV，请先在设置中填写。", 4000);
      return;
    }

    this.publishView?.setActionBusy(true);
    this.publishView?.resetPushProgress();
    this.publishView?.setStepStatus("validate", "skipped", "下线操作");
    this.publishView?.setStepStatus("upload", "skipped", "无上传");
    if (!options.deleteRemote) {
      this.publishView?.setStepStatus("delete", "skipped", "仅下线");
    }

    try {
      this.publishView?.setStepStatus("manifest", "running", "拉取 manifest...");
      this.publishView?.setStatusMessage("正在拉取 manifest...");
      const manifest = await this.fetchManifestForUnpublish();
      if (!manifest) {
        this.publishView?.setStepStatus("manifest", "error", "读取 manifest 失败");
        return;
      }

      const target = manifest.items.find((item) => item.slug === slug);
      if (!target) {
        new Notice("远端 manifest 未包含该 slug，可能从未发布或已下线。", 4000);
        this.publishView?.setStepStatus("manifest", "success");
        this.publishView?.setStatusMessage("未找到 slug");
        return;
      }

      this.publishView?.setStepStatus("manifest", "success");

      const localFileName = options.sourceFile
        ? `${options.sourceFile.basename}.${options.sourceFile.extension}`
        : "";
      const mismatchNote =
        (options.fileHint && options.fileHint !== target.file) ||
        (localFileName && localFileName !== target.file)
          ? `远端文件名与本地不同，已按远端记录操作（${target.file}）。`
          : undefined;

      const confirm = await this.promptUnpublishConfirm({
        mode: options.deleteRemote ? "delete" : "unpublish",
        slug,
        file: target.file,
        remotePath: `${this.settings.webdavContentDir}/${target.file}`,
        mismatchNote
      });

      if (confirm !== "confirm") {
        this.publishView?.setStatusMessage("已取消操作");
        return;
      }

      const updatedItems = manifest.items.filter((item) => item.slug !== slug);
      const manifestText = JSON.stringify({ items: updatedItems }, null, 2) + "\n";

      this.publishView?.setStepStatus("update", "running", "更新 manifest...");
      this.publishView?.setStatusMessage("正在更新 manifest...");
      try {
        await this.webdav.putText(
          [this.settings.webdavContentDir, this.settings.webdavManifestFile],
          manifestText,
          "application/json; charset=utf-8"
        );
        this.publishView?.setStepStatus("update", "success");
      } catch (error) {
        new Notice(this.formatWebDavError(error, "更新 manifest"), 5000);
        this.publishView?.setStepStatus("update", "error", this.formatWebDavError(error, "更新 manifest"));
        return;
      }

      if (options.deleteRemote) {
        this.publishView?.setStepStatus("delete", "running", "删除/移动远端文件...");
        this.publishView?.setStatusMessage("正在删除/移动远端文件...");
        const deleteResult = await this.deleteOrMoveRemoteFile(target.file);
        if (deleteResult.ok) {
          this.publishView?.setStepStatus("delete", "success", deleteResult.message);
        } else {
          this.publishView?.setStepStatus("delete", "error", deleteResult.message);
          new Notice(deleteResult.message, 5000);
        }
        this.publishView?.setStatusMessage("下线/删除完成");
        new Notice("已完成下线（网站将在 ISR 周期内更新）。", 4000);
      } else {
        this.publishView?.setStatusMessage("下线完成");
        new Notice("已下线（网站将在 ISR 周期内更新）。", 4000);
      }

      this.publishView?.loadManifestPreview();
      this.publishView?.refreshFileStatus();
    } finally {
      this.publishView?.setActionBusy(false);
    }
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

  private humanizeTitleFromFilename(basename: string) {
    const stripped = basename.replace(/^\d{4}-\d{2}-\d{2}-/, "");
    const readable = stripped.replace(/[-_]+/g, " ").trim();
    return readable || stripped || "未命名";
  }

  private extractDateFromFilename(basename: string) {
    const match = basename.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match && isValidDate(match[1])) {
      return match[1];
    }
    return null;
  }

  private extractExcerptFromContent(raw: string) {
    const body = raw.replace(/^---\s*\n[\s\S]*?\n---\s*(\n|$)/, "");
    const paragraphs = body
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    if (paragraphs.length === 0) return "";
    const flattened = paragraphs[0].replace(/\n+/g, " ").trim();
    if (flattened.length <= 120) return flattened;
    return `${flattened.slice(0, 120).trim()}...`;
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

  private async ensureRemoteTrashDir() {
    const trashDir = this.settings.webdavTrashDir.trim() || "_trash";
    const parts = this.settings.webdavContentDir
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean);
    const path: string[] = [];
    for (const part of parts) {
      path.push(part);
      await this.webdav.ensureDirectory(path);
    }
    const trashPath = [...path, trashDir];
    await this.webdav.ensureDirectory(trashPath);
    return trashPath;
  }

  private async deleteOrMoveRemoteFile(fileName: string) {
    try {
      await this.webdav.deleteFile([this.settings.webdavContentDir, fileName]);
      return { ok: true, message: "已删除远端文件。" };
    } catch (error) {
      const status = error instanceof WebDavError ? error.status : undefined;
      if (status === 404) {
        return { ok: false, message: "远端文件不存在，已仅下线。" };
      }
      if (status === 403 || status === 405 || status === 501) {
        const moved = await this.moveRemoteFileToTrash(fileName);
        return moved;
      }
      return { ok: false, message: this.formatWebDavError(error, "删除远端文件") };
    }
  }

  private async moveRemoteFileToTrash(fileName: string) {
    try {
      const trashPath = await this.ensureRemoteTrashDir();
      const destination = [...trashPath, fileName];
      await this.webdav.move([this.settings.webdavContentDir, fileName], destination);
      return { ok: true, message: "已移动到回收站目录。" };
    } catch (error) {
      const status = error instanceof WebDavError ? error.status : undefined;
      if (status === 404) {
        return { ok: false, message: "远端文件不存在，已仅下线。" };
      }
      if (status === 403 || status === 405 || status === 501) {
        return { ok: false, message: "服务器不支持删除/移动，已仅下线。" };
      }
      return { ok: false, message: this.formatWebDavError(error, "移动远端文件") };
    }
  }

  private formatWebDavError(error: unknown, action: string) {
    if (error instanceof WebDavError) {
      if (error.status === 401 || error.status === 403) {
        return `${action}失败：鉴权失败（HTTP ${error.status}），请检查用户名/密码。`;
      }
      if (error.status === 408) {
        return `${action}失败：网络超时，请稍后重试。`;
      }
      if (error.status === 404) {
        return `${action}失败：远端资源不存在（HTTP 404）。`;
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
