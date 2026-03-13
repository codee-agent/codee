import { StringRequest } from "@shared/proto/cline/common"
import { CodeeModelResponse } from "@shared/proto/cline/models"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { VALUE_CODEE_BASE_URL, VALUE_OPENAI_MODEL_ID } from "@rootUtils/values"
import { DropdownContainer } from "../ApiOptions"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface CodeeProviderProps {
	currentMode: Mode
}

export const CodeeProvider = ({ currentMode }: CodeeProviderProps) => {
	const { t } = useTranslation()
	const { apiConfiguration, navigateToAccount } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()
	const extensionState = useExtensionState()

	const codeeApiKey = apiConfiguration?.codeeApiKey
	const codeeBaseUrl = `${VALUE_CODEE_BASE_URL}v1`

	useEffect(() => {
		if (codeeApiKey) {
			console.log("Codee API Key changed")
			const apiProvider =
				currentMode === "plan" ? apiConfiguration?.planModeApiProvider : apiConfiguration?.actModeApiProvider
			if (apiProvider == "codee" && codeeBaseUrl) {
				debouncedRefreshCodeeModels(codeeBaseUrl, apiConfiguration?.codeeApiKey)
			}
		}
	}, [codeeApiKey])

	const [showLoginAlert, setShowLoginAlert] = useState(false)

	const handleLogin = () => {
		setShowLoginAlert(true)
		setTimeout(() => setShowLoginAlert(false), 3000)
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
							extensionState.setCodeeCompleteModels(response.completesModels || [])
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
		const apiProvider = currentMode === "plan" ? apiConfiguration?.planModeApiProvider : apiConfiguration?.actModeApiProvider
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
					<DropdownContainer className="dropdown-container" zIndex={1001}>
						<VSCodeDropdown
							onChange={(e: any) => {
								const value = (e.target as HTMLSelectElement)?.value
								if (value) {
									// handleFieldChange("codeeModelId")({
									// 	target: { value },
									// })
									// handleFieldChange(currentMode === "act" ? "actModeOpenAiModelId" : "planModeOpenAiModelId", value)
									handleFieldChange("codeeModelId", value)
								}
							}}
							style={{
								width: "100%",
								marginBottom: 10,
							}}
							value={apiConfiguration?.codeeModelId || VALUE_OPENAI_MODEL_ID}>
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
					{showLoginAlert && (
						<Alert variant="default" className="mb-4" isDismissible={false}>
							<AlertDescription className="flex items-center gap-2">
								<InfoIcon className="size-3 shrink-0" />
								This feature is not yet available. Please stay tuned.
							</AlertDescription>
						</Alert>
					)}
					<VSCodeButton className="mt-0" onClick={handleLogin}>
						{t("account.signUpButton")}
					</VSCodeButton>
				</div>
			)}
			
		</div>
	)
}
