# Dataview 代码库

> 复制即用的 Dataview 查询代码模板

---

## 📋 使用说明

### Dataview vs DataviewJS

本教程使用两种查询方式：

1. **DQL (Dataview Query Language)** - 简单查询，用 `\`\`\`dataview`
2. **DataviewJS** - 复杂查询，用 `\`\`\`dataviewjs`

**重要**：使用 DataviewJS 需要在设置中开启：
- 设置 → Dataview → Enable JavaScript Queries → 打开

---

## 🎯 核心看板代码

### 1. 轻重缓急看板（完整版）

**文件**：`00-系统/任务看板.md`

```markdown
# 轻重缓急看板

更新时间：`<%= dateformat(date(now), "yyyy-MM-dd HH:mm") %>`

```dataviewjs
// 获取本周的起止日期
const today = date(moment());
const weekStart = date(moment().startOf('week'));
const weekEnd = date(moment().endOf('week'));

// 定义任务查询函数
function queryTasks(urgent, important) {
    return dv.pages()
        .where(p => {
            if (p.status === "已完成" || p.status === "已暂停") return false;
            return true;
        })
        .file.tasks
        .where(t => {
            if (t.completed) return false;
            if (!t.due) return false;

            const isThisWeek = t.due >= weekStart && t.due <= weekEnd;
            if (!isThisWeek) return false;

            const isUrgent = t.due <= today;
            const isImportant = t.priority === "high" || t.priority === "⏫";

            if (urgent && important) return isUrgent && isImportant;
            if (urgent && !important) return isUrgent && !isImportant;
            if (!urgent && important) return !isUrgent && isImportant;
            if (!urgent && !important) return !isUrgent && !isImportant;

            return false;
        })
        .sort(t => t.due);
}

// 渲染任务组
function renderTaskSection(title, tasks, emoji) {
    dv.header(2, emoji + " " + title);

    if (tasks.length === 0) {
        dv.paragraph("*无任务*");
        return;
    }

    // 按日期分组
    const byDate = tasks.groupBy(t => t.due);

    for (let group of byDate) {
        dv.header(3, group.key);
        dv.taskList(group.rows, false);
    }
}

// 四个象限
renderTaskSection("紧急且重要", queryTasks(true, true), "🔴");
renderTaskSection("紧急不重要", queryTasks(true, false), "🟡");
renderTaskSection("不急但重要", queryTasks(false, true), "🟢");
renderTaskSection("不急不重要", queryTasks(false, false), "🔵");
```
```

---

### 2. 简化版看板（DQL 版本）

**适合初学者，不需要 JavaScript**

```markdown
# 任务看板（简化版）

## 🔴 紧急且重要

```dataview
TASK
WHERE !completed
AND due <= date(today)
AND due >= date(today) - dur(7 days)
AND (priority = "high" OR priority = "⏫")
SORT due ASC
```

## 🟡 紧急不重要

```dataview
TASK
WHERE !completed
AND due <= date(today)
AND due >= date(today) - dur(7 days)
AND (priority != "high" AND priority != "⏫")
SORT due ASC
```

## 🟢 不急但重要

```dataview
TASK
WHERE !completed
AND due > date(today)
AND due <= date(today) + dur(7 days)
AND (priority = "high" OR priority = "⏫")
SORT due ASC
```

## 🔵 不急不重要

```dataview
TASK
WHERE !completed
AND due > date(today)
AND due <= date(today) + dur(7 days)
AND (priority != "high" AND priority != "⏫")
SORT due ASC
```
```

---

## 📊 统计类代码

### 3. 项目进度统计

**文件**：`00-系统/项目进度.md`

```markdown
# 项目进度总览

```dataviewjs
// 查询所有项目
const projects = dv.pages()
    .where(p => p.type === "project" || p.type === "mega-project")
    .where(p => p.status !== "已完成")
    .sort(p => p.created);

// 渲染项目表格
dv.table(["项目名称", "状态", "优先级", "截止日期", "进度"],
    projects.map(p => [
        p.file.link,
        p.status,
        p.priority || "普通",
        p.deadline ? p.deadline : "无",
        p.progress ? p.progress + "%" : "未统计"
    ])
);

