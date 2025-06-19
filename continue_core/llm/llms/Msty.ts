import { LLMOptions } from "../../index.js"

import Ollama from "./Ollama.js"

class Msty extends Ollama {
	static override providerName = "msty"
	static override defaultOptions: Partial<LLMOptions> = {
		apiBase: "http://localhost:10000",
		model: "codellama-7b",
	}
}

export default Msty
