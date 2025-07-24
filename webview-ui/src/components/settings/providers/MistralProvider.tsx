import { ApiConfiguration, mistralModels } from "@shared/api"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelSelector } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useTranslation } from "react-i18next"

/**
 * Props for the MistralProvider component
 */
interface MistralProviderProps {
	apiConfiguration: ApiConfiguration
	handleInputChange: (field: keyof ApiConfiguration) => (event: any) => void
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The Mistral provider configuration component
 */
export const MistralProvider = ({ apiConfiguration, handleInputChange, showModelOptions, isPopup }: MistralProviderProps) => {
	const { t } = useTranslation()
	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	return (
		<div>
			<ApiKeyField
				value={apiConfiguration?.mistralApiKey || ""}
				onChange={handleInputChange("mistralApiKey")}
				providerName="Mistral"
				signupUrl="https://console.mistral.ai/"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						models={mistralModels}
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
