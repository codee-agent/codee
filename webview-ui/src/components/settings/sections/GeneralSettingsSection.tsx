import { EmptyRequest, SetCurrentLanguageRequest } from "@shared/proto/index.cline"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { BusinessServiceClient } from "@/services/grpc-client"
import PreferredLanguageSetting from "../PreferredLanguageSetting"
import Section from "../Section"
import { updateSetting } from "../utils/settingsHandlers"

interface GeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const GeneralSettingsSection = ({ renderSectionHeader }: GeneralSettingsSectionProps) => {
	const { telemetrySetting, remoteConfigSettings } = useExtensionState()
	const { t, i18n } = useTranslation()
	const [currentLanguage, setCurrentLanguage] = useState<string>("en")
	
	useEffect(() => {
		// 获取当前语言设置
		BusinessServiceClient.getCurrentLanguage(EmptyRequest.create()).then((response) => {
			const backendLangCode = response.value === "zh-CN" ? "zh-CN" : "en"
			const displayLangCode = response.value === "zh-CN" ? "简体中文" : "English"
			console.log("@@@response.value:", response.value, " backendLangCode:", backendLangCode, " displayLangCode:", displayLangCode)
			setCurrentLanguage(displayLangCode)
			i18n.changeLanguage(backendLangCode)
		})
		//设置不上报信息
		updateSetting("telemetrySetting", "disabled")
	}, [i18n])

	const handleLanguageChange = (newLanguage: string) => {
		
		setCurrentLanguage(newLanguage)
		const languageCode = newLanguage === "简体中文" ? "zh-CN" : "en"
		i18n.changeLanguage(languageCode)
		console.log("@@@i18n.changeLanguage:",languageCode)
		BusinessServiceClient.setCurrentLanguage(
			SetCurrentLanguageRequest.create({
				language: languageCode,
			}),
		).catch((err: Error) => {
			console.error("setCurrentLanguage:", err)
		})
	}

	return (
		<div>
			{renderSectionHeader("general")}
			<Section>
				<PreferredLanguageSetting />
			<label className="block mb-1 text-base font-medium" htmlFor="ui-language-dropdown">
				{t("settings.language.uiLanguage")}
			</label>
				<VSCodeDropdown
					id="ui-language-dropdown"
					currentValue={currentLanguage}
					onChange={(e: any) => {
						const selectedValue = e.target.value
						// 将显示值映射回语言代码
						// const languageCode = selectedValue === "简体中文" ? "zh-CN" : "en"
						handleLanguageChange(selectedValue)
					}}
					style={{ width: "100%" }}>
					<VSCodeOption value="English">English</VSCodeOption>
					<VSCodeOption value="简体中文">简体中文</VSCodeOption>
				</VSCodeDropdown>
				<p className="text-sm text-description mt-1">{t("settings.language.uiLanguageDesc")}</p>
			</Section>
		</div>
	)
}

export default GeneralSettingsSection
