import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { SkillConfig, ClaudeExecutionResult, ProgressStatus } from './types';

const execAsync = promisify(exec);

/**
 * Claude Code 集成类
 * 负责与 Claude Code CLI 或 API 交互
 */
export class ClaudeIntegration {
	private claudePath: string;
	private apiKey?: string;
	private onProgress?: (status: ProgressStatus) => void;

	constructor(claudePath: string, apiKey?: string) {
		this.claudePath = claudePath;
		this.apiKey = apiKey;
	}

	/**
	 * 设置进度回调
	 */
	setProgressCallback(callback: (status: ProgressStatus) => void) {
		this.onProgress = callback;
	}

	/**
	 * 验证 Claude Code 环境
	 */
	async verifyEnvironment(): Promise<boolean> {
		try {
			this.reportProgress(10, '检查 Claude Code 环境...');
			await execAsync(`${this.claudePath} --version`);
			this.reportProgress(20, 'Claude Code 环境正常');
			return true;
		} catch (error) {
			console.error('Claude Code verification failed:', error);
			this.reportProgress(0, '环境检查失败', true);
			return false;
		}
	}

	/**
	 * 执行 Skill 任务
	 * @param inputPath 输入文件路径
	 * @param outputPath 输出文件路径
	 * @param skill Skill 配置
	 * @param vaultPath Obsidian vault 根路径
	 */
	async executeSkill(
		inputPath: string,
		outputPath: string,
		skill: SkillConfig,
		vaultPath: string
	): Promise<ClaudeExecutionResult> {
		try {
			// 构建完整的文件路径
			const fullInputPath = path.join(vaultPath, inputPath);
			const fullOutputPath = path.join(vaultPath, outputPath);

			// 验证输入文件存在
			if (!fs.existsSync(fullInputPath)) {
				throw new Error(`输入文件不存在: ${inputPath}`);
			}

			// 确保输出目录存在
			const outputDir = path.dirname(fullOutputPath);
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			this.reportProgress(30, '读取源文件...');
			const inputContent = fs.readFileSync(fullInputPath, 'utf-8');

			this.reportProgress(40, '构建 AI Prompt...');
			const prompt = this.buildPrompt(inputContent, inputPath, outputPath, skill);

			// 选择执行方式：API 或 CLI
			if (this.apiKey) {
				return await this.executeViaAPI(prompt, fullOutputPath, skill);
			} else {
				return await this.executeViaCLI(prompt, fullOutputPath, skill, vaultPath);
			}

		} catch (error) {
			console.error('Skill execution failed:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	}

	/**
	 * 构建完整的 Prompt
	 */
	private buildPrompt(
		inputContent: string,
		inputPath: string,
		outputPath: string,
		skill: SkillConfig
	): string {
		const prompt = skill.promptTemplate
			.replace('{inputFile}', inputPath)
			.replace('{outputPath}', outputPath)
			.replace('{content}', inputContent);

		return prompt;
	}

	/**
	 * 通过 Claude API 执行（推荐方式）
	 */
	private async executeViaAPI(
		prompt: string,
		outputPath: string,
		skill: SkillConfig
	): Promise<ClaudeExecutionResult> {
		try {
			this.reportProgress(50, '调用 Claude API...');

			const response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'x-api-key': this.apiKey!,
					'anthropic-version': '2023-06-01',
					'content-type': 'application/json',
					'dangerously-direct-browser-access': 'true'
				},
				body: JSON.stringify({
					model: 'claude-sonnet-4-5-20250929',
					max_tokens: 8192,
					messages: [
						{
							role: 'user',
							content: prompt
						}
					]
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
			}

			this.reportProgress(70, '解析 AI 响应...');

			const data = await response.json();
			const generatedContent = data.content[0].text;

			this.reportProgress(90, '保存生成文件...');

			// 保存文件
			await this.saveGeneratedContent(generatedContent, outputPath, skill);

			this.reportProgress(100, '完成');

			return {
				success: true,
				outputPath: outputPath
			};

		} catch (error) {
			console.error('API execution failed:', error);
			throw error;
		}
	}

	/**
	 * 通过 Claude Code CLI 执行
	 */
	private async executeViaCLI(
		prompt: string,
		outputPath: string,
		skill: SkillConfig,
		workingDir: string
	): Promise<ClaudeExecutionResult> {
		try {
			this.reportProgress(50, '启动 Claude Code CLI...');

			// 构建 CLI 命令
			// 注意：这里假设 Claude Code 支持某种形式的脚本化输入
			// 实际实现可能需要根据 Claude Code CLI 的实际 API 调整
			const command = `echo "${prompt.replace(/"/g, '\\"')}" | ${this.claudePath} --headless`;

			const { stdout, stderr } = await execAsync(command, {
				cwd: workingDir,
				timeout: 120000 // 2 分钟超时
			});

			this.reportProgress(80, '处理输出...');

			// 这里需要解析 CLI 的输出并提取生成的内容
			// 实际实现取决于 Claude Code CLI 的输出格式
			const generatedContent = this.parseCLIOutput(stdout);

			this.reportProgress(90, '保存文件...');

			await this.saveGeneratedContent(generatedContent, outputPath, skill);

			this.reportProgress(100, '完成');

			return {
				success: true,
				outputPath: outputPath
			};

		} catch (error) {
			console.error('CLI execution failed:', error);
			throw error;
		}
	}

	/**
	 * 解析 CLI 输出（占位符实现）
	 */
	private parseCLIOutput(stdout: string): string {
		// 实际实现需要根据 Claude Code CLI 的输出格式调整
		// 这里假设输出直接包含生成的内容
		return stdout;
	}

	/**
	 * 保存生成的内容到文件
	 */
	private async saveGeneratedContent(
		content: string,
		outputPath: string,
		skill: SkillConfig
	): Promise<void> {
		// 根据不同的文件类型进行预处理
		let processedContent = content;

		if (skill.fileExtension === 'excalidraw') {
			// 如果是 Excalidraw，需要确保内容是有效的 JSON
			try {
				// 尝试解析 JSON 以验证格式
				const jsonContent = JSON.parse(content);
				processedContent = JSON.stringify(jsonContent, null, 2);
			} catch {
				// 如果不是纯 JSON，可能需要提取 JSON 部分
				const jsonMatch = content.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					processedContent = jsonMatch[0];
				} else {
					throw new Error('无法提取有效的 Excalidraw JSON');
				}
			}
		}

		// 写入文件
		fs.writeFileSync(outputPath, processedContent, 'utf-8');
	}

	/**
	 * 报告进度
	 */
	private reportProgress(percent: number, message: string, isError: boolean = false) {
		if (this.onProgress) {
			this.onProgress({ percent, message, isError });
		}
	}
}
