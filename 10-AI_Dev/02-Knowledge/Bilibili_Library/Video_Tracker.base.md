---
bases:
  baseId: bilibili-video-tracker
  version: 1.0.0
  columns:
    - key: title
      label: Title
      type: text
      config: {}
    - key: status
      label: Status
      type: select
      config:
        options:
          - label: "🔴 待看"
            value: todo
            color: "ff0000"
          - label: "🟡 进行中"
            value: in_progress
            color: "ffff00"
          - label: "🟢 已完成"
            value: done
            color: "00ff00"
          - label: "📝 已归档"
            value: archived
            color: "808080"
    - key: uploader
      label: UP主
      type: text
      config: {}
    - key: category
      label: Category
      type: select
      config:
        options:
          - label: "AI技术"
            value: ai_tech
            color: "3b82f6"
          - label: "编程"
            value: programming
            color: "10b981"
          - label: "效率工具"
            value: productivity
            color: "f59e0b"
          - label: "思维模型"
            value: thinking
            color: "8b5cf6"
          - label: "其他"
            value: other
            color: "6b7280"
    - key: url
      label: URL
      type: url
      config: {}
    - key: rating
      label: Rating
      type: number
      config:
        min: 1
        max: 5
    - key: linked_note
      label: Linked_Note
      type: file
      config: {}
  rows: []
---

# B站视频追踪数据库

使用此数据库管理你的B站视频学习进度。
