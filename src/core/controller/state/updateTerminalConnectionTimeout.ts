import { Controller } from "../index"
import * as proto from "@/shared/proto"
import { updateGlobalState } from "../../storage/state"

export async function updateTerminalConnectionTimeout(
	controller: Controller,
	request: proto.codee.Int64Request,
): Promise<proto.codee.Int64> {
	const timeoutValue = request.value

	// Update the terminal connection timeout setting in the state
	await updateGlobalState(controller.context, "shellIntegrationTimeout", timeoutValue)

	// Broadcast state update to all webviews
	await controller.postStateToWebview()

	return proto.codee.Int64.create({ value: timeoutValue })
}
