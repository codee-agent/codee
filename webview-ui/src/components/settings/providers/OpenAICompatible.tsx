import { ApiConfiguration, azureOpenAiDefaultApiVersion, openAiModelInfoSaneDefaults } from "@shared/api"
import { OpenAiModelsRequest } from "@shared/proto/models"
import { ModelsServiceClient } from "@/services/grpc-client"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "@/utils/vscStyles"
import { VSCodeTextField, VSCodeButton, VSCodeCheckbox, VSCodeRadioGroup, VSCodeRadio } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { ModelInfoView } from "../common/ModelInfoView"
import { ApiKeyField } from "../common/ApiKeyField"
import { BaseUrlField } from "../common/BaseUrlField"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { StringArray } from "@shared/proto/common"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useTranslation } from "react-i18next"

import {
	//huqb
	VALUE_API_PROVIDER,
	VALUE_OPENAI_BASE_URL,
	VALUE_OPENAI_API_KEY,
	VALUE_OPENAI_MODEL_ID,
} from "../../../values"

/**
 * Props for the OpenAICompatibleProvider component
 */
interface OpenAICompatibleProviderProps {
	apiConfiguration: ApiConfiguration
	handleInputChange: (field: keyof ApiConfiguration) => (event: any) => void
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The OpenAI Compatible provider configuration component
 */
export const OpenAICompatibleProvider = ({
	apiConfiguration,
	handleInputChange,
	showModelOptions,
	isPopup,
}: OpenAICompatibleProviderProps) => {
	const { t } = useTranslation()
	const extensionState = useExtensionState()
	const [modelConfigurationSelected, setModelConfigurationSelected] = useState(false)

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	// Debounced function to refresh OpenAI models (prevents excessive API calls while typing)
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [])

