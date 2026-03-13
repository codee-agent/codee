import type { ToolUse } from "@core/assistant-message"
import { formatResponse } from "@core/prompts/responses"
import { ClineDefaultTool } from "@/shared/tools"
import type { ToolResponse } from "../../index"
import type { IFullyManagedTool } from "../ToolExecutorCoordinator"
import type { TaskConfig } from "../types/TaskConfig"
import type { StronglyTypedUIHelpers } from "../types/UIHelpers"
import { ToolResultUtils } from "../utils/ToolResultUtils"
import path from "path"
import { getWorkspacePath } from "@/utils/path"
import { CodeIndexManager } from "@services/code-index/manager"
import { VectorStoreSearchResult } from "@services/code-index/interfaces"
import * as vscode from "vscode"
import { createUIHelpers } from "../types/UIHelpers"

export class CodebaseSearchHandler implements IFullyManagedTool {
	readonly name = ClineDefaultTool.CODEBASE_SEARCH

	getDescription(block: ToolUse): string {
		return `[${block.name} for '${block.params.query}']`
	}

	private async getSharedMessageProps(block: ToolUse, uiHelpers: StronglyTypedUIHelpers) {
		const config = uiHelpers.getConfig()
		const workspacePath = config.cwd && config.cwd.trim() !== "" ? config.cwd : await getWorkspacePath()
		if (!workspacePath) {
			throw new Error("Could not determine workspace path.")
		}
		let query: string | undefined = block.params.query
		let directoryPrefix: string | undefined = block.params.path

		query = uiHelpers.removeClosingTag(block, "query", query)

		if (directoryPrefix) {
			directoryPrefix = uiHelpers.removeClosingTag(block, "path", directoryPrefix)
			directoryPrefix = path.normalize(directoryPrefix)
		}

		const sharedMessageProps = {
			tool: "codebaseSearch",
			query: query,
			path: directoryPrefix,
			isOutsideWorkspace: false,
		}
		return sharedMessageProps
	}

	async handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void> {
		const sharedMessageProps = this.getSharedMessageProps(block, uiHelpers)
		await uiHelpers.ask("tool", JSON.stringify(sharedMessageProps), block.partial).catch(() => {})
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		const uiHelpers = createUIHelpers(config)
		const sharedMessageProps = await this.getSharedMessageProps(block, uiHelpers)
		if (!block.params.query) {
			config.taskState.consecutiveMistakeCount++
			return formatResponse.toolResult(await config.callbacks.sayAndCreateMissingParamError(this.name, "query"))
		}

		const didApprove = await ToolResultUtils.askApprovalAndPushFeedback("tool", JSON.stringify(sharedMessageProps), config)

		if (!didApprove) {
			return formatResponse.toolDenied()
		}
		config.taskState.consecutiveMistakeCount = 0

		// --- Core Logic ---
		try {
			if (!config.context) {
				throw new Error("Extension context is not available.")
			}

			const manager = await CodeIndexManager.getInstance(config.context)

			if (!manager) {
				throw new Error("CodeIndexManager is not available.")
			}

			if (!manager.isFeatureEnabled) {
				throw new Error("Code Indexing is disabled in the settings.")
			}
			if (!manager.isFeatureConfigured) {
				throw new Error("Code Indexing is not configured (Missing OpenAI Key or Qdrant URL).")
			}
			let directoryPrefix: string | undefined = block.params.path

			if (directoryPrefix) {
				directoryPrefix = uiHelpers.removeClosingTag(block, "path", directoryPrefix)
				directoryPrefix = path.normalize(directoryPrefix)
			}
			const searchResults: VectorStoreSearchResult[] = await manager.searchIndex(block.params.query, directoryPrefix)
			console.log('codebaseSearchTool searchResults: ', searchResults)

			// 3. Format and push results
			if (!searchResults || searchResults.length === 0) {
				return formatResponse.toolResult(`No relevant code snippets found for the query: "${block.params.query}"`) // Use simple string for no results
			}

			const jsonResult = {
				query: block.params.query,
				results: [],
			} as {
				query: string
				results: Array<{
					filePath: string
					score: number
					startLine: number
					endLine: number
					codeChunk: string
				}>
			}

			searchResults.forEach((result) => {
				if (!result.payload) return
				if (!("filePath" in result.payload)) return

				const relativePath = vscode.workspace.asRelativePath(result.payload.filePath, false)

				jsonResult.results.push({
					filePath: relativePath,
					score: result.score,
					startLine: result.payload.startLine,
					endLine: result.payload.endLine,
					codeChunk: result.payload.codeChunk.trim(),
				})
			})

			// Send results to UI
			const payload = { tool: "codebaseSearch", content: jsonResult }
			await config.callbacks.say("codebase_search_result", JSON.stringify(payload))

			// Push results to AI
			const output = `Query: ${block.params.query}
	Results:

	${jsonResult.results
		.map(
			(result) => `File path: ${result.filePath}
	Score: ${result.score}
	Lines: ${result.startLine}-${result.endLine}
	Code Chunk: ${result.codeChunk}
	`,
		)
		.join("\n")}`

			return formatResponse.toolResult(output)
		} catch (error: any) {
			const { PreToolUseHookCancellationError } = await import("@core/hooks/PreToolUseHookCancellationError")
			if (error instanceof PreToolUseHookCancellationError) {
				return formatResponse.toolDenied()
			}
			throw error
		}
	}
}
