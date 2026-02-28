---
<%*
// 获取周期信息
const periods = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period" && p.status == "active")
    .array();

if (periods.length === 0) {
    new Notice("没有活跃的周期，请先创建周期");
    throw new Error("No active period found");
}

// 如果有多个活跃周期，让用户选择
let period;
if (periods.length === 1) {
    period = periods[0];
} else {
    const choices = periods.map(p => `${p.period_id} - ${p.period_name}`);
    const selected = await tp.system.suggester(choices, periods);
    period = selected;
}

const periodId = period.period_id;
const periodName = period.period_name;

// 获取周数
const currentWeek = period.current_week || 1;
const weekNum = await tp.system.prompt("当前是第几周？", currentWeek.toString());

// 计算日期范围
const startDate = moment(period.start_date).add(weekNum - 1, 'weeks').format('YYYY-MM-DD');
const endDate = moment(period.start_date).add(weekNum - 1, 'weeks').add(6, 'days').format('YYYY-MM-DD');

// 生成每日日期
const dailyDates = [];
for (let i = 0; i < 7; i++) {
    const date = moment(period.start_date).add(weekNum - 1, 'weeks').add(i, 'days');
    dailyDates.push({
        date: date.format('YYYY-MM-DD'),
        weekday: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]
    });
}
%>
type: 12w-week
week_id: <% periodId %>-W<% String(weekNum).padStart(2, '0') %>
period_id: <% periodId %>
week_number: <% weekNum %>

start_date: <% startDate %>
end_date: <% endDate %>

mits:
  - task: "MIT 1：..."
    status: "pending"
    impact: "high"
    time_spent: 0
  - task: "MIT 2：..."
    status: "pending"
    impact: "high"
    time_spent: 0
  - task: "MIT 3：..."
    status: "pending"
    impact: "medium"
    time_spent: 0

tactics_progress: []

strategic_block:
  scheduled: false
  duration_hours: 0
  focus: ""
  insights: ""
  adjustments: ""

next_week_plan:
  focus: ""
  mits_preview: []

habits_tracking:
  daily_coding: "0/7"
  daily_reading: "0/7"
  exercise: "0/7"
  strategic_block: false
  weekly_review: false

reflections:
  wins: ""
  challenges: ""
  lessons: ""
  adjustments: ""

total_hours_spent: 0
created: <% moment().format('YYYY-MM-DD') %>
last_modified: <% moment().format('YYYY-MM-DD') %>
tags: [12w, week, <% periodId %>]
---

# 第<% weekNum %>周：<% startDate %> ~ <% endDate %>

<%*
tR += '\n\n❮ [[' + periodId + '|返回周期]] | ';
tR += '[[../../00-System/Dashboard|仪表板]] ❯\n\n';
%>

## 🎯 本周MIT（Most Important Tasks）

> [!IMPORTANT] MIT原则
> - 最多3个，必须有
> - 高影响力，必须完成
> - 可在3-5小时内完成

| # | 任务 | 状态 | 影响力 | 时间投入 | 完成时间 |
|---|------|------|--------|----------|----------|
| 1 | <% tp.system.prompt("MIT 1（最重要）:") %> | ⏳ | 🔴 High | 0h | _ |
| 2 | <% tp.system.prompt("MIT 2（次重要）:") %> | ⏳ | 🔴 High | 0h | _ |
| 3 | <% tp.system.prompt("MIT 3（可选）:", "", true) %> | ⏳ | 🟡 Medium | 0h | _ |

## 📊 战术执行情况

### 当前周期战术

```dataviewjs
const period = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.period_id == "<% periodId %>")
    .first();

if (period && period.tactics && period.tactics.length > 0) {
    const currentWeekTactics = period.tactics.filter(t => t.target_week <= <% weekNum %>);

    if (currentWeekTactics.length > 0) {
        dv.table(["战术", "目标周", "状态", "完成度", "本周行动"],
            currentWeekTactics.map(t => [
                `**${t.name}**`,
                `第${t.target_week}周`,
                t.status == "done" ? "✅ 已完成" :
                t.status == "in_progress" ? "🔄 进行中" : "⏳ 未开始",
                `${t.completion || 0}%`,
                "_"  // 手动填写本周行动
            ])
        );
    } else {
        dv.paragraph("_暂无需要关注的战术_");
    }
} else {
    dv.paragraph("_暂无战术数据_");
}
```

### 本周战术进展详情

