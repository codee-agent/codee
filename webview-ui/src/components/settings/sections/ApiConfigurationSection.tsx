import { UpdateSettingsRequest } from "@shared/proto/cline/state"
import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { BusinessServiceClient, StateServiceClient } from "@/services/grpc-client"
import { TabButton } from "../../mcp/configuration/McpConfigurationView"
import ApiOptions from "../ApiOptions"
import Section from "../Section"
import { syncModeConfigurations } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useTranslation } from "react-i18next"
import { EmptyRequest, SetAutoCompletionRequest, UpdateApiConfigurationRequest } from "@shared/proto/index.cline"

interface ApiConfigurationSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const ApiConfigurationSection = ({ renderSectionHeader }: ApiConfigurationSectionProps) => {
	const { t, i18n } = useTranslation()
	const { planActSeparateModelsSetting, mode, apiConfiguration } = useExtensionState()
	const [currentTab, setCurrentTab] = useState<Mode>(mode)
	const [autocompleteConfig, setAutocompleteConfig] = useState({
		autocomplete: {
			provider: "openai",
			title: "autocomplete-coder",
			apiKey: "",
			model: "",
			apiBase: "",
			enable: false,
		},
	})
	const updateAutoComplete = () => {
		const request = SetAutoCompletionRequest.create({
			autoCompletion: {
				provider: autocompleteConfig.autocomplete.provider,
				title: autocompleteConfig.autocomplete.title,
				model: autocompleteConfig.autocomplete.model,
				apiKey: autocompleteConfig.autocomplete.apiKey,
				enable: autocompleteConfig.autocomplete.enable,
				apiBase: autocompleteConfig.autocomplete.apiBase,
			}
		});
		BusinessServiceClient.setAutoCompletion(request).catch(error => {
			console.error("Failed to update auto-completion settings:", error);
		});
	}

	// 在现有代码中添加这个useEffect
	useEffect(() => {
		if (autocompleteConfig && autocompleteConfig.autocomplete.apiKey.length > 0) {
			updateAutoComplete();
		}
	}, [autocompleteConfig]);

	useEffect(() => {
		// Load initial auto-completion configuration
		BusinessServiceClient.getAutoCompletion(EmptyRequest.create())
			.then(response => {
				console.log("@@@@@@@,getAutoCompletion:",response)
				if (response.autoCompletion) {
					setAutocompleteConfig({
						autocomplete: {
							provider: response.autoCompletion.provider ||"openai",
							title: response.autoCompletion.title ||"autocomplete-coder",
							apiKey: response.autoCompletion.apiKey || "",
							model: response.autoCompletion.model || "",
							apiBase: response.autoCompletion.apiBase || "",
							enable: response.autoCompletion.enable || false,
						},
					});
				}
			})
			.catch(error => {
				console.error("Failed to get auto-completion settings:", error);
			});
		 StateServiceClient.updateSettings(
									UpdateSettingsRequest.create({
										planActSeparateModelsSetting: false,
									}));
	}, []);

