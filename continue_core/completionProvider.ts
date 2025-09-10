import { CompletionProvider } from "./autocomplete/CompletionProvider"
import { processSingleLineCompletion } from "./autocomplete/util/processSingleLineCompletion"
import { type AutocompleteInput, type AutocompleteOutcome } from "./autocomplete/util/types"
import { ConfigHandler } from "./config/ConfigHandler"
import * as URI from "uri-js"
import { v4 as uuidv4 } from "uuid"
import * as vscode from "vscode"
import OpenAI from "./llm/llms/OpenAI"

import { getDefinitionsFromLsp } from "./lsp"
import { RecentlyEditedTracker } from "./recentlyEdited"
import { RecentlyVisitedRangesService } from "./RecentlyVisitedRangesService"
import { StatusBarStatus, getStatusBarStatus, setupStatusBar, stopStatusBarLoading } from "./statusBar"

import type { IDE } from "./"
import { handleLLMError } from "./util/errorHandling"
import { VsCodeWebviewProtocol } from "./webviewProtocol"
import { VsCodeIde } from "./VsCodeIde"
import { getAutocompleteConfig } from "./util/codaiConfigUtil"
import { InProcessMessenger } from "./protocol/messenger"
import { FromCoreProtocol, ToCoreProtocol } from "./protocol"
import { Core } from "./core"
import { getControlPlaneSessionInfo, WorkOsAuthProvider } from "./util/stubs/WorkOsAuthProvider"
import { AesUtil } from "./util/aesutil"

interface VsCodeCompletionInput {
	document: vscode.TextDocument
	position: vscode.Position
	context: vscode.InlineCompletionContext
}

export class ContinueCompletionProvider implements vscode.InlineCompletionItemProvider {
	private onError(e: any) {
		console.log("######,1", e)
		if (handleLLMError(e)) {
			return
		}
	}

	private completionProvider: CompletionProvider
	private recentlyVisitedRanges: RecentlyVisitedRangesService
	private recentlyEditedTracker = new RecentlyEditedTracker()

	webviewProtocol: Promise<VsCodeWebviewProtocol>
	private configHandler: ConfigHandler
	private ide: IDE
	private core: Core

	constructor(context: vscode.ExtensionContext) {
		console.log("##### ContinueCompletionProvider 构造函数开始")
		let resolveWebviewProtocol: any = undefined
		this.webviewProtocol = new Promise<VsCodeWebviewProtocol>((resolve) => {
			resolveWebviewProtocol = resolve
		})
		this.ide = new VsCodeIde(this.webviewProtocol, context)

		console.log("##### IDE初始化完成:", this.ide)

		const inProcessMessenger = new InProcessMessenger<ToCoreProtocol, FromCoreProtocol>()

		// 注册必要的消息处理器
		inProcessMessenger.externalOn("getIdeInfo", async () => {
			return this.ide.getIdeInfo()
		})

		inProcessMessenger.externalOn("getIdeSettings", async () => {
			return this.ide.getIdeSettings()
		})

		inProcessMessenger.externalOn("getControlPlaneSessionInfo", async (msg) => {
			return getControlPlaneSessionInfo(msg.data.silent, msg.data.useOnboarding)
		})

		inProcessMessenger.externalOn("indexProgress", async () => {
			return undefined
		})

		this.core = new Core(inProcessMessenger, this.ide)
		this.configHandler = this.core.configHandler

		this.recentlyVisitedRanges = new RecentlyVisitedRangesService(this.ide)

		async function getAutocompleteModel(this: any) {
			console.log("##### 开始初始化自动补全模型")
			//CodeeLogger.writeLog("##### 开始初始化自动补全模型");
			const { getAutocompleteConfig } = require("./util/codaiConfigUtil")
			let config = getAutocompleteConfig()

			console.log("##### 使用配置中的模型:", config)
			//CodeeLogger.writeLog("##### 使用配置中的模型:" + config.model + ", apibase:" + config.apiBase);
			// config.apiKey = config.apiKey ? AesUtil.aesDecrypt(config.apiKey) : ""
			// config.apiBase = config.apiBase ? AesUtil.aesDecrypt(config.apiBase) : ""
			return {
				title: config.title || "Qwen2.5-3B",
				provider: config.provider || "openai",
				providerName: config.provider || "openai",
				model: config.model,
				apiKey: config.apiKey || "",
				apiBase: config.apiBase || "",
				contextLength: 8192,
				useLegacyCompletionsEndpoint: true,
				completionOptions: {
					model: config.model || "qwen3b-coder",
					temperature: 0.01,
					maxTokens: 4096,
				},
				systemMessage: "You are a helpful AI assistant specialized in code completion.",
			}
		}

		this.completionProvider = new CompletionProvider(
			this.configHandler,
			this.ide,
			async () => {
				console.log("##### 开始获取自动补全模型")
				const model = await getAutocompleteModel.call(this)
				console.log("##### 获取到的自动补全模型:", model)
				if (!model) {
					return undefined
				}
				console.log("##### 创建OpenAI实例")
				const llm = new OpenAI(model)
				console.log("##### OpenAI实例创建完成:", llm)
				return llm
			},
			this.onError.bind(this),
			getDefinitionsFromLsp,
		)
		console.log("##### CompletionProvider初始化完成：", this.completionProvider)
	}

