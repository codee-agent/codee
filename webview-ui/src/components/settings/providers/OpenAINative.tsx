import { ApiConfiguration, openAiNativeModels } from "@shared/api"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelSelector } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useTranslation } from "react-i18next"

/**
 * Props for the OpenAINativeProvider component
 */
interface OpenAINativeProviderProps {
	apiConfiguration: ApiConfiguration
	handleInputChange: (field: keyof ApiConfiguration) => (event: any) => void
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The OpenAI (native) provider configuration component
 */
export const OpenAINativeProvider = ({
	apiConfiguration,
	handleInputChange,
	showModelOptions,
	isPopup,
}: OpenAINativeProviderProps) => {
	const { t } = useTranslation()
	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	return (
		<div>
			<ApiKeyField
				value={apiConfiguration?.openAiNativeApiKey || ""}
				onChange={handleInputChange("openAiNativeApiKey")}
				providerName="OpenAI"
				signupUrl="https://platform.openai.com/api-keys"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						models={openAiNativeModels}
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
