import { LLMOptions } from "../../index.js"

import OpenAI from "./OpenAI.js"

class xAI extends OpenAI {
	static override providerName = "xAI"
	static override defaultOptions: Partial<LLMOptions> = {
		apiBase: "https://api.x.ai/v1/",
	}

	private static MODEL_IDS: { [name: string]: string } = {
		"grok-beta": "grok-beta", // Future names might not line up
	}

	protected override _convertModelName(model: string) {
		return xAI.MODEL_IDS[model] || this.model
	}
}

export default xAI
