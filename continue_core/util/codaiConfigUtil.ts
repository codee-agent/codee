import * as fs from "fs"
import * as path from "path"
import { getContinueGlobalPath } from "./paths"
import { AesUtil } from "./aesutil"

function getCodeeConfigJsonPath(): string {
	const p = path.join(getContinueGlobalPath(), "codeeConfig.json")
	if (!fs.existsSync(p)) {
		fs.writeFileSync(p, JSON.stringify(DEFAULT_CONFIG, null, 2))
	}
	return p
}

export interface CodeeConfig {
	autocomplete: Array<{
		provider: string
		title: string
		model: string
		apiKey: string
		apiBase: string
		enable: boolean
	}>
	currentCompleteProvider: string
	advanced: {
		memorybank: boolean
	}
	language: string
}

const DEFAULT_CONFIG: CodeeConfig = {
	autocomplete: [
		{
			provider: "Openai Compatiable",
			title: "autocomplete-coder",
			model: "",
			apiKey: "",
			apiBase: "",
			enable: false,
		},
		{
			provider: "codee",
			title: "autocomplete-coder",
			model: "",
			apiKey: "",
			apiBase: "",
			enable: false,
		},
	],
	currentCompleteProvider: "Openai Compatiable",
	advanced: {
		memorybank: false,
	},
	language: "en",
}

export function getCodeeConfig(): CodeeConfig {
	const configPath = getCodeeConfigJsonPath()
	if (!fs.existsSync(configPath)) {
		fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2))
		return DEFAULT_CONFIG
	}
	const config = JSON.parse(fs.readFileSync(configPath, "utf8"))
	if (!config.currentCompleteProvider) {
		config.currentCompleteProvider = "Openai Compatiable"
	}
	if (!Array.isArray(config.autocomplete)) {
		config.autocomplete = [
			config.autocomplete,
			{
				provider: "codee",
				title: "autocomplete-coder",
				model: "",
				apiKey: "",
				apiBase: "",
				enable: false,
			},
		]
	}
	return config
}

//type:0 自动补全 1 语言设置 2 高级设置
export function updateCodeeConfig(config: Partial<CodeeConfig>, type: number = 0): void {
	const currentConfig = getCodeeConfig()
	let newConfig = { ...currentConfig, ...config }

	if (type === 0 && newConfig.autocomplete) {
		const autocompleteConfig = newConfig.autocomplete.find((item) => item.provider === newConfig.currentCompleteProvider)
		if (!autocompleteConfig) return

		const url = autocompleteConfig.apiBase
		const key = autocompleteConfig.apiKey
		if (url === "" || key === "") {
			console.log("@@API Base and API Key都不能为空")
			return
		}

		autocompleteConfig.apiBase = AesUtil.aesEncrypt(url)
		autocompleteConfig.apiKey = AesUtil.aesEncrypt(key)
	}

	fs.writeFileSync(getCodeeConfigJsonPath(), JSON.stringify(newConfig, null, 2))
}

export function getAutocompleteConfig() {
	const config = getCodeeConfig()
	const autocompleteConfig = config.autocomplete.find((item) => item.provider === config.currentCompleteProvider)
	if (!autocompleteConfig) {
		throw new Error("No autocomplete config found for current provider")
	}
	return {
		...autocompleteConfig,
		apiBase: AesUtil.aesDecrypt(autocompleteConfig.apiBase),
		apiKey: AesUtil.aesDecrypt(autocompleteConfig.apiKey),
	}
}

export function getAllAutocompleteConfig(): Partial<CodeeConfig> {
	const config = getCodeeConfig()
	config.autocomplete.map((item) => {
		item.apiBase = item.apiBase ? AesUtil.aesDecrypt(item.apiBase) : item.apiBase
		item.apiKey = item.apiKey ? AesUtil.aesDecrypt(item.apiKey) : item.apiKey
	})
	return {
		autocomplete: config.autocomplete,
		currentCompleteProvider: config.currentCompleteProvider,
	}
}

export function updateAutocompleteConfig(config: Partial<CodeeConfig["autocomplete"][0]>) {
	const currentConfig = getCodeeConfig()
	const updatedAutocomplete = currentConfig.autocomplete.map((item) =>
		item.provider === config.provider
			? {
					...item,
					...config,
					apiBase: config.apiBase ? config.apiBase : AesUtil.aesDecrypt(item.apiBase),
					apiKey: config.apiKey ? config.apiKey : AesUtil.aesDecrypt(item.apiKey),
				}
			: item,
	)
	updateCodeeConfig({
		autocomplete: updatedAutocomplete,
		currentCompleteProvider: config.provider,
	})
}

export function getLanguageConfig(): string {
	const lang = getCodeeConfig().language || "en"
	return lang
}

export function updateLanguageConfig(language: string): void {
	updateCodeeConfig({ language }, 1)
}

export function getAdvancedConfig() {
	const advanced = getCodeeConfig().advanced
	return advanced
}

export function updateAdvancedConfig(advanced: Partial<CodeeConfig["advanced"]>): void {
	const currentConfig = getCodeeConfig()
	updateCodeeConfig(
		{
			advanced: {
				...currentConfig.advanced,
				...advanced,
			},
		},
		2,
	)
}