<%*
// 让用户输入本周重点战术和进展
const focusTactic = await tp.system.prompt("本周重点战术是什么？", "", true);
const plannedTasks = await tp.system.prompt("计划完成多少个任务？", "0", true);
const completedTasks = await tp.system.prompt("实际完成了多少个？", "0", true);
const blockers = await tp.system.prompt("有什么阻碍？", "无", true);

if (focusTactic) {
    tR += `- **重点战术**：${focusTactic}\n`;
    tR += `- **计划任务数**：${plannedTasks}\n`;
    tR += `- **实际完成**：${completedTasks}\n`;
    if (blockers && blockers !== "无") {
        tR += `- **阻碍因素**：${blockers}\n`;
    }
    tR += '\n';
}
%>

## 🕐 战略时间块（3小时）

> [!TIME] 战略时间块
> **目的**：回顾进展，调整计划，思考下一步
> **建议时间**：周五晚上或周日下午
> **地点**：安静的地方，关闭手机通知

### 执行记录

- **是否完成**：<% tp.system.suggester(["是", "否"], [true, false]) ? "✅ 是" : "❌ 否" %>
- **实际时长**：_ 小时
- **聚焦主题**：_（手动填写）

### 洞察与决策

<% tp.system.prompt("本周有什么重要洞察？", "", true) %>

### 调整与优化

<% tp.system.prompt("需要调整什么计划？", "", true) %>

## 🔄 下周计划

### 重点方向

<% tp.system.prompt("下周的重点是什么？") %>

### MIT预览

1. <% tp.system.prompt("下周MIT 1：") %>
2. <% tp.system.prompt("下周MIT 2：") %>
3. <% tp.system.prompt("下周MIT 3（可选）：", "", true) %>

## 📅 每日日志

> [!INFO] 快速记录
> 每天花5分钟记录当天进展和障碍

| 日期 | 关键进展 | 障碍/问题 | 情绪 | 时间投入 |
|------|---------|----------|------|----------|
<%*
dailyDates.forEach(day => {
    tR += `| ${day.date} (${day.weekday}) | | | 😐 | 0h |\n`;
});
%>

## 💪 习惯追踪

<%*
tR += '\n### 本周习惯完成情况\n\n';
tR += '- **每日编码/学习**：' + await tp.system.prompt("本周学习了几天？", "0", true) + '/7\n';
tR += '- **每日阅读**：' + await tp.system.prompt("本周阅读了几天？", "0", true) + '/7\n';
tR += '- **运动**：' + await tp.system.prompt("本周运动了几天？", "0", true) + '/7\n';
tR += '- **战略时间块**：' + (await tp.system.suggester(["完成", "未完成"], ["true", "false"]) ? "✅" : "❌") + '\n';
tR += '- **周回顾**：' + (await tp.system.suggester(["完成", "未完成"], ["true", "false"]) ? "✅" : "❌") + '\n\n';
%>

## 📝 本周反思

### 胜利时刻 💪
<% tp.system.prompt("本周最大的胜利是什么？", "", true) %>

### 挑战与困难 ⚠️
<% tp.system.prompt("遇到什么挑战？", "", true) %>

### 经验教训 💡
<% tp.system.prompt("学到了什么？", "", true) %>

### 下周调整 🔄
<% tp.system.prompt("下周需要改变什么？", "", true) %>

---

## 📊 本周统计

```dataviewjs
const week = dv.current();

// MIT完成情况
if (week.mits && week.mits.length > 0) {
    const completed = week.mits.filter(m => m.status == "done").length;
    const total = week.mits.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    dv.paragraph(`**MIT完成率**：${completed}/${total} (${progress}%)`);

    // 总时间投入
    const totalHours = week.mits.reduce((sum, m) => sum + (m.time_spent || 0), 0);
    if (totalHours > 0) {
        dv.paragraph(`**总时间投入**：${totalHours} 小时`);
        dv.paragraph(`**平均每MIT**：${(totalHours / total).toFixed(1)} 小时`);
    }
}

// 习惯完成情况
if (week.habits_tracking) {
    const habits = week.habits_tracking;
    dv.paragraph("\n**习惯追踪**：");
    if (habits.daily_coding) dv.paragraph(`- 每日编码：${habits.daily_coding}`);
    if (habits.daily_reading) dv.paragraph(`- 每日阅读：${habits.daily_reading}`);
    if (habits.exercise) dv.paragraph(`- 运动：${habits.exercise}`);
}
```

---

<% await tp.file.move("12-Week-Year/01-Periods/" + tp.file.title) %>
