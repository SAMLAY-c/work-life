# Obsidian 插件配置建议

## 🛠️ 核心插件清单

### 1. Templater (必需)
**功能**: 模板系统核心
**配置**:
```json
{
  "template_folder": "template",
  "trigger_on_file_creation": true,
  "auto_jump_to_cursor": true,
  "enable_system_commands": false,
  "shell_path": "",
  "user_scripts_folder": "",
  "enable_terrified_syntax_highlighting": true
}
```

### 2. Dataview (强烈推荐)
**功能**: 动态查询和展示数据
**使用场景**:
```dataview
TABLE
  type as "类型",
  status as "状态",
  file.mtime as "最后修改"
FROM ""
WHERE status = "Evergreen"
SORT file.mtime DESC
```

### 3. Tag Wrangler (推荐)
**功能**: 标签管理
**用途**: 批量管理笔记的 tags 字段

### 4. Linter (推荐)
**功能**: 自动格式化
**配置规则**:
- 移除行尾空格
- 标题层级检查
- YAML 格式验证

### 5. Quick Switcher++ (推荐)
**功能**: 增强的文件切换
**快捷键**: `Ctrl+O`

## ⚙️ 系统配置文件

### .obsidian/templates.json
```json
{
  "template_folder": "template",
  "templates": [
    {
      "name": "智能知识工程模板",
      "path": "template/智能知识工程模板.md"
    }
  ]
}
```

### .obsidian/commands.json (自定义命令)
```json
{
  "commands": [
    {
      "id": "insert-template",
      "name": "插入知识工程模板",
      "editorCallback": (editor, view) => {
        // 插入模板逻辑
      }
    }
  ]
}
```

## 🔧 高级配置

### 1. 工作区布局建议
```
左侧面板:
  - 文件浏览器
  - 搜索面板
  - 标签面板

右侧面板:
  - 反向链接
  - 大纲
  - 图谱视图
```

### 2. 快捷键设置
| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 新建笔记 | `Ctrl+N` | 使用默认模板 |
| 插入模板 | `Ctrl+Shift+T` | 手动插入模板 |
| 切换编辑/预览 | `Ctrl+E` | |
| 全局搜索 | `Ctrl+Shift+F` | |
| 图谱视图 | `Ctrl+G` | 查看知识图谱 |

### 3. CSS 自定义 (snippet)

在 `.obsidian/snippets/` 目录下创建 `knowledge-engineering.css`:

```css
/* YAML Frontmatter 样式 */
.frontmatter {
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 20px;
}

/* 状态指示器 */
.frontmatter[data-status="Seedling"]::before {
  content: "🌱 ";
}

.frontmatter[data-status="Budding"]::before {
  content: "🌿 ";
}

.frontmatter[data-status="Evergreen"]::before {
  content: "🌲 ";
}

/* 链接关系样式 */
.internal-link[data-relation="refutes"] {
  color: var(--color-red);
  border-bottom: 2px wavy var(--color-red);
}

.internal-link[data-relation="supports"] {
  color: var(--color-green);
  border-bottom: 2px solid var(--color-green);
}

.internal-link[data-relation="extends"] {
  color: var(--color-blue);
  border-bottom: 2px dashed var(--color-blue);
}

/* 光标位置指示 */
.cm-cursor-placeholder {
  background-color: var(--text-highlight-bg);
  border-radius: 3px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

## 📊 Dataview 查询模板

### 1. 质量控制看板
```dataview
TABLE
  rows.file.link as "文件",
  rows.type as "类型",
  rows.status as "状态"
FROM "01-方法论" OR "02-业务框架" OR "03-产品需求"
FLATTEN file.lists as L
WHERE L.status AND !contains(L.status, "completed")
GROUP BY file.folder
```

### 2. 知识图谱统计
```dataview
LIST
FROM ""
GROUP BY type
```

### 3. 待完成笔记
```dataview
TABLE
  status as "状态",
  file.mtime as "最后修改"
FROM ""
WHERE status = "Seedling" OR status = "Budding"
SORT file.mtime ASC
```

## 🚀 性能优化

### 1. 文件数量管理
- 建议总文件数 < 10,000
- 单个文件大小 < 1MB
- 避免嵌套过深的目录结构

### 2. 链接优化
- 定期清理无效链接
- 使用别名而非重复文件
- 避免循环引用

### 3. 搜索优化
```javascript
// .obsidian/search.json 配置
{
  "indexLimit": 1000,
  "excerptLength": 400,
  "showExcerpt": true,
  "highlight": true
}
```

## 🔄 数据迁移脚本

### Python 脚本：批量添加 YAML Frontmatter
```python
import os
import re
import uuid
from datetime import datetime

def add_frontmatter(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已有 frontmatter
    if content.startswith('---'):
        return False

    # 生成 frontmatter
    uid = f"{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
    frontmatter = f"""---
uuid: {uid}
type: Concept
tags: []
status: Seedling
aliases: []
created: {datetime.now().isoformat()}
updated: {datetime.now().isoformat()}
related: []
source: ""
---

"""

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(frontmatter + content)

    return True

# 批量处理
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.md'):
            add_frontmatter(os.path.join(root, file))
```

## 📱 移动端配置

### Obsidian Mobile 同步设置
1. 启用 iCloud 同步或第三方同步服务
2. 确保模板文件夹同步完整
3. 配置移动端快捷键
4. 启用移动端专用插件

### 移动端优化
- 简化模板复杂度
- 减少依赖插件数量
- 使用语音输入优化笔记创建

## 🔒 备份策略

### 1. 自动备份
```bash
# 使用 rsync 定期备份
rsync -av --delete /path/to/vault /path/to/backup/
```

### 2. 版本控制
```bash
# Git 配置
git init
git add .
git commit -m "Initial commit"

# 忽略 .obsidian 目录
echo ".obsidian/workspace" >> .gitignore
```

### 3. 导出格式
- Markdown: 原始格式
- PDF: 分享格式
- JSON: 数据分析格式

---

## 🎯 实施路线图

### 第一周：基础配置
1. 安装必需插件
2. 配置模板系统
3. 学习基本操作

### 第二周：数据迁移
1. 选择试点文件
2. 应用新模板
3. 建立链接关系

### 第三周：流程优化
1. 设置 Dataview 查询
2. 配置快捷键
3. 优化工作流

### 第四周：质量提升
1. 全面数据审核
2. 建立维护流程
3. 性能优化

记住：**工具为人服务**，不要为了完美的工具配置而影响实际的知识管理效率。从简单开始，逐步完善。