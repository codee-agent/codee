//huqb
import { updateAutocompleteConfig } from "@continuedev/core/util/codaiConfigUtil"
import { Empty } from "@/generated/grpc-js/cline/common"
import { SetAutoCompletionRequest } from "@/shared/proto/cline/business"
import { Controller } from ".."

// Business logic for setting auto-completion information
export async function setAutoCompletion(_controller: Controller, request: SetAutoCompletionRequest): Promise<Empty> {
	// TODO: Implement business logic for setting auto-completion information
	updateAutocompleteConfig({
		provider: request?.autoCompletion?.provider,
		title: request?.autoCompletion?.title,
		model: request?.autoCompletion?.model,
		apiKey: request?.autoCompletion?.apiKey,
		enable: request?.autoCompletion?.enable,
		apiBase: request?.autoCompletion?.apiBase,
	})

	return {}
}
