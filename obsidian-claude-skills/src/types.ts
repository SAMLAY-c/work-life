/**
 * 插件设置接口
 */
export interface ClaudeSkillPluginSettings {
	// Claude Code CLI 路径
	claudePath: string;
	// Claude API Key（可选，用于直接 API 调用）
	apiKey?: string;
	// 默认输出文件夹
	defaultOutputFolder: string;
	// 配置的 Skills 列表
	skills: SkillConfig[];
	// 显示通知
	showNotifications: boolean;
	// 自动打开生成的文件
	autoOpenGeneratedFile: boolean;
}

/**
 * Skill 配置接口
 */
export interface SkillConfig {
	id: string;
	name: string;
	description: string;
	promptTemplate: string;
	fileExtension: string;
	icon?: string;
	// 是否启用
	enabled: boolean;
}

/**
 * 进度状态
 */
export interface ProgressStatus {
	percent: number;
	message: string;
	isError: boolean;
}

/**
 * Claude 执行结果
 */
export interface ClaudeExecutionResult {
	success: boolean;
	outputPath?: string;
	error?: string;
}
