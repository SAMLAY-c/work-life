#!/bin/bash

cd "03-产品需求"

# Define the file mappings
declare -A file_mappings=(
    ["锦书 -课程列表-\"所属期数\"新增模糊搜索功能.md"]="01_课程列表模糊搜索功能.md"
    ["关于0元打分看板数据T4冻结的需求文档.md"]="02_0元打分看板数据冻结.md"
    ["直播间聊天记录导出.md"]="03_直播间聊天记录导出.md"
    ["【锦书】辅导后台课程列表-重要时间配置-期数增加到100期.md"]="04_期数扩展到100期.md"
    ["锦书续报学情报告分流机制.md"]="05_续报学情报告分流机制.md"
    ["学情报告取数增加\"年级\"维度.md"]="06_学情报告年级维度.md"
    ["群发任务内容动态参数检验及样式升级.md"]="07_群发任务参数校验样式升级.md"
    ["专题课\"有效在班人数\"指标更新：统一以业务上传的数据为准.md"]="08_专题课有效在班人数指标更新.md"
)

# Rename files
for old_name in "${!file_mappings[@]}"; do
    new_name="${file_mappings[$old_name]}"
    if [ -f "$old_name" ]; then
        mv "$old_name" "$new_name"
        echo "Renamed: $old_name → $new_name"
    else
        echo "File not found: $old_name"
    fi
done