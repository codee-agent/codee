import { useRef, useState } from "react"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import { useTranslation } from "react-i18next"
import AdvancedAbilitiesModal from "./AdvancedAbilitiesModal"
import type { ChatState } from "../chat-view/types/chatTypes"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

interface AdvancedAbilitiesMenuProps {
	hasMemoryBank: boolean | undefined
	setHasMemoryBank: (value: boolean) => void
	chatState: ChatState
}

const AdvancedAbilitiesMenu = ({ hasMemoryBank, setHasMemoryBank, chatState }: AdvancedAbilitiesMenuProps) => {
	const { t } = useTranslation()
	const [isVisible, setIsVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const bgGradient = `linear-gradient(to bottom, color-mix(in srgb, var(--vscode-sideBar-background) 96%, white) 0%, transparent 80%)`

	return (
		<div
			className="mx-3.5 select-none rounded-[10px_10px_0_0]"
			style={{
				borderTop: `0.5px solid color-mix(in srgb, ${getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND)} 20%, transparent)`,
				background: bgGradient,
			}}>
			<div
				ref={buttonRef}
				className="cursor-pointer pt-3 pb-3.5 pr-2 px-3.5 flex items-center justify-between gap-[8px]"
				onClick={() => setIsVisible(!isVisible)}>
				<div className="flex items-center">
					<span>{t("advanced.title")}</span>
				</div>
				{isVisible ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
				{/* <span className={`codicon codicon-chevron-${isVisible ? "down" : "right"}`} /> */}
			</div>

			<AdvancedAbilitiesModal
				isVisible={isVisible}
				setIsVisible={setIsVisible}
				buttonRef={buttonRef}
				hasMemoryBank={hasMemoryBank}
				setHasMemoryBank={setHasMemoryBank}
				chatState={chatState}
			/>
		</div>
	)
}

export default AdvancedAbilitiesMenu
