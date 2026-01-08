import { ItemView, Notice, Setting, WorkspaceLeaf } from "obsidian";
import type LoveLinkerPublisherPlugin from "./main";
import type { FrontmatterEditState } from "./types";
import type { ManifestItem } from "./webdavTypes";
import { formatDate } from "./frontmatter";
import { normalizeFrontmatter } from "./validation";

export const VIEW_TYPE = "love-linker-publish-panel";

type RemoteStatus = {
  status: "unknown" | "unconfigured" | "connected" | "auth_failed" | "manifest_missing" | "error";
  message?: string;
};

type StepStatus = "idle" | "running" | "success" | "error" | "skipped";

type StepRef = {
  itemEl: HTMLDivElement;
  detailEl: HTMLDivElement;
};

const STEP_DEFS = [
  { id: "validate", label: "校验文档" },
  { id: "manifest", label: "拉取 manifest" },
  { id: "upload", label: "上传文档" },
  { id: "update", label: "更新 manifest" },
  { id: "delete", label: "删除/移动文件" }
];

export class PublishPanelView extends ItemView {
  private headerStatusEl?: HTMLDivElement;
  private fileInfoEl?: HTMLDivElement;
  private validationBadgeEl?: HTMLSpanElement;
  private validationDetailEl?: HTMLDivElement;
  private validationListEl?: HTMLUListElement;
  private pushButton?: HTMLButtonElement;
  private newButton?: HTMLButtonElement;
  private repairButton?: HTMLButtonElement;
  private accentButton?: HTMLButtonElement;
  private unpublishButton?: HTMLButtonElement;
  private deleteButton?: HTMLButtonElement;
  private formSaveButton?: HTMLButtonElement;
  private remoteStatusBadgeEl?: HTMLSpanElement;
  private remoteInfoEl?: HTMLDivElement;
  private manifestStatusEl?: HTMLDivElement;
  private manifestListEl?: HTMLUListElement;
  private manifestFilterEl?: HTMLInputElement;
  private manifestNoteEl?: HTMLDivElement;
  private statusMessageEl?: HTMLDivElement;
  private stepRefs: Record<string, StepRef> = {};
  private refreshTimer?: number;

  private manifestItems: ManifestItem[] = [];
  private remoteStatus: RemoteStatus = { status: "unknown" };
  private formState: FrontmatterEditState = {
    title: "",
    date: "",
    place: "",
    visibility: "public",
    accent: "",
    cover: "",
    tags: "",
    excerpt: ""
  };
  private formEls: Partial<Record<keyof FrontmatterEditState, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>> = {};
  private formDirty = false;
  private lastFormFilePath = "";
  private currentSlug = "";
  private hasActiveFile = false;
  private actionBusy = false;

