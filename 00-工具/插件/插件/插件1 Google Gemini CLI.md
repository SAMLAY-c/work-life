---
uuid: 20241223-插件-001
type: Tool
plugin_type: npm
plugin_name: Gemini CLI
plugin_category: [AI, 工作流, 知识管理]
tags: [Google, Gemini, CLI, RAG, AI助手, 终端]
status: Evergreen
aliases: [Google Gemini CLI, Gemini命令行, gemini-cli]

author: Google
official_site: https://github.com/google-gemini/gemini-cli
repository: https://github.com/google-gemini/gemini-cli
pricing: 免费
language: 英文

created: 2024-12-23
updated: 2024-12-23
difficulty: ⭐⭐⭐
time_cost: 30分钟

content_completeness: 详细
review_status: 已验证
last_tested: 2024-12-23

related_plugins: [Obsidian Terminal, Templater]
related_concepts: [RAG, AI知识库, 智能工作流]
use_cases: [AI辅助写作, 素材检索, 笔记整理, 每日总结]

source: 苍何
source_url: https://github.com/canghe
---

这是一篇关于**"利用 Google Gemini CLI 结合 Obsidian 打造 AI 知识库工作流"**的教程。

根据你提供的文章内容，如果你想复刻作者（苍何）的这套高效工作流，请按照以下步骤操作：

### 第一阶段：软件准备

1.  **下载 Obsidian**
    *   去官网 `obsidian.md` 下载并安装 Obsidian（双链笔记软件）。
    *   创建一个新的笔记仓库（Vault），或者打开你现有的仓库。

2.  **网络环境准备（关键）**
    *   由于使用的是 Google 的 Gemini 服务，你需要确保你的网络环境可以访问 Google。
    *   作者提示：如果你使用 Clash 等工具，建议开启 **TUN 模式**，以确保终端（Terminal）流量也能走代理。

### 第二阶段：在 Obsidian 中配置终端

1.  **安装 Terminal 插件**
    *   打开 Obsidian -> 设置 -> 第三方插件（Community Plugins）-> 关闭“安全模式”。
    *   浏览/搜索插件市场，搜索 **"Terminal"**。
    *   点击安装并启用。

2.  **配置插件环境（易错点）**
    *   在插件列表中找到 Terminal，点击齿轮图标进入设置。
    *   **Shell 设置**：选择你常用的终端（Windows 选 PowerShell/CMD，Mac 选 zsh/bash）。
    *   **添加参数**：在 Arguments（参数）一栏中添加 `-l`（注意是小写的 L）。
        *   *解释：这是为了加载你本地电脑的环境变量，否则可能无法运行 npm/npx 命令。*

3.  **打开终端面板**
    *   在 Obsidian 中按下快捷键 `Cmd+P` (Mac) 或 `Ctrl+P` (Win) 调出命令面板。
    *   输入 "Terminal"，选择 **"Terminal: Toggle"** (或整合式)，右侧会出现一个终端窗口。

### 第三阶段：安装 Gemini CLI

1.  **安装 AI 工具**
    *   在 Obsidian 右侧打开的终端窗口中，复制粘贴以下任一命令并回车（前提是电脑需安装 Node.js 环境）：
        ```bash
        npx https://github.com/google-gemini/gemini-cli
        ```
        或者
        ```bash
        npm install -g @google/gemini-cli
        ```
2.  **登录账号**
    *   安装完成后，终端会提示登录 Google 账号。
    *   登录成功后，输入 `gemini` 即可启动 AI 对话界面。

### 第四阶段：实战用法（如何让它帮你干活）

根据作者的经验，你可以尝试以下几种高效率操作：

1.  **辅助写作与素材检索**
    *   **场景**：写文章时需要引用以前读过的书或笔记。
    *   **指令示例**：
        > “帮我找下我的笔记中王小波关于生命的理解的句子，并帮我写入到该文章中。”
    *   **原理**：Gemini 会读取你 Obsidian 里的本地文件，提取相关内容并直接插入文档。

2.  **每日总结自动化**
    *   **场景**：根据当天的碎片记录生成日报。
    *   **指令示例**：
        > “找到今天（2025-xx-xx）创建或编辑的所有文档，阅读内容，按照‘模板/canghe-daily’的维度分析我今天做了什么，学到了什么，并给出思考。”

3.  **笔记整理（慎用）**
    *   **场景**：整理凌乱的文件夹。
    *   **警告**：作者提示这个功能有时候会“瞎搞”，建议多加约束条件，或者先在非重要文件上测试。

