import { useTranslation } from "react-i18next"
import React from "react"
import CodeeLogoVariable from "@/assets/CodeeLogoVariable"
import HistoryPreview from "@/components/history/HistoryPreview"
import { SuggestedTasks } from "@/components/welcome/SuggestedTasks"
import { WelcomeSectionProps } from "../../types/chatTypes"

/**
 * Welcome section shown when there's no active task
 * Includes telemetry banner, announcements, home header, and history preview
 */
export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
	showAnnouncement,
	hideAnnouncement,
	showHistoryView,
	telemetrySetting,
	version,
	taskHistory,
	shouldShowQuickWins,
}) => {
	const { t } = useTranslation()
	return (
		<div className="flex flex-col flex-1 w-full h-full p-0 m-0">
			<div className="overflow-y-auto flex flex-col pb-2.5">
				{/* {telemetrySetting === "unset" && <TelemetryBanner />}
				{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}
				<HomeHeader /> */}
				<div style={{ padding: "0 20px", flexShrink: 0, textAlign: "center" }}>
					<h2>{t("chat.welcome.title")}</h2>
					<div className="my-5 flex justify-center">
						<CodeeLogoVariable className="size-16" />
					</div>
				</div>
				{!shouldShowQuickWins && taskHistory.length > 0 && <HistoryPreview showHistoryView={showHistoryView} />}
			</div>
			<SuggestedTasks shouldShowQuickWins={shouldShowQuickWins} />
		</div>
	)
}
