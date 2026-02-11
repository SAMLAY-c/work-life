# 🌐 联网搜索技能

> **让 AI 模型能够访问实时网络信息**

---

## 📚 概述

联网搜索是 AI 应用的核心技能之一，它允许 AI 模型：
- 🔍 获取最新的网络信息
- 📰 访问新闻、文章、研究
- 📊 进行市场调研和数据分析
- 🔎 验证事实和查证信息

---

## 🎯 学习路径

### 1. Web Search 技能
**位置**：`Web-Search技能/`

掌握搜索引擎 API 的集成和使用：
- Brave Search API
- Google Search API
- Bing Search API
- 其他搜索服务

### 2. Web Fetch 技能
**位置**：`Web-Fetch技能/`

掌握网页内容的提取和解析：
- HTTP 请求基础
- HTML 解析（BeautifulSoup、Cheerio）
- 文本提取和清理
- 处理动态网页（Puppeteer、Playwright）

### 3. 实践案例
**位置**：`实践案例/`

将学到的技能应用到实际项目中：
- 新闻聚合器
- 知识问答系统
- 市场调研工具
- 竞品分析平台

---

## 📖 核心概念

### Web Search vs Web Fetch

| 维度 | Web Search | Web Fetch |
|------|-----------|-----------|
| **用途** | 搜索相关信息 | 获取特定页面内容 |
| **输入** | 搜索查询 | URL |
| **输出** | 搜索结果列表 | 页面完整内容 |
| **API** | Search API | HTTP Request |
| **适用场景** | 发现信息 | 提取信息 |

### 工作流程

```
用户查询
    ↓
1. Web Search - 搜索相关页面
    ↓
2. 结果过滤 - 筛选最相关的结果
    ↓
3. Web Fetch - 获取页面内容
    ↓
4. 内容解析 - 提取关键信息
    ↓
5. 整合输出 - 生成答案
```

---

## 🛠️ 技术栈

### 搜索 API
- **Brave Search** - 隐私友好的搜索引擎
- **Google Custom Search** - Google 官方 API
- **Bing Search** - Microsoft 搜索服务
- **Tavily** - AI 优化的搜索 API

### 网页抓取
- **Axios/Fetch** - HTTP 请求库
- **BeautifulSoup** (Python) - HTML 解析
- **Cheerio** (Node.js) - jQuery 风格解析
- **Puppeteer** - 无头浏览器（动态网页）
- **Playwright** - 跨浏览器自动化

### AI 集成
- **LangChain** - 搜索集成工具
- **LlamaIndex** - RAG 搜索
- **MCP Servers** - MCP 搜索服务器

---

## 💡 最佳实践

### 1. 搜索优化
- ✅ 使用精确的关键词
- ✅ 添加时间限制（如 "past week"）
- ✅ 使用高级搜索操作符
- ✅ 过滤低质量结果

### 2. 内容提取
- ✅ 尊重 robots.txt
- ✅ 添加适当的 User-Agent
- ✅ 实现请求限流
- ✅ 处理错误和超时

### 3. 结果处理
- ✅ 去除重复内容
- ✅ 提取关键信息
- ✅ 记录来源和引用
- ✅ 验证信息准确性

---

## 📖 学习资源

### 官方文档
- [Brave Search API](https://brave.com/search/api/)
- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)
- [Bing Search API](https://www.microsoft.com/en-us/bing/apis/search-api)

### 教程
- [Web Scraping with Python](https://realpython.com/python-web-scraping-practical-introduction/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Puppeteer Guide](https://pptr.dev/)

### AI 集成
- [LangChain Web Search](https://python.langchain.com/docs/integrations/providers/search/)
- [Tavily AI Search](https://tavily.com/)

---

## 🎯 实战项目

### 项目一：新闻摘要生成器
**功能**：
- 搜索最新新闻
- 提取新闻内容
- 生成摘要

**技术**：Brave Search + BeautifulSoup + Claude API

### 项目二：知识问答系统
**功能**：
- 搜索相关知识
- 整合多个来源
- 生成准确答案

**技术**：Tavily + LlamaIndex + RAG

### 项目三：市场调研工具
**功能**：
- 搜索竞品信息
- 提取价格和特性
- 生成对比报告

**技术**：Google Search + Puppeteer + Claude

### 项目四：学术研究助手
**功能**：
- 搜索学术论文
- 提取关键信息
- 生成文献综述

**技术**：Scholar API + PDF 解析 + Claude

---

## 📊 学习进度

- [ ] Web Search 基础
- [ ] Web Fetch 基础
- [ ] 内容解析
- [ ] AI 集成
- [ ] 实战项目

---

## 🔗 相关资源

- **[Prompt 工程](../Prompt-工程/)** - 设计更好的搜索查询
- **[Context 管理](../Context-管理/)** - 管理搜索结果的上下文
- **[Agent 开发](../Agent开发/)** - 构建自主搜索 Agent

---

**🚀 开始学习联网搜索技能！**

*最后更新：2026-02-12*
