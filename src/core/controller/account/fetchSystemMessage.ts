import type { Controller } from "../index"
import type { EmptyRequest } from "@shared/proto/cline/common"
import { SystemMessageResponse } from "@shared/proto/cline/account"
import { VALUE_CODEE_BASE_URL } from "webview-ui/src/values"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { getPluginVersion } from "@/utils/encrypt"

interface ApiResponse {
	data: Array<{
		type: string
		content: string
	}>
	success: boolean
}

/**
 * Handles fetching system messages (update, system, other notifications)
 * @param controller The controller instance
 * @param request Empty request
 * @returns System message response
 */
export async function fetchSystemMessage(controller: Controller, request: EmptyRequest): Promise<SystemMessageResponse> {
	try {
		if (!controller.accountService) {
			throw new Error("Account service not available")
		}

		const codeeToken = await controller.getCodeeToken()

		if (!codeeToken) {
			throw new Error("codeeToken not found")
		}
		const endpoint = "codee_api/notification"
		const url = `${VALUE_CODEE_BASE_URL}${endpoint}`
		const config: AxiosRequestConfig = {}
		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				"Content-Type": "application/json",
				"x-codee-auth-token": codeeToken,
				"X-Codee-Ver": "CodeeVsCodeExtension/" + getPluginVersion(),
				...config.headers,
			},
		}

		const response: AxiosResponse<ApiResponse> = await axios.get(url, requestConfig)

		if (!response.data || !response.data.success) {
			throw new Error(`Invalid response from ${endpoint} API`)
		}

		// Convert API response to protobuf format
		return SystemMessageResponse.create({
			messages: response.data.data.map((msg) => ({
				type: msg.type,
				content: msg.content,
			})),
		})
	} catch (error) {
		console.error(`Failed to fetch system messages: ${error}`)
		throw error
	}
}
