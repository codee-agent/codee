import { LLMOptions } from "../../index.js"

import OpenAI from "./OpenAI.js"

class Cerebras extends OpenAI {
	static override providerName = "cerebras"
	static override defaultOptions: Partial<LLMOptions> = {
		apiBase: "https://api.cerebras.ai/v1/",
	}
	override maxStopWords: number | undefined = 4

	private static modelConversion: { [key: string]: string } = {
		"llama3.1-8b": "llama3.1-8b",
		"llama3.1-70b": "llama3.1-70b",
	}
	protected override _convertModelName(model: string): string {
		return Cerebras.modelConversion[model] ?? model
	}
}

export default Cerebras
