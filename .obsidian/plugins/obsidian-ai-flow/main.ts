import { App, Notice, Plugin, PluginSettingTab, Setting, TFile, requestUrl } from 'obsidian';

// 1. 定义设置接口
interface AIFlowSettings {
    apiKey: string;
    model: string;
    sourceFolder: string;
    destinationFolder: string;
    templatePath: string;
    systemPrompt: string;
}

// 2. 硬编码默认配置 (已更新提示词)
const DEFAULT_SETTINGS: AIFlowSettings = {
    apiKey: 'sk-itnytfacpeobkvireovadmsrbonrgemrsnfgsqvhesjtyppz',
    model: 'deepseek-ai/DeepSeek-V3', // 确认你的 API 支持此模型名称
    sourceFolder: '00-Inbox',
    destinationFolder: 'Knowledge Base',
    templatePath: '90-System/Templates/模板/讲稿模板.md',
    systemPrompt: `你是一个资深的知识管理专家和内容分析师。用户的输入是一篇【讲稿/速记】。
你的任务是深度分析内容，并将其重构为结构化的知识文档。

请严格按照以下 JSON 格式返回数据（不要包含 markdown 代码块标记，直接返回纯 JSON）：
{
  "suggested_tags": "请提取3-5个核心分类标签，格式必须严格为 YAML 列表字符串。标签必须包含：1) 涉及的领域（如：心理学/编程/管理/营销等）2) 如果讲稿中提到具体的 AI 模型名称（如 GPT-4, Claude, Midjourney 等），必须添加对应标签；如果没有提到 AI 模型则不加。例如：'  - 心理学\\n  - 认知科学\\n  - GPT-4\\n  - 沟通技巧' (注意换行符和缩进)",
  "analysis_table": "生成一个 Markdown 表格，总结全文。表格列头需包含：[核心议题, 关键概念(3个), 情感/基调, 适用场景, 重要程度(1-5星)]",
  "detailed_content": "详细的正文分析，要求内容充实、细节丰富，不要过度概括。请按逻辑分章节（使用 ##, ### 标题），必须包含以下部分：1) 背景介绍（讲者背景、演讲场合、核心问题），2) 核心观点梳理（逐一详细阐述每个重要观点，包含论据和推理过程），3) 案例分析（对每个案例进行详细解读，包括具体做法、效果数据、关键启示），4) 方法论提炼（总结可复用的方法和框架），5) 金句摘录（引用原话中的精彩表述）。保持专业、书面化，但要保留重要细节和具体信息。每个部分至少需要150-200字，总字数不少于800字。",
  "action_items": "基于内容提炼的可执行建议清单（Markdown 列表格式），每条建议要具体可操作，避免空泛。"
}`
}

export default class AIFlowPlugin extends Plugin {
    settings: AIFlowSettings;

