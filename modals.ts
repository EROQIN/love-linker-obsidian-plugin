import { App, Modal, Notice, Setting } from "obsidian";
import type { AccentOption } from "./types";
import { formatDate, isValidDate, parseTagsInput, slugify } from "./frontmatter";

export type NewArticleFormData = {
  title: string;
  date: string;
  fileName: string;
  place: string;
  accent: string;
  cover: string;
  excerpt: string;
  tags: string[];
  visibility: "public" | "private";
};

export class NewArticleModal extends Modal {
  private data: NewArticleFormData;
  private fileNamePreviewEl?: HTMLDivElement;
  private defaultFileNameBase: string;

  constructor(
    app: App,
    private options: {
      accentOptions: AccentOption[];
      defaultAccent: string;
      defaultCover: string;
      defaultExtension: "md" | "mdx";
      onSubmit: (data: NewArticleFormData) => Promise<boolean> | boolean;
    }
  ) {
    super(app);
    const defaultDate = formatDate(new Date());
    this.data = {
      title: "",
      date: defaultDate,
      fileName: "",
      place: "",
      accent: options.defaultAccent,
      cover: options.defaultCover,
      excerpt: "",
      tags: [],
      visibility: "public"
    };
    this.defaultFileNameBase = this.buildDefaultFileNameBase(defaultDate);
    this.data.fileName = this.defaultFileNameBase;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "新建里程碑文档" });

    new Setting(contentEl)
      .setName("标题")
      .setDesc("将用于页面标题")
      .addText((text) => {
        text.setPlaceholder("例如：第一次远行")
          .setValue(this.data.title)
          .onChange((value) => {
            this.data.title = value.trim();
            this.updateFileNamePreview();
          });
      });

    new Setting(contentEl)
      .setName("日期")
      .setDesc("格式 2024-01-01，默认今天")
      .addText((text) => {
        text.inputEl.type = "date";
        text.setValue(this.data.date).onChange((value) => {
          this.data.date = value.trim();
          const nextDefault = this.buildDefaultFileNameBase(this.data.date);
          if (this.data.fileName.trim() === this.defaultFileNameBase) {
            this.defaultFileNameBase = nextDefault;
            this.data.fileName = nextDefault;
          }
          this.updateFileNamePreview();
        });
      });

    new Setting(contentEl)
      .setName("文件名")
      .setDesc("可自定义，不会随标题自动变化")
      .addText((text) => {
        text.setPlaceholder(this.defaultFileNameBase)
          .setValue(this.data.fileName)
          .onChange((value) => {
            this.data.fileName = value.trim();
            this.updateFileNamePreview();
          });
      });

    new Setting(contentEl)
      .setName("地点")
      .setDesc("可留空")
      .addText((text) => {
        text.setPlaceholder("例如：海边")
          .setValue(this.data.place)
          .onChange((value) => {
            this.data.place = value.trim();
          });
      });

    new Setting(contentEl)
      .setName("主色 (accent)")
      .setDesc("来自 love-linker 调色板，可在设置里扩展")
      .addDropdown((dropdown) => {
        const options = this.options.accentOptions;
        if (options.length === 0) {
          dropdown.addOption(this.options.defaultAccent, this.options.defaultAccent);
        }
        options.forEach((option) => {
          dropdown.addOption(option.value, option.label);
        });
        dropdown.setValue(this.data.accent).onChange((value) => {
          this.data.accent = value;
        });
      });

    new Setting(contentEl)
      .setName("封面 (cover)")
      .setDesc("支持外链，例如 https://your-image-host/cover.svg")
      .addText((text) => {
        text.setPlaceholder("示例链接")
          .setValue(this.data.cover)
          .onChange((value) => {
            this.data.cover = value.trim();
          });
      });

    new Setting(contentEl)
      .setName("摘要 (excerpt)")
      .setDesc("首页卡片文案，可留空")
      .addTextArea((textarea) => {
        textarea.inputEl.rows = 3;
        textarea.setPlaceholder("写一句简短引言")
          .setValue(this.data.excerpt)
          .onChange((value) => {
            this.data.excerpt = value.trim();
          });
      });

    new Setting(contentEl)
      .setName("标签 (tags)")
      .setDesc("逗号分隔，例如：旅途, 潮声")
      .addText((text) => {
        text.setPlaceholder("旅途, 潮声")
          .setValue("")
          .onChange((value) => {
            this.data.tags = parseTagsInput(value);
          });
      });

    new Setting(contentEl)
      .setName("可见性 (visibility)")
      .setDesc("公开将出现在首页，私密会默认隐藏")
      .addDropdown((dropdown) => {
        dropdown.addOption("public", "公开 / public");
        dropdown.addOption("private", "私密 / private");
        dropdown.setValue(this.data.visibility).onChange((value: "public" | "private") => {
          this.data.visibility = value;
        });
      });

    this.fileNamePreviewEl = contentEl.createDiv({ cls: "love-linker-muted" });
    this.updateFileNamePreview();

    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const createButton = buttonRow.createEl("button", { text: "创建文档" });
    const cancelButton = buttonRow.createEl("button", { text: "取消" });

    createButton.addEventListener("click", () => {
      void this.handleCreate();
    });

    cancelButton.addEventListener("click", () => this.close());
  }

  private updateFileNamePreview() {
    if (!this.fileNamePreviewEl) return;
    this.fileNamePreviewEl.setText(`文件名预览：${this.resolveFileName()}`);
  }

  private async handleCreate() {
    const result = await this.options.onSubmit(this.data);
    if (result !== false) {
      this.close();
    }
  }

  private resolveFileName() {
    const raw = this.data.fileName.trim() || this.defaultFileNameBase;
    if (raw.endsWith(`.${this.options.defaultExtension}`) || raw.includes(".")) {
      return raw;
    }
    return `${raw}.${this.options.defaultExtension}`;
  }

  private buildDefaultFileNameBase(dateValue: string) {
    const date = isValidDate(dateValue) ? dateValue : formatDate(new Date());
    return `${date}-${slugify("milestone")}`;
  }
}

