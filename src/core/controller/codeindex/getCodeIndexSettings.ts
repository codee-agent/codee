import { EmptyRequest } from "@/generated/nice-grpc/cline/common"
import { getCodeIndexSettingsResponse } from "@/shared/proto/cline/codeindex"
import { Controller } from ".."

export async function getCodeIndexSettings(
	controller: Controller,
	_request: EmptyRequest,
): Promise<getCodeIndexSettingsResponse> {
	try {
		const currentConfig = controller.stateManager?.getGlobalStateKey("codebaseIndexConfig")
		return {
			codebaseIndexEnabled: currentConfig?.codebaseIndexEnabled ?? true,
			codebaseIndexQdrantUrl: currentConfig?.codebaseIndexQdrantUrl ?? undefined,
			codebaseIndexEmbedderProvider: currentConfig?.codebaseIndexEmbedderProvider ?? undefined,
			codebaseIndexEmbedderBaseUrl: currentConfig?.codebaseIndexEmbedderBaseUrl ?? undefined,
			codebaseIndexEmbedderModelId: currentConfig?.codebaseIndexEmbedderModelId ?? undefined,
			codebaseIndexEmbedderModelDimension: currentConfig?.codebaseIndexEmbedderModelDimension ?? undefined,
			codebaseIndexOpenAiCompatibleBaseUrl: currentConfig?.codebaseIndexOpenAiCompatibleBaseUrl ?? undefined,
			codebaseIndexSearchMaxResults: currentConfig?.codebaseIndexSearchMaxResults ?? undefined,
			codebaseIndexSearchMinScore: currentConfig?.codebaseIndexSearchMinScore ?? undefined,
			codeIndexOpenAiKey: currentConfig?.codeIndexOpenAiKey ?? undefined,
			codeIndexQdrantApiKey: currentConfig?.codeIndexQdrantApiKey ?? undefined,
			codebaseIndexOpenAiCompatibleApiKey: currentConfig?.codebaseIndexOpenAiCompatibleApiKey ?? undefined,
			codebaseIndexGeminiApiKey: currentConfig?.codebaseIndexGeminiApiKey ?? undefined,
			codebaseIndexMistralApiKey: currentConfig?.codebaseIndexMistralApiKey ?? undefined,
			codebaseIndexVercelAiGatewayApiKey: currentConfig?.codebaseIndexVercelAiGatewayApiKey ?? undefined,
		}
	} catch (err) {
		return { codebaseIndexEnabled: true }
	}
}
