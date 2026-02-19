import { Plugin, Notice, TFile } from 'obsidian';
import { ClaudeIntegration } from './claude';
import { ProgressBar, SkillSelectorModal, FileSelectionModal, OutputFolderModal } from './ui';
import { ClaudeSkillPluginSettings, SkillConfig } from './types';
import { ClaudeSkillSettingTab } from './settings';

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: ClaudeSkillPluginSettings = {
	claudePath: 'claude',
	defaultOutputFolder: '04-RESOURCES/可视化输出',
	showNotifications: true,
	autoOpenGeneratedFile: true,
	skills: [
		{
			id: 'excalidraw-diagram',
			name: 'Excalidraw 图表生成',
			description: '将 Markdown 内容转换为 Excalidraw 可视化图表',
			promptTemplate: '请阅读文件 {content}，将其内容转换为 Excalidraw 格式的可视化图表。生成有效的 JSON 格式 Excalidraw 文件。',
			fileExtension: 'excalidraw',
			icon: '🎨',
			enabled: true
		},
		{
			id: 'mindmap',
			name: '思维导图生成',
			description: '从 Markdown 内容生成思维导图结构',
			promptTemplate: '分析以下内容，生成一个思维导图的 Excalidraw JSON 文件：\n\n{content}',
			fileExtension: 'excalidraw',
			icon: '🧠',
			enabled: true
		},
		{
			id: 'summary',
			name: '内容摘要',
			description: '生成文档的简洁摘要',
			promptTemplate: '为以下内容生成一个简洁的摘要：\n\n{content}',
			fileExtension: 'md',
			icon: '📝',
			enabled: true
		}
	]
};

/**
 * Claude Code Skills 插件主类
 */
export default class ClaudeSkillPlugin extends Plugin {
	settings: ClaudeSkillPluginSettings;
	private claudeIntegration: ClaudeIntegration;
	private progressBar: ProgressBar;
	private vaultPath: string;

