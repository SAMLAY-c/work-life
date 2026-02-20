---
name: pm-lecture-visualizer
description: Converts PM course lecture transcripts or notes into rich Excalidraw knowledge diagrams for Obsidian. Use when user provides lecture text, course notes, slides, or transcript content and wants visualization. Reads source files from E:\work-life\04-RESOURCES\PM产品思维\PM\原稿 and saves output to E:\work-life\04-RESOURCES\PM产品思维\PM\可视化. Triggers on: 可视化、画图、讲稿转图、笔记转图、思维导图、知识图谱、excalidraw、diagram、flowchart、lecture notes、课程可视化.
metadata:
  version: 3.0.0
---

# PM 课程讲稿可视化生成器

将 PM 课程讲稿转化为内容密集、视觉清晰的 Excalidraw 知识图谱，保存至 Obsidian 库。

## 设计哲学

- **内容完整性优先**：讲稿中每一个具名概念必须出现在图中，宁多勿少
- **关系比节点更重要**：箭头每一条都代表真实的概念关联，不做装饰
- **重点一眼可见**：用户扫视三秒内即能识别最重要的 3–5 个核心概念
- **工业手绘质感**：黑白主色 + 金色/红色语义高亮，手绘粗线风格，非 UI 感

---

## 路径配置

| 角色 | 路径文件夹 |
|------|------|
| 输入（原稿） | `E:\work-life\04-RESOURCES\PM产品思维\PM\原稿` |
| 输出（可视化） | `E:\work-life\04-RESOURCES\PM产品思维\PM\可视化` |

用户也可直接粘贴讲稿文本，无需文件路径。

---

## Step 1：内容分析

读取或接收讲稿后，执行结构分析，需要完整还原讲稿的内容；不可以太简略；向用户输出确认摘要：

```
📋 分析摘要
─────────────────────────────
主题：        [核心主题]
核心概念数：  [N] 个
关系类型：    [dependency / flow / contrast / hierarchy / cycle]
推荐图表类型：[类型] — 理由：[一句话说明]
重点候选：    [3–7个最重要概念，将使用金色高亮]
警示候选：    [易错点/考点，将使用红色标注]
建议文件名：  [课程编号--参考原文件]_[核心主题]-知识图谱.excalidraw.md
─────────────────────────────
是否继续生成？
```

---

## Step 2：图表类型选择

| 类型 | 使用场景 | PM 课程典型例子 |
|------|---------|----------------|
| **知识网络图** | 概念多、关系复杂、非线性（**默认首选**） | 产品策略、用户研究框架 |
| **流程图** | 有明确步骤顺序的方法论 | 需求分析流程、PRD 撰写 |
| **层级拆解图** | 有明确主次结构的框架 | 北极星指标体系、OKR |
| **对比矩阵** | 多方案/多维度对比 | 竞品分析、优先级框架 |
| **因果关系图** | 原因→影响链条 | 增长模型、留存分析 |
| **混合布局** | 内容横跨多种结构（课程讲稿最常见） | 综合性课程单元 |

> PM 课程讲稿优先使用「知识网络图」或「混合布局」。

---

## Step 3：视觉设计规范

### 3.1 颜色系统（严格遵守）

**主色调**：黑白工业风 + 语义高亮

| 用途 | 颜色名 | Hex | 填充色 | 使用规则 |
|------|--------|-----|--------|---------|
| **核心重点概念** | 金色 | `#f59e0b` | `#fef3c7` | 每图 5–7 个；fillStyle: solid；讲师重点强调 |
| **警示/易错/考点** | 红色 | `#ef4444` | `#fee2e2` | 特别提醒；fillStyle: solid |
| **主框架/一级节点** | 黑色 | `#000000` | transparent | 大分类/章节标题 |
| **二级概念** | 深灰 | `#444444` | transparent | 从属于主框架的子概念 |
| **三级说明/细节** | 中灰 | `#888888` | transparent | 解释、例子、注释 |
| **正向关系箭头** | 黑色 | `#000000` | — | 实线箭头 |
| **推导/影响关系** | 深灰 | `#444444` | — | 虚线箭头 |
| **对比关系** | 黑色 | `#000000` | — | 双向箭头 |
| **分组背景框** | 极浅灰 | `#f8fafc` | `#f8fafc` | 虚线边框 `#e2e8f0`；roughness 0 |
| **画布背景** | 白色 | `#ffffff` | — | viewBackgroundColor |

