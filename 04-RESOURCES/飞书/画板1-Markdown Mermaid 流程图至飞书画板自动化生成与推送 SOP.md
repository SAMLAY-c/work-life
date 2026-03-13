
# 📑 标准作业程序 (SOP)：Markdown 流程图转飞书画板自动推送

## 一、 目标与适用范围
**目标**：将包含 Mermaid 流程图语法的 Markdown 文件，解析并转换为符合飞书画板规范的 JSON 数据，并通过带有层级优化的布局算法，最终通过飞书 OpenAPI 自动推送到指定的 Wiki 画板中。
**适用场景**：AI 运维报告生成、自动化文档转换为可视化画板、系统流程图一键上屏。

---

## 二、 前置环境与权限准备规则

### 1. 环境依赖规则
*   **运行环境**：推荐使用 `uv` 运行 Python 脚本，以隔离环境并确保依赖一致性（需配置 `UV_CACHE_DIR` 避免沙箱权限问题）。
*   **核心依赖库**：`requests` (用于接口请求), `re` (正则解析), `json`, `collections` (布局算法)。

### 2. 飞书应用权限规则（必检项）
在飞书开放平台必须为应用（`tenant_access_token`）申请并**发布**以下权限，否则会触发 `99991672` 等错误：
*   `wiki:wiki` / `wiki:wiki:readonly` (读取知识库节点)
*   `docx:document` / `docx:document:readonly` (读取文档所有块)
*   `board:whiteboard:node:create` / `board:whiteboard:node:read` (创建和读取画板节点)

---

## 三、 核心执行流程与规则详情

### 阶段一：Markdown 内容解析与清洗 (Parser Rules)
由于 AI 生成的 Markdown 常带有各种转义符，必须进行严格的预处理。

*   **规则 1：转义字符清洗**
    *   必须去除 BOM 头 (`\ufeff`) 和统一换行符 (`\r\n` 转 `\n`)。
    *   必须去除 Markdown 的转义斜杠（如 `\##`, `\_`, `\[\]` 等）。
    *   去除 Mermaid 节点文本中多余的括号包裹（如 `([ ])`, `{{ }}`, `(( ))`）。
*   **规则 2：节点类型智能推断 (Node Type Guessing)**
    *   根据 Mermaid 语法符号推断：包含 `{ }` 的定义为 `decision`（判断节点）。
    *   包含 `( )` 或文本以“开始/结束”字样开头的定义为 `start_end`（起止节点）。
    *   其他默认归类为 `process`（普通步骤节点）。
*   **规则 3：文本防覆盖保护**
    *   **避坑指南**：在解析 `A[文本] --> B[文本]` 之后，若再次遇到 `A --> B`，禁止用节点 ID (`A`, `B`) 去覆盖已经解析出的真实中文文本。

### 阶段二：DAG 分层布局算法规则 (Layout Rules)
为了解决初次生成“效果不太好、连线交叉”的问题，必须采用有向无环图（DAG）的分层布局，而非简单的顺序平铺。

*   **规则 1：层级计算 (Leveling)**
    *   统计所有节点的入度 (in-degree)。
    *   使用 BFS (广度优先搜索) 按层级对节点进行划分，入度为 0 的节点位于第 0 层。
*   **规则 2：网格间距设定 (Grid Spacing)**
    *   **X 轴间距 (x_gap)**：层与层之间横向跨度固定为 `290.0` px。
    *   **Y 轴间距 (y_gap)**：同层节点之间纵向跨度固定为 `190.0` px。
*   **规则 3：同层节点排序与居中对齐**
    *   根据父节点的位置，计算当前节点的重心 (Barycenter)，以减少连线交叉。
    *   同层节点沿 Y 轴居中对称排布：`y0 = start_y - ((count - 1) * y_gap) / 2.0`。
*   **规则 4：智能锚点选择 (Smart Ports)**
    *   必须根据源节点和目标节点的相对中心位置坐标（dx, dy），动态决定连线的起始点和终止点（`left`, `right`, `top`, `bottom`），绝对禁止全部固定连接右侧和左侧。

### 阶段三：飞书画板节点样式标准化 (Styling Rules)
**（极其重要：这是从优质参考 JSON 中提取的严格规范）**

