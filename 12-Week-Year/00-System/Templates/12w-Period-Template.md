---
<%* // 获取下一个周期ID
const existingPeriods = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period")
    .sort(p => p.start_date, 'desc')
    .array();

let nextPeriodNum = 1;
if (existingPeriods.length > 0) {
    const lastPeriod = existingPeriods[0];
    const lastId = lastPeriod.period_id;
    const lastNum = parseInt(lastId.split('-P')[1]);
    nextPeriodNum = lastNum + 1;
}

const periodId = `2026-P${String(nextPeriodNum).padStart(2, '0')}`;

// 计算周期开始日期（下一个周一）
const today = moment();
const daysUntilMonday = (8 - today.day()) % 7 || 7;
const startOfWeek = today.clone().add(daysUntilMonday, 'days');
const startDate = startOfWeek.format('YYYY-MM-DD');
const endDate = startOfWeek.clone().add(12, 'weeks').format('YYYY-MM-DD');

// 获取用户输入
const goal = await tp.system.prompt("请输入这个12周的终极目标：");
const periodName = await tp.system.prompt("周期名称（如：第一季度年）：", `第${nextPeriodNum}周期`);

// 计算每周的日期范围
const weekDates = [];
for (let i = 0; i < 12; i++) {
    const weekStart = startOfWeek.clone().add(i, 'weeks');
    const weekEnd = weekStart.clone().add(6, 'days');
    weekDates.push({
        weekNum: i + 1,
        start: weekStart.format('YYYY-MM-DD'),
        end: weekEnd.format('YYYY-MM-DD')
    });
}
%>
type: 12w-period
period_id: <% periodId %>
period_name: <% periodName %>

start_date: <% startDate %>
end_date: <% endDate %>
week_count: 12
current_week: 1

goal: <% goal %>

tactics:
  - id: "T01"
    name: "战术1：..."
    target_week: 3
    status: "pending"
    completion: 0

metrics:
  total_hours_planned: 150
  total_hours_spent: 0
  strategic_blocks_completed: 0
  strategic_blocks_total: 12

score:
  execution: 0
  satisfaction: 0
  learning: 0
  notes: ""

status: "active"
created: <% moment().format('YYYY-MM-DD') %>
last_review: <% startDate %>
tags: [12w, period, <% moment().format('YYYY') %>]
---

# <% periodName %>

<%*
tR += '\n\n❮ [[../../00-System/Dashboard|返回仪表板]] | ';
tR += '[[../../02-Projects|项目库]] | ';
tR += '[[../../03-Tactics|战术库]] ❯\n\n';
%>

## 🎯 周期目标

<% goal %>

## 📅 时间规划

- **开始日期**：<% startDate %>（周一）
- **结束日期**：<% endDate %>（周日）
- **周期长度**：12周（84天）
- **战略时间块**：总计12次（每周1次，每次3小时）

## 🎯 战术分解

> [!INFO] 战术添加原则
> - 不必在周期开始时就定义所有12周的任务
> - 可以每周回顾时添加新的战术
> - 战术应该是"必经的里程碑"，不是具体任务

### 当前战术列表

| ID | 战术名称 | 目标周 | 状态 | 完成度 | 截止日期 |
|----|---------|--------|------|--------|----------|
| T01 | 战术1：... | 第3周 | ⏳ 未开始 | 0% | <% weekDates[2].start %> |

<%*
// 自动生成12周周记录导航表格
tR += '\n## 📝 周记录导航\n\n';
tR += '| 周 | 日期范围 | 周记录链接 | 状态 |\n';
tR += '|----|---------|-----------|------|\n';

weekDates.forEach((week, index) => {
    const weekNum = index + 1;
    const weekFile = `${periodId}-W${String(weekNum).padStart(2, '0')}`;
    let status = '⏳';

    if (weekNum === 1) {
        status = '🔥 本周';
    } else if (weekNum === 2) {
        status = '▶️ 下周';
    }

    tR += `| ${weekNum} | ${week.start} ~ ${week.end} | [[${weekFile}|${index === 0 ? '查看' : '创建'}]] | ${status} |\n`;
});
%>

## 📊 进度追踪

### 战术完成度
```dataviewjs
const period = dv.current();
if (period.tactics && period.tactics.length > 0) {
    const completed = period.tactics.filter(t => t.status == "done").length;
    const inProgress = period.tactics.filter(t => t.status == "in_progress").length;
    const pending = period.tactics.filter(t => t.status == "pending").length;
    const total = period.tactics.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    dv.paragraph(`**完成进度**：${completed} / ${total} 战术 (${progress}%)`);

    dv.paragraph(`\`\`\`mermaid
pie showData
    title 战术完成进度
    "已完成" : ${completed}
    "进行中" : ${inProgress}
    "未开始" : ${pending}
\`\`\``);
} else {
    dv.paragraph("_暂无战术数据_");
}
```

### 时间投入
```dataviewjs
const period = dv.current();
if (period.metrics) {
    const spent = period.metrics.total_hours_spent || 0;
    const planned = period.metrics.total_hours_planned || 150;
    const remaining = planned - spent;
    const progress = planned > 0 ? Math.round((spent / planned) * 100) : 0;

    dv.paragraph(`- **计划时间**：${planned} 小时`);
    dv.paragraph(`- **已投入**：${spent} 小时`);
    dv.paragraph(`- **剩余**：${remaining} 小时 (${progress}%)`);
}
```

### 周记录汇总
```dataviewjs
const period = dv.current();
const weeks = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-week" && p.period_id == period.period_id)
    .sort(p => p.week_number)
    .array();

if (weeks.length > 0) {
    dv.paragraph(`**已完成周记录**：${weeks.length} / 12 周`);

    // 计算总时间投入
    let totalHours = 0;
    weeks.forEach(w => {
        if (w.mits) {
            w.mits.forEach(mit => {
                if (mit.time_spent) {
                    totalHours += mit.time_spent;
                }
            });
        }
    });

    if (totalHours > 0) {
        dv.paragraph(`**累计时间**：${totalHours} 小时`);
    }

    // 显示最近3周的状态
    dv.paragraph("\n**最近周记录**：");
    weeks.slice(-3).forEach(w => {
        const completedMits = w.mits ? w.mits.filter(m => m.status == "done").length : 0;
        const totalMits = w.mits ? w.mits.length : 0;
        dv.paragraph(`- 第${w.week_number}周：${completedMits}/${totalMits} MIT完成`);
    });
} else {
    dv.paragraph("_暂无周记录_");
}
```

## 📈 周期评分（周期结束时填写）

> [!CHECK] 评分标准
> - **执行力 (1-5)**：是否按计划执行，完成了多少战术
> - **满意度 (1-5)**：对成果是否满意，是否达到预期
> - **学习成长 (1-5)**：获得了什么新知识、新技能

| 维度 | 评分 | 说明 |
|------|------|------|
| 执行力 | |  |
| 满意度 | |  |
| 学习成长 | |  |

**备注**：

## 📝 周期复盘（周期结束时填写）

### 胜利时刻
-

### 挑战与困难
-

### 经验教训
-

### 下周期改进
-

---

<% await tp.file.move("12-Week-Year/01-Periods/" + tp.file.title) %>
