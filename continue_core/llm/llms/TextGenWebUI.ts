import { LLMOptions } from "../../index.js"

import OpenAI from "./OpenAI.js"

class TextGenWebUI extends OpenAI {
	static override providerName = "text-gen-webui"
	static override defaultOptions: Partial<LLMOptions> = {
		apiBase: "http://localhost:5000/v1/",
	}
}

export default TextGenWebUI
