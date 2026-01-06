import { App, Modal, Notice, Setting } from "obsidian";
import type { AccentOption } from "./types";
import { formatDate, isValidDate, parseTagsInput, slugify } from "./frontmatter";

export type NewArticleFormData = {
  title: string;
  date: string;
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
    this.data = {
      title: "",
      date: formatDate(new Date()),
      place: "",
      accent: options.defaultAccent,
      cover: options.defaultCover,
      excerpt: "",
      tags: [],
      visibility: "public"
    };
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "新建里程碑文档" });

    new Setting(contentEl)
      .setName("标题")
      .setDesc("将用于页面标题与文件名 slug")
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
      .setDesc("格式 YYYY-MM-DD，默认今天")
      .addText((text) => {
        text.inputEl.type = "date";
        text.setValue(this.data.date).onChange((value) => {
          this.data.date = value.trim();
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
        options.forEach((option) => dropdown.addOption(option.value, option.label));
        dropdown.setValue(this.data.accent).onChange((value) => {
          this.data.accent = value;
        });
      });

    new Setting(contentEl)
      .setName("封面 (cover)")
      .setDesc("支持外链，例如 https://your-image-host/cover.svg")
      .addText((text) => {
        text.setPlaceholder("https://...")
          .setValue(this.data.cover)
          .onChange((value) => {
            this.data.cover = value.trim();
          });
      });

    new Setting(contentEl)
      .setName("摘要 (excerpt)")
      .setDesc("首页卡片文案，必填")
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
      .setDesc("public 将出现在首页，private 会默认隐藏")
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

    createButton.addEventListener("click", async () => {
      if (!this.data.title) {
        new Notice("请填写标题。", 3000);
        return;
      }
      if (!this.data.date || !isValidDate(this.data.date)) {
        new Notice("日期格式必须为 YYYY-MM-DD，且是有效日期。", 4000);
        return;
      }
      if (!this.data.excerpt) {
        new Notice("摘要（excerpt）为必填字段。", 3000);
        return;
      }

      const result = await this.options.onSubmit(this.data);
      if (result !== false) {
        this.close();
      }
    });

    cancelButton.addEventListener("click", () => this.close());
  }

  private updateFileNamePreview() {
    if (!this.fileNamePreviewEl) return;
    const slug = slugify(this.data.title || "milestone");
    const date = this.data.date || formatDate(new Date());
    const fileName = `${date}-${slug}.${this.options.defaultExtension}`;
    this.fileNamePreviewEl.setText(`文件名预览：${fileName}`);
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
          advancedContainer.style.display = value ? "block" : "none";
          updatePreview();
        });
      });

    const advancedContainer = contentEl.createDiv({ cls: "love-linker-section" });
    advancedContainer.style.display = "none";

    new Setting(advancedContainer)
      .setName("自定义远端文件名")
      .setDesc("例如：my-post.mdx，不填则使用 slug")
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
        new Notice("slug 不能为空。", 3000);
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
