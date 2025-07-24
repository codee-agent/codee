import { useExtensionState } from "@/context/ExtensionStateContext"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"

import { McpServiceClient, UiServiceClient } from "@/services/grpc-client"

import { EmptyRequest, StringRequest } from "@shared/proto/common"
import ServersToggleList from "./ServersToggleList"
import { useTranslation } from "react-i18next"

const InstalledServersView = () => {
	const { t } = useTranslation()
	const { mcpServers: servers, navigateToSettings } = useExtensionState()

	return (
		<div style={{ padding: "16px 20px" }}>
			<div
				style={{
					color: "var(--vscode-foreground)",
					fontSize: "13px",
					marginBottom: "16px",
					marginTop: "5px",
				}}>
				{t("mcp.installed.description")}{" "}
				<VSCodeLink href="https://github.com/modelcontextprotocol" style={{ display: "inline" }}>
					{t("mcp.installed.modelContextProtocol")}
				</VSCodeLink>{" "}
				{t("mcp.installed.useCommunityMadeServers")}{" "}
				<VSCodeLink href="https://github.com/modelcontextprotocol/servers" style={{ display: "inline" }}>
					{t("mcp.installed.communityMadeServers")}
				</VSCodeLink>{" "}
				{t("mcp.installed.createNewMcpServer")}{" "}
				<VSCodeLink href="https://x.com/sdrzn/status/1867271665086074969" style={{ display: "inline" }}>
					{t("mcp.installed.seeDemo")}
				</VSCodeLink>
			</div>

			<ServersToggleList servers={servers} isExpandable={true} hasTrashIcon={false} />

			{/* Settings Section */}
			<div style={{ marginBottom: "20px", marginTop: 10 }}>
				<VSCodeButton
					appearance="secondary"
					style={{ width: "100%", marginBottom: "5px" }}
					onClick={() => {
						McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
							console.error("Error opening MCP settings:", error)
						})
					}}>
					<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
					{t("mcp.installed.configureServers")}
				</VSCodeButton>

				<div style={{ textAlign: "center" }}>
					<VSCodeLink
						onClick={() => {
							// First open the settings panel using direct navigation
							navigateToSettings()

							// After a short delay, send a message to scroll to browser settings
							setTimeout(async () => {
								try {
									await UiServiceClient.scrollToSettings(StringRequest.create({ value: "features" }))
								} catch (error) {
									console.error("Error scrolling to mcp settings:", error)
								}
							}, 300)
						}}
						style={{ fontSize: "12px" }}>
						{t("mcp.installed.advancedSettings")}
					</VSCodeLink>
				</div>
			</div>
		</div>
	)
}

export default InstalledServersView