	const debouncedRefreshOpenAiModels = useCallback(
		(baseUrl?: string, apiKey?: string) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
			console.log("@@@@ debouncedRefreshOpenAiModels:", baseUrl)
			if (baseUrl && apiKey) {
				debounceTimerRef.current = setTimeout(() => {
					ModelsServiceClient.refreshOpenAiModels(
						OpenAiModelsRequest.create({
							baseUrl,
							apiKey,
						}),
					)
						.then((response: StringArray) => {
							const models = response.values || []
							extensionState.setOpenAiModels(models)
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
		if (apiConfiguration?.apiProvider == "openai" && apiConfiguration.openAiBaseUrl) {
			debouncedRefreshOpenAiModels(apiConfiguration?.openAiBaseUrl, apiConfiguration?.openAiApiKey)
		}
	}, [])

	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.openAiBaseUrl || VALUE_OPENAI_BASE_URL}
				style={{ width: "100%", marginBottom: 10 }}
				type="url"
				onInput={(e: any) => {
					const baseUrl = e.target.value
					handleInputChange("openAiBaseUrl")({ target: { value: baseUrl } })

					debouncedRefreshOpenAiModels(baseUrl, apiConfiguration?.openAiApiKey)
				}}
				placeholder={t("settings.api.enterBaseUrl")}>
				<span style={{ fontWeight: 500 }}>{t("settings.api.baseUrl")}</span>
			</VSCodeTextField>

			<ApiKeyField
				value={apiConfiguration?.openAiApiKey || VALUE_OPENAI_API_KEY}
				onChange={(e: any) => {
					const apiKey = e.target.value
					handleInputChange("openAiApiKey")({ target: { value: apiKey } })

					debouncedRefreshOpenAiModels(apiConfiguration?.openAiBaseUrl, apiKey)
				}}
				providerName="OpenAI Compatible"
			/>

			<VSCodeTextField
				value={apiConfiguration?.openAiModelId || VALUE_OPENAI_MODEL_ID}
				style={{ width: "100%", marginBottom: 10 }}
				onInput={handleInputChange("openAiModelId")}
				placeholder={t("settings.api.enterModelId")}>
				<span style={{ fontWeight: 500 }}>{t("settings.api.modelId")}</span>
			</VSCodeTextField>
			{extensionState.openAiModels.length > 0 && (
				<VSCodeRadioGroup
					value={
						extensionState.openAiModels.includes(apiConfiguration?.openAiModelId || "")
							? apiConfiguration?.openAiModelId
							: ""
					}
					onChange={(e) => {
						const value = (e.target as HTMLInputElement)?.value
						// need to check value first since radio group returns empty string sometimes
						if (value) {
							handleInputChange("openAiModelId")({
								target: { value },
							})
						}
					}}>
					{extensionState.openAiModels.map((model) => (
						<VSCodeRadio key={model} value={model} checked={apiConfiguration?.openAiModelId === model}>
							{model}
						</VSCodeRadio>
					))}
				</VSCodeRadioGroup>
			)}

			{/* OpenAI Compatible Custom Headers */}
			{(() => {
				const headerEntries = Object.entries(apiConfiguration?.openAiHeaders ?? {})
				return (
					<div style={{ marginBottom: 10 }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ fontWeight: 500 }}>{t("settings.api.customHeaders")}</span>
							<VSCodeButton
								onClick={() => {
									const currentHeaders = { ...(apiConfiguration?.openAiHeaders || {}) }
									const headerCount = Object.keys(currentHeaders).length
									const newKey = `header${headerCount + 1}`
									currentHeaders[newKey] = ""
									handleInputChange("openAiHeaders")({
										target: {
											value: currentHeaders,
										},
									})
								}}>
								{t("settings.api.addHeader")}
							</VSCodeButton>
						</div>
						<div>
							{headerEntries.map(([key, value], index) => (
								<div key={index} style={{ display: "flex", gap: 5, marginTop: 5 }}>
									<VSCodeTextField
										value={key}
										style={{ width: "40%" }}
										placeholder={t("settings.api.headerName")}
										onInput={(e: any) => {
											const currentHeaders = apiConfiguration?.openAiHeaders ?? {}
											const newValue = e.target.value
											if (newValue && newValue !== key) {
												const { [key]: _, ...rest } = currentHeaders
												handleInputChange("openAiHeaders")({
													target: {
														value: {
															...rest,
															[newValue]: value,
														},
													},
												})
											}
										}}
									/>
									<VSCodeTextField
										value={value}
										style={{ width: "40%" }}
										placeholder={t("settings.api.headerValue")}
										onInput={(e: any) => {
											handleInputChange("openAiHeaders")({
												target: {
													value: {
														...(apiConfiguration?.openAiHeaders ?? {}),
														[key]: e.target.value,
													},
												},
											})
										}}
									/>
									<VSCodeButton
										appearance="secondary"
										onClick={() => {
											const { [key]: _, ...rest } = apiConfiguration?.openAiHeaders ?? {}
											handleInputChange("openAiHeaders")({
												target: {
													value: rest,
												},
											})
										}}>
										{t("settings.api.remove")}
									</VSCodeButton>
								</div>
							))}
						</div>
					</div>
				)
			})()}

			<BaseUrlField
				value={apiConfiguration?.azureApiVersion}
				onChange={(value) => handleInputChange("azureApiVersion")({ target: { value } })}
				label="Set Azure API version"
				placeholder={`${t("settings.api.default")}: ${azureOpenAiDefaultApiVersion}`}
			/>

			<div
				style={{
					color: getAsVar(VSC_DESCRIPTION_FOREGROUND),
					display: "flex",
					margin: "10px 0",
					cursor: "pointer",
					alignItems: "center",
				}}
				onClick={() => setModelConfigurationSelected((val) => !val)}>
				<span
					className={`codicon ${modelConfigurationSelected ? "codicon-chevron-down" : "codicon-chevron-right"}`}
					style={{
						marginRight: "4px",
					}}></span>
				<span
					style={{
						fontWeight: 700,
						textTransform: "uppercase",
					}}>
					{t("settings.api.modelConfiguration")}
				</span>
			</div>

			{modelConfigurationSelected && (
				<>
					<VSCodeCheckbox
						checked={!!apiConfiguration?.openAiModelInfo?.supportsImages}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							const modelInfo = apiConfiguration?.openAiModelInfo
								? apiConfiguration.openAiModelInfo
								: { ...openAiModelInfoSaneDefaults }
							modelInfo.supportsImages = isChecked
							handleInputChange("openAiModelInfo")({
								target: { value: modelInfo },
							})
						}}>
						{t("settings.api.supportsImages")}
					</VSCodeCheckbox>

					<VSCodeCheckbox
						checked={!!apiConfiguration?.openAiModelInfo?.supportsImages}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							let modelInfo = apiConfiguration?.openAiModelInfo
								? apiConfiguration.openAiModelInfo
								: { ...openAiModelInfoSaneDefaults }
							modelInfo.supportsImages = isChecked
							handleInputChange("openAiModelInfo")({
								target: { value: modelInfo },
							})
						}}>
						{t("settings.api.supportsBrowserUse")}
					</VSCodeCheckbox>