export type FrontmatterRepairChange = {
  key: string;
  label: string;
  value: string;
  note?: string;
  editable?: boolean;
};

export class FrontmatterRepairModal extends Modal {
  private resolved = false;
  private values: Record<string, string> = {};

  constructor(
    app: App,
    private options: {
      changes: FrontmatterRepairChange[];
      onResolve: (choice: ConfirmChoice, values: Record<string, string>) => void;
    }
  ) {
    super(app);
    options.changes.forEach((change) => {
      this.values[change.key] = change.value;
    });
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "补全/修复 frontmatter" });
    contentEl.createEl("p", { text: "将写入以下字段，确认后会直接保存到当前文档。" });

    const list = contentEl.createDiv({ cls: "llp-repair-list" });

    if (this.options.changes.length === 0) {
      list.createDiv({ text: "当前文档无需修复。", cls: "love-linker-muted" });
    }

    this.options.changes.forEach((change) => {
      const row = list.createDiv({ cls: "llp-repair-row" });
      row.createDiv({ text: change.label, cls: "llp-repair-label" });

      if (change.editable) {
        const textarea = row.createEl("textarea", { cls: "llp-repair-input" });
        textarea.value = change.value;
        textarea.rows = 3;
        textarea.addEventListener("input", () => {
          this.values[change.key] = textarea.value.trim();
        });
      } else {
        row.createDiv({ text: change.value || "（空）", cls: "llp-repair-value" });
      }

      if (change.note) {
        row.createDiv({ text: change.note, cls: "love-linker-muted" });
      }
    });

    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const confirmButton = buttonRow.createEl("button", { text: "应用修复" });
    const cancelButton = buttonRow.createEl("button", { text: "取消" });

    confirmButton.addEventListener("click", () => this.resolve("confirm"));
    cancelButton.addEventListener("click", () => this.resolve("cancel"));
  }

  onClose() {
    if (!this.resolved) {
      this.options.onResolve("cancel", this.values);
    }
  }

  private resolve(choice: ConfirmChoice) {
    this.resolved = true;
    this.options.onResolve(choice, this.values);
    this.close();
  }
}

