---
type: 12w-config
created: 2026-02-27
tags: [12w, config]
---

# 12周工作法 - 配置指南

## 📋 模板使用方式

### 快速使用（推荐）

1. 在 Obsidian 中按 `Ctrl/Cmd + P` 打开命令面板
2. 输入 "Templater: Insert template"
3. 导航到 `12-Week-Year/` 文件夹
4. 选择对应的模板文件：
   - `12w-Period-Template.md` - 创建新周期
   - `12w-Week-Template.md` - 创建周记录
   - `12w-Project-Migration.md` - 迁移项目

### 模板文件位置

12周工作法的模板已集成到根目录的模板文件夹：
```
template/12-Week-Year/
├── 12w-Period-Template.md      ← 周期创建模板
├── 12w-Week-Template.md        ← 周记录模板
└── 12w-Project-Migration.md    ← 项目迁移模板
```

### 配置说明

Templater 插件的模板文件夹已设置为 `template`，因此12周工作法的模板会自动出现在模板列表中。

**注意**：旧的模板位置 `12-Week-Year/00-System/Templates/` 仍保留作为备份。

---

## 🚀 快速开始

### 第一次使用（2026-03-02开始）

1. **创建第一个周期**
   ```
   文件 → 新建笔记
   Templater: Insert template
   选择：12w-Period-Template.md
   输入周期名称（如：第一季度年）
   输入周期目标（如：完成vibecoding教程并产出第一个项目）
   ```

2. **迁移第一个项目**
   ```
   文件 → 新建笔记
   Templater: Insert template
   选择：12w-Project-Migration.md
   输入原始项目路径：02-PROJECTS/vibecoding-教程
   选择周期：2026-P01
   填写12周目标和战术
   ```

3. **创建第1周周记录**
   ```
   文件 → 新建笔记
   Templater: Insert template
   选择：12w-Week-Template.md
   选择周期：2026-P01
   输入周数：1
   设定3个MIT
   ```

---

## 📁 文件结构说明

```
work-life/
├── template/                  ← 根目录模板文件夹（Templater配置）
│   └── 12-Week-Year/          ← 12周工作法模板
│       ├── 12w-Period-Template.md
│       ├── 12w-Week-Template.md
│       └── 12w-Project-Migration.md
│
└── 12-Week-Year/              ← 12周工作法主目录
    ├── 00-System/
    │   ├── Dashboard.md       ← 主仪表板（从这里开始）
    │   ├── Config.md          ← 本配置文档
    │   ├── README.md          ← 实施报告
    │   ├── Templates/         ← 旧模板位置（已备份）
    │   └── Scripts/           ← DataviewJS脚本（可选）
    │
    ├── 01-Periods/            ← 周期笔记和周记录
    │   ├── 2026-P01.md        ← 第一个周期
    │   ├── 2026-P01-W01.md    ← 第1周周记录
    │   └── Archive/           ← 已完成的周期
    │
    ├── 02-Projects/           ← 12周框架内的项目
    │   └── vibecoding-教程.md
    │
    ├── 03-Tactics/            ← 可复用战术库（待开发）
    ├── 04-Habits/             ← 习惯基底核（待开发）
    └── 99-Archive/            ← 12周系统归档
```

---

## ⚙️ 插件配置

### 必需插件

1. **Dataview**
   - 版本：0.5.64 或更高
   - 需要启用 DataviewJS
   - 设置：Settings → Dataview → Enable DataviewJs ✅

2. **Templater**
   - 版本：1.14.0 或更高
   - 需要启用 Javascript functions
   - 设置：Settings → Templater → Enable Javascript system commands ✅

### 可选插件

1. **Calendar**
   - 用于管理日记
   - 12周系统独立运行，不依赖Calendar

2. **Tasks**
   - 用于日常任务管理
   - 可以使用 `#12w` 标签与12周系统关联

---

## 🔗 与现有系统的关系

### PARA系统

12周系统与PARA系统**并行运行**，互不干扰：

- **02-PROJECTS/**：保留所有原始项目的完整资料
- **12-Week-Year/02-Projects/**：只包含纳入12周周期的项目视图
- **链接策略**：12周项目 → 原始项目（详细信息）

### 日记系统

- **05-JOURNAL/**：保持不变，用于日常日记
- **12-Week-Year/01-Periods/**：存储周期笔记和周记录
- 可以在日记中引用12周进度

### 任务系统

- 使用独立的YAML字段
- 不干扰Tasks插件的任务管理
- 可以使用 `#12w` 标签关联

---

## 💡 使用提示

### 每周工作流

**周日晚上或周一早上**（30分钟）：
1. 回顾上周周记录
2. 创建本周周记录
3. 设定3个MIT
4. 更新战术进展

**每天晚上**（5分钟）：
1. 更新每日日志
2. 记录障碍和情绪

**周五下午或周日下午**（3小时）：
1. 完成战略时间块
2. 回顾战术进展
3. 调整下周计划

### 战术管理

- **不必预定义所有战术**：可以在每周回顾时添加新战术
- **战术 vs 任务**：
  - 战术 = 里程碑（跨周期存在）
  - 任务 = 具体待办（一周内完成）

### 项目迁移

- **只迁移适合的项目**：能在12周内完成的
- **保持双向链接**：12周项目 → 原始项目
- **未完成项目**：可以延续到下一周期

---

## 🐛 常见问题

### Q：模板变量没有被替换？

**A**：确保 Templater 插件已启用，并且使用 "Insert template" 命令而不是直接打开模板文件。

### Q：Dataview 查询报错？

**A**：
1. 检查是否启用了 DataviewJS
2. 查看开发者控制台（Ctrl+Shift+I）的错误信息
3. 确保YAML frontmatter 格式正确

### Q：周期计算不正确？

**A**：模板使用 Moment.js 计算日期，确保系统日期正确。下一个周一是指从今天开始的下一个周一。

### Q：如何备份12周系统？

**A**：整个 `12-Week-Year/` 文件夹是独立的，可以单独备份。建议使用 Git 进行版本控制。

---

## 📚 参考资源

- [Obsidian 官方文档](https://help.obsidian.md/)
- [Dataview 文档](https://github.com/blacksmithgu/obsidian-dataview)
- [Templater 文档](https://github.com/SilentVoid13/Templater)
- [12周工作法](https://www.12weekyear.com/)

---

*最后更新：2026-02-27*
