import { useRef, useState, useEffect, useCallback } from "react"
import { useEvent } from "react-use"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import { useTranslation } from "react-i18next"
import { vscode } from "@/utils/vscode"
import { ExtensionMessage } from "@shared/ExtensionMessage"

interface AdvancedAbilitiesMenuProps {
	hasMemoryBank: boolean | undefined
	setHasMemoryBank: (value: boolean) => void
}

const AdvancedAbilitiesMenu = ({ hasMemoryBank, setHasMemoryBank }: AdvancedAbilitiesMenuProps) => {
	const { t } = useTranslation()

	const [isExpanded, setIsExpanded] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const handleMemorybank = (text: string) => {
		vscode.postMessage({
			type: "memoryBank",
			text,
		})
	}

	// wy
	useEffect(() => {
		// Check for memory-bank directory via safer method
		if (isExpanded) {
			vscode.postMessage({
				type: "getMemoryBank",
			})
		}
	}, [isExpanded])

	const handleMessage = useCallback((event: MessageEvent) => {
		const message: ExtensionMessage = event.data
		switch (message.type) {
			case "hasMemoryBank": {
				setHasMemoryBank(message.hasMemoryBank ?? false)
				break
			}
		}
	}, [])

	useEvent("message", handleMessage)

	return (
		<div
			className="px-[10px] mx-[5px] select-none rounded-[10px_10px_0_0]"
			style={{
				borderTop: `0.5px solid color-mix(in srgb, ${getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND)} 20%, transparent)`,
				overflowY: "auto",
				backgroundColor: isExpanded ? CODE_BLOCK_BG_COLOR : "transparent",
			}}>
			<div
				ref={buttonRef}
				className="cursor-pointer py-[8px] pr-[2px] flex items-center justify-between gap-[8px]"
				onClick={() => setIsExpanded(!isExpanded)}>
				<div className="flex items-center">
					<span>{t("advanced.title")}</span>
				</div>
				{isExpanded ? <span className="codicon codicon-chevron-down" /> : <span className="codicon codicon-chevron-up" />}
			</div>

			{isExpanded && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						marginBottom: "10px",
						padding: "10px",
						backgroundColor: "var(--vscode-sideBar-background)",
						borderRadius: "3px",
					}}>
					<div className="mb-2.5">
						<span className="text-[color:var(--vscode-foreground)] font-medium">
							{t("advanced.memorybank.title")}:
						</span>
					</div>
					<p style={{ marginBottom: "10px" }}>{t("advanced.memorybank.description")}</p>
					<VSCodeButton appearance="primary" style={{ width: "100%" }} onClick={() => handleMemorybank("auto")}>
						{hasMemoryBank ? t("advanced.memorybank.update") : t("advanced.memorybank.init")}
					</VSCodeButton>
					{hasMemoryBank ? (
						<VSCodeButton
							appearance="primary"
							style={{ width: "100%", marginTop: "10px" }}
							onClick={() => handleMemorybank("remember")}>
							{t("advanced.memorybank.remember")}
						</VSCodeButton>
					) : (
						""
					)}
				</div>
			)}
		</div>
	)
}

export default AdvancedAbilitiesMenu
