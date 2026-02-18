---
name: excalidraw-pm-lecture
description: >
  Converts PM course lecture notes or transcripts into rich, content-dense
  Excalidraw visual diagrams for Obsidian. Designed for product management
  students who need to visualize complex, tightly-connected course content —
  not just linear outlines. Use when user inputs lecture text, course notes,
  slides content, or study material and wants a visual knowledge map.
  Triggers on "可视化", "画图", "讲稿", "笔记转图", "思维导图", "知识图谱",
  "课程内容", "excalidraw", "flowchart", "diagram", "lecture", "course notes",
  "PM课程".

title: Excalidraw PM Lecture Visualizer

purpose: >
  Converts product management course lecture notes into rich, content-dense
  Excalidraw diagrams for Obsidian. Prioritizes visual clarity, concept
  density, and logical relationships — going far beyond simple linear outlines.

role_and_context: >
  Operates as a PM学习助手 (PM Learning Assistant). The user is a product
  manager student (技术入门背景) who wants to understand how concepts connect,
  not just what they are. The user's course content is dense and tightly
  coupled — the diagram must reflect this richness.

core_design_philosophy:
  - Every key concept from the lecture MUST appear on the diagram
  - Relationships between concepts are as important as the concepts themselves
  - Visual hierarchy communicates importance, not just grouping
  - Color coding must be intentional and consistent (highlight key points, not just decoration)
---

## Step 1: Analyze Input

Before generating anything, perform a structured content analysis:

1. **Identify the core topic** — what is the lecture fundamentally about?
2. **Extract all concepts** — list every named concept, framework, term, or idea
3. **Map relationships** — which concepts depend on, lead to, contrast with, or elaborate on others?
4. **Find key emphases** — what does the lecturer stress most? What are the "核心考点" or "重点"?
5. **Determine concept density** — how many nodes/elements will this diagram need? (For dense lectures, expect 20–50+ elements)

Output a brief internal analysis (can be shown to user as a thinking step):

```
主题：[Core topic]
核心概念数量：[N]
关系类型：[dependency / flow / contrast / hierarchy / cycle]
推荐图表类型：[见下方选择指南]
重点标注概念：[list 3–7 key concepts that need color emphasis]
```

---

## Step 2: Choose Diagram Type

|类型|使用场景|PM课程典型例子|
|---|---|---|
|**知识网络图** (Knowledge Network)|概念多、关系复杂、非线性|产品策略、用户研究框架|
|**流程图** (Flowchart)|有明确步骤顺序的方法论|需求分析流程、PRD撰写步骤|
|**层级拆解图** (Hierarchy)|有明确主次结构的框架|北极星指标体系、OKR结构|
|**对比矩阵** (Comparison Matrix)|多方案/多维度对比|竞品分析、优先级框架|
|**因果关系图** (Causal Map)|原因→影响链条|用户增长模型、留存分析|
|**时间线** (Timeline)|阶段性演进|产品生命周期、项目里程碑|
|**混合布局** (Hybrid)|内容横跨多种结构（最常见于课程讲稿）|综合性课程单元|

> **对于PM课程讲稿，推荐优先使用「知识网络图」或「混合布局」**，因为课程概念之间往往存在多层次的非线性关联。

---

## Step 3: Visual Design Rules

### 3.1 Color System（必须严格遵守）

|用途|颜色|Hex|使用规则|
|---|---|---|---|
|**核心重点概念**|深橙/金色|`#f59e0b`|每张图最多5–7个，讲师重点强调的概念|
|**主要框架/一级节点**|深蓝|`#1e40af`|大的分类或章节标题|
|**二级概念**|亮蓝|`#3b82f6`|从属于主框架的子概念|
|**三级说明/细节**|灰蓝|`#64748b`|解释性内容、例子、注释|
|**警示/注意点**|红色|`#ef4444`|易错点、考试重点、特别提醒|
|**正向关系连线**|深灰|`#374151`|标准箭头|
|**因果/推导关系**|蓝紫|`#7c3aed`|虚线箭头，表示推导或影响|
|**对比关系**|橙红|`#dc2626`|双向箭头或对比线|
|**背景色**|白|`#ffffff`|画布背景|

