import { EmptyRequest } from "@/generated/nice-grpc/cline/common"
import { Controller } from ".."
import { AutoCompletionResponse } from "@/shared/proto/cline/business"

//huqb
import { getAutocompleteConfig } from "@continuedev/core/util/codaiConfigUtil"

// Business logic for getting auto-completion information
export async function getAutoCompletion(_controller: Controller, _: EmptyRequest): Promise<AutoCompletionResponse> {
	// TODO: Implement business logic for getting auto-completion information
	const config = getAutocompleteConfig()

	return {
		autoCompletion: {
			provider: config.provider,
			title: config.title,
			model: config.model,
			apiKey: config.apiKey,
			enable: config.enable,
			apiBase: config.apiBase,
		},
	}
}
