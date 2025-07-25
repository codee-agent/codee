import * as vscode from "vscode"
import { getAllExtensionState } from "../core/storage/state"
import { buildApiHandler } from "@api/index"

export async function enhancePrompt(input: string, context?: vscode.ExtensionContext): Promise<string> {
	let enhancedPrompt = ""
	try {
		if (context) {
			try {
				const state = await getAllExtensionState(context)
				const api = buildApiHandler(state.apiConfiguration)

				const messages = [
					{
						role: "assistant" as const,
						content: `你是一个专业的提示词优化助手。你需要优化用户输入的提示词，请遵循以下步骤：
                        1. 分析提示词结构：
                        - 识别提示词中的关键要素和目标
                        - 评估当前提示词的优缺点
                        - 找出可能的模糊或不完整之处

                        2. 优化方向：
                        - 使指令更清晰、具体且可执行
                        - 添加必要的上下文信息
                        - 完善约束条件和期望输出格式
                        - 补充重要的技术细节和要求
                        - 如果你觉得没有优化的必要，直接返回用户输入的提示词，请不要要求用户补充其它条件

                        3. 输出格式：
                        - 请记住你输出的是文本内容，无需放在代码块中！
                        - 如果内容中有多个要求，请使用1，2，3等序号来编写
                        - 不需要解释，直接返回优化后的内容
                        `,
					},
					{
						role: "user" as const,
						content: `请优化以下提示词，使其更加清晰和有效:\n${input}`,
					},
				]
				let stream = api.createMessage("", messages)

				for await (const chunk of stream) {
					if (chunk.type === "text") {
						enhancedPrompt += chunk.text
					}
				}
			} catch (error) {
				console.error("Failed to get enhancedPrompt:", error)
				return input
			}
		}
		return enhancedPrompt || input
	} catch (error) {
		console.error("Error enhancing prompt:", error)
		return input
	}
}