> **重点规则**：核心重点概念（`#f59e0b` 金色）必须用**填充色**（`fillStyle: "solid"`，`backgroundColor: "#fef3c7"`），其他节点默认透明背景。这样一眼就能识别重点。

### 3.2 字体规则

- **所有文本**：`fontFamily: 5`（Excalifont 手写字体）
- **标题节点**：`fontSize: 24`, 粗体感通过大字号实现
- **主要概念节点**：`fontSize: 18`
- **说明文字**：`fontSize: 14`
- **注释/细节**：`fontSize: 12`
- **行高**：统一 `lineHeight: 1.25`
- **文本中的 `"` 替换为 `『』`**
- **文本中的 `()` 替换为 `「」`**

### 3.3 布局规则（密度优先）

- **画布范围**：0–1600 x 0–1000（比标准模板更大，容纳更多内容）
- **节点密度**：讲稿内容丰富时，节点数量不设上限，宁多勿少
- **内容完整性**：讲稿中每一个具名概念都必须出现在图中，不允许省略
- **分区布局**：用视觉分区（轻色背景矩形）将相关概念归组
- **箭头标签**：重要关系的箭头必须有文字标签说明关系性质

### 3.4 节点形状规则

|形状|含义|
|---|---|
|`rectangle`（圆角）|普通概念节点|
|`ellipse`|核心/中心概念|
|`diamond`|决策点或分支|
|`rectangle`（直角）|背景分组框（透明填充，轻边框）|
|`text`（无边框）|说明文字、注释、箭头标签|

---

## Step 4: Generate Excalidraw JSON

生成完整 JSON，必须满足：

### 4.1 元素完整性检查（自检清单）

在生成前，对照讲稿确认：

- [ ] 所有一级概念已创建节点
- [ ] 所有二级概念已创建节点
- [ ] 关键术语（即使只出现一次）已添加
- [ ] 核心重点（3–7个）已使用金色高亮
- [ ] 易错点/注意事项已用红色标注
- [ ] 节点间关系已用箭头连接
- [ ] 重要箭头已添加关系标签
- [ ] 相关概念已用背景框归组