export type SlugModalResult = {
  slug: string;
  fileName: string;
  forcePrivate: boolean;
  manifestOnly: boolean;
};

export class SlugInputModal extends Modal {
  private slugValue: string;
  private fileNameValue: string;
  private forcePrivate = false;
  private manifestOnly = false;
  private useCustomFileName = false;

  constructor(
    app: App,
    private options: {
      defaultSlug: string;
      extension: "md" | "mdx";
      onSubmit: (result: SlugModalResult) => void;
    }
  ) {
    super(app);
    this.slugValue = options.defaultSlug;
    this.fileNameValue = `${options.defaultSlug}.${options.extension}`;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "设置文章 slug" });

    const warningEl = contentEl.createDiv({ cls: "love-linker-muted" });
    const previewEl = contentEl.createDiv({ cls: "love-linker-muted" });

    const updateWarning = () => {
      const isValid = /^[a-z0-9-]+$/.test(this.slugValue);
      warningEl.setText(
        isValid
          ? "建议仅使用小写字母 / 数字 / 短横线。"
          : "当前 slug 包含特殊字符，可能导致 URL 不友好。"
      );
    };

    const updatePreview = () => {
      previewEl.setText(`远端文件名预览：${this.resolveFileName()}`);
    };

    new Setting(contentEl)
      .setName("Slug")
      .setDesc("将用于网站 URL")
      .addText((text) => {
        text.setPlaceholder("例如：first-trip")
          .setValue(this.slugValue)
          .onChange((value) => {
            this.slugValue = value.trim();
            if (!this.useCustomFileName) {
              this.fileNameValue = `${this.slugValue}.${this.options.extension}`;
            }
            updateWarning();
            updatePreview();
          });
      });

    new Setting(contentEl)
      .setName("推送为 private")
      .setDesc("会写入当前文件 frontmatter 的 visibility")
      .addToggle((toggle) => {
        toggle.setValue(this.forcePrivate).onChange((value) => {
          this.forcePrivate = value;
        });
      });

    new Setting(contentEl)
      .setName("高级选项")
      .setDesc("可自定义远端文件名或只更新 manifest")
      .addToggle((toggle) => {
        toggle.setValue(false).onChange((value) => {
          this.useCustomFileName = value;
          advancedContainer.classList.toggle("llp-hidden", !value);
          updatePreview();
        });
      });

    const advancedContainer = contentEl.createDiv({ cls: "love-linker-section llp-hidden" });

    new Setting(advancedContainer)
      .setName("自定义远端文件名")
      .setDesc("例如：my-post.md，不填则使用 slug")
      .addText((text) => {
        text.setPlaceholder(`${this.slugValue}.${this.options.extension}`)
          .setValue(this.fileNameValue)
          .onChange((value) => {
            this.fileNameValue = value.trim();
            updatePreview();
          });
      });

    new Setting(advancedContainer)
      .setName("仅更新 manifest")
      .setDesc("不上传当前文档，仅更新 slug -> file 映射")
      .addToggle((toggle) => {
        toggle.setValue(this.manifestOnly).onChange((value) => {
          this.manifestOnly = value;
        });
      });

    updateWarning();
    updatePreview();

    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const submitButton = buttonRow.createEl("button", { text: "继续" });
    const cancelButton = buttonRow.createEl("button", { text: "取消" });

    submitButton.addEventListener("click", () => {
      if (!this.slugValue.trim()) {
        new Notice("文章标识不能为空。", 3000);
        return;
      }
      if (/[\\/]/.test(this.resolveFileName())) {
        new Notice("文件名不能包含斜杠。", 3000);
        return;
      }
      this.options.onSubmit({
        slug: this.slugValue.trim(),
        fileName: this.resolveFileName(),
        forcePrivate: this.forcePrivate,
        manifestOnly: this.manifestOnly
      });
      this.close();
    });

    cancelButton.addEventListener("click", () => this.close());
  }

  private resolveFileName() {
    if (this.useCustomFileName && this.fileNameValue.trim()) {
      const raw = this.fileNameValue.trim();
      if (raw.endsWith(`.${this.options.extension}`) || raw.includes(".")) {
        return raw;
      }
      return `${raw}.${this.options.extension}`;
    }
    return `${this.slugValue}.${this.options.extension}`;
  }
}

