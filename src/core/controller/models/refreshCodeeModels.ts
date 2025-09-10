import { Controller } from ".."
import axios from "axios"
import type { AxiosRequestConfig } from "axios"
import { EncryptUtil, getPluginVersion } from "@/utils/encrypt"
import { CodeeModelResponse } from "@/generated/grpc-js/cline/models"
import { StringRequest } from "@/generated/grpc-js/cline/common"

/**
 * Fetches available models from the OpenAI API
 * @param controller The controller instance
 * @param request Request containing the base URL and API key
 * @returns Array of model names
 */
export async function refreshCodeeModels(controller: Controller, request: StringRequest): Promise<CodeeModelResponse> {
	try {
		const codeeToken = await controller.getCodeeToken()
		const baseUrl = request.value
		if (!baseUrl) {
			return CodeeModelResponse.create({
				chatModels: [],
				completesModels: [],
			})
		}

		const config: AxiosRequestConfig = {}
		if (codeeToken) {
			config["headers"] = {
				"Content-Type": "application/json",
				"x-codee-auth-token": codeeToken,
				"X-Codee-Ver": "CodeeVsCodeExtension/" + getPluginVersion(),
			}
		}

		const response = await axios.get(`${baseUrl}/codee_api/llm_api_info`, config)
		const data = response.data?.data

		return CodeeModelResponse.create({
			chatModels: data?.chat_models || [],
			completesModels: data?.completion_models || [],
		})
	} catch (error) {
		console.error("Error fetching Codee models:", error)
		return CodeeModelResponse.create({
			chatModels: [],
			completesModels: [],
		})
	}
}
