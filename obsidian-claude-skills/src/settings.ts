import { App, PluginSettingTab, Setting } from 'obsidian';
import ClaudeSkillPlugin from './main';
import { SkillConfig } from './types';

/**
 * 设置页面
 */
export class ClaudeSkillSettingTab extends PluginSettingTab {
	plugin: ClaudeSkillPlugin;

	constructor(app: App, plugin: ClaudeSkillPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// 标题
		containerEl.createEl('h2', { text: 'Claude Code Skills 设置' });

		// 基础设置
		this.renderBasicSettings(containerEl);

		// Skill 管理
		this.renderSkillsManagement(containerEl);

		// 帮助信息
		this.renderHelpInfo(containerEl);
	}

	private renderBasicSettings(containerEl: HTMLElement) {
		containerEl.createEl('h3', { text: '基础配置' });

		new Setting(containerEl)
			.setName('Claude Code 路径')
			.setDesc('claude 命令的路径（如果不在 PATH 中，使用完整路径）')
			.addText(text => text
				.setPlaceholder('claude')
				.setValue(this.plugin.settings.claudePath)
				.onChange(async (value) => {
					this.plugin.settings.claudePath = value || 'claude';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Claude API Key')
			.setDesc('可选：直接使用 Claude API 而非 CLI（推荐，更稳定）')
			.addText(text => text
				.setPlaceholder('sk-ant-...')
				.setValue(this.plugin.settings.apiKey || '')
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}))
			.addButton(btn => btn
				.setButtonText('获取 API Key')
				.setCta()
				.onClick(() => {
					window.open('https://console.anthropic.com/', '_blank');
				}));

		new Setting(containerEl)
			.setName('默认输出文件夹')
			.setDesc('生成文件的默认保存位置（相对于 vault 根目录）')
			.addText(text => text
				.setPlaceholder('04-RESOURCES/可视化输出')
				.setValue(this.plugin.settings.defaultOutputFolder)
				.onChange(async (value) => {
					this.plugin.settings.defaultOutputFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('显示通知')
			.setDesc('执行过程中显示通知')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showNotifications)
				.onChange(async (value) => {
					this.plugin.settings.showNotifications = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('自动打开生成的文件')
			.setDesc('执行完成后自动打开生成的文件')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoOpenGeneratedFile)
				.onChange(async (value) => {
					this.plugin.settings.autoOpenGeneratedFile = value;
					await this.plugin.saveSettings();
				}));
	}

	private renderSkillsManagement(containerEl: HTMLElement) {
		containerEl.createEl('h3', { text: 'Skill 配置' });
		containerEl.createEl('p', {
			text: '管理可用的 Claude Code Skills',
			cls: 'setting-item-description'
		});

		// 列出所有 Skills
		this.plugin.settings.skills.forEach((skill, index) => {
			const skillContainer = containerEl.createDiv({ cls: 'skill-config-item' });

			new Setting(skillContainer)
				.setName(skill.name)
				.setDesc(`${skill.description}\nID: ${skill.id}`)
				.addToggle(toggle => toggle
					.setValue(skill.enabled)
					.onChange(async (value) => {
						this.plugin.settings.skills[index].enabled = value;
						await this.plugin.saveSettings();
					}))
				.addButton(btn => btn
					.setButtonText('编辑')
					.onClick(() => {
						new SkillEditorModal(
							this.app,
							skill,
							async (updated) => {
								this.plugin.settings.skills[index] = updated;
								await this.plugin.saveSettings();
								this.display();
							}
						).open();
					}))
				.addButton(btn => btn
					.setButtonText('删除')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.skills.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					}));
		});

		// 添加新 Skill 按钮
		new Setting(containerEl)
			.addButton(btn => btn
				.setButtonText('添加新 Skill')
				.setCta()
				.onClick(() => {
					const newSkill: SkillConfig = {
						id: `custom-skill-${Date.now()}`,
						name: '新 Skill',
						description: '描述这个 Skill 的功能',
						promptTemplate: '请处理文件 {inputFile}，生成内容保存到 {outputPath}',
						fileExtension: 'md',
						icon: '🔧',
						enabled: true
					};

					this.plugin.settings.skills.push(newSkill);
					this.plugin.saveSettings();
					this.display();
				}));
	}

	private renderHelpInfo(containerEl: HTMLElement) {
		containerEl.createEl('h3', { text: '使用帮助' });

		const helpDiv = containerEl.createDiv({ cls: 'claude-help-info' });
		helpDiv.innerHTML = `
			<h4>快捷键</h4>
			<ul>
				<li><code>Ctrl+Shift+C</code> - 对当前文件运行 Claude Skill</li>
				<li><code>Ctrl+Shift+S</code> - 选择文件运行 Claude Skill</li>
			</ul>

			<h4>使用流程</h4>
			<ol>
				<li>打开要处理的 Markdown 文件</li>
				<li>按快捷键或通过命令面板选择 "Claude Skills"</li>
				<li>选择要执行的 Skill（如 Excalidraw 图表生成）</li>
				<li>等待 AI 处理完成</li>
				<li>自动打开生成的文件</li>
			</ol>

			<h4>Prompt 模板变量</h4>
			<ul>
				<li><code>{inputFile}</code> - 输入文件路径</li>
				<li><code>{outputPath}</code> - 输出文件路径</li>
				<li><code>{content}</code> - 输入文件内容</li>
			</ol>

			<h4>获取 API Key</h4>
			<p>访问 <a href="https://console.anthropic.com/">Anthropic Console</a> 获取 API Key。</p>
		`;

		// 注入样式
		const styleId = 'claude-help-styles';
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = `
				.claude-help-info {
					padding: 15px;
					background: var(--background-secondary);
					border-radius: 8px;
					margin: 10px 0;
				}
				.claude-help-info h4 {
					margin-top: 15px;
					color: var(--text-accent);
				}
				.claude-help-info code {
					background: var(--background-primary);
					padding: 2px 6px;
					border-radius: 3px;
				}
				.claude-help-info a {
					color: var(--text-accent);
				}
			`;
			document.head.appendChild(style);
		}
	}
}

