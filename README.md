# Love Linker Publisher（Obsidian 插件）

在 Obsidian 内创建符合 love-linker 规则的里程碑文档，并一键推送到 WebDAV（自动更新 manifest.json）。

## 功能

- 命令创建 Markdown/MDX 草稿（包含规范 frontmatter）
- 设置页配置 WebDAV（含测试连接）
- 推送时填写 slug → 更新 manifest.json → 上传文档
- 发布面板（侧边栏）一站式新建/推送/测试连接
- 额外入口：Ribbon 图标 + 右键菜单

## 安装与开发

```bash
npm i
npm run build
```

将整个插件目录复制到你的 Obsidian vault：

```
<你的Vault>/.obsidian/plugins/love-linker-publisher/
```

开发调试（监听构建）：

```bash
npm run dev
```

## 配置 WebDAV

进入 Obsidian → 设置 → 第三方插件 → Love Linker Publisher：

- `WEBDAV_BASE_URL`：例如 `https://rebun.infini-cloud.net/dav`
- `WEBDAV_USERNAME`：Connection ID
- `WEBDAV_PASSWORD`：Apps Password
- `WEBDAV_CONTENT_DIR`：默认 `milestones`
- `WEBDAV_MANIFEST_FILE`：默认 `manifest.json`
- `LOCAL_CONTENT_FOLDER`：本地保存目录（相对 vault 根目录）

点击「测试连接」会尝试读取远端 manifest.json。

## 新建文章

- 打开命令面板：`Love Linker: 新建文章`
- 或打开发布面板后点击「新建文章」

会生成：

- 文件名：`YYYY-MM-DD-<slugified-title>.mdx`（扩展名可在设置里改为 .md）
- frontmatter 字段顺序与站点要求一致

## 推送到 WebDAV

- 打开 Markdown/MDX 文件
- 运行命令：`Love Linker: 推送当前文档到 WebDAV`
- 或使用发布面板 / 右键菜单

流程：

1. 前置校验必填字段
2. 输入 slug（用于网站 URL）
3. 拉取并更新 manifest.json
4. 上传文档 + 上传 manifest

推送时可勾选：
- 「推送为 private」：自动写入 frontmatter visibility
- 「仅更新 manifest」：不上传文档，仅更新映射

## 常见错误

- 401 / 403：鉴权失败，检查用户名/密码
- 404：manifest.json 不存在，会提示是否创建
- 超时/网络错误：检查 WEBDAV_BASE_URL 是否正确、网络是否可达
- 日期格式错误：必须为 `YYYY-MM-DD`

## 安全说明

WebDAV 密码会以明文保存于本地插件配置中，请自行评估风险，勿提交到 Git 或公开。