> **规则**：核心重点和警示节点必须使用 fillStyle: "solid" + 对应背景填充色，其余节点 backgroundColor: "transparent"。

### 3.2 线条风格（工业感核心）

```
strokeWidth:  主要节点 3，次要节点 2，分组背景框 1
roughness:    节点 1.5，箭头 1.5，分组背景框 0
fillStyle:    "solid"（透明时 backgroundColor: "transparent"）
strokeStyle:  节点/主箭头 "solid"，推导关系/分组框 "dashed"
```

### 3.3 字体规范（强制）

```
fontFamily:  5（Excalifont 手绘字体，全部元素统一）
lineHeight:  1.25

主标题节点:   fontSize 24
主要概念节点: fontSize 18
说明文字:     fontSize 14
注释/细节:    fontSize 12
```

**文本替换规则**：
- `"..."` → `『...』`
- `(...)` → `「...」`

### 3.4 节点形状规则

| 形状 | type | 含义 |
|------|------|------|
| 圆角矩形 | rectangle + roundness type 3 | 普通概念节点（默认） |
| 椭圆 | ellipse | 核心/中心概念（全图唯一） |
| 菱形 | diamond | 决策点/分支 |
| 直角矩形（大） | rectangle + roundness null | 分组背景框 |
| 纯文本 | text | 注释、箭头标签、说明 |

### 3.5 工业视觉装饰元素（选用）

- **虚线分割线**：水平或垂直，strokeStyle: "dashed"，区隔内容区块
- **标注圈**：重要序号用 ellipse 小圆圈包裹数字
- **粗边框分组**：strokeWidth 3 的矩形作为主分区边框

### 3.6 布局规则

```
画布范围:  0–1600 × 0–1000（密集内容可扩展至 2000 × 1200）
节点密度:  无上限，内容有多少节点就画多少
分区布局:  用背景矩形框将相关概念归组，每组加标题
箭头标签:  重要关系的箭头必须有文字标签说明关系性质
```

---

## Step 4：生成前自检清单

```
□ 所有一级概念已建节点
□ 所有二级概念已建节点
□ 关键术语（即使只出现一次）已添加
□ 核心重点（5–7个）已使用金色高亮 + 填充
□ 易错点/考点已使用红色标注 + 填充
□ 节点间关系已用箭头连接
□ 重要箭头已添加关系标签文本
□ 相关概念已用背景框归组
□ 分组框有标题文本
□ 所有元素 ID 唯一，坐标无重叠
□ 文本中 " 已替换为 『』，() 已替换为 「」
```

---

## Step 5：Excalidraw JSON 结构

