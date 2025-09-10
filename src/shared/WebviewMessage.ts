import { CodeeConfig } from "@continuedev/core/util/codaiConfigUtil"

export interface WebviewMessage {
	type: "grpc_request" 
		| "grpc_request_cancel"
		| "updateAutocompleteConfig"
		| "getAutocompleteConfig"
		| "autocompleteConfig"
		| "getLanguageConfig"
		| "updateLanguageConfig"
		| "languageConfig"
		| "enhancePrompt"
	grpc_request?: GrpcRequest
	grpc_request_cancel?: GrpcCancel
	text?: string
}

export type GrpcRequest = {
	service: string
	method: string
	message: any // JSON serialized protobuf message
	request_id: string // For correlating requests and responses
	is_streaming: boolean // Whether this is a streaming request
}

export type GrpcCancel = {
	request_id: string // ID of the request to cancel
	// For autocomplete config
	autocompleteConfig?: Partial<CodeeConfig>
	language?: string
}

export type ClineAskResponse = "yesButtonClicked" | "noButtonClicked" | "messageResponse"

export type ClineCheckpointRestore = "task" | "workspace" | "taskAndWorkspace"

export type TaskFeedbackType = "thumbs_up" | "thumbs_down"
