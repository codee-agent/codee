import { useRef, useState, useEffect, useCallback } from "react"
import { useEvent, useClickAway, useWindowSize } from "react-use"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { useTranslation } from "react-i18next"
import { vscode } from "@/utils/vscode"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { FileServiceClient, McpServiceClient } from "@/services/grpc-client"
import { EmptyRequest, StringRequest } from "@shared/proto/common"

interface AdvancedAbilitiesModalProps {
	isVisible: boolean
	setIsVisible: (visible: boolean) => void
	buttonRef: React.RefObject<HTMLDivElement>
	hasMemoryBank: boolean | undefined
	setHasMemoryBank: (value: boolean) => void
}

const AdvancedAbilitiesModal: React.FC<AdvancedAbilitiesModalProps> = ({
	isVisible,
	setIsVisible,
	buttonRef,
	hasMemoryBank,
	setHasMemoryBank,
}) => {
	const { t } = useTranslation()
	const modalRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const [progress, setProgress] = useState(0)
	const [isPolling, setIsPolling] = useState(true)
	const [isSuccess, setIsSuccess] = useState(false)
	const [isTimeout, setIsTimeout] = useState(false)
	const [refreshDisabled, setRefreshDisabled] = useState(false)
	const [codeIndexState, setCodeIndexState] = useState<string | null | undefined>(null)

	const handleMemorybank = (text: string) => {
		vscode.postMessage({
			type: "memoryBank",
			text,
		})
		setIsVisible(false)
	}

	const handleConfigIndex = () => {
		vscode.postMessage({
			type: "refreshCodeIndex",
		})
		setRefreshDisabled(true)
	}

	const handleClick = (name: "download" | "open") => {
		McpServiceClient.openMcpMention(StringRequest.create({ value: name }))
	}

	useEffect(() => {
		if (isVisible) {
			vscode.postMessage({
				type: "getMemoryBank",
			})
		}
	}, [isVisible])
	useEffect(() => {
		// Start polling for code index state
		const interval = setInterval(() => {
			vscode.postMessage({
				type: "getCodeIndexState",
			})
		}, 2000)

		return () => clearInterval(interval)
	}, [])

	const handleMessage = useCallback((event: MessageEvent) => {
		const message: ExtensionMessage = event.data
		switch (message.type) {
			case "hasMemoryBank": {
				setHasMemoryBank(message.hasMemoryBank ?? false)
				break
			}
			case "getCodeIndexState": {
				console.log("===========getCodeIndexState, ", message)
				setCodeIndexState(message.codeIndexState?.status)
				if (message.codeIndexState?.status === "indexing") {
					setProgress(message.codeIndexState?.percent ?? 90)
				}
				if (message.codeIndexState?.status === "success") {
					setProgress(100)
					setIsSuccess(true)
				}
				break
			}
			case "refreshCodeIndex": {
				setRefreshDisabled(false)
				setIsVisible(false)
			}
		}
	}, [])

	useEvent("message", handleMessage)
	useClickAway(modalRef, (e) => {
		if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
			return
		}
		setIsVisible(false)
	})

	useEffect(() => {
		if (isVisible && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			const buttonCenter = buttonRect.left + buttonRect.width / 2
			const rightPosition = document.documentElement.clientWidth - buttonCenter - 5
			setArrowPosition(rightPosition)
			setMenuPosition(buttonRect.top + 1)
		}
	}, [isVisible, viewportWidth, viewportHeight, buttonRef])

	if (!isVisible) return null

	return (
		<div ref={modalRef}>
			<div
				className="fixed left-[15px] right-[15px] border border-[var(--vscode-editorGroup-border)] p-3 rounded z-[1000] overflow-y-auto"
				style={{
					bottom: `calc(100vh - ${menuPosition}px + 6px)`,
					background: CODE_BLOCK_BG_COLOR,
					maxHeight: "calc(100vh - 100px)",
					overscrollBehavior: "contain",
				}}>
				<div
					className="fixed w-[10px] h-[10px] z-[-1] rotate-45 border-r border-b border-[var(--vscode-editorGroup-border)]"
					style={{
						bottom: `calc(100vh - ${menuPosition}px)`,
						right: arrowPosition,
						background: CODE_BLOCK_BG_COLOR,
					}}
				/>

				<div className="flex justify-between items-center mb-3">
					<div className="text-base font-semibold mb-1">{t("advanced.title")}</div>
					<VSCodeButton appearance="icon" onClick={() => setIsVisible(false)}>
						<span className="codicon codicon-close text-[10px]"></span>
					</VSCodeButton>
				</div>

				<div className="mb-2.5">
					<span className="text-[color:var(--vscode-foreground)] font-medium">{t("advanced.memorybank.title")}:</span>
				</div>
				<p className="mb-3">{t("advanced.memorybank.description")}</p>

				<VSCodeButton appearance="primary" className="w-full mb-2" onClick={() => handleMemorybank("auto")}>
					{hasMemoryBank ? t("advanced.memorybank.update") : t("advanced.memorybank.init")}
				</VSCodeButton>

				{hasMemoryBank && (
					<VSCodeButton appearance="primary" className="w-full" onClick={() => handleMemorybank("remember")}>
						{t("advanced.memorybank.remember")}
					</VSCodeButton>
				)}

				<div className="mt-6 mb-2.5">
					<span className="text-[color:var(--vscode-foreground)] font-medium">{t("advanced.codeIndex.title")}:</span>
				</div>
				<p className="mb-3">{t("advanced.codeIndex.description")}</p>

				{codeIndexState === "downloadError" ? (
					<div className="text-sm text-yellow-500 mb-4">
						{t("advanced.codeIndex.downloadError")}
						<span
							className="text-blue-500 cursor-pointer hover:underline ml-1"
							onClick={() => handleClick("download")}>
							{t("advanced.codeIndex.downloadErrorClick")}
						</span>
						{t("advanced.codeIndex.downloadErrorDownload")}
						<span className="text-blue-500 cursor-pointer hover:underline ml-1" onClick={() => handleClick("open")}>
							{t("advanced.codeIndex.downloadErrorClick")}
						</span>
						{t("advanced.codeIndex.downloadErrorOpen")}
					</div>
				) : codeIndexState === "disabled" ? (
					<div className="text-sm text-yellow-500 mb-4">{t("advanced.codeIndex.disabled")}</div>
				) : codeIndexState === "error" ? (
					<div className="text-sm text-red-500 mb-4">{t("advanced.codeIndex.error")}</div>
				) : codeIndexState === "no_workspace" ? (
					<div className="text-sm text-yellow-500 mb-4">{t("advanced.codeIndex.no_workspace")}</div>
				) : (
					<>
						<div className="w-full mb-4">
							<div className="flex justify-between text-xs mb-1">
								{progress >= 100 && isSuccess ? <span>Progress complete</span> : <span>Progressing...</span>}
								{isTimeout && <span className="text-red-500">Failed</span>}
							</div>
							<div className="my-2 h-1.5 w-full rounded-md border border-solid border-gray-400">
								<div
									className={`h-full rounded-lg transition-all duration-200 ease-in-out ${
										isTimeout ? "bg-red-600" : "bg-stone-500"
									}`}
									style={{
										width: `${isTimeout ? 100 : progress}%`,
									}}
								/>
							</div>
						</div>

						{isSuccess && (
							<VSCodeButton
								appearance="primary"
								className="w-full"
								disabled={refreshDisabled}
								onClick={() => handleConfigIndex()}>
								{t("advanced.codeIndex.refresh")}
							</VSCodeButton>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default AdvancedAbilitiesModal
