import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import ApiOptions from "@/components/settings/ApiOptions"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import { AccountServiceClient, ModelsServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
import { UpdateApiConfigurationRequest } from "@shared/proto/models"
import { convertApiConfigurationToProto } from "@shared/proto-conversions/models/api-configuration-conversion"
import { useTranslation, Trans } from "react-i18next"

const WelcomeView = memo(() => {
	const { apiConfiguration } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)
	const { t } = useTranslation()

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleSubmit = async () => {
		if (apiConfiguration) {
			try {
				await ModelsServiceClient.updateApiConfigurationProto(
					UpdateApiConfigurationRequest.create({
						apiConfiguration: convertApiConfigurationToProto(apiConfiguration),
					}),
				)
			} catch (error) {
				console.error("Failed to update API configuration:", error)
			}
		}
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(apiConfiguration))
	}, [apiConfiguration])

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto">
				<h2>{t("chat.welcome.title")}</h2>
				<div className="flex justify-center my-5">{/* <ClineLogoWhite className="size-16" /> */}</div>
				<p>
					<Trans
						i18nKey="chat.welcome.description"
						components={{
							claudeLink: (
								<VSCodeLink href="https://www.anthropic.com/claude/sonnet" className="inline">
									{t("chat.welcome.claudeLinkText")}
								</VSCodeLink>
							),
						}}
						values={{
							claudeLink: t("chat.welcome.claudeLinkText"),
						}}
					/>
				</p>

				{/* <p className="text-[var(--vscode-descriptionForeground)]">{t("chat.welcome.signupText")}</p>

				<VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					{t('chat.welcome.getStarted')}
				</VSCodeButton> */}

				{!showApiOptions && (
					<VSCodeButton
						appearance="secondary"
						onClick={() => setShowApiOptions(!showApiOptions)}
						className="mt-2.5 w-full">
						{t("chat.welcome.useOwnApiKey")}
					</VSCodeButton>
				)}

				<div className="mt-4.5">
					{showApiOptions && (
						<div>
							<ApiOptions showModelOptions={false} />
							<VSCodeButton onClick={handleSubmit} disabled={disableLetsGoButton} className="mt-0.75">
								{t("chat.welcome.letsGo")}
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
})

export default WelcomeView