    async onload() {
        await this.loadSettings();

        // 注册命令
        this.addCommand({
            id: 'process-lecture-note',
            name: '✨ 将当前讲稿整理至知识库 (表格+深度分析)',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) return false;

                // 检查是否在源文件夹内
                const isInSource = activeFile.path.startsWith(this.settings.sourceFolder);

                if (checking) return isInSource;

                // 执行处理
                this.processNote(activeFile);
                return true;
            }
        });

        // 添加设置页
        this.addSettingTab(new AIFlowSettingTab(this.app, this));
    }

    async processNote(sourceFile: TFile) {
        new Notice(`🚀 开始整理讲稿: ${sourceFile.basename}`);

        // 步骤 1: 读取源文件
        new Notice(`📖 (1/6) 正在读取源文件...`);
        const sourceContent = await this.app.vault.read(sourceFile);
        const contentLength = sourceContent.length;
        new Notice(`✅ 已读取 ${contentLength} 字符`);

        try {
            // 步骤 2: 调用 SiliconFlow API
            new Notice(`🤖 (2/6) 正在调用 DeepSeek AI 分析...`);
            const startTime = Date.now();

            const aiResult = await this.callSiliconFlow(sourceContent);

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            new Notice(`✅ AI 分析完成 (耗时 ${elapsed} 秒)`);

            // 步骤 3: 解析 JSON
            new Notice(`📋 (3/6) 正在解析 AI 结果...`);
            let aiData;
            try {
                // 清理可能存在的 markdown 代码块标记 (兼容性处理)
                const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
                aiData = JSON.parse(cleanJson);
            } catch (e) {
                console.error("JSON解析失败", aiResult);
                new Notice("⚠️ AI 返回格式异常，请查看控制台日志");
                return;
            }
            new Notice(`✅ 数据解析成功`);

            // 步骤 4: 读取模板文件
            new Notice(`📄 (4/6) 正在读取模板...`);
            const templateFile = this.app.vault.getAbstractFileByPath(this.settings.templatePath);
            if (!(templateFile instanceof TFile)) {
                new Notice(`❌ 找不到模板文件: ${this.settings.templatePath}`);
                return;
            }
            let templateContent = await this.app.vault.read(templateFile);

            // 步骤 5: 自动识别来源平台
            const platform = this.detectPlatform(sourceFile.path);
            const sourceTag = platform ? `  - source/${platform}\n` : "";
            new Notice(`🏷️ 识别来源: ${platform}`);

            // 步骤 6: 填充模板
            new Notice(`✍️  (5/6) 正在生成文档...`);
            const finalContent = templateContent
                .replace(/\{\{title\}\}/g, sourceFile.basename)
                .replace(/\{\{date\}\}/g, new Date().toISOString().split('T')[0])
                .replace(/\{\{model_name\}\}/g, this.settings.model)
                .replace(/\{\{source_file\}\}/g, sourceFile.path)
                // 新增字段
                .replace(/\{\{SOURCE_TAG\}\}/g, sourceTag)
                .replace(/\{\{AI_TAGS\}\}/g, aiData.suggested_tags || "  - 待分类")
                .replace(/\{\{AI_TABLE\}\}/g, aiData.analysis_table || "表格生成失败")
                .replace(/\{\{AI_DETAILED_CONTENT\}\}/g, aiData.detailed_content || "生成失败")
                .replace(/\{\{AI_ACTION_ITEMS\}\}/g, aiData.action_items || "无");

            // 步骤 7: 写入目标文件
            new Notice(`💾 (6/6) 正在保存文件...`);
            // 确保目标文件夹存在
            if (!this.app.vault.getAbstractFileByPath(this.settings.destinationFolder)) {
                await this.app.vault.createFolder(this.settings.destinationFolder);
            }

            const destPath = `${this.settings.destinationFolder}/${sourceFile.basename}_AI.md`;

            // 检查是否存在，存在则先删除
            const existFile = this.app.vault.getAbstractFileByPath(destPath);
            if (existFile) {
                await this.app.vault.delete(existFile);
            }

            const newFile = await this.app.vault.create(destPath, finalContent);

            new Notice(`🎉 讲稿整理完成！已保存至 Knowledge Base`);

            // 显示生成内容的统计信息
            const wordCount = finalContent.length;
            const lineCount = finalContent.split('\n').length;
            console.log(`生成文件统计: ${wordCount} 字符, ${lineCount} 行`);

            // 打开新文件
            this.app.workspace.getLeaf('tab').openFile(newFile);

        } catch (error) {
            new Notice(`处理出错: ${error.message}`);
            console.error(error);
        }
    }

    async callSiliconFlow(content: string): Promise<string> {
        const response = await requestUrl({
            url: 'https://api.siliconflow.cn/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.settings.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.settings.model,
                messages: [
                    { role: "system", content: this.settings.systemPrompt },
                    { role: "user", content: content }
                ],
                stream: false,
                temperature: 0.5, // 稍微降低温度，让分析更严谨
                response_format: { type: "json_object" }
            })
        });

        if (response.status !== 200) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json.choices[0].message.content;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // 自动检测来源平台
    detectPlatform(filePath: string): string {
        // 根据文件夹路径识别平台
        if (filePath.includes('01-B站') || filePath.includes('01-bilibili')) {
            return 'B站';
        } else if (filePath.includes('02-抖音') || filePath.includes('02-douyin')) {
            return '抖音';
        } else if (filePath.includes('03-小红书') || filePath.includes('03-xiaohongshu')) {
            return '小红书';
        } else if (filePath.includes('01-讲稿') || filePath.includes('01-lecture')) {
            return '讲稿';
        } else if (filePath.includes('00-临时')) {
            return '临时';
        }
        return '未知来源';
    }
}

// 设置页面的简单实现
class AIFlowSettingTab extends PluginSettingTab {
    plugin: AIFlowPlugin;

    constructor(app: App, plugin: AIFlowPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();
        containerEl.createEl('h2', {text: 'AI Flow 讲稿深度分析设置'});

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('SiliconFlow API Key')
            .addText(text => text
                .setPlaceholder('Enter your key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('模型')
            .setDesc('推荐使用 DeepSeek-V3 或 R1')
            .addText(text => text
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('源文件夹')
            .addText(text => text
                .setValue(this.plugin.settings.sourceFolder)
                .onChange(async (value) => {
                    this.plugin.settings.sourceFolder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('目标文件夹')
            .addText(text => text
                .setValue(this.plugin.settings.destinationFolder)
                .onChange(async (value) => {
                    this.plugin.settings.destinationFolder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('模板路径')
            .addText(text => text
                .setValue(this.plugin.settings.templatePath)
                .onChange(async (value) => {
                    this.plugin.settings.templatePath = value;
                    await this.plugin.saveSettings();
                }));

        // 这里添加一个文本域，允许你在 Obsidian 里直接修改 Prompt，方便调试
        new Setting(containerEl)
            .setName('系统提示词 (System Prompt)')
            .setDesc('修改 AI 的指令逻辑')
            .addTextArea(text => text
                .setPlaceholder('输入系统提示词...')
                .setValue(this.plugin.settings.systemPrompt)
                .onChange(async (value) => {
                    this.plugin.settings.systemPrompt = value;
                    await this.plugin.saveSettings();
                }));
    }
}
