import { LLMOptions } from "../.."

import OpenAI from "./OpenAI"

class Kindo extends OpenAI {
	static override providerName = "kindo"
	static override defaultOptions: Partial<LLMOptions> = {
		apiBase: "https://llm.kindo.ai/v1",
		requestOptions: {
			headers: {
				"kindo-token-transaction-type": "CONTINUE",
			},
		},
	}
}

export default Kindo
