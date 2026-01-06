import { ItemView, WorkspaceLeaf } from "obsidian";
import type LoveLinkerPublisherPlugin from "./main";
import type { ManifestItem } from "./webdavTypes";

export const VIEW_TYPE = "love-linker-publish-panel";

export class PublishPanelView extends ItemView {
  private fileInfoEl?: HTMLDivElement;
  private validationEl?: HTMLDivElement;
  private progressEl?: HTMLDivElement;
  private remoteInfoEl?: HTMLDivElement;
  private manifestListEl?: HTMLUListElement;
  private manifestStatusEl?: HTMLDivElement;

  constructor(leaf: WorkspaceLeaf, private plugin: LoveLinkerPublisherPlugin) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Love Linker 发布面板";
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
    fileSection.createEl("h3", { text: "当前文件" });
    this.fileInfoEl = fileSection.createDiv();
    this.validationEl = fileSection.createDiv({ cls: "love-linker-muted" });

    const fileButtons = fileSection.createDiv({ cls: "love-linker-row" });
    fileButtons.createEl("button", { text: "新建文章" }).addEventListener("click", () => {
      this.plugin.openNewArticleModal();
    });
    fileButtons.createEl("button", { text: "推送当前文章" }).addEventListener("click", () => {
      this.plugin.pushCurrentFile({
        progress: (message) => this.setProgress(message)
      });
    });

    const remoteSection = contentEl.createDiv({ cls: "love-linker-section" });
    remoteSection.createEl("h3", { text: "远端状态" });
    this.remoteInfoEl = remoteSection.createDiv({ cls: "love-linker-muted" });

    const remoteButtons = remoteSection.createDiv({ cls: "love-linker-row" });
    remoteButtons.createEl("button", { text: "测试连接" }).addEventListener("click", () => {
      this.plugin.testConnection();
    });
    remoteButtons.createEl("button", { text: "读取 manifest" }).addEventListener("click", () => {
      this.loadManifestPreview();
    });

    this.manifestStatusEl = remoteSection.createDiv({ cls: "love-linker-muted" });
    this.manifestListEl = remoteSection.createEl("ul", { cls: "love-linker-manifest-list" });

    const progressSection = contentEl.createDiv({ cls: "love-linker-section" });
    progressSection.createEl("h3", { text: "推送进度" });
    this.progressEl = progressSection.createDiv({ cls: "love-linker-status" });
    this.setProgress("等待操作");

    this.refresh();
  }

  async refresh() {
    await this.refreshFileStatus();
    this.refreshRemoteInfo();
  }

  async refreshFileStatus() {
    if (!this.fileInfoEl || !this.validationEl) return;
    const status = await this.plugin.getActiveFileStatus();
    this.validationEl.removeClass("love-linker-danger");
    if (!status.file) {
      this.fileInfoEl.setText("未打开 Markdown/MDX 文件");
      this.validationEl.setText("打开文件后可检查 frontmatter。");
      return;
    }

    const fileLine = `${status.file.path}`;
    this.fileInfoEl.setText(`当前文件：${fileLine}`);

    if (!status.hasFrontmatter) {
      this.validationEl.setText("未检测到 frontmatter。请先创建 YAML 块。");
      this.validationEl.addClass("love-linker-danger");
      return;
    }

    if (status.validation.errors.length > 0) {
      this.validationEl.setText(`校验失败：${status.validation.errors.join("；")}`);
      this.validationEl.addClass("love-linker-danger");
      return;
    }

    const warnings = status.validation.warnings.length > 0 ? `（提示：${status.validation.warnings.join("；")})` : "";
    const privateNote = status.validation.isPrivate ? "（当前为 private）" : "";
    this.validationEl.setText(`校验通过 ${privateNote} ${warnings}`.trim());
    this.validationEl.removeClass("love-linker-danger");
  }

  refreshRemoteInfo() {
    if (!this.remoteInfoEl) return;
    const info = this.plugin.getRemoteInfo();
    if (!info.baseUrl) {
      this.remoteInfoEl.setText("未配置 WebDAV。请先在设置中填写。");
      this.remoteInfoEl.addClass("love-linker-danger");
      return;
    }

    this.remoteInfoEl.removeClass("love-linker-danger");
    this.remoteInfoEl.setText(`Base URL: ${info.baseUrl} | 目录: ${info.contentDir}`);
  }

  setProgress(message: string) {
    if (!this.progressEl) return;
    this.progressEl.setText(message);
  }

  async loadManifestPreview() {
    if (!this.manifestListEl || !this.manifestStatusEl) return;
    this.manifestStatusEl.setText("正在拉取 manifest...");
    this.manifestListEl.empty();
    const result = await this.plugin.fetchManifestPreview();
    if (!result) {
      this.manifestStatusEl.setText("读取失败，请检查设置与网络。");
      return;
    }

    const items = result.items as ManifestItem[];
    const limit = result.limit;
    this.manifestStatusEl.setText(`已读取前 ${Math.min(items.length, limit)} 条：`);

    items.slice(0, limit).forEach((item) => {
      const li = this.manifestListEl?.createEl("li");
      li?.setText(`${item.slug} → ${item.file}`);
    });
  }
}
