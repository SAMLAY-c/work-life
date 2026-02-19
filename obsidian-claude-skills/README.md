# Claude Code Skills - Obsidian Plugin

一键调用 Claude Code Skills 生成 Excalidraw 可视化图表的 Obsidian 插件。

## 功能特性

- **一键生成**: 通过快捷键快速调用 Claude AI 生成内容
- **多 Skill 支持**: 支持自定义多个 AI Skills（Excalidraw、思维导图、摘要等）
- **实时进度**: 状态栏显示执行进度
- **文件选择**: 支持当前文件或选择任意文件执行
- **自动打开**: 生成后自动打开结果文件
- **双模式**: 支持 Claude Code CLI 和 Claude API 两种调用方式

## 安装方法

### 方法一：手动安装（推荐用于开发）

1. 克隆或下载此仓库到你的 Obsidian vault 的 plugins 目录：
```bash
cd .obsidian/plugins/
git clone https://github.com/yourusername/obsidian-claude-skills.git
cd obsidian-claude-skills
```

2. 安装依赖：
```bash
npm install
```

3. 构建插件：
```bash
npm run build
```

4. 在 Obsidian 中启用插件：
设置 → 社区插件 → 已安装插件 → Claude Code Skills → 启用

### 方法二：发布到 Obsidian 社区插件市场

待发布...

## 配置说明

### 1. Claude API Key（推荐）

在插件设置中填入你的 Claude API Key：
- 访问 [Anthropic Console](https://console.anthropic.com/) 获取 API Key
- 填入设置中的 "Claude API Key" 字段
- 使用 API 更稳定，无需依赖本地 CLI

### 2. Claude Code CLI（可选）

如果不使用 API Key，需要安装 Claude Code CLI：
```bash
# 安装 Claude Code CLI
npm install -g @anthropic-ai/claude-code
```

在插件设置中配置：
- **Claude Code 路径**: 默认为 `claude`，如果使用完整路径则填写绝对路径
- **默认输出文件夹**: 生成文件的保存位置（相对于 vault 根目录）

## 使用方法

### 快捷键

- `Ctrl+Shift+C` - 对当前文件运行 Claude Skill
- `Ctrl+Shift+S` - 选择文件运行 Claude Skill
- `Ctrl+Shift+E` - 快速生成 Excalidraw 图表

### 命令面板

按 `Ctrl+P` 打开命令面板，输入：
- `Claude Skills` 查看所有可用命令

### 使用流程

1. 打开要处理的 Markdown 文件
2. 按快捷键（如 `Ctrl+Shift+E`）
3. 选择要执行的 Skill（如果设置了多个）
4. 等待 AI 处理完成
5. 自动打开生成的文件

## 自定义 Skills

在插件设置中点击 "添加新 Skill"，配置以下字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| Skill ID | 唯一标识符 | `mindmap` |
| 名称 | 显示名称 | `思维导图生成` |
| 描述 | 功能说明 | `从内容生成思维导图` |
| 图标 | Emoji 图标 | `🧠` |
| 文件扩展名 | 输出文件类型 | `excalidraw` |
| Prompt 模板 | AI 指令模板 | 见下方 |

### Prompt 模板变量

- `{inputFile}` - 输入文件路径
- `{outputPath}` - 输出文件路径
- `{content}` - 输入文件的完整内容

### 示例：创建流程图 Skill

```
ID: flowchart
名称: 流程图生成
描述: 将文本内容转换为流程图
文件扩展名: excalidraw
Prompt 模板:
分析以下内容，生成一个流程图的 Excalidraw JSON 文件：
{content}

要求：
1. 使用箭头连接各个步骤
2. 使用不同颜色区分不同类型的步骤
3. 布局清晰，从上到下或从左到右
```

## 预设 Skills

插件内置以下 Skills：

### 1. Excalidraw 图表生成 🎨
将 Markdown 内容转换为可视化图表

### 2. 思维导图 🧠
从内容生成思维导图结构

### 3. 内容摘要 📝
生成文档的简洁摘要

## 开发指南

### 项目结构

```
obsidian-claude-skills/
├── src/
│   ├── main.ts           # 插件入口
│   ├── types.ts          # 类型定义
│   ├── claude.ts         # Claude API/CLI 集成
│   ├── ui.ts             # UI 组件（Modal、进度条）
│   └── settings.ts       # 设置页面
├── manifest.json         # 插件元数据
├── package.json          # npm 配置
├── tsconfig.json         # TypeScript 配置
├── esbuild.config.mjs    # 构建配置
└── README.md             # 说明文档
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产构建
npm run build

# 版本发布
npm run version
```

### 技术栈

- **TypeScript** - 类型安全
- **Obsidian API** - 插件接口
- **esbuild** - 快速构建
- **Claude API** - AI 能力

## 故障排除

### 问题 1: 插件未出现在设置中

**解决方案**:
1. 确认 `main.js` 文件已生成
2. 重启 Obsidian
3. 检查 `manifest.json` 格式是否正确

### 问题 2: Claude Code 环境检查失败

**解决方案**:
1. 使用 Claude API Key（推荐）
2. 或确保 Claude Code CLI 已正确安装并在 PATH 中

### 问题 3: 生成的 Excalidraw 文件无法打开

**解决方案**:
1. 确保已安装 Obsidian Excalidraw 插件
2. 检查生成的 JSON 格式是否正确
3. 查看控制台错误日志

### 问题 4: API 调用失败

**解决方案**:
1. 检查 API Key 是否有效
2. 确认网络连接正常
3. 检查 API 配额是否用尽

## 路线图

- [ ] 支持 Claude Opus 4.6 模型
- [ ] 支持批量处理多个文件
- [ ] 支持自定义进度回调
- [ ] 支持 Excalidraw 模板选择
- [ ] 支持流式输出预览
- [ ] 支持本地 LLM（Ollama）
- [ ] 发布到 Obsidian 社区插件市场

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 致谢

- [Obsidian](https://obsidian.md/) - 强大的知识管理工具
- [Anthropic](https://www.anthropic.com/) - Claude AI
- [Obsidian Excalidraw Plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin) - 可视化支持

## 联系方式

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

**Enjoy building with AI! 🚀**
