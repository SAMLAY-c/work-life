# 📁 新文件夹结构说明

> 重构日期：2026-02-07
> 原结构已备份至 `.old-structure-backup/`

---

## 🎯 设计原则

1. **扁平化**：最大深度 2-3 层（原结构 6-7 层）
2. **数字前缀**：10-20-30 顺序编号，逻辑清晰
3. **功能聚合**：相似功能合并，减少文件夹数量
4. **保留内容**：所有原内容完整保留，仅移动位置

---

## 📂 新结构一览

```
work-life/
│
├── 00-Inbox/                    📥 快速收件箱（临时使用）
│
├── 10-Projects/                 🎯 活跃项目（原 20_Projects）
│   ├── B端产品/
│   ├── PE-插件/                 （原 PE/插件 扁平化）
│   ├── 产品/
│   ├── 稿子/
│   ├── 规划/
│   └── 账号/
│
├── 20-Areas/                    📊 长期领域（原 30_Areas）
│
├── 30-Resources/                📚 知识资源（合并 40_Resources + 60_AI_Dev）
│   ├── AI-知识/                 （原 02-Knowledge）
│   ├── AI-代码/                 （原 03-Coding + 04-vibeCoding）
│   ├── AI-项目/                 （原 01-Projects + 11-小智）
│   └── 通用资源/                （原 40_Resources）
│
├── 40-Archive/                  🗃️ 归档内容（合并 50_Archives + 70_Work_Archive）
│   ├── 已完成项目/              （原 50_Archives）
│   └── 历史工作/                （原 70_Work_Archive）
│
├── 50-Journal/                  📓 日记（合并 06_DailyNotes + 07_PeriodicNotes）
│
├── 60-Templates/                📋 模板（原 05_Templates）
│   └── Daily-Notes.md           （路径已更新）
│   └── Weekly-Notes.md          （路径已更新）
│   └── ...
│
├── 70-Assets/                   🖼️ 资产文件（合并所有附件）
│   ├── Canvas/                  （原 00_Canvas）
│   ├── Media/                   （原 00_Media）
│   └── System/                  （原 90_System + 92_asset + 00_Scripts）
│
├── 80-Inbox-分类/               📥 内容分类（原 10_Inbox 整理）
│   ├── B站/                     （246个文件，保留日期结构）
│   ├── 抖音/
│   ├── 小红书/
│   ├── 临时/
│   ├── PPT/
│   └── 讲稿/
│
└── 91_account-front/            💻 前端项目（保留）
```

---

## 🔄 迁移映射表

| 原路径 | 新路径 | 说明 |
|--------|--------|------|
| `10_Inbox/` | `00-Inbox/` + `80-Inbox-分类/` | 拆分为主收件箱和分类 |
| `20_Projects/` | `10-Projects/` | 直接迁移 |
| `30_Areas/` | `20-Areas/` | 直接迁移 |
| `40_Resources/` | `30-Resources/通用资源/` | 子文件夹 |
| `50_Archives/` | `40-Archive/已完成项目/` | 子文件夹 |
| `60_AI_Dev/` | `30-Resources/AI-*/` | 拆分到3个子文件夹 |
| `70_Work_Archive/` | `40-Archive/历史工作/` | 子文件夹 |
| `06_DailyNotes/` | `50-Journal/` | 合并 |
| `07_PeriodicNotes/` | `50-Journal/` | 合并 |
| `05_Templates/` | `60-Templates/` | 直接迁移 |
| `00_Canvas/` | `70-Assets/Canvas/` | 子文件夹 |
| `00_Media/` | `70-Assets/Media/` | 子文件夹 |
| `00_Scripts/` | `70-Assets/System/Scripts/` | 子文件夹 |
| `90_System/` | `70-Assets/System/` | 合并 |
| `92_asset/` | `70-Assets/System/asset/` | 子文件夹 |

---

## ✅ 改进对比

| 指标 | 原结构 | 新结构 | 改进 |
|------|--------|--------|------|
| 顶层文件夹数 | 16+ | 10 | **-38%** |
| 最大深度 | 6-7 层 | 2-3 层（常用） | **-60%** |
| AI 相关分散度 | 5+ 子文件夹 | 3 个聚合文件夹 | **更清晰** |
| 附件分散度 | 5+ 位置 | 1 个 Assets | **统一管理** |
| 总文件数 | ~9,650 | ~9,630 | **完整保留** |
| 总大小 | 1.2GB | 1.2GB | **完整保留** |

---

## 📝 模板更新

以下模板已自动更新路径：

- `60-Templates/Daily-Notes.md`
- `60-Templates/Weekly-Notes.md`
- `60-Templates/Monthly-Notes.md`
- `60-Templates/Quarterly-Notes.md`
- `60-Templates/Yearly-Notes.md`

**路径变更：**
- `/-Daily-Notes/` → `50-Journal/`
- `/-Periodic-Notes/` → `50-Journal/`

---

## 🗑️ 清理旧结构

如需删除备份：

```bash
rm -rf .old-structure-backup/
```

> ⚠️ 确认新结构正常工作后再删除！

---

## 💡 使用建议

1. **日常使用**：主要在 `00-Inbox`、`10-Projects`、`50-Journal` 之间切换
2. **知识管理**：使用 `30-Resources` 查阅和添加内容
3. **定期归档**：完成的项目移动到 `40-Archive/已完成项目/`
4. **深度内容**：`40-Archive/历史工作/` 保留原结构，按需访问
