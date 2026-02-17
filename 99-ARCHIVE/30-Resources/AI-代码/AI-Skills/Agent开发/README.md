# 🤖 AI Agent 开发

> **构建能够自主感知、决策和执行的智能系统**

---

## 📚 什么是 AI Agent？

**AI Agent** 是一个能够：
- 🔍 **感知 (Perceive)** - 理解环境和用户需求
- 🧠 **推理 (Reason)** - 规划和决策行动方案
- ⚡ **执行 (Act)** - 调用工具完成任务
- 🔄 **学习 (Learn)** - 从反馈中改进

### Agent vs 传统 AI

| 维度 | 传统 AI | AI Agent |
|------|---------|----------|
| **交互方式** | 单次问答 | 持续对话 |
| **任务执行** | 需要人工干预 | 自主执行 |
| **工具使用** | 无工具 | 可调用工具 |
| **目标导向** | 响应式 | 主动式 |

---

## 🎯 Agent 架构

### 基础架构

```
用户输入
    ↓
┌─────────────────────────────────┐
│  Agent Core                     │
├─────────────────────────────────┤
│  1. 感知模块 (Perception)       │
│     - 理解用户意图              │
│     - 分析任务需求              │
│     ↓                           │
│  2. 规划模块 (Planning)         │
│     - 分解任务                  │
│     - 制定计划                  │
│     ↓                           │
│  3. 决策模块 (Decision)         │
│     - 选择行动                  │
│     - 工具调用                  │
│     ↓                           │
│  4. 记忆模块 (Memory)           │
│     - 短期/长期记忆             │
│     - 经验积累                  │
└─────────────────────────────────┘
    ↓
执行工具 (Tool Execution)
    ↓
观察结果 (Observation)
    ↓
反馈学习 (Feedback)
```

### 高级架构

```
┌───────────────────────────────────────┐
│  Multi-Agent System (多 Agent 协作)  │
├───────────────────────────────────────┤
│  Orchestrator Agent (编排者)          │
│  ├─ Researcher Agent (研究者)        │
│  ├─ Coder Agent (程序员)             │
│  ├─ Tester Agent (测试员)            │
│  └─ Reviewer Agent (审查员)          │
└───────────────────────────────────────┘
```

---

## 🛠️ 核心组件

### 1. 感知模块 (Perception)

```python
class PerceptionModule:
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.task_analyzer = TaskAnalyzer()

    def perceive(self, user_input):
        # 理解用户意图
        intent = self.intent_classifier.classify(user_input)

        # 分析任务需求
        requirements = self.task_analyzer.analyze(user_input)

        return {
            "intent": intent,
            "requirements": requirements,
            "context": extract_context(user_input)
        }
```

### 2. 规划模块 (Planning)

```python
class PlanningModule:
    def __init__(self):
        self.task_decomposer = TaskDecomposer()
        self.planner = Planner()

    def plan(self, perception):
        # 分解复杂任务
        subtasks = self.task_decomposer.decompose(
            perception["requirements"]
        )

        # 制定执行计划
        plan = self.planner.create_plan(subtasks)

        return {
            "steps": plan["steps"],
            "dependencies": plan["dependencies"],
            "estimated_time": plan["time"]
        }
```

### 3. 决策模块 (Decision)

```python
class DecisionModule:
    def __init__(self):
        self.tools = ToolRegistry()
        self.selector = ToolSelector()

    def decide(self, plan_step):
        # 选择合适的工具
        tool = self.selector.select_tool(
            task=plan_step["task"],
            available_tools=self.tools.list()
        )

        # 准备工具参数
        params = self.prepare_params(
            tool=tool,
            context=plan_step["context"]
        )

        return {
            "tool": tool,
            "params": params
        }
```

### 4. 记忆模块 (Memory)

```python
class MemoryModule:
    def __init__(self):
        self.short_term = ShortTermMemory()
        self.long_term = LongTermMemory()
        self.episodic = EpisodicMemory()

    def remember(self, experience):
        # 存储经验
        self.episodic.add(experience)

        # 提取关键信息
        key_info = extract_key_info(experience)
        self.long_term.add(key_info)

    def recall(self, query):
        # 检索相关经验
        return {
            "recent": self.short_term.get_recent(),
            "relevant": self.long_term.search(query),
            "similar": self.episodic.find_similar(query)
        }
```

---

## 🔧 工具调用 (Tool Calling)

### 工具定义

