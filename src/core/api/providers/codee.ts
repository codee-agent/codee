import { Anthropic } from "@anthropic-ai/sdk"
import {
	ModelInfo,
	OpenAiCompatibleModelInfo,
	openAiModelInfoSaneDefaults
} from "@shared/api"
import OpenAI from "openai"
import type { ChatCompletionReasoningEffort, ChatCompletionTool } from "openai/resources/chat/completions"
// import { telemetryService } from "@/services/posthog/PostHogClientProvider"
import { EncryptUtil, getPluginVersion } from "@/utils/encrypt"
import { ApiHandler, CommonApiHandlerOptions } from "../index"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { convertToR1Format } from "../transform/r1-format"
import { ApiStream } from "../transform/stream"
import { ToolCallParser } from "../../utils/tool-call-parser"
import { ToolCallProcessor } from "../transform/tool-call-processor"

interface OpenAiHandlerOptions extends CommonApiHandlerOptions {
	openAiApiKey?: string
	openAiBaseUrl?: string
	codeeModelId?: string
	openAiModelInfo?: OpenAiCompatibleModelInfo
	reasoningEffort?: string
}

export class CodeeHandler implements ApiHandler {
	private options: OpenAiHandlerOptions
	private client: OpenAI | undefined
	private aggregatedToolCalls: Map<string, any> = new Map() // 用于累积流式工具调用
	private toolCallParser = new ToolCallParser()

	constructor(options: OpenAiHandlerOptions) {
		this.options = options
	}

	private ensureClient(): OpenAI {
		if (!this.client) {
			if (!this.options.openAiApiKey) {
				throw new Error("Codee API key is required")
			}
			try {
				this.client = new OpenAI({
					baseURL: this.options.openAiBaseUrl,
					apiKey: this.options.openAiApiKey,
					defaultHeaders: {},
					dangerouslyAllowBrowser: true,
				})
			} catch (error: any) {
				throw new Error(`Error creating Codee client: ${error.message}`)
			}
		}
		return this.client
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[], tools?: ChatCompletionTool[]): ApiStream {
		// 重置状态，确保每次调用都是干净的
		this.aggregatedToolCalls.clear()
		this.toolCallParser.reset()
		
		this.client = this.ensureClient()
		const modelId = this.options.codeeModelId ?? ""
		const isDeepseekReasoner = modelId.includes("deepseek-reasoner")
		const isR1FormatRequired = this.options.openAiModelInfo?.isR1FormatRequired ?? false
		const isReasoningModelFamily =
			["o1", "o3", "o4", "gpt-5"].some((prefix) => modelId.includes(prefix)) && !modelId.includes("chat")

		let openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt },
			...convertToOpenAiMessages(messages),
		]
		let temperature: number | undefined = this.options.openAiModelInfo?.temperature ?? openAiModelInfoSaneDefaults.temperature
		let reasoningEffort: ChatCompletionReasoningEffort | undefined
		let maxTokens: number | undefined

		if (this.options.openAiModelInfo?.maxTokens && this.options.openAiModelInfo.maxTokens > 0) {
			maxTokens = Number(this.options.openAiModelInfo.maxTokens)
		} else {
			maxTokens = undefined
		}
		if (modelId.includes("glm-4.7")) {
			maxTokens = 32000
			temperature = 0.7
		}
		if (modelId.includes("kimi-k2.5")) {
			maxTokens = 32000
			temperature = 1.0//The recommended temperature will be 1.0 for Thinking mode and 0.6 for Instant mode.
		}
		if (modelId.includes("glm-5")) {
			maxTokens = 32000
			temperature = 0.5
		}

		if (isDeepseekReasoner || isR1FormatRequired) {
			openAiMessages = convertToR1Format([{ role: "user", content: systemPrompt }, ...messages])
		}

		if (isReasoningModelFamily) {
			openAiMessages = [{ role: "developer", content: systemPrompt }, ...convertToOpenAiMessages(messages)]
			temperature = undefined // does not support temperature
			reasoningEffort = (this.options.reasoningEffort as ChatCompletionReasoningEffort) || "medium"
		}

		const stream = await this.client.chat.completions.create(
			{
				model: modelId,
				messages: openAiMessages,
				temperature,
				max_tokens: maxTokens,
				reasoning_effort: reasoningEffort,
				stream: true,
				stream_options: { include_usage: true },
				tools: tools,
				tool_choice: 'auto',
				parallel_tool_calls: false,
				...(modelId.includes("glm-4.7") && {
					chat_template_kwargs: {
						enable_thinking: true,
						clear_thinking: false
					}
				}),
				...(modelId.includes("glm-5") && {
					chat_template_kwargs: {
						enable_thinking: true,
						clear_thinking: false
					}
				}),
				...(modelId.includes("kimi-k2.5") && {
					chat_template_kwargs: {
						enable_thinking: true,
						// clear_thinking: false
					}
				})
			} as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming & { chat_template_kwargs?: any },
			{
				headers: {
					"X-Codee-Token": EncryptUtil.encrypt(this.options.openAiApiKey ?? ""),
					"X-Codee-Ver": "CodeeVsCodeExtension/" + getPluginVersion(),
				},
			},
		) as any

		const toolCallProcessor = new ToolCallProcessor()

		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta
			const choice = chunk.choices[0]
			
			// 处理文本内容
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}

			// 处理推理内容
			if (delta && "reasoning_content" in delta && delta.reasoning_content) {
				yield {
					type: "reasoning",
					reasoning: (delta.reasoning_content as string | undefined) || "",
				}
			}

			if (delta?.tool_calls) {
				yield* toolCallProcessor.processToolCallDeltas(delta.tool_calls)
			}


			if (chunk.usage && !chunk.choices[0]) {
				// telemetryService.captureTokenUsage(
				// 	"vscode_chat",
				// 	chunk.usage.prompt_tokens,
				// 	chunk.usage.completion_tokens,
				// 	modelId,
				// )
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
					// @ts-ignore-next-line
					cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens || 0,
					// @ts-ignore-next-line
					cacheWriteTokens: chunk.usage.prompt_cache_miss_tokens || 0,
				}
			}
		}
	}

	getModel(): { id: string; info: ModelInfo } {
		return {
			id: this.options.codeeModelId ?? "",
			info: this.options.openAiModelInfo ?? openAiModelInfoSaneDefaults,
		}
	}
}
