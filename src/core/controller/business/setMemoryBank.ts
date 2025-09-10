import { Controller } from ".."
import { String } from "@/shared/proto/cline/common"
import { hasMemoryBank, createMemorybankDir } from "@/core/storage/disk"
import { StringRequest } from "@/generated/grpc-js/index.cline"
import { getWorkspacePath } from "@utils/path"
import { rulesFileIsActivated, rulesFileWrite } from "@/core/storage/memory-bank"
import { MEMORY_BANK_INSTRUCTIONS } from "@/core/prompts/system-prompt/generic-system-prompt"
import { HostProvider } from "@/hosts/host-provider"
import { ShowMessageType } from "@/shared/proto/host/window"

export async function setMemoryBank(_controller: Controller, request: StringRequest): Promise<String> {
	const workspacePath = await getWorkspacePath()
	if (!workspacePath) {
		HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: "No workspace detected, Please open Codee in a workspace",
		})
		throw new Error("No workspace detected, Please open Codee in a workspace")
	}
	const action = await hasMemoryBank()
	let text = request.value
	console.log("@@@ rcv:", text, action, workspacePath)
	// create dir when memory-bank not exists
	if (text !== "remember") {
		text = "update"
	}
	if (!action) {
		await createMemorybankDir(workspacePath)
		text = "init"
	}

	await rulesFileWrite(MEMORY_BANK_INSTRUCTIONS)
	const isActivate = await rulesFileIsActivated(_controller)
	if (!isActivate) {
		HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: "Please activate memory_bank.md first!",
		})
	}

	console.log("@@@ post:", text)
	return { value: text }
}
