import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import type { BalanceResponse, CodeeUserInfo, OrganizationBalanceResponse, OrganizationUsageTransaction, PaymentTransaction, UsageTransaction, UserResponse } from "@shared/ClineAccount"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { VALUE_CODEE_BASE_URL } from "webview-ui/src/values"

export class ClineAccountService {
	private readonly baseUrl = VALUE_CODEE_BASE_URL
	private getCodeeApiKey: () => Promise<string | undefined>
	private getCodeeToken: () => Promise<string | undefined>
	private setCodeeId: (codeeId: number, userName: string) => Promise<void>

	constructor(
		getCodeeApiKey: () => Promise<string | undefined>,
		getCodeeToken: () => Promise<string | undefined>,
		setCodeeId: (codeeId: number, userName: string) => Promise<void>,
	) {
		this.getCodeeApiKey = getCodeeApiKey
		this.getCodeeToken = getCodeeToken
		this.setCodeeId = setCodeeId
	}

	/**
	 * Helper function to make authenticated requests to the Cline API
	 * @param endpoint The API endpoint to call (without the base URL)
	 * @param config Additional axios request configuration
	 * @returns The API response data
	 * @throws Error if the API key is not found or the request fails
	 */
	private async authenticatedRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const codeeApiKey = await this.getCodeeApiKey()
		const codeeToken = await this.getCodeeToken()

		if (!codeeApiKey) {
			throw new Error("Codee API key not found")
		}

		const url = `${this.baseUrl}${endpoint}`
		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				Authorization: `Bearer ${codeeApiKey}`,
				"Content-Type": "application/json",
				"x-codee-auth-token": codeeToken,
				...config.headers,
			},
		}

		const response: AxiosResponse<T> = await axios.get(url, requestConfig)

		if (!response.data) {
			throw new Error(`Invalid response from ${endpoint} API`)
		}

		return response.data
	}

	/**
	 * RPC variant that fetches the user's current credit balance without posting to webview
	 * @returns Balance data or undefined if failed
	 */
	async fetchBalanceRPC(): Promise<BalanceResponse | undefined> {
		try {
			const data = await this.authenticatedRequest<BalanceResponse>("/user/credits/balance")
			return data
		} catch (error) {
			console.error("Failed to fetch balance (RPC):", error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's usage transactions without posting to webview
	 * @returns Usage transactions or undefined if failed
	 */
	async fetchUsageTransactionsRPC(): Promise<UsageTransaction[] | undefined> {
		try {
			const data = await this.authenticatedRequest<{ usageTransactions: UsageTransaction[] }>("/user/credits/usage")
			return data.usageTransactions
		} catch (error) {
			console.error("Failed to fetch usage transactions (RPC):", error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's payment transactions without posting to webview
	 * @returns Payment transactions or undefined if failed
	 */
	async fetchPaymentTransactionsRPC(): Promise<PaymentTransaction[] | undefined> {
		try {
			const data = await this.authenticatedRequest<{ paymentTransactions: PaymentTransaction[] }>("/user/credits/payments")
			return data.paymentTransactions
		} catch (error) {
			console.error("Failed to fetch payment transactions (RPC):", error)
			return undefined
		}
	}

	/**
	 * RPC variant that fetches the user's info without posting to webview
	 * @returns User info or undefined if failed
	 */
	async fetchUserInfo(): Promise<CodeeUserInfo | undefined> {
		try {
			const response = await this.authenticatedRequest<{
				data: {
					id: number
					username: string
					display_name: string
					status: number
					email: string
					quota: number
					used_quota: number
					request_count: number
				}
				message: string
				success: boolean
			}>("codee_api/self")

			const apiUser = response.data
			const codeeUser: CodeeUserInfo = {
				id: apiUser.id,
				username: apiUser.username,
				displayName: apiUser.display_name,
				status: apiUser.status,
				email: apiUser.email,
				quota: apiUser.quota,
				usedQuota: apiUser.used_quota,
				requestCount: apiUser.request_count,
			}
			this.setCodeeId(codeeUser.id, codeeUser.username)
			return codeeUser
		} catch (error) {
			console.error("Failed to fetch user info (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user data
	 * @returns UserResponse or undefined if failed
	 */
	async fetchMe(): Promise<UserResponse | undefined> {
		try {
			const data = await this.authenticatedRequest<UserResponse>(`/api/v1/users/me`)
			return data
		} catch (error) {
			console.error("Failed to fetch user data (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organizations
	 * @returns UserResponse["organizations"] or undefined if failed
	 */
	async fetchUserOrganizationsRPC(): Promise<UserResponse["organizations"] | undefined> {
		try {
			const me = await this.fetchMe()
			if (!me || !me.organizations) {
				console.error("Failed to fetch user organizations")
				return undefined
			}
			return me.organizations
		} catch (error) {
			console.error("Failed to fetch user organizations (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organization credits
	 * @returns {Promise<OrganizationBalanceResponse>} A promise that resolves to the active organization balance.
	 */
	async fetchOrganizationCreditsRPC(organizationId: string): Promise<OrganizationBalanceResponse | undefined> {
		try {
			const data = await this.authenticatedRequest<OrganizationBalanceResponse>(
				`/api/v1/organizations/${organizationId}/balance`,
			)
			return data
		} catch (error) {
			console.error("Failed to fetch active organization balance (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organization transactions
	 * @returns {Promise<OrganizationUsageTransaction[]>} A promise that resolves to the active organization transactions.
	 */
	async fetchOrganizationUsageTransactionsRPC(organizationId: string): Promise<OrganizationUsageTransaction[] | undefined> {
		try {
			const me = await this.fetchMe()
			if (!me || !me.id) {
				console.error("Failed to fetch user ID for active organization transactions")
				return undefined
			}
			const memberId = me.organizations.find((org) => org.organizationId === organizationId)?.memberId
			if (!memberId) {
				console.error("Failed to find member ID for active organization transactions")
				return undefined
			}
			const data = await this.authenticatedRequest<{ items: OrganizationUsageTransaction[] }>(
				`/api/v1/organizations/${organizationId}/members/${memberId}/usages`,
			)
			return data.items
		} catch (error) {
			console.error("Failed to fetch active organization transactions (RPC):", error)
			return undefined
		}
	}

	/**
	 * Switches the active account to the specified organization or personal account.
	 * @param organizationId - Optional organization ID to switch to. If not provided, it will switch to the personal account.
	 * @returns {Promise<void>} A promise that resolves when the account switch is complete.
	 * @throws {Error} If the account switch fails, an error will be thrown.
	 */
	// async switchAccount(organizationId?: string): Promise<void> {
	// 	// Call API to switch account
	// 	try {
	// 		// make XHR request to switch account
	// 		const _response = await this.authenticatedRequest<string>(`/api/v1/users/active-account`, {
	// 			method: "PUT",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 			data: {
	// 				organizationId: organizationId || null, // Pass organization if provided
	// 			},
	// 		})
	// 	} catch (error) {
	// 		console.error("Error switching account:", error)
	// 		throw error
	// 	} finally {
	// 		// After user switches account, we will force a refresh of the id token by calling this function that restores the refresh token and retrieves new auth info
	// 		await this._authService.restoreRefreshTokenAndRetrieveAuthInfo()
	// 	}
	// }
}
