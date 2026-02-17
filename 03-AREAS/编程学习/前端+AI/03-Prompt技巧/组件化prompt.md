# 组件化Prompt技巧

> 如何用组件化思维描述前端需求

---

## 🧩 什么是组件化Prompt？

### 核心思想

把复杂需求拆分成**小的、可复用的组件**，分别描述，最后组合。

### 为什么这样？

✅ **更清晰**：AI更容易理解小组件
✅ **可复用**：组件可以在多个地方使用
✅ **易修改**：改一个组件不影响其他
✅ **更准确**：每个组件描述更具体

---

## 📐 组件拆分原则

### 原则1：单一职责

一个组件只做一件事：

❌ **不好**：
```markdown
"创建一个用户管理页面，包含：
- 用户列表（表格）
- 搜索框
- 新增按钮
- 编辑弹窗
- 删除确认
- 分页器
- ...
"
```

✅ **好**：
```markdown
"请先创建一个UserTable组件，只负责显示用户列表。

要求：
- 接收users数组作为props
- 渲染成表格
- 每行显示：姓名、邮箱、角色、操作

稍后我会创建其他组件。"
```

### 原则2：自底向上

先做基础组件，再做组合组件：

```
原子组件 → 分子组件 → 组织组件 → 页面
  ↑          ↑          ↑         ↑
Button   Input+Button  Form    LoginPage
```

**示例**：
1. 先做：Button组件
2. 再做：Input组件
3. 组合：SearchInput = Input + Button
4. 组合：LoginForm = Input + Input + Button
5. 组合：LoginPage = LoginForm + Brand

---

## 🎯 实战案例

### 案例：登录页面

#### ❌ 一把梭（不推荐）

```markdown
"创建一个登录页面，左侧是品牌介绍，右侧是表单，
表单有邮箱和密码输入框，有登录按钮，
支持记住我和忘记密码，还有第三方登录..."
```

**问题**：
- 太复杂，AI可能遗漏细节
- 代码可能一团糟
- 后期难以修改

#### ✅ 组件化（推荐）

**Step 1: 创建原子组件**

```markdown
# Component 1: Button

请创建一个Button组件：
- 支持type: primary / default
- 支持size: large / medium / small
- hover效果：背景变深
- 使用Tailwind CSS

请输出代码。
```

```markdown
# Component 2: Input

请创建一个Input组件：
- 支持placeholder
- 支持type: text / password
- focus时边框变蓝
- 使用Tailwind CSS

请输出代码。
```

**Step 2: 组装分子组件**

```markdown
# Component 3: FormField

请使用上面的Input组件，创建一个FormField组件：
- 包含label和input
- 支持错误提示
- label在上方，input在下方

请输出代码。
```

**Step 3: 创建组织组件**

```markdown
# Component 4: LoginForm

请使用FormField和Button组件，创建一个LoginForm：
- 包含：邮箱字段、密码字段、登录按钮
- 布局：垂直排列，间距16px
- 支持onSubmit事件

请输出代码。
```

**Step 4: 组装页面**

```markdown
# Page: LoginPage

请使用LoginForm组件，创建一个登录页面：
- 左侧：品牌介绍（60%宽度）
- 右侧：LoginForm（40%宽度）
- 响应式：手机时只显示LoginForm，居中

请输出完整页面代码。
```

---

## 📦 组件描述模板

### 原子组件模板

```markdown
# Component: [组件名]

## 组件类型
原子组件（Button / Input / Icon ...）

## Props
```typescript
interface [ComponentName]Props {
  // 属性定义
}
```

## 功能
- [功能1]
- [功能2]

## 样式
- 颜色：
- 尺寸：
- 间距：
- 效果：

## 交互
- 默认状态：
- hover状态：
- active状态：
- disabled状态：

## 代码要求
- 使用[技术栈]
- 代码结构清晰
- 有TypeScript类型定义

请输出代码。
```

### 组合组件模板

```markdown
# Component: [组件名]

## 组件类型
组合组件（由XXX和YYY组成）

## 子组件
- [子组件1]：用途
- [子组件2]：用途

## 布局
- 使用[Flex/Grid]布局
- 排列方式：[横向/纵向]
- 间距：[具体值]

## Props
```typescript
interface [ComponentName]Props {
  // 属性定义
}
```

## 功能
- [功能1]
- [功能2]

## 代码要求
- 复用已有的子组件
- 保持子组件独立性
- 添加组合逻辑

请输出代码。
```

---

## 🔧 组件通信技巧

### 父子组件通信

