import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useTranslation } from "react-i18next"
import Section from "../Section"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	const { t, i18n } = useTranslation()
	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="text-center text-[var(--vscode-descriptionForeground)] text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<p className="break-words m-0 p-0">
						{t("settings.feedback.text")}{" "}
						<VSCodeLink href="https://github.com/codee-agent/codee" className="inline">
							https://github.com/codee-agent/codee
						</VSCodeLink>
					</p>
					<p className="italic mt-[10px] mb-0 p-0">
						{t("settings.feedback.version", { version })}
					</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
