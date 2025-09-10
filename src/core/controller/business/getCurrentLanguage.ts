import { EmptyRequest } from "@/generated/grpc-js/cline/common"
import { String } from "@/shared/proto/cline/common"
import { Controller } from ".."

import { getLanguageConfig } from "@continuedev/core/util/codaiConfigUtil"

// Business logic for getting current language
export async function getCurrentLanguage(_controller: Controller, _: EmptyRequest): Promise<String> {
	// TODO: Implement business logic for getting current language
	const currentLanguage = getLanguageConfig()
	return { value: currentLanguage }
}
