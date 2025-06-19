import { LLMOptions } from "../../index.js"

import OpenAI from "./OpenAI.js"

class Fireworks extends OpenAI {
	static override providerName = "fireworks"
	static override defaultOptions: Partial<LLMOptions> = {
		apiBase: "https://api.fireworks.ai/inference/v1",
	}

	private static modelConversion: { [key: string]: string } = {
		"starcoder-7b": "accounts/fireworks/models/starcoder-7b",
	}
	protected override _convertModelName(model: string): string {
		return Fireworks.modelConversion[model] ?? model
	}
}

export default Fireworks
