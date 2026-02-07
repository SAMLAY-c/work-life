---
# 过滤条件：只显示带有 bilibili 标签的笔记
filters:
  and:
    - file.hasTag("bilibili")

# 定义公式属性
formulas:
  # 状态图标显示
  status_icon: 'if(status == "🔴 待看", "🔴", if(status == "🟡 进行中", "🟡", if(status == "🟢 已完成", "🟢", if(status == "📝 已归档", "📝", ""))))'

  # 评分星级显示
  rating_stars: 'if(rating, "⭐".repeat(rating), "未评分")'

  # 创建时间相对显示
  created_relative: 'if(created, date(created).relative(), "")'

  # 视频链接可点击版本
  video_link: 'if(url, link(url, "观看视频"), "")'

  # 分类图标
  category_icon: 'if(category == "AI技术", "🤖", if(category == "编程", "💻", if(category == "效率工具", "⚡", if(category == "思维模型", "🧠", "📁"))))'

  # UP主链接
  uploader_display: 'if(up_owner, up_owner, "未知UP主")'

# 属性显示名称配置
properties:
  status:
    displayName: 状态
  category:
    displayName: 分类
  up_owner:
    displayName: UP主
  url:
    displayName: 视频链接
  rating:
    displayName: 评分
  linked_note:
    displayName: 笔记文件
  formula.status_icon:
    displayName: ""
  formula.rating_stars:
    displayName: 星级
  formula.created_relative:
    displayName: 创建时间
  formula.video_link:
    displayName: 链接
  formula.category_icon:
    displayName: 分类
  formula.uploader_display:
    displayName: UP主
  file.name:
    displayName: 标题
  created:
    displayName: 创建日期

# 定义多个视图
views:
  # 视图1：所有视频（表格视图）
  - type: table
    name: "所有视频"
    order:
      - formula.status_icon
      - file.name
      - formula.uploader_display
      - category
      - formula.rating_stars
      - formula.created_relative
      - formula.video_link
      - linked_note
    groupBy:
      property: status
      direction: ASC

  # 视图2：待看视频
  - type: table
    name: "🔴 待看清单"
    filters:
      and:
        - 'status == "🔴 待看"'
    order:
      - file.name
      - formula.uploader_display
      - category
      - formula.video_link
    groupBy:
      property: category
      direction: ASC

  # 视图3：进行中
  - type: table
    name: "🟡 学习中"
    filters:
      and:
        - 'status == "🟡 进行中"'
    order:
      - file.name
      - formula.uploader_display
      - formula.video_link
      - linked_note

  # 视图4：已完成
  - type: table
    name: "🟢 已完成"
    filters:
      and:
        - 'status == "🟢 已完成"'
    order:
      - file.name
      - formula.rating_stars
      - formula.uploader_display
      - category
      - linked_note
    groupBy:
      property: category
      direction: ASC
    summaries:
      rating: Average

  # 视图5：卡片画廊
  - type: cards
    name: "视频卡片"
    order:
      - file.name
      - formula.status_icon
      - formula.uploader_display
      - category
      - formula.rating_stars
      - formula.video_link
    filters:
      not:
        - 'status == "📝 已归档"'

  # 视图6：按分类浏览
  - type: table
    name: "按分类浏览"
    order:
      - formula.category_icon
      - category
      - file.name
      - formula.status_icon
      - formula.rating_stars
    groupBy:
      property: category
      direction: ASC

  # 视图7：高评分视频
  - type: table
    name: "⭐ 高评分推荐"
    filters:
      and:
        - 'rating >= 4'
        - 'status == "🟢 已完成"'
    order:
      - formula.rating_stars
      - file.name
      - formula.uploader_display
      - category
      - linked_note

  # 视图8：简单列表
  - type: list
    name: "快速列表"
    order:
      - formula.status_icon
      - file.name
      - formula.uploader_display
    filters:
      not:
        - 'status == "📝 已归档"'
---

# B站视频追踪数据库

使用此数据库管理你的B站视频学习进度。

## 快速开始

1. **创建视频笔记**：在 `Inbox/` 文件夹下创建新笔记，确保包含 `tags: [bilibili]`
2. **设置属性**：在笔记 frontmatter 中添加以下属性：
   ```yaml
   ---
   tags: [bilibili]
   status: 🟢 已完成
   up_owner: UP主名称
   category: AI技术
   url: https://www.bilibili.com/...
   rating: 5
   linked_note: "[[相关笔记文件]]"
   created: 2025-01-16
   ---
   ```

3. **查看视图**：使用上方的不同视图标签页浏览你的视频库

## 视图说明

- **所有视频**：完整列表，按状态分组
- **🔴 待看清单**：还未开始观看的视频
- **🟡 学习中**：正在观看的视频
- **🟢 已完成**：已看完的视频，显示平均评分
- **视频卡片**：卡片式浏览
- **按分类浏览**：按知识点分类查看
- **⭐ 高评分推荐**：4分及以上的优质视频
- **快速列表**：简洁列表视图

## 属性说明

| 属性 | 类型 | 说明 |
|------|------|------|
| `status` | 选择 | 🔴 待看 / 🟡 进行中 / 🟢 已完成 / 📝 已归档 |
| `category` | 选择 | AI技术 / 编程 / 效率工具 / 思维模型 / 其他 |
| `up_owner` | 文本 | UP主名称 |
| `url` | URL | B站视频链接 |
| `rating` | 数字 | 1-5分评分 |
| `linked_note` | 文件 | 关联的详细笔记 |
| `created` | 日期 | 创建日期 |

## 使用技巧

1. **快速过滤**：点击列标题可以进行排序和过滤
2. **分组视图**：按状态或分类分组，便于管理
3. **卡片视图**：适合快速浏览和选择
4. **嵌入其他笔记**：使用 `![[Video_Tracker.base]]` 可将数据库嵌入到其他笔记中

---

## 示例笔记格式

\```markdown
---
tags: [bilibili, video-note]
status: 🟢 已完成
url: "https://www.bilibili.com/video/BV1xx411c7mD"
up_owner: "某某UP主"
category: AI技术
rating: 5
created: 2025-01-16
---

# 视频标题：学习Claude Code

## 💡 核心观点
- 要点1
- 要点2

## 📝 详细笔记
...笔记内容...
\```
