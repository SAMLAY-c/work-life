---
type: 12w-dashboard
created: 2026-02-27
tags: [12w, dashboard]
---

# 12周工作法 - 主仪表板

> [!INFO] 关于12周工作法
> **核心理念**：12周 = 1年（不是季度计划！）
> **三层结构**：目标 → 战术 → 任务
> **关键驱动**：紧迫感、仪式感、成就感

---

## 📅 所有12周周期

```dataviewjs
// 获取所有周期
const periods = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period")
    .sort(p => p.start_date, 'desc')
    .array();

if (periods.length === 0) {
    dv.paragraph("_暂无周期数据。请使用模板创建第一个周期。_");
} else {
    dv.table([
        "周期",
        "时间范围",
        "目标",
        "完成度",
        "评分",
        "状态"
    ], periods.map(p => {
        const completedTactics = p.tactics ? p.tactics.filter(t => t.status == "done").length : 0;
        const totalTactics = p.tactics ? p.tactics.length : 0;

        return [
            `[[${p.file.name}|${p.period_name}]]`,
            `${p.start_date} → ${p.end_date}`,
            p.goal || "_",
            totalTactics > 0 ? `${completedTactics}/${totalTactics} 战术` : "_",
            p.score && p.score.execution > 0 ? `${p.score.execution}/5` : "-",
            p.status == "active" ? "🔥 活跃" :
            p.status == "completed" ? "✅ 已完成" :
            p.status == "archived" ? "📦 已归档" : p.status
        ];
    }));
}
```

---

## 🎯 当前周期

```dataviewjs
// 获取当前活跃周期
const currentPeriod = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period" && p.status == "active")
    .first();

if (!currentPeriod) {
    dv.paragraph("### ⚠️ 没有活跃的周期");
    dv.paragraph("_请创建一个新的12周周期以开始追踪。_");
} else {
    dv.header(3, `🔥 ${currentPeriod.period_name}`);

    dv.paragraph(`**目标**：${currentPeriod.goal}`);
    dv.paragraph(`**时间**：${currentPeriod.start_date} → ${currentPeriod.end_date}`);
    dv.paragraph(`**进度**：第 ${currentPeriod.current_week || 1} / 12 周`);

    // 战术执行情况
    if (currentPeriod.tactics && currentPeriod.tactics.length > 0) {
        dv.header(4, "📋 战术执行看板");

        const tacticsByStatus = {
            done: currentPeriod.tactics.filter(t => t.status == "done"),
            inProgress: currentPeriod.tactics.filter(t => t.status == "in_progress"),
            pending: currentPeriod.tactics.filter(t => t.status == "pending")
        };

        dv.paragraph(`**已完成**：${tacticsByStatus.done.length} | **进行中**：${tacticsByStatus.inProgress.length} | **未开始**：${tacticsByStatus.pending.length}`);

        dv.table(["ID", "战术名称", "目标周", "状态", "完成度", "行动"],
            currentPeriod.tactics.map(t => {
                const isCurrentWeek = t.target_week == (currentPeriod.current_week || 1);
                const isOverdue = t.target_week < (currentPeriod.current_week || 1) && t.status !== "done";

                let statusEmoji = "⏳";
                if (t.status == "done") statusEmoji = "✅";
                else if (t.status == "in_progress") statusEmoji = "🔄";
                else if (isOverdue) statusEmoji = "⚠️";

                return [
                    t.id,
                    `**${t.name}**`,
                    `第${t.target_week}周${isCurrentWeek ? " 🔥" : ""}${isOverdue ? " ⚠️" : ""}`,
                    `${statusEmoji} ${t.status}`,
                    `${t.completion || 0}%`,
                    isCurrentWeek || isOverdue ? `[[${currentPeriod.period_id}-W${String(currentPeriod.current_week || 1).padStart(2, '0')}|查看周记录]]` : ""
                ];
            })
        );
    }

    // 时间投入
    if (currentPeriod.metrics) {
        dv.header(4, "⏱️ 时间投入");
        const spent = currentPeriod.metrics.total_hours_spent || 0;
        const planned = currentPeriod.metrics.total_hours_planned || 150;
        const remaining = planned - spent;
        const progress = planned > 0 ? Math.round((spent / planned) * 100) : 0;

        dv.paragraph(`- **计划时间**：${planned} 小时`);
        dv.paragraph(`- **已投入**：${spent} 小时 (${progress}%)`);
        dv.paragraph(`- **剩余**：${remaining} 小时`);
    }
}
```

---

## 📅 本周概览

```dataviewjs
// 获取当前活跃周期
const currentPeriod = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period" && p.status == "active")
    .first();

if (!currentPeriod) {
    dv.paragraph("_没有活跃的周期_");
} else {
    const currentWeek = currentPeriod.current_week || 1;
    const weekId = `${currentPeriod.period_id}-W${String(currentWeek).padStart(2, '0')}`;
    const weekFile = dv.pages('"12-Week-Year/01-Periods"')
        .where(p => p.week_id == weekId)
        .first();

    dv.header(4, `🔥 第${currentWeek}周 (${currentPeriod.start_date})`);

    if (weekFile) {
        // 显示本周MIT
        if (weekFile.mits && weekFile.mits.length > 0) {
            dv.paragraph("**本周MIT**：");
            weekFile.mits.forEach((mit, index) => {
                const status = mit.status == "done" ? "✅" :
                              mit.status == "in_progress" ? "🔄" : "⏳";
                dv.paragraph(`${index + 1}. ${status} ${mit.task} (${mit.impact} impact)`);
            });
        }

        // 显示习惯追踪
        if (weekFile.habits_tracking) {
            dv.paragraph("\n**习惯追踪**：");
            const habits = weekFile.habits_tracking;
            if (habits.daily_coding) dv.paragraph(`- 每日编码：${habits.daily_coding}`);
            if (habits.daily_reading) dv.paragraph(`- 每日阅读：${habits.daily_reading}`);
            if (habits.exercise) dv.paragraph(`- 运动：${habits.exercise}`);
            if (habits.strategic_block !== undefined) {
                dv.paragraph(`- 战略时间块：${habits.strategic_block ? "✅" : "❌"}`);
            }
        }
    } else {
        dv.paragraph(`_本周记录尚未创建。请点击[[${weekId}|这里]]创建。_`);
    }
}
```

