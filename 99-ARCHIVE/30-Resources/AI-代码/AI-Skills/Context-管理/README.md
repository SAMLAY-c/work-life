# 🧠 Context 管理

> **高效管理 AI 模型的上下文，提升性能和质量**

---

## 📚 什么是 Context 管理？

**Context Management** 是管理 AI 模型输入上下文的技术，包括内容选择、压缩、优化等，旨在在有限的 Token 预算内提供最相关的信息。

### 为什么需要 Context 管理？

| 挑战 | 解决方案 |
|------|---------|
| **Token 限制** - 模型输入长度有限 | 选择最相关的内容 |
| **信息过载** - 太多信息干扰模型 | 过滤和优先级排序 |
| **性能成本** - 更多 Token = 更贵 | 压缩和优化 |
| **质量下降** - 无关信息降低质量 | 精准的内容选择 |

---

## 🎯 核心概念

### 1. Token 预算管理

```
总 Token 预算 = 模型最大上下文长度 - 输出预留 - 系统预留

示例（Claude 3.5 Sonnet）：
- 最大上下文：200K tokens
- 系统提示：1K tokens
- 输出预留：4K tokens
- 可用输入：195K tokens
```

### 2. Context 类别

| 类型 | 说明 | 优先级 |
|------|------|--------|
| **系统提示** - AI 的角色和行为指令 | ⭐⭐⭐ |
| **用户消息** - 当前对话内容 | ⭐⭐⭐ |
| **检索内容** - RAG 检索的文档 | ⭐⭐ |
| **历史对话** - 之前的对话轮次 | ⭐⭐ |
| **示例案例** - Few-shot 示例 | ⭐ |

### 3. Context 窗口策略

```
最近对话（保留）
    ↓
关键文档（保留）
    ↓
历史摘要（压缩）
    ↓
早期对话（丢弃）
```

---

## 🛠️ Context 管理技术

### 1. 内容选择 (Content Selection)

#### 相关性评分
```python
def relevance_score(query, document):
    # 使用嵌入模型计算相似度
    query_embedding = embed(query)
    doc_embedding = embed(document)
    return cosine_similarity(query_embedding, doc_embedding)

# 选择最相关的文档
docs = [
    {"content": "...", "score": relevance_score(query, doc)},
    ...
]
top_docs = sorted(docs, key=lambda x: x["score"], reverse=True)[:10]
```

#### 多样性选择
```python
# 避免选择过于相似的内容
def diverse_selection(docs, k=5):
    selected = []
    for doc in sorted_by_relevance(docs):
        if not is_similar_to_selected(doc, selected):
            selected.append(doc)
            if len(selected) >= k:
                break
    return selected
```

### 2. 内容压缩 (Content Compression)

#### 摘要压缩
```
原始文档（2000 tokens）
    ↓
提取关键信息
    ↓
生成摘要（300 tokens）
```

#### 关键词提取
```python
from sklearn.feature_extraction.text import TfidfVectorizer

def extract_keywords(text, n=10):
    # 提取最重要的关键词
    vectorizer = TfidfVectorizer(max_features=n)
    vectorizer.fit([text])
    return vectorizer.get_feature_names_out()
```

#### 删除冗余
```python
def remove_redundancy(docs):
    # 使用相似度检测去除重复内容
    unique_docs = []
    for doc in docs:
        if not is_duplicate(doc, unique_docs):
            unique_docs.append(doc)
    return unique_docs
```

### 3. 分层存储 (Hierarchical Storage)

```
第1层：最近对话（完整内容）
    ↓
第2层：关键信息（提取要点）
    ↓
第3层：历史摘要（高度压缩）
    ↓
第4层：长期记忆（数据库）
```

### 4. 滑动窗口 (Sliding Window)

```python
class SlidingWindow:
    def __init__(self, window_size=10):
        self.window_size = window_size
        self.messages = []

    def add_message(self, message):
        self.messages.append(message)
        if len(self.messages) > self.window_size:
            self.messages.pop(0)  # 移除最旧的消息

    def get_context(self):
        return self.messages
```

---

## 📖 RAG (检索增强生成)

### 工作流程

```
用户查询
    ↓
1. 查询理解
    ↓
2. 检索相关文档
   - 向量检索
   - 全文检索
   - 混合检索
    ↓
3. 重排序（Rerank）
    ↓
4. Context 构建
    ↓
5. 生成回答
```

### 检索策略

#### 向量检索
```python
# 使用嵌入进行语义检索
query_vector = embedding_model.encode(query)
results = vector_db.search(query_vector, top_k=10)
```

#### 混合检索
```python
# 结合语义和关键词检索
vector_results = vector_search(query)
keyword_results = bm25_search(query)

# 组合结果
final_results = merge_and_rerank(
    vector_results,
    keyword_results,
    weights=[0.7, 0.3]
)
```

#### 重排序
```python
# 使用更精确的模型重新排序
def rerank(query, documents, top_k=5):
    reranked = rerank_model.rank(query, documents)
    return reranked[:top_k]
```