	async onload() {
		console.log('Loading Claude Code Skills plugin');

		// 加载设置
		await this.loadSettings();

		// 获取 vault 根路径
		this.vaultPath = (this.app.vault.adapter as any).basePath;

		// 初始化 Claude 集成
		this.claudeIntegration = new ClaudeIntegration(
			this.settings.claudePath,
			this.settings.apiKey
		);

		// 添加状态栏进度条
		this.progressBar = new ProgressBar(this.addStatusBarItem());

		// 注册命令：当前文件执行 Skill
		this.addCommand({
			id: 'run-claude-skill-current-file',
			name: '对当前文件运行 Claude Skill',
			hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: 'c' }],
			callback: () => this.runSkillOnCurrentFile()
		});

		// 注册命令：选择文件执行
		this.addCommand({
			id: 'run-claude-skill-select-file',
			name: '选择文件运行 Claude Skill',
			hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: 's' }],
			callback: () => this.runSkillWithFileSelection()
		});

		// 注册命令：快速 Excalidraw 生成
		this.addCommand({
			id: 'quick-excalidraw',
			name: '快速生成 Excalidraw 图表',
			hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: 'e' }],
			callback: () => this.quickExcalidraw()
		});

		// 添加设置选项卡
		this.addSettingTab(new ClaudeSkillSettingTab(this.app, this));

		// 欢迎提示
		if (this.settings.showNotifications) {
			new Notice('✨ Claude Code Skills 插件已加载');
		}
	}

	onunload() {
		console.log('Unloading Claude Code Skills plugin');
		if (this.progressBar) {
			this.progressBar.hide();
		}
	}

	/**
	 * 对当前文件运行 Skill
	 */
	async runSkillOnCurrentFile() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('❌ 请先打开一个文件');
			return;
		}

		await this.showSkillSelectorAndExecute(activeFile);
	}

	/**
	 * 选择文件运行 Skill
	 */
	async runSkillWithFileSelection() {
		new FileSelectionModal(this.app, async (file) => {
			await this.showSkillSelectorAndExecute(file);
		}).open();
	}

	/**
	 * 快速生成 Excalidraw
	 */
	async quickExcalidraw() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('❌ 请先打开一个文件');
			return;
		}

		const excalidrawSkill = this.settings.skills.find(
			s => s.id === 'excalidraw-diagram' && s.enabled
		);

		if (!excalidrawSkill) {
			new Notice('❌ 未找到 Excalidraw Skill');
			return;
		}

		await this.executeSkill(activeFile, excalidrawSkill);
	}

	/**
	 * 显示 Skill 选择器并执行
	 */
	private async showSkillSelectorAndExecute(file: TFile) {
		// 检查是否有可用的 Skills
		const enabledSkills = this.settings.skills.filter(s => s.enabled);
		if (enabledSkills.length === 0) {
			new Notice('❌ 没有可用的 Skills，请在设置中配置');
			return;
		}

		new SkillSelectorModal(
			this.app,
			this.settings.skills,
			async (selectedSkill) => {
				await this.executeSkill(file, selectedSkill);
			}
		).open();
	}

	/**
	 * 执行 Skill
	 */
	private async executeSkill(file: TFile, skill: SkillConfig) {
		if (this.settings.showNotifications) {
			new Notice(`🚀 开始执行: ${skill.name}`);
		}

		this.progressBar.start(`正在准备 ${skill.name}...`);

		// 设置进度回调
		this.claudeIntegration.setProgressCallback((status) => {
			if (status.isError) {
				this.progressBar.error(status.message);
			} else {
				this.progressBar.update(status.percent, status.message);
			}
		});

		try {
			// 验证环境
			const isValid = await this.claudeIntegration.verifyEnvironment();
			if (!isValid) {
				throw new Error('Claude Code 环境验证失败，请检查设置');
			}

			// 选择输出文件夹
			const outputFolder = await this.selectOutputFolder();

			// 构建输出文件名
			const outputFileName = `${file.basename}_${skill.id}.${skill.fileExtension}`;
			const outputPath = `${outputFolder}/${outputFileName}`;

			// 执行 Skill
			const result = await this.claudeIntegration.executeSkill(
				file.path,
				outputPath,
				skill,
				this.vaultPath
			);

			if (result.success) {
				this.progressBar.complete(`✅ 已生成: ${outputFileName}`);

				if (this.settings.showNotifications) {
					new Notice(`✅ 成功生成: ${outputPath}`);
				}

				// 自动打开生成的文件
				if (this.settings.autoOpenGeneratedFile) {
					await this.openGeneratedFile(result.outputPath!, skill);
				}
			} else {
				throw new Error(result.error || '执行失败');
			}

		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			this.progressBar.error(`❌ 失败: ${errorMsg}`);

			if (this.settings.showNotifications) {
				new Notice(`❌ 执行失败: ${errorMsg}`, 5000);
			}

			console.error('Skill execution error:', error);
		}
	}

	/**
	 * 选择输出文件夹
	 */
	private async selectOutputFolder(): Promise<string> {
		return new Promise((resolve) => {
			new OutputFolderModal(this.app, (folder) => {
				if (folder) {
					resolve(folder);
				} else {
					resolve(this.settings.defaultOutputFolder);
				}
			}).open();
		});
	}

	/**
	 * 打开生成的文件
	 */
	private async openGeneratedFile(outputPath: string, skill: SkillConfig) {
		try {
			// 等待文件被 Obsidian 索引
			await new Promise(resolve => setTimeout(resolve, 500));

			// 获取文件对象
			const file = this.app.vault.getAbstractFileByPath(outputPath);
			if (!file) {
				console.warn('Generated file not found:', outputPath);
				return;
			}

			// 根据文件类型打开
			if (skill.fileExtension === 'excalidraw') {
				// 尝试使用 Excalidraw 插件打开
				const excalidrawPlugin = (this.app as any).plugins.plugins['obsidian-excalidraw-plugin'];
				if (excalidrawPlugin && excalidrawPlugin.openExcalidrawView) {
					await excalidrawPlugin.openExcalidrawView(file);
				} else {
					// 降级：使用默认方式打开
					await this.app.workspace.openLinkText(file.path, '', true);
				}
			} else {
				// Markdown 或其他文件
				await this.app.workspace.openLinkText(file.path, '', true);
			}

		} catch (error) {
			console.error('Failed to open generated file:', error);
		}
	}

	/**
	 * 加载设置
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * 保存设置
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
