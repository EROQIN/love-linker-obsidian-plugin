import { App, PluginSettingTab, Setting } from "obsidian";
import type LoveLinkerPublisherPlugin from "./main";

export class LoveLinkerSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: LoveLinkerPublisherPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Love Linker Publisher 设置" });

    new Setting(containerEl)
      .setName("WEBDAV_BASE_URL")
      .setDesc("例如 https://rebun.infini-cloud.net/dav（一般以 /dav 结尾）")
      .addText((text) =>
        text
          .setPlaceholder("https://...")
          .setValue(this.plugin.settings.webdavBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.webdavBaseUrl = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("WEBDAV_USERNAME")
      .setDesc("云盘的 Connection ID（用于登录）")
      .addText((text) =>
        text
          .setPlaceholder("YOUR_CONNECTION_ID")
          .setValue(this.plugin.settings.webdavUsername)
          .onChange(async (value) => {
            this.plugin.settings.webdavUsername = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("WEBDAV_PASSWORD")
      .setDesc("云盘的 Apps Password（建议不要截图分享；本插件会保存在本地配置中）")
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setPlaceholder("YOUR_APPS_PASSWORD")
          .setValue(this.plugin.settings.webdavPassword)
          .onChange(async (value) => {
            this.plugin.settings.webdavPassword = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("显示密码")
      .setDesc("仅影响当前设置页显示")
      .addToggle((toggle) => {
        toggle.setValue(false).onChange((value) => {
          const passwordInputs = containerEl.querySelectorAll("input[type='password'], input[data-llp-password='true']");
          passwordInputs.forEach((input) => {
            const inputEl = input as HTMLInputElement;
            inputEl.type = value ? "text" : "password";
          });
        });
      });

    const passwordInput = containerEl.querySelector("input[type='password']") as HTMLInputElement | null;
    if (passwordInput) {
      passwordInput.setAttribute("data-llp-password", "true");
    }

    new Setting(containerEl)
      .setName("WEBDAV_CONTENT_DIR")
      .setDesc("远端存放文章的目录名（通常不用改）")
      .addText((text) =>
        text
          .setPlaceholder("milestones")
          .setValue(this.plugin.settings.webdavContentDir)
          .onChange(async (value) => {
            this.plugin.settings.webdavContentDir = value.trim() || "milestones";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("WEBDAV_MANIFEST_FILE")
      .setDesc("slug 映射表文件名（通常不用改）")
      .addText((text) =>
        text
          .setPlaceholder("manifest.json")
          .setValue(this.plugin.settings.webdavManifestFile)
          .onChange(async (value) => {
            this.plugin.settings.webdavManifestFile = value.trim() || "manifest.json";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("LOCAL_CONTENT_FOLDER")
      .setDesc("Obsidian 本地保存文章的文件夹（相对 vault 根目录）")
      .addText((text) =>
        text
          .setPlaceholder("milestones")
          .setValue(this.plugin.settings.localContentFolder)
          .onChange(async (value) => {
            this.plugin.settings.localContentFolder = value.trim() || "milestones";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("默认扩展名")
      .setDesc("新建文件时使用 .md")
      .addDropdown((dropdown) => {
        dropdown.addOption("md", ".md");
        dropdown.setValue(this.plugin.settings.defaultExtension).onChange(async (value: "md" | "mdx") => {
          this.plugin.settings.defaultExtension = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("默认 accent")
      .setDesc("新建文档时默认使用的主色")
      .addText((text) =>
        text
          .setPlaceholder("coral")
          .setValue(this.plugin.settings.defaultAccent)
          .onChange(async (value) => {
            this.plugin.settings.defaultAccent = value.trim() || "coral";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("accent 候选列表")
      .setDesc("每行一个，可写成 key|中文说明，例如 sea|海蓝")
      .addTextArea((textarea) => {
        textarea.inputEl.rows = 6;
        textarea
          .setValue(this.plugin.settings.accentOptions.join("\n"))
          .onChange(async (value) => {
            this.plugin.settings.accentOptions = value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("默认封面链接")
      .setDesc("外链图床默认值，可留空")
      .addText((text) =>
        text
          .setPlaceholder("https://your-image-host/cover.svg")
          .setValue(this.plugin.settings.defaultCoverUrl)
          .onChange(async (value) => {
            this.plugin.settings.defaultCoverUrl = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("测试连接")
      .setDesc("点击后检测 WebDAV 是否可连接")
      .addButton((button) => {
        button.setButtonText("测试连接").onClick(async () => {
          await this.plugin.testConnection();
        });
      });

    const safety = containerEl.createDiv({ cls: "love-linker-section" });
    safety.createEl("h3", { text: "安全说明" });
    safety.createEl("p", {
      text: "WebDAV 密码会保存在本地插件配置文件中（明文），请自行评估风险。"
    });
    safety.createEl("p", { text: "不要把密码提交到 Git 或公开。" });
  }
}
