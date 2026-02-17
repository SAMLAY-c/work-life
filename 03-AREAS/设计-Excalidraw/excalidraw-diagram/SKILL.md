---
name: excalidraw-diagram
description: Generate industrial-style black & white Excalidraw diagrams in ticket / automation workflow visual style for Obsidian. Triggered by "Excalidraw", "画图", "流程图", "思维导图", "可视化", "diagram".
metadata:
  version: 2.0.0
---

# Excalidraw Industrial Workflow Diagram Generator

Create black & white industrial ticket-style Excalidraw diagrams from text or document path.

This style emphasizes:
- 高对比黑白
- 工业说明书结构
- 手绘流程图感
- 粗线条 + 虚线分栏
- 箭头 + 标注圈 + 条码结构

---

## Workflow

1. Analyze content (identify hierarchy, structure, relationships)
2. Choose diagram type
3. Generate industrial-style layout
4. Generate Excalidraw JSON
5. Generate Obsidian-ready .md file
6. Auto-save to current working directory
7. Notify user

---

## 🚨 Output Format（必须严格遵守）

markdown
---
excalidraw-plugin: parsed
tags: [excalidraw]
---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'

# Excalidraw Data

## Text Elements
%%
## Drawing
json
{完整 JSON 数据}
`

%%



⚠ 不能修改任何结构  
⚠ JSON 必须被 %% 包围  
⚠ Text Elements 区域必须留空  

---

# 🎨 DESIGN SYSTEM（工业票券风规则）

## 1️⃣ 颜色体系（必须遵守）

仅允许使用：

- 黑色：#000000
- 白色：#ffffff
- 灰色（少量线条）：#444444

❌ 禁止彩色  
❌ 禁止渐变  
❌ 禁止多色区分层级  

---

## 2️⃣ 线条风格（核心）

所有元素必须：

- strokeWidth: 2 或 3
- roughness: 1.5 – 2
- fillStyle: "solid"
- backgroundColor: "transparent"
- strokeColor: "#000000"

强调工业感：

- 多用直线
- 多用虚线分隔
- 多用粗箭头
- 可适当使用圆形标注圈

---

## 3️⃣ 字体规则（强制）

所有文本：

- fontFamily: 5
- lineHeight: 1.25

字体大小：

- 主标题：26–28
- 副标题：18–20
- 正文：14–16

替换规则：

- " → 『』
- () → 「」

---

## 4️⃣ 布局风格规则

必须体现：

✔ 强结构分区  
✔ 左右对比结构（如痛点 vs 目标）  
✔ 上下标题横条  
✔ 工业说明书风  

推荐结构模式：

### A. 封面型结构

左侧：流程图  
右侧：巨大标题  

### B. 对比结构

┌──────────────┐  
│   PART 标题  │  
├──────┬───────┤  
│ 左区 │ 右区  │  
└──────┴───────┘  

中间使用虚线分割。

---

## 5️⃣ 工业视觉元素（建议使用）

- 条码（用多条不同粗细竖线模拟）
- 手绘箭头
- 叉号 ☒
- 勾号 ☑
- 标注圈（ellipse）
- 虚线分割线

---

## Diagram Types

| 类型 | 使用场景 |
|------|----------|
| 流程图 | 自动化流程 |
| 对比图 | 痛点 vs 目标 |
| 层级图 | 系统拆解 |
| 关系图 | 模块互动 |
| 时间线 | 项目推进 |
| 自由结构 | 工业知识卡片 |

---

## JSON Structure

必须包含：



{  
"type": "excalidraw",  
"version": 2,  
"source": "[https://github.com/zsviczian/obsidian-excalidraw-plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin)",  
"elements": [...],  
"appState": {  
"gridSize": null,  
"viewBackgroundColor": "#ffffff"  
},  
"files": {}  
}



---

# 技术要求

所有元素必须包含：

- id 唯一
- strokeColor: "#000000"
- backgroundColor: "transparent"
- strokeWidth: 2 或 3
- roughness: 1.5 – 2

画布范围：

0–1200 x 0–800

---

# 自动命名规则

文本输入：

[主题].[diagram-type].md

文档路径输入：

test-[编号]-[主题].[diagram-type].md

---

# 用户反馈格式

必须说明：

✅ 已生成  
📍 保存路径  
🎨 为什么选这种结构  
📖 如何打开  

---

# 核心风格原则

不要做成 UI  
不要做成彩色信息图  
不要做成现代 App 风  

目标是：

工业说明书 + 自动化流程卡片 + 手绘知识图