export type ConfirmChoice = "confirm" | "cancel";

export class ConfirmModal extends Modal {
  private resolved = false;

  constructor(
    app: App,
    private options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      onResolve: (choice: ConfirmChoice) => void;
    }
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.options.title });
    contentEl.createEl("p", { text: this.options.message });

    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const confirmButton = buttonRow.createEl("button", {
      text: this.options.confirmText ?? "确认"
    });
    const cancelButton = buttonRow.createEl("button", { text: this.options.cancelText ?? "取消" });

    confirmButton.addEventListener("click", () => this.resolve("confirm"));
    cancelButton.addEventListener("click", () => this.resolve("cancel"));
  }

  onClose() {
    if (!this.resolved) {
      this.options.onResolve("cancel");
    }
  }

  private resolve(choice: ConfirmChoice) {
    this.resolved = true;
    this.options.onResolve(choice);
    this.close();
  }
}

export type ConflictChoice = "overwrite" | "change" | "cancel";

export class SlugConflictModal extends Modal {
  private resolved = false;

  constructor(
    app: App,
    private options: {
      slug: string;
      existingFile: string;
      onResolve: (choice: ConflictChoice) => void;
    }
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Slug 已存在" });
    contentEl.createEl("p", {
      text: `远端已存在 slug: ${this.options.slug}（文件：${this.options.existingFile}）。请选择处理方式。`
    });

    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const overwriteButton = buttonRow.createEl("button", { text: "覆盖" });
    const changeButton = buttonRow.createEl("button", { text: "改 slug" });
    const cancelButton = buttonRow.createEl("button", { text: "取消" });

    overwriteButton.addEventListener("click", () => this.resolve("overwrite"));
    changeButton.addEventListener("click", () => this.resolve("change"));
    cancelButton.addEventListener("click", () => this.resolve("cancel"));
  }

  onClose() {
    if (!this.resolved) {
      this.options.onResolve("cancel");
    }
  }

  private resolve(choice: ConflictChoice) {
    this.resolved = true;
    this.options.onResolve(choice);
    this.close();
  }
}

export class AccentSelectModal extends Modal {
  private selected: string;

  constructor(
    app: App,
    private options: {
      options: AccentOption[];
      current?: string;
      onSubmit: (value: string) => void;
    }
  ) {
    super(app);
    this.selected = options.current ?? "";
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "选择文章主色 (accent)" });
    contentEl.createEl("p", {
      text: this.selected ? `当前：${this.selected}` : "当前未设置 accent。"
    });

    new Setting(contentEl)
      .setName("Accent")
      .setDesc("来自 love-linker 调色板，可在设置中扩展")
      .addDropdown((dropdown) => {
        const options = this.options.options;
        const values = options.map((option) => option.value);
        if (this.selected && !values.includes(this.selected)) {
          dropdown.addOption(this.selected, `${this.selected}（当前）`);
        }
        options.forEach((option) => {
          dropdown.addOption(option.value, option.label);
        });
        dropdown.setValue(this.selected || options[0]?.value || "").onChange((value) => {
          this.selected = value;
        });
      });

    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const confirmButton = buttonRow.createEl("button", { text: "保存" });
    const cancelButton = buttonRow.createEl("button", { text: "取消" });

    confirmButton.addEventListener("click", () => {
      this.options.onSubmit(this.selected);
      this.close();
    });
    cancelButton.addEventListener("click", () => this.close());
  }
}

export class SlugPromptModal extends Modal {
  private resolved = false;
  private slugValue = "";