/**
 * Skill 编辑器模态框
 */
class SkillEditorModal extends Modal {
	private skill: SkillConfig;
	private onSave: (skill: SkillConfig) => void;

	constructor(app: App, skill: SkillConfig, onSave: (skill: SkillConfig) => void) {
		super(app);
		this.skill = { ...skill }; // 创建副本
		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: '编辑 Skill' });

		// ID
		new Setting(contentEl)
			.setName('Skill ID')
			.setDesc('唯一标识符（不能重复）')
			.addText(text => text
				.setValue(this.skill.id)
				.onChange(value => this.skill.id = value));

		// 名称
		new Setting(contentEl)
			.setName('名称')
			.addText(text => text
				.setValue(this.skill.name)
				.onChange(value => this.skill.name = value));

		// 描述
		new Setting(contentEl)
			.setName('描述')
			.addTextArea(text => text
				.setValue(this.skill.description)
				.onChange(value => this.skill.description = value));

		// 图标
		new Setting(contentEl)
			.setName('图标（Emoji）')
			.addText(text => text
				.setValue(this.skill.icon || '')
				.onChange(value => this.skill.icon = value));

		// 文件扩展名
		new Setting(contentEl)
			.setName('输出文件扩展名')
			.addText(text => text
				.setValue(this.skill.fileExtension)
				.onChange(value => this.skill.fileExtension = value));

		// Prompt 模板
		new Setting(contentEl)
			.setName('Prompt 模板')
			.setDesc('可用变量: {inputFile}, {outputPath}, {content}')
			.addTextArea(text => text
				.setValue(this.skill.promptTemplate)
				.onChange(value => this.skill.promptTemplate = value)
				.setPlaceholder('请处理文件 {content}，生成可视化图表保存到 {outputPath}'));

		// 保存按钮
		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('保存')
				.setCta()
				.onClick(() => {
					this.onSave(this.skill);
					this.close();
				}))
			.addButton(btn => btn
				.setButtonText('取消')
				.onClick(() => this.close()));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
