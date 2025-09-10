import { VSCodeButton, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient, ModelsServiceClient } from "@/services/grpc-client"
import { EmptyRequest, StringArray, StringRequest } from "@shared/proto/cline/common"
import { useTranslation, Trans } from "react-i18next"
import { VALUE_CODEE_BASE_URL, VALUE_OPENAI_MODEL_ID } from "@/values"
import { ApiConfiguration } from "@shared/api"
import { useCallback, useEffect, useRef } from "react"
import { CodeeModelResponse, OpenAiModelsRequest } from "@shared/proto/cline/models"
import { DropdownContainer } from "../ApiOptions"
import { Mode } from "@shared/storage/types"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface CodeeProviderProps {
	currentMode: Mode
}

export const CodeeProvider = ({ currentMode }: CodeeProviderProps) => {
	const { t } = useTranslation()
	const { apiConfiguration, navigateToAccount } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()
	const extensionState = useExtensionState()

	let codeeApiKey = apiConfiguration?.codeeApiKey
	let codeeBaseUrl = `${VALUE_CODEE_BASE_URL}v1`

useEffect(() => {
  if (codeeApiKey) {
    console.log("Codee API Key changed")
    const apiProvider = currentMode === "plan" 
      ? apiConfiguration?.planModeApiProvider 
      : apiConfiguration?.actModeApiProvider
    if (apiProvider == "codee" && codeeBaseUrl) {
      debouncedRefreshCodeeModels(codeeBaseUrl, apiConfiguration?.codeeApiKey)
    }
  }
}, [codeeApiKey])

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleShowAccount = () => {
		navigateToAccount()
	}

	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [])

	const debouncedRefreshCodeeModels = useCallback(
		(baseUrl?: string, apiKey?: string) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
			console.log("@@@@ debouncedRefreshcodeeModels:", baseUrl)
			const codeeUrl = VALUE_CODEE_BASE_URL.endsWith("/") ? VALUE_CODEE_BASE_URL.slice(0, -1) : VALUE_CODEE_BASE_URL
			if (codeeUrl && apiKey) {
				debounceTimerRef.current = setTimeout(() => {
					ModelsServiceClient.refreshCodeeModels(
						StringRequest.create({
							value: codeeUrl,
						}),
					)
						.then((response: CodeeModelResponse) => {
							const models = response.chatModels || []
							extensionState.setCodeeModels(models)
							console.log("@@@@ models", models)
						})
						.catch((error) => {
							console.error("Failed to refresh OpenAI models:", error)
						})
				}, 500)
			}
		},
		[extensionState],
	)

useEffect(() => {
  console.log("@@@@ codeeProvider", apiConfiguration?.codeeModelId, apiConfiguration?.codeeApiKey)
  const apiProvider = currentMode === "plan" 
    ? apiConfiguration?.planModeApiProvider 
    : apiConfiguration?.actModeApiProvider
  if (apiProvider == "codee" && codeeBaseUrl) {
    debouncedRefreshCodeeModels(codeeBaseUrl, apiConfiguration?.codeeApiKey)
  }
}, [])

	return (
		<div className="max-w-[600px]">
			{codeeApiKey ? (
				<div>
					<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
						View Account
					</VSCodeButton>
					<div style={{ marginBottom: "2px" }}>
						<span style={{ fontWeight: 500 }}>{t("settings.api.modelId")}</span>
					</div>
					<DropdownContainer zIndex={1001} className="dropdown-container">
						<VSCodeDropdown
							value={apiConfiguration?.codeeModelId || VALUE_OPENAI_MODEL_ID}
							style={{
								width: "100%",
								marginBottom: 10,
							}}
							onChange={(e: any) => {
								const value = (e.target as HTMLSelectElement)?.value
								if (value) {
									// handleFieldChange("codeeModelId")({
									// 	target: { value },
									// })
									// handleFieldChange(currentMode === "act" ? "actModeOpenAiModelId" : "planModeOpenAiModelId", value)
									handleFieldChange("codeeModelId", value)
								}
							}}>
							{extensionState.codeeModels.map((model: string) => (
								<VSCodeOption key={model} value={model}>
									{model}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
					</DropdownContainer>
				</div>
			) : (
				<div>
					<VSCodeButton onClick={handleLogin} className="mt-0">
						{t("account.signUpButton")}
					</VSCodeButton>
				</div>
			)}
		</div>
	)
}
