import { UserCreditsData } from "@/shared/proto/index.cline"
import type { Controller } from "../index"
import type { EmptyRequest } from "@shared/proto/cline/common"

/**
 * Handles fetching all user credits data (balance, usage, payments)
 * @param controller The controller instance
 * @param request Empty request
 * @returns User credits data response
 */
export async function fetchUserCreditsData(controller: Controller, request: EmptyRequest): Promise<UserCreditsData> {
	try {
		if (!controller.accountService) {
			throw new Error("Account service not available")
		}

		// Call the individual RPC variants in parallel
		// const [balance, usageTransactions, paymentTransactions] = await Promise.all([
		// 	controller.accountService.fetchBalanceRPC(),
		// 	controller.accountService.fetchUsageTransactionsRPC(),
		// 	controller.accountService.fetchPaymentTransactionsRPC(),
		// ])
		const [usrInfo] = await Promise.all([controller.accountService.fetchUserInfo()])

		// Since generated types match exactly, no conversion needed!
		return UserCreditsData.create({
			// balance: balance ? { currentBalance: balance.currentBalance } : { currentBalance: 0 },
			// usageTransactions: usageTransactions || [],
			// paymentTransactions: paymentTransactions || [],
			user: usrInfo,
		})
	} catch (error) {
		console.error(`Failed to fetch user credits data: ${error}`)
		throw error
	}
}
