import { Controller } from ".."
import { Empty, StringRequest } from "../../../shared/proto/common"
import * as vscode from "vscode"
import { getMcpPath } from "@core/storage/disk"
import { getCodeIndexMcpDownloadUrl } from "@/services/mcp/CodeIndexMcp"

/**
 * Opens mcp
 * @param controller The controller instance
 * @param request The string request containing the mention text
 * @returns Empty response
 */
export async function openMcpMention(controller: Controller, request: StringRequest): Promise<Empty> {
	if (request.value === "download") {
		let downloadUrl = getCodeIndexMcpDownloadUrl()
		if (!downloadUrl) {
			return Empty.create()
		}
		vscode.env.openExternal(vscode.Uri.parse(downloadUrl))
	} else {
		vscode.env.openExternal(vscode.Uri.file(await getMcpPath()))
	}
	return Empty.create()
}