```python
from typing import Callable

class Tool:
    def __init__(
        self,
        name: str,
        description: str,
        function: Callable,
        parameters: dict
    ):
        self.name = name
        self.description = description
        self.function = function
        self.parameters = parameters

    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters
        }

# 定义工具
search_tool = Tool(
    name="web_search",
    description="Search the web for information",
    function=web_search_function,
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query"
            },
            "num_results": {
                "type": "integer",
                "description": "Number of results to return"
            }
        },
        "required": ["query"]
    }
)
```

### 工具执行

```python
class ToolExecutor:
    def __init__(self):
        self.tools = {}
        self.register_default_tools()

    def register_tool(self, tool: Tool):
        self.tools[tool.name] = tool

    def execute(self, tool_name: str, params: dict):
        if tool_name not in self.tools:
            raise ValueError(f"Tool {tool_name} not found")

        tool = self.tools[tool_name]

        try:
            result = tool.function(**params)
            return {
                "success": True,
                "result": result
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

---

## 🧠 推理与规划

### 思维链 (Chain of Thought)

```python
def chain_of_thought(task):
    thoughts = []

    # 分步思考
    thoughts.append("分析任务：" + analyze(task))
    thoughts.append("确定目标：" + determine_goal(task))
    thoughts.append("分解子任务：" + decompose(task))
    thoughts.append("选择工具：" + select_tools(task))
    thoughts.append("执行步骤：" + plan_execution(task))

    return {
        "reasoning": thoughts,
        "final_answer": generate_answer(thoughts)
    }
```

### 任务分解

```python
def decompose_task(complex_task):
    # 使用 LLM 分解任务
    prompt = f"""
    将以下任务分解为具体的子任务：
    任务：{complex_task}

    请返回：
    1. 子任务列表
    2. 依赖关系
    3. 每个子任务的工具需求
    """

    decomposition = llm.complete(prompt)

    return parse_decomposition(decomposition)
```

### ReAct 模式 (Reasoning + Acting)

```python
class ReActAgent:
    def __init__(self):
        self.llm = LLM()
        self.tools = ToolRegistry()

    def run(self, task):
        thoughts = []
        actions = []

        while not task.completed:
            # Thought: 思考下一步行动
            thought = self.think(task, thoughts, actions)
            thoughts.append(thought)

            # Action: 执行行动
            action = self.act(thought)
            result = self.tools.execute(action)
            actions.append({
                "action": action,
                "result": result
            })

            # Observe: 观察结果
            observation = self.observe(result)
            task.update(observation)

        return self.final_answer(thoughts, actions)

    def think(self, task, history):
        prompt = f"""
        任务：{task.description}
        历史思考：{history}

        请思考下一步应该做什么？
        """
        return self.llm.complete(prompt)
```

---

## 👥 多 Agent 协作

### Agent 角色

```python
class AgentRole(Enum):
    ORCHESTRATOR = "编排者"      # 协调其他 Agents
    RESEARCHER = "研究者"         # 收集信息
    CODER = "程序员"             # 编写代码
    TESTER = "测试员"            # 测试验证
    REVIEWER = "审查员"          # 代码审查
    SUMMARIZER = "总结者"        # 总结输出
```

### 协作模式

```python
class MultiAgentSystem:
    def __init__(self):
        self.agents = {
            "orchestrator": OrchestratorAgent(),
            "researcher": ResearcherAgent(),
            "coder": CoderAgent(),
            "tester": TesterAgent(),
            "reviewer": ReviewerAgent()
        }
        self.orchestrator = self.agents["orchestrator"]

    def execute_task(self, task):
        # 1. 编排者规划任务
        plan = self.orchestrator.plan(task)

        # 2. 分配任务给不同 Agents
        results = {}
        for step in plan["steps"]:
            agent = self.agents[step["agent"]]
            result = agent.execute(step["task"])
            results[step["name"]] = result

        # 3. 整合结果
        final_output = self.orchestrator.integrate(results)

        return final_output
```

### 通信协议

```python
class AgentMessage:
    def __init__(
        self,
        sender: str,
        receiver: str,
        content: dict,
        message_type: str
    ):
        self.sender = sender
        self.receiver = receiver
        self.content = content
        self.type = message_type
        self.timestamp = datetime.now()

class MessageBus:
    def __init__(self):
        self.queue = []

    def send(self, message: AgentMessage):
        self.queue.append(message)

    def receive(self, agent: str) -> list:
        return [
            msg for msg in self.queue
            if msg.receiver == agent
        ]