  constructor(leaf: WorkspaceLeaf, private plugin: LoveLinkerPublisherPlugin) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "发布面板";
  }

  getIcon() {
    return "paper-plane";
  }

  onOpen() {
    this.render();
  }

  onClose() {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
    this.contentEl.empty();
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("llp-panel");

    const header = contentEl.createDiv({ cls: "llp-header" });
    header.createEl("h2", { text: "发布面板" });

    const headerActions = header.createDiv({ cls: "llp-header-actions" });
    headerActions.createEl("button", { text: "刷新" }).addEventListener("click", () => {
      void this.refresh();
      void this.loadManifestPreview();
    });
    headerActions.createEl("button", { text: "设置" }).addEventListener("click", () => {
      this.plugin.openSettings();
    });

    this.headerStatusEl = contentEl.createDiv({ cls: "llp-header-sub" });

    const currentCard = contentEl.createDiv({ cls: "llp-card" });
    currentCard.createEl("h3", { text: "当前文章" });

    const fileRow = currentCard.createDiv({ cls: "llp-row" });
    this.fileInfoEl = fileRow.createDiv({ cls: "llp-file" });
    this.validationBadgeEl = fileRow.createSpan({ cls: "llp-badge" });

    this.validationDetailEl = currentCard.createDiv({ cls: "llp-muted" });
    this.validationListEl = currentCard.createEl("ul", { cls: "llp-list" });

    const actionRow = currentCard.createDiv({ cls: "llp-actions" });
    this.pushButton = actionRow.createEl("button", { text: "推送/更新", cls: "llp-button llp-button--primary" });
    this.newButton = actionRow.createEl("button", { text: "新建文章", cls: "llp-button" });
    this.repairButton = actionRow.createEl("button", { text: "补全/修复属性", cls: "llp-button llp-button--ghost" });
    this.accentButton = actionRow.createEl("button", { text: "修改 accent", cls: "llp-button llp-button--ghost" });
    this.unpublishButton = actionRow.createEl("button", { text: "下线", cls: "llp-button llp-button--warn" });
    this.deleteButton = actionRow.createEl("button", { text: "彻底删除", cls: "llp-button llp-button--danger" });

    this.pushButton.addEventListener("click", () => {
      void this.plugin.pushCurrentFile({ progress: (message) => this.setStatusMessage(message) });
    });
    this.newButton.addEventListener("click", () => this.plugin.openNewArticleModal());
    this.repairButton.addEventListener("click", () => {
      void this.plugin.repairCurrentFrontmatterWithPrompt();
    });
    this.accentButton.addEventListener("click", () => {
      void this.plugin.openAccentModal();
    });
    this.unpublishButton.addEventListener("click", () => {
      void this.plugin.unpublishCurrentFile({ deleteRemote: false });
    });
    this.deleteButton.addEventListener("click", () => {
      void this.plugin.unpublishCurrentFile({ deleteRemote: true });
    });

    const remoteCard = contentEl.createDiv({ cls: "llp-card" });
    remoteCard.createEl("h3", { text: "远端连接" });

    const remoteRow = remoteCard.createDiv({ cls: "llp-row" });
    this.remoteStatusBadgeEl = remoteRow.createSpan({ cls: "llp-badge" });
    this.remoteInfoEl = remoteCard.createDiv({ cls: "llp-muted" });

    const remoteActions = remoteCard.createDiv({ cls: "llp-actions" });
    remoteActions.createEl("button", { text: "测试连接", cls: "llp-button" }).addEventListener("click", () => {
      void this.handleTestConnection();
    });
    remoteActions.createEl("button", { text: "读取清单", cls: "llp-button" }).addEventListener("click", () => {
      void this.loadManifestPreview();
    });

    this.manifestStatusEl = remoteCard.createDiv({ cls: "llp-muted" });

    const filterRow = remoteCard.createDiv({ cls: "llp-row" });
    this.manifestFilterEl = filterRow.createEl("input", {
      type: "text",
      cls: "llp-input",
      placeholder: "搜索标识..."
    });
    this.manifestFilterEl.addEventListener("input", () => this.renderManifestList());

    this.manifestListEl = remoteCard.createEl("ul", { cls: "llp-manifest-list" });
    this.manifestNoteEl = remoteCard.createDiv({ cls: "llp-muted" });

    const progressCard = contentEl.createDiv({ cls: "llp-card" });
    progressCard.createEl("h3", { text: "推送进度" });
    this.statusMessageEl = progressCard.createDiv({ cls: "llp-muted" });

    const stepper = progressCard.createDiv({ cls: "llp-stepper" });
    STEP_DEFS.forEach((step) => {
      const item = stepper.createDiv({ cls: "llp-step" });
      const headerRow = item.createDiv({ cls: "llp-step-header" });
      headerRow.createSpan({ cls: "llp-step-dot" });
      headerRow.createDiv({ text: step.label, cls: "llp-step-title" });
      const detail = item.createDiv({ cls: "llp-step-detail" });
      this.stepRefs[step.id] = { itemEl: item, detailEl: detail };
    });

    const formCard = contentEl.createDiv({ cls: "llp-card" });
    formCard.createEl("h3", { text: "文章属性快捷编辑" });

    const form = formCard.createDiv({ cls: "llp-form" });

    new Setting(form)
      .setName("标题")
      .setDesc("页面标题")
      .addText((text) => {
        this.formEls.title = text.inputEl;
        text.onChange((value) => this.updateFormState("title", value));
      });

    new Setting(form)
      .setName("日期")
      .setDesc("格式 2024-01-01")
      .addText((text) => {
        this.formEls.date = text.inputEl;
        text.inputEl.type = "date";
        text.onChange((value) => this.updateFormState("date", value));
      });

    new Setting(form)
      .setName("地点")
      .setDesc("可留空")
      .addText((text) => {
        this.formEls.place = text.inputEl;
        text.onChange((value) => this.updateFormState("place", value));
      });

    new Setting(form)
      .setName("可见性")
      .setDesc("公开将出现在首页")
      .addDropdown((dropdown) => {
        this.formEls.visibility = dropdown.selectEl;
        dropdown.addOption("public", "公开");
        dropdown.addOption("private", "私密");
        dropdown.onChange((value: "public" | "private") => {
          this.updateFormState("visibility", value);
        });
      });

    new Setting(form)
      .setName("主色")
      .setDesc("主色，来自调色板")
      .addDropdown((dropdown) => {
        this.formEls.accent = dropdown.selectEl;
        this.fillAccentOptions(dropdown.selectEl);
        dropdown.onChange((value) => this.updateFormState("accent", value));
      });

    new Setting(form)
      .setName("封面链接")
      .setDesc("外链图床地址")
      .addText((text) => {
        this.formEls.cover = text.inputEl;
        text.setPlaceholder("示例链接");
        text.onChange((value) => this.updateFormState("cover", value));
      });

    new Setting(form)
      .setName("标签")
      .setDesc("逗号分隔")
      .addText((text) => {
        this.formEls.tags = text.inputEl;
        text.setPlaceholder("旅途, 潮声");
        text.onChange((value) => this.updateFormState("tags", value));
      });

    new Setting(form)
      .setName("摘要")
      .setDesc("首页卡片文案")
      .addTextArea((textarea) => {
        this.formEls.excerpt = textarea.inputEl;
        textarea.inputEl.rows = 3;
        textarea.onChange((value) => this.updateFormState("excerpt", value));
      });

    const formActions = formCard.createDiv({ cls: "llp-actions" });
    this.formSaveButton = formActions.createEl("button", {
      text: "保存到 frontmatter",
      cls: "llp-button llp-button--primary"
    });
    this.formSaveButton.addEventListener("click", () => {
      void this.handleFormSave();
    });

    this.resetPushProgress();
    void this.refresh();
  }

  scheduleRefresh() {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = window.setTimeout(() => {
      void this.refresh();
    }, 250);
  }

  async refresh() {
    await this.refreshFileStatus();
    await this.refreshPropertyForm();
    this.refreshRemoteInfo();
  }

  async refreshFileStatus() {
    if (!this.fileInfoEl || !this.validationBadgeEl || !this.validationDetailEl || !this.validationListEl) {
      return;
    }

    const status = await this.plugin.getActiveFileStatus();
    const vaultName = this.app.vault.getName ? this.app.vault.getName() : "";
    const filePath = status.file?.path ?? "";

    if (this.headerStatusEl) {
      const label = filePath ? `Vault: ${vaultName} · 文件: ${filePath}` : `Vault: ${vaultName}`;
      this.headerStatusEl.setText(label);
    }

    this.validationBadgeEl.className = "llp-badge";
    this.validationListEl.empty();

    if (!status.file) {
      this.hasActiveFile = false;
      this.fileInfoEl.setText("未打开 Markdown 文件");
      this.validationBadgeEl.addClass("llp-badge--muted");
      this.validationBadgeEl.setText("未就绪");
      this.validationDetailEl.setText("打开文件后可检查 frontmatter。也可点击补全/修复属性快速生成。 ");
      this.toggleActionAvailability(false);
      this.currentSlug = "";
      this.updateManifestNote();
      return;
    }

    this.hasActiveFile = true;
    this.fileInfoEl.setText(`${status.file.path}`);
    this.toggleActionAvailability(true);
    this.currentSlug = await this.plugin.getActiveSlugCandidate();
    const privateNote = status.validation.isPrivate ? "当前为 private。 " : "";

    if (!status.hasFrontmatter) {
      this.validationBadgeEl.addClass("llp-badge--error");
      this.validationBadgeEl.setText("缺少 frontmatter");
      this.validationDetailEl.setText("请先创建 YAML 块，或使用补全/修复属性按钮。 ");
      this.addListItems(["未检测到 frontmatter。"]); 
      this.updateManifestNote();
      return;
    }

    if (status.validation.errors.length > 0) {
      this.validationBadgeEl.addClass("llp-badge--error");
      this.validationBadgeEl.setText("校验失败");
      this.validationDetailEl.setText("请修复以下问题后再推送。 ");
      this.addListItems(status.validation.errors);
      this.updateManifestNote();
      return;
    }

    if (status.validation.warnings.length > 0) {
      this.validationBadgeEl.addClass("llp-badge--warn");
      this.validationBadgeEl.setText("有提示");
      this.validationDetailEl.setText(`${privateNote}可以继续推送，但建议查看提示。 `);
      this.addListItems(status.validation.warnings);
      this.updateManifestNote();
      return;
    }

    this.validationBadgeEl.addClass("llp-badge--success");
    this.validationBadgeEl.setText("校验通过");
    this.validationDetailEl.setText(`${privateNote}文档已就绪，可直接推送/更新。 `);
    this.updateManifestNote();
  }

  refreshRemoteInfo() {
    if (!this.remoteInfoEl || !this.remoteStatusBadgeEl) return;
    const info = this.plugin.getRemoteInfo();

    if (!info.baseUrl || !this.plugin.hasWebdavConfig()) {
      this.setRemoteStatus({ status: "unconfigured", message: "未配置远端连接" });
      this.remoteInfoEl.setText("请先在设置中填写远端地址、用户名和密码。");
      if (this.manifestStatusEl) {
        this.manifestStatusEl.setText("未配置远端连接，无法读取清单。");
      }
      this.togglePushButton(false);
      return;
    }

    this.remoteInfoEl.setText(`远端地址: ${info.baseUrl} · 目录: ${info.contentDir}`);
    this.togglePushButton(true);

    if (this.remoteStatus.status === "unknown" || this.remoteStatus.status === "unconfigured") {
      this.setRemoteStatus({ status: "unknown", message: "未检测" });
    }
  }

  setStatusMessage(message: string) {
    if (!this.statusMessageEl) return;
    this.statusMessageEl.setText(message);
  }

  resetPushProgress() {
    STEP_DEFS.forEach((step) => {
      this.setStepStatus(step.id, "idle");
    });
    this.setStatusMessage("等待操作");
  }

  setStepStatus(stepId: string, status: StepStatus, detail?: string) {
    const ref = this.stepRefs[stepId];
    if (!ref) return;
    ref.itemEl.classList.remove("is-running", "is-success", "is-error", "is-skipped");
    if (status === "running") ref.itemEl.classList.add("is-running");
    if (status === "success") ref.itemEl.classList.add("is-success");
    if (status === "error") ref.itemEl.classList.add("is-error");
    if (status === "skipped") ref.itemEl.classList.add("is-skipped");
    ref.detailEl.setText(detail ?? "");
  }

  async loadManifestPreview() {
    if (!this.manifestListEl || !this.manifestStatusEl) return;
    this.manifestStatusEl.setText("正在拉取 manifest...");
    const result = await this.plugin.fetchManifestPreview({ silent: true });

    this.manifestItems = result.items.slice(0, result.limit);
    if (result.status === "manifest_missing") {
      this.setRemoteStatus({ status: "manifest_missing", message: "manifest 不存在" });
      this.manifestStatusEl.setText("远端 manifest.json 不存在，将在首次推送时自动创建。 ");
      this.renderManifestList();
      return;
    }
    if (result.status === "error") {
      this.setRemoteStatus({ status: "error", message: "读取失败" });
      this.manifestStatusEl.setText("读取失败，请检查设置与网络。 ");
      this.renderManifestList();
      return;
    }

    this.setRemoteStatus({ status: "connected", message: "已连接" });
    const limit = result.limit;
    this.manifestStatusEl.setText(`已读取前 ${Math.min(result.items.length, limit)} 条：`);
    this.renderManifestList();
  }

  private async handleTestConnection() {
    const result = await this.plugin.testConnection({ silent: true });
    this.setRemoteStatusFromCheck(result);
  }

  private async handleFormSave() {
    const active = await this.plugin.getActiveFrontmatter();
    if (!active.file) {
      new Notice("请先打开一个 Markdown 文件。", 3000);
      return;
    }
    await this.plugin.updateFrontmatterFromForm(active.file, this.formState);
    this.formDirty = false;
    new Notice("属性已保存。", 3000);
    void this.refresh();
  }

  private renderManifestList() {
    if (!this.manifestListEl) return;
    const filter = this.manifestFilterEl?.value.trim().toLowerCase() ?? "";
    this.manifestListEl.empty();

    const items = filter
      ? this.manifestItems.filter((item) => item.slug.toLowerCase().includes(filter))
      : this.manifestItems;

    items.forEach((item) => {
      const li = this.manifestListEl?.createEl("li", { cls: "llp-manifest-item" });
      li?.createDiv({ text: `${item.slug} → ${item.file}`, cls: "llp-manifest-text" });
      const actions = li?.createDiv({ cls: "llp-manifest-actions" });
      const canRemote = this.plugin.hasWebdavConfig();
      const unpublish = actions?.createEl("button", {
        text: "下线",
        cls: "llp-button llp-button--warn llp-button--tiny"
      });
      const remove = actions?.createEl("button", {
        text: "删除",
        cls: "llp-button llp-button--danger llp-button--tiny"
      });
      if (unpublish) {
        unpublish.disabled = this.actionBusy || !canRemote;
        unpublish.addEventListener("click", () => {
          void this.plugin.unpublishBySlug(item.slug, { deleteRemote: false, fileHint: item.file });
        });
      }
      if (remove) {
        remove.disabled = this.actionBusy || !canRemote;
        remove.addEventListener("click", () => {
          void this.plugin.unpublishBySlug(item.slug, { deleteRemote: true, fileHint: item.file });
        });
      }
    });

    this.updateManifestNote();
  }

  private updateManifestNote() {
    if (!this.manifestNoteEl) return;
    if (!this.currentSlug) {
      this.manifestNoteEl.setText("当前未检测到 slug。推送时可设置。 ");
      return;
    }
    const exists = this.manifestItems.some((item) => item.slug === this.currentSlug);
    this.manifestNoteEl.setText(exists ? "远端已存在该 slug（将覆盖/更新）。" : "远端未找到该 slug（将新增）。");
  }

  private async refreshPropertyForm() {
    const active = await this.plugin.getActiveFrontmatter();
    if (!active.file) {
      this.applyFormState({
        title: "",
        date: formatDate(new Date()),
        place: "",
        visibility: "public",
        accent: this.plugin.getAccentOptions()[0]?.value ?? "",
        cover: "",
        tags: "",
        excerpt: ""
      }, "");
      return;
    }

    const normalized = normalizeFrontmatter(active.data ?? {});
    const tagsValue = active.data?.tags;
    let tags = "";
    if (Array.isArray(tagsValue)) {
      tags = tagsValue
        .map((tag) => (typeof tag === "string" || typeof tag === "number" ? String(tag) : ""))
        .filter((tag) => tag.length > 0)
        .join(", ");
    } else if (typeof tagsValue === "string") {
      tags = tagsValue;
    }

    this.applyFormState({
      title: normalized.title,
      date: normalized.date || formatDate(new Date()),
      place: normalized.place ?? "",
      visibility: normalized.visibility === "private" ? "private" : "public",
      accent: normalized.accent ?? this.plugin.getAccentOptions()[0]?.value ?? "",
      cover: normalized.cover ?? "",
      tags,
      excerpt: normalized.excerpt
    }, active.file.path);
  }

  private applyFormState(state: FrontmatterEditState, filePath: string) {
    if (this.formDirty && filePath === this.lastFormFilePath) return;
    this.formState = { ...state };
    this.lastFormFilePath = filePath;
    this.formDirty = false;

    if (this.formEls.title) this.formEls.title.value = state.title;
    if (this.formEls.date) this.formEls.date.value = state.date;
    if (this.formEls.place) this.formEls.place.value = state.place;
    if (this.formEls.cover) this.formEls.cover.value = state.cover;
    if (this.formEls.tags) this.formEls.tags.value = state.tags;
    if (this.formEls.excerpt) this.formEls.excerpt.value = state.excerpt;

    if (this.formEls.visibility instanceof HTMLSelectElement) {
      this.formEls.visibility.value = state.visibility;
    }

    if (this.formEls.accent instanceof HTMLSelectElement) {
      const accentSelect = this.formEls.accent;
      if (state.accent && !Array.from(accentSelect.options).some((option) => option.value === state.accent)) {
        const option = document.createElement("option");
        option.value = state.accent;
        option.text = `${state.accent}（当前）`;
        accentSelect.appendChild(option);
      }
      accentSelect.value = state.accent || accentSelect.value;
    }
  }

  private updateFormState<T extends keyof FrontmatterEditState>(key: T, value: FrontmatterEditState[T]) {
    this.formState = { ...this.formState, [key]: value };
    this.formDirty = true;
  }

  private fillAccentOptions(selectEl: HTMLSelectElement) {
    const options = this.plugin.getAccentOptions();
    selectEl.innerHTML = "";
    options.forEach((option) => {
      const item = document.createElement("option");
      item.value = option.value;
      item.text = option.label;
      selectEl.appendChild(item);
    });
  }

  private setRemoteStatus(status: RemoteStatus) {
    this.remoteStatus = status;
    if (!this.remoteStatusBadgeEl) return;
    this.remoteStatusBadgeEl.className = "llp-badge";

    const { status: kind } = status;
    if (kind === "connected") {
      this.remoteStatusBadgeEl.addClass("llp-badge--success");
      this.remoteStatusBadgeEl.setText("已连接");
      return;
    }
    if (kind === "manifest_missing") {
      this.remoteStatusBadgeEl.addClass("llp-badge--warn");
      this.remoteStatusBadgeEl.setText("清单不存在");
      return;
    }
    if (kind === "auth_failed") {
      this.remoteStatusBadgeEl.addClass("llp-badge--error");
      this.remoteStatusBadgeEl.setText("鉴权失败");
      return;
    }
    if (kind === "unconfigured") {
      this.remoteStatusBadgeEl.addClass("llp-badge--muted");
      this.remoteStatusBadgeEl.setText("未配置");
      return;
    }
    if (kind === "error") {
      this.remoteStatusBadgeEl.addClass("llp-badge--error");
      this.remoteStatusBadgeEl.setText("连接异常");
      return;
    }

    this.remoteStatusBadgeEl.addClass("llp-badge--muted");
    this.remoteStatusBadgeEl.setText(status.message ?? "未检测");
  }

  private setRemoteStatusFromCheck(result: { ok: boolean; status: string; message: string }) {
    if (result.status === "unconfigured") {
      this.setRemoteStatus({ status: "unconfigured", message: result.message });
      return;
    }
    if (result.status === "manifest_missing") {
      this.setRemoteStatus({ status: "manifest_missing", message: result.message });
      return;
    }
    if (result.status === "auth_failed") {
      this.setRemoteStatus({ status: "auth_failed", message: result.message });
      return;
    }
    if (result.status === "ok") {
      this.setRemoteStatus({ status: "connected", message: result.message });
      return;
    }
    this.setRemoteStatus({ status: "error", message: result.message });
  }

  private addListItems(items: string[]) {
    if (!this.validationListEl) return;
    items.forEach((item) => {
      const li = this.validationListEl?.createEl("li");
      li?.setText(item);
    });
  }

  private toggleActionAvailability(enabled: boolean) {
    if (this.pushButton) this.pushButton.disabled = !enabled;
    if (this.repairButton) this.repairButton.disabled = !enabled;
    if (this.accentButton) this.accentButton.disabled = !enabled;
    if (this.formSaveButton) this.formSaveButton.disabled = !enabled;
    const canRemote = enabled && this.plugin.hasWebdavConfig();
    if (this.unpublishButton) this.unpublishButton.disabled = !canRemote || this.actionBusy;
    if (this.deleteButton) this.deleteButton.disabled = !canRemote || this.actionBusy;
  }

  private togglePushButton(enabled: boolean) {
    if (this.pushButton) {
      this.pushButton.disabled = !enabled || !this.hasActiveFile || !this.plugin.hasWebdavConfig();
    }
  }

  setActionBusy(busy: boolean) {
    this.actionBusy = busy;
    const canRemote = this.hasActiveFile && this.plugin.hasWebdavConfig();
    if (this.unpublishButton) this.unpublishButton.disabled = busy || !canRemote;
    if (this.deleteButton) this.deleteButton.disabled = busy || !canRemote;
    this.renderManifestList();
  }
}