					<VSCodeCheckbox
						checked={!!apiConfiguration?.openAiModelInfo?.isR1FormatRequired}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							let modelInfo = apiConfiguration?.openAiModelInfo
								? apiConfiguration.openAiModelInfo
								: { ...openAiModelInfoSaneDefaults }
							modelInfo = { ...modelInfo, isR1FormatRequired: isChecked }

							handleInputChange("openAiModelInfo")({
								target: { value: modelInfo },
							})
						}}>
						{t("settings.api.enableR1Format")}
					</VSCodeCheckbox>

					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.contextWindow
									? apiConfiguration.openAiModelInfo.contextWindow.toString()
									: openAiModelInfoSaneDefaults.contextWindow?.toString()
							}
							style={{ flex: 1 }}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }
								modelInfo.contextWindow = Number(input.target.value)
								handleInputChange("openAiModelInfo")({
									target: { value: modelInfo },
								})
							}}>
							<span style={{ fontWeight: 500 }}>{t("settings.api.contextWindowSize")}</span>
						</VSCodeTextField>

						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.maxTokens
									? apiConfiguration.openAiModelInfo.maxTokens.toString()
									: openAiModelInfoSaneDefaults.maxTokens?.toString()
							}
							style={{ flex: 1 }}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }
								modelInfo.maxTokens = input.target.value
								handleInputChange("openAiModelInfo")({
									target: { value: modelInfo },
								})
							}}>
							<span style={{ fontWeight: 500 }}>{t("settings.api.maxOutputTokens")}</span>
						</VSCodeTextField>
					</div>

					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.inputPrice
									? apiConfiguration.openAiModelInfo.inputPrice.toString()
									: openAiModelInfoSaneDefaults.inputPrice?.toString()
							}
							style={{ flex: 1 }}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }
								modelInfo.inputPrice = input.target.value
								handleInputChange("openAiModelInfo")({
									target: { value: modelInfo },
								})
							}}>
							<span style={{ fontWeight: 500 }}>{t("settings.api.inputPricePerMillion")}</span>
						</VSCodeTextField>

						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.outputPrice
									? apiConfiguration.openAiModelInfo.outputPrice.toString()
									: openAiModelInfoSaneDefaults.outputPrice?.toString()
							}
							style={{ flex: 1 }}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }
								modelInfo.outputPrice = input.target.value
								handleInputChange("openAiModelInfo")({
									target: { value: modelInfo },
								})
							}}>
							<span style={{ fontWeight: 500 }}>{t("settings.api.outputPricePerMillion")}</span>
						</VSCodeTextField>
					</div>

					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<VSCodeTextField
							value={
								apiConfiguration?.openAiModelInfo?.temperature
									? apiConfiguration.openAiModelInfo.temperature.toString()
									: openAiModelInfoSaneDefaults.temperature?.toString()
							}
							onInput={(input: any) => {
								const modelInfo = apiConfiguration?.openAiModelInfo
									? apiConfiguration.openAiModelInfo
									: { ...openAiModelInfoSaneDefaults }

								// Check if the input ends with a decimal point or has trailing zeros after decimal
								const value = input.target.value
								const shouldPreserveFormat = value.endsWith(".") || (value.includes(".") && value.endsWith("0"))

								modelInfo.temperature =
									value === ""
										? openAiModelInfoSaneDefaults.temperature
										: shouldPreserveFormat
											? value // Keep as string to preserve decimal format
											: parseFloat(value)

								handleInputChange("openAiModelInfo")({
									target: { value: modelInfo },
								})
							}}>
							<span style={{ fontWeight: 500 }}>{t("settings.api.temperature")}</span>
						</VSCodeTextField>
					</div>
				</>
			)}

			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				<span style={{ color: "var(--vscode-errorForeground)" }}>({t("settings.api.complexPromptsNote")})</span>
			</p>

			{showModelOptions && (
				<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
			)}
		</div>
	)
}
