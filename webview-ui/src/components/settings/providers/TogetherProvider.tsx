import { ApiConfiguration } from "@shared/api"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { ApiKeyField } from "../common/ApiKeyField"
import { useTranslation } from "react-i18next"

/**
 * Props for the TogetherProvider component
 */
interface TogetherProviderProps {
	apiConfiguration: ApiConfiguration
	handleInputChange: (field: keyof ApiConfiguration) => (event: any) => void
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The Together provider configuration component
 */
export const TogetherProvider = ({ apiConfiguration, handleInputChange, showModelOptions, isPopup }: TogetherProviderProps) => {
	const { t } = useTranslation()

	return (
		<div>
			<ApiKeyField
				value={apiConfiguration?.togetherApiKey || ""}
				onChange={handleInputChange("togetherApiKey")}
				providerName="Together"
			/>
			<VSCodeTextField
				value={apiConfiguration?.togetherModelId || ""}
				style={{ width: "100%" }}
				onInput={handleInputChange("togetherModelId")}
				placeholder={t("settings.api.enterModelId")}>
				<span style={{ fontWeight: 500 }}>{t("settings.api.modelId")}</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				<span style={{ color: "var(--vscode-errorForeground)" }}>({t("settings.api.complexPromptsNote")})</span>
			</p>
		</div>
	)
}