// 统计数据
const totalCount = projects.length;
const inProgress = projects.where(p => p.status === "进行中").length;
const planning = projects.where(p => p.status === "规划" || p.status === "计划").length;
const paused = projects.where(p => p.status === "已暂停").length;

dv.paragraph(`**项目总数**：${totalCount}  |  **进行中**：${inProgress}  |  **规划中**：${planning}  |  **已暂停**：${paused}`);
```



### 4. 任务完成统计（本周）

# 本周完成任务统计

```dataview
TABLE WITHOUT ID
  sum(contains(text, "✅")) as "完成任务数",
  length(filter(this.file.tasks, (t) => !t.completed)) as "未完成数",
  round(sum(contains(text, "✅")) / length(this.file.tasks) * 100, 1) as "%"
FROM "03 工作"
WHERE completed >= date(today) - dur(7 days)
GROUP BY file.link
```


---

### 5. 每日任务完成趋势

# 任务完成趋势（最近7天）

```dataviewjs
const last7Days = [];
for (let i = 6; i >= 0; i--) {
    const date = moment().subtract(i, 'days');
    const dateStr = date.format('YYYY-MM-DD');

    const tasks = dv.pages()
        .file.tasks
        .where(t => t.completed && t.completed.format('YYYY-MM-DD') === dateStr);

    last7Days.push({
        date: date.format('MM-DD'),
        count: tasks.length
    });
}

dv.table(["日期", "完成任务数"], last7Days.map(d => [d.date, d.count]));

// 简单的柱状图
const maxCount = Math.max(...last7Days.map(d => d.count), 1);
dv.paragraph(last7Days.map(d => {
    const bar = '█'.repeat(Math.round(d.count / maxCount * 20));
    return `${d.date}: ${bar} ${d.count}`;
}).join('\n'));
```



## 📅 时间范围查询

### 6. 今日任务

```dataview
TASK
WHERE !completed
AND due = date(today)
SORT priority DESC, due ASC
```

---

### 7. 本周任务

```dataview
TASK
WHERE !completed
AND due >= date(today)
AND due <= date(today) + dur(7 days)
GROUP BY due
SORT due ASC
```

---

### 8. 下周任务预告

```dataview
TASK
WHERE !completed
AND due > date(today) + dur(7 days)
AND due <= date(today) + dur(14 days)
GROUP BY due
SORT due ASC
```

---

### 9. 延期任务

```dataview
TASK
WHERE !completed
AND due < date(today)
AND !contains(text, "⏸️")
GROUP BY file.link
SORT due ASC
```

---

### 10. 无日期任务（需要安排）

```dataview
TASK
WHERE !completed
AND due = null
AND scheduled = null
GROUP BY file.link
SORT file.link ASC
```

---

## 🗂️ 分类查询

### 11. 按领域查询任务

#### 个人任务

```dataview
TASK
WHERE !completed
AND file.folder = "01 个人"
SORT due ASC, priority DESC
```

#### 工作任务

```dataview
TASK
WHERE !completed
AND file.folder = "03 工作"
SORT due ASC, priority DESC
```

#### 家庭任务

```dataview
TASK
WHERE !completed
AND file.folder = "02 家庭"
SORT due ASC, priority DESC
```

---

### 12. 按优先级查询

#### 高优先级任务

```dataview
TASK
WHERE !completed
AND (priority = "high" OR priority = "⏫")
SORT due ASC
```

#### 低优先级任务

```dataview
TASK
WHERE !completed
AND (priority = "low" OR priority = "⏬")
SORT due ASC
```

---

### 13. 循环任务列表

```dataview
TASK
WHERE !completed
AND contains(text, "🔁")
GROUP BY file.link
```

---

## 🔍 高级查询

### 14. 搜索特定关键词的任务

**查找所有包含"会议"的任务**

```dataview
TASK
WHERE contains(text, "会议")
AND !completed
SORT due ASC
```

---

### 15. 多条件组合查询

**查找：本周截止 + 工作文件夹 + 高优先级**

```dataview
TASK
WHERE !completed
AND due >= date(today)
AND due <= date(today) + dur(7 days)
AND file.folder = "03 工作"
AND (priority = "high" OR priority = "⏫")
SORT due ASC
```

---

### 16. 项目索引（带进度条）

```markdown
# 项目索引

