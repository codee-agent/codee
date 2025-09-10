import { enhancePrompt } from "@/services/enhance_prompts"
import { Controller } from ".."
import { EnhancePromptsRequest } from "@/shared/proto/cline/business"
import { Mode } from "@/shared/storage/types"
import { String } from "@/shared/proto/cline/common"

// Business logic for enhancing prompts
export async function enhancePrompts(_controller: Controller, request: EnhancePromptsRequest): Promise<String> {
	// TODO: Implement business logic for enhancing prompts
	try {
		const mode = request.mode as Mode
		const enhancedText = await enhancePrompt(_controller, mode, request.input)
		return { value: enhancedText }
	} catch (err) {
		console.error("enhancePrompts err:", err)
		return { value: request.input }
	}
}