### 5.1 根结构

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://github.com/zsviczian/obsidian-excalidraw-plugin",
  "elements": [],
  "appState": {
    "gridSize": null,
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```

### 5.2 元素模板

**普通概念节点（矩形）**：
```json
{
  "id": "node-001",
  "type": "rectangle",
  "x": 100, "y": 100,
  "width": 180, "height": 52,
  "angle": 0,
  "strokeColor": "#000000",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 3,
  "strokeStyle": "solid",
  "roughness": 1.5,
  "opacity": 100,
  "groupIds": [],
  "frameId": null,
  "index": "a1",
  "roundness": {"type": 3},
  "seed": 100000001,
  "version": 1,
  "versionNonce": 900000001,
  "isDeleted": false,
  "boundElements": [{"type": "text", "id": "node-001-label"}],
  "updated": 1751928342106,
  "link": null,
  "locked": false
}
```

**核心重点节点（金色高亮）**：
```json
{
  "id": "key-001",
  "type": "rectangle",
  "strokeColor": "#f59e0b",
  "backgroundColor": "#fef3c7",
  "fillStyle": "solid",
  "strokeWidth": 3,
  "roughness": 1.5,
  ...
}
```

**警示节点（红色）**：
```json
{
  "id": "warn-001",
  "type": "rectangle",
  "strokeColor": "#ef4444",
  "backgroundColor": "#fee2e2",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "roughness": 1.5,
  ...
}
```

**分组背景框**：
```json
{
  "id": "group-bg-001",
  "type": "rectangle",
  "strokeColor": "#e2e8f0",
  "backgroundColor": "#f8fafc",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "dashed",
  "roughness": 0,
  "roundness": null,
  ...
}
```

**箭头（带标签）**：
```json
{
  "id": "arrow-001",
  "type": "arrow",
  "x": 280, "y": 126,
  "width": 120, "height": 0,
  "points": [[0, 0], [120, 0]],
  "strokeColor": "#000000",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 1.5,
  "opacity": 100,
  "startBinding": {"elementId": "node-001", "focus": 0, "gap": 5},
  "endBinding":   {"elementId": "node-002", "focus": 0, "gap": 5},
  "startArrowhead": null,
  "endArrowhead": "arrow",
  "groupIds": [],
  "frameId": null,
  "index": "a5",
  "roundness": {"type": 2},
  "seed": 200000001,
  "version": 1,
  "versionNonce": 800000001,
  "isDeleted": false,
  "boundElements": [{"type": "text", "id": "arrow-001-label"}],
  "updated": 1751928342106,
  "link": null,
  "locked": false
}
```

**文字标签（附属于节点/箭头）**：
```json
{
  "id": "node-001-label",
  "type": "text",
  "x": 110, "y": 113,
  "width": 160, "height": 25,
  "text": "概念名称",
  "rawText": "概念名称",
  "originalText": "概念名称",
  "fontSize": 16,
  "fontFamily": 5,
  "textAlign": "center",
  "verticalAlign": "middle",
  "containerId": "node-001",
  "autoResize": true,
  "lineHeight": 1.25,
  "strokeColor": "#374151",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "groupIds": [],
  "frameId": null,
  "index": "a2",
  "roundness": null,
  "seed": 300000001,
  "version": 1,
  "versionNonce": 700000001,
  "isDeleted": false,
  "boundElements": [],
  "updated": 1751928342106,
  "link": null,
  "locked": false
}
```

---

## Step 6：输出格式（严格遵守，不得修改结构）

````markdown
---
excalidraw-plugin: parsed
tags: [excalidraw]
---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'

# Excalidraw Data

## Text Elements
%%
## Drawing
```json
{完整的 JSON 数据}
```
%%
````

> ⚠ JSON 必须被 `%%` 包围 · Text Elements 区域留空 · 不修改任何外层结构

---

## Step 7：文件命名 & 保存

**命名规则**：`[课程编号]_[核心主题]-知识图谱.excalidraw.md`

| 场景 | 课程编号来源 | 示例 |
|------|------------|------|
| 从原稿文件名读取 | 提取文件名前缀数字 | `03_用户研究框架-知识图谱.excalidraw.md` |
| 用户粘贴文本 | 使用 `00` | `00_需求优先级模型-知识图谱.excalidraw.md` |
| 用户指定编号 | 使用指定值 | `07_泳道图绘制-知识图谱.excalidraw.md` |

**保存路径**：`E:\work-life\04-RESOURCES\PM产品思维\PM\可视化\[文件名]`


## Step 7：文件命名 & 保存

**读取原稿文件名**：AI 自动从输入文件的文件中提取编号和主题。

命名格式：`[原稿文件名（去扩展名）]-知识图谱.excalidraw.md`

| 原稿文件名示例 | 生成的输出文件名 |
|--------------|----------------|
| `02-13.md` | `02-13_竞品分析方法-知识图谱.excalidraw.md` |
| `03_需求优先级.txt` | `03_需求优先级-知识图谱.excalidraw.md` |
| 用户粘贴文本（无文件名） | 询问用户：「请提供课程编号，如 02-13」 |

**规则**：
- 保留原稿文件名中的**编号**，仅在末尾追加 `-知识图谱`
- 无法获取原稿编号时，向用户询问编号后再生成
- 保存至：`E:\work-life\04-RESOURCES\PM产品思维\PM\可视化\`


---

## Step 8：完成报告

```
✅ 可视化完成！

📍 文件：E:\work-life\04-RESOURCES\PM产品思维\PM\可视化\[文件名]
🗂️ 图表类型：[类型] — [选择理由一句话]
📊 内容统计：[N] 个概念节点 / [N] 条关系连线
🌟 重点标注（金色）：[列出 5–7 个核心概念]
⚠️ 警示标注（红色）：[列出易错点/考点，如有]

📖 Obsidian 查看方式：
   打开文件 → 右上角 MORE OPTIONS → Switch to EXCALIDRAW VIEW

需要调整吗？可以：
  · 补充某个遗漏的概念
  · 调整某节点的重要程度（普通 / 金色 / 红色）
  · 修改分组或布局
  · 增加注释或例子
```

---

## 常见问题排查（重要）

### 问题：切换到 Excalidraw View 后显示空白

**现象**：文件能打开，但切换到 Excalidraw View 后画布空白，没有任何元素。

**根本原因**：
1. **`index` 字段干扰**：JSON 元素中的 `index` 字段（如 `"index": "a1"`）可能导致 Obsidian Excalidraw 插件解析失败
2. **`boundElements` 引用无效**：如果 `boundElements` 引用了不存在的元素 ID，会导致整个绘图失败
3. **ID 不匹配**：Text Elements 区域的 `^标记` 必须与 JSON 元素的 `id` 字段完全匹配（区分大小写）
4. **多余的 text 元素**：矩形节点的文本不应单独作为 text 元素，而应直接放在矩形的 `text` 属性中

**解决方案**：

```json
// ❌ 错误示例 - 包含 index 和无效的 boundElements
{
  "id": "node-001",
  "type": "rectangle",
  "index": "a1",
  "boundElements": [{"type": "text", "id": "non-existent-id"}]
}

// ✅ 正确示例 - 移除 index，boundElements 为空
{
  "id": "fordOriginal",
  "type": "rectangle",
  "x": 80, "y": 270,
  "width": 180, "height": 60,
  "text": "『更快的马』",
  "rawText": "『更快的马』",
  "boundElements": []
}
```

**Text Elements 格式要求**：

```markdown
## Text Elements
需求分析 ^center
原始需求 ^original
『更快的马』 ^fordOriginal
...
```

**关键规则**：
1. **移除 `index` 字段**：JSON 元素中不要包含 `index` 字段
2. **`boundElements` 置空**：设置为 `[]` 或仅包含有效的分组 ID
3. **ID 命名规范**：使用驼峰命名法（如 `fordOriginal`、`phoneSolution`），确保 Text Elements 中的 `^标记` 与 JSON 中的 `id` 完全匹配
4. **文本放置**：矩形/椭圆节点的文本直接放在 `text` 和 `rawText` 属性中，不要创建单独的 text 元素
5. **文本对齐**：设置 `textAlign: "center"` 和 `verticalAlign: "middle"`

**调试方法**：
1. 在 Obsidian 中按 `Ctrl+Shift+I` 打开开发者控制台
2. 查看 Console 是否有红色错误信息
3. 使用命令面板：`Decompress current Excalidraw file` 尝试解压修复
4. 对比能正常显示的文件格式，逐项排查差异

---

## 质量检查标准

| 检查项 | 标准 |
|--------|------|
| 内容完整性 | 讲稿所有具名概念均已出现 |
| 重点区分度 | 金色高亮节点占比 10–20% |
| 警示标注 | 易错点/考点均已红色标注 |
| 关系丰富度 | 大多数节点至少有 1 条连线 |
| 视觉层次 | 至少使用 3 种描边色区分层级 |
| 分组清晰 | 相关概念已用背景框归组并加标题 |
| 工业质感 | roughness ≥ 1.5，strokeWidth ≥ 2，fontFamily 5 |
| JSON 有效性 | 每个元素 ID 唯一，坐标无重叠；无 index 字段；boundElements 为空或有效 |
| 文本规范 | fontFamily 5，" 已替换，() 已替换 |