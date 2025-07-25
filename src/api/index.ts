import { Anthropic } from "@anthropic-ai/sdk"
import { ApiConfiguration, ModelInfo } from "../shared/api"
import { AnthropicHandler } from "./providers/anthropic"
import { AwsBedrockHandler } from "./providers/bedrock"
import { OpenRouterHandler } from "./providers/openrouter"
import { VertexHandler } from "./providers/vertex"
import { OpenAiHandler } from "./providers/openai"
import { OllamaHandler } from "./providers/ollama"
import { LmStudioHandler } from "./providers/lmstudio"
import { GeminiHandler } from "./providers/gemini"
import { GeminiCliHandler } from "./providers/gemini-cli"
import { OpenAiNativeHandler } from "./providers/openai-native"
import { ApiStream, ApiStreamUsageChunk } from "./transform/stream"
import { DeepSeekHandler } from "./providers/deepseek"
import { RequestyHandler } from "./providers/requesty"
import { TogetherHandler } from "./providers/together"
import { NebiusHandler } from "./providers/nebius"
import { QwenHandler } from "./providers/qwen"
import { MistralHandler } from "./providers/mistral"
import { DoubaoHandler } from "./providers/doubao"
import { VsCodeLmHandler } from "./providers/vscode-lm"
import { ClineHandler } from "./providers/cline"
import { LiteLlmHandler } from "./providers/litellm"
import { FireworksHandler } from "./providers/fireworks"
import { AskSageHandler } from "./providers/asksage"
import { XAIHandler } from "./providers/xai"
import { SambanovaHandler } from "./providers/sambanova"
import { CerebrasHandler } from "./providers/cerebras"
import { SapAiCoreHandler } from "./providers/sapaicore"
import { ClaudeCodeHandler } from "./providers/claude-code"

import {
	//huqb
	VALUE_API_PROVIDER,
	VALUE_OPENAI_BASE_URL,
	VALUE_OPENAI_API_KEY,
	VALUE_OPENAI_MODEL_ID,
	VALUE_AUTOCOMPLETE_MODEL_ID,
} from "../../webview-ui/src/values"
import { EncryptUtil } from "../utils/encrypt"

export interface ApiHandler {
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
	getModel(): { id: string; info: ModelInfo }
	getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>
}

export interface SingleCompletionHandler {
	completePrompt(prompt: string): Promise<string>
}

function createHandlerForProvider(apiProvider: string | undefined, options: any): ApiHandler {
	switch (apiProvider) {
		case "anthropic":
			return new AnthropicHandler(options)
		case "openrouter":
			return new OpenRouterHandler(options)
		case "bedrock":
			return new AwsBedrockHandler(options)
		case "vertex":
			return new VertexHandler(options)
		case "openai":
			return new OpenAiHandler(options)
		case "ollama":
			return new OllamaHandler(options)
		case "lmstudio":
			return new LmStudioHandler(options)
		case "gemini":
			return new GeminiHandler(options)
		case "gemini-cli":
			return new GeminiCliHandler(options)
		case "openai-native":
			return new OpenAiNativeHandler(options)
		case "deepseek":
			return new DeepSeekHandler(options)
		case "requesty":
			return new RequestyHandler(options)
		case "fireworks":
			return new FireworksHandler(options)
		case "together":
			return new TogetherHandler(options)
		case "qwen":
			return new QwenHandler(options)
		case "doubao":
			return new DoubaoHandler(options)
		case "mistral":
			return new MistralHandler(options)
		case "vscode-lm":
			return new VsCodeLmHandler(options)
		case "cline":
			return new ClineHandler(options)
		case "litellm":
			return new LiteLlmHandler(options)
		case "nebius":
			return new NebiusHandler(options)
		case "asksage":
			return new AskSageHandler(options)
		case "xai":
			return new XAIHandler(options)
		case "sambanova":
			return new SambanovaHandler(options)
		case "cerebras":
			return new CerebrasHandler(options)
		case "sapaicore":
			return new SapAiCoreHandler(options)
		case "claude-code":
			return new ClaudeCodeHandler(options)
		default:
			return new AnthropicHandler(options)
	}
}

export function buildApiHandler(configuration: ApiConfiguration): ApiHandler {
	const { apiProvider, ...options } = configuration

	// Validate thinking budget tokens against model's maxTokens to prevent API errors
	// wrapped in a try-catch for safety, but this should never throw
	try {
		if (options.thinkingBudgetTokens && options.thinkingBudgetTokens > 0) {
			const handler = createHandlerForProvider(apiProvider, options)

			const modelInfo = handler.getModel().info
			if (modelInfo.maxTokens && options.thinkingBudgetTokens > modelInfo.maxTokens) {
				const clippedValue = modelInfo.maxTokens - 1
				options.thinkingBudgetTokens = clippedValue
			} else {
				return handler // don't rebuild unless its necessary
			}
		}
	} catch (error) {
		console.error("buildApiHandler error:", error)
	}

	return createHandlerForProvider(apiProvider, options)
}
