import { Empty } from "@/generated/nice-grpc/cline/common"
import { Controller } from ".."
import { SetCurrentLanguageRequest } from "@/shared/proto/cline/business"

import { updateLanguageConfig } from "@continuedev/core/util/codaiConfigUtil"

// Business logic for setting current language
export async function setCurrentLanguage(_controller: Controller, request: SetCurrentLanguageRequest): Promise<Empty> {
	// TODO: Implement business logic for setting current language
	updateLanguageConfig(request.language)
	return {}
}