  constructor(
    app: App,
    private options: {
      title: string;
      description: string;
      defaultValue?: string;
      onSubmit: (value: string | null) => void;
    }
  ) {
    super(app);
    this.slugValue = options.defaultValue?.trim() ?? "";
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.options.title });
    contentEl.createEl("p", { text: this.options.description });

    new Setting(contentEl)
      .setName("Slug")
      .setDesc("将用于匹配远端 manifest")
      .addText((text) => {
        text.setPlaceholder("例如：hello-world")
          .setValue(this.slugValue)
          .onChange((value) => {
            this.slugValue = value.trim();
          });
      });

    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const confirmButton = buttonRow.createEl("button", { text: "确认" });
    const cancelButton = buttonRow.createEl("button", { text: "取消" });

    confirmButton.addEventListener("click", () => {
      if (!this.slugValue) {
        new Notice("文章标识不能为空。", 3000);
        return;
      }
      this.resolve(this.slugValue);
    });
    cancelButton.addEventListener("click", () => this.resolve(null));
  }

  onClose() {
    if (!this.resolved) {
      this.options.onSubmit(null);
    }
  }

  private resolve(value: string | null) {
    this.resolved = true;
    this.options.onSubmit(value);
    this.close();
  }
}

export type UnpublishConfirmChoice = "confirm" | "cancel";

export class UnpublishConfirmModal extends Modal {
  private resolved = false;
  private confirmButton?: HTMLButtonElement;
  private slugInputValue = "";

  constructor(
    app: App,
    private options: {
      mode: "unpublish" | "delete";
      slug: string;
      file: string;
      remotePath: string;
      mismatchNote?: string;
      onResolve: (choice: UnpublishConfirmChoice) => void;
    }
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    if (this.options.mode === "delete") {
      contentEl.createEl("h2", { text: "危险操作：彻底删除远端文章？" });
      contentEl.createEl("p", {
        text: "将从 manifest 移除并尝试删除远端文件，删除后可能无法恢复。"
      });
    } else {
      contentEl.createEl("h2", { text: "确认下线文章？" });
      contentEl.createEl("p", {
        text: "下线后文章将从网站索引中移除，站点刷新周期后无法访问，但不会删除远端文件。"
      });
    }

    const info = contentEl.createEl("ul", { cls: "llp-list" });
    info.createEl("li", { text: `slug: ${this.options.slug}` });
    info.createEl("li", { text: `file: ${this.options.file}` });
    info.createEl("li", { text: `远端路径: ${this.options.remotePath}` });

    if (this.options.mismatchNote) {
      contentEl.createDiv({ text: this.options.mismatchNote, cls: "llp-muted" });
    }

    if (this.options.mode === "delete") {
      contentEl.createEl("p", { text: "请输入 slug 以确认删除操作。" });
      new Setting(contentEl)
        .setName("确认 slug")
        .setDesc("输入与上方一致的 slug 才能继续")
        .addText((text) => {
          text.setPlaceholder(this.options.slug)
            .setValue("")
            .onChange((value) => {
              this.slugInputValue = value.trim();
              this.updateConfirmState();
            });
        });
    }

    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    this.confirmButton = buttonRow.createEl("button", {
      text: this.options.mode === "delete" ? "确认删除" : "确认下线"
    });
    const cancelButton = buttonRow.createEl("button", { text: "取消" });

    if (this.options.mode === "delete") {
      this.confirmButton.addClass("llp-button");
      this.confirmButton.addClass("llp-button--danger");
      this.confirmButton.disabled = true;
    }

    this.confirmButton.addEventListener("click", () => this.resolve("confirm"));
    cancelButton.addEventListener("click", () => this.resolve("cancel"));
  }

  onClose() {
    if (!this.resolved) {
      this.options.onResolve("cancel");
    }
  }

  private updateConfirmState() {
    if (!this.confirmButton) return;
    this.confirmButton.disabled = this.slugInputValue !== this.options.slug;
  }

  private resolve(choice: UnpublishConfirmChoice) {
    this.resolved = true;
    this.options.onResolve(choice);
    this.close();
  }
}
