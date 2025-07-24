/**
 * Gemini CLI Provider Component
 *
 * This component integrates with Google's Gemini CLI tool for OAuth authentication.
 *
 * Attribution: This implementation is inspired by and uses concepts from the Google Gemini CLI,
 * which is licensed under the Apache License 2.0.
 * Original project: https://github.com/google-gemini/gemini-cli
 *
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

import { ApiConfiguration, geminiCliModels } from "@shared/api"
import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import { ModelSelector } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useTranslation } from "react-i18next"

interface GeminiCliProviderProps {
	apiConfiguration: ApiConfiguration
	handleInputChange: (field: keyof ApiConfiguration) => (event: any) => void
	showModelOptions: boolean
	isPopup?: boolean
}

const GeminiCliProvider = ({ apiConfiguration, handleInputChange, showModelOptions, isPopup }: GeminiCliProviderProps) => {
	const { t } = useTranslation()
	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)
	return (
		<div>
			<VSCodeTextField
				value={apiConfiguration?.geminiCliOAuthPath || ""}
				style={{ width: "100%", marginTop: 3 }}
				type="text"
				onInput={handleInputChange("geminiCliOAuthPath")}
				placeholder={t("settings.api.oauthPathPlaceholder")}>
				<span style={{ fontWeight: 500 }}>{t("settings.api.oauthCredentialsPath")}</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("settings.api.oauthPathDesc")}
			</p>

			{apiConfiguration?.geminiCliProjectId && (
				<>
					<VSCodeTextField
						value={apiConfiguration.geminiCliProjectId}
						style={{ width: "100%", marginTop: 3 }}
						type="text"
						disabled>
						<span style={{ fontWeight: 500 }}>{t("settings.api.discoveredProjectId")}</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						{t("settings.api.projectIdAutoDesc")}
					</p>
				</>
			)}

			<p
				style={{
					fontSize: "12px",
					marginTop: 5,
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("settings.api.geminiCliDesc")}{" "}
				<code
					style={{
						backgroundColor: "var(--vscode-textCodeBlock-background)",
						padding: "2px 4px",
						borderRadius: "3px",
					}}>
					gemini
				</code>{" "}
				in your terminal first.
				<br />
				<VSCodeLink
					href="https://github.com/google-gemini/gemini-cli?tab=readme-ov-file#quickstart"
					style={{ display: "inline", fontSize: "inherit" }}>
					{t("settings.api.geminiCliSetup")}
				</VSCodeLink>
			</p>

			{showModelOptions && (
				<>
					<ModelSelector
						models={geminiCliModels}
						selectedModelId={selectedModelId}
						onChange={handleInputChange("apiModelId")}
						label={t("settings.api.model")}
					/>

					<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
				</>
			)}

			<div
				style={{
					backgroundColor: "var(--vscode-editorWarning-background, rgba(255, 191, 0, 0.1))",
					padding: "8px",
					borderRadius: "4px",
					border: "1px solid var(--vscode-editorWarning-border, rgba(255, 191, 0, 0.3))",
					marginTop: "8px",
					marginBottom: "16px",
				}}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						marginBottom: "4px",
					}}>
					<i
						className="codicon codicon-info"
						style={{
							marginRight: "6px",
							fontSize: "14px",
							color: "#FFA500",
						}}></i>
					<span
						style={{
							fontWeight: "bold",
							color: "#FFA500",
							fontSize: "12px",
						}}>
						{t("settings.api.importantRequirements")}
					</span>
				</div>
				<p
					style={{
						margin: 0,
						fontSize: "11px",
						lineHeight: "1.4",
						color: "var(--vscode-foreground)",
					}}>
					{t("settings.api.geminiCliRequirements")}
				</p>
			</div>

			<p
				style={{
					fontSize: "12px",
					marginTop: 5,
					color: "var(--vscode-charts-green)",
					fontWeight: 500,
				}}>
				{t("settings.api.freeTierAccess")}
			</p>
		</div>
	)
}

export default memo(GeminiCliProvider)
