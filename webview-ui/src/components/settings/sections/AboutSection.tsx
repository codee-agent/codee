import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { AccountServiceClient } from "@/services/grpc-client"
import VSCodeButtonLink from "../../common/VSCodeButtonLink"
import Section from "../Section"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	const { t, i18n } = useTranslation()
	const [updateAvailable, setUpdateAvailable] = useState(false)

	const [updateUrl, setUpdateUrl] = useState("")

	const checkForUpdates = async () => {
		try {
			// Simulate checking for updates - in real implementation this would call extension API
			AccountServiceClient.fetchSystemMessage(EmptyRequest.create()).then((response) => {
				console.log("@@@@@111,response message:", response)
				const updateMessage = response.messages?.find((msg: { type: string; content: string }) => msg.type === "update")
				if (updateMessage?.content) {
					console.log("@@@@@111,Update message content:", updateMessage.content)
					setUpdateUrl(updateMessage.content)
					setUpdateAvailable(true)
				} else {
					setUpdateAvailable(false)
				}
			})
		} catch (error) {
			console.error("Error checking for updates:", error)
		}
	}

	useEffect(() => {
		checkForUpdates()
	}, [])

	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="text-center text-[var(--vscode-descriptionForeground)] text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<p className="break-words m-0 p-0">
						{t("settings.feedback.text")}{" "}
						<VSCodeLink className="inline" href="https://github.com/codee-agent/codee">
							https://github.com/codee-agent/codee
						</VSCodeLink>
					</p>
					<p className="italic mt-[10px] mb-0 p-0">{t("settings.feedback.version", { version })}</p>
					{updateAvailable && (
						<div className="mt-3 flex justify-between items-center">
							<span>{t("settings.checkupdate.text")}</span>
							<VSCodeButtonLink appearance="primary" href={updateUrl} onClick={() => setUpdateAvailable(false)}>
								{t("settings.checkupdate.action")}
							</VSCodeButtonLink>
						</div>
					)}
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
