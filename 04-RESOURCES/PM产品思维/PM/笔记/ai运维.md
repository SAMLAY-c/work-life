GitLab CI/CD Pipeline执行 

&nbsp;   ↓ \[Webhook/API触发]

AI运维Agent收到事件

&nbsp;   ↓

【数据捞取】通过GitLab API获取：

&nbsp; - Pipeline完整执行数据（失败状态筛选）

&nbsp; - 构建/测试日志（多Job日志聚合）

&nbsp; - 流水线配置(.gitlab-ci.yml)

&nbsp; - Commit信息、MR上下文

Phase 2: 日志预处理与智能分析（核心决策）

plain

复制

AI运维Agent处理：

&nbsp; 1. 【日志清洗】正则提取所有Error/Failed行（多错误聚合）

&nbsp; 2. 【上下文构建】提取错误行前后的Stack Trace（默认±20行）

&nbsp; 3. 【大模型分析】Prompt工程：

&nbsp;    - 输入：错误日志 + 代码仓库结构 + 历史成功案例(Case库)

&nbsp;    - 任务：根因定位 + 影响面评估 + 修复策略

&nbsp;    

&nbsp; 4. 【验证机制】判断"找到的问题对不对"

&nbsp;    ├─ 置信度≥85% → 进入Phase 3（深度分析）

&nbsp;    └─ 置信度<85% → 触发人工介入或扩大日志采样范围

Phase 3: 深度诊断（用户补充的增强逻辑）

plain

复制

【变量追踪】

AI Agent通过GitLab API访问：

&nbsp; - 本次Pipeline的所有环境变量

&nbsp; - 跨仓库依赖（若服务间调用失败）

&nbsp; - 历史同期对比（排查是否是新引入的问题）



【跨仓库排查】

当错误涉及上游依赖时：

&nbsp; - 检索关联仓库的近期变更

&nbsp; - 检查接口契约变化（OpenAPI/Swagger对比）

&nbsp; - 定位具体Commit引入的Breaking Change

Phase 4: 自动化响应（Alt分支）

plain

复制

AI Agent决策分支：

├─ 【自动修复尝试】3a. 触发自动化Retry（限2次）

│     适用场景：网络超时、临时资源不足

│     规则：通过GitLab Pipeline API重新触发特定Job

│

└─ 【人工流转】3b. 查询Git Blame定位责任人

&nbsp;     使用：GitLab Repository API获取Commit作者

&nbsp;     规则：匹配CODEOWNERS文件，精确到模块负责人

Phase 5: 工单创建与通知（飞书集成）

plain

复制

AI Agent → 飞书项目：

&nbsp; - 创建Bug工单（分类：环境抖动/代码逻辑错误）

&nbsp; - 字段填充：

&nbsp;   \* 根因总结（AI生成）

&nbsp;   \* 修复建议（含代码片段）

&nbsp;   \* 关联Pipeline链接

&nbsp;   \* @责任人（Git Blame结果）