---

## 🚀 12周项目

```dataviewjs
// 获取当前活跃周期
const currentPeriod = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period" && p.status == "active")
    .first();

if (!currentPeriod) {
    dv.paragraph("_没有活跃的周期_");
} else {
    const projects = dv.pages('"12-Week-Year/02-Projects"')
        .where(p => p.period_id == currentPeriod.period_id)
        .array();

    if (projects.length === 0) {
        dv.paragraph("_当前周期没有项目。请使用项目迁移模板添加项目。_");
    } else {
        dv.table(["项目", "目标", "截止日期", "战术进度", "状态"],
            projects.map(p => {
                const completedTactics = p.tactics ? p.tactics.filter(t => t.status == "done").length : 0;
                const totalTactics = p.tactics ? p.tactics.length : 0;

                return [
                    `[[${p.file.name}]]`,
                    p.project_goal_12w || "_",
                    p.deadline || "_",
                    totalTactics > 0 ? `${completedTactics}/${totalTactics}` : "_",
                    p.status || "_"
                ];
            })
        );
    }
}
```

---

## 📊 最近周记录

```dataviewjs
// 获取当前活跃周期
const currentPeriod = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period" && p.status == "active")
    .first();

if (!currentPeriod) {
    dv.paragraph("_没有活跃的周期_");
} else {
    const weeks = dv.pages('"12-Week-Year/01-Periods"')
        .where(p => p.type == "12w-week" && p.period_id == currentPeriod.period_id)
        .sort(p => p.week_number, 'desc')
        .limit(5)
        .array();

    if (weeks.length === 0) {
        dv.paragraph("_暂无周记录_");
    } else {
        dv.table(["周", "日期范围", "MIT完成", "时间投入", "习惯完成"],
            weeks.map(w => {
                const completedMits = w.mits ? w.mits.filter(m => m.status == "done").length : 0;
                const totalMits = w.mits ? w.mits.length : 0;
                const totalHours = w.mits ? w.mits.reduce((sum, m) => sum + (m.time_spent || 0), 0) : 0;

                let habitsCompleted = 0;
                if (w.habits_tracking) {
                    const h = w.habits_tracking;
                    const codingCount = h.daily_coding ? parseInt(h.daily_coding.split('/')[0]) : 0;
                    habitsCompleted += codingCount;
                }

                return [
                    `[[${w.file.name}|第${w.week_number}周]]`,
                    `${w.start_date} ~ ${w.end_date}`,
                    `${completedMits}/${totalMits}`,
                    `${totalHours}h`,
                    habitsCompleted > 0 ? `${habitsCompleted}/21` : "_"
                ];
            })
        );
    }
}
```

---

## 🎯 快速操作

### 创建新内容

- **创建新周期**：使用 `12w-Period-Template.md` 模板
- **创建周记录**：使用 `12w-Week-Template.md` 模板
- **迁移项目**：使用 `12w-Project-Migration.md` 模板

### 快捷链接

- [[../02-PROJECTS|原始项目库]]
- [[../03-AREAS|长期领域]]
- [[../04-RESOURCES|知识资源]]
- [[../05-JOURNAL|日记]]
- [[../99-ARCHIVE/60-Templates|其他模板]]

---

## 📈 系统状态

```dataviewjs
// 统计信息
const periods = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period")
    .array();

const weeks = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-week")
    .array();

const projects = dv.pages('"12-Week-Year/02-Projects"')
    .where(p => p.type == "12w-project")
    .array();

dv.paragraph("**系统统计**：");
dv.paragraph(`- 总周期数：${periods.length}`);
dv.paragraph(`- 活跃周期：${periods.filter(p => p.status == "active").length}`);
dv.paragraph(`- 已完成周期：${periods.filter(p => p.status == "completed").length}`);
dv.paragraph(`- 总周记录：${weeks.length}`);
dv.paragraph(`- 12周项目：${projects.length}`);

// 计算平均完成率
const completedPeriods = periods.filter(p => p.status == "completed");
if (completedPeriods.length > 0) {
    const avgScore = completedPeriods.reduce((sum, p) => {
        return sum + (p.score?.execution || 0);
    }, 0) / completedPeriods.length;

    dv.paragraph(`- 平均周期评分：${avgScore.toFixed(1)}/5`);
}
```

---

## 💡 提示

1. **每周必须做**：
   - 设定3个MIT（最重要任务）
   - 完成3小时战略时间块
   - 更新每日日志
   - 记录习惯完成情况

2. **战术管理**：
   - 战术不一定要在周期开始时全部定义
   - 可以每周回顾时添加新战术
   - 战术应该是"里程碑"，不是"任务"

3. **项目迁移**：
   - 只迁移适合12周内完成的项目
   - 保持与原始项目的双向链接
   - 未完成的项目可以延续到下一周期

4. **周期结束**：
   - 填写周期评分（1-5分）
   - 完成周期复盘
   - 归档或延续未完成项目

---

*最后更新：<% moment().format('YYYY-MM-DD HH:mm') %>*
