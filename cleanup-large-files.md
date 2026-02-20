# 归档大文件清理指南

## 📊 清理前统计

| 指标 | 数值 |
|------|------|
| Git 仓库总大小 | 277.87 MiB |
| 99-ARCHIVE 大文件(>1MB) | ~560+ 个 |

## 📁 需要外部存储的大文件

### 视频文件 (4个, ~152 MB)
```
99-ARCHIVE/00-Inbox/bilibili/videos/
  ├── 终于，我用AI治好了只收藏不学习的坏毛病...mp4 (123.55 MB)
  ├── 桌游棋牌征集令_斗地主_001.mp4 (17.52 MB)
  ├── 一周4次安装Openclaw的经验总结.mp4 (10.86 MB)
```

### 小智AI项目文件 (~400+ MB)
```
99-ARCHIVE/30-Resources/AI-项目/11-小智/5、小智AI客户资料/
  ├── 4、源代码/ → 大量 .bin 固件文件
  ├── 5、3D打印源文件/ → 大量 .stl 模型文件
  ├── 说明文档 .pdf
```

## 🛠️ 清理步骤

### 步骤1：备份大文件到外部存储

**方案 A：手动移动**
```bash
# 创建备份目录
mkdir -p "E:\Backup\obsidian-vault-large-files\99-ARCHIVE"

# 移动视频文件
mv 99-ARCHIVE/**/*.{mp4,avi,mov,mkv} "E:\Backup\obsidian-vault-large-files\"

# 移动固件/模型文件  
mv 99-ARCHIVE/**/*.bin "E:\Backup\obsidian-vault-large-files\"
mv 99-ARCHIVE/**/*.stl "E:\Backup\obsidian-vault-large-files\"
```

**方案 B：保留在仓库但使用 Git LFS**
```bash
# 启用 Git LFS
git lfs install

# 跟踪大文件类型
git lfs track "*.mp4"
git lfs track "*.bin"
git lfs track "*.stl"
git lfs track "99-ARCHIVE/**/*.pdf"

git add .gitattributes
git commit -m "启用 Git LFS 管理大文件"
```

### 步骤2：更新 Git 追踪

```bash
# 从Git索引中移除大文件（但保留本地文件）
git rm -r --cached 99-ARCHIVE/00-Inbox/bilibili/videos/*.mp4
git rm -r --cached 99-ARCHIVE/30-Resources/AI-项目/**/*.bin
git rm -r --cached 99-ARCHIVE/30-Resources/AI-项目/**/*.stl

# 提交更改
git add .gitignore
git commit -m "移除大文件出Git追踪，添加.gitignore规则"
```

### 步骤3：清理Git历史（可选但推荐）

**警告：这会重写提交历史！**

```bash
# 安装 git-filter-repo
pip install git-filter-repo

# 移除历史中所有超过 5MB 的 blob
git-filter-repo --strip-blobs-bigger-than 5M

# 或移除特定文件类型
git-filter-repo --path-glob '*.mp4' --path-glob '*.bin' --invert-paths

# 强制推送（会改变远程历史）
git push origin --force --all
```

⚠️ **重要**：如果多人协作，确保所有人同步后再执行此操作！

## ✅ 预期效果

| 操作 | Git仓库大小 | 本地仓库 |
|------|------------|---------|
| 仅更新.gitignore | 277 MB → 277 MB | 变小（文件保留但不被追踪）|
| + Git LFS | 277 MB → ~50 MB | 不变 |
| + 历史清理 | 277 MB → ~20 MB | 显著变小 |

## 📋 建议方案

**推荐方案：本地保留 + Git LFS**

优点：
- 文件仍在本地可用
- Git 仓库保持小巧
- 跨设备同步时自动下载大文件

步骤：
1. `git lfs install`
2. 配置 `.gitattributes` 跟踪大文件类型
3. 正常提交