4.  **图片生成（进阶）**
    *   如果你配置了 MCP（如 minimax 或即梦），可以下指令让它直接配图插入文章中。

### 作者的核心建议（心法）

*   **不要做甩手掌柜**：不要让 AI 直接从零写一篇文章，那样通常是垃圾内容。
*   **结对创作**：你提供核心思路、思考和文风，AI 负责找素材、起标题、润色和排版。
*   **数据安全**：所有笔记都在本地（Markdown格式），结合 Gemini CLI 是目前相对安全且强大的方案。

**现在，你可以打开你的 Obsidian，按照第二阶段开始配置了！**结合 Obsidian 打造 AI 知识库工作流”**的教程。

根据你提供的文章内容，如果你想复刻作者（苍何）的这套高效工作流，请按照以下步骤操作：

### 第一阶段：软件准备

1.  **下载 Obsidian**
    *   去官网 `obsidian.md` 下载并安装 Obsidian（双链笔记软件）。
    *   创建一个新的笔记仓库（Vault），或者打开你现有的仓库。

2.  **网络环境准备（关键）**
    *   由于使用的是 Google 的 Gemini 服务，你需要确保你的网络环境可以访问 Google。
    *   作者提示：如果你使用 Clash 等工具，建议开启 **TUN 模式**，以确保终端（Terminal）流量也能走代理。

### 第二阶段：在 Obsidian 中配置终端

1.  **安装 Terminal 插件**
    *   打开 Obsidian -> 设置 -> 第三方插件（Community Plugins）-> 关闭“安全模式”。
    *   浏览/搜索插件市场，搜索 **"Terminal"**。
    *   点击安装并启用。

2.  **配置插件环境（易错点）**
    *   在插件列表中找到 Terminal，点击齿轮图标进入设置。
    *   **Shell 设置**：选择你常用的终端（Windows 选 PowerShell/CMD，Mac 选 zsh/bash）。
    *   **添加参数**：在 Arguments（参数）一栏中添加 `-l`（注意是小写的 L）。
        *   *解释：这是为了加载你本地电脑的环境变量，否则可能无法运行 npm/npx 命令。*

3.  **打开终端面板**
    *   在 Obsidian 中按下快捷键 `Cmd+P` (Mac) 或 `Ctrl+P` (Win) 调出命令面板。
    *   输入 "Terminal"，选择 **"Terminal: Toggle"** (或整合式)，右侧会出现一个终端窗口。

### 第三阶段：安装 Gemini CLI

1.  **安装 AI 工具**
    *   在 Obsidian 右侧打开的终端窗口中，复制粘贴以下任一命令并回车（前提是电脑需安装 Node.js 环境）：
        ```bash
        npx https://github.com/google-gemini/gemini-cli
        ```
        或者
        ```bash
        npm install -g @google/gemini-cli
        ```
2.  **登录账号**
    *   安装完成后，终端会提示登录 Google 账号。
    *   登录成功后，输入 `gemini` 即可启动 AI 对话界面。

### 第四阶段：实战用法（如何让它帮你干活）

根据作者的经验，你可以尝试以下几种高效率操作：

1.  **辅助写作与素材检索**
    *   **场景**：写文章时需要引用以前读过的书或笔记。
    *   **指令示例**：
        > “帮我找下我的笔记中王小波关于生命的理解的句子，并帮我写入到该文章中。”
    *   **原理**：Gemini 会读取你 Obsidian 里的本地文件，提取相关内容并直接插入文档。

2.  **每日总结自动化**
    *   **场景**：根据当天的碎片记录生成日报。
    *   **指令示例**：
        > “找到今天（2025-xx-xx）创建或编辑的所有文档，阅读内容，按照‘模板/canghe-daily’的维度分析我今天做了什么，学到了什么，并给出思考。”

3.  **笔记整理（慎用）**
    *   **场景**：整理凌乱的文件夹。
    *   **警告**：作者提示这个功能有时候会“瞎搞”，建议多加约束条件，或者先在非重要文件上测试。

4.  **图片生成（进阶）**
    *   如果你配置了 MCP（如 minimax 或即梦），可以下指令让它直接配图插入文章中。

### 作者的核心建议（心法）

*   **不要做甩手掌柜**：不要让 AI 直接从零写一篇文章，那样通常是垃圾内容。
*   **结对创作**：你提供核心思路、思考和文风，AI 负责找素材、起标题、润色和排版。
*   **数据安全**：所有笔记都在本地（Markdown格式），结合 Gemini CLI 是目前相对安全且强大的方案。

**现在，你可以打开你的 Obsidian，按照第二阶段开始配置了！**