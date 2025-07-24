import axios from "axios"
import { getMcpPath } from "@core/storage/disk"
import { existsSync } from "fs"
import path from "path"
import * as fs from "fs"
import * as os from "os"
import * as vscode from "vscode"
import * as compressing from "compressing"
import { ExtensionMessage } from "@shared/ExtensionMessage"

const BaseUrl = "https://github.com/codee-agent/codee/releases/download/v1.3.3/"

export function getCodeIndexMcpDownloadUrl() {
	let downloadUrl = ""
	if (os.platform() === "darwin") {
		if (os.arch() === "arm64") {
			downloadUrl = `${BaseUrl}CodeIndexMCP-mac-arm64.zip`
		} else {
			downloadUrl = `${BaseUrl}CodeIndexMCP-mac-x64.zip`
		}
	} else if (os.platform() === "win32") {
		downloadUrl = `${BaseUrl}CodeIndexMCP-win-x64.zip`
	} else {
		console.log("no platform support")
	}
	return downloadUrl
}

export class CodeIndexMcp {
	async download() {
		let downloadUrl = getCodeIndexMcpDownloadUrl()
		if (!downloadUrl) {
			vscode.window.showErrorMessage("no platform support")
			return {
				status: "error" as const,
			}
		}
		let fileName = downloadUrl.substring(downloadUrl.lastIndexOf("/") + 1)
		const downloadPath = await getMcpPath()
		const filePath = path.join(downloadPath, fileName)
		const codeIndexPath = path.join(downloadPath, "CodeIndexMCP")
		let hasDownload = false
		if (existsSync(filePath) && !existsSync(codeIndexPath)) {
			// uncompress
			try {
				await compressing.zip.uncompress(filePath, downloadPath)
			} catch (err) {
				console.log("###uncompress code-index error: ", err?.message ?? err)
				return {
					status: "downloadError" as const,
				}
			}
		}
		if (existsSync(codeIndexPath)) {
			hasDownload = true
		}
		if (!hasDownload) {
			// Download file
			let response
			try {
				response = await axios({
					method: "get",
					url: downloadUrl,
					responseType: "stream",
					timeout: 50000, // 50s timeout
				})
			} catch (err) {
				console.log("###download code-index error: ", err?.message ?? err)
				return {
					status: "downloadError" as const,
				}
			}
			try {
				let writer = fs.createWriteStream(filePath)
				await new Promise((resolve, reject) => {
					response.data.pipe(writer)
					writer.on("finish", resolve)
					writer.on("error", reject)
				})
				// uncompress
				await compressing.zip.uncompress(filePath, downloadPath)
			} catch (err) {
				console.log("###uncompress code-index error: ", err?.message ?? err)
				return {
					status: "downloadError" as const,
				}
			}
		}

		return {
			command: codeIndexPath,
			type: "stdio",
			args: [],
			timeout: 60,
			disabled: false,
		}
	}
}
