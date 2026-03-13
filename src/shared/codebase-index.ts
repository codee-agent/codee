
export interface codebaseIndexConfigInfo {
  codebaseIndexEnabled: boolean
  codebaseIndexQdrantUrl?: string
  codebaseIndexEmbedderProvider?: string
  codebaseIndexEmbedderBaseUrl?: string
  codebaseIndexEmbedderModelId?: string
  codebaseIndexSearchMinScore?: number | undefined
  codebaseIndexSearchMaxResults?: number | undefined
  codebaseIndexEmbedderModelDimension? : number | undefined
  codebaseIndexOpenAiCompatibleBaseUrl?: string | undefined
  codeIndexOpenAiKey?: string | undefined
  codeIndexQdrantApiKey?: string | undefined
  codebaseIndexOpenAiCompatibleApiKey?: string | undefined
  codebaseIndexGeminiApiKey?: string | undefined
  codebaseIndexMistralApiKey?: string | undefined
  codebaseIndexVercelAiGatewayApiKey?: string | undefined
}

export const CODEBASE_INDEX_DEFAULTS = {
	MIN_SEARCH_RESULTS: 10,
	MAX_SEARCH_RESULTS: 200,
	DEFAULT_SEARCH_RESULTS: 50,
	SEARCH_RESULTS_STEP: 10,
	MIN_SEARCH_SCORE: 0,
	MAX_SEARCH_SCORE: 1,
	DEFAULT_SEARCH_MIN_SCORE: 0.4,
	SEARCH_SCORE_STEP: 0.05,
} as const