```markdown
# 父组件：UserList

## Props接收
```typescript
interface UserListProps {
  users: User[];        // 接收用户数据
  onSelect: (id: number) => void;  // 回调函数
}
```

## 事件传递
点击子组件时，调用onSelect：

```typescript
const handleClick = (userId: number) => {
  onSelect(userId);
};
```

请生成UserList组件代码。
```

### 兄弟组件通信

```markdown
# 方案：通过父组件中转

## 兄弟组件1: UserCard
- Props: { user: User }
- 点击时emit: onSelect事件

## 兄弟组件2: UserDetail
- Props: { userId: number }

## 父组件: UserPage
- State: selectedUserId
- 处理UserCard的onSelect，更新selectedUserId
- 将selectedUserId传给UserDetail

请生成这三个组件的代码。
```

---

## 🎨 样式组件化

### CSS-in-JS方案

```markdown
# StyledButton组件

请创建一个带样式的Button组件：
- 使用styled-components
- 定义主题色变量
- 支持不同variant：primary / secondary

样式定义：
\`\`\`javascript
const StyledButton = styled.button\`
  // 样式代码
\`;
\`\`\`

请输出代码。
```

### Tailwind组件化

```markdown
# Button variants

请创建一个Button组件，使用clsx或classnames库：

变体样式：
- primary: bg-blue-500 hover:bg-blue-700 text-white
- secondary: bg-gray-200 hover:bg-gray-300 text-gray-800
- danger: bg-red-500 hover:bg-red-700 text-white

尺寸样式：
- small: px-2 py-1 text-sm
- medium: px-4 py-2 text-base
- large: px-6 py-3 text-lg

请输出代码，使用TypeScript。
```

---

## 📋 组件化描述Checklist

### 拆分前思考

- [ ] 这个页面可以拆成几个部分？
- [ ] 哪些部分是独立的组件？
- [ ] 哪些组件可以复用？
- [ ] 组件之间的数据如何传递？
- [ ] 是否需要状态管理？

### 描述组件时确认

- [ ] 组件职责是否单一？
- [ ] Props定义是否清晰？
- [ ] 样式是否独立？
- [ ] 是否有类型定义？
- [ ] 是否有使用示例？

---

## 💡 高级技巧

### 技巧1：先设计组件API

```markdown
# Step 1: 设计组件接口

在写代码前，先定义组件如何使用：

\`\`\`jsx
// 期望的使用方式
<UserTable
  data={users}
  columns={columns}
  loading={isLoading}
  onRowClick={handleRowClick}
  pagination={{
    current: 1,
    total: 100,
    pageSize: 10
  }}
/>
\`\`\`

# Step 2: 基于API生成组件

请根据上面的使用方式，生成UserTable组件。
```

### 技巧2：组件复用策略

```markdown
# 可复用的Card组件

请创建一个高度可复用的Card组件：

Props设计：
- children: 内容
- title?: 标题
- footer?: 底部内容
- hoverable?: 是否可hover
- variant?: 'default' | 'bordered' | 'shadow'

使用场景：
1. 只展示内容：<Card>内容</Card>
2. 带标题：<Card title="标题">内容</Card>
3. 带底部：<Card footer="底部">内容</Card>

请生成支持这些场景的代码。
```

### 技巧3：组件组合模式

```markdown
# List组件的组合模式

不要创建一个超级复杂的List组件，
而是创建可组合的子组件：

\`\`\`jsx
<List>
  <List.Header>标题</List.Header>
  <List.Item>项目1</List.Item>
  <List.Item>项目2</List.Item>
  <List.Footer>底部</List.Footer>
</List>
\`\`\`

请生成：
1. List组件（容器）
2. List.Header组件
3. List.Item组件
4. List.Footer组件

使用React Context或Compound Pattern实现。
```

---

## 🎯 实战练习

### 练习1：拆分一个复杂页面

**任务**：将"商品列表页"拆分成组件

思考：
1. 可以拆成哪些组件？
2. 哪些是原子组件？
3. 哪些是组合组件？
4. 组件如何通信？

---

### 练习2：组件化描述

**任务**：用组件化思维描述"用户头像下拉菜单"

提示：
1. Avatar组件（显示头像）
2. Dropdown组件（下拉菜单）
3. MenuItem组件（菜单项）
4. 组合：AvatarDropdown = Avatar + Dropdown

---

## 📚 参考资源

### 优秀的组件库

- **Ant Design**: https://ant.design/
- **Material-UI**: https://mui.com/
- **Chakra UI**: https://chakra-ui.com/
- **Headless UI**: https://headlessui.com/

学习它们的组件拆分方式

### 组件化最佳实践

- [Atomic Design](https://atomicdesign.bradfrost.com/)
- [Component-Driven Development](https://www.componentdriven.org/)

---

*"组件化是前端工程化的基石，也是让AI理解你需求的关键。"*
