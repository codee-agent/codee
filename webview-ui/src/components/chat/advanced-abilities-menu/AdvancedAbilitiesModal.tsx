import { useRef, useState, useEffect } from "react"
import { useClickAway, useWindowSize } from "react-use"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { useTranslation } from "react-i18next"
import { BusinessServiceClient } from "@/services/grpc-client"
import { EmptyRequest, StringRequest } from "@shared/proto/cline/common"
import type { ChatState } from "../chat-view/types/chatTypes"

interface AdvancedAbilitiesModalProps {
	isVisible: boolean
	setIsVisible: (visible: boolean) => void
	buttonRef: React.RefObject<HTMLDivElement>
	hasMemoryBank: boolean | undefined
	setHasMemoryBank: (value: boolean) => void
	chatState: ChatState
}

const AdvancedAbilitiesModal: React.FC<AdvancedAbilitiesModalProps> = ({
	isVisible,
	setIsVisible,
	buttonRef,
	hasMemoryBank,
	setHasMemoryBank,
	chatState
}) => {
	const { t } = useTranslation()
	const modalRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const {
		setInputValue,
		sendingDisabled,
		setIsTextAreaFocused
	} = chatState


	const handleMemorybank = (text: string) => {
    BusinessServiceClient.setMemoryBank(StringRequest.create({value: text})).then((response) => {
      console.log('handleMemorybank', response)
      if (response.value) {
        const initPrompt =
						response.value == "init"
							? "Please carefully read the relevant introduction documents of this project then initialize memory bank"
							: response.value == "update"
								? "update memory bank"
								: "follow your custom instructions"
				setInputValue(initPrompt)
				const sendButton = document.querySelector('[data-testid="send-button"]') as HTMLElement | null
				console.log('sendButton', sendButton)
				setTimeout(() => {
					if (!sendingDisabled) {
						setIsTextAreaFocused(false)
						sendButton?.click()
					}
				}, 0)
      }
      setIsVisible(false)
    }).catch(() => {
      setIsVisible(false)
    })
	}

	useEffect(() => {
		if (isVisible) {
			BusinessServiceClient.getMemoryBank(EmptyRequest.create()).then(response => {
        setHasMemoryBank(response.value ?? false)
      })
		}
	}, [isVisible])

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
			</div>
		</div>
	)
}

export default AdvancedAbilitiesModal
