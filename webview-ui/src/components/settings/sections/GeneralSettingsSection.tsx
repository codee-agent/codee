import { VSCodeCheckbox, VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import PreferredLanguageSetting from "../PreferredLanguageSetting"
import Section from "../Section"
import { updateSetting } from "../utils/settingsHandlers"
import { useTranslation } from "react-i18next"
import { vscode } from "@/utils/vscode"
import { useEffect, useState } from "react"
import { BusinessServiceClient } from "@/services/grpc-client"
import { EmptyRequest, SetCurrentLanguageRequest } from "@shared/proto/index.cline"

interface GeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const GeneralSettingsSection = ({ renderSectionHeader }: GeneralSettingsSectionProps) => {
	const { telemetrySetting } = useExtensionState()
	const { t, i18n } = useTranslation()
	const [currentLanguage, setCurrentLanguage] = useState<string>("en")
	useEffect(() => {
		// 获取当前语言设置
		vscode.postMessage({ type: "getLanguageConfig" })
		BusinessServiceClient.getCurrentLanguage(EmptyRequest.create())
		.then(response => {
			setCurrentLanguage(response.value)
			i18n.changeLanguage(response.value)
		})
	}, [i18n])

	const handleLanguageChange = (e: any) => {
		const newLanguage = e.target.value
		setCurrentLanguage(newLanguage)
		i18n.changeLanguage(newLanguage)
		BusinessServiceClient.setCurrentLanguage(SetCurrentLanguageRequest.create({
				language: newLanguage,
			})).catch(err => {
			console.error("setCurrentLanguage:", err);
		})
	}


	return (
		<div>
			{renderSectionHeader("general")}
			<Section>
				{/* <PreferredLanguageSetting /> */}

				{/* <div className="mb-[5px]">
					<VSCodeCheckbox
						checked={telemetrySetting !== "disabled"}
						className="mb-[5px]"
						onChange={(e: any) => {
							const checked = e.target.checked === true
							updateSetting("telemetrySetting", checked ? "enabled" : "disabled")
						}}>
						Allow error and usage reporting
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						Help improve Codee by sending usage data and error reports. No code, prompts, or personal information are
						ever sent. See our{" "}
						<VSCodeLink className="text-inherit" href="https://docs.cline.bot/more-info/telemetry">
							telemetry overview
						</VSCodeLink>{" "}
						and{" "}
						<VSCodeLink className="text-inherit" href="https://cline.bot/privacy">
							privacy policy
						</VSCodeLink>{" "}
						for more details.
					</p>
				</div> */}
				{/* Language Selection */}
				<div className="border border-solid border-[var(--vscode-panel-border)] rounded-md p-[10px] mb-5 bg-[var(--vscode-panel-background)]">
					<details>
						<summary className="cursor-pointer font-medium">
							{t("settings.language.title")}
						</summary>
						<div className="mt-3">
							<VSCodeDropdown
								value={currentLanguage || "English"}
								onChange={handleLanguageChange}
								style={{ position: "relative", zIndex: 2000 }}>
								<VSCodeOption value="en">English</VSCodeOption>
								<VSCodeOption value="zh-CN">简体中文</VSCodeOption>
							</VSCodeDropdown>
						</div>
					</details>
				</div>
			</Section>
		</div>
	)
}

export default GeneralSettingsSection
