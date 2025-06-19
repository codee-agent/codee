import { LLMOptions } from "../.."
import { LlmApiRequestType } from "../openaiTypeConverters"

import OpenAI from "./OpenAI"

export class Relace extends OpenAI {
	static override providerName = "relace"
	static override defaultOptions: Partial<LLMOptions> | undefined = {
		apiBase: "https://instantapply.endpoint.relace.run/v1/",
	}
	protected override useOpenAIAdapterFor: (LlmApiRequestType | "*")[] = ["*"]
}