*   **规则 1：普通步骤节点 (`process`)**
    *   `shape_type`: `"round_rect"`
    *   尺寸 (`width` x `height`): `120 x 80`
    *   颜色：边框 `#4e83fd`，填充 `#e1eaff`
*   **规则 2：判断节点 (`decision`)**
    *   `shape_type`: `"diamond"`
    *   尺寸 (`width` x `height`): `146 x 92`
    *   颜色：边框 `#ffa53d`，填充 `#feead2`
*   **规则 3：起止节点 (`start_end`)**
    *   `shape_type`: `"round_rect2"`
    *   尺寸 (`width` x `height`): `120 x 80`
    *   颜色：同普通节点。
*   **规则 4：连线样式 (`connector`)**
    *   连线形状：`polyline`（折线），末端箭头 `line_arrow`。
    *   线条颜色：`#bbbfc4`。
    *   文本标签：字号 `14`，颜色 `#1f2329`，定位在连线中点 (`caption_position: 0.52`)。
*   **规则 5：标题节点 (`text_shape`)**
    *   每个流程图上方需插入一个标题节点，字号 `14`，加粗 (`bold`)，左对齐。

### 阶段四：飞书 API 交互与推送规则 (API Integration Rules)

*   **规则 1：画板 ID 动态解析路径 (ID Resolution)**
    *   **绝不能**把 Wiki 链接后面的 Token 直接当做 Whiteboard ID。
    *   **正确转换链路**：
        1. 调用 `/wiki/v2/spaces/get_node?token={wiki_token}` 获取 `obj_token` (即 `document_id`) 和 `obj_type`。
        2. 调用 `/docx/v1/documents/{document_id}/blocks` 获取文档块列表。
        3. 遍历 Blocks，找到 `block_type == 43` (画板类型的块)。
        4. 提取该块的 `board.token`，这才是真正的 **Whiteboard ID**。
*   **规则 2：推送请求规范**
    *   接口：`POST /board/v1/whiteboards/{whiteboard_id}/nodes`
    *   请求头必须包含：`Content-Type: application/json; charset=utf-8`（避免中文乱码）。
    *   单次推送节点数量不能超过 3000 个（如超出需分批）。

---

## 四、 异常处理与排查指南 (Troubleshooting)

| 异常表现 / 错误码 | 可能原因 | 解决规则 / 动作 |
| :--- | :--- | :--- |
| **99991672 Access denied** | 缺少文档/Wiki的读取权限。 | 前往飞书开放平台，添加 `docx:document` 和 `wiki:wiki` 权限，**并重新发布版本**。 |
| **JSONDecodeError (BOM)** | 源文件带有 UTF-8 BOM 签名。 | Python 读取文件时，强制使用 `encoding='utf-8-sig'`。 |
| **节点文本显示为字母(如 A, B)** | 覆盖逻辑错误，将引用 ID 覆盖了中文名称。| 修改解析器逻辑：`if text and text != mermaid_id` 时才允许更新节点 text。 |
| **UV 报错拒绝访问(os error 5)** | 沙箱环境无法写入缓存目录。 | 1. 尝试修改环境变量 `$env:UV_CACHE_DIR='当前项目路径/.uv-cache'`；<br>2. 若仍失败，使用提权命令 (`require_escalated`) 运行。 |
| **连线乱穿、节点重叠** | 未启用智能排版或节点间距过小。 | 严格执行**阶段二**的 DAG 布局算法和动态锚点计算。 |

---

## 五、 AI Agent 协作约束（给写 Prompt/指令的建议）

当指派 AI (如 Codex) 执行此任务时，应遵循以下规则制定 Prompt：
1. **明确工作流**：“读取 MD -> 分析参考 JSON 提取样式 -> 改写布局脚本 -> 动态解析 Wiki 获取画板 ID -> 执行 UTF-8 推送”。
2. **禁止直接覆写**：在修改已有脚本（如 `md_to_whiteboard_json.py`）时，若 `apply_patch` 失败，允许 Agent 采用 `Set-Content` 等全量覆写方式。
3. **中间验证**：要求 Agent 在推送飞书前，先本地输出统计数据（如：`total=197, diamond:18, round_rect:54`），与预期一致后再执行最终的 `POST` 请求。