import { LLMOptions } from "../../index.js"

import OpenAI from "./OpenAI.js"

class DeepInfra extends OpenAI {
	static override providerName = "deepinfra"
	static override defaultOptions: Partial<LLMOptions> = {
		apiBase: "https://api.deepinfra.com/v1/openai/",
	}
	override maxStopWords: number | undefined = 16

	protected override async _embed(chunks: string[]): Promise<number[][]> {
		const resp = await this.fetch(`https://api.deepinfra.com/v1/inference/${this.model}`, {
			method: "POST",
			headers: {
				Authorization: `bearer ${this.apiKey}`,
			},
			body: JSON.stringify({ inputs: chunks }),
		})

		const data = await resp.json()
		return data.embeddings
	}
}

export default DeepInfra