	_lastShownCompletion: AutocompleteOutcome | undefined

	public async provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken,
		//@ts-ignore
	): ProviderResult<InlineCompletionItem[] | InlineCompletionList> {
		// console.log("##### 开始处理补全请求");
		let enableTabAutocomplete = false
		const config = getAutocompleteConfig()
		if (config) {
			enableTabAutocomplete = config.enable
		}
		// console.log("##### 自动补全状态:", enableTabAutocomplete);
		if (token.isCancellationRequested || !enableTabAutocomplete) {
			console.log("##### 补全被禁用或取消")
			return null
		}

		if (document.uri.scheme === "vscode-scm") {
			console.log("##### 不支持在源代码管理视图中补全")
			return null
		}

		// Don't autocomplete with multi-cursor
		const editor = vscode.window.activeTextEditor
		if (editor && editor.selections.length > 1) {
			console.log("##### 不支持多光标补全")
			return null
		}

		const selectedCompletionInfo = context.selectedCompletionInfo
		// console.log("##### 选中的补全信息:", selectedCompletionInfo);

		// This code checks if there is a selected completion suggestion in the given context and ensures that it is valid
		// To improve the accuracy of suggestions it checks if the user has typed at least 4 characters
		// This helps refine and filter out irrelevant autocomplete options
		if (selectedCompletionInfo) {
			const { text, range } = selectedCompletionInfo
			const typedText = document.getText(range)
			// console.log("##### 已输入文本:", typedText);

			const typedLength = range.end.character - range.start.character
			// console.log("##### 输入长度:", typedLength);

			if (typedLength < 4) {
				console.log("##### 输入长度小于4，不进行补全")
				return null
			}

			if (!text.startsWith(typedText)) {
				console.log("##### 文本不匹配，不进行补全")
				return null
			}
		}
		let injectDetails: string | undefined = undefined

		try {
			const abortController = new AbortController()
			const signal = abortController.signal
			token.onCancellationRequested(() => abortController.abort())

			// Handle notebook cells
			const pos = {
				line: position.line,
				character: position.character,
			}
			console.log("##### 当前位置:", pos)

			let manuallyPassFileContents: string | undefined = undefined
			if (document.uri.scheme === "vscode-notebook-cell") {
				const notebook = vscode.workspace.notebookDocuments.find((notebook) =>
					notebook.getCells().some((cell) => URI.equal(cell.document.uri.toString(), document.uri.toString())),
				)
				if (notebook) {
					const cells = notebook.getCells()
					manuallyPassFileContents = cells
						.map((cell) => {
							const text = cell.document.getText()
							if (cell.kind === vscode.NotebookCellKind.Markup) {
								return `"""${text}"""`
							} else {
								return text
							}
						})
						.join("\n\n")
					for (const cell of cells) {
						if (URI.equal(cell.document.uri.toString(), document.uri.toString())) {
							break
						} else {
							pos.line += cell.document.getText().split("\n").length + 1
						}
					}
				}
			}

			// Manually pass file contents for unsaved, untitled files
			if (document.isUntitled) {
				manuallyPassFileContents = document.getText()
			}

			// Handle commit message input box
			let manuallyPassPrefix: string | undefined = undefined

			const input: AutocompleteInput = {
				pos,
				manuallyPassFileContents,
				manuallyPassPrefix,
				selectedCompletionInfo,
				injectDetails,
				isUntitledFile: document.isUntitled,
				completionId: uuidv4(),
				filepath: document.uri.toString(),
				recentlyVisitedRanges: this.recentlyVisitedRanges.getSnippets(),
				recentlyEditedRanges: await this.recentlyEditedTracker.getRecentlyEditedRanges(),
			}
			// console.log("##### 准备请求补全，input:", input);

			setupStatusBar(undefined, true)
			// console.log("##### 开始调用completionProvider.provideInlineCompletionItems");
			const outcome = await this.completionProvider.provideInlineCompletionItems(input, signal)
			// console.log("##### 补全结果:", outcome);

			if (!outcome || !outcome.completion) {
				console.log("##### 没有补全结果")
				return null
			}

			// VS Code displays dependent on selectedCompletionInfo (their docstring below)
			// We should first always make sure we have a valid completion, but if it goes wrong we
			// want telemetry to be correct
			/**
			 * Provides information about the currently selected item in the autocomplete widget if it is visible.
			 *
			 * If set, provided inline completions must extend the text of the selected item
			 * and use the same range, otherwise they are not shown as preview.
			 * As an example, if the document text is `console.` and the selected item is `.log` replacing the `.` in the document,
			 * the inline completion must also replace `.` and start with `.log`, for example `.log()`.
			 *
			 * Inline completion providers are requested again whenever the selected item changes.
			 */
			if (selectedCompletionInfo) {
				outcome.completion = selectedCompletionInfo.text + outcome.completion
			}
			const willDisplay = this.willDisplay(document, selectedCompletionInfo, signal, outcome)
			if (!willDisplay) {
				return null
			}

			// Mark displayed
			this.completionProvider.markDisplayed(input.completionId, outcome)
			this._lastShownCompletion = outcome

			// Construct the range/text to show
			const startPos = selectedCompletionInfo?.range.start ?? position
			let range = new vscode.Range(startPos, startPos)
			let completionText = outcome.completion
			const isSingleLineCompletion = outcome.completion.split("\n").length <= 1

			if (isSingleLineCompletion) {
				const lastLineOfCompletionText = completionText.split("\n").pop() || ""
				const currentText = document.lineAt(startPos).text.substring(startPos.character)

				const result = processSingleLineCompletion(lastLineOfCompletionText, currentText, startPos.character)

				if (result === undefined) {
					return undefined
				}

				completionText = result.completionText
				if (result.range) {
					range = new vscode.Range(
						new vscode.Position(startPos.line, result.range.start),
						new vscode.Position(startPos.line, result.range.end),
					)
				}
			} else {
				// Extend the range to the end of the line for multiline completions
				range = new vscode.Range(startPos, document.lineAt(startPos).range.end)
			}

			const completionItem = new vscode.InlineCompletionItem(completionText, range, {
				title: "Log Autocomplete Outcome",
				command: "continue.logAutocompleteOutcome",
				arguments: [input.completionId, this.completionProvider],
			})

			;(completionItem as any).completeBracketPairs = true
			return [completionItem]
		} finally {
			stopStatusBarLoading()
		}
	}

	willDisplay(
		document: vscode.TextDocument,
		selectedCompletionInfo: vscode.SelectedCompletionInfo | undefined,
		abortSignal: AbortSignal,
		outcome: AutocompleteOutcome,
	): boolean {
		if (selectedCompletionInfo) {
			const { text, range } = selectedCompletionInfo
			if (!outcome.completion.startsWith(text)) {
				console.log(`Won't display completion because text doesn't match: ${text}, ${outcome.completion}`, range)
				return false
			}
		}

		if (abortSignal.aborted) {
			return false
		}

		return true
	}
}
