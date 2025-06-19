import { ActionMetadata } from "./types"

export const ACTION_METADATA: ActionMetadata[] = [
	{
		id: "enableAutoApprove",
		label: "autoApprove.actions.enableAutoApprove.label",
		shortName: "autoApprove.actions.enableAutoApprove.shortName",
		description: "autoApprove.actions.enableAutoApprove.description",
		icon: "codicon-play-circle",
	},
	{
		id: "enableAll",
		label: "autoApprove.actions.enableAll.label",
		shortName: "autoApprove.actions.enableAll.shortName",
		description: "autoApprove.actions.enableAll.description",
		icon: "codicon-checklist",
	},
	{
		id: "readFiles",
		label: "autoApprove.actions.readFiles.label",
		shortName: "autoApprove.actions.readFiles.shortName",
		description: "autoApprove.actions.readFiles.description",
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: "autoApprove.actions.readFilesExternally.label",
			shortName: "autoApprove.actions.readFilesExternally.shortName",
			description: "autoApprove.actions.readFilesExternally.description",
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: "autoApprove.actions.editFiles.label",
		shortName: "autoApprove.actions.editFiles.shortName",
		description: "autoApprove.actions.editFiles.description",
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: "autoApprove.actions.editFilesExternally.label",
			shortName: "autoApprove.actions.editFilesExternally.shortName",
			description: "autoApprove.actions.editFilesExternally.description",
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: "autoApprove.actions.executeSafeCommands.label",
		shortName: "autoApprove.actions.executeSafeCommands.shortName",
		description: "autoApprove.actions.executeSafeCommands.description",
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: "autoApprove.actions.executeAllCommands.label",
			shortName: "autoApprove.actions.executeAllCommands.shortName",
			description: "autoApprove.actions.executeAllCommands.description",
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useBrowser",
		label: "autoApprove.actions.useBrowser.label",
		shortName: "autoApprove.actions.useBrowser.shortName",
		description: "autoApprove.actions.useBrowser.description",
		icon: "codicon-globe",
	},
	{
		id: "useMcp",
		label: "autoApprove.actions.useMcp.label",
		shortName: "autoApprove.actions.useMcp.shortName",
		description: "autoApprove.actions.useMcp.description",
		icon: "codicon-server",
	},
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
	id: "enableNotifications",
	label: "autoApprove.actions.enableNotifications.label",
	shortName: "autoApprove.actions.enableNotifications.shortName",
	description: "autoApprove.actions.enableNotifications.description",
	icon: "codicon-bell",
}
