import { App, Modal, Notice, SuggestModal, TFile } from 'obsidian';
import { SkillConfig } from './types';

/**
 * 进度条组件（显示在状态栏）
 */
export class ProgressBar {
	private statusBarItem: HTMLElement;
	private container: HTMLElement;
	private fill: HTMLElement;
	private text: HTMLElement;
	private currentProgress: number = 0;

	constructor(statusBarItem: HTMLElement) {
		this.statusBarItem = statusBarItem;
		this.statusBarItem.addClass('claude-progress-container');

		// 创建进度条 DOM
		this.container = this.statusBarItem.createDiv({ cls: 'progress-wrapper' });
		this.fill = this.container.createDiv({ cls: 'progress-fill' });
		this.text = this.statusBarItem.createSpan({ cls: 'progress-text' });

		this.hide();

		// 注入样式
		this.injectStyles();
	}

	private injectStyles() {
		const styleId = 'claude-progress-styles';
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = `
				.claude-progress-container {
					display: flex;
					align-items: center;
					gap: 10px;
					padding: 0 10px;
				}
				.progress-wrapper {
					width: 100px;
					height: 6px;
					background: var(--background-modifier-border);
					border-radius: 3px;
					overflow: hidden;
				}
				.progress-fill {
					height: 100%;
					background: linear-gradient(90deg, #7ee787, #58a6ff);
					width: 0%;
					transition: width 0.3s ease;
				}
				.progress-text {
					font-size: 12px;
					color: var(--text-muted);
					max-width: 200px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			`;
			document.head.appendChild(style);
		}
	}

	start(message: string) {
		this.currentProgress = 0;
		this.statusBarItem.show();
		this.update(0, message);
	}

	update(percent: number, message: string) {
		this.currentProgress = Math.min(percent, 100);
		this.fill.style.width = `${this.currentProgress}%`;
		this.text.textContent = message;

		// 根据进度改变颜色
		if (percent < 30) {
			this.fill.style.background = '#58a6ff';
		} else if (percent < 70) {
			this.fill.style.background = '#a371f7';
		} else {
			this.fill.style.background = '#7ee787';
		}
	}

	complete(message: string) {
		this.update(100, message);
		setTimeout(() => this.hide(), 3000);
	}

	error(message: string) {
		this.fill.style.background = '#f85149';
		this.text.textContent = message;
		setTimeout(() => this.hide(), 5000);
	}

	hide() {
		this.statusBarItem.hide();
	}
}

/**
 * Skill 选择器模态框
 */
export class SkillSelectorModal extends Modal {
	private onSelect: (skill: SkillConfig) => void;
	private skills: SkillConfig[];

	constructor(app: App, skills: SkillConfig[], onSelect: (skill: SkillConfig) => void) {
		super(app);
		this.skills = skills.filter(s => s.enabled);
		this.onSelect = onSelect;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: '选择 Claude Skill' });
		contentEl.addClass('claude-skill-selector');

		// 创建 Skill 卡片列表
		this.skills.forEach(skill => {
			const card = contentEl.createDiv({ cls: 'skill-card' });

			// 图标 + 名称
			const header = card.createDiv({ cls: 'skill-header' });
			header.createSpan({ cls: 'skill-icon', text: skill.icon || '⚡' });
			header.createEl('h3', { text: skill.name });

			// 描述
			card.createEl('p', {
				text: skill.description,
				cls: 'skill-desc'
			});

			// 点击事件
			card.addEventListener('click', () => {
				this.close();
				this.onSelect(skill);
			});
		});

		// 注入样式
		this.injectStyles();
	}

	private injectStyles() {
		const styleId = 'claude-skill-selector-styles';
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = `
				.claude-skill-selector {
					max-width: 600px;
				}
				.skill-card {
					padding: 15px;
					margin: 10px 0;
					border: 1px solid var(--background-modifier-border);
					border-radius: 8px;
					cursor: pointer;
					transition: all 0.2s;
				}
				.skill-card:hover {
					background: var(--background-modifier-hover);
					border-color: var(--interactive-accent);
					transform: translateX(5px);
					box-shadow: 0 2px 8px rgba(0,0,0,0.1);
				}
				.skill-header {
					display: flex;
					align-items: center;
					gap: 10px;
					margin-bottom: 8px;
				}
				.skill-icon {
					font-size: 24px;
				}
				.skill-header h3 {
					margin: 0;
					font-size: 16px;
				}
				.skill-desc {
					color: var(--text-muted);
					font-size: 0.9em;
					margin: 5px 0 0 0;
				}
			`;
			document.head.appendChild(style);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

/**
 * 文件选择模态框
 */
export class FileSelectionModal extends SuggestModal<TFile> {
	private onChoose: (file: TFile) => void;

	constructor(app: App, onChoose: (file: TFile) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder('输入文件名搜索...');
		this.limit = 20;
	}

	getSuggestions(query: string): TFile[] {
		const files = this.app.vault.getMarkdownFiles();

		if (!query) {
			// 返回最近修改的文件
			return files
				.sort((a, b) => b.stat.mtime - a.stat.mtime)
				.slice(0, 20);
		}

		const lowerQuery = query.toLowerCase();
		return files
			.filter(file =>
				file.path.toLowerCase().includes(lowerQuery) ||
				file.basename.toLowerCase().includes(lowerQuery)
			)
			.sort((a, b) => b.stat.mtime - a.stat.mtime);
	}

	renderSuggestion(file: TFile, el: HTMLElement) {
		el.createDiv({ text: file.basename, cls: 'suggestion-title' });
		el.createDiv({ text: file.path, cls: 'suggestion-note' });

		// 显示修改时间
		const modTime = new Date(file.stat.mtime);
		const timeStr = modTime.toLocaleString();
		el.createDiv({
			text: `修改于: ${timeStr}`,
			cls: 'suggestion-meta'
		});
	}

	onChooseSuggestion(file: TFile) {
		this.onChoose(file);
	}
}

/**
 * 输出文件夹选择模态框
 */
export class OutputFolderModal extends SuggestModal<string> {
	private onChoose: (folder: string) => void;
	private folders: string[];

	constructor(app: App, onChoose: (folder: string) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder('选择输出文件夹...');

		// 获取所有文件夹
		this.folders = this.app.vault.getAllLoadedFiles()
			.filter(f => f.children !== undefined)
			.map(f => f.path);
	}

	getSuggestions(query: string): string[] {
		if (!query) return this.folders.slice(0, 20);

		const lowerQuery = query.toLowerCase();
		return this.folders.filter(folder =>
			folder.toLowerCase().includes(lowerQuery)
		);
	}

	renderSuggestion(folder: string, el: HTMLElement) {
		el.createDiv({ text: folder || '根目录' });
	}

	onChooseSuggestion(folder: string) {
		this.onChoose(folder);
	}
}
