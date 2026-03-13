import { setCodeIndexSettingsRequest } from "@/generated/nice-grpc/cline/codeindex"
import { Controller } from ".."
import { StreamingResponseHandler } from "../grpc-handler"
import { Boolean } from "@shared/proto/cline/common"
import { sendCodeIndexingStatus } from "./getIndexingStatus"
import { DEFAULT_CODEBASE_INDEX_CONFIG } from "@/services/code-index/constants"
import { Session } from "@/shared/services/Session"

export async function setCodeIndexSettings(
	controller: Controller,
	request: setCodeIndexSettingsRequest,
	responseStream: StreamingResponseHandler<Boolean>,
): Promise<void> {
	if (!request) {
		return
	}
	let sessionId = Session.get().getSessionId()

	try {
		// Check if embedder provider has changed
		const currentConfig = controller.stateManager.getGlobalStateKey("codebaseIndexConfig") || {}
		if (!request.codebaseIndexEmbedderProvider) {
			request.codebaseIndexEmbedderProvider = DEFAULT_CODEBASE_INDEX_CONFIG.codebaseIndexEmbedderProvider
		}
		const embedderProviderChanged = currentConfig.codebaseIndexEmbedderProvider !== request.codebaseIndexEmbedderProvider

		// Save global state request atomically
		const globalStateConfig = {
			...currentConfig,
			...request,
			// codebaseIndexEnabled: request.codebaseIndexEnabled,
			// codebaseIndexQdrantUrl: request.codebaseIndexQdrantUrl,
			// codebaseIndexEmbedderProvider: request.codebaseIndexEmbedderProvider,
			// codebaseIndexEmbedderBaseUrl: request.codebaseIndexEmbedderBaseUrl,
			// codebaseIndexEmbedderModelId: request.codebaseIndexEmbedderModelId,
			// codebaseIndexEmbedderModelDimension: request.codebaseIndexEmbedderModelDimension, // Generic dimension
			// codebaseIndexOpenAiCompatibleBaseUrl: request.codebaseIndexOpenAiCompatibleBaseUrl,
			// codebaseIndexSearchMaxResults: request.codebaseIndexSearchMaxResults,
			// codebaseIndexSearchMinScore: request.codebaseIndexSearchMinScore,
		}

		// Save global state first
		controller.stateManager.setGlobalState("codebaseIndexConfig", globalStateConfig)

		// Save secrets directly using context proxy //huqb 所有的apikey都是通过codeIndexOpenAiKey来传递
		if (request.codeIndexOpenAiKey !== undefined) {
			controller.stateManager.setSecret("codeIndexOpenAiKey", request.codeIndexOpenAiKey)
		} else {
			controller.stateManager.setSecret("codeIndexOpenAiKey", "")
		}
		if (request.codeIndexQdrantApiKey !== undefined) {
			controller.stateManager.setSecret("codeIndexQdrantApiKey", request.codeIndexQdrantApiKey)
		} else {
			controller.stateManager.setSecret("codeIndexQdrantApiKey", "")
		}
		// if (request.codebaseIndexOpenAiCompatibleApiKey !== undefined) {
		// 	controller.stateManager.setSecret("codebaseIndexOpenAiCompatibleApiKey", request.codebaseIndexOpenAiCompatibleApiKey)
		// }

		// Send success response first - request are saved regardless of validation
		await responseStream({
			value: true,
		})

		// Update webview state
		await controller.postStateToWebview()

		// Then handle validation and initialization for the current workspace
		const currentCodeIndexManager = await controller.getCurrentWorkspaceCodeIndexManager()
		if (currentCodeIndexManager) {
			// If embedder provider changed, perform proactive validation
			if (embedderProviderChanged) {
				try {
					// Force handleSettingsChange which will trigger validation
					await currentCodeIndexManager.handleSettingsChange()
				} catch (error) {
					// Validation failed - the error state is already set by handleSettingsChange
					// provider.log(
					//   `Embedder validation failed after provider change: ${error instanceof Error ? error.message : String(error)}`,
					// )
					// Send validation error to webview
					await sendCodeIndexingStatus(sessionId, currentCodeIndexManager.getCurrentStatus())
				}
			} else {
				// No provider change, just handle request normally
				try {
					await currentCodeIndexManager.handleSettingsChange()
				} catch (error) {
					console.log("handleSettingsChange error222", error)
					// Log but don't fail - request are saved
					// provider.log(
					//   `Settings change handling error: ${error instanceof Error ? error.message : String(error)}`,
					// )
				}
			}

			// Wait a bit more to ensure everything is ready
			await new Promise((resolve) => setTimeout(resolve, 200))

			// Auto-start indexing if now enabled and configured
			if (currentCodeIndexManager.isFeatureEnabled && currentCodeIndexManager.isFeatureConfigured) {
				if (!currentCodeIndexManager.isInitialized) {
					try {
						await currentCodeIndexManager.initialize(controller.stateManager)
					} catch (error) {
						// Send error status to webview
						await sendCodeIndexingStatus(sessionId, currentCodeIndexManager.getCurrentStatus())
					}
				}
			}
		} else {
			// No workspace open - send error status
			await sendCodeIndexingStatus(sessionId, {
				systemStatus: "Error",
				message: "indexingRequiresWorkspace",
				processedItems: 0,
				totalItems: 0,
				currentItemUnit: "items",
			})
		}
		await responseStream({
			value: true,
		})
	} catch (error) {
		console.log("setCodeIndexSettings error: ", error.message || error)
		await responseStream({
			value: false,
		})
	}
}
