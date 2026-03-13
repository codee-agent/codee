import type { PaymentTransaction } from "@shared/ClineAccount"
import { UserInfo } from "@shared/proto/cline/account"
import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeDivider, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import VSCodeButtonLink from "../common/VSCodeButtonLink"
import CodeeLogoVariable from "../../assets/CodeeLogoVariable"
import { useTranslation } from "react-i18next"
import { VALUE_CODEE_BASE_URL } from "@rootUtils/values"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

type AccountViewProps = {
	onDone: () => void
}

const AccountView = ({ onDone }: AccountViewProps) => {
	const { t } = useTranslation()
	return (
		<div className="fixed inset-0 flex flex-col overflow-hidden pt-[10px] pl-[20px]">
			<div className="flex justify-between items-center mb-[17px] pr-[17px]">
				<h3 className="text-[var(--vscode-foreground)] m-0">{t("account.title")}</h3>
				<VSCodeButton onClick={onDone}>{t("account.done")}</VSCodeButton>
			</div>
			<div className="flex-grow overflow-hidden pr-[8px] flex flex-col">
				<div className="h-full mb-[5px]">
					<CodeeAccountView />
				</div>
			</div>
		</div>
	)
}

export const CodeeAccountView = () => {
	// const { handleSignOut } = useFirebaseAuth()
	const { apiConfiguration } = useExtensionState()

	const apiKey = apiConfiguration?.codeeApiKey
	console.log("@@@ apiKey", apiKey)

	const [balance, setBalance] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	// const [usageData, setUsageData] = useState<UsageTransaction[]>([])
	const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])
	const [user, setUserInfo] = useState<UserInfo>()

	const { t } = useTranslation()

	// Fetch all account data when component mounts using gRPC
	useEffect(() => {
		console.log("@@@ apiConfiguration", apiConfiguration)
		if (apiKey) {
			setIsLoading(true)
			AccountServiceClient.fetchUserCreditsData(EmptyRequest.create())
				.then((response) => {
					// setBalance(response.balance?.currentBalance || 0)
					// setUsageData(response.usageTransactions)
					// setPaymentsData(response.paymentTransactions)
					console.log("@@@@@111,response:", response)
					if (response.user) {
						setUserInfo(response.user)
					}
					setIsLoading(false)
				})
				.catch((error) => {
					console.error("Failed to fetch user credits data:", error)
					setIsLoading(false)
				})
		}
	}, [apiKey])

	const [showLoginAlert, setShowLoginAlert] = useState(false)
	const [showLogoutAlert, setShowLogoutAlert] = useState(false)

	const handleLogin = () => {
		setShowLoginAlert(true)
		setTimeout(() => setShowLoginAlert(false), 3000)
	}

	const handleLogout = () => {
		setShowLogoutAlert(true)
		setTimeout(() => setShowLogoutAlert(false), 3000)
	}
	return (
		<div className="h-full flex flex-col">
			{user ? (
				<div className="flex flex-col pr-3 h-full">
					{
						<div className="flex flex-col w-full">
							<div className="flex items-center mb-6 flex-wrap gap-y-4">
								{user.photoUrl ? (
									<img alt="Profile" className="size-16 rounded-full mr-4" src={user.photoUrl} />
								) : (
									<div className="size-16 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-2xl text-[var(--vscode-button-foreground)] mr-4">
										{user.displayName?.[0] || user.email?.[0] || "?"}
									</div>
								)}

								<div className="flex flex-col">
									{user.displayName && (
										<h2 className="text-[var(--vscode-foreground)] m-0 mb-1 text-lg font-medium">
											{user.displayName}
										</h2>
									)}

									{user.email && (
										<div className="text-sm text-[var(--vscode-descriptionForeground)]">{user.email}</div>
									)}
								</div>
							</div>
						</div>
					}

					<div className="text-sm text-[var(--vscode-descriptionForeground)] mb-2">{t("account.loggedIn")}</div>
					{showLogoutAlert && (
						<Alert variant="default" className="mb-4" isDismissible={false}>
							<AlertDescription className="flex items-center gap-2">
								<InfoIcon className="size-3 shrink-0" />
								This feature is not yet available. Please stay tuned.
							</AlertDescription>
						</Alert>
					)}
					<div className="w-full flex gap-2 flex-col min-[225px]:flex-row">
						<div className="w-full min-[225px]:w-1/2">
							<VSCodeButtonLink appearance="primary" className="w-full" href={VALUE_CODEE_BASE_URL}>
								{t("account.dashboard")}
							</VSCodeButtonLink>
						</div>
						<VSCodeButton appearance="secondary" className="w-full min-[225px]:w-1/2" onClick={handleLogout}>
							{t("account.logout")}
						</VSCodeButton>
					</div>

					<VSCodeDivider className="w-full my-6" />

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-[var(--vscode-sideBar-background)] rounded-lg p-4 border border-[var(--vscode-sideBar-border)]">
							<div className="flex items-center">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
									<span className="codicon codicon-key text-green-500 text-sm"></span>
								</div>
								<div>
									<div className="text-xs text-[var(--vscode-descriptionForeground)]">
										{t("account.currentBalance")}
									</div>
									<div className="text-lg font-semibold text-[var(--vscode-foreground)]">
										${(user.quota ?? 0) / 500000}
									</div>
								</div>
							</div>
						</div>

						<div className="bg-[var(--vscode-sideBar-background)] rounded-lg p-4 border border-[var(--vscode-sideBar-border)]">
							<div className="flex items-center">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
									<span className="codicon codicon-history text-blue-500 text-sm"></span>
								</div>
								<div>
									<div className="text-xs text-[var(--vscode-descriptionForeground)]">
										{t("account.historyConsumption")}
									</div>
									<div className="text-lg font-semibold text-[var(--vscode-foreground)]">
										${(user.usedQuota ?? 0) / 500000}
									</div>
								</div>
							</div>
						</div>

						<div className="bg-[var(--vscode-sideBar-background)] rounded-lg p-4 border border-[var(--vscode-sideBar-border)]">
							<div className="flex items-center">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
									<span className="codicon codicon-symbol-event text-purple-500 text-sm"></span>
								</div>
								<div>
									<div className="text-xs text-[var(--vscode-descriptionForeground)]">
										{t("account.usageCount")}
									</div>
									<div className="text-lg font-semibold text-[var(--vscode-foreground)]">
										{user.requestCount}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center pr-3">
					<CodeeLogoVariable className="size-16 mb-4" />

					<p style={{}}>{t("account.signUpMessage")}</p>

					{showLoginAlert && (
						<Alert variant="default" className="mb-4" isDismissible={false}>
							<AlertDescription className="flex items-center gap-2">
								<InfoIcon className="size-3 shrink-0" />
								This feature is not yet available. Please stay tuned.
							</AlertDescription>
						</Alert>
					)}
					<VSCodeButton className="w-full mb-4" onClick={handleLogin}>
						{t("account.signUpButton")}
					</VSCodeButton>

					<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
						{t("account.agreementPart1")} <VSCodeLink href="">{t("account.termsOfService")}</VSCodeLink>{" "}
						{t("account.agreementPart2")} <VSCodeLink href="">{t("account.privacyPolicy")}</VSCodeLink>
					</p>
				</div>
			)}
		</div>
	)
}

export default memo(AccountView)