```dataviewjs
const projects = dv.pages()
    .where(p => p.type === "project")
    .sort(p => p.status);

// 按状态分组
const byStatus = projects.groupBy(p => p.status);

for (let group of byStatus) {
    dv.header(2, group.key);

    dv.table(["项目", "优先级", "截止日期", "任务进度"],
        group.rows.map(p => {
            // 计算进度
            const allTasks = dv.page(p.file.path).file.tasks;
            const completed = allTasks.filter(t => t.completed).length;
            const total = allTasks.length;
            const progress = total > 0 ? Math.round(completed / total * 100) : 0;

            // 进度条
            const bar = '▰'.repeat(Math.round(progress / 10)) + '▱'.repeat(10 - Math.round(progress / 10));

            return [
                p.file.link,
                p.priority || "普通",
                p.deadline || "无",
                `${bar} ${progress}% (${completed}/${total})`
            ];
        })
    );
}
```
```

---

### 17. 任务日历视图

```markdown
# 任务日历

```dataviewjs
const today = moment();
const monthStart = moment().startOf('month');
const monthEnd = moment().endOf('month');

// 获取本月所有有due日期的任务
const tasks = dv.pages().file.tasks
    .where(t => !t.completed && t.due)
    .where(t => t.due >= monthStart && t.due <= monthEnd)
    .sort(t => t.due);

// 按日期分组
const byDate = tasks.groupBy(t => t.due.format('YYYY-MM-DD'));

// 渲染日历
dv.header(3, monthStart.format('YYYY年MM月'));

for (let day = monthStart; day <= monthEnd; day.add(1, 'days')) {
    const dateStr = day.format('YYYY-MM-DD');
    const dayTasks = byDate.find(g => g.key === dateStr);

    const dayName = day.format('ddd');
    const isToday = day.format('YYYY-MM-DD') === today.format('YYYY-MM-DD');

    let line = `${day.format('MM-DD')} (${dayName})`;
    if (isToday) line = `**${line}**`;

    if (dayTasks) {
        line += ` - ${dayTasks.rows.length}个任务`;
        dv.paragraph(line);
        dv.taskList(dayTasks.rows, false);
    } else {
        dv.paragraph(line + " - 无任务");
    }

    dv.paragraph('---');
}
```
```

---

### 18. 灵感库定期整理提醒

```markdown
# 灵感库待整理

```dataview
TABLE WITHOUT ID
  file.link as "灵感",
  file.tasks as "任务数",
  file.ctime as "创建时间"
FROM "灵感库"
WHERE file.tasks.length > 0
SORT file.ctime DESC
LIMIT 20
```

**提示**：定期整理灵感库，将可执行的任务转化为项目
```

---

## 🎨 可视化代码

### 19. 任务分布饼图

```markdown
# 任务分布

```dataviewjs
const folders = ["01 个人", "02 家庭", "03 工作", "04 事业"];

const data = folders.map(folder => {
    const tasks = dv.pages(`"${folder}"`).file.tasks
        .where(t => !t.completed);

    return {
        folder: folder.replace(/^\d+ /, ''),
        count: tasks.length
    };
});

const total = data.reduce((sum, d) => sum + d.count, 0);

dv.paragraph("### 任务分布（按领域）\n");

data.forEach(d => {
    if (d.count > 0) {
        const percentage = Math.round(d.count / total * 100);
        const bar = '█'.repeat(Math.round(percentage / 5));
        dv.paragraph(`${d.folder}: ${bar} ${d.count} (${percentage}%)`);
    }
});
```
```

---

### 20. 优先级分布

```markdown
# 优先级分布

```dataviewjs
const tasks = dv.pages().file.tasks.where(t => !t.completed && t.due);

const high = tasks.filter(t => t.priority === "high" || t.priority === "⏫").length;
const medium = tasks.filter(t => !t.priority || t.priority === "medium").length;
const low = tasks.filter(t => t.priority === "low" || t.priority === "⏬").length;

const total = high + medium + low;

dv.paragraph("### 优先级分布\n");
dv.paragraph(`🔴 高优先级: ${'█'.repeat(Math.round(high/total*50))} ${high} (${Math.round(high/total*100)}%)`);
dv.paragraph(`🟡 普通优先级: ${'█'.repeat(Math.round(medium/total*50))} ${medium} (${Math.round(medium/total*100)}%)`);
dv.paragraph(`🔵 低优先级: ${'█'.repeat(Math.round(low/total*50))} ${low} (${Math.round(low/total*100)}%)`);
```
```

---

## 🛠️ 实用工具代码

### 21. 快速任务查找

**在 Obsidian 中按 `Ctrl/Cmd + F` 搜索时，可以结合这个**

```markdown
# 任务搜索

