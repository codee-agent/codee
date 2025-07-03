import {
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodeTextArea,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { memo, useCallback, useEffect, useState, useRef } from "react"
import {
	Settings,
	Webhook,
	CheckCheck,
	SquareMousePointer,
	GitBranch,
	Bell,
	Database,
	SquareTerminal,
	FlaskConical,
	Globe,
	Info,
	LucideIcon,
} from "lucide-react"
import HeroTooltip from "@/components/common/HeroTooltip"
import { UnsavedChangesDialog } from "@/components/common/AlertDialog"
import SectionHeader from "./SectionHeader"
import Section from "./Section"
import PreferredLanguageSetting from "./PreferredLanguageSetting" // Added import
import { OpenAIReasoningEffort } from "@shared/ChatSettings"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import SettingsButton from "@/components/common/SettingsButton"
import ApiOptions from "./ApiOptions"
import { TabButton } from "../mcp/configuration/McpConfigurationView"
import { useEvent } from "react-use"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { StateServiceClient } from "@/services/grpc-client"
import FeatureSettingsSection from "./FeatureSettingsSection"
import BrowserSettingsSection from "./BrowserSettingsSection"
import TerminalSettingsSection from "./TerminalSettingsSection"
import { FEATURE_FLAGS } from "@shared/services/feature-flags/feature-flags"
import { Tab, TabContent, TabHeader, TabList, TabTrigger } from "../common/Tab"
import { cn } from "@/utils/cn"
import { PlanActMode } from "@shared/proto/state"

import { useTranslation } from "react-i18next"
import { getLanguageConfig, updateLanguageConfig } from "@continuedev/core/util/codaiConfigUtil"
const { IS_DEV } = process.env

// Styles for the tab system
const settingsTabsContainer = "flex flex-1 overflow-hidden [&.narrow_.tab-label]:hidden"
const settingsTabList =
	"w-48 data-[compact=true]:w-12 flex-shrink-0 flex flex-col overflow-y-auto overflow-x-hidden border-r border-[var(--vscode-sideBar-background)]"
const settingsTabTrigger =
	"whitespace-nowrap overflow-hidden min-w-0 h-12 px-4 py-3 box-border flex items-center border-l-2 border-transparent text-[var(--vscode-foreground)] opacity-70 bg-transparent hover:bg-[var(--vscode-list-hoverBackground)] data-[compact=true]:w-12 data-[compact=true]:p-4 cursor-pointer"
const settingsTabTriggerActive =
	"opacity-100 border-l-2 border-l-[var(--vscode-focusBorder)] border-t-0 border-r-0 border-b-0 bg-[var(--vscode-list-activeSelectionBackground)]"

// Tab definitions
interface SettingsTab {
	id: string
	name: string
	tooltipText: string
	headerText: string
	icon: LucideIcon
}

export const SETTINGS_TABS: SettingsTab[] = [
	{
		id: "api-config",
		name: "settings.tabs.apiConfig.name",
		tooltipText: "settings.tabs.apiConfig.tooltip",
		headerText: "settings.tabs.apiConfig.header",
		icon: Webhook,
	},
	{
		id: "general",
		name: "settings.tabs.general.name",
		tooltipText: "settings.tabs.general.tooltip",
		headerText: "settings.tabs.general.header",
		icon: Settings,
	},
	{
		id: "features",
		name: "settings.tabs.features.name",
		tooltipText: "settings.tabs.features.tooltip",
		headerText: "settings.tabs.features.header",
		icon: CheckCheck,
	},
	{
		id: "browser",
		name: "settings.tabs.browser.name",
		tooltipText: "settings.tabs.browser.tooltip",
		headerText: "settings.tabs.browser.header",
		icon: SquareMousePointer,
	},
	{
		id: "terminal",
		name: "settings.tabs.terminal.name",
		tooltipText: "settings.tabs.terminal.tooltip",
		headerText: "settings.tabs.terminal.header",
		icon: SquareTerminal,
	},
	// Only show in dev mode
	...(IS_DEV
		? [
				{
					id: "debug",
					name: "settings.tabs.debug.name",
					tooltipText: "settings.tabs.debug.tooltip",
					headerText: "settings.tabs.debug.header",
					icon: FlaskConical,
				},
			]
		: []),
	{
		id: "about",
		name: "settings.tabs.about.name",
		tooltipText: "settings.tabs.about.tooltip",
		headerText: "settings.tabs.about.header",
		icon: Info,
	},
]

type SettingsViewProps = {
	onDone: () => void
	targetSection?: string
}

const SettingsView = ({ onDone, targetSection }: SettingsViewProps) => {
	const { t, i18n } = useTranslation()
	// Track if there are unsaved changes
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	// State for the unsaved changes dialog
	const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false)
	// Store the action to perform after confirmation
	const pendingAction = useRef<() => void>()
	const {
		apiConfiguration,
		version,
		customInstructions,
		setCustomInstructions,
		openRouterModels,
		telemetrySetting,
		setTelemetrySetting,
		chatSettings,
		setChatSettings,
		planActSeparateModelsSetting,
		setPlanActSeparateModelsSetting,
		enableCheckpointsSetting,
		setEnableCheckpointsSetting,
		mcpMarketplaceEnabled,
		setMcpMarketplaceEnabled,
		setApiConfiguration,
	} = useExtensionState()

	// Store the original state to detect changes
	const originalState = useRef({
		apiConfiguration,
		customInstructions,
		telemetrySetting,
		planActSeparateModelsSetting,
		enableCheckpointsSetting,
		mcpMarketplaceEnabled,
		chatSettings,
	})
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
	const [pendingTabChange, setPendingTabChange] = useState<"plan" | "act" | null>(null)
	const [currentLanguage, setCurrentLanguage] = useState<string>("en")
	const [autocompleteConfig, setAutocompleteConfig] = useState({
		autocomplete: {
			provider: "openai",
			title: "autocomplete-coder",
			apiKey: "",
			model: "",
			apiBase: "",
			enable: false,
		},
	})

	useEffect(() => {
		// 获取当前语言设置
		vscode.postMessage({ type: "getLanguageConfig" })
	}, [])

	useEffect(() => {
		// 监听语言配置更新
		const listener = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "languageConfig") {
				setCurrentLanguage(message.language)
				i18n.changeLanguage(message.language)
			}
		}

		window.addEventListener("message", listener)
		return () => window.removeEventListener("message", listener)
	}, [i18n])

	const handleLanguageChange = (e: any) => {
		const newLanguage = e.target.value
		setCurrentLanguage(newLanguage)
		vscode.postMessage({
			type: "updateLanguageConfig",
			language: newLanguage,
		})
		setHasUnsavedChanges(true) //huqb
	}

	useEffect(() => {
		// 请求初始配置
		vscode.postMessage({ type: "getAutocompleteConfig" })

		// 监听配置更新
		const listener = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "autocompleteConfig") {
				setAutocompleteConfig(message.autocompleteConfig)
			}
		}

		window.addEventListener("message", listener)
		return () => window.removeEventListener("message", listener)
	}, [])

	const handleSubmit = (withoutDone: boolean = false) => {
		const apiValidationResult = validateApiConfiguration(apiConfiguration)
		const modelIdValidationResult = validateModelId(apiConfiguration, openRouterModels)

		// setApiErrorMessage(apiValidationResult)
		// setModelIdErrorMessage(modelIdValidationResult)

		let apiConfigurationToSubmit = apiConfiguration
		if (!apiValidationResult && !modelIdValidationResult) {
			// vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
			// vscode.postMessage({
			// 	type: "customInstructions",
			// 	text: customInstructions,
			// })
			// vscode.postMessage({
			// 	type: "telemetrySetting",
			// 	text: telemetrySetting,
			// })
			// console.log("handleSubmit", withoutDone)
			// vscode.postMessage({
			// 	type: "separateModeSetting",
			// 	text: separateModeSetting,
			// })
		} else {
			// if the api configuration is invalid, we don't save it
			apiConfigurationToSubmit = undefined
		}

		vscode.postMessage({
			type: "updateSettings",
			planActSeparateModelsSetting,
			customInstructionsSetting: customInstructions,
			telemetrySetting,
			enableCheckpointsSetting,
			mcpMarketplaceEnabled,
			apiConfiguration: apiConfigurationToSubmit,
			autocompleteConfig,
		})

		if (!withoutDone) {
			onDone()
		}
	}

	useEffect(() => {
		setApiErrorMessage(undefined)
		setModelIdErrorMessage(undefined)
	}, [apiConfiguration])

	// Check for unsaved changes by comparing current state with original state
	useEffect(() => {
		const hasChanges =
			JSON.stringify(apiConfiguration) !== JSON.stringify(originalState.current.apiConfiguration) ||
			customInstructions !== originalState.current.customInstructions ||
			telemetrySetting !== originalState.current.telemetrySetting ||
			planActSeparateModelsSetting !== originalState.current.planActSeparateModelsSetting ||
			enableCheckpointsSetting !== originalState.current.enableCheckpointsSetting ||
			mcpMarketplaceEnabled !== originalState.current.mcpMarketplaceEnabled ||
			JSON.stringify(chatSettings) !== JSON.stringify(originalState.current.chatSettings)

		setHasUnsavedChanges(hasChanges)
	}, [
		apiConfiguration,
		customInstructions,
		telemetrySetting,
		planActSeparateModelsSetting,
		enableCheckpointsSetting,
		mcpMarketplaceEnabled,
		chatSettings,
	])

	// Handle cancel button click
	const handleCancel = useCallback(() => {
		if (hasUnsavedChanges) {
			// Show confirmation dialog
			// setIsUnsavedChangesDialogOpen(true)
			// pendingAction.current = () => {
			// 	// Reset all tracked state to original values
			// 	setCustomInstructions(originalState.current.customInstructions)
			// 	setTelemetrySetting(originalState.current.telemetrySetting)
			// 	setPlanActSeparateModelsSetting(originalState.current.planActSeparateModelsSetting)
			// 	setChatSettings(originalState.current.chatSettings)
			// 	if (typeof setApiConfiguration === "function") {
			// 		setApiConfiguration(originalState.current.apiConfiguration ?? {})
			// 	}
			// 	if (typeof setEnableCheckpointsSetting === "function") {
			// 		setEnableCheckpointsSetting(
			// 			typeof originalState.current.enableCheckpointsSetting === "boolean"
			// 				? originalState.current.enableCheckpointsSetting
			// 				: false,
			// 		)
			// 	}
			// 	if (typeof setMcpMarketplaceEnabled === "function") {
			// 		setMcpMarketplaceEnabled(
			// 			typeof originalState.current.mcpMarketplaceEnabled === "boolean"
			// 				? originalState.current.mcpMarketplaceEnabled
			// 				: false,
			// 		)
			// 	}
			// 	// Close settings view
			// 	onDone()
			// }
			onDone()
		} else {
			// No changes, just close
			onDone()
		}
	}, [
		hasUnsavedChanges,
		onDone,
		setCustomInstructions,
		setTelemetrySetting,
		setPlanActSeparateModelsSetting,
		setChatSettings,
		setApiConfiguration,
		setEnableCheckpointsSetting,
		setMcpMarketplaceEnabled,
	])

	// Handle confirmation dialog actions
	const handleConfirmDiscard = useCallback(() => {
		setIsUnsavedChangesDialogOpen(false)
		if (pendingAction.current) {
			pendingAction.current()
			pendingAction.current = undefined
		}
	}, [])

	const handleCancelDiscard = useCallback(() => {
		setIsUnsavedChangesDialogOpen(false)
		pendingAction.current = undefined
	}, [])

	// validate as soon as the component is mounted
	/*
	useEffect will use stale values of variables if they are not included in the dependency array. 
	so trying to use useEffect with a dependency array of only one value for example will use any 
	other variables' old values. In most cases you don't want this, and should opt to use react-use 
	hooks.
    
		// uses someVar and anotherVar
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [someVar])
	If we only want to run code once on mount we can use react-use's useEffectOnce or useMount
	*/

	const handleMessage = useCallback(
		(event: MessageEvent) => {
			const message: ExtensionMessage = event.data
			switch (message.type) {
				case "didUpdateSettings":
					if (pendingTabChange) {
						StateServiceClient.togglePlanActMode({
							chatSettings: {
								mode: pendingTabChange === "plan" ? PlanActMode.PLAN : PlanActMode.ACT,
								preferredLanguage: chatSettings.preferredLanguage,
								openAIReasoningEffort: chatSettings.openAIReasoningEffort,
							},
						})
						setPendingTabChange(null)
					}
					break
				// Handle tab navigation through targetSection prop instead
				case "grpc_response":
					if (message.grpc_response?.message?.action === "scrollToSettings") {
						const tabId = message.grpc_response?.message?.value
						if (tabId) {
							console.log("Opening settings tab from GRPC response:", tabId)
							// Check if the value corresponds to a valid tab ID
							const isValidTabId = SETTINGS_TABS.some((tab) => tab.id === tabId)

							if (isValidTabId) {
								// Set the active tab directly
								setActiveTab(tabId)
							} else {
								// Fall back to the old behavior of scrolling to an element
								setTimeout(() => {
									const element = document.getElementById(tabId)
									if (element) {
										element.scrollIntoView({ behavior: "smooth" })

										element.style.transition = "background-color 0.5s ease"
										element.style.backgroundColor = "var(--vscode-textPreformat-background)"

										setTimeout(() => {
											element.style.backgroundColor = "transparent"
										}, 1200)
									}
								}, 300)
							}
						}
					}
					break
			}
		},
		[pendingTabChange],
	)

	useEvent("message", handleMessage)

	const handleResetState = async () => {
		try {
			await StateServiceClient.resetState({})
		} catch (error) {
			console.error("Failed to reset state:", error)
		}
	}

	const handlePlanActModeChange = (tab: "plan" | "act") => {
		if (tab === chatSettings.mode) {
			return
		}
		setPendingTabChange(tab)
		handleSubmit(true)
	}

	// Track active tab
	const [activeTab, setActiveTab] = useState<string>(targetSection || SETTINGS_TABS[0].id)

	// Update active tab when targetSection changes
	useEffect(() => {
		if (targetSection) {
			setActiveTab(targetSection)
		}
	}, [targetSection])

	// Enhanced tab change handler with debugging
	const handleTabChange = useCallback(
		(tabId: string) => {
			console.log("Tab change requested:", tabId, "Current:", activeTab)
			setActiveTab(tabId)
		},
		[activeTab],
	)

	// Debug tab changes
	useEffect(() => {
		console.log("Active tab changed to:", activeTab)
	}, [activeTab])

	// Track whether we're in compact mode
	const [isCompactMode, setIsCompactMode] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	// Setup resize observer to detect when we should switch to compact mode
	useEffect(() => {
		if (!containerRef.current) return

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				// If container width is less than 500px, switch to compact mode
				setIsCompactMode(entry.contentRect.width < 500)
			}
		})

		observer.observe(containerRef.current)

		return () => {
			observer?.disconnect()
		}
	}, [])

	return (
		<Tab>
			<TabHeader className="flex justify-between items-center gap-2">
				<div className="flex items-center gap-1">
					<h3 className="text-[var(--vscode-foreground)] m-0">{t("settings.title")}</h3>
				</div>
				<div className="flex gap-2">
					<VSCodeButton appearance="secondary" onClick={handleCancel}>
						{t("settings.cancel")}
					</VSCodeButton>
					<VSCodeButton onClick={() => handleSubmit(false)} disabled={!hasUnsavedChanges}>
						{t("settings.done")}
					</VSCodeButton>
				</div>
			</TabHeader>

			{/* Vertical tabs layout */}
			<div ref={containerRef} className={cn(settingsTabsContainer, isCompactMode && "narrow")}>
				{/* Tab sidebar */}
				<TabList
					value={activeTab}
					onValueChange={handleTabChange}
					className={cn(settingsTabList)}
					data-compact={isCompactMode}>
					{SETTINGS_TABS.map((tab) =>
						isCompactMode ? (
							<HeroTooltip key={tab.id} content={t(tab.tooltipText)} placement="right">
								<div
									className={cn(
										activeTab === tab.id
											? `${settingsTabTrigger} ${settingsTabTriggerActive}`
											: settingsTabTrigger,
										"focus:ring-0",
									)}
									data-compact={isCompactMode}
									data-testid={`tab-${tab.id}`}
									data-value={tab.id}
									onClick={() => {
										console.log("Compact tab clicked:", tab.id)
										handleTabChange(tab.id)
									}}>
									<div className={cn("flex items-center gap-2", isCompactMode && "justify-center")}>
										<tab.icon className="w-4 h-4" />
										<span className="tab-label">{t(tab.name)}</span>
									</div>
								</div>
							</HeroTooltip>
						) : (
							<TabTrigger
								key={tab.id}
								value={tab.id}
								className={cn(
									activeTab === tab.id
										? `${settingsTabTrigger} ${settingsTabTriggerActive}`
										: settingsTabTrigger,
									"focus:ring-0",
								)}
								data-compact={isCompactMode}
								data-testid={`tab-${tab.id}`}>
								<div className={cn("flex items-center gap-2", isCompactMode && "justify-center")}>
									<tab.icon className="w-4 h-4" />
									<span className="tab-label">{t(tab.name)}</span>
								</div>
							</TabTrigger>
						),
					)}
				</TabList>

				{/* Helper function to render section header */}
				{(() => {
					const renderSectionHeader = (tabId: string) => {
						const tab = SETTINGS_TABS.find((t) => t.id === tabId)
						if (!tab) return null

						return (
							<SectionHeader>
								<div className="flex items-center gap-2">
									{(() => {
										const Icon = tab.icon
										return <Icon className="w-4" />
									})()}
									<div>{t(tab.headerText)}</div>
								</div>
							</SectionHeader>
						)
					}

					return (
						<TabContent className="flex-1 overflow-auto">
							{/* API Configuration Tab */}
							{activeTab === "api-config" && (
								<div>
									{renderSectionHeader("api-config")}
									<Section>
										{/* Tabs container */}
										{planActSeparateModelsSetting ? (
											<div className="rounded-md mb-5 bg-[var(--vscode-panel-background)]">
												<div className="flex gap-[1px] mb-[10px] -mt-2 border-0 border-b border-solid border-[var(--vscode-panel-border)]">
													<TabButton
														isActive={chatSettings.mode === "plan"}
														onClick={() => handlePlanActModeChange("plan")}>
														{t("settings.planMode")}
													</TabButton>
													<TabButton
														isActive={chatSettings.mode === "act"}
														onClick={() => handlePlanActModeChange("act")}>
														{t("settings.actMode")}
													</TabButton>
												</div>

												{/* Content container */}
												<div className="-mb-3">
													<ApiOptions
														key={chatSettings.mode}
														showModelOptions={true}
														apiErrorMessage={apiErrorMessage}
														modelIdErrorMessage={modelIdErrorMessage}
													/>
												</div>
											</div>
										) : (
											<ApiOptions
												key={"single"}
												showModelOptions={true}
												apiErrorMessage={apiErrorMessage}
												modelIdErrorMessage={modelIdErrorMessage}
											/>
										)}

										<div className="mb-[5px]">
											<VSCodeCheckbox
												className="mb-[5px]"
												checked={planActSeparateModelsSetting}
												onChange={(e: any) => {
													const checked = e.target.checked === true
													setPlanActSeparateModelsSetting(checked)
												}}>
												{t("settings.other.planActSeparateModels")}
											</VSCodeCheckbox>
											<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
												{t("settings.other.planActSeparateModelsDesc")}
											</p>
										</div>

										{/* Autocomplete Settings Section */}
										<div className="border border-solid border-[var(--vscode-panel-border)] rounded-md p-[10px] mb-5 bg-[var(--vscode-panel-background)] [&_vscode-dropdown]:w-full [&_vscode-text-field]:w-full">
											<details
												open
												onToggle={(e) => {
													if (e.currentTarget.open) {
														vscode.postMessage({ type: "getAutocompleteConfig" })
													}
												}}>
												<summary className="cursor-pointer font-medium">
													{t("settings.autocomplete.title")}
												</summary>
												<div className="mt-3 space-y-3">
													<VSCodeDropdown>
														<VSCodeOption value="openai">OpenAI Compatible</VSCodeOption>
													</VSCodeDropdown>

													<VSCodeTextField
														value={autocompleteConfig.autocomplete.apiBase}
														onInput={(e: any) => {
															if (e.target.value !== autocompleteConfig.autocomplete.apiBase) {
																setHasUnsavedChanges(true) //huqb
															}
															setAutocompleteConfig({
																...autocompleteConfig,
																autocomplete: {
																	...autocompleteConfig.autocomplete,
																	apiBase: e.target.value,
																},
															})
														}}
														placeholder={t("settings.autocomplete.apiBase")}>
														{t("settings.autocomplete.apiBase")}
													</VSCodeTextField>

													<VSCodeTextField
														value={autocompleteConfig.autocomplete.apiKey}
														type="password"
														onInput={(e: any) => {
															if (e.target.value !== autocompleteConfig.autocomplete.apiKey) {
																setHasUnsavedChanges(true) //huqb
															}
															setAutocompleteConfig({
																...autocompleteConfig,
																autocomplete: {
																	...autocompleteConfig.autocomplete,
																	apiKey: e.target.value,
																},
															})
														}}
														placeholder={t("settings.autocomplete.apiKey")}>
														{t("settings.autocomplete.apiKey")}
													</VSCodeTextField>

													<VSCodeTextField
														value={autocompleteConfig.autocomplete.model}
														onInput={(e: any) => {
															if (e.target.value !== autocompleteConfig.autocomplete.model) {
																setHasUnsavedChanges(true) //huqb
															}
															setAutocompleteConfig({
																...autocompleteConfig,
																autocomplete: {
																	...autocompleteConfig.autocomplete,
																	model: e.target.value,
																},
															})
														}}
														placeholder={t("settings.autocomplete.model")}>
														{t("settings.autocomplete.model")}
													</VSCodeTextField>

													<VSCodeCheckbox
														checked={autocompleteConfig.autocomplete.enable}
														onChange={(e: any) => {
															if (e.target.checked !== autocompleteConfig.autocomplete.enable) {
																setHasUnsavedChanges(true) //huqb
															}
															setAutocompleteConfig({
																...autocompleteConfig,
																autocomplete: {
																	...autocompleteConfig.autocomplete,
																	enable: e.target.checked,
																},
															})
														}}>
														{t("settings.autocomplete.enable")}
													</VSCodeCheckbox>
												</div>
											</details>
										</div>

										<div className="mb-[5px]">
											<VSCodeTextArea
												value={customInstructions ?? ""}
												className="w-full"
												resize="vertical"
												rows={4}
												placeholder={
													'e.g. "Run unit tests at the end", "Use TypeScript with async/await", "Speak in Spanish"'
												}
												onInput={(e: any) => setCustomInstructions(e.target?.value ?? "")}>
												<span className="font-medium">{t("settings.other.customInstructions")}</span>
											</VSCodeTextArea>
											<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
												{t("settings.other.customInstructionsDesc")}
											</p>
										</div>
									</Section>
								</div>
							)}

							{/* General Settings Tab */}
							{activeTab === "general" && (
								<div>
									{renderSectionHeader("general")}
									<Section>
										{/*chatSettings && (
											<PreferredLanguageSetting
												chatSettings={chatSettings}
												setChatSettings={setChatSettings}
											/>
										)*/}

										{/* <div className="mb-[5px]">
											<VSCodeCheckbox
												className="mb-[5px]"
												checked={telemetrySetting === "enabled"}
												onChange={(e: any) => {
													const checked = e.target.checked === true
													setTelemetrySetting(checked ? "enabled" : "disabled")
												}}>
												Allow anonymous error and usage reporting
											</VSCodeCheckbox>
											<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
												Help improve Codee by sending anonymous usage data and error reports. No code, prompts, or
												personal information are ever sent. See our{" "}
												<VSCodeLink href="https://docs.cline.bot/more-info/telemetry" className="text-inherit">
													telemetry overview
												</VSCodeLink>{" "}
												and{" "}
												<VSCodeLink href="https://cline.bot/privacy" className="text-inherit">
													privacy policy
												</VSCodeLink>{" "}
												for more details.
											</p>
										</div> */}
										{/* Language Selection */}
										<div className="border border-solid border-[var(--vscode-panel-border)] rounded-md p-[10px] mb-5 bg-[var(--vscode-panel-background)]">
											<details open>
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
							)}

							{/* Feature Settings Tab */}
							{activeTab === "features" && (
								<div>
									{renderSectionHeader("features")}
									<Section>
										<FeatureSettingsSection />
									</Section>
								</div>
							)}

							{/* Browser Settings Tab */}
							{activeTab === "browser" && (
								<div>
									{renderSectionHeader("browser")}
									<Section>
										<BrowserSettingsSection />
									</Section>
								</div>
							)}

							{/* Terminal Settings Tab */}
							{activeTab === "terminal" && (
								<div>
									{renderSectionHeader("terminal")}
									<Section>
										<TerminalSettingsSection />
									</Section>
								</div>
							)}

							{/* Debug Tab (only in dev mode) */}
							{IS_DEV && activeTab === "debug" && (
								<div>
									{renderSectionHeader("debug")}
									<Section>
										<VSCodeButton
											onClick={handleResetState}
											className="mt-[5px] w-auto"
											style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
											{t("settings.other.resetState")}
										</VSCodeButton>
										<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
											{t("settings.other.resetStateDesc")}
										</p>
									</Section>
								</div>
							)}

							{/* About Tab */}
							{activeTab === "about" && (
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
							)}
						</TabContent>
					)
				})()}
			</div>

			{/* Unsaved Changes Dialog */}
			<UnsavedChangesDialog
				open={isUnsavedChangesDialogOpen}
				onOpenChange={setIsUnsavedChangesDialogOpen}
				onConfirm={handleConfirmDiscard}
				onCancel={handleCancelDiscard}
			/>
		</Tab>
	)
}

export default memo(SettingsView)
