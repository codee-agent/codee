import React from "react"
import { useTranslation } from "react-i18next"
import HeroTooltip from "@/components/common/HeroTooltip"
import { FileServiceClient } from "@/services/grpc-client"
import { StringRequest } from "@shared/proto/cline/common"

interface CodebaseSearchResultProps {
	filePath: string
	score: number
	startLine: number
	endLine: number
	snippet: string
	language: string
}

const CodebaseSearchResult: React.FC<CodebaseSearchResultProps> = ({ filePath, score, startLine, endLine }) => {
	const { t } = useTranslation()

	const handleClick = () => {
		FileServiceClient.openFileRelativePath(
			StringRequest.create({ value: filePath }),
		).catch(() => console.error("Failed to open file:", filePath))
		// vscode.postMessage({
		// 	type: "openFile",
		// 	text: "./" + filePath,
		// 	values: {
		// 		line: startLine,
		// 	},
		// })
	}

	return (
		<HeroTooltip content={t("codebaseSearch.resultTooltip", { score: score.toFixed(3) })}>
			<div
				onClick={handleClick}
				className="p-2 border border-[var(--vscode-editorGroup-border)] cursor-pointer hover:bg-[var(--vscode-button-secondaryHoverBackground)] hover:text-white">
				<div className="flex gap-2 items-center overflow-hidden">
					<span className="text-primary-300 whitespace-nowrap flex-shrink-0">
						{filePath.split("/").at(-1)}:{startLine === endLine ? startLine : `${startLine}-${endLine}`}
					</span>
					<span className="text-gray-500 truncate min-w-0 flex-1">
						{filePath.split("/").slice(0, -1).join("/")}
					</span>
					<span className="text-xs text-vscode-descriptionForeground whitespace-nowrap ml-auto opacity-60">
						{score.toFixed(3)}
					</span>
				</div>
			</div>
		</HeroTooltip>
	)
}

export default CodebaseSearchResult
