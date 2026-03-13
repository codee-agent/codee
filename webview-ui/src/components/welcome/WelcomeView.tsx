import { BooleanRequest, EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import ApiOptions from "@/components/settings/ApiOptions"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient, StateServiceClient } from "@/services/grpc-client"
import { validateApiConfiguration } from "@/utils/validate"

const WelcomeView = memo(() => {
	const { apiConfiguration, mode } = useExtensionState()
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
		try {
			await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))
		} catch (error) {
			console.error("Failed to update API configuration or complete welcome view:", error)
		}
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(mode, apiConfiguration))
	}, [apiConfiguration, mode])

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto">
				<h2>{t("chat.welcome.title")}</h2>
				<div className="flex justify-center my-5">{/* <ClineLogoWhite className="size-16" /> */}</div>
				<p>
					<Trans
						components={{
							claudeLink: (
								<VSCodeLink className="inline" href="https://www.anthropic.com/claude/sonnet">
									{t("chat.welcome.claudeLinkText")}
								</VSCodeLink>
							),
						}}
						i18nKey="chat.welcome.description"
						values={{
							claudeLink: t("chat.welcome.claudeLinkText"),
						}}
					/>
				</p>

				{/* <p className="text-[var(--vscode-descriptionForeground)]">{t("chat.welcome.signupText")}</p> */}

				{/* <VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					{t('chat.welcome.getStarted')}
				</VSCodeButton> */}

				{!showApiOptions && (
					<VSCodeButton
						appearance="secondary"
						className="mt-2.5 w-full"
						onClick={() => setShowApiOptions(!showApiOptions)}>
						{t("chat.welcome.useOwnApiKey")}
					</VSCodeButton>
				)}

				<div className="mt-4.5">
					{showApiOptions && (
						<div>
							<ApiOptions currentMode={mode} showModelOptions={false} />
							<VSCodeButton className="mt-0.75" disabled={disableLetsGoButton} onClick={handleSubmit}>
								Let's go!
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
})

export default WelcomeView