	const { handleFieldsChange } = useApiConfigurationHandlers()
	return (
		<div>
			{renderSectionHeader("api-config")}
			<Section>
				{/* Tabs container */}
				{planActSeparateModelsSetting ? (
					<div className="rounded-md mb-5 bg-[var(--vscode-panel-background)]">
						<div className="flex gap-[1px] mb-[10px] -mt-2 border-0 border-b border-solid border-[var(--vscode-panel-border)]">
							<TabButton
								disabled={currentTab === "plan"}
								isActive={currentTab === "plan"}
								onClick={() => setCurrentTab("plan")}
								style={{
									opacity: 1,
									cursor: "pointer",
								}}>
								{t("settings.planMode")}
							</TabButton>
							<TabButton
								disabled={currentTab === "act"}
								isActive={currentTab === "act"}
								onClick={() => setCurrentTab("act")}
								style={{
									opacity: 1,
									cursor: "pointer",
								}}>
								{t("settings.actMode")}
							</TabButton>
						</div>

						{/* Content container */}
						<div className="-mb-3">
							<ApiOptions currentMode={currentTab} showModelOptions={true} />
						</div>
					</div>
				) : (
					<ApiOptions currentMode={mode} showModelOptions={true} />
				)}

				{/* <div className="mb-[5px]">
					<VSCodeCheckbox
						checked={planActSeparateModelsSetting}
						className="mb-[5px]"
						onChange={async (e: any) => {
							const checked = e.target.checked === true
							try {
								// If unchecking the toggle, wait a bit for state to update, then sync configurations
								if (!checked) {
									await syncModeConfigurations(apiConfiguration, currentTab, handleFieldsChange)
								}
								await StateServiceClient.updateSettings(
									UpdateSettingsRequest.create({
										planActSeparateModelsSetting: checked,
									}),
								)
							} catch (error) {
								console.error("Failed to update separate models setting:", error)
							}
						}}>
						{t("settings.other.planActSeparateModels")}
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						{t("settings.other.planActSeparateModelsDesc")}
					</p>
				</div> */}
				{/* Autocomplete Settings Section */}
				<div className="border border-solid border-[var(--vscode-panel-border)] rounded-md p-[10px] mb-5 bg-[var(--vscode-panel-background)] [&_vscode-dropdown]:w-full [&_vscode-text-field]:w-full">
					<details
						onToggle={(e) => {
							if (e.currentTarget.open) {
								
							}
						}}>
						<summary className="cursor-pointer font-medium">
							{t("settings.autocomplete.title")}
						</summary>
						<div className="mt-3 space-y-3">
							<VSCodeDropdown>
								<VSCodeOption value="openai">OpenAI Compatible</VSCodeOption>
							</VSCodeDropdown>

							<VSCodeTextField
								value={autocompleteConfig.autocomplete.apiBase}
								onInput={(e: any) => {
									// if (e.target.value !== autocompleteConfig.autocomplete.apiBase) {
									// 	setHasUnsavedChanges(true) //huqb
									// }
									setAutocompleteConfig({
										...autocompleteConfig,
										autocomplete: {
											...autocompleteConfig.autocomplete,
											apiBase: e.target.value,
										},
									})
								}}
								placeholder={t("settings.autocomplete.apiBase")}>
								{t("settings.autocomplete.apiBase")}
							</VSCodeTextField>

							<VSCodeTextField
								value={autocompleteConfig.autocomplete.apiKey}
								type="password"
								onInput={(e: any) => {
									// if (e.target.value !== autocompleteConfig.autocomplete.apiKey) {
									// 	setHasUnsavedChanges(true) //huqb
									// }
									setAutocompleteConfig({
										...autocompleteConfig,
										autocomplete: {
											...autocompleteConfig.autocomplete,
											apiKey: e.target.value,
										},
									})
								}}
								placeholder={t("settings.autocomplete.apiKey")}>
								{t("settings.autocomplete.apiKey")}
							</VSCodeTextField>

							<VSCodeTextField
								value={autocompleteConfig.autocomplete.model}
								onInput={(e: any) => {
									// if (e.target.value !== autocompleteConfig.autocomplete.model) {
									// 	setHasUnsavedChanges(true) //huqb
									// }
									setAutocompleteConfig({
										...autocompleteConfig,
										autocomplete: {
											...autocompleteConfig.autocomplete,
											model: e.target.value,
										},
									})
								}}
								placeholder={t("settings.autocomplete.model")}>
								{t("settings.autocomplete.model")}
							</VSCodeTextField>

							<VSCodeCheckbox
								checked={autocompleteConfig.autocomplete.enable}
								onChange={(e: any) => {
									// if (e.target.checked !== autocompleteConfig.autocomplete.enable) {
									// 	setHasUnsavedChanges(true) //huqb
									// }
									setAutocompleteConfig({
										...autocompleteConfig,
										autocomplete: {
											...autocompleteConfig.autocomplete,
											enable: e.target.checked,
										},
									})
								}}>
								{t("settings.autocomplete.enable")}
							</VSCodeCheckbox>
						</div>
					</details>
				</div>
			</Section>
		</div>
	)
}

export default ApiConfigurationSection
