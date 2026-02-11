---
name: excalidraw-diagram
description: 将文本内容或文档路径转成 Excalidraw 图（Obsidian 可直接打开）。风格目标：手绘感、极简、低干扰、高可读；颜色克制（黑为主，红点题，绿打勾）；布局卡片化（三段式：标题区 / 核心要点区 / 场景化结尾）。触发词：Excalidraw、画图、流程图、思维导图、可视化、diagram。
metadata:
  version: 1.2.0
  
---


# Excalidraw Diagram Generator

把用户输入变成 **“像白板随手画的安利笔记”**：手绘、干净、信息密度低，但结构清晰。

## Workflow

1. **理解内容（先抓主旨再抓结构）**
    
    - 提炼：主题、关键卖点/要点、关系（因果/并列/包含/流程/时间）。
        
    - 优先选择**短词**表达，避免长句堆叠。
        
2. **选图类型（见下表）**：以“最容易读懂”为准
    
3. **生成 Excalidraw JSON（手绘风）**
    
4. **生成 Obsidian 可用 `.md`（结构严格固定）**
    
5. **自动保存到当前工作目录**
    
6. **回告用户：路径 + 为什么这么画（1-2 句话）**
    

---

## Output Format

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
{JSON 完整数据}
````

%%



**关键要点：**
- Frontmatter 必须包含 `tags: [excalidraw]`
- 警告信息必须完整
- JSON 必须被 `%%` 标记包围
- 不能使用 `excalidraw-plugin: parsed` 以外的其他 frontmatter 设置

---

## Diagram Types & Selection Guide

选择合适的图表形式，以提升理解力与视觉吸引力。

| 类型 | 英文 | 使用场景 | 做法 |
|------|------|---------|------|
| **流程图** | Flowchart | 步骤说明、工作流程、任务执行顺序 | 用箭头连接各步骤，清晰表达流程走向 |
| **思维导图** | Mind Map | 概念发散、主题分类、灵感捕捉 | 以中心为核心向外发散，放射状结构 |
| **层级图** | Hierarchy | 组织结构、内容分级、系统拆解 | 自上而下或自左至右构建层级节点 |
| **关系图** | Relationship | 要素之间的影响、依赖、互动 | 图形间用连线表示关联，箭头与说明 |
| **对比图** | Comparison | 两种以上方案或观点的对照分析 | 左右两栏或表格形式，标明比较维度 |
| **时间线图** | Timeline | 事件发展、项目进度、模型演化 | 以时间为轴，标出关键时间点与事件 |
| **矩阵图** | Matrix | 双维度分类、任务优先级、定位 | 建立 X 与 Y 两个维度，坐标平面安置 |
| **自由布局** | Freeform | 内容零散、灵感记录、初步信息收集 | 像白板随手贴便签：少线条、少结构、强可读 |

---

## Design Rules（按“Excalidraw 海报风”执行）

### A. 风格目标（必须满足）
- **手绘感**：线条略粗、略糙（roughness > 0），边框圆角，像随手画。
- **极简**：最多 3 类信息层级；文字尽量短；不堆装饰。
- **低干扰**：背景纯白，无渐变，无复杂底纹（除标题区可用轻底纹）。
- **高可读**：对齐不必像素级，但整体要“看起来顺”。

### B. 三段式布局模板（优先使用）
1. **标题区（Top）**  
   - 形态：虚线圆角矩形框 + 轻底纹（可选斜线填充）。  
   - 内容：主标题（中文）+ 可选英文副标题（更小）+ 关键名词/品牌（红色手写）。
2. **核心信息区（Middle）**  
   - 形态：左侧“分类卡片”（2-3 个大框）+ 右侧“短要点清单”。  
   - 要点呈现：每条 2-6 字为主；优点用 **绿色 ✓**。
3. **场景化结尾（Bottom，可选）**  
   - 形态：黑色对话气泡/提示条（1 句）+ 可选箭头引导到下一步。  
   - 目的：把图从“说明书”变成“分享笔记”。

> 若用户内容不适合三段式（例如复杂流程/系统图），可以只保留“标题区 + 核心信息区”，结尾省略。

### C. 颜色体系（克制为先）
- **主色（默认）**：黑/深灰  
  - strokeColor：`#1e1e1e`  
  - 正文文字：`#111827` 或 `#1f2937`
- **点题红（仅用于关键词/品牌/核心名）**：`#ef4444`（少量使用）
- **正向勾选绿（仅用于 ✓ 与少量强调）**：`#22c55e`
- **底部气泡黑底**：背景 `#111111`，文字 `#ffffff`
- **背景**：`#ffffff`