### 4.2 JSON 结构

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://github.com/zsviczian/obsidian-excalidraw-plugin",
  "elements": [...],
  "appState": {
    "gridSize": null,
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```

### 4.3 元素模板

**标准概念节点（矩形）**：

```json
{
  "id": "concept-1",
  "type": "rectangle",
  "x": 100, "y": 100,
  "width": 180, "height": 50,
  "angle": 0,
  "strokeColor": "#1e40af",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "groupIds": [],
  "frameId": null,
  "index": "a1",
  "roundness": {"type": 3},
  "seed": 111111111,
  "version": 1,
  "versionNonce": 999999999,
  "isDeleted": false,
  "boundElements": [{"type": "text", "id": "concept-1-label"}],
  "updated": 1751928342106,
  "link": null,
  "locked": false
}
```

**核心重点节点（金色高亮）**：

```json
{
  "id": "key-concept-1",
  "type": "rectangle",
  "strokeColor": "#f59e0b",
  "backgroundColor": "#fef3c7",
  "fillStyle": "solid",
  "strokeWidth": 3,
  ...
}
```

**警示节点（红色）**：

```json
{
  "id": "warning-1",
  "type": "rectangle",
  "strokeColor": "#ef4444",
  "backgroundColor": "#fee2e2",
  "fillStyle": "solid",
  "strokeWidth": 2,
  ...
}
```

**分组背景框**：

```json
{
  "id": "group-bg-1",
  "type": "rectangle",
  "strokeColor": "#e2e8f0",
  "backgroundColor": "#f8fafc",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "dashed",
  "roughness": 0,
  ...
}
```

**箭头（带标签）**：

```json
{
  "id": "arrow-1",
  "type": "arrow",
  "x": 280, "y": 125,
  "width": 100, "height": 0,
  "points": [[0,0],[100,0]],
  "strokeColor": "#374151",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "startBinding": {"elementId": "concept-1", "focus": 0, "gap": 5},
  "endBinding": {"elementId": "concept-2", "focus": 0, "gap": 5},
  "startArrowhead": null,
  "endArrowhead": "arrow",
  "groupIds": [],
  "frameId": null,
  "index": "a5",
  "roundness": {"type": 2},
  "seed": 222222222,
  "version": 1,
  "versionNonce": 888888888,
  "isDeleted": false,
  "boundElements": [{"type": "text", "id": "arrow-1-label"}],
  "updated": 1751928342106,
  "link": null,
  "locked": false
}
```

**文本标签（附属于节点）**：

```json
{
  "id": "concept-1-label",
  "type": "text",
  "x": 110, "y": 113,
  "width": 160, "height": 25,
  "text": "概念名称",
  "rawText": "概念名称",
  "fontSize": 16,
  "fontFamily": 5,
  "textAlign": "center",
  "verticalAlign": "middle",
  "containerId": "concept-1",
  "originalText": "概念名称",
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
  "seed": 333333333,
  "version": 1,
  "versionNonce": 777777777,
  "isDeleted": false,
  "boundElements": [],
  "updated": 1751928342106,
  "link": null,
  "locked": false
}
```

---

## Step 5: Output Format

**严格按照以下结构输出，不得有任何修改：**

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
````

%%

```

**关键要求**：
- Frontmatter 只含 `excalidraw-plugin: parsed` 和 `tags: [excalidraw]`
- JSON 必须被 `%%` 标记包围
- `## Text Elements` 部分留空（插件自动填充）

---

## Step 6: File Naming & Auto-Save

**文件命名规则**：
- 格式：`[课程主题]-[图表类型].excalidraw.md`
- 例如：`需求分析方法论-knowledge-network.excalidraw.md`
- 优先使用中文主题名，类型用英文后缀

**自动保存**：保存至当前工作目录

---

## Step 7: User Notification

完成后向用户报告：

```

✅ 讲稿可视化完成！

📍 文件：[文件名] 🗂️ 图表类型：[类型及选择理由] 📊 内容统计：共 [N] 个概念节点 / [N] 条关系连线 🌟 重点标注：[列出金色高亮的核心概念] ⚠️ 注意事项：[列出红色标注的警示内容，如有]

📖 Obsidian 查看方式：

1. 打开此文件
2. 点击右上角「MORE OPTIONS」
3. 选择「Switch to EXCALIDRAW VIEW」

需要调整吗？可以：

- 调整某个概念的重要程度
- 补充遗漏的知识点
- 修改布局或分组方式
- 增加具体例子或注释

```

---

## Quality Standards

生成前进行自检，确保满足以下标准：

| 检查项 | 标准 |
|--------|------|
| 内容完整性 | 讲稿中所有具名概念均已出现 |
| 重点区分度 | 金色高亮节点（核心重点）占比 10–20% |
| 关系丰富度 | 大多数概念节点至少有1条连线 |
| 视觉层次 | 至少使用3种颜色区分不同层级 |
| 分组清晰度 | 相关概念已用背景框归组 |
| JSON有效性 | 每个元素有唯一ID，坐标无重叠 |
| 文本规范 | 使用 fontFamily:5，`"` 已替换为 `『』` |

---

## Important Notes

- **绝不简化内容**：讲稿有多少概念，图中就要有多少节点。宁可图大，不可遗漏。
- **箭头有意义**：每一条连线都要代表真实的概念关系，不是装饰。
- **重点一眼可见**：用户扫一眼就能知道这节课最重要的3–5个点在哪里。
- **支持迭代**：用户可能会说「这个课程还有一个概念你漏了」，要能快速补充节点。
```

---

## 附录：Excalidraw文件格式规范

### B.1 标准文件结构（格式B）

当生成Excalidraw文件时，必须使用以下标准格式：

```markdown
---
excalidraw-plugin: parsed
tags: [excalidraw]
---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'

# Excalidraw Data

## Text Elements
[文件标题] ^title

[章节标题1] ^section1

[内容块1] ^content1

[内容块2] ^content2

...

%%
## Drawing
```compressed-json
[压缩的JSON数据]
```
%%
```

### B.2 格式说明

**Frontmatter部分**：
- `excalidraw-plugin: parsed` - 标识为Excalidraw插件解析格式
- `tags: [excalidraw]` - 标签，用于Obsidian插件识别

**Text Elements部分**：
- 包含所有可见的文本内容
- 每个文本元素有唯一ID（使用`^id`语法）
- 结构：标题、章节、内容块等
- 格式：使用Markdown文本，支持列表、分级标题等

**Drawing部分**：
- 使用`compressed-json`格式（Excalidraw压缩格式）
- 由Excalidraw插件自动生成和维护
- 手动编辑时需在Excalidraw视图中操作
- 占位符：可使用已存在文件的compressed-json作为模板

### B.3 格式A vs 格式B

**格式A**（文件05使用）：
```markdown
## Text Elements
%%                    ← 直接就是%%，没有文本内容
## Drawing
```json             ← 使用json，不是compressed-json
```

**格式B**（文件02-04、06-16使用，推荐）：
```markdown
## Text Elements
[有文本内容] ^title
%%
## Drawing
```compressed-json    ← 使用compressed-json
```

**选择建议**：
- **推荐使用格式B**：有完整的Text Elements内容，便于阅读和编辑
- 格式A适用于纯绘图场景，无文本说明需求

### B.4 compressed-json占位符使用

当无法生成正确的compressed-json时（需要Excalidraw压缩算法）：

1. **使用占位符策略**：
   - 复制已存在文件的compressed-json部分
   - 作为临时占位，保持文件结构完整

2. **后续操作**：
   - 用户在Obsidian中打开文件
   - 进入Excalidraw视图进行编辑
   - 保存时插件自动生成正确的compressed-json

3. **优点**：
   - 保持格式一致性
   - 文件结构完整
   - 用户可以在Excalidraw中继续编辑

### B.5 实际案例参考

**格式B示例文件**：
- `02_产品经理的流程图及案例.excalidraw.md`
- `06_流程图绘制演示.excalidraw.md`
- `07_泳道图的绘制.excalidraw.md`
- `10_结构图分类及功能结构图.excalidraw.md`
- `12-16各课程文件.excalidraw.md`

**格式A示例文件**：
- `05_流程图的常用元素及结构.excalidraw.md`

### B.6 文件生成工作流

1. **创建完整Text Elements**
   - 提取转录内容的核心知识点
   - 组织成结构化文本
   - 添加唯一ID标识

2. **添加Drawing占位符**
   - 使用标准compressed-json模板
   - 或复制已存在文件的Drawing部分

3. **用户在Excalidraw中完善**
   - 打开文件进入Excalidraw视图
   - 根据Text Elements内容绘制图形
   - 保存时自动生成正确compressed-json

4. **最终输出**
   - 格式B完整文件
   - Text Elements + compressed-json
   - 可在Obsidian中正常查看和编辑

### B.7 注意事项

- **不要手动修改compressed-json**：这是Excalidraw插件生成的压缩数据
- **Text Elements是可读内容**：包含了所有的文本信息和结构
- **保持格式一致性**：所有文件应使用相同的格式（推荐格式B）
- **ID唯一性**：每个文本元素的ID必须唯一