"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => LoveLinkerPublisherPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// settings.ts
var import_obsidian = require("obsidian");
var LoveLinkerSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Love Linker Publisher \u8BBE\u7F6E" });
    new import_obsidian.Setting(containerEl).setName("WEBDAV_BASE_URL").setDesc("\u4F8B\u5982 https://rebun.infini-cloud.net/dav\uFF08\u4E00\u822C\u4EE5 /dav \u7ED3\u5C3E\uFF09").addText(
      (text) => text.setPlaceholder("https://...").setValue(this.plugin.settings.webdavBaseUrl).onChange(async (value) => {
        this.plugin.settings.webdavBaseUrl = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("WEBDAV_USERNAME").setDesc("\u4E91\u76D8\u7684 Connection ID\uFF08\u7528\u4E8E\u767B\u5F55\uFF09").addText(
      (text) => text.setPlaceholder("YOUR_CONNECTION_ID").setValue(this.plugin.settings.webdavUsername).onChange(async (value) => {
        this.plugin.settings.webdavUsername = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("WEBDAV_PASSWORD").setDesc("\u4E91\u76D8\u7684 Apps Password\uFF08\u5EFA\u8BAE\u4E0D\u8981\u622A\u56FE\u5206\u4EAB\uFF1B\u672C\u63D2\u4EF6\u4F1A\u4FDD\u5B58\u5728\u672C\u5730\u914D\u7F6E\u4E2D\uFF09").addText((text) => {
      text.inputEl.type = "password";
      text.setPlaceholder("YOUR_APPS_PASSWORD").setValue(this.plugin.settings.webdavPassword).onChange(async (value) => {
        this.plugin.settings.webdavPassword = value.trim();
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("\u663E\u793A\u5BC6\u7801").setDesc("\u4EC5\u5F71\u54CD\u5F53\u524D\u8BBE\u7F6E\u9875\u663E\u793A").addToggle((toggle) => {
      toggle.setValue(false).onChange((value) => {
        const passwordInputs = containerEl.querySelectorAll("input[type='password'], input[data-llp-password='true']");
        passwordInputs.forEach((input) => {
          const inputEl = input;
          inputEl.type = value ? "text" : "password";
        });
      });
    });
    const passwordInput = containerEl.querySelector("input[type='password']");
    if (passwordInput) {
      passwordInput.setAttribute("data-llp-password", "true");
    }
    new import_obsidian.Setting(containerEl).setName("WEBDAV_CONTENT_DIR").setDesc("\u8FDC\u7AEF\u5B58\u653E\u6587\u7AE0\u7684\u76EE\u5F55\u540D\uFF08\u901A\u5E38\u4E0D\u7528\u6539\uFF09").addText(
      (text) => text.setPlaceholder("milestones").setValue(this.plugin.settings.webdavContentDir).onChange(async (value) => {
        this.plugin.settings.webdavContentDir = value.trim() || "milestones";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("WEBDAV_MANIFEST_FILE").setDesc("slug \u6620\u5C04\u8868\u6587\u4EF6\u540D\uFF08\u901A\u5E38\u4E0D\u7528\u6539\uFF09").addText(
      (text) => text.setPlaceholder("manifest.json").setValue(this.plugin.settings.webdavManifestFile).onChange(async (value) => {
        this.plugin.settings.webdavManifestFile = value.trim() || "manifest.json";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("LOCAL_CONTENT_FOLDER").setDesc("Obsidian \u672C\u5730\u4FDD\u5B58\u6587\u7AE0\u7684\u6587\u4EF6\u5939\uFF08\u76F8\u5BF9 vault \u6839\u76EE\u5F55\uFF09").addText(
      (text) => text.setPlaceholder("milestones").setValue(this.plugin.settings.localContentFolder).onChange(async (value) => {
        this.plugin.settings.localContentFolder = value.trim() || "milestones";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u9ED8\u8BA4\u6269\u5C55\u540D").setDesc("\u65B0\u5EFA\u6587\u4EF6\u65F6\u4F7F\u7528 .md").addDropdown((dropdown) => {
      dropdown.addOption("md", ".md");
      dropdown.setValue(this.plugin.settings.defaultExtension).onChange(async (value) => {
        this.plugin.settings.defaultExtension = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("\u9ED8\u8BA4 accent").setDesc("\u65B0\u5EFA\u6587\u6863\u65F6\u9ED8\u8BA4\u4F7F\u7528\u7684\u4E3B\u8272").addText(
      (text) => text.setPlaceholder("coral").setValue(this.plugin.settings.defaultAccent).onChange(async (value) => {
        this.plugin.settings.defaultAccent = value.trim() || "coral";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("accent \u5019\u9009\u5217\u8868").setDesc("\u6BCF\u884C\u4E00\u4E2A\uFF0C\u53EF\u5199\u6210 key|\u4E2D\u6587\u8BF4\u660E\uFF0C\u4F8B\u5982 sea|\u6D77\u84DD").addTextArea((textarea) => {
      textarea.inputEl.rows = 6;
      textarea.setValue(this.plugin.settings.accentOptions.join("\n")).onChange(async (value) => {
        this.plugin.settings.accentOptions = value.split("\n").map((line) => line.trim()).filter(Boolean);
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("\u9ED8\u8BA4\u5C01\u9762\u94FE\u63A5").setDesc("\u5916\u94FE\u56FE\u5E8A\u9ED8\u8BA4\u503C\uFF0C\u53EF\u7559\u7A7A").addText(
      (text) => text.setPlaceholder("https://your-image-host/cover.svg").setValue(this.plugin.settings.defaultCoverUrl).onChange(async (value) => {
        this.plugin.settings.defaultCoverUrl = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u6D4B\u8BD5\u8FDE\u63A5").setDesc("\u70B9\u51FB\u540E\u68C0\u6D4B WebDAV \u662F\u5426\u53EF\u8FDE\u63A5").addButton((button) => {
      button.setButtonText("\u6D4B\u8BD5\u8FDE\u63A5").onClick(async () => {
        await this.plugin.testConnection();
      });
    });
    const safety = containerEl.createDiv({ cls: "love-linker-section" });
    safety.createEl("h3", { text: "\u5B89\u5168\u8BF4\u660E" });
    safety.createEl("p", {
      text: "WebDAV \u5BC6\u7801\u4F1A\u4FDD\u5B58\u5728\u672C\u5730\u63D2\u4EF6\u914D\u7F6E\u6587\u4EF6\u4E2D\uFF08\u660E\u6587\uFF09\uFF0C\u8BF7\u81EA\u884C\u8BC4\u4F30\u98CE\u9669\u3002"
    });
    safety.createEl("p", { text: "\u4E0D\u8981\u628A\u5BC6\u7801\u63D0\u4EA4\u5230 Git \u6216\u516C\u5F00\u3002" });
  }
};

// types.ts
var DEFAULT_SETTINGS = {
  webdavBaseUrl: "",
  webdavUsername: "",
  webdavPassword: "",
  webdavContentDir: "milestones",
  webdavManifestFile: "manifest.json",
  localContentFolder: "milestones",
  defaultExtension: "md",
  defaultAccent: "coral",
  accentOptions: [
    "coral|\u73CA\u745A\u7EA2",
    "peach|\u6843\u674F",
    "amber|\u7425\u73C0\u9EC4",
    "sea|\u6D77\u84DD",
    "sky|\u5929\u84DD",
    "ink|\u58A8\u9ED1",
    "paper|\u7EB8\u767D"
  ],
  defaultCoverUrl: "",
  manifestPreviewLimit: 10
};

// frontmatter.ts
var import_obsidian2 = require("obsidian");
var DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
var formatDate = (value) => {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
var isValidDate = (value) => {
  if (!DATE_REGEX.test(value))
    return false;
  const parsed = /* @__PURE__ */ new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()))
    return false;
  return parsed.toISOString().startsWith(value);
};
var slugify = (value) => {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "milestone";
};
var parseTagsInput = (value) => {
  return value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
};
var escapeYamlString = (value) => {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
};
var buildYamlArray = (tags) => {
  if (!tags || tags.length === 0)
    return "[]";
  const escaped = tags.map((tag) => `"${escapeYamlString(tag)}"`);
  return `[${escaped.join(", ")}]`;
};
var buildFrontmatterTemplate = (data) => {
  var _a, _b, _c, _d, _e;
  const title = escapeYamlString(data.title);
  const date = escapeYamlString(data.date);
  const place = escapeYamlString((_a = data.place) != null ? _a : "");
  const accent = escapeYamlString((_b = data.accent) != null ? _b : "");
  const cover = escapeYamlString((_c = data.cover) != null ? _c : "");
  const excerpt = escapeYamlString(data.excerpt);
  const tags = buildYamlArray((_d = data.tags) != null ? _d : []);
  const visibility = escapeYamlString((_e = data.visibility) != null ? _e : "public");
  return [
    "---",
    `title: "${title}"`,
    `date: "${date}"`,
    `place: "${place}"`,
    `accent: "${accent}"`,
    `cover: "${cover}"`,
    `excerpt: "${excerpt}"`,
    `tags: ${tags}`,
    `visibility: "${visibility}"`,
    "---",
    ""
  ].join("\n");
};
var parseFrontmatterBlock = (text) => {
  var _a;
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) {
    return { data: null, hasFrontmatter: false };
  }
  try {
    const data = (_a = (0, import_obsidian2.parseYaml)(match[1])) != null ? _a : {};
    return { data, hasFrontmatter: true };
  } catch (error) {
    return { data: null, hasFrontmatter: true, error };
  }
};
var getFrontmatterEndLine = (text) => {
  const lines = text.split("\n");
  let delimiterCount = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      delimiterCount += 1;
      if (delimiterCount === 2)
        return i;
    }
  }
  return 0;
};
var suggestSlugFromFilename = (basename) => {
  const match = basename.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  if (match && match[1])
    return match[1];
  return basename;
};

// validation.ts
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var isHexColor = (value) => /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
var normalizeFrontmatter = (data) => {
  var _a, _b, _c;
  return {
    title: String((_a = data.title) != null ? _a : ""),
    date: String((_b = data.date) != null ? _b : ""),
    excerpt: String((_c = data.excerpt) != null ? _c : ""),
    place: data.place ? String(data.place) : void 0,
    cover: data.cover ? String(data.cover) : void 0,
    accent: data.accent ? String(data.accent) : void 0,
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : void 0,
    visibility: data.visibility ? String(data.visibility) : void 0
  };
};
var validateFrontmatter = (data, accentOptions) => {
  const result = { ok: false, errors: [], warnings: [], isPrivate: false };
  if (!data) {
    result.errors.push("\u672A\u8BFB\u53D6\u5230 YAML frontmatter\u3002\u8BF7\u5728\u6587\u4EF6\u5F00\u5934\u6DFB\u52A0 --- \u5757\u3002");
    return result;
  }
  const normalized = normalizeFrontmatter(data);
  if (!isNonEmptyString(normalized.title)) {
    result.errors.push("\u7F3A\u5C11 title\uFF0C\u6216\u4E0D\u662F\u5B57\u7B26\u4E32\u3002");
  }
  if (!isNonEmptyString(normalized.date) || !isValidDate(normalized.date)) {
    result.errors.push("date \u5FC5\u987B\u4E3A YYYY-MM-DD \u4E14\u662F\u6709\u6548\u65E5\u671F\u3002");
  }
  if (!isNonEmptyString(normalized.excerpt)) {
    result.errors.push("\u7F3A\u5C11 excerpt\uFF0C\u6216\u4E0D\u662F\u5B57\u7B26\u4E32\u3002");
  }
  if (normalized.visibility && normalized.visibility !== "public" && normalized.visibility !== "private") {
    result.errors.push("visibility \u53EA\u80FD\u662F public \u6216 private\u3002");
  }
  if (normalized.visibility === "private") {
    result.isPrivate = true;
  }
  if (data.tags && !Array.isArray(data.tags)) {
    result.warnings.push('tags \u5E94\u4E3A\u6570\u7EC4\uFF0C\u4F8B\u5982 ["\u65C5\u9014", "\u6F6E\u58F0"]\u3002');
  }
  if (normalized.accent && normalized.accent.trim()) {
    const accentKeys = accentOptions.map((option) => option.value);
    if (!accentKeys.includes(normalized.accent) && !isHexColor(normalized.accent)) {
      result.warnings.push("accent \u4E0D\u5728\u8C03\u8272\u677F\u4E2D\uFF08\u6216\u4E0D\u662F #hex\uFF09\uFF0C\u7F51\u7AD9\u53EF\u80FD\u4F1A\u7ED9\u51FA\u8B66\u544A\u3002");
    }
  }
  result.ok = result.errors.length === 0;
  return result;
};

// modals.ts
var import_obsidian3 = require("obsidian");
var NewArticleModal = class extends import_obsidian3.Modal {
  constructor(app, options) {
    super(app);
    this.options = options;
    const defaultDate = formatDate(/* @__PURE__ */ new Date());
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
    contentEl.createEl("h2", { text: "\u65B0\u5EFA\u91CC\u7A0B\u7891\u6587\u6863" });
    new import_obsidian3.Setting(contentEl).setName("\u6807\u9898").setDesc("\u5C06\u7528\u4E8E\u9875\u9762\u6807\u9898").addText((text) => {
      text.setPlaceholder("\u4F8B\u5982\uFF1A\u7B2C\u4E00\u6B21\u8FDC\u884C").setValue(this.data.title).onChange((value) => {
        this.data.title = value.trim();
        this.updateFileNamePreview();
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u65E5\u671F").setDesc("\u683C\u5F0F YYYY-MM-DD\uFF0C\u9ED8\u8BA4\u4ECA\u5929").addText((text) => {
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
    new import_obsidian3.Setting(contentEl).setName("\u6587\u4EF6\u540D").setDesc("\u53EF\u81EA\u5B9A\u4E49\uFF0C\u4E0D\u4F1A\u968F\u6807\u9898\u81EA\u52A8\u53D8\u5316").addText((text) => {
      text.setPlaceholder(this.defaultFileNameBase).setValue(this.data.fileName).onChange((value) => {
        this.data.fileName = value.trim();
        this.updateFileNamePreview();
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u5730\u70B9").setDesc("\u53EF\u7559\u7A7A").addText((text) => {
      text.setPlaceholder("\u4F8B\u5982\uFF1A\u6D77\u8FB9").setValue(this.data.place).onChange((value) => {
        this.data.place = value.trim();
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u4E3B\u8272 (accent)").setDesc("\u6765\u81EA love-linker \u8C03\u8272\u677F\uFF0C\u53EF\u5728\u8BBE\u7F6E\u91CC\u6269\u5C55").addDropdown((dropdown) => {
      const options = this.options.accentOptions;
      if (options.length === 0) {
        dropdown.addOption(this.options.defaultAccent, this.options.defaultAccent);
      }
      options.forEach((option) => dropdown.addOption(option.value, option.label));
      dropdown.setValue(this.data.accent).onChange((value) => {
        this.data.accent = value;
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u5C01\u9762 (cover)").setDesc("\u652F\u6301\u5916\u94FE\uFF0C\u4F8B\u5982 https://your-image-host/cover.svg").addText((text) => {
      text.setPlaceholder("https://...").setValue(this.data.cover).onChange((value) => {
        this.data.cover = value.trim();
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u6458\u8981 (excerpt)").setDesc("\u9996\u9875\u5361\u7247\u6587\u6848\uFF0C\u53EF\u7559\u7A7A").addTextArea((textarea) => {
      textarea.inputEl.rows = 3;
      textarea.setPlaceholder("\u5199\u4E00\u53E5\u7B80\u77ED\u5F15\u8A00").setValue(this.data.excerpt).onChange((value) => {
        this.data.excerpt = value.trim();
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u6807\u7B7E (tags)").setDesc("\u9017\u53F7\u5206\u9694\uFF0C\u4F8B\u5982\uFF1A\u65C5\u9014, \u6F6E\u58F0").addText((text) => {
      text.setPlaceholder("\u65C5\u9014, \u6F6E\u58F0").setValue("").onChange((value) => {
        this.data.tags = parseTagsInput(value);
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u53EF\u89C1\u6027 (visibility)").setDesc("public \u5C06\u51FA\u73B0\u5728\u9996\u9875\uFF0Cprivate \u4F1A\u9ED8\u8BA4\u9690\u85CF").addDropdown((dropdown) => {
      dropdown.addOption("public", "\u516C\u5F00 / public");
      dropdown.addOption("private", "\u79C1\u5BC6 / private");
      dropdown.setValue(this.data.visibility).onChange((value) => {
        this.data.visibility = value;
      });
    });
    this.fileNamePreviewEl = contentEl.createDiv({ cls: "love-linker-muted" });
    this.updateFileNamePreview();
    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const createButton = buttonRow.createEl("button", { text: "\u521B\u5EFA\u6587\u6863" });
    const cancelButton = buttonRow.createEl("button", { text: "\u53D6\u6D88" });
    createButton.addEventListener("click", async () => {
      const result = await this.options.onSubmit(this.data);
      if (result !== false) {
        this.close();
      }
    });
    cancelButton.addEventListener("click", () => this.close());
  }
  updateFileNamePreview() {
    if (!this.fileNamePreviewEl)
      return;
    this.fileNamePreviewEl.setText(`\u6587\u4EF6\u540D\u9884\u89C8\uFF1A${this.resolveFileName()}`);
  }
  resolveFileName() {
    const raw = this.data.fileName.trim() || this.defaultFileNameBase;
    if (raw.endsWith(`.${this.options.defaultExtension}`) || raw.includes(".")) {
      return raw;
    }
    return `${raw}.${this.options.defaultExtension}`;
  }
  buildDefaultFileNameBase(dateValue) {
    const date = isValidDate(dateValue) ? dateValue : formatDate(/* @__PURE__ */ new Date());
    return `${date}-${slugify("milestone")}`;
  }
};
var SlugInputModal = class extends import_obsidian3.Modal {
  constructor(app, options) {
    super(app);
    this.options = options;
    this.forcePrivate = false;
    this.manifestOnly = false;
    this.useCustomFileName = false;
    this.slugValue = options.defaultSlug;
    this.fileNameValue = `${options.defaultSlug}.${options.extension}`;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\u8BBE\u7F6E\u6587\u7AE0 slug" });
    const warningEl = contentEl.createDiv({ cls: "love-linker-muted" });
    const previewEl = contentEl.createDiv({ cls: "love-linker-muted" });
    const updateWarning = () => {
      const isValid = /^[a-z0-9-]+$/.test(this.slugValue);
      warningEl.setText(
        isValid ? "\u5EFA\u8BAE\u4EC5\u4F7F\u7528\u5C0F\u5199\u5B57\u6BCD / \u6570\u5B57 / \u77ED\u6A2A\u7EBF\u3002" : "\u5F53\u524D slug \u5305\u542B\u7279\u6B8A\u5B57\u7B26\uFF0C\u53EF\u80FD\u5BFC\u81F4 URL \u4E0D\u53CB\u597D\u3002"
      );
    };
    const updatePreview = () => {
      previewEl.setText(`\u8FDC\u7AEF\u6587\u4EF6\u540D\u9884\u89C8\uFF1A${this.resolveFileName()}`);
    };
    new import_obsidian3.Setting(contentEl).setName("Slug").setDesc("\u5C06\u7528\u4E8E\u7F51\u7AD9 URL").addText((text) => {
      text.setPlaceholder("\u4F8B\u5982\uFF1Afirst-trip").setValue(this.slugValue).onChange((value) => {
        this.slugValue = value.trim();
        if (!this.useCustomFileName) {
          this.fileNameValue = `${this.slugValue}.${this.options.extension}`;
        }
        updateWarning();
        updatePreview();
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u63A8\u9001\u4E3A private").setDesc("\u4F1A\u5199\u5165\u5F53\u524D\u6587\u4EF6 frontmatter \u7684 visibility").addToggle((toggle) => {
      toggle.setValue(this.forcePrivate).onChange((value) => {
        this.forcePrivate = value;
      });
    });
    new import_obsidian3.Setting(contentEl).setName("\u9AD8\u7EA7\u9009\u9879").setDesc("\u53EF\u81EA\u5B9A\u4E49\u8FDC\u7AEF\u6587\u4EF6\u540D\u6216\u53EA\u66F4\u65B0 manifest").addToggle((toggle) => {
      toggle.setValue(false).onChange((value) => {
        this.useCustomFileName = value;
        advancedContainer.style.display = value ? "block" : "none";
        updatePreview();
      });
    });
    const advancedContainer = contentEl.createDiv({ cls: "love-linker-section" });
    advancedContainer.style.display = "none";
    new import_obsidian3.Setting(advancedContainer).setName("\u81EA\u5B9A\u4E49\u8FDC\u7AEF\u6587\u4EF6\u540D").setDesc("\u4F8B\u5982\uFF1Amy-post.md\uFF0C\u4E0D\u586B\u5219\u4F7F\u7528 slug").addText((text) => {
      text.setPlaceholder(`${this.slugValue}.${this.options.extension}`).setValue(this.fileNameValue).onChange((value) => {
        this.fileNameValue = value.trim();
        updatePreview();
      });
    });
    new import_obsidian3.Setting(advancedContainer).setName("\u4EC5\u66F4\u65B0 manifest").setDesc("\u4E0D\u4E0A\u4F20\u5F53\u524D\u6587\u6863\uFF0C\u4EC5\u66F4\u65B0 slug -> file \u6620\u5C04").addToggle((toggle) => {
      toggle.setValue(this.manifestOnly).onChange((value) => {
        this.manifestOnly = value;
      });
    });
    updateWarning();
    updatePreview();
    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const submitButton = buttonRow.createEl("button", { text: "\u7EE7\u7EED" });
    const cancelButton = buttonRow.createEl("button", { text: "\u53D6\u6D88" });
    submitButton.addEventListener("click", () => {
      if (!this.slugValue.trim()) {
        new import_obsidian3.Notice("slug \u4E0D\u80FD\u4E3A\u7A7A\u3002", 3e3);
        return;
      }
      if (/[\\/]/.test(this.resolveFileName())) {
        new import_obsidian3.Notice("\u6587\u4EF6\u540D\u4E0D\u80FD\u5305\u542B\u659C\u6760\u3002", 3e3);
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
  resolveFileName() {
    if (this.useCustomFileName && this.fileNameValue.trim()) {
      const raw = this.fileNameValue.trim();
      if (raw.endsWith(`.${this.options.extension}`) || raw.includes(".")) {
        return raw;
      }
      return `${raw}.${this.options.extension}`;
    }
    return `${this.slugValue}.${this.options.extension}`;
  }
};
var SlugConflictModal = class extends import_obsidian3.Modal {
  constructor(app, options) {
    super(app);
    this.options = options;
    this.resolved = false;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Slug \u5DF2\u5B58\u5728" });
    contentEl.createEl("p", {
      text: `\u8FDC\u7AEF\u5DF2\u5B58\u5728 slug: ${this.options.slug}\uFF08\u6587\u4EF6\uFF1A${this.options.existingFile}\uFF09\u3002\u8BF7\u9009\u62E9\u5904\u7406\u65B9\u5F0F\u3002`
    });
    const buttonRow = contentEl.createDiv({ cls: "love-linker-row" });
    const overwriteButton = buttonRow.createEl("button", { text: "\u8986\u76D6" });
    const changeButton = buttonRow.createEl("button", { text: "\u6539 slug" });
    const cancelButton = buttonRow.createEl("button", { text: "\u53D6\u6D88" });
    overwriteButton.addEventListener("click", () => this.resolve("overwrite"));
    changeButton.addEventListener("click", () => this.resolve("change"));
    cancelButton.addEventListener("click", () => this.resolve("cancel"));
  }
  onClose() {
    if (!this.resolved) {
      this.options.onResolve("cancel");
    }
  }
  resolve(choice) {
    this.resolved = true;
    this.options.onResolve(choice);
    this.close();
  }
};

// publishView.ts
var import_obsidian4 = require("obsidian");
var VIEW_TYPE = "love-linker-publish-panel";
var PublishPanelView = class extends import_obsidian4.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Love Linker \u53D1\u5E03\u9762\u677F";
  }
  getIcon() {
    return "paper-plane";
  }
  async onOpen() {
    this.render();
  }
  onClose() {
    this.contentEl.empty();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("love-linker-panel");
    const fileSection = contentEl.createDiv({ cls: "love-linker-section" });
    fileSection.createEl("h3", { text: "\u5F53\u524D\u6587\u4EF6" });
    this.fileInfoEl = fileSection.createDiv();
    this.validationEl = fileSection.createDiv({ cls: "love-linker-muted" });
    const fileButtons = fileSection.createDiv({ cls: "love-linker-row" });
    fileButtons.createEl("button", { text: "\u65B0\u5EFA\u6587\u7AE0" }).addEventListener("click", () => {
      this.plugin.openNewArticleModal();
    });
    fileButtons.createEl("button", { text: "\u63A8\u9001/\u66F4\u65B0\u5F53\u524D\u6587\u7AE0" }).addEventListener("click", () => {
      this.plugin.pushCurrentFile({
        progress: (message) => this.setProgress(message)
      });
    });
    const remoteSection = contentEl.createDiv({ cls: "love-linker-section" });
    remoteSection.createEl("h3", { text: "\u8FDC\u7AEF\u72B6\u6001" });
    this.remoteInfoEl = remoteSection.createDiv({ cls: "love-linker-muted" });
    const remoteButtons = remoteSection.createDiv({ cls: "love-linker-row" });
    remoteButtons.createEl("button", { text: "\u6D4B\u8BD5\u8FDE\u63A5" }).addEventListener("click", () => {
      this.plugin.testConnection();
    });
    remoteButtons.createEl("button", { text: "\u8BFB\u53D6 manifest" }).addEventListener("click", () => {
      this.loadManifestPreview();
    });
    this.manifestStatusEl = remoteSection.createDiv({ cls: "love-linker-muted" });
    this.manifestListEl = remoteSection.createEl("ul", { cls: "love-linker-manifest-list" });
    const progressSection = contentEl.createDiv({ cls: "love-linker-section" });
    progressSection.createEl("h3", { text: "\u63A8\u9001/\u66F4\u65B0\u8FDB\u5EA6" });
    this.progressEl = progressSection.createDiv({ cls: "love-linker-status" });
    this.setProgress("\u7B49\u5F85\u64CD\u4F5C");
    this.refresh();
  }
  async refresh() {
    await this.refreshFileStatus();
    this.refreshRemoteInfo();
  }
  async refreshFileStatus() {
    if (!this.fileInfoEl || !this.validationEl)
      return;
    const status = await this.plugin.getActiveFileStatus();
    this.validationEl.removeClass("love-linker-danger");
    if (!status.file) {
      this.fileInfoEl.setText("\u672A\u6253\u5F00 Markdown \u6587\u4EF6");
      this.validationEl.setText("\u6253\u5F00\u6587\u4EF6\u540E\u53EF\u68C0\u67E5 frontmatter\u3002");
      return;
    }
    const fileLine = `${status.file.path}`;
    this.fileInfoEl.setText(`\u5F53\u524D\u6587\u4EF6\uFF1A${fileLine}`);
    if (!status.hasFrontmatter) {
      this.validationEl.setText("\u672A\u68C0\u6D4B\u5230 frontmatter\u3002\u8BF7\u5148\u521B\u5EFA YAML \u5757\u3002");
      this.validationEl.addClass("love-linker-danger");
      return;
    }
    if (status.validation.errors.length > 0) {
      this.validationEl.setText(`\u6821\u9A8C\u5931\u8D25\uFF1A${status.validation.errors.join("\uFF1B")}`);
      this.validationEl.addClass("love-linker-danger");
      return;
    }
    const warnings = status.validation.warnings.length > 0 ? `\uFF08\u63D0\u793A\uFF1A${status.validation.warnings.join("\uFF1B")})` : "";
    const privateNote = status.validation.isPrivate ? "\uFF08\u5F53\u524D\u4E3A private\uFF09" : "";
    this.validationEl.setText(`\u6821\u9A8C\u901A\u8FC7 ${privateNote} ${warnings}`.trim());
    this.validationEl.removeClass("love-linker-danger");
  }
  refreshRemoteInfo() {
    if (!this.remoteInfoEl)
      return;
    const info = this.plugin.getRemoteInfo();
    if (!info.baseUrl) {
      this.remoteInfoEl.setText("\u672A\u914D\u7F6E WebDAV\u3002\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199\u3002");
      this.remoteInfoEl.addClass("love-linker-danger");
      return;
    }
    this.remoteInfoEl.removeClass("love-linker-danger");
    this.remoteInfoEl.setText(`Base URL: ${info.baseUrl} | \u76EE\u5F55: ${info.contentDir}`);
  }
  setProgress(message) {
    if (!this.progressEl)
      return;
    this.progressEl.setText(message);
  }
  async loadManifestPreview() {
    if (!this.manifestListEl || !this.manifestStatusEl)
      return;
    this.manifestStatusEl.setText("\u6B63\u5728\u62C9\u53D6 manifest...");
    this.manifestListEl.empty();
    const result = await this.plugin.fetchManifestPreview();
    if (!result) {
      this.manifestStatusEl.setText("\u8BFB\u53D6\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u8BBE\u7F6E\u4E0E\u7F51\u7EDC\u3002");
      return;
    }
    const items = result.items;
    const limit = result.limit;
    this.manifestStatusEl.setText(`\u5DF2\u8BFB\u53D6\u524D ${Math.min(items.length, limit)} \u6761\uFF1A`);
    items.slice(0, limit).forEach((item) => {
      var _a;
      const li = (_a = this.manifestListEl) == null ? void 0 : _a.createEl("li");
      li == null ? void 0 : li.setText(`${item.slug} \u2192 ${item.file}`);
    });
  }
};

// webdavClient.ts
var import_obsidian5 = require("obsidian");
var WebDavError = class extends Error {
  constructor(message, status) {
    super(message);
    this.name = "WebDavError";
    this.status = status;
  }
};
var normalizeBaseUrl = (value) => value.trim().replace(/\/+$/, "");
var normalizeSegment = (value) => value.trim().replace(/^\/+|\/+$/g, "");
var encodePath = (value) => value.split("/").map((segment) => encodeURIComponent(segment)).join("/");
var encodeUtf8Bytes = (value) => {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value);
  }
  const encoded = encodeURIComponent(value);
  const bytes = [];
  for (let i = 0; i < encoded.length; i += 1) {
    const char = encoded[i];
    if (char === "%") {
      const hex = encoded.slice(i + 1, i + 3);
      bytes.push(parseInt(hex, 16));
      i += 2;
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }
  return new Uint8Array(bytes);
};
var encodeBase64 = (value) => {
  if (typeof btoa === "function") {
    return btoa(
      encodeURIComponent(value).replace(
        /%([0-9A-F]{2})/g,
        (_, hex) => String.fromCharCode(parseInt(hex, 16))
      )
    );
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }
  const bytes = encodeUtf8Bytes(value);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = a << 16 | b << 8 | c;
    output += chars[triple >> 18 & 63];
    output += chars[triple >> 12 & 63];
    output += i + 1 < bytes.length ? chars[triple >> 6 & 63] : "=";
    output += i + 2 < bytes.length ? chars[triple & 63] : "=";
  }
  return output;
};
var WebDavClient = class {
  constructor(getSettings) {
    this.getSettings = getSettings;
  }
  buildUrl(pathParts) {
    const settings = this.getSettings();
    const baseUrl = normalizeBaseUrl(settings.webdavBaseUrl);
    if (!baseUrl)
      throw new WebDavError("\u672A\u914D\u7F6E WEBDAV_BASE_URL\u3002\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199\u3002", 0);
    const path = pathParts.map((part) => normalizeSegment(part)).filter(Boolean).map(encodePath).join("/");
    return `${baseUrl}/${path}`;
  }
  getAuthHeader() {
    const settings = this.getSettings();
    if (!settings.webdavUsername || !settings.webdavPassword) {
      throw new WebDavError("\u672A\u914D\u7F6E WEBDAV_USERNAME \u6216 WEBDAV_PASSWORD\u3002", 0);
    }
    const token = encodeBase64(`${settings.webdavUsername}:${settings.webdavPassword}`);
    return `Basic ${token}`;
  }
  async getText(pathParts) {
    const url = this.buildUrl(pathParts);
    const response = await (0, import_obsidian5.requestUrl)({
      url,
      method: "GET",
      headers: {
        Authorization: this.getAuthHeader()
      }
    });
    if (response.status < 200 || response.status >= 300) {
      throw new WebDavError(`WebDAV \u8BF7\u6C42\u5931\u8D25 (${response.status})`, response.status);
    }
    return response.text;
  }
  async getJson(pathParts) {
    const text = await this.getText(pathParts);
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new WebDavError("\u8FDC\u7AEF\u8FD4\u56DE\u7684 JSON \u89E3\u6790\u5931\u8D25\u3002", 0);
    }
  }
  async checkConnection() {
    const url = this.buildUrl([]);
    const response = await (0, import_obsidian5.requestUrl)({
      url,
      method: "PROPFIND",
      headers: {
        Authorization: this.getAuthHeader(),
        Depth: "0"
      }
    });
    if (response.status < 200 || response.status >= 300) {
      throw new WebDavError(`WebDAV \u8FDE\u63A5\u5931\u8D25 (${response.status})`, response.status);
    }
  }
  async ensureDirectory(pathParts) {
    const url = this.buildUrl(pathParts);
    const authHeader = this.getAuthHeader();
    const existsResponse = await (0, import_obsidian5.requestUrl)({
      url,
      method: "PROPFIND",
      headers: {
        Authorization: authHeader,
        Depth: "0"
      },
      throw: false
    });
    if (existsResponse.status >= 200 && existsResponse.status < 300) {
      return;
    }
    if (existsResponse.status === 401 || existsResponse.status === 403) {
      throw new WebDavError(`WebDAV \u76EE\u5F55\u8BBF\u95EE\u5931\u8D25 (${existsResponse.status})`, existsResponse.status);
    }
    const createResponse = await (0, import_obsidian5.requestUrl)({
      url,
      method: "MKCOL",
      headers: {
        Authorization: authHeader
      },
      throw: false
    });
    if (createResponse.status >= 200 && createResponse.status < 300) {
      return;
    }
    if (createResponse.status === 301 || createResponse.status === 302 || createResponse.status === 307 || createResponse.status === 308 || createResponse.status === 405) {
      return;
    }
    throw new WebDavError(`WebDAV \u76EE\u5F55\u521B\u5EFA\u5931\u8D25 (${createResponse.status})`, createResponse.status);
  }
  async putText(pathParts, text, contentType) {
    const url = this.buildUrl(pathParts);
    const response = await (0, import_obsidian5.requestUrl)({
      url,
      method: "PUT",
      body: text,
      contentType,
      headers: {
        Authorization: this.getAuthHeader()
      }
    });
    if (response.status < 200 || response.status >= 300) {
      throw new WebDavError(`WebDAV \u4E0A\u4F20\u5931\u8D25 (${response.status})`, response.status);
    }
  }
};

// main.ts
var LoveLinkerPublisherPlugin = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.webdav = new WebDavClient(() => this.settings);
    this.addSettingTab(new LoveLinkerSettingTab(this.app, this));
    this.registerView(VIEW_TYPE, (leaf) => {
      this.publishView = new PublishPanelView(leaf, this);
      return this.publishView;
    });
    this.addRibbonIcon("paper-plane", "\u6253\u5F00 Love Linker \u53D1\u5E03\u9762\u677F", () => {
      this.activatePublishView();
    });
    this.addCommand({
      id: "love-linker-open-panel",
      name: "\u6253\u5F00\u53D1\u5E03\u9762\u677F",
      callback: () => this.activatePublishView()
    });
    this.addCommand({
      id: "love-linker-new-article",
      name: "\u65B0\u5EFA\u6587\u7AE0",
      callback: () => this.openNewArticleModal()
    });
    this.addCommand({
      id: "love-linker-push-current",
      name: "\u63A8\u9001/\u66F4\u65B0\u5F53\u524D\u6587\u6863\u5230 WebDAV",
      callback: () => this.pushCurrentFile()
    });
    this.addCommand({
      id: "love-linker-add-frontmatter",
      name: "\u8865\u5168\u5F53\u524D\u6587\u6863 frontmatter",
      callback: () => this.addFrontmatterFieldsToCurrentFile()
    });
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof import_obsidian6.TFile && this.isMarkdownFile(file)) {
          menu.addItem((item) => {
            item.setTitle("\u63A8\u9001/\u66F4\u65B0\u5230 WebDAV").setIcon("paper-plane").onClick(() => this.pushCurrentFile({ file }));
          });
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        var _a;
        (_a = this.publishView) == null ? void 0 : _a.refreshFileStatus();
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        var _a;
        const active = this.app.workspace.getActiveFile();
        if (active && file.path === active.path) {
          (_a = this.publishView) == null ? void 0 : _a.refreshFileStatus();
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
    var _a;
    await this.saveData(this.settings);
    (_a = this.publishView) == null ? void 0 : _a.refreshRemoteInfo();
  }
  getRemoteInfo() {
    return {
      baseUrl: this.settings.webdavBaseUrl.trim(),
      contentDir: this.settings.webdavContentDir.trim() || "milestones"
    };
  }
  async activatePublishView() {
    var _a;
    const leaf = this.app.workspace.getRightLeaf(true);
    if (!leaf) {
      new import_obsidian6.Notice("\u65E0\u6CD5\u6253\u5F00\u4FA7\u8FB9\u680F\uFF0C\u8BF7\u68C0\u67E5\u5DE5\u4F5C\u533A\u5E03\u5C40\u3002", 3e3);
      return;
    }
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
    this.publishView = leaf.view;
    (_a = this.publishView) == null ? void 0 : _a.refresh();
  }
  getAccentOptions() {
    const options = [];
    for (const line of this.settings.accentOptions) {
      const trimmed = line.trim();
      if (!trimmed)
        continue;
      const [value, label] = trimmed.split("|").map((part) => part.trim());
      if (!value)
        continue;
      options.push({ value, label: label || value });
    }
    if (options.length === 0) {
      options.push({ value: this.settings.defaultAccent, label: this.settings.defaultAccent });
    }
    const hasDefault = options.some((option) => option.value === this.settings.defaultAccent);
    if (!hasDefault && this.settings.defaultAccent.trim()) {
      options.unshift({
        value: this.settings.defaultAccent,
        label: `${this.settings.defaultAccent}\uFF08\u9ED8\u8BA4\uFF09`
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
  async createNewArticle(data) {
    var _a;
    const folder = this.settings.localContentFolder.trim() || "milestones";
    const date = isValidDate(data.date) ? data.date : formatDate(/* @__PURE__ */ new Date());
    const fileName = this.resolveNewFileName(data.fileName, date);
    if (!fileName)
      return false;
    const filePath = (0, import_obsidian6.normalizePath)(`${folder}/${fileName}`);
    if (this.app.vault.getAbstractFileByPath(filePath)) {
      new import_obsidian6.Notice("\u6587\u4EF6\u5DF2\u5B58\u5728\uFF0C\u8BF7\u4FEE\u6539\u6587\u4EF6\u540D\u3002", 4e3);
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
    const view = leaf.view instanceof import_obsidian6.MarkdownView ? leaf.view : null;
    if (view) {
      const endLine = getFrontmatterEndLine(content);
      const cursorLine = endLine >= 0 ? endLine + 1 : 0;
      view.editor.setCursor({ line: cursorLine, ch: 0 });
      view.editor.focus();
    }
    new import_obsidian6.Notice("\u5DF2\u521B\u5EFA\u65B0\u6587\u6863\u3002", 3e3);
    (_a = this.publishView) == null ? void 0 : _a.refreshFileStatus();
    return true;
  }
  async pushCurrentFile(options) {
    var _a, _b, _c;
    const progress = (_a = options == null ? void 0 : options.progress) != null ? _a : () => void 0;
    const file = (_b = options == null ? void 0 : options.file) != null ? _b : this.app.workspace.getActiveFile();
    if (!file || !this.isMarkdownFile(file)) {
      new import_obsidian6.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002", 3e3);
      return;
    }
    await this.saveFileIfOpen(file);
    progress("\u6B63\u5728\u89E3\u6790 frontmatter...");
    const raw = await this.app.vault.read(file);
    const parsed = await this.readFrontmatter(file, raw);
    if (!parsed.hasFrontmatter) {
      new import_obsidian6.Notice("\u672A\u68C0\u6D4B\u5230 frontmatter\uFF0C\u8BF7\u5148\u521B\u5EFA YAML \u5757\u3002", 4e3);
      return;
    }
    if (parsed.error || !parsed.data) {
      new import_obsidian6.Notice("frontmatter \u89E3\u6790\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 YAML \u683C\u5F0F\u3002", 4e3);
      return;
    }
    const validation = validateFrontmatter(parsed.data, this.getAccentOptions());
    if (!validation.ok) {
      new import_obsidian6.Notice(`\u6821\u9A8C\u5931\u8D25\uFF1A${validation.errors.join("\uFF1B")}`, 5e3);
      return;
    }
    if (validation.warnings.length > 0) {
      new import_obsidian6.Notice(`\u63D0\u793A\uFF1A${validation.warnings.join("\uFF1B")}`, 4e3);
    }
    if (validation.isPrivate) {
      new import_obsidian6.Notice("\u8BE5\u6587\u7AE0\u4E3A private\uFF0C\u7F51\u7AD9\u53EF\u80FD\u4E0D\u4F1A\u751F\u6210\u6216\u51FA\u73B0\u5728\u9996\u9875\u3002", 5e3);
    }
    const extension = file.extension.toLowerCase() === "md" ? "md" : "mdx";
    let slugResult = await this.promptSlug(
      this.suggestSlug(file, parsed.data),
      extension
    );
    if (!slugResult)
      return;
    if (slugResult.forcePrivate) {
      progress("\u6B63\u5728\u66F4\u65B0 visibility \u4E3A private...");
      await this.updateVisibility(file, "private");
      await this.saveFileIfOpen(file);
    }
    progress("\u6B63\u5728\u786E\u8BA4\u8FDC\u7AEF\u76EE\u5F55...");
    const folderReady = await this.ensureRemoteContentDir();
    if (!folderReady)
      return;
    progress("\u6B63\u5728\u62C9\u53D6 manifest...");
    const manifest = await this.fetchManifest();
    if (!manifest)
      return;
    const resolved = await this.applySlugToManifest(manifest.items, slugResult, extension);
    if (!resolved)
      return;
    slugResult = resolved.slugResult;
    const manifestText = JSON.stringify({ items: resolved.items }, null, 2) + "\n";
    let fileUploaded = false;
    if (!slugResult.manifestOnly) {
      progress("\u6B63\u5728\u4E0A\u4F20\u6587\u6863...");
      try {
        const latest = await this.app.vault.read(file);
        await this.webdav.putText(
          [this.settings.webdavContentDir, slugResult.fileName],
          latest,
          "text/markdown; charset=utf-8"
        );
        fileUploaded = true;
        new import_obsidian6.Notice("\u6587\u6863\u5DF2\u4E0A\u4F20\u3002", 3e3);
      } catch (error) {
        new import_obsidian6.Notice(this.formatWebDavError(error, "\u4E0A\u4F20\u6587\u6863"), 5e3);
        return;
      }
    } else {
      progress("\u5DF2\u8DF3\u8FC7\u6587\u6863\u4E0A\u4F20\uFF08\u4EC5\u66F4\u65B0 manifest\uFF09");
    }
    progress("\u6B63\u5728\u66F4\u65B0 manifest...");
    try {
      await this.webdav.putText(
        [this.settings.webdavContentDir, this.settings.webdavManifestFile],
        manifestText,
        "application/json; charset=utf-8"
      );
      new import_obsidian6.Notice("manifest \u5DF2\u66F4\u65B0\uFF0C\u7F51\u7AD9\u5C06\u5728 ISR \u5468\u671F\u5185\u81EA\u52A8\u5237\u65B0\u3002", 4e3);
    } catch (error) {
      if (fileUploaded) {
        new import_obsidian6.Notice(
          "\u8FDC\u7AEF manifest \u66F4\u65B0\u5931\u8D25\uFF0C\u7F51\u7AD9\u53EF\u80FD\u65E0\u6CD5\u8BBF\u95EE\u8BE5\u6587\u7AE0\u3002\u8BF7\u91CD\u8BD5\u6216\u624B\u52A8\u4FEE\u590D\u3002",
          6e3
        );
      } else {
        new import_obsidian6.Notice(this.formatWebDavError(error, "\u66F4\u65B0 manifest"), 5e3);
      }
      return;
    }
    progress("\u6B63\u5728\u5199\u5165 slug...");
    await this.updateSlug(file, slugResult.slug);
    await this.saveFileIfOpen(file);
    progress("\u63A8\u9001/\u66F4\u65B0\u5B8C\u6210");
    (_c = this.publishView) == null ? void 0 : _c.loadManifestPreview();
  }
  async testConnection() {
    try {
      await this.webdav.checkConnection();
      new import_obsidian6.Notice("\u8FDE\u63A5\u6210\u529F\u3002", 3e3);
      return true;
    } catch (error) {
      new import_obsidian6.Notice(this.formatWebDavError(error, "\u6D4B\u8BD5\u8FDE\u63A5"), 5e3);
      return false;
    }
  }
  async fetchManifestPreview() {
    try {
      const payload = await this.webdav.getJson([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
      const items = this.normalizeManifestItems(payload.items);
      return { items, limit: this.settings.manifestPreviewLimit };
    } catch (error) {
      new import_obsidian6.Notice(this.formatWebDavError(error, "\u8BFB\u53D6 manifest"), 5e3);
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
          errors: ["frontmatter \u89E3\u6790\u5931\u8D25"],
          warnings: [],
          isPrivate: false
        }
      };
    }
    const validation = validateFrontmatter(parsed.data, this.getAccentOptions());
    return { file, hasFrontmatter: true, validation };
  }
  async saveFileIfOpen(file) {
    var _a;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian6.MarkdownView);
    if (((_a = view == null ? void 0 : view.file) == null ? void 0 : _a.path) === file.path) {
      await view.save();
    }
  }
  async readFrontmatter(file, raw) {
    var _a;
    const cached = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
    if (cached && Object.keys(cached).length > 0) {
      return { data: cached, hasFrontmatter: true, error: null };
    }
    const text = raw != null ? raw : await this.app.vault.read(file);
    const parsed = parseFrontmatterBlock(text);
    return { data: parsed.data, hasFrontmatter: parsed.hasFrontmatter, error: parsed.error };
  }
  async ensureFolder(folder) {
    const normalized = (0, import_obsidian6.normalizePath)(folder);
    if (this.app.vault.getAbstractFileByPath(normalized))
      return;
    await this.app.vault.createFolder(normalized);
  }
  isMarkdownFile(file) {
    const ext = file.extension.toLowerCase();
    return ext === "md";
  }
  suggestSlug(file, frontmatter) {
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
  async promptSlug(defaultSlug, extension) {
    return await new Promise((resolve) => {
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
        if (!resolved)
          resolve(null);
      };
      modal.open();
    });
  }
  async promptConflict(slug, existingFile) {
    return await new Promise((resolve) => {
      const modal = new SlugConflictModal(this.app, {
        slug,
        existingFile,
        onResolve: resolve
      });
      modal.open();
    });
  }
  async fetchManifest() {
    try {
      const payload = await this.webdav.getJson([
        this.settings.webdavContentDir,
        this.settings.webdavManifestFile
      ]);
      return { items: this.normalizeManifestItems(payload.items) };
    } catch (error) {
      if (error instanceof WebDavError && error.status === 404) {
        new import_obsidian6.Notice("\u672A\u627E\u5230 manifest.json\uFF0C\u5C06\u5728\u9996\u6B21\u63A8\u9001\u65F6\u81EA\u52A8\u521B\u5EFA\u3002", 4e3);
        return { items: [] };
      }
      new import_obsidian6.Notice(this.formatWebDavError(error, "\u8BFB\u53D6 manifest"), 5e3);
      return null;
    }
  }
  normalizeManifestItems(items) {
    if (!Array.isArray(items))
      return [];
    return items.map((item) => {
      var _a, _b;
      return {
        ...item,
        slug: String((_a = item.slug) != null ? _a : "").trim(),
        file: String((_b = item.file) != null ? _b : "").trim()
      };
    }).filter((item) => item.slug && item.file).sort((a, b) => a.slug.localeCompare(b.slug));
  }
  async applySlugToManifest(items, slugResult, extension) {
    let currentResult = slugResult;
    const workingItems = [...items];
    while (true) {
      const existing = workingItems.find((item) => item.slug === currentResult.slug);
      if (!existing)
        break;
      const choice = await this.promptConflict(currentResult.slug, existing.file);
      if (choice === "cancel")
        return null;
      if (choice === "change") {
        const next = await this.promptSlug(currentResult.slug, extension);
        if (!next)
          return null;
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
  async updateVisibility(file, visibility) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.visibility = visibility;
    });
  }
  async updateSlug(file, slug) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.slug = slug;
    });
  }
  async addFrontmatterFieldsToCurrentFile() {
    var _a;
    const file = this.app.workspace.getActiveFile();
    if (!file || !this.isMarkdownFile(file)) {
      new import_obsidian6.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u3002", 3e3);
      return;
    }
    await this.saveFileIfOpen(file);
    const today = formatDate(/* @__PURE__ */ new Date());
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      var _a2, _b;
      if (frontmatter.title == null)
        frontmatter.title = "";
      if (!isValidDate(String((_a2 = frontmatter.date) != null ? _a2 : "")))
        frontmatter.date = today;
      if (frontmatter.place == null)
        frontmatter.place = "";
      if (frontmatter.accent == null)
        frontmatter.accent = "";
      if (frontmatter.cover == null)
        frontmatter.cover = "";
      if (frontmatter.excerpt == null)
        frontmatter.excerpt = "";
      if (frontmatter.tags == null)
        frontmatter.tags = [];
      if (!String((_b = frontmatter.visibility) != null ? _b : "").trim())
        frontmatter.visibility = "public";
    });
    await this.saveFileIfOpen(file);
    new import_obsidian6.Notice("\u5DF2\u8865\u5168 frontmatter \u5B57\u6BB5\u3002", 3e3);
    (_a = this.publishView) == null ? void 0 : _a.refreshFileStatus();
  }
  resolveNewFileName(raw, date) {
    const trimmed = raw.trim();
    const fallbackBase = `${date}-${slugify("milestone")}`;
    const base = trimmed || fallbackBase;
    if (/[\\/]/.test(base)) {
      new import_obsidian6.Notice("\u6587\u4EF6\u540D\u4E0D\u80FD\u5305\u542B\u659C\u6760\u3002", 3e3);
      return null;
    }
    if (base.endsWith(`.${this.settings.defaultExtension}`) || base.includes(".")) {
      return base;
    }
    return `${base}.${this.settings.defaultExtension}`;
  }
  async ensureRemoteContentDir() {
    try {
      const parts = this.settings.webdavContentDir.split("/").map((part) => part.trim()).filter(Boolean);
      const path = [];
      for (const part of parts) {
        path.push(part);
        await this.webdav.ensureDirectory(path);
      }
      return true;
    } catch (error) {
      new import_obsidian6.Notice(this.formatWebDavError(error, "\u521B\u5EFA\u8FDC\u7AEF\u76EE\u5F55"), 5e3);
      return false;
    }
  }
  formatWebDavError(error, action) {
    if (error instanceof WebDavError) {
      if (error.status === 401 || error.status === 403) {
        return `${action}\u5931\u8D25\uFF1A\u9274\u6743\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7528\u6237\u540D/\u5BC6\u7801\u3002`;
      }
      if (error.status === 404) {
        return `${action}\u5931\u8D25\uFF1A\u8FDC\u7AEF\u8D44\u6E90\u4E0D\u5B58\u5728\u3002`;
      }
      if (error.status) {
        return `${action}\u5931\u8D25\uFF1AHTTP ${error.status}`;
      }
      return `${action}\u5931\u8D25\uFF1A${error.message}`;
    }
    if (error instanceof Error) {
      return `${action}\u5931\u8D25\uFF1A${error.message}`;
    }
    return `${action}\u5931\u8D25\uFF1A\u672A\u77E5\u9519\u8BEF\u3002`;
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzZXR0aW5ncy50cyIsICJ0eXBlcy50cyIsICJmcm9udG1hdHRlci50cyIsICJ2YWxpZGF0aW9uLnRzIiwgIm1vZGFscy50cyIsICJwdWJsaXNoVmlldy50cyIsICJ3ZWJkYXZDbGllbnQudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7XG4gIE1hcmtkb3duVmlldyxcbiAgTm90aWNlLFxuICBQbHVnaW4sXG4gIFRGaWxlLFxuICBub3JtYWxpemVQYXRoXG59IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHsgTG92ZUxpbmtlclNldHRpbmdUYWIgfSBmcm9tIFwiLi9zZXR0aW5nc1wiO1xuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgdHlwZSBBY2NlbnRPcHRpb24sIHR5cGUgTG92ZUxpbmtlclNldHRpbmdzIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7XG4gIGZvcm1hdERhdGUsXG4gIGJ1aWxkRnJvbnRtYXR0ZXJUZW1wbGF0ZSxcbiAgZ2V0RnJvbnRtYXR0ZXJFbmRMaW5lLFxuICBpc1ZhbGlkRGF0ZSxcbiAgcGFyc2VGcm9udG1hdHRlckJsb2NrLFxuICBzbHVnaWZ5LFxuICBzdWdnZXN0U2x1Z0Zyb21GaWxlbmFtZVxufSBmcm9tIFwiLi9mcm9udG1hdHRlclwiO1xuaW1wb3J0IHsgdmFsaWRhdGVGcm9udG1hdHRlciB9IGZyb20gXCIuL3ZhbGlkYXRpb25cIjtcbmltcG9ydCB7XG4gIE5ld0FydGljbGVNb2RhbCxcbiAgU2x1Z0NvbmZsaWN0TW9kYWwsXG4gIFNsdWdJbnB1dE1vZGFsLFxuICB0eXBlIENvbmZsaWN0Q2hvaWNlLFxuICB0eXBlIE5ld0FydGljbGVGb3JtRGF0YSxcbiAgdHlwZSBTbHVnTW9kYWxSZXN1bHRcbn0gZnJvbSBcIi4vbW9kYWxzXCI7XG5pbXBvcnQgeyBQdWJsaXNoUGFuZWxWaWV3LCBWSUVXX1RZUEUgfSBmcm9tIFwiLi9wdWJsaXNoVmlld1wiO1xuaW1wb3J0IHsgV2ViRGF2Q2xpZW50LCBXZWJEYXZFcnJvciB9IGZyb20gXCIuL3dlYmRhdkNsaWVudFwiO1xuaW1wb3J0IHR5cGUgeyBNYW5pZmVzdEl0ZW0sIE1hbmlmZXN0UGF5bG9hZCB9IGZyb20gXCIuL3dlYmRhdlR5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvdmVMaW5rZXJQdWJsaXNoZXJQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogTG92ZUxpbmtlclNldHRpbmdzID0gREVGQVVMVF9TRVRUSU5HUztcbiAgcHJpdmF0ZSB3ZWJkYXYhOiBXZWJEYXZDbGllbnQ7XG4gIHByaXZhdGUgcHVibGlzaFZpZXc/OiBQdWJsaXNoUGFuZWxWaWV3O1xuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuICAgIHRoaXMud2ViZGF2ID0gbmV3IFdlYkRhdkNsaWVudCgoKSA9PiB0aGlzLnNldHRpbmdzKTtcblxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgTG92ZUxpbmtlclNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRSwgKGxlYWYpID0+IHtcbiAgICAgIHRoaXMucHVibGlzaFZpZXcgPSBuZXcgUHVibGlzaFBhbmVsVmlldyhsZWFmLCB0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzLnB1Ymxpc2hWaWV3O1xuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKFwicGFwZXItcGxhbmVcIiwgXCJcdTYyNTNcdTVGMDAgTG92ZSBMaW5rZXIgXHU1M0QxXHU1RTAzXHU5NzYyXHU2NzdGXCIsICgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGVQdWJsaXNoVmlldygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcImxvdmUtbGlua2VyLW9wZW4tcGFuZWxcIixcbiAgICAgIG5hbWU6IFwiXHU2MjUzXHU1RjAwXHU1M0QxXHU1RTAzXHU5NzYyXHU2NzdGXCIsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5hY3RpdmF0ZVB1Ymxpc2hWaWV3KClcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogXCJsb3ZlLWxpbmtlci1uZXctYXJ0aWNsZVwiLFxuICAgICAgbmFtZTogXCJcdTY1QjBcdTVFRkFcdTY1ODdcdTdBRTBcIixcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLm9wZW5OZXdBcnRpY2xlTW9kYWwoKVxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcImxvdmUtbGlua2VyLXB1c2gtY3VycmVudFwiLFxuICAgICAgbmFtZTogXCJcdTYzQThcdTkwMDEvXHU2NkY0XHU2NUIwXHU1RjUzXHU1MjREXHU2NTg3XHU2ODYzXHU1MjMwIFdlYkRBVlwiLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMucHVzaEN1cnJlbnRGaWxlKClcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogXCJsb3ZlLWxpbmtlci1hZGQtZnJvbnRtYXR0ZXJcIixcbiAgICAgIG5hbWU6IFwiXHU4ODY1XHU1MTY4XHU1RjUzXHU1MjREXHU2NTg3XHU2ODYzIGZyb250bWF0dGVyXCIsXG4gICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5hZGRGcm9udG1hdHRlckZpZWxkc1RvQ3VycmVudEZpbGUoKVxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKFwiZmlsZS1tZW51XCIsIChtZW51LCBmaWxlKSA9PiB7XG4gICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUgJiYgdGhpcy5pc01hcmtkb3duRmlsZShmaWxlKSkge1xuICAgICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgaXRlbVxuICAgICAgICAgICAgICAuc2V0VGl0bGUoXCJcdTYzQThcdTkwMDEvXHU2NkY0XHU2NUIwXHU1MjMwIFdlYkRBVlwiKVxuICAgICAgICAgICAgICAuc2V0SWNvbihcInBhcGVyLXBsYW5lXCIpXG4gICAgICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHRoaXMucHVzaEN1cnJlbnRGaWxlKHsgZmlsZSB9KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbihcImFjdGl2ZS1sZWFmLWNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucHVibGlzaFZpZXc/LnJlZnJlc2hGaWxlU3RhdHVzKCk7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXG4gICAgICB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLm9uKFwiY2hhbmdlZFwiLCAoZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCBhY3RpdmUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgICBpZiAoYWN0aXZlICYmIGZpbGUucGF0aCA9PT0gYWN0aXZlLnBhdGgpIHtcbiAgICAgICAgICB0aGlzLnB1Ymxpc2hWaWV3Py5yZWZyZXNoRmlsZVN0YXR1cygpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBvbnVubG9hZCgpIHtcbiAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZGV0YWNoTGVhdmVzT2ZUeXBlKFZJRVdfVFlQRSk7XG4gIH1cblxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuZGVmYXVsdEV4dGVuc2lvbiAhPT0gXCJtZFwiKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLmRlZmF1bHRFeHRlbnNpb24gPSBcIm1kXCI7XG4gICAgfVxuICAgIGlmICh0aGlzLnNldHRpbmdzLmRlZmF1bHRDb3ZlclVybCA9PT0gXCJodHRwczovL3lvdXItaW1hZ2UtaG9zdC9jb3Zlci5zdmdcIikge1xuICAgICAgdGhpcy5zZXR0aW5ncy5kZWZhdWx0Q292ZXJVcmwgPSBcIlwiO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICAgIHRoaXMucHVibGlzaFZpZXc/LnJlZnJlc2hSZW1vdGVJbmZvKCk7XG4gIH1cblxuICBnZXRSZW1vdGVJbmZvKCkge1xuICAgIHJldHVybiB7XG4gICAgICBiYXNlVXJsOiB0aGlzLnNldHRpbmdzLndlYmRhdkJhc2VVcmwudHJpbSgpLFxuICAgICAgY29udGVudERpcjogdGhpcy5zZXR0aW5ncy53ZWJkYXZDb250ZW50RGlyLnRyaW0oKSB8fCBcIm1pbGVzdG9uZXNcIlxuICAgIH07XG4gIH1cblxuICBhc3luYyBhY3RpdmF0ZVB1Ymxpc2hWaWV3KCkge1xuICAgIGNvbnN0IGxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0UmlnaHRMZWFmKHRydWUpO1xuICAgIGlmICghbGVhZikge1xuICAgICAgbmV3IE5vdGljZShcIlx1NjVFMFx1NkNENVx1NjI1M1x1NUYwMFx1NEZBN1x1OEZCOVx1NjgwRlx1RkYwQ1x1OEJGN1x1NjhDMFx1NjdFNVx1NURFNVx1NEY1Q1x1NTMzQVx1NUUwM1x1NUM0MFx1MzAwMlwiLCAzMDAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoeyB0eXBlOiBWSUVXX1RZUEUsIGFjdGl2ZTogdHJ1ZSB9KTtcbiAgICB0aGlzLmFwcC53b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWFmKTtcbiAgICB0aGlzLnB1Ymxpc2hWaWV3ID0gbGVhZi52aWV3IGFzIFB1Ymxpc2hQYW5lbFZpZXc7XG4gICAgdGhpcy5wdWJsaXNoVmlldz8ucmVmcmVzaCgpO1xuICB9XG5cbiAgZ2V0QWNjZW50T3B0aW9ucygpOiBBY2NlbnRPcHRpb25bXSB7XG4gICAgY29uc3Qgb3B0aW9uczogQWNjZW50T3B0aW9uW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgdGhpcy5zZXR0aW5ncy5hY2NlbnRPcHRpb25zKSB7XG4gICAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gICAgICBpZiAoIXRyaW1tZWQpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgW3ZhbHVlLCBsYWJlbF0gPSB0cmltbWVkLnNwbGl0KFwifFwiKS5tYXAoKHBhcnQpID0+IHBhcnQudHJpbSgpKTtcbiAgICAgIGlmICghdmFsdWUpIGNvbnRpbnVlO1xuICAgICAgb3B0aW9ucy5wdXNoKHsgdmFsdWUsIGxhYmVsOiBsYWJlbCB8fCB2YWx1ZSB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIG9wdGlvbnMucHVzaCh7IHZhbHVlOiB0aGlzLnNldHRpbmdzLmRlZmF1bHRBY2NlbnQsIGxhYmVsOiB0aGlzLnNldHRpbmdzLmRlZmF1bHRBY2NlbnQgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzRGVmYXVsdCA9IG9wdGlvbnMuc29tZSgob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IHRoaXMuc2V0dGluZ3MuZGVmYXVsdEFjY2VudCk7XG4gICAgaWYgKCFoYXNEZWZhdWx0ICYmIHRoaXMuc2V0dGluZ3MuZGVmYXVsdEFjY2VudC50cmltKCkpIHtcbiAgICAgIG9wdGlvbnMudW5zaGlmdCh7XG4gICAgICAgIHZhbHVlOiB0aGlzLnNldHRpbmdzLmRlZmF1bHRBY2NlbnQsXG4gICAgICAgIGxhYmVsOiBgJHt0aGlzLnNldHRpbmdzLmRlZmF1bHRBY2NlbnR9XHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjA5YFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH1cblxuICBhc3luYyBvcGVuTmV3QXJ0aWNsZU1vZGFsKCkge1xuICAgIGNvbnN0IG1vZGFsID0gbmV3IE5ld0FydGljbGVNb2RhbCh0aGlzLmFwcCwge1xuICAgICAgYWNjZW50T3B0aW9uczogdGhpcy5nZXRBY2NlbnRPcHRpb25zKCksXG4gICAgICBkZWZhdWx0QWNjZW50OiB0aGlzLnNldHRpbmdzLmRlZmF1bHRBY2NlbnQsXG4gICAgICBkZWZhdWx0Q292ZXI6IHRoaXMuc2V0dGluZ3MuZGVmYXVsdENvdmVyVXJsLFxuICAgICAgZGVmYXVsdEV4dGVuc2lvbjogdGhpcy5zZXR0aW5ncy5kZWZhdWx0RXh0ZW5zaW9uLFxuICAgICAgb25TdWJtaXQ6IGFzeW5jIChkYXRhKSA9PiB0aGlzLmNyZWF0ZU5ld0FydGljbGUoZGF0YSlcbiAgICB9KTtcbiAgICBtb2RhbC5vcGVuKCk7XG4gIH1cblxuICBhc3luYyBjcmVhdGVOZXdBcnRpY2xlKGRhdGE6IE5ld0FydGljbGVGb3JtRGF0YSkge1xuICAgIGNvbnN0IGZvbGRlciA9IHRoaXMuc2V0dGluZ3MubG9jYWxDb250ZW50Rm9sZGVyLnRyaW0oKSB8fCBcIm1pbGVzdG9uZXNcIjtcbiAgICBjb25zdCBkYXRlID0gaXNWYWxpZERhdGUoZGF0YS5kYXRlKSA/IGRhdGEuZGF0ZSA6IGZvcm1hdERhdGUobmV3IERhdGUoKSk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSB0aGlzLnJlc29sdmVOZXdGaWxlTmFtZShkYXRhLmZpbGVOYW1lLCBkYXRlKTtcbiAgICBpZiAoIWZpbGVOYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgZmlsZVBhdGggPSBub3JtYWxpemVQYXRoKGAke2ZvbGRlcn0vJHtmaWxlTmFtZX1gKTtcblxuICAgIGlmICh0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZmlsZVBhdGgpKSB7XG4gICAgICBuZXcgTm90aWNlKFwiXHU2NTg3XHU0RUY2XHU1REYyXHU1QjU4XHU1NzI4XHVGRjBDXHU4QkY3XHU0RkVFXHU2NTM5XHU2NTg3XHU0RUY2XHU1NDBEXHUzMDAyXCIsIDQwMDApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuZW5zdXJlRm9sZGVyKGZvbGRlcik7XG5cbiAgICBjb25zdCBjb250ZW50ID0gYnVpbGRGcm9udG1hdHRlclRlbXBsYXRlKHtcbiAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgICAgZGF0ZSxcbiAgICAgIHBsYWNlOiBkYXRhLnBsYWNlLFxuICAgICAgYWNjZW50OiBkYXRhLmFjY2VudCxcbiAgICAgIGNvdmVyOiBkYXRhLmNvdmVyIHx8IHRoaXMuc2V0dGluZ3MuZGVmYXVsdENvdmVyVXJsLFxuICAgICAgZXhjZXJwdDogZGF0YS5leGNlcnB0LFxuICAgICAgdGFnczogZGF0YS50YWdzLFxuICAgICAgdmlzaWJpbGl0eTogZGF0YS52aXNpYmlsaXR5XG4gICAgfSk7XG5cbiAgICBjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKGZpbGVQYXRoLCBjb250ZW50KTtcbiAgICBjb25zdCBsZWFmID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYodHJ1ZSk7XG4gICAgYXdhaXQgbGVhZi5vcGVuRmlsZShmaWxlLCB7IGFjdGl2ZTogdHJ1ZSB9KTtcblxuICAgIGNvbnN0IHZpZXcgPSBsZWFmLnZpZXcgaW5zdGFuY2VvZiBNYXJrZG93blZpZXcgPyBsZWFmLnZpZXcgOiBudWxsO1xuICAgIGlmICh2aWV3KSB7XG4gICAgICBjb25zdCBlbmRMaW5lID0gZ2V0RnJvbnRtYXR0ZXJFbmRMaW5lKGNvbnRlbnQpO1xuICAgICAgY29uc3QgY3Vyc29yTGluZSA9IGVuZExpbmUgPj0gMCA/IGVuZExpbmUgKyAxIDogMDtcbiAgICAgIHZpZXcuZWRpdG9yLnNldEN1cnNvcih7IGxpbmU6IGN1cnNvckxpbmUsIGNoOiAwIH0pO1xuICAgICAgdmlldy5lZGl0b3IuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBuZXcgTm90aWNlKFwiXHU1REYyXHU1MjFCXHU1RUZBXHU2NUIwXHU2NTg3XHU2ODYzXHUzMDAyXCIsIDMwMDApO1xuICAgIHRoaXMucHVibGlzaFZpZXc/LnJlZnJlc2hGaWxlU3RhdHVzKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBwdXNoQ3VycmVudEZpbGUob3B0aW9ucz86IHsgZmlsZT86IFRGaWxlOyBwcm9ncmVzcz86IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQgfSkge1xuICAgIGNvbnN0IHByb2dyZXNzID0gb3B0aW9ucz8ucHJvZ3Jlc3MgPz8gKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgY29uc3QgZmlsZSA9IG9wdGlvbnM/LmZpbGUgPz8gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcblxuICAgIGlmICghZmlsZSB8fCAhdGhpcy5pc01hcmtkb3duRmlsZShmaWxlKSkge1xuICAgICAgbmV3IE5vdGljZShcIlx1OEJGN1x1NTE0OFx1NjI1M1x1NUYwMFx1NEUwMFx1NEUyQSBNYXJrZG93biBcdTY1ODdcdTRFRjZcdTMwMDJcIiwgMzAwMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5zYXZlRmlsZUlmT3BlbihmaWxlKTtcblxuICAgIHByb2dyZXNzKFwiXHU2QjYzXHU1NzI4XHU4OUUzXHU2NzkwIGZyb250bWF0dGVyLi4uXCIpO1xuICAgIGNvbnN0IHJhdyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgY29uc3QgcGFyc2VkID0gYXdhaXQgdGhpcy5yZWFkRnJvbnRtYXR0ZXIoZmlsZSwgcmF3KTtcbiAgICBpZiAoIXBhcnNlZC5oYXNGcm9udG1hdHRlcikge1xuICAgICAgbmV3IE5vdGljZShcIlx1NjcyQVx1NjhDMFx1NkQ0Qlx1NTIzMCBmcm9udG1hdHRlclx1RkYwQ1x1OEJGN1x1NTE0OFx1NTIxQlx1NUVGQSBZQU1MIFx1NTc1N1x1MzAwMlwiLCA0MDAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHBhcnNlZC5lcnJvciB8fCAhcGFyc2VkLmRhdGEpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJmcm9udG1hdHRlciBcdTg5RTNcdTY3OTBcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTY4QzBcdTY3RTUgWUFNTCBcdTY4M0NcdTVGMEZcdTMwMDJcIiwgNDAwMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRnJvbnRtYXR0ZXIocGFyc2VkLmRhdGEsIHRoaXMuZ2V0QWNjZW50T3B0aW9ucygpKTtcbiAgICBpZiAoIXZhbGlkYXRpb24ub2spIHtcbiAgICAgIG5ldyBOb3RpY2UoYFx1NjgyMVx1OUE4Q1x1NTkzMVx1OEQyNVx1RkYxQSR7dmFsaWRhdGlvbi5lcnJvcnMuam9pbihcIlx1RkYxQlwiKX1gLCA1MDAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHZhbGlkYXRpb24ud2FybmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgbmV3IE5vdGljZShgXHU2M0QwXHU3OTNBXHVGRjFBJHt2YWxpZGF0aW9uLndhcm5pbmdzLmpvaW4oXCJcdUZGMUJcIil9YCwgNDAwMCk7XG4gICAgfVxuICAgIGlmICh2YWxpZGF0aW9uLmlzUHJpdmF0ZSkge1xuICAgICAgbmV3IE5vdGljZShcIlx1OEJFNVx1NjU4N1x1N0FFMFx1NEUzQSBwcml2YXRlXHVGRjBDXHU3RjUxXHU3QUQ5XHU1M0VGXHU4MEZEXHU0RTBEXHU0RjFBXHU3NTFGXHU2MjEwXHU2MjE2XHU1MUZBXHU3M0IwXHU1NzI4XHU5OTk2XHU5ODc1XHUzMDAyXCIsIDUwMDApO1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGZpbGUuZXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgPT09IFwibWRcIiA/IFwibWRcIiA6IFwibWR4XCI7XG4gICAgbGV0IHNsdWdSZXN1bHQgPSBhd2FpdCB0aGlzLnByb21wdFNsdWcoXG4gICAgICB0aGlzLnN1Z2dlc3RTbHVnKGZpbGUsIHBhcnNlZC5kYXRhKSxcbiAgICAgIGV4dGVuc2lvblxuICAgICk7XG4gICAgaWYgKCFzbHVnUmVzdWx0KSByZXR1cm47XG5cbiAgICBpZiAoc2x1Z1Jlc3VsdC5mb3JjZVByaXZhdGUpIHtcbiAgICAgIHByb2dyZXNzKFwiXHU2QjYzXHU1NzI4XHU2NkY0XHU2NUIwIHZpc2liaWxpdHkgXHU0RTNBIHByaXZhdGUuLi5cIik7XG4gICAgICBhd2FpdCB0aGlzLnVwZGF0ZVZpc2liaWxpdHkoZmlsZSwgXCJwcml2YXRlXCIpO1xuICAgICAgYXdhaXQgdGhpcy5zYXZlRmlsZUlmT3BlbihmaWxlKTtcbiAgICB9XG5cbiAgICBwcm9ncmVzcyhcIlx1NkI2M1x1NTcyOFx1Nzg2RVx1OEJBNFx1OEZEQ1x1N0FFRlx1NzZFRVx1NUY1NS4uLlwiKTtcbiAgICBjb25zdCBmb2xkZXJSZWFkeSA9IGF3YWl0IHRoaXMuZW5zdXJlUmVtb3RlQ29udGVudERpcigpO1xuICAgIGlmICghZm9sZGVyUmVhZHkpIHJldHVybjtcblxuICAgIHByb2dyZXNzKFwiXHU2QjYzXHU1NzI4XHU2MkM5XHU1M0Q2IG1hbmlmZXN0Li4uXCIpO1xuICAgIGNvbnN0IG1hbmlmZXN0ID0gYXdhaXQgdGhpcy5mZXRjaE1hbmlmZXN0KCk7XG4gICAgaWYgKCFtYW5pZmVzdCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcmVzb2x2ZWQgPSBhd2FpdCB0aGlzLmFwcGx5U2x1Z1RvTWFuaWZlc3QobWFuaWZlc3QuaXRlbXMsIHNsdWdSZXN1bHQsIGV4dGVuc2lvbik7XG4gICAgaWYgKCFyZXNvbHZlZCkgcmV0dXJuO1xuXG4gICAgc2x1Z1Jlc3VsdCA9IHJlc29sdmVkLnNsdWdSZXN1bHQ7XG4gICAgY29uc3QgbWFuaWZlc3RUZXh0ID0gSlNPTi5zdHJpbmdpZnkoeyBpdGVtczogcmVzb2x2ZWQuaXRlbXMgfSwgbnVsbCwgMikgKyBcIlxcblwiO1xuXG4gICAgbGV0IGZpbGVVcGxvYWRlZCA9IGZhbHNlO1xuXG4gICAgaWYgKCFzbHVnUmVzdWx0Lm1hbmlmZXN0T25seSkge1xuICAgICAgcHJvZ3Jlc3MoXCJcdTZCNjNcdTU3MjhcdTRFMEFcdTRGMjBcdTY1ODdcdTY4NjMuLi5cIik7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBsYXRlc3QgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgICBhd2FpdCB0aGlzLndlYmRhdi5wdXRUZXh0KFxuICAgICAgICAgIFt0aGlzLnNldHRpbmdzLndlYmRhdkNvbnRlbnREaXIsIHNsdWdSZXN1bHQuZmlsZU5hbWVdLFxuICAgICAgICAgIGxhdGVzdCxcbiAgICAgICAgICBcInRleHQvbWFya2Rvd247IGNoYXJzZXQ9dXRmLThcIlxuICAgICAgICApO1xuICAgICAgICBmaWxlVXBsb2FkZWQgPSB0cnVlO1xuICAgICAgICBuZXcgTm90aWNlKFwiXHU2NTg3XHU2ODYzXHU1REYyXHU0RTBBXHU0RjIwXHUzMDAyXCIsIDMwMDApO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbmV3IE5vdGljZSh0aGlzLmZvcm1hdFdlYkRhdkVycm9yKGVycm9yLCBcIlx1NEUwQVx1NEYyMFx1NjU4N1x1Njg2M1wiKSwgNTAwMCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcHJvZ3Jlc3MoXCJcdTVERjJcdThERjNcdThGQzdcdTY1ODdcdTY4NjNcdTRFMEFcdTRGMjBcdUZGMDhcdTRFQzVcdTY2RjRcdTY1QjAgbWFuaWZlc3RcdUZGMDlcIik7XG4gICAgfVxuXG4gICAgcHJvZ3Jlc3MoXCJcdTZCNjNcdTU3MjhcdTY2RjRcdTY1QjAgbWFuaWZlc3QuLi5cIik7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMud2ViZGF2LnB1dFRleHQoXG4gICAgICAgIFt0aGlzLnNldHRpbmdzLndlYmRhdkNvbnRlbnREaXIsIHRoaXMuc2V0dGluZ3Mud2ViZGF2TWFuaWZlc3RGaWxlXSxcbiAgICAgICAgbWFuaWZlc3RUZXh0LFxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIlxuICAgICAgKTtcbiAgICAgIG5ldyBOb3RpY2UoXCJtYW5pZmVzdCBcdTVERjJcdTY2RjRcdTY1QjBcdUZGMENcdTdGNTFcdTdBRDlcdTVDMDZcdTU3MjggSVNSIFx1NTQ2OFx1NjcxRlx1NTE4NVx1ODFFQVx1NTJBOFx1NTIzN1x1NjVCMFx1MzAwMlwiLCA0MDAwKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGZpbGVVcGxvYWRlZCkge1xuICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgIFwiXHU4RkRDXHU3QUVGIG1hbmlmZXN0IFx1NjZGNFx1NjVCMFx1NTkzMVx1OEQyNVx1RkYwQ1x1N0Y1MVx1N0FEOVx1NTNFRlx1ODBGRFx1NjVFMFx1NkNENVx1OEJCRlx1OTVFRVx1OEJFNVx1NjU4N1x1N0FFMFx1MzAwMlx1OEJGN1x1OTFDRFx1OEJENVx1NjIxNlx1NjI0Qlx1NTJBOFx1NEZFRVx1NTkwRFx1MzAwMlwiLFxuICAgICAgICAgIDYwMDBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ldyBOb3RpY2UodGhpcy5mb3JtYXRXZWJEYXZFcnJvcihlcnJvciwgXCJcdTY2RjRcdTY1QjAgbWFuaWZlc3RcIiksIDUwMDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHByb2dyZXNzKFwiXHU2QjYzXHU1NzI4XHU1MTk5XHU1MTY1IHNsdWcuLi5cIik7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVTbHVnKGZpbGUsIHNsdWdSZXN1bHQuc2x1Zyk7XG4gICAgYXdhaXQgdGhpcy5zYXZlRmlsZUlmT3BlbihmaWxlKTtcblxuICAgIHByb2dyZXNzKFwiXHU2M0E4XHU5MDAxL1x1NjZGNFx1NjVCMFx1NUI4Q1x1NjIxMFwiKTtcbiAgICB0aGlzLnB1Ymxpc2hWaWV3Py5sb2FkTWFuaWZlc3RQcmV2aWV3KCk7XG4gIH1cblxuICBhc3luYyB0ZXN0Q29ubmVjdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy53ZWJkYXYuY2hlY2tDb25uZWN0aW9uKCk7XG4gICAgICBuZXcgTm90aWNlKFwiXHU4RkRFXHU2M0E1XHU2MjEwXHU1MjlGXHUzMDAyXCIsIDMwMDApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5ldyBOb3RpY2UodGhpcy5mb3JtYXRXZWJEYXZFcnJvcihlcnJvciwgXCJcdTZENEJcdThCRDVcdThGREVcdTYzQTVcIiksIDUwMDApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZldGNoTWFuaWZlc3RQcmV2aWV3KCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy53ZWJkYXYuZ2V0SnNvbjxNYW5pZmVzdFBheWxvYWQ+KFtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy53ZWJkYXZDb250ZW50RGlyLFxuICAgICAgICB0aGlzLnNldHRpbmdzLndlYmRhdk1hbmlmZXN0RmlsZVxuICAgICAgXSk7XG4gICAgICBjb25zdCBpdGVtcyA9IHRoaXMubm9ybWFsaXplTWFuaWZlc3RJdGVtcyhwYXlsb2FkLml0ZW1zKTtcbiAgICAgIHJldHVybiB7IGl0ZW1zLCBsaW1pdDogdGhpcy5zZXR0aW5ncy5tYW5pZmVzdFByZXZpZXdMaW1pdCB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBuZXcgTm90aWNlKHRoaXMuZm9ybWF0V2ViRGF2RXJyb3IoZXJyb3IsIFwiXHU4QkZCXHU1M0Q2IG1hbmlmZXN0XCIpLCA1MDAwKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEFjdGl2ZUZpbGVTdGF0dXMoKSB7XG4gICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFmaWxlIHx8ICF0aGlzLmlzTWFya2Rvd25GaWxlKGZpbGUpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWxlOiBudWxsLFxuICAgICAgICBoYXNGcm9udG1hdHRlcjogZmFsc2UsXG4gICAgICAgIHZhbGlkYXRpb246IHsgb2s6IGZhbHNlLCBlcnJvcnM6IFtdLCB3YXJuaW5nczogW10sIGlzUHJpdmF0ZTogZmFsc2UgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZWQgPSBhd2FpdCB0aGlzLnJlYWRGcm9udG1hdHRlcihmaWxlKTtcbiAgICBpZiAoIXBhcnNlZC5oYXNGcm9udG1hdHRlcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsZSxcbiAgICAgICAgaGFzRnJvbnRtYXR0ZXI6IGZhbHNlLFxuICAgICAgICB2YWxpZGF0aW9uOiB7IG9rOiBmYWxzZSwgZXJyb3JzOiBbXSwgd2FybmluZ3M6IFtdLCBpc1ByaXZhdGU6IGZhbHNlIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHBhcnNlZC5lcnJvciB8fCAhcGFyc2VkLmRhdGEpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIGhhc0Zyb250bWF0dGVyOiB0cnVlLFxuICAgICAgICB2YWxpZGF0aW9uOiB7XG4gICAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICAgIGVycm9yczogW1wiZnJvbnRtYXR0ZXIgXHU4OUUzXHU2NzkwXHU1OTMxXHU4RDI1XCJdLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgICBpc1ByaXZhdGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRnJvbnRtYXR0ZXIocGFyc2VkLmRhdGEsIHRoaXMuZ2V0QWNjZW50T3B0aW9ucygpKTtcbiAgICByZXR1cm4geyBmaWxlLCBoYXNGcm9udG1hdHRlcjogdHJ1ZSwgdmFsaWRhdGlvbiB9O1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzYXZlRmlsZUlmT3BlbihmaWxlOiBURmlsZSkge1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgIGlmICh2aWV3Py5maWxlPy5wYXRoID09PSBmaWxlLnBhdGgpIHtcbiAgICAgIGF3YWl0IHZpZXcuc2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVhZEZyb250bWF0dGVyKGZpbGU6IFRGaWxlLCByYXc/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKT8uZnJvbnRtYXR0ZXI7XG4gICAgaWYgKGNhY2hlZCAmJiBPYmplY3Qua2V5cyhjYWNoZWQpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB7IGRhdGE6IGNhY2hlZCwgaGFzRnJvbnRtYXR0ZXI6IHRydWUsIGVycm9yOiBudWxsIGFzIHVua25vd24gfTtcbiAgICB9XG4gICAgY29uc3QgdGV4dCA9IHJhdyA/PyAoYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKSk7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VGcm9udG1hdHRlckJsb2NrKHRleHQpO1xuICAgIHJldHVybiB7IGRhdGE6IHBhcnNlZC5kYXRhLCBoYXNGcm9udG1hdHRlcjogcGFyc2VkLmhhc0Zyb250bWF0dGVyLCBlcnJvcjogcGFyc2VkLmVycm9yIH07XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUZvbGRlcihmb2xkZXI6IHN0cmluZykge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVQYXRoKGZvbGRlcik7XG4gICAgaWYgKHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChub3JtYWxpemVkKSkgcmV0dXJuO1xuICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihub3JtYWxpemVkKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNNYXJrZG93bkZpbGUoZmlsZTogVEZpbGUpIHtcbiAgICBjb25zdCBleHQgPSBmaWxlLmV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBleHQgPT09IFwibWRcIjtcbiAgfVxuXG4gIHByaXZhdGUgc3VnZ2VzdFNsdWcoZmlsZTogVEZpbGUsIGZyb250bWF0dGVyOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuICAgIGNvbnN0IGZyb250bWF0dGVyU2x1ZyA9IGZyb250bWF0dGVyLnNsdWcgPyBTdHJpbmcoZnJvbnRtYXR0ZXIuc2x1ZykudHJpbSgpIDogXCJcIjtcbiAgICBpZiAoZnJvbnRtYXR0ZXJTbHVnKSB7XG4gICAgICByZXR1cm4gZnJvbnRtYXR0ZXJTbHVnO1xuICAgIH1cbiAgICBjb25zdCBiYXNlID0gc3VnZ2VzdFNsdWdGcm9tRmlsZW5hbWUoZmlsZS5iYXNlbmFtZSk7XG4gICAgaWYgKGJhc2UgJiYgYmFzZSAhPT0gZmlsZS5iYXNlbmFtZSkge1xuICAgICAgcmV0dXJuIHNsdWdpZnkoYmFzZSk7XG4gICAgfVxuICAgIGNvbnN0IHRpdGxlID0gZnJvbnRtYXR0ZXIudGl0bGUgPyBTdHJpbmcoZnJvbnRtYXR0ZXIudGl0bGUpIDogXCJcIjtcbiAgICByZXR1cm4gc2x1Z2lmeSh0aXRsZSB8fCBiYXNlKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcHJvbXB0U2x1ZyhkZWZhdWx0U2x1Zzogc3RyaW5nLCBleHRlbnNpb246IFwibWRcIiB8IFwibWR4XCIpIHtcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2U8U2x1Z01vZGFsUmVzdWx0IHwgbnVsbD4oKHJlc29sdmUpID0+IHtcbiAgICAgIGxldCByZXNvbHZlZCA9IGZhbHNlO1xuICAgICAgY29uc3QgbW9kYWwgPSBuZXcgU2x1Z0lucHV0TW9kYWwodGhpcy5hcHAsIHtcbiAgICAgICAgZGVmYXVsdFNsdWcsXG4gICAgICAgIGV4dGVuc2lvbixcbiAgICAgICAgb25TdWJtaXQ6IChyZXN1bHQpID0+IHtcbiAgICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG1vZGFsLm9uQ2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghcmVzb2x2ZWQpIHJlc29sdmUobnVsbCk7XG4gICAgICB9O1xuICAgICAgbW9kYWwub3BlbigpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwcm9tcHRDb25mbGljdChzbHVnOiBzdHJpbmcsIGV4aXN0aW5nRmlsZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlPENvbmZsaWN0Q2hvaWNlPigocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgbW9kYWwgPSBuZXcgU2x1Z0NvbmZsaWN0TW9kYWwodGhpcy5hcHAsIHtcbiAgICAgICAgc2x1ZyxcbiAgICAgICAgZXhpc3RpbmdGaWxlLFxuICAgICAgICBvblJlc29sdmU6IHJlc29sdmVcbiAgICAgIH0pO1xuICAgICAgbW9kYWwub3BlbigpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmZXRjaE1hbmlmZXN0KCk6IFByb21pc2U8TWFuaWZlc3RQYXlsb2FkIHwgbnVsbD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy53ZWJkYXYuZ2V0SnNvbjxNYW5pZmVzdFBheWxvYWQ+KFtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy53ZWJkYXZDb250ZW50RGlyLFxuICAgICAgICB0aGlzLnNldHRpbmdzLndlYmRhdk1hbmlmZXN0RmlsZVxuICAgICAgXSk7XG4gICAgICByZXR1cm4geyBpdGVtczogdGhpcy5ub3JtYWxpemVNYW5pZmVzdEl0ZW1zKHBheWxvYWQuaXRlbXMpIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFdlYkRhdkVycm9yICYmIGVycm9yLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIG5ldyBOb3RpY2UoXCJcdTY3MkFcdTYyN0VcdTUyMzAgbWFuaWZlc3QuanNvblx1RkYwQ1x1NUMwNlx1NTcyOFx1OTk5Nlx1NkIyMVx1NjNBOFx1OTAwMVx1NjVGNlx1ODFFQVx1NTJBOFx1NTIxQlx1NUVGQVx1MzAwMlwiLCA0MDAwKTtcbiAgICAgICAgcmV0dXJuIHsgaXRlbXM6IFtdIH07XG4gICAgICB9XG4gICAgICBuZXcgTm90aWNlKHRoaXMuZm9ybWF0V2ViRGF2RXJyb3IoZXJyb3IsIFwiXHU4QkZCXHU1M0Q2IG1hbmlmZXN0XCIpLCA1MDAwKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbm9ybWFsaXplTWFuaWZlc3RJdGVtcyhpdGVtczogTWFuaWZlc3RJdGVtW10gfCB1bmRlZmluZWQpOiBNYW5pZmVzdEl0ZW1bXSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGl0ZW1zKSkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBpdGVtc1xuICAgICAgLm1hcCgoaXRlbSkgPT4gKHtcbiAgICAgICAgLi4uaXRlbSxcbiAgICAgICAgc2x1ZzogU3RyaW5nKGl0ZW0uc2x1ZyA/PyBcIlwiKS50cmltKCksXG4gICAgICAgIGZpbGU6IFN0cmluZyhpdGVtLmZpbGUgPz8gXCJcIikudHJpbSgpXG4gICAgICB9KSlcbiAgICAgIC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uc2x1ZyAmJiBpdGVtLmZpbGUpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYS5zbHVnLmxvY2FsZUNvbXBhcmUoYi5zbHVnKSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGFwcGx5U2x1Z1RvTWFuaWZlc3QoXG4gICAgaXRlbXM6IE1hbmlmZXN0SXRlbVtdLFxuICAgIHNsdWdSZXN1bHQ6IFNsdWdNb2RhbFJlc3VsdCxcbiAgICBleHRlbnNpb246IFwibWRcIiB8IFwibWR4XCJcbiAgKSB7XG4gICAgbGV0IGN1cnJlbnRSZXN1bHQgPSBzbHVnUmVzdWx0O1xuICAgIGNvbnN0IHdvcmtpbmdJdGVtcyA9IFsuLi5pdGVtc107XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSB3b3JraW5nSXRlbXMuZmluZCgoaXRlbSkgPT4gaXRlbS5zbHVnID09PSBjdXJyZW50UmVzdWx0LnNsdWcpO1xuICAgICAgaWYgKCFleGlzdGluZykgYnJlYWs7XG5cbiAgICAgIGNvbnN0IGNob2ljZSA9IGF3YWl0IHRoaXMucHJvbXB0Q29uZmxpY3QoY3VycmVudFJlc3VsdC5zbHVnLCBleGlzdGluZy5maWxlKTtcbiAgICAgIGlmIChjaG9pY2UgPT09IFwiY2FuY2VsXCIpIHJldHVybiBudWxsO1xuICAgICAgaWYgKGNob2ljZSA9PT0gXCJjaGFuZ2VcIikge1xuICAgICAgICBjb25zdCBuZXh0ID0gYXdhaXQgdGhpcy5wcm9tcHRTbHVnKGN1cnJlbnRSZXN1bHQuc2x1ZywgZXh0ZW5zaW9uKTtcbiAgICAgICAgaWYgKCFuZXh0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgY3VycmVudFJlc3VsdCA9IG5leHQ7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKGNob2ljZSA9PT0gXCJvdmVyd3JpdGVcIikge1xuICAgICAgICBleGlzdGluZy5maWxlID0gY3VycmVudFJlc3VsdC5maWxlTmFtZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaGFzU2x1ZyA9IHdvcmtpbmdJdGVtcy5zb21lKChpdGVtKSA9PiBpdGVtLnNsdWcgPT09IGN1cnJlbnRSZXN1bHQuc2x1Zyk7XG4gICAgaWYgKCFoYXNTbHVnKSB7XG4gICAgICB3b3JraW5nSXRlbXMucHVzaCh7IHNsdWc6IGN1cnJlbnRSZXN1bHQuc2x1ZywgZmlsZTogY3VycmVudFJlc3VsdC5maWxlTmFtZSB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpdGVtczogdGhpcy5ub3JtYWxpemVNYW5pZmVzdEl0ZW1zKHdvcmtpbmdJdGVtcyksIHNsdWdSZXN1bHQ6IGN1cnJlbnRSZXN1bHQgfTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdXBkYXRlVmlzaWJpbGl0eShmaWxlOiBURmlsZSwgdmlzaWJpbGl0eTogXCJwdWJsaWNcIiB8IFwicHJpdmF0ZVwiKSB7XG4gICAgYXdhaXQgdGhpcy5hcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmcm9udG1hdHRlcikgPT4ge1xuICAgICAgZnJvbnRtYXR0ZXIudmlzaWJpbGl0eSA9IHZpc2liaWxpdHk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHVwZGF0ZVNsdWcoZmlsZTogVEZpbGUsIHNsdWc6IHN0cmluZykge1xuICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZnJvbnRtYXR0ZXIpID0+IHtcbiAgICAgIGZyb250bWF0dGVyLnNsdWcgPSBzbHVnO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBhZGRGcm9udG1hdHRlckZpZWxkc1RvQ3VycmVudEZpbGUoKSB7XG4gICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFmaWxlIHx8ICF0aGlzLmlzTWFya2Rvd25GaWxlKGZpbGUpKSB7XG4gICAgICBuZXcgTm90aWNlKFwiXHU4QkY3XHU1MTQ4XHU2MjUzXHU1RjAwXHU0RTAwXHU0RTJBIE1hcmtkb3duIFx1NjU4N1x1NEVGNlx1MzAwMlwiLCAzMDAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnNhdmVGaWxlSWZPcGVuKGZpbGUpO1xuICAgIGNvbnN0IHRvZGF5ID0gZm9ybWF0RGF0ZShuZXcgRGF0ZSgpKTtcblxuICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZnJvbnRtYXR0ZXIpID0+IHtcbiAgICAgIGlmIChmcm9udG1hdHRlci50aXRsZSA9PSBudWxsKSBmcm9udG1hdHRlci50aXRsZSA9IFwiXCI7XG4gICAgICBpZiAoIWlzVmFsaWREYXRlKFN0cmluZyhmcm9udG1hdHRlci5kYXRlID8/IFwiXCIpKSkgZnJvbnRtYXR0ZXIuZGF0ZSA9IHRvZGF5O1xuICAgICAgaWYgKGZyb250bWF0dGVyLnBsYWNlID09IG51bGwpIGZyb250bWF0dGVyLnBsYWNlID0gXCJcIjtcbiAgICAgIGlmIChmcm9udG1hdHRlci5hY2NlbnQgPT0gbnVsbCkgZnJvbnRtYXR0ZXIuYWNjZW50ID0gXCJcIjtcbiAgICAgIGlmIChmcm9udG1hdHRlci5jb3ZlciA9PSBudWxsKSBmcm9udG1hdHRlci5jb3ZlciA9IFwiXCI7XG4gICAgICBpZiAoZnJvbnRtYXR0ZXIuZXhjZXJwdCA9PSBudWxsKSBmcm9udG1hdHRlci5leGNlcnB0ID0gXCJcIjtcbiAgICAgIGlmIChmcm9udG1hdHRlci50YWdzID09IG51bGwpIGZyb250bWF0dGVyLnRhZ3MgPSBbXTtcbiAgICAgIGlmICghU3RyaW5nKGZyb250bWF0dGVyLnZpc2liaWxpdHkgPz8gXCJcIikudHJpbSgpKSBmcm9udG1hdHRlci52aXNpYmlsaXR5ID0gXCJwdWJsaWNcIjtcbiAgICB9KTtcblxuICAgIGF3YWl0IHRoaXMuc2F2ZUZpbGVJZk9wZW4oZmlsZSk7XG4gICAgbmV3IE5vdGljZShcIlx1NURGMlx1ODg2NVx1NTE2OCBmcm9udG1hdHRlciBcdTVCNTdcdTZCQjVcdTMwMDJcIiwgMzAwMCk7XG4gICAgdGhpcy5wdWJsaXNoVmlldz8ucmVmcmVzaEZpbGVTdGF0dXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZU5ld0ZpbGVOYW1lKHJhdzogc3RyaW5nLCBkYXRlOiBzdHJpbmcpIHtcbiAgICBjb25zdCB0cmltbWVkID0gcmF3LnRyaW0oKTtcbiAgICBjb25zdCBmYWxsYmFja0Jhc2UgPSBgJHtkYXRlfS0ke3NsdWdpZnkoXCJtaWxlc3RvbmVcIil9YDtcbiAgICBjb25zdCBiYXNlID0gdHJpbW1lZCB8fCBmYWxsYmFja0Jhc2U7XG4gICAgaWYgKC9bXFxcXC9dLy50ZXN0KGJhc2UpKSB7XG4gICAgICBuZXcgTm90aWNlKFwiXHU2NTg3XHU0RUY2XHU1NDBEXHU0RTBEXHU4MEZEXHU1MzA1XHU1NDJCXHU2NTlDXHU2NzYwXHUzMDAyXCIsIDMwMDApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChiYXNlLmVuZHNXaXRoKGAuJHt0aGlzLnNldHRpbmdzLmRlZmF1bHRFeHRlbnNpb259YCkgfHwgYmFzZS5pbmNsdWRlcyhcIi5cIikpIHtcbiAgICAgIHJldHVybiBiYXNlO1xuICAgIH1cbiAgICByZXR1cm4gYCR7YmFzZX0uJHt0aGlzLnNldHRpbmdzLmRlZmF1bHRFeHRlbnNpb259YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlUmVtb3RlQ29udGVudERpcigpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFydHMgPSB0aGlzLnNldHRpbmdzLndlYmRhdkNvbnRlbnREaXJcbiAgICAgICAgLnNwbGl0KFwiL1wiKVxuICAgICAgICAubWFwKChwYXJ0KSA9PiBwYXJ0LnRyaW0oKSlcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKTtcbiAgICAgIGNvbnN0IHBhdGg6IHN0cmluZ1tdID0gW107XG4gICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICAgICAgcGF0aC5wdXNoKHBhcnQpO1xuICAgICAgICBhd2FpdCB0aGlzLndlYmRhdi5lbnN1cmVEaXJlY3RvcnkocGF0aCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbmV3IE5vdGljZSh0aGlzLmZvcm1hdFdlYkRhdkVycm9yKGVycm9yLCBcIlx1NTIxQlx1NUVGQVx1OEZEQ1x1N0FFRlx1NzZFRVx1NUY1NVwiKSwgNTAwMCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRXZWJEYXZFcnJvcihlcnJvcjogdW5rbm93biwgYWN0aW9uOiBzdHJpbmcpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBXZWJEYXZFcnJvcikge1xuICAgICAgaWYgKGVycm9yLnN0YXR1cyA9PT0gNDAxIHx8IGVycm9yLnN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgIHJldHVybiBgJHthY3Rpb259XHU1OTMxXHU4RDI1XHVGRjFBXHU5Mjc0XHU2NzQzXHU1OTMxXHU4RDI1XHVGRjBDXHU4QkY3XHU2OEMwXHU2N0U1XHU3NTI4XHU2MjM3XHU1NDBEL1x1NUJDNlx1NzgwMVx1MzAwMmA7XG4gICAgICB9XG4gICAgICBpZiAoZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIGAke2FjdGlvbn1cdTU5MzFcdThEMjVcdUZGMUFcdThGRENcdTdBRUZcdThENDRcdTZFOTBcdTRFMERcdTVCNThcdTU3MjhcdTMwMDJgO1xuICAgICAgfVxuICAgICAgaWYgKGVycm9yLnN0YXR1cykge1xuICAgICAgICByZXR1cm4gYCR7YWN0aW9ufVx1NTkzMVx1OEQyNVx1RkYxQUhUVFAgJHtlcnJvci5zdGF0dXN9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgJHthY3Rpb259XHU1OTMxXHU4RDI1XHVGRjFBJHtlcnJvci5tZXNzYWdlfWA7XG4gICAgfVxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICByZXR1cm4gYCR7YWN0aW9ufVx1NTkzMVx1OEQyNVx1RkYxQSR7ZXJyb3IubWVzc2FnZX1gO1xuICAgIH1cbiAgICByZXR1cm4gYCR7YWN0aW9ufVx1NTkzMVx1OEQyNVx1RkYxQVx1NjcyQVx1NzdFNVx1OTUxOVx1OEJFRlx1MzAwMmA7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIExvdmVMaW5rZXJQdWJsaXNoZXJQbHVnaW4gZnJvbSBcIi4vbWFpblwiO1xuXG5leHBvcnQgY2xhc3MgTG92ZUxpbmtlclNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgcGx1Z2luOiBMb3ZlTGlua2VyUHVibGlzaGVyUGx1Z2luKSB7XG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG5cbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJMb3ZlIExpbmtlciBQdWJsaXNoZXIgXHU4QkJFXHU3RjZFXCIgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiV0VCREFWX0JBU0VfVVJMXCIpXG4gICAgICAuc2V0RGVzYyhcIlx1NEY4Qlx1NTk4MiBodHRwczovL3JlYnVuLmluZmluaS1jbG91ZC5uZXQvZGF2XHVGRjA4XHU0RTAwXHU4MjJDXHU0RUU1IC9kYXYgXHU3RUQzXHU1QzNFXHVGRjA5XCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8vLi4uXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLndlYmRhdkJhc2VVcmwpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mud2ViZGF2QmFzZVVybCA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIldFQkRBVl9VU0VSTkFNRVwiKVxuICAgICAgLnNldERlc2MoXCJcdTRFOTFcdTc2RDhcdTc2ODQgQ29ubmVjdGlvbiBJRFx1RkYwOFx1NzUyOFx1NEU4RVx1NzY3Qlx1NUY1NVx1RkYwOVwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJZT1VSX0NPTk5FQ1RJT05fSURcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mud2ViZGF2VXNlcm5hbWUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mud2ViZGF2VXNlcm5hbWUgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJXRUJEQVZfUEFTU1dPUkRcIilcbiAgICAgIC5zZXREZXNjKFwiXHU0RTkxXHU3NkQ4XHU3Njg0IEFwcHMgUGFzc3dvcmRcdUZGMDhcdTVFRkFcdThCQUVcdTRFMERcdTg5ODFcdTYyMkFcdTU2RkVcdTUyMDZcdTRFQUJcdUZGMUJcdTY3MkNcdTYzRDJcdTRFRjZcdTRGMUFcdTRGRERcdTVCNThcdTU3MjhcdTY3MkNcdTU3MzBcdTkxNERcdTdGNkVcdTRFMkRcdUZGMDlcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XG4gICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJwYXNzd29yZFwiO1xuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiWU9VUl9BUFBTX1BBU1NXT1JEXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLndlYmRhdlBhc3N3b3JkKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLndlYmRhdlBhc3N3b3JkID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJcdTY2M0VcdTc5M0FcdTVCQzZcdTc4MDFcIilcbiAgICAgIC5zZXREZXNjKFwiXHU0RUM1XHU1RjcxXHU1NENEXHU1RjUzXHU1MjREXHU4QkJFXHU3RjZFXHU5ODc1XHU2NjNFXHU3OTNBXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+IHtcbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKGZhbHNlKS5vbkNoYW5nZSgodmFsdWUpID0+IHtcbiAgICAgICAgICBjb25zdCBwYXNzd29yZElucHV0cyA9IGNvbnRhaW5lckVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFt0eXBlPSdwYXNzd29yZCddLCBpbnB1dFtkYXRhLWxscC1wYXNzd29yZD0ndHJ1ZSddXCIpO1xuICAgICAgICAgIHBhc3N3b3JkSW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnB1dEVsID0gaW5wdXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgIGlucHV0RWwudHlwZSA9IHZhbHVlID8gXCJ0ZXh0XCIgOiBcInBhc3N3b3JkXCI7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBjb25zdCBwYXNzd29yZElucHV0ID0gY29udGFpbmVyRWwucXVlcnlTZWxlY3RvcihcImlucHV0W3R5cGU9J3Bhc3N3b3JkJ11cIikgYXMgSFRNTElucHV0RWxlbWVudCB8IG51bGw7XG4gICAgaWYgKHBhc3N3b3JkSW5wdXQpIHtcbiAgICAgIHBhc3N3b3JkSW5wdXQuc2V0QXR0cmlidXRlKFwiZGF0YS1sbHAtcGFzc3dvcmRcIiwgXCJ0cnVlXCIpO1xuICAgIH1cblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJXRUJEQVZfQ09OVEVOVF9ESVJcIilcbiAgICAgIC5zZXREZXNjKFwiXHU4RkRDXHU3QUVGXHU1QjU4XHU2NTNFXHU2NTg3XHU3QUUwXHU3Njg0XHU3NkVFXHU1RjU1XHU1NDBEXHVGRjA4XHU5MDFBXHU1RTM4XHU0RTBEXHU3NTI4XHU2NTM5XHVGRjA5XCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIm1pbGVzdG9uZXNcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mud2ViZGF2Q29udGVudERpcilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy53ZWJkYXZDb250ZW50RGlyID0gdmFsdWUudHJpbSgpIHx8IFwibWlsZXN0b25lc1wiO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiV0VCREFWX01BTklGRVNUX0ZJTEVcIilcbiAgICAgIC5zZXREZXNjKFwic2x1ZyBcdTY2MjBcdTVDMDRcdTg4NjhcdTY1ODdcdTRFRjZcdTU0MERcdUZGMDhcdTkwMUFcdTVFMzhcdTRFMERcdTc1MjhcdTY1MzlcdUZGMDlcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwibWFuaWZlc3QuanNvblwiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy53ZWJkYXZNYW5pZmVzdEZpbGUpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mud2ViZGF2TWFuaWZlc3RGaWxlID0gdmFsdWUudHJpbSgpIHx8IFwibWFuaWZlc3QuanNvblwiO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiTE9DQUxfQ09OVEVOVF9GT0xERVJcIilcbiAgICAgIC5zZXREZXNjKFwiT2JzaWRpYW4gXHU2NzJDXHU1NzMwXHU0RkREXHU1QjU4XHU2NTg3XHU3QUUwXHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU3NkY4XHU1QkY5IHZhdWx0IFx1NjgzOVx1NzZFRVx1NUY1NVx1RkYwOVwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJtaWxlc3RvbmVzXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmxvY2FsQ29udGVudEZvbGRlcilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5sb2NhbENvbnRlbnRGb2xkZXIgPSB2YWx1ZS50cmltKCkgfHwgXCJtaWxlc3RvbmVzXCI7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJcdTlFRDhcdThCQTRcdTYyNjlcdTVDNTVcdTU0MERcIilcbiAgICAgIC5zZXREZXNjKFwiXHU2NUIwXHU1RUZBXHU2NTg3XHU0RUY2XHU2NUY2XHU0RjdGXHU3NTI4IC5tZFwiKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT4ge1xuICAgICAgICBkcm9wZG93bi5hZGRPcHRpb24oXCJtZFwiLCBcIi5tZFwiKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdEV4dGVuc2lvbikub25DaGFuZ2UoYXN5bmMgKHZhbHVlOiBcIm1kXCIgfCBcIm1keFwiKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdEV4dGVuc2lvbiA9IHZhbHVlO1xuICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIlx1OUVEOFx1OEJBNCBhY2NlbnRcIilcbiAgICAgIC5zZXREZXNjKFwiXHU2NUIwXHU1RUZBXHU2NTg3XHU2ODYzXHU2NUY2XHU5RUQ4XHU4QkE0XHU0RjdGXHU3NTI4XHU3Njg0XHU0RTNCXHU4MjcyXCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImNvcmFsXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRBY2NlbnQpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdEFjY2VudCA9IHZhbHVlLnRyaW0oKSB8fCBcImNvcmFsXCI7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJhY2NlbnQgXHU1MDE5XHU5MDA5XHU1MjE3XHU4ODY4XCIpXG4gICAgICAuc2V0RGVzYyhcIlx1NkJDRlx1ODg0Q1x1NEUwMFx1NEUyQVx1RkYwQ1x1NTNFRlx1NTE5OVx1NjIxMCBrZXl8XHU0RTJEXHU2NTg3XHU4QkY0XHU2NjBFXHVGRjBDXHU0RjhCXHU1OTgyIHNlYXxcdTZENzdcdTg0RERcIilcbiAgICAgIC5hZGRUZXh0QXJlYSgodGV4dGFyZWEpID0+IHtcbiAgICAgICAgdGV4dGFyZWEuaW5wdXRFbC5yb3dzID0gNjtcbiAgICAgICAgdGV4dGFyZWFcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYWNjZW50T3B0aW9ucy5qb2luKFwiXFxuXCIpKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFjY2VudE9wdGlvbnMgPSB2YWx1ZVxuICAgICAgICAgICAgICAuc3BsaXQoXCJcXG5cIilcbiAgICAgICAgICAgICAgLm1hcCgobGluZSkgPT4gbGluZS50cmltKCkpXG4gICAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIlx1OUVEOFx1OEJBNFx1NUMwMVx1OTc2Mlx1OTRGRVx1NjNBNVwiKVxuICAgICAgLnNldERlc2MoXCJcdTU5MTZcdTk0RkVcdTU2RkVcdTVFOEFcdTlFRDhcdThCQTRcdTUwM0NcdUZGMENcdTUzRUZcdTc1NTlcdTdBN0FcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiaHR0cHM6Ly95b3VyLWltYWdlLWhvc3QvY292ZXIuc3ZnXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHRDb3ZlclVybClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0Q292ZXJVcmwgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJcdTZENEJcdThCRDVcdThGREVcdTYzQTVcIilcbiAgICAgIC5zZXREZXNjKFwiXHU3MEI5XHU1MUZCXHU1NDBFXHU2OEMwXHU2RDRCIFdlYkRBViBcdTY2MkZcdTU0MjZcdTUzRUZcdThGREVcdTYzQTVcIilcbiAgICAgIC5hZGRCdXR0b24oKGJ1dHRvbikgPT4ge1xuICAgICAgICBidXR0b24uc2V0QnV0dG9uVGV4dChcIlx1NkQ0Qlx1OEJENVx1OEZERVx1NjNBNVwiKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi50ZXN0Q29ubmVjdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgY29uc3Qgc2FmZXR5ID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KHsgY2xzOiBcImxvdmUtbGlua2VyLXNlY3Rpb25cIiB9KTtcbiAgICBzYWZldHkuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiXHU1Qjg5XHU1MTY4XHU4QkY0XHU2NjBFXCIgfSk7XG4gICAgc2FmZXR5LmNyZWF0ZUVsKFwicFwiLCB7XG4gICAgICB0ZXh0OiBcIldlYkRBViBcdTVCQzZcdTc4MDFcdTRGMUFcdTRGRERcdTVCNThcdTU3MjhcdTY3MkNcdTU3MzBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkVcdTY1ODdcdTRFRjZcdTRFMkRcdUZGMDhcdTY2MEVcdTY1ODdcdUZGMDlcdUZGMENcdThCRjdcdTgxRUFcdTg4NENcdThCQzRcdTRGMzBcdTk4Q0VcdTk2NjlcdTMwMDJcIlxuICAgIH0pO1xuICAgIHNhZmV0eS5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIlx1NEUwRFx1ODk4MVx1NjI4QVx1NUJDNlx1NzgwMVx1NjNEMFx1NEVBNFx1NTIzMCBHaXQgXHU2MjE2XHU1MTZDXHU1RjAwXHUzMDAyXCIgfSk7XG4gIH1cbn1cbiIsICJleHBvcnQgdHlwZSBMb3ZlTGlua2VyU2V0dGluZ3MgPSB7XG4gIHdlYmRhdkJhc2VVcmw6IHN0cmluZztcbiAgd2ViZGF2VXNlcm5hbWU6IHN0cmluZztcbiAgd2ViZGF2UGFzc3dvcmQ6IHN0cmluZztcbiAgd2ViZGF2Q29udGVudERpcjogc3RyaW5nO1xuICB3ZWJkYXZNYW5pZmVzdEZpbGU6IHN0cmluZztcbiAgbG9jYWxDb250ZW50Rm9sZGVyOiBzdHJpbmc7XG4gIGRlZmF1bHRFeHRlbnNpb246IFwibWRcIiB8IFwibWR4XCI7XG4gIGRlZmF1bHRBY2NlbnQ6IHN0cmluZztcbiAgYWNjZW50T3B0aW9uczogc3RyaW5nW107XG4gIGRlZmF1bHRDb3ZlclVybDogc3RyaW5nO1xuICBtYW5pZmVzdFByZXZpZXdMaW1pdDogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgQWNjZW50T3B0aW9uID0ge1xuICB2YWx1ZTogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgRnJvbnRtYXR0ZXJEYXRhID0ge1xuICB0aXRsZTogc3RyaW5nO1xuICBkYXRlOiBzdHJpbmc7XG4gIGV4Y2VycHQ6IHN0cmluZztcbiAgcGxhY2U/OiBzdHJpbmc7XG4gIGNvdmVyPzogc3RyaW5nO1xuICBhY2NlbnQ/OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXTtcbiAgdmlzaWJpbGl0eT86IFwicHVibGljXCIgfCBcInByaXZhdGVcIiB8IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFZhbGlkYXRpb25SZXN1bHQgPSB7XG4gIG9rOiBib29sZWFuO1xuICBlcnJvcnM6IHN0cmluZ1tdO1xuICB3YXJuaW5nczogc3RyaW5nW107XG4gIGlzUHJpdmF0ZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBMb3ZlTGlua2VyU2V0dGluZ3MgPSB7XG4gIHdlYmRhdkJhc2VVcmw6IFwiXCIsXG4gIHdlYmRhdlVzZXJuYW1lOiBcIlwiLFxuICB3ZWJkYXZQYXNzd29yZDogXCJcIixcbiAgd2ViZGF2Q29udGVudERpcjogXCJtaWxlc3RvbmVzXCIsXG4gIHdlYmRhdk1hbmlmZXN0RmlsZTogXCJtYW5pZmVzdC5qc29uXCIsXG4gIGxvY2FsQ29udGVudEZvbGRlcjogXCJtaWxlc3RvbmVzXCIsXG4gIGRlZmF1bHRFeHRlbnNpb246IFwibWRcIixcbiAgZGVmYXVsdEFjY2VudDogXCJjb3JhbFwiLFxuICBhY2NlbnRPcHRpb25zOiBbXG4gICAgXCJjb3JhbHxcdTczQ0FcdTc0NUFcdTdFQTJcIixcbiAgICBcInBlYWNofFx1Njg0M1x1Njc0RlwiLFxuICAgIFwiYW1iZXJ8XHU3NDI1XHU3M0MwXHU5RUM0XCIsXG4gICAgXCJzZWF8XHU2RDc3XHU4NEREXCIsXG4gICAgXCJza3l8XHU1OTI5XHU4NEREXCIsXG4gICAgXCJpbmt8XHU1OEE4XHU5RUQxXCIsXG4gICAgXCJwYXBlcnxcdTdFQjhcdTc2N0RcIlxuICBdLFxuICBkZWZhdWx0Q292ZXJVcmw6IFwiXCIsXG4gIG1hbmlmZXN0UHJldmlld0xpbWl0OiAxMFxufTtcbiIsICJpbXBvcnQgeyBwYXJzZVlhbWwgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIHsgRnJvbnRtYXR0ZXJEYXRhIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGNvbnN0IERBVEVfUkVHRVggPSAvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9JC87XG5cbmV4cG9ydCBjb25zdCBmb3JtYXREYXRlID0gKHZhbHVlOiBEYXRlKSA9PiB7XG4gIGNvbnN0IHl5eXkgPSB2YWx1ZS5nZXRGdWxsWWVhcigpO1xuICBjb25zdCBtbSA9IFN0cmluZyh2YWx1ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICBjb25zdCBkZCA9IFN0cmluZyh2YWx1ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgcmV0dXJuIGAke3l5eXl9LSR7bW19LSR7ZGR9YDtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1ZhbGlkRGF0ZSA9ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gIGlmICghREFURV9SRUdFWC50ZXN0KHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwYXJzZWQgPSBuZXcgRGF0ZShgJHt2YWx1ZX1UMDA6MDA6MDBaYCk7XG4gIGlmIChOdW1iZXIuaXNOYU4ocGFyc2VkLmdldFRpbWUoKSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHBhcnNlZC50b0lTT1N0cmluZygpLnN0YXJ0c1dpdGgodmFsdWUpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNsdWdpZnkgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuICBjb25zdCBzbHVnID0gdmFsdWVcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csIFwiLVwiKVxuICAgIC5yZXBsYWNlKC9eLSt8LSskL2csIFwiXCIpO1xuICByZXR1cm4gc2x1Zy5sZW5ndGggPiAwID8gc2x1ZyA6IFwibWlsZXN0b25lXCI7XG59O1xuXG5leHBvcnQgY29uc3QgcGFyc2VUYWdzSW5wdXQgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuICByZXR1cm4gdmFsdWVcbiAgICAuc3BsaXQoL1ssXHVGRjBDXS8pXG4gICAgLm1hcCgodGFnKSA9PiB0YWcudHJpbSgpKVxuICAgIC5maWx0ZXIoQm9vbGVhbik7XG59O1xuXG5jb25zdCBlc2NhcGVZYW1sU3RyaW5nID0gKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1xcXFwvZywgXCJcXFxcXFxcXFwiKS5yZXBsYWNlKC9cIi9nLCBcIlxcXFxcXFwiXCIpO1xufTtcblxuY29uc3QgYnVpbGRZYW1sQXJyYXkgPSAodGFnczogc3RyaW5nW10pID0+IHtcbiAgaWYgKCF0YWdzIHx8IHRhZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gXCJbXVwiO1xuICBjb25zdCBlc2NhcGVkID0gdGFncy5tYXAoKHRhZykgPT4gYFxcXCIke2VzY2FwZVlhbWxTdHJpbmcodGFnKX1cXFwiYCk7XG4gIHJldHVybiBgWyR7ZXNjYXBlZC5qb2luKFwiLCBcIil9XWA7XG59O1xuXG5leHBvcnQgY29uc3QgYnVpbGRGcm9udG1hdHRlclRlbXBsYXRlID0gKGRhdGE6IEZyb250bWF0dGVyRGF0YSkgPT4ge1xuICBjb25zdCB0aXRsZSA9IGVzY2FwZVlhbWxTdHJpbmcoZGF0YS50aXRsZSk7XG4gIGNvbnN0IGRhdGUgPSBlc2NhcGVZYW1sU3RyaW5nKGRhdGEuZGF0ZSk7XG4gIGNvbnN0IHBsYWNlID0gZXNjYXBlWWFtbFN0cmluZyhkYXRhLnBsYWNlID8/IFwiXCIpO1xuICBjb25zdCBhY2NlbnQgPSBlc2NhcGVZYW1sU3RyaW5nKGRhdGEuYWNjZW50ID8/IFwiXCIpO1xuICBjb25zdCBjb3ZlciA9IGVzY2FwZVlhbWxTdHJpbmcoZGF0YS5jb3ZlciA/PyBcIlwiKTtcbiAgY29uc3QgZXhjZXJwdCA9IGVzY2FwZVlhbWxTdHJpbmcoZGF0YS5leGNlcnB0KTtcbiAgY29uc3QgdGFncyA9IGJ1aWxkWWFtbEFycmF5KGRhdGEudGFncyA/PyBbXSk7XG4gIGNvbnN0IHZpc2liaWxpdHkgPSBlc2NhcGVZYW1sU3RyaW5nKGRhdGEudmlzaWJpbGl0eSA/PyBcInB1YmxpY1wiKTtcblxuICByZXR1cm4gW1xuICAgIFwiLS0tXCIsXG4gICAgYHRpdGxlOiBcXFwiJHt0aXRsZX1cXFwiYCxcbiAgICBgZGF0ZTogXFxcIiR7ZGF0ZX1cXFwiYCxcbiAgICBgcGxhY2U6IFxcXCIke3BsYWNlfVxcXCJgLFxuICAgIGBhY2NlbnQ6IFxcXCIke2FjY2VudH1cXFwiYCxcbiAgICBgY292ZXI6IFxcXCIke2NvdmVyfVxcXCJgLFxuICAgIGBleGNlcnB0OiBcXFwiJHtleGNlcnB0fVxcXCJgLFxuICAgIGB0YWdzOiAke3RhZ3N9YCxcbiAgICBgdmlzaWJpbGl0eTogXFxcIiR7dmlzaWJpbGl0eX1cXFwiYCxcbiAgICBcIi0tLVwiLFxuICAgIFwiXCJcbiAgXS5qb2luKFwiXFxuXCIpO1xufTtcblxuZXhwb3J0IGNvbnN0IHBhcnNlRnJvbnRtYXR0ZXJCbG9jayA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eLS0tXFxzKlxcbihbXFxzXFxTXSo/KVxcbi0tLVxccyooPzpcXG58JCkvKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybiB7IGRhdGE6IG51bGwgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsLCBoYXNGcm9udG1hdHRlcjogZmFsc2UgfTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YSA9IChwYXJzZVlhbWwobWF0Y2hbMV0pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA/PyB7fTtcbiAgICByZXR1cm4geyBkYXRhLCBoYXNGcm9udG1hdHRlcjogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB7IGRhdGE6IG51bGwgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsLCBoYXNGcm9udG1hdHRlcjogdHJ1ZSwgZXJyb3IgfTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEZyb250bWF0dGVyRW5kTGluZSA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KFwiXFxuXCIpO1xuICBsZXQgZGVsaW1pdGVyQ291bnQgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKGxpbmVzW2ldLnRyaW0oKSA9PT0gXCItLS1cIikge1xuICAgICAgZGVsaW1pdGVyQ291bnQgKz0gMTtcbiAgICAgIGlmIChkZWxpbWl0ZXJDb3VudCA9PT0gMikgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAwO1xufTtcblxuZXhwb3J0IGNvbnN0IHN1Z2dlc3RTbHVnRnJvbUZpbGVuYW1lID0gKGJhc2VuYW1lOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgbWF0Y2ggPSBiYXNlbmFtZS5tYXRjaCgvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9LSguKykkLyk7XG4gIGlmIChtYXRjaCAmJiBtYXRjaFsxXSkgcmV0dXJuIG1hdGNoWzFdO1xuICByZXR1cm4gYmFzZW5hbWU7XG59O1xuIiwgImltcG9ydCB0eXBlIHsgQWNjZW50T3B0aW9uLCBGcm9udG1hdHRlckRhdGEsIFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgaXNWYWxpZERhdGUgfSBmcm9tIFwiLi9mcm9udG1hdHRlclwiO1xuXG5jb25zdCBpc05vbkVtcHR5U3RyaW5nID0gKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgc3RyaW5nID0+XG4gIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiB2YWx1ZS50cmltKCkubGVuZ3RoID4gMDtcblxuY29uc3QgaXNIZXhDb2xvciA9ICh2YWx1ZTogc3RyaW5nKSA9PiAvXiMoWzAtOWEtZl17M318WzAtOWEtZl17Nn18WzAtOWEtZl17OH0pJC9pLnRlc3QodmFsdWUpO1xuXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplRnJvbnRtYXR0ZXIgPSAoZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBGcm9udG1hdHRlckRhdGEgPT4ge1xuICByZXR1cm4ge1xuICAgIHRpdGxlOiBTdHJpbmcoZGF0YS50aXRsZSA/PyBcIlwiKSxcbiAgICBkYXRlOiBTdHJpbmcoZGF0YS5kYXRlID8/IFwiXCIpLFxuICAgIGV4Y2VycHQ6IFN0cmluZyhkYXRhLmV4Y2VycHQgPz8gXCJcIiksXG4gICAgcGxhY2U6IGRhdGEucGxhY2UgPyBTdHJpbmcoZGF0YS5wbGFjZSkgOiB1bmRlZmluZWQsXG4gICAgY292ZXI6IGRhdGEuY292ZXIgPyBTdHJpbmcoZGF0YS5jb3ZlcikgOiB1bmRlZmluZWQsXG4gICAgYWNjZW50OiBkYXRhLmFjY2VudCA/IFN0cmluZyhkYXRhLmFjY2VudCkgOiB1bmRlZmluZWQsXG4gICAgdGFnczogQXJyYXkuaXNBcnJheShkYXRhLnRhZ3MpID8gZGF0YS50YWdzLm1hcCgodGFnKSA9PiBTdHJpbmcodGFnKSkgOiB1bmRlZmluZWQsXG4gICAgdmlzaWJpbGl0eTogZGF0YS52aXNpYmlsaXR5ID8gU3RyaW5nKGRhdGEudmlzaWJpbGl0eSkgOiB1bmRlZmluZWRcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUZyb250bWF0dGVyID0gKFxuICBkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwsXG4gIGFjY2VudE9wdGlvbnM6IEFjY2VudE9wdGlvbltdXG4pOiBWYWxpZGF0aW9uUmVzdWx0ID0+IHtcbiAgY29uc3QgcmVzdWx0OiBWYWxpZGF0aW9uUmVzdWx0ID0geyBvazogZmFsc2UsIGVycm9yczogW10sIHdhcm5pbmdzOiBbXSwgaXNQcml2YXRlOiBmYWxzZSB9O1xuICBpZiAoIWRhdGEpIHtcbiAgICByZXN1bHQuZXJyb3JzLnB1c2goXCJcdTY3MkFcdThCRkJcdTUzRDZcdTUyMzAgWUFNTCBmcm9udG1hdHRlclx1MzAwMlx1OEJGN1x1NTcyOFx1NjU4N1x1NEVGNlx1NUYwMFx1NTkzNFx1NkRGQlx1NTJBMCAtLS0gXHU1NzU3XHUzMDAyXCIpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplRnJvbnRtYXR0ZXIoZGF0YSk7XG5cbiAgaWYgKCFpc05vbkVtcHR5U3RyaW5nKG5vcm1hbGl6ZWQudGl0bGUpKSB7XG4gICAgcmVzdWx0LmVycm9ycy5wdXNoKFwiXHU3RjNBXHU1QzExIHRpdGxlXHVGRjBDXHU2MjE2XHU0RTBEXHU2NjJGXHU1QjU3XHU3QjI2XHU0RTMyXHUzMDAyXCIpO1xuICB9XG5cbiAgaWYgKCFpc05vbkVtcHR5U3RyaW5nKG5vcm1hbGl6ZWQuZGF0ZSkgfHwgIWlzVmFsaWREYXRlKG5vcm1hbGl6ZWQuZGF0ZSkpIHtcbiAgICByZXN1bHQuZXJyb3JzLnB1c2goXCJkYXRlIFx1NUZDNVx1OTg3Qlx1NEUzQSBZWVlZLU1NLUREIFx1NEUxNFx1NjYyRlx1NjcwOVx1NjU0OFx1NjVFNVx1NjcxRlx1MzAwMlwiKTtcbiAgfVxuXG4gIGlmICghaXNOb25FbXB0eVN0cmluZyhub3JtYWxpemVkLmV4Y2VycHQpKSB7XG4gICAgcmVzdWx0LmVycm9ycy5wdXNoKFwiXHU3RjNBXHU1QzExIGV4Y2VycHRcdUZGMENcdTYyMTZcdTRFMERcdTY2MkZcdTVCNTdcdTdCMjZcdTRFMzJcdTMwMDJcIik7XG4gIH1cblxuICBpZiAobm9ybWFsaXplZC52aXNpYmlsaXR5ICYmIG5vcm1hbGl6ZWQudmlzaWJpbGl0eSAhPT0gXCJwdWJsaWNcIiAmJiBub3JtYWxpemVkLnZpc2liaWxpdHkgIT09IFwicHJpdmF0ZVwiKSB7XG4gICAgcmVzdWx0LmVycm9ycy5wdXNoKFwidmlzaWJpbGl0eSBcdTUzRUFcdTgwRkRcdTY2MkYgcHVibGljIFx1NjIxNiBwcml2YXRlXHUzMDAyXCIpO1xuICB9XG5cbiAgaWYgKG5vcm1hbGl6ZWQudmlzaWJpbGl0eSA9PT0gXCJwcml2YXRlXCIpIHtcbiAgICByZXN1bHQuaXNQcml2YXRlID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChkYXRhLnRhZ3MgJiYgIUFycmF5LmlzQXJyYXkoZGF0YS50YWdzKSkge1xuICAgIHJlc3VsdC53YXJuaW5ncy5wdXNoKFwidGFncyBcdTVFOTRcdTRFM0FcdTY1NzBcdTdFQzRcdUZGMENcdTRGOEJcdTU5ODIgW1xcXCJcdTY1QzVcdTkwMTRcXFwiLCBcXFwiXHU2RjZFXHU1OEYwXFxcIl1cdTMwMDJcIik7XG4gIH1cblxuICBpZiAobm9ybWFsaXplZC5hY2NlbnQgJiYgbm9ybWFsaXplZC5hY2NlbnQudHJpbSgpKSB7XG4gICAgY29uc3QgYWNjZW50S2V5cyA9IGFjY2VudE9wdGlvbnMubWFwKChvcHRpb24pID0+IG9wdGlvbi52YWx1ZSk7XG4gICAgaWYgKCFhY2NlbnRLZXlzLmluY2x1ZGVzKG5vcm1hbGl6ZWQuYWNjZW50KSAmJiAhaXNIZXhDb2xvcihub3JtYWxpemVkLmFjY2VudCkpIHtcbiAgICAgIHJlc3VsdC53YXJuaW5ncy5wdXNoKFwiYWNjZW50IFx1NEUwRFx1NTcyOFx1OEMwM1x1ODI3Mlx1Njc3Rlx1NEUyRFx1RkYwOFx1NjIxNlx1NEUwRFx1NjYyRiAjaGV4XHVGRjA5XHVGRjBDXHU3RjUxXHU3QUQ5XHU1M0VGXHU4MEZEXHU0RjFBXHU3RUQ5XHU1MUZBXHU4QjY2XHU1NDRBXHUzMDAyXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3VsdC5vayA9IHJlc3VsdC5lcnJvcnMubGVuZ3RoID09PSAwO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UsIFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIHsgQWNjZW50T3B0aW9uIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGZvcm1hdERhdGUsIGlzVmFsaWREYXRlLCBwYXJzZVRhZ3NJbnB1dCwgc2x1Z2lmeSB9IGZyb20gXCIuL2Zyb250bWF0dGVyXCI7XG5cbmV4cG9ydCB0eXBlIE5ld0FydGljbGVGb3JtRGF0YSA9IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgZGF0ZTogc3RyaW5nO1xuICBmaWxlTmFtZTogc3RyaW5nO1xuICBwbGFjZTogc3RyaW5nO1xuICBhY2NlbnQ6IHN0cmluZztcbiAgY292ZXI6IHN0cmluZztcbiAgZXhjZXJwdDogc3RyaW5nO1xuICB0YWdzOiBzdHJpbmdbXTtcbiAgdmlzaWJpbGl0eTogXCJwdWJsaWNcIiB8IFwicHJpdmF0ZVwiO1xufTtcblxuZXhwb3J0IGNsYXNzIE5ld0FydGljbGVNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBkYXRhOiBOZXdBcnRpY2xlRm9ybURhdGE7XG4gIHByaXZhdGUgZmlsZU5hbWVQcmV2aWV3RWw/OiBIVE1MRGl2RWxlbWVudDtcbiAgcHJpdmF0ZSBkZWZhdWx0RmlsZU5hbWVCYXNlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBBcHAsXG4gICAgcHJpdmF0ZSBvcHRpb25zOiB7XG4gICAgICBhY2NlbnRPcHRpb25zOiBBY2NlbnRPcHRpb25bXTtcbiAgICAgIGRlZmF1bHRBY2NlbnQ6IHN0cmluZztcbiAgICAgIGRlZmF1bHRDb3Zlcjogc3RyaW5nO1xuICAgICAgZGVmYXVsdEV4dGVuc2lvbjogXCJtZFwiIHwgXCJtZHhcIjtcbiAgICAgIG9uU3VibWl0OiAoZGF0YTogTmV3QXJ0aWNsZUZvcm1EYXRhKSA9PiBQcm9taXNlPGJvb2xlYW4+IHwgYm9vbGVhbjtcbiAgICB9XG4gICkge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgY29uc3QgZGVmYXVsdERhdGUgPSBmb3JtYXREYXRlKG5ldyBEYXRlKCkpO1xuICAgIHRoaXMuZGF0YSA9IHtcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgZGF0ZTogZGVmYXVsdERhdGUsXG4gICAgICBmaWxlTmFtZTogXCJcIixcbiAgICAgIHBsYWNlOiBcIlwiLFxuICAgICAgYWNjZW50OiBvcHRpb25zLmRlZmF1bHRBY2NlbnQsXG4gICAgICBjb3Zlcjogb3B0aW9ucy5kZWZhdWx0Q292ZXIsXG4gICAgICBleGNlcnB0OiBcIlwiLFxuICAgICAgdGFnczogW10sXG4gICAgICB2aXNpYmlsaXR5OiBcInB1YmxpY1wiXG4gICAgfTtcbiAgICB0aGlzLmRlZmF1bHRGaWxlTmFtZUJhc2UgPSB0aGlzLmJ1aWxkRGVmYXVsdEZpbGVOYW1lQmFzZShkZWZhdWx0RGF0ZSk7XG4gICAgdGhpcy5kYXRhLmZpbGVOYW1lID0gdGhpcy5kZWZhdWx0RmlsZU5hbWVCYXNlO1xuICB9XG5cbiAgb25PcGVuKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJcdTY1QjBcdTVFRkFcdTkxQ0NcdTdBMEJcdTc4OTFcdTY1ODdcdTY4NjNcIiB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiXHU2ODA3XHU5ODk4XCIpXG4gICAgICAuc2V0RGVzYyhcIlx1NUMwNlx1NzUyOFx1NEU4RVx1OTg3NVx1OTc2Mlx1NjgwN1x1OTg5OFwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcbiAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcihcIlx1NEY4Qlx1NTk4Mlx1RkYxQVx1N0IyQ1x1NEUwMFx1NkIyMVx1OEZEQ1x1ODg0Q1wiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLmRhdGEudGl0bGUpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYXRhLnRpdGxlID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGaWxlTmFtZVByZXZpZXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoXCJcdTY1RTVcdTY3MUZcIilcbiAgICAgIC5zZXREZXNjKFwiXHU2ODNDXHU1RjBGIFlZWVktTU0tRERcdUZGMENcdTlFRDhcdThCQTRcdTRFQ0FcdTU5MjlcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XG4gICAgICAgIHRleHQuaW5wdXRFbC50eXBlID0gXCJkYXRlXCI7XG4gICAgICAgIHRleHQuc2V0VmFsdWUodGhpcy5kYXRhLmRhdGUpLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMuZGF0YS5kYXRlID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgIGNvbnN0IG5leHREZWZhdWx0ID0gdGhpcy5idWlsZERlZmF1bHRGaWxlTmFtZUJhc2UodGhpcy5kYXRhLmRhdGUpO1xuICAgICAgICAgIGlmICh0aGlzLmRhdGEuZmlsZU5hbWUudHJpbSgpID09PSB0aGlzLmRlZmF1bHRGaWxlTmFtZUJhc2UpIHtcbiAgICAgICAgICAgIHRoaXMuZGVmYXVsdEZpbGVOYW1lQmFzZSA9IG5leHREZWZhdWx0O1xuICAgICAgICAgICAgdGhpcy5kYXRhLmZpbGVOYW1lID0gbmV4dERlZmF1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudXBkYXRlRmlsZU5hbWVQcmV2aWV3KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZShcIlx1NjU4N1x1NEVGNlx1NTQwRFwiKVxuICAgICAgLnNldERlc2MoXCJcdTUzRUZcdTgxRUFcdTVCOUFcdTRFNDlcdUZGMENcdTRFMERcdTRGMUFcdTk2OEZcdTY4MDdcdTk4OThcdTgxRUFcdTUyQThcdTUzRDhcdTUzMTZcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XG4gICAgICAgIHRleHQuc2V0UGxhY2Vob2xkZXIodGhpcy5kZWZhdWx0RmlsZU5hbWVCYXNlKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLmRhdGEuZmlsZU5hbWUpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYXRhLmZpbGVOYW1lID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGaWxlTmFtZVByZXZpZXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoXCJcdTU3MzBcdTcwQjlcIilcbiAgICAgIC5zZXREZXNjKFwiXHU1M0VGXHU3NTU5XHU3QTdBXCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgICB0ZXh0LnNldFBsYWNlaG9sZGVyKFwiXHU0RjhCXHU1OTgyXHVGRjFBXHU2RDc3XHU4RkI5XCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuZGF0YS5wbGFjZSlcbiAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRhdGEucGxhY2UgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiXHU0RTNCXHU4MjcyIChhY2NlbnQpXCIpXG4gICAgICAuc2V0RGVzYyhcIlx1Njc2NVx1ODFFQSBsb3ZlLWxpbmtlciBcdThDMDNcdTgyNzJcdTY3N0ZcdUZGMENcdTUzRUZcdTU3MjhcdThCQkVcdTdGNkVcdTkxQ0NcdTYyNjlcdTVDNTVcIilcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+IHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMub3B0aW9ucy5hY2NlbnRPcHRpb25zO1xuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBkcm9wZG93bi5hZGRPcHRpb24odGhpcy5vcHRpb25zLmRlZmF1bHRBY2NlbnQsIHRoaXMub3B0aW9ucy5kZWZhdWx0QWNjZW50KTtcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbikgPT4gZHJvcGRvd24uYWRkT3B0aW9uKG9wdGlvbi52YWx1ZSwgb3B0aW9uLmxhYmVsKSk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMuZGF0YS5hY2NlbnQpLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMuZGF0YS5hY2NlbnQgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiXHU1QzAxXHU5NzYyIChjb3ZlcilcIilcbiAgICAgIC5zZXREZXNjKFwiXHU2NTJGXHU2MzAxXHU1OTE2XHU5NEZFXHVGRjBDXHU0RjhCXHU1OTgyIGh0dHBzOi8veW91ci1pbWFnZS1ob3N0L2NvdmVyLnN2Z1wiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcbiAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcihcImh0dHBzOi8vLi4uXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuZGF0YS5jb3ZlcilcbiAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRhdGEuY292ZXIgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiXHU2NDU4XHU4OTgxIChleGNlcnB0KVwiKVxuICAgICAgLnNldERlc2MoXCJcdTk5OTZcdTk4NzVcdTUzNjFcdTcyNDdcdTY1ODdcdTY4NDhcdUZGMENcdTUzRUZcdTc1NTlcdTdBN0FcIilcbiAgICAgIC5hZGRUZXh0QXJlYSgodGV4dGFyZWEpID0+IHtcbiAgICAgICAgdGV4dGFyZWEuaW5wdXRFbC5yb3dzID0gMztcbiAgICAgICAgdGV4dGFyZWEuc2V0UGxhY2Vob2xkZXIoXCJcdTUxOTlcdTRFMDBcdTUzRTVcdTdCODBcdTc3RURcdTVGMTVcdThBMDBcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5kYXRhLmV4Y2VycHQpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYXRhLmV4Y2VycHQgPSB2YWx1ZS50cmltKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiXHU2ODA3XHU3QjdFICh0YWdzKVwiKVxuICAgICAgLnNldERlc2MoXCJcdTkwMTdcdTUzRjdcdTUyMDZcdTk2OTRcdUZGMENcdTRGOEJcdTU5ODJcdUZGMUFcdTY1QzVcdTkwMTQsIFx1NkY2RVx1NThGMFwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcbiAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcihcIlx1NjVDNVx1OTAxNCwgXHU2RjZFXHU1OEYwXCIpXG4gICAgICAgICAgLnNldFZhbHVlKFwiXCIpXG4gICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYXRhLnRhZ3MgPSBwYXJzZVRhZ3NJbnB1dCh2YWx1ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcbiAgICAgIC5zZXROYW1lKFwiXHU1M0VGXHU4OUMxXHU2MDI3ICh2aXNpYmlsaXR5KVwiKVxuICAgICAgLnNldERlc2MoXCJwdWJsaWMgXHU1QzA2XHU1MUZBXHU3M0IwXHU1NzI4XHU5OTk2XHU5ODc1XHVGRjBDcHJpdmF0ZSBcdTRGMUFcdTlFRDhcdThCQTRcdTk2OTBcdTg1Q0ZcIilcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+IHtcbiAgICAgICAgZHJvcGRvd24uYWRkT3B0aW9uKFwicHVibGljXCIsIFwiXHU1MTZDXHU1RjAwIC8gcHVibGljXCIpO1xuICAgICAgICBkcm9wZG93bi5hZGRPcHRpb24oXCJwcml2YXRlXCIsIFwiXHU3OUMxXHU1QkM2IC8gcHJpdmF0ZVwiKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5kYXRhLnZpc2liaWxpdHkpLm9uQ2hhbmdlKCh2YWx1ZTogXCJwdWJsaWNcIiB8IFwicHJpdmF0ZVwiKSA9PiB7XG4gICAgICAgICAgdGhpcy5kYXRhLnZpc2liaWxpdHkgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuZmlsZU5hbWVQcmV2aWV3RWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcImxvdmUtbGlua2VyLW11dGVkXCIgfSk7XG4gICAgdGhpcy51cGRhdGVGaWxlTmFtZVByZXZpZXcoKTtcblxuICAgIGNvbnN0IGJ1dHRvblJvdyA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibG92ZS1saW5rZXItcm93XCIgfSk7XG4gICAgY29uc3QgY3JlYXRlQnV0dG9uID0gYnV0dG9uUm93LmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTUyMUJcdTVFRkFcdTY1ODdcdTY4NjNcIiB9KTtcbiAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBidXR0b25Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIlx1NTNENlx1NkQ4OFwiIH0pO1xuXG4gICAgY3JlYXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLm9wdGlvbnMub25TdWJtaXQodGhpcy5kYXRhKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlRmlsZU5hbWVQcmV2aWV3KCkge1xuICAgIGlmICghdGhpcy5maWxlTmFtZVByZXZpZXdFbCkgcmV0dXJuO1xuICAgIHRoaXMuZmlsZU5hbWVQcmV2aWV3RWwuc2V0VGV4dChgXHU2NTg3XHU0RUY2XHU1NDBEXHU5ODg0XHU4OUM4XHVGRjFBJHt0aGlzLnJlc29sdmVGaWxlTmFtZSgpfWApO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlRmlsZU5hbWUoKSB7XG4gICAgY29uc3QgcmF3ID0gdGhpcy5kYXRhLmZpbGVOYW1lLnRyaW0oKSB8fCB0aGlzLmRlZmF1bHRGaWxlTmFtZUJhc2U7XG4gICAgaWYgKHJhdy5lbmRzV2l0aChgLiR7dGhpcy5vcHRpb25zLmRlZmF1bHRFeHRlbnNpb259YCkgfHwgcmF3LmluY2x1ZGVzKFwiLlwiKSkge1xuICAgICAgcmV0dXJuIHJhdztcbiAgICB9XG4gICAgcmV0dXJuIGAke3Jhd30uJHt0aGlzLm9wdGlvbnMuZGVmYXVsdEV4dGVuc2lvbn1gO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZERlZmF1bHRGaWxlTmFtZUJhc2UoZGF0ZVZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkYXRlID0gaXNWYWxpZERhdGUoZGF0ZVZhbHVlKSA/IGRhdGVWYWx1ZSA6IGZvcm1hdERhdGUobmV3IERhdGUoKSk7XG4gICAgcmV0dXJuIGAke2RhdGV9LSR7c2x1Z2lmeShcIm1pbGVzdG9uZVwiKX1gO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFNsdWdNb2RhbFJlc3VsdCA9IHtcbiAgc2x1Zzogc3RyaW5nO1xuICBmaWxlTmFtZTogc3RyaW5nO1xuICBmb3JjZVByaXZhdGU6IGJvb2xlYW47XG4gIG1hbmlmZXN0T25seTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjbGFzcyBTbHVnSW5wdXRNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBzbHVnVmFsdWU6IHN0cmluZztcbiAgcHJpdmF0ZSBmaWxlTmFtZVZhbHVlOiBzdHJpbmc7XG4gIHByaXZhdGUgZm9yY2VQcml2YXRlID0gZmFsc2U7XG4gIHByaXZhdGUgbWFuaWZlc3RPbmx5ID0gZmFsc2U7XG4gIHByaXZhdGUgdXNlQ3VzdG9tRmlsZU5hbWUgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBwcml2YXRlIG9wdGlvbnM6IHtcbiAgICAgIGRlZmF1bHRTbHVnOiBzdHJpbmc7XG4gICAgICBleHRlbnNpb246IFwibWRcIiB8IFwibWR4XCI7XG4gICAgICBvblN1Ym1pdDogKHJlc3VsdDogU2x1Z01vZGFsUmVzdWx0KSA9PiB2b2lkO1xuICAgIH1cbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLnNsdWdWYWx1ZSA9IG9wdGlvbnMuZGVmYXVsdFNsdWc7XG4gICAgdGhpcy5maWxlTmFtZVZhbHVlID0gYCR7b3B0aW9ucy5kZWZhdWx0U2x1Z30uJHtvcHRpb25zLmV4dGVuc2lvbn1gO1xuICB9XG5cbiAgb25PcGVuKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJcdThCQkVcdTdGNkVcdTY1ODdcdTdBRTAgc2x1Z1wiIH0pO1xuXG4gICAgY29uc3Qgd2FybmluZ0VsID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJsb3ZlLWxpbmtlci1tdXRlZFwiIH0pO1xuICAgIGNvbnN0IHByZXZpZXdFbCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibG92ZS1saW5rZXItbXV0ZWRcIiB9KTtcblxuICAgIGNvbnN0IHVwZGF0ZVdhcm5pbmcgPSAoKSA9PiB7XG4gICAgICBjb25zdCBpc1ZhbGlkID0gL15bYS16MC05LV0rJC8udGVzdCh0aGlzLnNsdWdWYWx1ZSk7XG4gICAgICB3YXJuaW5nRWwuc2V0VGV4dChcbiAgICAgICAgaXNWYWxpZFxuICAgICAgICAgID8gXCJcdTVFRkFcdThCQUVcdTRFQzVcdTRGN0ZcdTc1MjhcdTVDMEZcdTUxOTlcdTVCNTdcdTZCQ0QgLyBcdTY1NzBcdTVCNTcgLyBcdTc3RURcdTZBMkFcdTdFQkZcdTMwMDJcIlxuICAgICAgICAgIDogXCJcdTVGNTNcdTUyNEQgc2x1ZyBcdTUzMDVcdTU0MkJcdTcyNzlcdTZCOEFcdTVCNTdcdTdCMjZcdUZGMENcdTUzRUZcdTgwRkRcdTVCRkNcdTgxRjQgVVJMIFx1NEUwRFx1NTNDQlx1NTk3RFx1MzAwMlwiXG4gICAgICApO1xuICAgIH07XG5cbiAgICBjb25zdCB1cGRhdGVQcmV2aWV3ID0gKCkgPT4ge1xuICAgICAgcHJldmlld0VsLnNldFRleHQoYFx1OEZEQ1x1N0FFRlx1NjU4N1x1NEVGNlx1NTQwRFx1OTg4NFx1ODlDOFx1RkYxQSR7dGhpcy5yZXNvbHZlRmlsZU5hbWUoKX1gKTtcbiAgICB9O1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoXCJTbHVnXCIpXG4gICAgICAuc2V0RGVzYyhcIlx1NUMwNlx1NzUyOFx1NEU4RVx1N0Y1MVx1N0FEOSBVUkxcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XG4gICAgICAgIHRleHQuc2V0UGxhY2Vob2xkZXIoXCJcdTRGOEJcdTU5ODJcdUZGMUFmaXJzdC10cmlwXCIpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMuc2x1Z1ZhbHVlKVxuICAgICAgICAgIC5vbkNoYW5nZSgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2x1Z1ZhbHVlID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnVzZUN1c3RvbUZpbGVOYW1lKSB7XG4gICAgICAgICAgICAgIHRoaXMuZmlsZU5hbWVWYWx1ZSA9IGAke3RoaXMuc2x1Z1ZhbHVlfS4ke3RoaXMub3B0aW9ucy5leHRlbnNpb259YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVwZGF0ZVdhcm5pbmcoKTtcbiAgICAgICAgICAgIHVwZGF0ZVByZXZpZXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGVudEVsKVxuICAgICAgLnNldE5hbWUoXCJcdTYzQThcdTkwMDFcdTRFM0EgcHJpdmF0ZVwiKVxuICAgICAgLnNldERlc2MoXCJcdTRGMUFcdTUxOTlcdTUxNjVcdTVGNTNcdTUyNERcdTY1ODdcdTRFRjYgZnJvbnRtYXR0ZXIgXHU3Njg0IHZpc2liaWxpdHlcIilcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT4ge1xuICAgICAgICB0b2dnbGUuc2V0VmFsdWUodGhpcy5mb3JjZVByaXZhdGUpLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMuZm9yY2VQcml2YXRlID0gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250ZW50RWwpXG4gICAgICAuc2V0TmFtZShcIlx1OUFEOFx1N0VBN1x1OTAwOVx1OTg3OVwiKVxuICAgICAgLnNldERlc2MoXCJcdTUzRUZcdTgxRUFcdTVCOUFcdTRFNDlcdThGRENcdTdBRUZcdTY1ODdcdTRFRjZcdTU0MERcdTYyMTZcdTUzRUFcdTY2RjRcdTY1QjAgbWFuaWZlc3RcIilcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT4ge1xuICAgICAgICB0b2dnbGUuc2V0VmFsdWUoZmFsc2UpLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHRoaXMudXNlQ3VzdG9tRmlsZU5hbWUgPSB2YWx1ZTtcbiAgICAgICAgICBhZHZhbmNlZENvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gdmFsdWUgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcbiAgICAgICAgICB1cGRhdGVQcmV2aWV3KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBjb25zdCBhZHZhbmNlZENvbnRhaW5lciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibG92ZS1saW5rZXItc2VjdGlvblwiIH0pO1xuICAgIGFkdmFuY2VkQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgIG5ldyBTZXR0aW5nKGFkdmFuY2VkQ29udGFpbmVyKVxuICAgICAgLnNldE5hbWUoXCJcdTgxRUFcdTVCOUFcdTRFNDlcdThGRENcdTdBRUZcdTY1ODdcdTRFRjZcdTU0MERcIilcbiAgICAgIC5zZXREZXNjKFwiXHU0RjhCXHU1OTgyXHVGRjFBbXktcG9zdC5tZFx1RkYwQ1x1NEUwRFx1NTg2Qlx1NTIxOVx1NEY3Rlx1NzUyOCBzbHVnXCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT4ge1xuICAgICAgICB0ZXh0LnNldFBsYWNlaG9sZGVyKGAke3RoaXMuc2x1Z1ZhbHVlfS4ke3RoaXMub3B0aW9ucy5leHRlbnNpb259YClcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5maWxlTmFtZVZhbHVlKVxuICAgICAgICAgIC5vbkNoYW5nZSgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlsZU5hbWVWYWx1ZSA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIHVwZGF0ZVByZXZpZXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoYWR2YW5jZWRDb250YWluZXIpXG4gICAgICAuc2V0TmFtZShcIlx1NEVDNVx1NjZGNFx1NjVCMCBtYW5pZmVzdFwiKVxuICAgICAgLnNldERlc2MoXCJcdTRFMERcdTRFMEFcdTRGMjBcdTVGNTNcdTUyNERcdTY1ODdcdTY4NjNcdUZGMENcdTRFQzVcdTY2RjRcdTY1QjAgc2x1ZyAtPiBmaWxlIFx1NjYyMFx1NUMwNFwiKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PiB7XG4gICAgICAgIHRvZ2dsZS5zZXRWYWx1ZSh0aGlzLm1hbmlmZXN0T25seSkub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgdGhpcy5tYW5pZmVzdE9ubHkgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIHVwZGF0ZVdhcm5pbmcoKTtcbiAgICB1cGRhdGVQcmV2aWV3KCk7XG5cbiAgICBjb25zdCBidXR0b25Sb3cgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcImxvdmUtbGlua2VyLXJvd1wiIH0pO1xuICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGJ1dHRvblJvdy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU3RUU3XHU3RUVEXCIgfSk7XG4gICAgY29uc3QgY2FuY2VsQnV0dG9uID0gYnV0dG9uUm93LmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTUzRDZcdTZEODhcIiB9KTtcblxuICAgIHN1Ym1pdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnNsdWdWYWx1ZS50cmltKCkpIHtcbiAgICAgICAgbmV3IE5vdGljZShcInNsdWcgXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXHUzMDAyXCIsIDMwMDApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoL1tcXFxcL10vLnRlc3QodGhpcy5yZXNvbHZlRmlsZU5hbWUoKSkpIHtcbiAgICAgICAgbmV3IE5vdGljZShcIlx1NjU4N1x1NEVGNlx1NTQwRFx1NEUwRFx1ODBGRFx1NTMwNVx1NTQyQlx1NjU5Q1x1Njc2MFx1MzAwMlwiLCAzMDAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5vcHRpb25zLm9uU3VibWl0KHtcbiAgICAgICAgc2x1ZzogdGhpcy5zbHVnVmFsdWUudHJpbSgpLFxuICAgICAgICBmaWxlTmFtZTogdGhpcy5yZXNvbHZlRmlsZU5hbWUoKSxcbiAgICAgICAgZm9yY2VQcml2YXRlOiB0aGlzLmZvcmNlUHJpdmF0ZSxcbiAgICAgICAgbWFuaWZlc3RPbmx5OiB0aGlzLm1hbmlmZXN0T25seVxuICAgICAgfSk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSk7XG5cbiAgICBjYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XG4gIH1cblxuICBwcml2YXRlIHJlc29sdmVGaWxlTmFtZSgpIHtcbiAgICBpZiAodGhpcy51c2VDdXN0b21GaWxlTmFtZSAmJiB0aGlzLmZpbGVOYW1lVmFsdWUudHJpbSgpKSB7XG4gICAgICBjb25zdCByYXcgPSB0aGlzLmZpbGVOYW1lVmFsdWUudHJpbSgpO1xuICAgICAgaWYgKHJhdy5lbmRzV2l0aChgLiR7dGhpcy5vcHRpb25zLmV4dGVuc2lvbn1gKSB8fCByYXcuaW5jbHVkZXMoXCIuXCIpKSB7XG4gICAgICAgIHJldHVybiByYXc7XG4gICAgICB9XG4gICAgICByZXR1cm4gYCR7cmF3fS4ke3RoaXMub3B0aW9ucy5leHRlbnNpb259YDtcbiAgICB9XG4gICAgcmV0dXJuIGAke3RoaXMuc2x1Z1ZhbHVlfS4ke3RoaXMub3B0aW9ucy5leHRlbnNpb259YDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBDb25maXJtQ2hvaWNlID0gXCJjb25maXJtXCIgfCBcImNhbmNlbFwiO1xuXG5leHBvcnQgY2xhc3MgQ29uZmlybU1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHJlc29sdmVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgYXBwOiBBcHAsXG4gICAgcHJpdmF0ZSBvcHRpb25zOiB7XG4gICAgICB0aXRsZTogc3RyaW5nO1xuICAgICAgbWVzc2FnZTogc3RyaW5nO1xuICAgICAgY29uZmlybVRleHQ/OiBzdHJpbmc7XG4gICAgICBjYW5jZWxUZXh0Pzogc3RyaW5nO1xuICAgICAgb25SZXNvbHZlOiAoY2hvaWNlOiBDb25maXJtQ2hvaWNlKSA9PiB2b2lkO1xuICAgIH1cbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IHRoaXMub3B0aW9ucy50aXRsZSB9KTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogdGhpcy5vcHRpb25zLm1lc3NhZ2UgfSk7XG5cbiAgICBjb25zdCBidXR0b25Sb3cgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcImxvdmUtbGlua2VyLXJvd1wiIH0pO1xuICAgIGNvbnN0IGNvbmZpcm1CdXR0b24gPSBidXR0b25Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgdGV4dDogdGhpcy5vcHRpb25zLmNvbmZpcm1UZXh0ID8/IFwiXHU3ODZFXHU4QkE0XCJcbiAgICB9KTtcbiAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBidXR0b25Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiB0aGlzLm9wdGlvbnMuY2FuY2VsVGV4dCA/PyBcIlx1NTNENlx1NkQ4OFwiIH0pO1xuXG4gICAgY29uZmlybUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5yZXNvbHZlKFwiY29uZmlybVwiKSk7XG4gICAgY2FuY2VsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLnJlc29sdmUoXCJjYW5jZWxcIikpO1xuICB9XG5cbiAgb25DbG9zZSgpIHtcbiAgICBpZiAoIXRoaXMucmVzb2x2ZWQpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vblJlc29sdmUoXCJjYW5jZWxcIik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlKGNob2ljZTogQ29uZmlybUNob2ljZSkge1xuICAgIHRoaXMucmVzb2x2ZWQgPSB0cnVlO1xuICAgIHRoaXMub3B0aW9ucy5vblJlc29sdmUoY2hvaWNlKTtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29uZmxpY3RDaG9pY2UgPSBcIm92ZXJ3cml0ZVwiIHwgXCJjaGFuZ2VcIiB8IFwiY2FuY2VsXCI7XG5cbmV4cG9ydCBjbGFzcyBTbHVnQ29uZmxpY3RNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSByZXNvbHZlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHByaXZhdGUgb3B0aW9uczoge1xuICAgICAgc2x1Zzogc3RyaW5nO1xuICAgICAgZXhpc3RpbmdGaWxlOiBzdHJpbmc7XG4gICAgICBvblJlc29sdmU6IChjaG9pY2U6IENvbmZsaWN0Q2hvaWNlKSA9PiB2b2lkO1xuICAgIH1cbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiU2x1ZyBcdTVERjJcdTVCNThcdTU3MjhcIiB9KTtcbiAgICBjb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHtcbiAgICAgIHRleHQ6IGBcdThGRENcdTdBRUZcdTVERjJcdTVCNThcdTU3Mjggc2x1ZzogJHt0aGlzLm9wdGlvbnMuc2x1Z31cdUZGMDhcdTY1ODdcdTRFRjZcdUZGMUEke3RoaXMub3B0aW9ucy5leGlzdGluZ0ZpbGV9XHVGRjA5XHUzMDAyXHU4QkY3XHU5MDA5XHU2MkU5XHU1OTA0XHU3NDA2XHU2NUI5XHU1RjBGXHUzMDAyYFxuICAgIH0pO1xuXG4gICAgY29uc3QgYnV0dG9uUm93ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJsb3ZlLWxpbmtlci1yb3dcIiB9KTtcbiAgICBjb25zdCBvdmVyd3JpdGVCdXR0b24gPSBidXR0b25Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIlx1ODk4Nlx1NzZENlwiIH0pO1xuICAgIGNvbnN0IGNoYW5nZUJ1dHRvbiA9IGJ1dHRvblJvdy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU2NTM5IHNsdWdcIiB9KTtcbiAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBidXR0b25Sb3cuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIlx1NTNENlx1NkQ4OFwiIH0pO1xuXG4gICAgb3ZlcndyaXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLnJlc29sdmUoXCJvdmVyd3JpdGVcIikpO1xuICAgIGNoYW5nZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5yZXNvbHZlKFwiY2hhbmdlXCIpKTtcbiAgICBjYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMucmVzb2x2ZShcImNhbmNlbFwiKSk7XG4gIH1cblxuICBvbkNsb3NlKCkge1xuICAgIGlmICghdGhpcy5yZXNvbHZlZCkge1xuICAgICAgdGhpcy5vcHRpb25zLm9uUmVzb2x2ZShcImNhbmNlbFwiKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlc29sdmUoY2hvaWNlOiBDb25mbGljdENob2ljZSkge1xuICAgIHRoaXMucmVzb2x2ZWQgPSB0cnVlO1xuICAgIHRoaXMub3B0aW9ucy5vblJlc29sdmUoY2hvaWNlKTtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgTG92ZUxpbmtlclB1Ymxpc2hlclBsdWdpbiBmcm9tIFwiLi9tYWluXCI7XG5pbXBvcnQgdHlwZSB7IE1hbmlmZXN0SXRlbSB9IGZyb20gXCIuL3dlYmRhdlR5cGVzXCI7XG5cbmV4cG9ydCBjb25zdCBWSUVXX1RZUEUgPSBcImxvdmUtbGlua2VyLXB1Ymxpc2gtcGFuZWxcIjtcblxuZXhwb3J0IGNsYXNzIFB1Ymxpc2hQYW5lbFZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgZmlsZUluZm9FbD86IEhUTUxEaXZFbGVtZW50O1xuICBwcml2YXRlIHZhbGlkYXRpb25FbD86IEhUTUxEaXZFbGVtZW50O1xuICBwcml2YXRlIHByb2dyZXNzRWw/OiBIVE1MRGl2RWxlbWVudDtcbiAgcHJpdmF0ZSByZW1vdGVJbmZvRWw/OiBIVE1MRGl2RWxlbWVudDtcbiAgcHJpdmF0ZSBtYW5pZmVzdExpc3RFbD86IEhUTUxVTGlzdEVsZW1lbnQ7XG4gIHByaXZhdGUgbWFuaWZlc3RTdGF0dXNFbD86IEhUTUxEaXZFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHByaXZhdGUgcGx1Z2luOiBMb3ZlTGlua2VyUHVibGlzaGVyUGx1Z2luKSB7XG4gICAgc3VwZXIobGVhZik7XG4gIH1cblxuICBnZXRWaWV3VHlwZSgpIHtcbiAgICByZXR1cm4gVklFV19UWVBFO1xuICB9XG5cbiAgZ2V0RGlzcGxheVRleHQoKSB7XG4gICAgcmV0dXJuIFwiTG92ZSBMaW5rZXIgXHU1M0QxXHU1RTAzXHU5NzYyXHU2NzdGXCI7XG4gIH1cblxuICBnZXRJY29uKCkge1xuICAgIHJldHVybiBcInBhcGVyLXBsYW5lXCI7XG4gIH1cblxuICBhc3luYyBvbk9wZW4oKSB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKSB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICBjb250ZW50RWwuYWRkQ2xhc3MoXCJsb3ZlLWxpbmtlci1wYW5lbFwiKTtcblxuICAgIGNvbnN0IGZpbGVTZWN0aW9uID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJsb3ZlLWxpbmtlci1zZWN0aW9uXCIgfSk7XG4gICAgZmlsZVNlY3Rpb24uY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiXHU1RjUzXHU1MjREXHU2NTg3XHU0RUY2XCIgfSk7XG4gICAgdGhpcy5maWxlSW5mb0VsID0gZmlsZVNlY3Rpb24uY3JlYXRlRGl2KCk7XG4gICAgdGhpcy52YWxpZGF0aW9uRWwgPSBmaWxlU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6IFwibG92ZS1saW5rZXItbXV0ZWRcIiB9KTtcblxuICAgIGNvbnN0IGZpbGVCdXR0b25zID0gZmlsZVNlY3Rpb24uY3JlYXRlRGl2KHsgY2xzOiBcImxvdmUtbGlua2VyLXJvd1wiIH0pO1xuICAgIGZpbGVCdXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTY1QjBcdTVFRkFcdTY1ODdcdTdBRTBcIiB9KS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5wbHVnaW4ub3Blbk5ld0FydGljbGVNb2RhbCgpO1xuICAgIH0pO1xuICAgIGZpbGVCdXR0b25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTYzQThcdTkwMDEvXHU2NkY0XHU2NUIwXHU1RjUzXHU1MjREXHU2NTg3XHU3QUUwXCIgfSkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucGx1Z2luLnB1c2hDdXJyZW50RmlsZSh7XG4gICAgICAgIHByb2dyZXNzOiAobWVzc2FnZSkgPT4gdGhpcy5zZXRQcm9ncmVzcyhtZXNzYWdlKVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCByZW1vdGVTZWN0aW9uID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJsb3ZlLWxpbmtlci1zZWN0aW9uXCIgfSk7XG4gICAgcmVtb3RlU2VjdGlvbi5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJcdThGRENcdTdBRUZcdTcyQjZcdTYwMDFcIiB9KTtcbiAgICB0aGlzLnJlbW90ZUluZm9FbCA9IHJlbW90ZVNlY3Rpb24uY3JlYXRlRGl2KHsgY2xzOiBcImxvdmUtbGlua2VyLW11dGVkXCIgfSk7XG5cbiAgICBjb25zdCByZW1vdGVCdXR0b25zID0gcmVtb3RlU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6IFwibG92ZS1saW5rZXItcm93XCIgfSk7XG4gICAgcmVtb3RlQnV0dG9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU2RDRCXHU4QkQ1XHU4RkRFXHU2M0E1XCIgfSkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucGx1Z2luLnRlc3RDb25uZWN0aW9uKCk7XG4gICAgfSk7XG4gICAgcmVtb3RlQnV0dG9ucy5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU4QkZCXHU1M0Q2IG1hbmlmZXN0XCIgfSkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMubG9hZE1hbmlmZXN0UHJldmlldygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5tYW5pZmVzdFN0YXR1c0VsID0gcmVtb3RlU2VjdGlvbi5jcmVhdGVEaXYoeyBjbHM6IFwibG92ZS1saW5rZXItbXV0ZWRcIiB9KTtcbiAgICB0aGlzLm1hbmlmZXN0TGlzdEVsID0gcmVtb3RlU2VjdGlvbi5jcmVhdGVFbChcInVsXCIsIHsgY2xzOiBcImxvdmUtbGlua2VyLW1hbmlmZXN0LWxpc3RcIiB9KTtcblxuICAgIGNvbnN0IHByb2dyZXNzU2VjdGlvbiA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwibG92ZS1saW5rZXItc2VjdGlvblwiIH0pO1xuICAgIHByb2dyZXNzU2VjdGlvbi5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJcdTYzQThcdTkwMDEvXHU2NkY0XHU2NUIwXHU4RkRCXHU1RUE2XCIgfSk7XG4gICAgdGhpcy5wcm9ncmVzc0VsID0gcHJvZ3Jlc3NTZWN0aW9uLmNyZWF0ZURpdih7IGNsczogXCJsb3ZlLWxpbmtlci1zdGF0dXNcIiB9KTtcbiAgICB0aGlzLnNldFByb2dyZXNzKFwiXHU3QjQ5XHU1Rjg1XHU2NENEXHU0RjVDXCIpO1xuXG4gICAgdGhpcy5yZWZyZXNoKCk7XG4gIH1cblxuICBhc3luYyByZWZyZXNoKCkge1xuICAgIGF3YWl0IHRoaXMucmVmcmVzaEZpbGVTdGF0dXMoKTtcbiAgICB0aGlzLnJlZnJlc2hSZW1vdGVJbmZvKCk7XG4gIH1cblxuICBhc3luYyByZWZyZXNoRmlsZVN0YXR1cygpIHtcbiAgICBpZiAoIXRoaXMuZmlsZUluZm9FbCB8fCAhdGhpcy52YWxpZGF0aW9uRWwpIHJldHVybjtcbiAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCB0aGlzLnBsdWdpbi5nZXRBY3RpdmVGaWxlU3RhdHVzKCk7XG4gICAgdGhpcy52YWxpZGF0aW9uRWwucmVtb3ZlQ2xhc3MoXCJsb3ZlLWxpbmtlci1kYW5nZXJcIik7XG4gICAgaWYgKCFzdGF0dXMuZmlsZSkge1xuICAgICAgdGhpcy5maWxlSW5mb0VsLnNldFRleHQoXCJcdTY3MkFcdTYyNTNcdTVGMDAgTWFya2Rvd24gXHU2NTg3XHU0RUY2XCIpO1xuICAgICAgdGhpcy52YWxpZGF0aW9uRWwuc2V0VGV4dChcIlx1NjI1M1x1NUYwMFx1NjU4N1x1NEVGNlx1NTQwRVx1NTNFRlx1NjhDMFx1NjdFNSBmcm9udG1hdHRlclx1MzAwMlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlTGluZSA9IGAke3N0YXR1cy5maWxlLnBhdGh9YDtcbiAgICB0aGlzLmZpbGVJbmZvRWwuc2V0VGV4dChgXHU1RjUzXHU1MjREXHU2NTg3XHU0RUY2XHVGRjFBJHtmaWxlTGluZX1gKTtcblxuICAgIGlmICghc3RhdHVzLmhhc0Zyb250bWF0dGVyKSB7XG4gICAgICB0aGlzLnZhbGlkYXRpb25FbC5zZXRUZXh0KFwiXHU2NzJBXHU2OEMwXHU2RDRCXHU1MjMwIGZyb250bWF0dGVyXHUzMDAyXHU4QkY3XHU1MTQ4XHU1MjFCXHU1RUZBIFlBTUwgXHU1NzU3XHUzMDAyXCIpO1xuICAgICAgdGhpcy52YWxpZGF0aW9uRWwuYWRkQ2xhc3MoXCJsb3ZlLWxpbmtlci1kYW5nZXJcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHN0YXR1cy52YWxpZGF0aW9uLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnZhbGlkYXRpb25FbC5zZXRUZXh0KGBcdTY4MjFcdTlBOENcdTU5MzFcdThEMjVcdUZGMUEke3N0YXR1cy52YWxpZGF0aW9uLmVycm9ycy5qb2luKFwiXHVGRjFCXCIpfWApO1xuICAgICAgdGhpcy52YWxpZGF0aW9uRWwuYWRkQ2xhc3MoXCJsb3ZlLWxpbmtlci1kYW5nZXJcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgd2FybmluZ3MgPSBzdGF0dXMudmFsaWRhdGlvbi53YXJuaW5ncy5sZW5ndGggPiAwID8gYFx1RkYwOFx1NjNEMFx1NzkzQVx1RkYxQSR7c3RhdHVzLnZhbGlkYXRpb24ud2FybmluZ3Muam9pbihcIlx1RkYxQlwiKX0pYCA6IFwiXCI7XG4gICAgY29uc3QgcHJpdmF0ZU5vdGUgPSBzdGF0dXMudmFsaWRhdGlvbi5pc1ByaXZhdGUgPyBcIlx1RkYwOFx1NUY1M1x1NTI0RFx1NEUzQSBwcml2YXRlXHVGRjA5XCIgOiBcIlwiO1xuICAgIHRoaXMudmFsaWRhdGlvbkVsLnNldFRleHQoYFx1NjgyMVx1OUE4Q1x1OTAxQVx1OEZDNyAke3ByaXZhdGVOb3RlfSAke3dhcm5pbmdzfWAudHJpbSgpKTtcbiAgICB0aGlzLnZhbGlkYXRpb25FbC5yZW1vdmVDbGFzcyhcImxvdmUtbGlua2VyLWRhbmdlclwiKTtcbiAgfVxuXG4gIHJlZnJlc2hSZW1vdGVJbmZvKCkge1xuICAgIGlmICghdGhpcy5yZW1vdGVJbmZvRWwpIHJldHVybjtcbiAgICBjb25zdCBpbmZvID0gdGhpcy5wbHVnaW4uZ2V0UmVtb3RlSW5mbygpO1xuICAgIGlmICghaW5mby5iYXNlVXJsKSB7XG4gICAgICB0aGlzLnJlbW90ZUluZm9FbC5zZXRUZXh0KFwiXHU2NzJBXHU5MTREXHU3RjZFIFdlYkRBVlx1MzAwMlx1OEJGN1x1NTE0OFx1NTcyOFx1OEJCRVx1N0Y2RVx1NEUyRFx1NTg2Qlx1NTE5OVx1MzAwMlwiKTtcbiAgICAgIHRoaXMucmVtb3RlSW5mb0VsLmFkZENsYXNzKFwibG92ZS1saW5rZXItZGFuZ2VyXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVtb3RlSW5mb0VsLnJlbW92ZUNsYXNzKFwibG92ZS1saW5rZXItZGFuZ2VyXCIpO1xuICAgIHRoaXMucmVtb3RlSW5mb0VsLnNldFRleHQoYEJhc2UgVVJMOiAke2luZm8uYmFzZVVybH0gfCBcdTc2RUVcdTVGNTU6ICR7aW5mby5jb250ZW50RGlyfWApO1xuICB9XG5cbiAgc2V0UHJvZ3Jlc3MobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLnByb2dyZXNzRWwpIHJldHVybjtcbiAgICB0aGlzLnByb2dyZXNzRWwuc2V0VGV4dChtZXNzYWdlKTtcbiAgfVxuXG4gIGFzeW5jIGxvYWRNYW5pZmVzdFByZXZpZXcoKSB7XG4gICAgaWYgKCF0aGlzLm1hbmlmZXN0TGlzdEVsIHx8ICF0aGlzLm1hbmlmZXN0U3RhdHVzRWwpIHJldHVybjtcbiAgICB0aGlzLm1hbmlmZXN0U3RhdHVzRWwuc2V0VGV4dChcIlx1NkI2M1x1NTcyOFx1NjJDOVx1NTNENiBtYW5pZmVzdC4uLlwiKTtcbiAgICB0aGlzLm1hbmlmZXN0TGlzdEVsLmVtcHR5KCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5wbHVnaW4uZmV0Y2hNYW5pZmVzdFByZXZpZXcoKTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgdGhpcy5tYW5pZmVzdFN0YXR1c0VsLnNldFRleHQoXCJcdThCRkJcdTUzRDZcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTY4QzBcdTY3RTVcdThCQkVcdTdGNkVcdTRFMEVcdTdGNTFcdTdFRENcdTMwMDJcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbXMgPSByZXN1bHQuaXRlbXMgYXMgTWFuaWZlc3RJdGVtW107XG4gICAgY29uc3QgbGltaXQgPSByZXN1bHQubGltaXQ7XG4gICAgdGhpcy5tYW5pZmVzdFN0YXR1c0VsLnNldFRleHQoYFx1NURGMlx1OEJGQlx1NTNENlx1NTI0RCAke01hdGgubWluKGl0ZW1zLmxlbmd0aCwgbGltaXQpfSBcdTY3NjFcdUZGMUFgKTtcblxuICAgIGl0ZW1zLnNsaWNlKDAsIGxpbWl0KS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBsaSA9IHRoaXMubWFuaWZlc3RMaXN0RWw/LmNyZWF0ZUVsKFwibGlcIik7XG4gICAgICBsaT8uc2V0VGV4dChgJHtpdGVtLnNsdWd9IFx1MjE5MiAke2l0ZW0uZmlsZX1gKTtcbiAgICB9KTtcbiAgfVxufVxuIiwgImltcG9ydCB7IHJlcXVlc3RVcmwgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIHsgTG92ZUxpbmtlclNldHRpbmdzIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIFdlYkRhdkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBzdGF0dXM/OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGF0dXM/OiBudW1iZXIpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIldlYkRhdkVycm9yXCI7XG4gICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIH1cbn1cblxuY29uc3Qgbm9ybWFsaXplQmFzZVVybCA9ICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZS50cmltKCkucmVwbGFjZSgvXFwvKyQvLCBcIlwiKTtcblxuY29uc3Qgbm9ybWFsaXplU2VnbWVudCA9ICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZS50cmltKCkucmVwbGFjZSgvXlxcLyt8XFwvKyQvZywgXCJcIik7XG5cbmNvbnN0IGVuY29kZVBhdGggPSAodmFsdWU6IHN0cmluZykgPT5cbiAgdmFsdWVcbiAgICAuc3BsaXQoXCIvXCIpXG4gICAgLm1hcCgoc2VnbWVudCkgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHNlZ21lbnQpKVxuICAgIC5qb2luKFwiL1wiKTtcblxuY29uc3QgZW5jb2RlVXRmOEJ5dGVzID0gKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgaWYgKHR5cGVvZiBUZXh0RW5jb2RlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodmFsdWUpO1xuICB9XG4gIGNvbnN0IGVuY29kZWQgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICBjb25zdCBieXRlczogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmNvZGVkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgY29uc3QgY2hhciA9IGVuY29kZWRbaV07XG4gICAgaWYgKGNoYXIgPT09IFwiJVwiKSB7XG4gICAgICBjb25zdCBoZXggPSBlbmNvZGVkLnNsaWNlKGkgKyAxLCBpICsgMyk7XG4gICAgICBieXRlcy5wdXNoKHBhcnNlSW50KGhleCwgMTYpKTtcbiAgICAgIGkgKz0gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgYnl0ZXMucHVzaChjaGFyLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnl0ZXMpO1xufTtcblxuY29uc3QgZW5jb2RlQmFzZTY0ID0gKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gYnRvYShcbiAgICAgIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkucmVwbGFjZSgvJShbMC05QS1GXXsyfSkvZywgKF8sIGhleCkgPT5cbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChoZXgsIDE2KSlcbiAgICAgIClcbiAgICApO1xuICB9XG4gIGlmICh0eXBlb2YgQnVmZmVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHZhbHVlLCBcInV0ZjhcIikudG9TdHJpbmcoXCJiYXNlNjRcIik7XG4gIH1cbiAgY29uc3QgYnl0ZXMgPSBlbmNvZGVVdGY4Qnl0ZXModmFsdWUpO1xuICBjb25zdCBjaGFycyA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiO1xuICBsZXQgb3V0cHV0ID0gXCJcIjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMykge1xuICAgIGNvbnN0IGEgPSBieXRlc1tpXTtcbiAgICBjb25zdCBiID0gaSArIDEgPCBieXRlcy5sZW5ndGggPyBieXRlc1tpICsgMV0gOiAwO1xuICAgIGNvbnN0IGMgPSBpICsgMiA8IGJ5dGVzLmxlbmd0aCA/IGJ5dGVzW2kgKyAyXSA6IDA7XG4gICAgY29uc3QgdHJpcGxlID0gKGEgPDwgMTYpIHwgKGIgPDwgOCkgfCBjO1xuICAgIG91dHB1dCArPSBjaGFyc1sodHJpcGxlID4+IDE4KSAmIDYzXTtcbiAgICBvdXRwdXQgKz0gY2hhcnNbKHRyaXBsZSA+PiAxMikgJiA2M107XG4gICAgb3V0cHV0ICs9IGkgKyAxIDwgYnl0ZXMubGVuZ3RoID8gY2hhcnNbKHRyaXBsZSA+PiA2KSAmIDYzXSA6IFwiPVwiO1xuICAgIG91dHB1dCArPSBpICsgMiA8IGJ5dGVzLmxlbmd0aCA/IGNoYXJzW3RyaXBsZSAmIDYzXSA6IFwiPVwiO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG5leHBvcnQgY2xhc3MgV2ViRGF2Q2xpZW50IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBnZXRTZXR0aW5nczogKCkgPT4gTG92ZUxpbmtlclNldHRpbmdzKSB7fVxuXG4gIGJ1aWxkVXJsKHBhdGhQYXJ0czogc3RyaW5nW10pIHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcbiAgICBjb25zdCBiYXNlVXJsID0gbm9ybWFsaXplQmFzZVVybChzZXR0aW5ncy53ZWJkYXZCYXNlVXJsKTtcbiAgICBpZiAoIWJhc2VVcmwpIHRocm93IG5ldyBXZWJEYXZFcnJvcihcIlx1NjcyQVx1OTE0RFx1N0Y2RSBXRUJEQVZfQkFTRV9VUkxcdTMwMDJcdThCRjdcdTUxNDhcdTU3MjhcdThCQkVcdTdGNkVcdTRFMkRcdTU4NkJcdTUxOTlcdTMwMDJcIiwgMCk7XG5cbiAgICBjb25zdCBwYXRoID0gcGF0aFBhcnRzXG4gICAgICAubWFwKChwYXJ0KSA9PiBub3JtYWxpemVTZWdtZW50KHBhcnQpKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgLm1hcChlbmNvZGVQYXRoKVxuICAgICAgLmpvaW4oXCIvXCIpO1xuXG4gICAgcmV0dXJuIGAke2Jhc2VVcmx9LyR7cGF0aH1gO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBdXRoSGVhZGVyKCkge1xuICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy5nZXRTZXR0aW5ncygpO1xuICAgIGlmICghc2V0dGluZ3Mud2ViZGF2VXNlcm5hbWUgfHwgIXNldHRpbmdzLndlYmRhdlBhc3N3b3JkKSB7XG4gICAgICB0aHJvdyBuZXcgV2ViRGF2RXJyb3IoXCJcdTY3MkFcdTkxNERcdTdGNkUgV0VCREFWX1VTRVJOQU1FIFx1NjIxNiBXRUJEQVZfUEFTU1dPUkRcdTMwMDJcIiwgMCk7XG4gICAgfVxuICAgIGNvbnN0IHRva2VuID0gZW5jb2RlQmFzZTY0KGAke3NldHRpbmdzLndlYmRhdlVzZXJuYW1lfToke3NldHRpbmdzLndlYmRhdlBhc3N3b3JkfWApO1xuICAgIHJldHVybiBgQmFzaWMgJHt0b2tlbn1gO1xuICB9XG5cbiAgYXN5bmMgZ2V0VGV4dChwYXRoUGFydHM6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgdXJsID0gdGhpcy5idWlsZFVybChwYXRoUGFydHMpO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XG4gICAgICB1cmwsXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IHRoaXMuZ2V0QXV0aEhlYWRlcigpXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgIHRocm93IG5ldyBXZWJEYXZFcnJvcihgV2ViREFWIFx1OEJGN1x1NkM0Mlx1NTkzMVx1OEQyNSAoJHtyZXNwb25zZS5zdGF0dXN9KWAsIHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlLnRleHQ7XG4gIH1cblxuICBhc3luYyBnZXRKc29uPFQ+KHBhdGhQYXJ0czogc3RyaW5nW10pOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgdGhpcy5nZXRUZXh0KHBhdGhQYXJ0cyk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHRleHQpIGFzIFQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBXZWJEYXZFcnJvcihcIlx1OEZEQ1x1N0FFRlx1OEZENFx1NTZERVx1NzY4NCBKU09OIFx1ODlFM1x1Njc5MFx1NTkzMVx1OEQyNVx1MzAwMlwiLCAwKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjaGVja0Nvbm5lY3Rpb24oKSB7XG4gICAgY29uc3QgdXJsID0gdGhpcy5idWlsZFVybChbXSk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcbiAgICAgIHVybCxcbiAgICAgIG1ldGhvZDogXCJQUk9QRklORFwiLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBdXRob3JpemF0aW9uOiB0aGlzLmdldEF1dGhIZWFkZXIoKSxcbiAgICAgICAgRGVwdGg6IFwiMFwiXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA+PSAzMDApIHtcbiAgICAgIHRocm93IG5ldyBXZWJEYXZFcnJvcihgV2ViREFWIFx1OEZERVx1NjNBNVx1NTkzMVx1OEQyNSAoJHtyZXNwb25zZS5zdGF0dXN9KWAsIHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZW5zdXJlRGlyZWN0b3J5KHBhdGhQYXJ0czogc3RyaW5nW10pIHtcbiAgICBjb25zdCB1cmwgPSB0aGlzLmJ1aWxkVXJsKHBhdGhQYXJ0cyk7XG4gICAgY29uc3QgYXV0aEhlYWRlciA9IHRoaXMuZ2V0QXV0aEhlYWRlcigpO1xuICAgIGNvbnN0IGV4aXN0c1Jlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XG4gICAgICB1cmwsXG4gICAgICBtZXRob2Q6IFwiUFJPUEZJTkRcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYXV0aEhlYWRlcixcbiAgICAgICAgRGVwdGg6IFwiMFwiXG4gICAgICB9LFxuICAgICAgdGhyb3c6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBpZiAoZXhpc3RzUmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiBleGlzdHNSZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGV4aXN0c1Jlc3BvbnNlLnN0YXR1cyA9PT0gNDAxIHx8IGV4aXN0c1Jlc3BvbnNlLnN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICB0aHJvdyBuZXcgV2ViRGF2RXJyb3IoYFdlYkRBViBcdTc2RUVcdTVGNTVcdThCQkZcdTk1RUVcdTU5MzFcdThEMjUgKCR7ZXhpc3RzUmVzcG9uc2Uuc3RhdHVzfSlgLCBleGlzdHNSZXNwb25zZS5zdGF0dXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZVJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdFVybCh7XG4gICAgICB1cmwsXG4gICAgICBtZXRob2Q6IFwiTUtDT0xcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYXV0aEhlYWRlclxuICAgICAgfSxcbiAgICAgIHRocm93OiBmYWxzZVxuICAgIH0pO1xuXG4gICAgaWYgKGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgY3JlYXRlUmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgIGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyA9PT0gMzAxIHx8XG4gICAgICBjcmVhdGVSZXNwb25zZS5zdGF0dXMgPT09IDMwMiB8fFxuICAgICAgY3JlYXRlUmVzcG9uc2Uuc3RhdHVzID09PSAzMDcgfHxcbiAgICAgIGNyZWF0ZVJlc3BvbnNlLnN0YXR1cyA9PT0gMzA4IHx8XG4gICAgICBjcmVhdGVSZXNwb25zZS5zdGF0dXMgPT09IDQwNVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgV2ViRGF2RXJyb3IoYFdlYkRBViBcdTc2RUVcdTVGNTVcdTUyMUJcdTVFRkFcdTU5MzFcdThEMjUgKCR7Y3JlYXRlUmVzcG9uc2Uuc3RhdHVzfSlgLCBjcmVhdGVSZXNwb25zZS5zdGF0dXMpO1xuICB9XG5cbiAgYXN5bmMgcHV0VGV4dChwYXRoUGFydHM6IHN0cmluZ1tdLCB0ZXh0OiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBzdHJpbmcpIHtcbiAgICBjb25zdCB1cmwgPSB0aGlzLmJ1aWxkVXJsKHBhdGhQYXJ0cyk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0VXJsKHtcbiAgICAgIHVybCxcbiAgICAgIG1ldGhvZDogXCJQVVRcIixcbiAgICAgIGJvZHk6IHRleHQsXG4gICAgICBjb250ZW50VHlwZSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogdGhpcy5nZXRBdXRoSGVhZGVyKClcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzID49IDMwMCkge1xuICAgICAgdGhyb3cgbmV3IFdlYkRhdkVycm9yKGBXZWJEQVYgXHU0RTBBXHU0RjIwXHU1OTMxXHU4RDI1ICgke3Jlc3BvbnNlLnN0YXR1c30pYCwgcmVzcG9uc2Uuc3RhdHVzKTtcbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQU1POzs7QUNOUCxzQkFBK0M7QUFHeEMsSUFBTSx1QkFBTixjQUFtQyxpQ0FBaUI7QUFBQSxFQUN6RCxZQUFZLEtBQWtCLFFBQW1DO0FBQy9ELFVBQU0sS0FBSyxNQUFNO0FBRFc7QUFBQSxFQUU5QjtBQUFBLEVBRUEsVUFBZ0I7QUFDZCxVQUFNLEVBQUUsWUFBWSxJQUFJO0FBQ3hCLGdCQUFZLE1BQU07QUFFbEIsZ0JBQVksU0FBUyxNQUFNLEVBQUUsTUFBTSxxQ0FBMkIsQ0FBQztBQUUvRCxRQUFJLHdCQUFRLFdBQVcsRUFDcEIsUUFBUSxpQkFBaUIsRUFDekIsUUFBUSxpR0FBb0QsRUFDNUQ7QUFBQSxNQUFRLENBQUMsU0FDUixLQUNHLGVBQWUsYUFBYSxFQUM1QixTQUFTLEtBQUssT0FBTyxTQUFTLGFBQWEsRUFDM0MsU0FBUyxPQUFPLFVBQVU7QUFDekIsYUFBSyxPQUFPLFNBQVMsZ0JBQWdCLE1BQU0sS0FBSztBQUNo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LHdCQUFPLEtBQUssa0JBQWtCLE9BQU8sc0NBQVEsR0FBRyxHQUFJO0FBQ3hELGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUFBLEVBRVEsa0JBQWtCLE9BQWdCLFFBQWdCO0FBQ3hELFFBQUksaUJBQWlCLGFBQWE7QUFDaEMsVUFBSSxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsS0FBSztBQUNoRCxlQUFPLEdBQUcsTUFBTTtBQUFBLE1BQ2xCO0FBQ0EsVUFBSSxNQUFNLFdBQVcsS0FBSztBQUN4QixlQUFPLEdBQUcsTUFBTTtBQUFBLE1BQ2xCO0FBQ0EsVUFBSSxNQUFNLFFBQVE7QUFDaEIsZUFBTyxHQUFHLE1BQU0sMEJBQVcsTUFBTSxNQUFNO0FBQUEsTUFDekM7QUFDQSxhQUFPLEdBQUcsTUFBTSxxQkFBTSxNQUFNLE9BQU87QUFBQSxJQUNyQztBQUNBLFFBQUksaUJBQWlCLE9BQU87QUFDMUIsYUFBTyxHQUFHLE1BQU0scUJBQU0sTUFBTSxPQUFPO0FBQUEsSUFDckM7QUFDQSxXQUFPLEdBQUcsTUFBTTtBQUFBLEVBQ2xCO0FBQ0Y7IiwKICAibmFtZXMiOiBbImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiX2EiXQp9Cg==
