//huqb
import { getAllAutocompleteConfig } from "@continuedev/core/util/codaiConfigUtil"
import { EmptyRequest } from "@/generated/nice-grpc/cline/common"
import { AllAutoCompletionResponse } from "@/shared/proto/cline/business"
import { Controller } from ".."

// Business logic for getting auto-completion information
export async function getAllAutoCompletion(_controller: Controller, _: EmptyRequest): Promise<AllAutoCompletionResponse> {
	// TODO: Implement business logic for getting auto-completion information
	const config = getAllAutocompleteConfig()
	return {
		autoCompletion: config.autocomplete || [],
		currentCompleteProvider: config.currentCompleteProvider || "",
	}
}
