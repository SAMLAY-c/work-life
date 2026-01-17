# Obsidian AI Flow 插件

使用 SiliconFlow AI 自动整理讲稿至知识库的 Obsidian 插件。

## 功能特点

- ✨ 一键将讲稿文件夹中的笔记整理为结构化的知识库文档
- 🤖 使用 DeepSeek AI 模型进行智能内容重组
- 📋 自动提取摘要、核心观点、详细内容和行动建议
- 🎯 支持自定义模板和文件夹路径

## 安装步骤

### 1. 安装依赖

在插件目录下运行：

```bash
npm install
```

### 2. 构建插件

开发模式（带热更新）：
```bash
npm run dev
```

生产模式：
```bash
npm run build
```

### 3. 启用插件

1. 在 Obsidian 中打开设置
2. 进入「社区插件」
3. 关闭「安全模式」
4. 在已安装插件列表中找到「AI Flow」并启用

## 使用方法

1. 在 `00-Inbox/01-讲稿` 文件夹中创建或打开一个讲稿笔记
2. 按下 `Cmd/Ctrl + P` 打开命令面板
3. 输入「讲稿」或「AI」，选择「✨ 将当前讲稿整理至知识库」
4. 等待处理完成，整理后的笔记会自动保存到 `Knowledge Base` 文件夹

## 配置说明

插件默认配置已硬编码以下内容：

- **API Key**: 已预设 SiliconFlow API Key
- **模型**: deepseek-ai/DeepSeek-V3
- **源文件夹**: 00-Inbox/01-讲稿
- **目标文件夹**: Knowledge Base
- **模板路径**: 90-System/Templates/模板/讲稿模板.md

如需修改，可在插件设置页面进行调整。

## 文件结构

```
.obsidian/plugins/obsidian-ai-flow/
├── main.ts           # 插件主程序
├── manifest.json     # 插件清单
├── package.json      # npm 依赖配置
├── tsconfig.json     # TypeScript 配置
├── esbuild.config.mjs # 构建配置
└── README.md         # 说明文档
```

## 模板格式

插件使用以下模板变量：

- `{{title}}`: 原文件名
- `{{date}}`: 当前日期
- `{{AI_SUMMARY}}`: AI 生成的摘要
- `{{AI_MAIN_POINTS}}`: AI 提取的核心观点
- `{{AI_DETAILED_CONTENT}}`: AI 重构的详细内容
- `{{AI_ACTION_ITEMS}}`: AI 提炼的行动建议

## 技术栈

- TypeScript
- Obsidian API
- esbuild
- SiliconFlow API (DeepSeek V3)

## 作者

samlay-c

## 许可证

MIT