```

---

## 🛠️ Agent 框架

### LangChain Agents

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import Tool
from langchain.prompts import ChatPromptTemplate

# 定义工具
tools = [
    Tool(
        name="Search",
        func=search_func,
        description="Search for information"
    ),
    Tool(
        name="Calculator",
        func=calc_func,
        description="Perform calculations"
    )
]

# 创建 Agent
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True
)

# 执行
result = agent_executor.invoke({
    "input": "What's the population of Tokyo?"
})
```

### CrewAI

```python
from crewai import Agent, Task, Crew

# 定义 Agents
researcher = Agent(
    role='Researcher',
    goal='Research cutting edge AI developments',
    backstory='An experienced researcher',
    tools=[search_tool]
)

writer = Agent(
    role='Writer',
    goal='Write engaging blog posts',
    backstory='A skilled writer',
    tools=[]
)

# 定义任务
research_task = Task(
    description='Research latest AI trends',
    expected_output='Summary of findings',
    agent=researcher
)

write_task = Task(
    description='Write a blog post about AI trends',
    expected_output='Final blog post',
    agent=writer
)

# 创建 Crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    verbose=True
)

# 执行
result = crew.kickoff()
```

### AutoGen

```python
import autogen

# 定义 Agents
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={
        "config_list": [{"model": "gpt-4"}]
    }
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    code_execution_config={
        "work_dir": "coding"
    },
    human_input_mode="NEVER"
)

# 开始对话
user_proxy.initiate_chat(
    assistant,
    message="How can I use AutoGen?"
)
```

---

## 📊 Agent 设计模式

### 1. ReAct 模式
```
Thought → Action → Observation → Thought → ...
```

### 2. Plan-and-Execute 模式
```
Planning（规划）→ Execution（执行）→ Replanning（重新规划）
```

### 3. Reflection 模式
```
Action → Reflect（反思）→ Improve（改进）→ Action
```

### 4. Multi-Agent 协作模式
```
Orchestrator（编排）→ Specialized Agents（专业 Agent）→ Integration（整合）
```

---

## 🎯 实战项目

### 项目一：研究助手 Agent
**功能**：
- 搜索相关文献
- 提取关键信息
- 生成研究报告

**技术栈**：LangChain + Tavily + Claude

### 项目二：代码生成 Agent
**功能**：
- 理解需求
- 生成代码
- 测试验证
- 代码审查

**技术栈**：CrewAI + GitHub + Testing Tools

### 项目三：客户服务 Agent
**功能**：
- 理解客户问题
- 查询知识库
- 执行操作（退款、查询订单等）
- 生成回复

**技术栈**：AutoGen + Database + APIs

### 项目四：数据分析 Agent
**功能**：
- 理解分析需求
- 查询数据库
- 执行分析
- 生成可视化
- 撰写报告

**技术栈**：LangChain + SQL + Matplotlib

---

## 📖 学习资源

### 官方文档
- [LangChain Agents](https://python.langchain.com/docs/modules/agents/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [AutoGen Documentation](https://microsoft.github.io/autogen/)

### 教程
- [Building AI Agents with LangChain](https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llama-3/)
- [Introduction to AutoGen](https://github.com/microsoft/autogen#main-concepts)

### 论文
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366)

---

## 📊 学习进度

- [ ] Agent 基础概念
- [ ] 工具调用实现
- [ ] 推理与规划
- [ ] 记忆系统设计
- [ ] 多 Agent 协作
- [ ] Agent 框架应用
- [ ] 实战项目开发

---

## 🔗 相关资源

- **[Prompt 工程](../Prompt-工程/)** - 设计 Agent 的思维过程
- **[Context 管理](../Context-管理/)** - 管理 Agent 的记忆
- **[联网搜索](../联网搜索/)** - Agent 的信息获取

---

## 💡 最佳实践

### 1. 设计原则
- ✅ **单一职责** - 每个 Agent 专注一个领域
- ✅ **清晰接口** - 定义明确的通信协议
- ✅ **容错处理** - 优雅的错误恢复
- ✅ **可观测性** - 记录决策过程

### 2. 性能优化
- 使用缓存减少重复计算
- 并行执行独立任务
- 限制思考深度避免循环

### 3. 安全考虑
- 工具权限控制
- 输入验证
- 输出过滤
- 行为审计

---

**🚀 开始构建你的 AI Agent！**

*最后更新：2026-02-12*
