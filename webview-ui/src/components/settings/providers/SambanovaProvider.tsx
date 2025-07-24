import { ApiConfiguration, sambanovaModels } from "@shared/api"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelSelector } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useTranslation } from "react-i18next"

/**
 * Props for the SambanovaProvider component
 */
interface SambanovaProviderProps {
	apiConfiguration: ApiConfiguration
	handleInputChange: (field: keyof ApiConfiguration) => (event: any) => void
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The SambaNova provider configuration component
 */
export const SambanovaProvider = ({ apiConfiguration, handleInputChange, showModelOptions, isPopup }: SambanovaProviderProps) => {
	const { t } = useTranslation()
	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	return (
		<div>
			<ApiKeyField
				value={apiConfiguration?.sambanovaApiKey || ""}
				onChange={handleInputChange("sambanovaApiKey")}
				providerName="SambaNova"
				signupUrl="https://cloud.sambanova.ai/apis"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						models={sambanovaModels}
						selectedModelId={selectedModelId}
						onChange={handleInputChange("apiModelId")}
						label={t("settings.api.model")}
					/>

					<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
				</>
			)}
		</div>
	)
}
