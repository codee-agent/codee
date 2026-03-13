import { EmptyRequest, Empty } from "@/generated/nice-grpc/cline/common"
import { Controller } from ".."
import { sendCodeIndexingStatus } from "./getIndexingStatus"
import { Session } from "@/shared/services/Session"

export async function startIndexing(controller: Controller, _request: EmptyRequest): Promise<Empty> {
	try {
		const manager = await controller.getCurrentWorkspaceCodeIndexManager()
		if (!manager) {
			sendCodeIndexingStatus(Session.get().getSessionId(), {
				systemStatus: "Error",
				message: "indexingRequiresWorkspace",
				processedItems: 0,
				totalItems: 0,
				currentItemUnit: "items",
			})
			return {}
		}
		console.log("startindexing", manager)
		if (manager.isFeatureConfigured && manager.isFeatureEnabled) {
			if (!manager.isInitialized) {
				await manager.initialize(controller.stateManager)
			}
			// startIndexing now handles error recovery internally
			manager.startIndexing()

			// If startIndexing recovered from error, we need to reinitialize
			if (!manager.isInitialized) {
				await manager.initialize(controller.stateManager)
				// Try starting again after initialization
				manager.startIndexing()
			}
		}
	} catch (error) {
		console.log(`Error starting indexing: ${error instanceof Error ? error.message : String(error)}`)
	}
	return {}
}
