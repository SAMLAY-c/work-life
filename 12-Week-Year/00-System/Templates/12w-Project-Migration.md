---
<%*
// 获取原始项目信息
const projectPath = await tp.system.prompt("输入原始项目路径（如：02-PROJECTS/vibecoding-教程）");
const projectName = await tp.system.prompt("项目名称");

// 获取活跃周期
const periods = dv.pages('"12-Week-Year/01-Periods"')
    .where(p => p.type == "12w-period" && p.status == "active")
    .array();

if (periods.length === 0) {
    new Notice("没有活跃的周期，请先创建周期");
    throw new Error("No active period found");
}

let period;
if (periods.length === 1) {
    period = periods[0];
} else {
    const choices = periods.map(p => `${p.period_id} - ${p.period_name}`);
    const selected = await tp.system.suggester(choices, periods);
    period = selected;
}

const periodId = period.period_id;
const periodGoal = period.goal;

// 获取项目详细信息
const deadline = await tp.system.prompt("预计完成日期（12周内）", moment().add(12, 'weeks').format('YYYY-MM-DD'));
const estimatedHours = await tp.system.prompt("预计总小时数", "50");
const goalAlignment = await tp.system.prompt("与周期目标的对齐说明", "");
const projectGoal = await tp.system.prompt("12周内要达成什么目标？");

// 获取战术信息
const tactics = [];
const tacticCount = parseInt(await tp.system.prompt("预计几个战术里程碑？", "3", true));

for (let i = 0; i < tacticCount; i++) {
    const tacticName = await tp.system.prompt(`战术${i + 1}名称`, "", true);
    if (!tacticName) continue;

    const targetWeek = parseInt(await tp.system.prompt(`目标完成周数（1-12）`, String(Math.floor(12 / (i + 1))), true));
    const tacticId = `T${String(i + 1).padStart(2, '0')}`;

    tactics.push({
        tactic_id: tacticId,
        name: tacticName,
        target_week: targetWeek,
        status: "pending"
    });
}
%>
type: 12w-project
period_id: <% periodId %>
period_project: true

# 现有项目字段（保持不变）
status: 进行中
type: project
priority: high
created: <% moment().format('YYYY-MM-DD') %>
deadline: <% deadline %>
estimated_tasks: <% tactics.length * 5 %>
estimated_hours: <% estimatedHours %>

# 12周扩展字段
goal_alignment: <% goalAlignment %>
project_goal_12w: <% projectGoal %>

tactics:
<% tactics.forEach(t => { %>
  - tactic_id: "<% t.tactic_id %>"
    name: <% t.name %>
    target_week: <% t.target_week %>
    status: "pending"
    completion: 0
<% }); %>

weekly_checkpoints: []

tags: [project, 12w, <% periodId %>]
---

# <% projectName %>

<%*
tR += '\n\n❮ [[' + periodId + '|返回周期]] | ';
tR += ' [[' + projectPath + '|查看原始项目详情]] ❯\n\n';
%>

## 🎯 项目简介

<% tp.system.prompt("项目简介（1-2句话）：") %>

**原始项目路径**：[[<% projectPath %>]]
**所属周期**：[[<% periodId %>]]

## 🎯 12周目标

<% projectGoal %>

**对齐周期目标**：<% goalAlignment %>

## 📋 战术分解

> [!INFO] 战术 vs 任务
> - **战术**：必经的里程碑，跨周期存在
> - **任务**：具体的待办，一周内完成

| 战术ID | 战术名称 | 目标周 | 状态 | 完成度 | 备注 |
|--------|---------|--------|------|--------|------|
<% tactics.forEach(t => { %>
| <% t.tactic_id %> | <% t.name %> | 第<% t.target_week %>周 | ⏳ | 0% | |
<% }); %>

## 📊 周检查点

<%*
// 自动生成12周检查点表格
for (let i = 1; i <= 12; i++) {
    const weekDate = moment(period.start_date).add(i - 1, 'weeks').format('YYYY-MM-DD');
    tR += `| ${i} | ${weekDate} | | | |\n`;
}
%>

| 周 | 日期 | 目标 | 状态 | 完成日期 |
|----|------|------|------|----------|
<% for (let i = 1; i <= 12; i++) {
    const weekDate = moment(period.start_date).add(i - 1, 'weeks').format('YYYY-MM-DD');
    tR += `| ${i} | ${weekDate} | | | |\n`;
} %>

## 📈 进度追踪

### 时间投入

```dataviewjs
const project = dv.current();
const totalHours = project.estimated_hours || 50;
const weeksSpent = project.weeks_spent || 0;
const hoursPerWeek = Math.round(totalHours / 12);

dv.paragraph(`- **预计总时间**：${totalHours} 小时`);
dv.paragraph(`- **平均每周**：${hoursPerWeek} 小时`);
if (weeksSpent > 0) {
    dv.paragraph(`- **已投入周数**：${weeksSpent} 周`);
    dv.paragraph(`- **预计剩余**：${totalHours - (weeksSpent * hoursPerWeek)} 小时`);
}
```

### 战术完成度

```dataviewjs
const project = dv.current();
if (project.tactics && project.tactics.length > 0) {
    const completed = project.tactics.filter(t => t.status == "done").length;
    const inProgress = project.tactics.filter(t => t.status == "in_progress").length;
    const total = project.tactics.length;

    dv.paragraph(`**战术进度**：${completed}/${total} 已完成`);

    if (inProgress > 0) {
        dv.paragraph(`**进行中**：${inProgress} 个战术`);
    }

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    dv.paragraph(`**总进度**：${progress}%`);
}
```

### 周检查点完成情况

```dataviewjs
const project = dv.current();
if (project.weekly_checkpoints && project.weekly_checkpoints.length > 0) {
    const completed = project.weekly_checkpoints.filter(c => c.status == "done").length;
    const total = project.weekly_checkpoints.length;

    dv.paragraph(`**检查点完成**：${completed}/${total} 周`);
}
```

## 📝 项目日志

### <% moment().format('YYYY-MM-DD') %> - 项目启动

**启动原因**：<% tp.system.prompt("为什么要在12周内完成这个项目？", "", true) %>

**成功标准**：
- <% tp.system.prompt("成功的标准是什么（1）:") %>
- <% tp.system.prompt("成功的标准是什么（2）:", "", true) %>

**所需资源**：
<% tp.system.prompt("需要什么资源？", "", true) %>

**风险与挑战**：
<% tp.system.prompt("可能遇到什么挑战？", "", true) %>

---

## 🔗 相关链接

- **周期笔记**：[[<% periodId %>]]
- **原始项目**：[[<% projectPath %>]]
- **相关领域**：_（手动添加）_
- **参考资料**：_（手动添加）_

---

## 📋 快速检查清单

### 启动阶段（第1-2周）
- [ ] 明确12周目标
- [ ] 分解战术里程碑
- [ ] 确定所需资源
- [ ] 设定检查点

### 执行阶段（第3-10周）
- [ ] 每周更新检查点
- [ ] 跟踪战术进展
- [ ] 记录时间投入
- [ ] 及时调整计划

### 收尾阶段（第11-12周）
- [ ] 完成所有战术
- [ ] 验证成功标准
- [ ] 项目复盘
- [ ] 准备成果展示

---

<% await tp.file.move("12-Week-Year/02-Projects/" + tp.file.title) %>
