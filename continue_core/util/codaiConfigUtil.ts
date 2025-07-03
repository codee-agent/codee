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
	autocomplete: {
		provider: string
		title: string
		model: string
		apiKey: string
		apiBase: string
		enable: boolean
	}
	advanced: {
		memorybank: boolean
	}
	language: string
}

const DEFAULT_CONFIG: CodeeConfig = {
	autocomplete: {
		provider: "Openai Compatiable",
		title: "autocomplete-coder",
		model: "",
		apiKey: "",
		apiBase: "",
		enable: false,
	},
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
	return JSON.parse(fs.readFileSync(configPath, "utf8"))
}

export function updateCodeeConfig(config: Partial<CodeeConfig>): void {
	const currentConfig = getCodeeConfig()
	let newConfig = { ...currentConfig, ...config }
	// console.log("@@@@@@@@@,config1:",newConfig)
	let url = newConfig.autocomplete.apiBase
	let key = newConfig.autocomplete.apiKey
	newConfig.autocomplete.apiBase = AesUtil.aesEncrypt(url)
	newConfig.autocomplete.apiKey = AesUtil.aesEncrypt(key)
	// console.log("@@@@@@@@@,config2:",newConfig)
	fs.writeFileSync(getCodeeConfigJsonPath(), JSON.stringify(newConfig, null, 2))
}

export function getAutocompleteConfig() {
	let autocompleteConfig = getCodeeConfig().autocomplete
	autocompleteConfig.apiBase = AesUtil.aesDecrypt(autocompleteConfig.apiBase)
	autocompleteConfig.apiKey = AesUtil.aesDecrypt(autocompleteConfig.apiKey)
	// console.log("@@@@@@@@@,config0:",autocompleteConfig)
	return autocompleteConfig
}

export function updateAutocompleteConfig(config: Partial<CodeeConfig["autocomplete"]>) {
	const currentConfig = getCodeeConfig()
	updateCodeeConfig({
		autocomplete: {
			...currentConfig.autocomplete,
			...config,
		},
	})
}

export function getLanguageConfig(): string {
	const lang = getCodeeConfig().language || "en"
	return lang
}

export function updateLanguageConfig(language: string): void {
	updateCodeeConfig({ language })
}

export function getAdvancedConfig() {
	const advanced = getCodeeConfig().advanced
	return advanced
}

export function updateAdvancedConfig(advanced: Partial<CodeeConfig["advanced"]>): void {
	const currentConfig = getCodeeConfig()
	updateCodeeConfig({
		advanced: {
			...currentConfig.advanced,
			...advanced,
		},
	})
}