> 使用 Dataview 快速查找任务

## 按关键词查找

```dataview
TASK
WHERE !completed
AND contains(text, "关键词")
SORT due ASC
```

## 按标签查找（如果你用了标签）

```dataview
TASK
WHERE !completed
AND contains(text, "#重要")
SORT due ASC
```
```

---

### 22. 任务回顾助手

```markdown
# 任务回顾

> 自动识别需要关注的任务

## 🚨 即将到期（未来3天内）

```dataview
TASK
WHERE !completed
AND due >= date(today)
AND due <= date(today) + dur(3 days)
SORT due ASC
```

## ⚠️ 已经延期

```dataview
TASK
WHERE !completed
AND due < date(today)
AND !contains(text, "⏸️")
GROUP BY file.link
SORT due ASC
```

## ❓ 长期未更新（创建超过30天，未完成，无日期）

```dataview
TABLE WITHOUT ID
  file.link as "任务",
  file.ctime as "创建时间"
WHERE !completed
AND due = null
AND scheduled = null
AND date(file.ctime) < date(today) - dur(30 days)
SORT file.ctime ASC
```
```

---

### 23. 每日任务模板（带自动填充）

**配合 Templater 使用**

```markdown
---
date: <% tp.date.now("YYYY-MM-DD") %>
weekday: <% tp.date.now("dddd") %>
---

# 每日任务 - <% tp.date.now("YYYY年MM月DD日 dddd") %>

## 🎯 今日重点

```dataview
TASK
WHERE !completed
AND due = <% tp.date.now("YYYY-MM-DD") %>
AND (priority = "high" OR priority = "⏫")
SORT priority DESC
```

## 📋 今日任务清单

```dataview
TASK
WHERE !completed
AND due = <% tp.date.now("YYYY-MM-DD") %>
SORT priority DESC
```

## 📝 自由记录

-
-
-

## 💡 今日反思


```

---

## 🐛 常见问题排查

### 问题1：Dataview 查询显示为代码块

**原因**：Dataview 插件未启用或语法错误

**解决方案**：
1. 检查插件是否启用
2. 确认使用的是正确的代码块标记：`\`\`\`dataview` 或 `\`\`\`dataviewjs`
3. 检查代码语法是否有错误

---

### 问题2：查询结果为空

**可能原因**：
- 任务没有 `due` 日期
- 任务的 `status` 被设置为排除值
- 文件夹路径不正确

**调试方法**：
```dataview
TABLE file.link, due, status
WHERE !completed
LIMIT 10
```
查看任务的字段值

---

### 问题3：DataviewJS 报错

**常见错误**：
- `moment is not defined` → 需要安装 `moment.js` 或使用 `date()`
- `dv.pages(...) is not a function` → 检查括号和语法

**调试方法**：
1. 打开开发者工具（`Ctrl/Cmd + Shift + I`）
2. 查看 Console 中的错误信息
3. 逐段测试代码

---

## 📝 自定义你的查询

### 修改时间范围

```dataview
// 最近7天
WHERE due >= date(today) - dur(7 days)

// 未来30天
WHERE due <= date(today) + dur(30 days)

// 本月
WHERE due >= date(today).startof("month")
AND due <= date(today).endof("month")
```

### 修改排序方式

```dataview
// 按截止日期升序
SORT due ASC

// 按优先级降序
SORT priority DESC

// 多重排序（先按优先级，再按日期）
SORT priority DESC, due ASC
```

### 修改显示字段

```dataview
TABLE WITHOUT ID
  file.link as "任务",
  due as "截止日期",
  priority as "优先级",
  file.folder as "所属领域"
WHERE !completed
```

---

**下一步** → [05_实战案例集.md](05_实战案例集.md)