---

## 🧩 Memory 系统

### 短期记忆（工作记忆）
- **用途**：当前对话
- **容量**：有限
- **策略**：保留最近轮次

### 长期记忆（知识库）
- **用途**：持久信息
- **容量**：无限
- **策略**：向量数据库

### 总结记忆（摘要）
- **用途**：历史对话
- **容量**：压缩
- **策略**：定期摘要

```python
class MemorySystem:
    def __init__(self):
        self.short_term = []  # 最近消息
        self.long_term = VectorDB()  # 知识库
        self.summaries = []  # 历史摘要

    def add_to_memory(self, message, is_important=False):
        self.short_term.append(message)

        # 重要信息存入长期记忆
        if is_important:
            self.long_term.insert(message)

        # 定期总结短期记忆
        if len(self.short_term) > 20:
            summary = summarize(self.short_term)
            self.summaries.append(summary)
            self.short_term = []

    def retrieve_context(self, query):
        # 组合多个来源
        context = {
            "recent": self.short_term[-5:],
            "relevant": self.long_term.search(query),
            "history": self.summaries[-3:]
        }
        return context
```

---

## 🎯 最佳实践

### 1. Context 设计

✅ **好的做法**：
- 优先包含最相关的信息
- 使用结构化格式（JSON、Markdown）
- 提供清晰的元数据
- 定期清理和更新

❌ **避免**：
- 堆砌无关信息
- 重复相同内容
- 忽略时效性
- 缺少组织结构

### 2. 性能优化

```python
# 批量处理
def batch_process(documents, batch_size=10):
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        yield process_batch(batch)

# 缓存机制
from functools import lru_cache

@lru_cache(maxsize=100)
def get_context(key):
    return retrieve_context(key)
```

### 3. 质量监控

```python
def monitor_context_quality():
    metrics = {
        "relevance": calculate_relevance(),
        "coverage": calculate_coverage(),
        "redundancy": calculate_redundancy(),
        "timeliness": calculate_timeliness()
    }
    return metrics
```

---

## 📊 评估指标

### 相关性 (Relevance)
- 检索内容与查询的相关度
- 使用 NDCG、MRR 等指标

### 覆盖率 (Coverage)
- 是否覆盖了查询的所有方面
- 信息完整性评估

### 冗余度 (Redundancy)
- 是否存在重复信息
- 去重效果评估

### 时效性 (Timeliness)
- 信息是否过期
- 时间戳管理

---

## 🛠️ 工具与框架

### LangChain
```python
from langchain.memory import (
    ConversationBufferMemory,
    ConversationSummaryMemory,
    VectorStoreMemory
)

# 选择合适的 Memory 类型
memory = ConversationSummaryMemory(
    llm=llm,
    max_token_limit=1000
)
```

### LlamaIndex
```python
from llama_index import VectorStoreIndex, ServiceContext

# 优化索引配置
service_context = ServiceContext.from_defaults(
    chunk_size=512,
    chunk_overlap=50
)
index = VectorStoreIndex(documents, service_context=service_context)
```

### 自实现
```python
# 根据需求定制 Context 管理
class CustomContextManager:
    def __init__(self, config):
        self.config = config
        # 自定义实现
```

---

## 📖 学习资源

### 官方文档
- [LangChain Memory](https://python.langchain.com/docs/modules/memory/)
- [LlamaIndex Indexing](https://docs.llamaindex.ai/en/stable/module_guides/indexing/)

### 论文
- [Retrieval-Augmented Generation for Large Language Models](https://arxiv.org/abs/2005.11401)
- [Condense, Retrieve, and Re-rank: A Comprehensive Study of RAG](https://arxiv.org/abs/2401.07058)

### 实践教程
- [Building RAG Applications](https://www.anthropic.com/index/building-agentic-rag-with-llama-3)
- [Advanced RAG Techniques](https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/)

---

## 🎯 实战项目

### 项目一：智能文档问答
- 功能：从大量文档中检索并回答问题
- 技术：向量检索 + 重排序 + Context 优化

### 项目二：对话历史管理
- 功能：高效管理长期对话历史
- 技术：分层存储 + 摘要压缩 + 智能检索

### 项目三：知识库系统
- 功能：构建可扩展的企业知识库
- 技术：混合检索 + 缓存优化 + 质量监控

---

## 📊 学习进度

- [ ] 基础概念理解
- [ ] 内容选择技术
- [ ] 内容压缩方法
- [ ] RAG 系统构建
- [ ] Memory 系统设计
- [ ] 性能优化
- [ ] 实战项目

---

## 🔗 相关资源

- **[Prompt 工程](../Prompt-工程/)** - 设计更好的查询
- **[联网搜索](../联网搜索/)** - 检索外部信息
- **[Agent 开发](../Agent开发/)** - 构建智能 Agent

---

**💡 记住：好的 Context 管理是高质量 AI 应用的基础！**

*最后更新：2026-02-12*