> 原提示词里的蓝/金配色全部移除，避免“UI 化”，保持白板笔记感。

### D. 文字与排版
- **所有文本元素必须使用** `fontFamily: 5`
- **文本中的双引号替换**：`"` → `『』`
- **文本中的圆括号替换**：`()` → `「」`
- **字体大小**（低密度、强层级）：
  - 主标题：`28`
  - 副标题：`18`
  - 分类卡片标题：`22`
  - 要点/说明：`16`
- **行高**：`lineHeight: 1.25`
- **对齐策略**：
  - 标题区：主标题左对齐或居中（二选一，保持一致）
  - 核心区：分类卡片文字居中；右侧要点左对齐
  - 不追求像素级，但避免“飘”

### E. 画布范围与留白
- **推荐画布**：0-1200 x 0-800
- **留白优先**：元素不要贴边；模块之间留 40-80px 间距
- **信息密度控制**：单屏建议 ≤ 12 条要点；超过则分组/分页（同一画布分两列也可）

---

## JSON Structure（保持不变）

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
````

---

## Element Template（保留字段，调整默认风格）

```json
{
  "id": "unique-id",
  "type": "rectangle",
  "x": 100, "y": 100,
  "width": 200, "height": 50,
  "angle": 0,
  "strokeColor": "#1e1e1e",
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
  "seed": 123456789,
  "version": 1,
  "versionNonce": 987654321,
  "isDeleted": false,
  "boundElements": [],
  "updated": 1751928342106,
  "link": null,
  "locked": false
}
```

Text elements add:

```json
{
  "text": "显示文本",
  "rawText": "显示文本",
  "fontSize": 20,
  "fontFamily": 5,
  "textAlign": "center",
  "verticalAlign": "middle",
  "containerId": null,
  "originalText": "显示文本",
  "autoResize": true,
  "lineHeight": 1.25
}
```

---

## Additional Technical Requirements（保留）

### Text Elements 处理

- `## Text Elements` 部分在 Markdown 中**必须留空**，仅用 `%%` 作为分隔符
    
- Obsidian ExcaliDraw 插件会根据 JSON 数据**自动填充文本元素**
    
- 不需要手动列出所有文本内容
    

### 坐标与布局

- **坐标系统**：左上角为原点 (0,0)
    
- **推荐范围**：所有元素在 0-1200 x 0-800 像素范围内
    
- **元素 ID**：每个元素需要唯一的 `id`（可以是字符串，如「title」「box1」等）
    
- **Index 字段**：建议使用字母数字 (a1, a2, a3...)
    

### Required Fields for All Elements

（保持原样，不重复粘贴也可；如需严格保留请继续沿用原段落）

### appState 配置

```json
"appState": {
  "gridSize": null,
  "viewBackgroundColor": "#ffffff"
}
```

### files 字段

```json
"files": {}
```

---

## Implementation Notes（按新风格执行保存流程）

### Auto-save & File Generation Workflow

当生成 Excalidraw 图表时，**必须自动执行以下步骤**：

1. **选择图表类型**：优先选择“最少线条、最短文本、最好读”的类型
    
2. **生成文件名**：沿用原规则
    
3. **Write 工具保存到当前工作目录**
    
4. **Markdown 结构完全固定**（不得改动）
    
5. **JSON 数据要求**：
    
    - ✅ 完整结构、可解析
        
    - ✅ 全文字体 `fontFamily: 5`
        
    - ✅ `"` → `『』`，`()` → `「」`
        
    - ✅ 颜色使用：黑为主、红点题、绿打勾、黑底气泡（如用）
        
    - ✅ 背景纯白
        
6. **用户回告**：
    
    - ✅ 已生成 + 保存路径
        
    - 🎨 说明：采用“标题区/核心区/结尾”或为何省略结尾（1-2 句）
        
    - ❓ 可调整项：布局/要点分组/颜色强调
        

---

## Example Output Message（风格示例）

✅ Excalidraw 图已自动生成！

📍 保存位置：  
`xxx.flowchart.md`

🎨 设计说明：  
我用“标题区 + 分类卡片 + ✓ 要点清单”的白板笔记风格呈现，主色黑、红色点题、绿色用于优点打勾，保证低干扰但一眼能扫完。

📖 使用方法：

1. 在 Obsidian 打开文件
    
2. 右上角 MORE OPTIONS → Switch to EXCALIDRAW VIEW
    
3. 即可查看图形
    