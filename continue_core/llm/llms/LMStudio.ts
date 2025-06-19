import { LLMOptions } from "../../index.js"

import OpenAI from "./OpenAI.js"

class LMStudio extends OpenAI {
	static override providerName = "lmstudio"
	static override defaultOptions: Partial<LLMOptions> = {
		apiBase: "http://localhost:1234/v1/",
	}
}

export default LMStudio
