import { EmptyRequest } from "@/generated/nice-grpc/cline/common"
import { Controller } from ".."
import { HostProvider } from "@/hosts/host-provider"
import { ShowMessageType } from "@/shared/proto/host/window"
import { Empty } from "@/generated/grpc-js/cline/common"

export async function clearIndexData(controller: Controller, _request: EmptyRequest): Promise<Empty> {
	try {
		const manager = await controller.getCurrentWorkspaceCodeIndexManager()
		if (!manager) {
			console.log("Cannot clear index data: No workspace folder open")
			HostProvider.window.showMessage({
				type: ShowMessageType.ERROR,
				message: "No workspace detected, Please open Codee in a workspace",
			})
			throw new Error("No workspace detected, Please open Codee in a workspace")
		}
		await manager.clearIndexData()
	} catch (error) {
		console.log(`Error clearing index data: ${error instanceof Error ? error.message : String(error)}`)
		HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: error instanceof Error ? error.message : String(error),
		})
	}
	return {}
}
