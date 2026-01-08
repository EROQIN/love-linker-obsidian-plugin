import { App, PluginSettingTab, Setting } from "obsidian";
import type LoveLinkerPublisherPlugin from "./main";

export class LoveLinkerSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: LoveLinkerPublisherPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("发布设置").setHeading();

    new Setting(containerEl)
      .setName("远端地址")
      .setDesc("例如：地址通常以 /dav 结尾")
      .addText((text) =>
        text
          .setPlaceholder("示例地址")
          .setValue(this.plugin.settings.webdavBaseUrl)
          .onChange((value) => {
            this.plugin.settings.webdavBaseUrl = value.trim();
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("用户名")
      .setDesc("云盘的连接编号（用于登录）")
      .addText((text) =>
        text
          .setPlaceholder("连接编号")
          .setValue(this.plugin.settings.webdavUsername)
          .onChange((value) => {
            this.plugin.settings.webdavUsername = value.trim();
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("密码")
      .setDesc("云盘的应用密码（建议不要截图分享；本插件会保存在本地配置中）")
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setPlaceholder("应用密码")
          .setValue(this.plugin.settings.webdavPassword)
          .onChange((value) => {
            this.plugin.settings.webdavPassword = value.trim();
            void this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("显示密码")
      .setDesc("仅影响当前设置页显示")
      .addToggle((toggle) => {
        toggle.setValue(false).onChange((value) => {
          const passwordInputs = containerEl.querySelectorAll("input[type='password'], input[data-llp-password='true']");
          passwordInputs.forEach((input) => {
            if (input instanceof HTMLInputElement) {
              input.type = value ? "text" : "password";
            }
          });
        });
      });

    const passwordInput = containerEl.querySelector<HTMLInputElement>("input[type='password']");
    if (passwordInput) {
      passwordInput.setAttribute("data-llp-password", "true");
    }

    new Setting(containerEl)
      .setName("内容目录")
      .setDesc("远端存放文章的目录名（通常不用改）")
      .addText((text) =>
        text
          .setPlaceholder("示例目录")
          .setValue(this.plugin.settings.webdavContentDir)
          .onChange((value) => {
            this.plugin.settings.webdavContentDir = value.trim() || "milestones";
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("清单文件名")
      .setDesc("映射表文件名（通常不用改）")
      .addText((text) =>
        text
          .setPlaceholder("示例文件名")
          .setValue(this.plugin.settings.webdavManifestFile)
          .onChange((value) => {
            this.plugin.settings.webdavManifestFile = value.trim() || "manifest.json";
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("回收站目录")
      .setDesc("彻底删除时的回收站目录名（相对内容目录）")
      .addText((text) =>
        text
          .setPlaceholder("_trash")
          .setValue(this.plugin.settings.webdavTrashDir)
          .onChange((value) => {
            this.plugin.settings.webdavTrashDir = value.trim() || "_trash";
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("本地内容目录")
      .setDesc("本地保存文章的文件夹（相对仓库根目录）")
      .addText((text) =>
        text
          .setPlaceholder("示例目录")
          .setValue(this.plugin.settings.localContentFolder)
          .onChange((value) => {
            this.plugin.settings.localContentFolder = value.trim() || "milestones";
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("默认扩展名")
      .setDesc("新建文件时使用 .md")
      .addDropdown((dropdown) => {
        dropdown.addOption("md", ".md");
        dropdown.setValue(this.plugin.settings.defaultExtension).onChange((value) => {
          this.plugin.settings.defaultExtension = value === "md" ? "md" : "md";
          void this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("默认主色")
      .setDesc("新建文档时默认使用的主色")
      .addText((text) =>
        text
          .setPlaceholder("示例主色")
          .setValue(this.plugin.settings.defaultAccent)
          .onChange((value) => {
            this.plugin.settings.defaultAccent = value.trim() || "coral";
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("主色候选列表")
      .setDesc("每行一个，可写成 key|中文说明，例如 sea|海蓝")
      .addTextArea((textarea) => {
        textarea.inputEl.rows = 6;
        textarea
          .setValue(this.plugin.settings.accentOptions.join("\n"))
          .onChange((value) => {
            this.plugin.settings.accentOptions = value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);
            void this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("默认封面链接")
      .setDesc("外链图床默认值，可留空")
      .addText((text) =>
        text
          .setPlaceholder("https://your-image-host/cover.svg")
          .setValue(this.plugin.settings.defaultCoverUrl)
          .onChange((value) => {
            this.plugin.settings.defaultCoverUrl = value.trim();
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("启动时自动打开发布面板")
      .setDesc("默认开启，可在右侧常驻显示")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.autoOpenPanel).onChange((value) => {
          this.plugin.settings.autoOpenPanel = value;
          void this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("测试连接")
      .setDesc("点击后检测远端是否可连接")
      .addButton((button) => {
        button.setButtonText("测试连接").onClick(() => {
          void this.plugin.testConnection();
        });
      });

    new Setting(containerEl).setName("安全说明").setHeading();
    const safety = containerEl.createDiv({ cls: "love-linker-section" });
    safety.createEl("p", {
      text: "远端密码会保存在本地插件配置文件中（明文），请自行评估风险。"
    });
    safety.createEl("p", { text: "不要把密码提交到 Git 或公开。" });
  }
}
