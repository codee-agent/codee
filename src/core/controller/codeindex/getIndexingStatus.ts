import { EmptyRequest } from "@/generated/nice-grpc/cline/common"
import { indexingStatusResponse } from "@/shared/proto/cline/codeindex"
import { Controller } from ".."
import { StreamingResponseHandler } from "../grpc-handler"
import { Session } from "@/shared/services/Session"

// Keep track of active code index status subscriptions by controller ID
const activeCodeIndexStatusSubscriptions = new Map<string, StreamingResponseHandler<indexingStatusResponse>>()

export async function getIndexingStatus(
	controller: Controller,
	_request: EmptyRequest,
	responseStream: StreamingResponseHandler<indexingStatusResponse>,
): Promise<void> {
	const manager = await controller.getCurrentWorkspaceCodeIndexManager()
	activeCodeIndexStatusSubscriptions.set(Session.get().getSessionId(), responseStream)
	if (!manager) {
		await responseStream({
			systemStatus: "Error",
			message: "indexingRequiresWorkspace",
			processedItems: 0,
			totalItems: 0,
			currentItemUnit: "items",
			workerspacePath: undefined,
		})
	}
	const status = manager
		? manager.getCurrentStatus()
		: {
				systemStatus: "Standby",
				message: "No workspace folder open",
				processedItems: 0,
				totalItems: 0,
				currentItemUnit: "items",
				workspacePath: undefined,
			}
	await responseStream(status)
}

export async function sendCodeIndexingStatus(controllerId: string, status: indexingStatusResponse): Promise<void> {
	const responseStream = activeCodeIndexStatusSubscriptions.get(controllerId)
	if (!responseStream) {
		console.log(`[DEBUG] No active state subscription for controller ${controllerId}`)
		return
	}

	try {
		await responseStream(status)
	} catch (error) {
		console.error(`Error sending code indexing status to controller ${controllerId}:`, error)
		// Remove the subscription if there was an error
		activeCodeIndexStatusSubscriptions.delete(controllerId)
	}
}
