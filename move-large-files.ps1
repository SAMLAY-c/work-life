# 大文件移动脚本
# 将 99-ARCHIVE 中的大文件移动到外部存储

param(
    [string]$TargetDir = "E:\Backup\obsidian-vault-large-files",
    [long]$SizeThreshold = 1MB
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  大文件移动脚本" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 创建目标目录
if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    Write-Host "创建目标目录: $TargetDir" -ForegroundColor Green
}

# 源目录
$SourceDir = "99-ARCHIVE"

# 查找大文件
Write-Host "正在扫描大文件 (>1MB)..." -ForegroundColor Yellow
$largeFiles = Get-ChildItem $SourceDir -Recurse -File | Where-Object { $_.Length -gt $SizeThreshold }

$totalSize = 0
$movedCount = 0
$errors = @()

foreach ($file in $largeFiles) {
    $relativePath = $file.FullName.Substring($file.FullName.IndexOf($SourceDir))
    $targetPath = Join-Path $TargetDir $relativePath
    $targetFolder = Split-Path $targetPath -Parent
    
    # 创建目标文件夹
    if (-not (Test-Path $targetFolder)) {
        New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
    }
    
    try {
        Move-Item $file.FullName $targetPath -Force -ErrorAction Stop
        $sizeMB = "{0:N2}" -f ($file.Length/1MB)
        Write-Host "  移动: $relativePath ($sizeMB MB)" -ForegroundColor Gray
        $totalSize += $file.Length
        $movedCount++
    } catch {
        $errors += $file.FullName
        Write-Host "  失败: $relativePath - $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  移动完成: $movedCount 个文件" -ForegroundColor Green
$totalSizeMB = "{0:N2}" -f ($totalSize/1MB)
Write-Host "  释放空间: $totalSizeMB MB" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "以下文件移动失败:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Cyan
Write-Host "  1. 确认文件已正确移动" -ForegroundColor Yellow
Write-Host "  2. 从Git缓存中移除: git rm -r --cached 99-ARCHIVE" -ForegroundColor Yellow
Write-Host "  3. 提交更改: git add . && git commit -m '移除大文件'" -ForegroundColor Yellow
Write-Host ""
Read-Host "按 Enter 键退出"
