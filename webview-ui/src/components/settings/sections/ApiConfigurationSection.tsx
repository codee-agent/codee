import { Mode } from "@shared/storage/types"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { TabButton } from "../../mcp/configuration/McpConfigurationView"
import ApiOptions from "../ApiOptions"
import Section from "../Section"
import AutoComplete from "../AutoComplete"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface ApiConfigurationSectionProps {
	renderSectionHeader?: (tabId: string) => JSX.Element | null
	initialModelTab?: "recommended" | "free"
}

const ApiConfigurationSection = ({ renderSectionHeader, initialModelTab }: ApiConfigurationSectionProps) => {
	const { t } = useTranslation()
	const { planActSeparateModelsSetting, mode, apiConfiguration } = useExtensionState()
	const [currentTab, setCurrentTab] = useState<Mode>(mode)
	const { handleFieldsChange } = useApiConfigurationHandlers()
	return (
		<div>
			{renderSectionHeader?.("api-config")}
			<Section>
				{/* Tabs container */}
				{planActSeparateModelsSetting ? (
					<div className="rounded-md mb-5">
						<div className="flex gap-px mb-[10px] -mt-2 border-0 border-b border-solid border-(--vscode-panel-border)">
							<TabButton
								disabled={currentTab === "plan"}
								isActive={currentTab === "plan"}
								onClick={() => setCurrentTab("plan")}
								style={{
									opacity: 1,
									cursor: "pointer",
								}}>
								{t("settings.apiConfig.planMode")}
							</TabButton>
							<TabButton
								disabled={currentTab === "act"}
								isActive={currentTab === "act"}
								onClick={() => setCurrentTab("act")}
								style={{
									opacity: 1,
									cursor: "pointer",
								}}>
								{t("settings.apiConfig.actMode")}
							</TabButton>
						</div>

						{/* Content container */}
						<div className="-mb-3">
							<ApiOptions currentMode={currentTab} initialModelTab={initialModelTab} showModelOptions={true} />
							<AutoComplete currentMode={currentTab} />
						</div>
					</div>
				) : (
					<div className="-mb-3">
						<ApiOptions currentMode={mode} initialModelTab={initialModelTab} showModelOptions={true} />
						<AutoComplete currentMode={mode} />
					</div>
				)}
			</Section>
		</div>
	)
}

export default ApiConfigurationSection
