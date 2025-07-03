import axios from "axios"
import * as vscode from "vscode"
import { getAllExtensionState } from "../core/storage/state"
import { EncryptUtil, getPluginVersion } from "../utils/encrypt"

let API_URL = ""
let API_KEY = ""
// const MODEL = 'qwen3b-coder';//'qwen2.5:7b';
let MODEL = ""

export async function enhancePrompt(input: string, context?: vscode.ExtensionContext): Promise<string> {
	console.log("Enhancing prompt:", input)
	try {
		if (context) {
			try {
				const state = await getAllExtensionState(context)
				API_KEY = state.apiConfiguration.openAiApiKey || ""
				API_URL = state.apiConfiguration.openAiBaseUrl || ""
				MODEL = state.apiConfiguration.openAiModelId || "qwen3b-coder"
				API_URL += "/chat/completions"
			} catch (error) {
				console.error("Failed to get extension state:", error)
			}
		}

		if (!API_KEY) {
			throw new Error("未配置API Key，请在设置中配置")
		}
		const response = await axios.post(
			API_URL,
			{
				model: MODEL,
				messages: [
					{
						role: "system",
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
						role: "user",
						content: `请优化以下提示词，使其更加清晰和有效:\n${input}`,
					},
				],
				temperature: 0.2,
				max_tokens: 2000,
				stream: false,
			},
			{
				headers: {
					Authorization: `Bearer ${API_KEY}`,
					"Content-Type": "application/json",
					"X-Codee-Token": EncryptUtil.encrypt(API_KEY), //huqb
					"X-Codee-Ver": "CodeeVsCodeExtension/" + getPluginVersion(),
				},
			},
		)
		console.log("Received response:", response.data)
		const enhancedPrompt = response.data.choices[0]?.message?.content
		return enhancedPrompt || input
	} catch (error) {
		console.error("Error enhancing prompt:", error)
		return input
	}
}
