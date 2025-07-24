import { useRef, useState } from "react"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import { useTranslation } from "react-i18next"
import AdvancedAbilitiesModal from "./AdvancedAbilitiesModal"

interface AdvancedAbilitiesMenuProps {
	hasMemoryBank: boolean | undefined
	setHasMemoryBank: (value: boolean) => void
}

const AdvancedAbilitiesMenu = ({ hasMemoryBank, setHasMemoryBank }: AdvancedAbilitiesMenuProps) => {
	const { t } = useTranslation()
	const [isVisible, setIsVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	return (
		<div
			className="px-[10px] mx-[5px] select-none rounded-[10px_10px_0_0]"
			style={{
				borderTop: `0.5px solid color-mix(in srgb, ${getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND)} 20%, transparent)`,
			}}>
			<div
				ref={buttonRef}
				className="cursor-pointer py-[8px] pr-[2px] flex items-center justify-between gap-[8px]"
				onClick={() => setIsVisible(!isVisible)}>
				<div className="flex items-center">
					<span>{t("advanced.title")}</span>
				</div>
				<span className={`codicon codicon-chevron-${isVisible ? "down" : "up"}`} />
			</div>

			<AdvancedAbilitiesModal
				isVisible={isVisible}
				setIsVisible={setIsVisible}
				buttonRef={buttonRef}
				hasMemoryBank={hasMemoryBank}
				setHasMemoryBank={setHasMemoryBank}
			/>
		</div>
	)
}

export default AdvancedAbilitiesMenu
