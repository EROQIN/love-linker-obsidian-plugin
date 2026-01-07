# Love Linker Publisher（Obsidian 插件）

在 Obsidian 内创建符合 love-linker 规则的里程碑文档，并一键推送到 WebDAV（自动更新 manifest.json）。

## 功能

- 命令创建 Markdown 草稿（包含规范 frontmatter）
- 设置页配置 WebDAV（含测试连接）
- 推送时填写 slug → 更新 manifest.json → 上传文档
- 发布面板（侧边栏）自动常驻：新建/推送/测试连接/属性快捷编辑
- 一键补全/修复 frontmatter、快速修改 accent
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
- `WEBDAV_TRASH_DIR`：默认 `_trash`（彻底删除时的回收站目录）
- `LOCAL_CONTENT_FOLDER`：本地保存目录（相对 vault 根目录）

点击「测试连接」会尝试读取远端 manifest.json（用于确认 WebDAV 可用）。如果 manifest.json 不存在，会提示首次推送时自动创建。

## 新建文章

- 打开命令面板：`Love Linker: 新建文章`
- 或打开发布面板后点击「新建文章」

会生成：

- 文件名：`YYYY-MM-DD-<slugified-title>.md`
- frontmatter 字段顺序与站点要求一致

## 推送到 WebDAV

- 打开 Markdown 文件
- 运行命令：`Love Linker: 推送/更新当前文档到 WebDAV`
- 或使用发布面板 / 右键菜单

流程：

1. 前置校验必填字段
2. 输入 slug（用于网站 URL）
3. 拉取并更新 manifest.json
4. 上传文档 + 上传 manifest

推送时可勾选：
- 「推送为 private」：自动写入 frontmatter visibility
- 「仅更新 manifest」：不上传文档，仅更新映射

发布面板与命令还提供：
- 「下线当前文章」：仅移除 manifest 条目
- 「彻底删除当前文章」：移除 manifest + 删除/移动远端文件

## 常见错误

- 401 / 403：鉴权失败，检查用户名/密码
- 404：manifest.json 不存在，会在首次推送时自动创建
- 超时/网络错误：检查 WEBDAV_BASE_URL 是否正确、网络是否可达
- 日期格式错误：必须为 `YYYY-MM-DD`

## 下线/删除

插件提供两种模式：

- 下线（默认、安全）：只从 `manifest.json` 移除 slug，不删除远端文件。
- 彻底删除（危险）：先移除 manifest 条目，再删除远端文件。

当服务器不支持 DELETE 时，插件会尝试移动到回收站目录（`WEBDAV_TRASH_DIR`）。若 MOVE 也不支持，会降级为“仅下线”并提示原因。下线/删除后，网站将在 ISR 周期内生效。

## manifest 规则

manifest.json 使用 love-linker 的映射结构（`items: [{ slug, file }]`），WebDAV 目录结构与 love-linker 站点保持一致。若站点规则调整，请同步更新本插件配置与实现。

## 安全说明

WebDAV 密码会以明文保存于本地插件配置中，请自行评估风险，勿提交到 Git 或公开。
