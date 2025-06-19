import fs from "node:fs"
import path from "path"

import Parser, { Language } from "web-tree-sitter"
import { FileSymbolMap, IDE, SymbolWithRange } from ".."
import { getUriFileExtension } from "./uri"

export enum LanguageName {
	CPP = "cpp",
	C_SHARP = "c_sharp",
	C = "c",
	CSS = "css",
	PHP = "php",
	BASH = "bash",
	JSON = "json",
	TYPESCRIPT = "typescript",
	TSX = "tsx",
	ELM = "elm",
	JAVASCRIPT = "javascript",
	PYTHON = "python",
	ELISP = "elisp",
	ELIXIR = "elixir",
	GO = "go",
	EMBEDDED_TEMPLATE = "embedded_template",
	HTML = "html",
	JAVA = "java",
	LUA = "lua",
	OCAML = "ocaml",
	QL = "ql",
	RESCRIPT = "rescript",
	RUBY = "ruby",
	RUST = "rust",
	SYSTEMRDL = "systemrdl",
	TOML = "toml",
	SOLIDITY = "solidity",
}

export const supportedLanguages: { [key: string]: LanguageName } = {
	cpp: LanguageName.CPP,
	hpp: LanguageName.CPP,
	cc: LanguageName.CPP,
	cxx: LanguageName.CPP,
	hxx: LanguageName.CPP,
	cp: LanguageName.CPP,
	hh: LanguageName.CPP,
	inc: LanguageName.CPP,
	// Depended on this PR: https://github.com/tree-sitter/tree-sitter-cpp/pull/173
	// ccm: LanguageName.CPP,
	// c++m: LanguageName.CPP,
	// cppm: LanguageName.CPP,
	// cxxm: LanguageName.CPP,
	cs: LanguageName.C_SHARP,
	c: LanguageName.C,
	h: LanguageName.C,
	css: LanguageName.CSS,
	php: LanguageName.PHP,
	phtml: LanguageName.PHP,
	php3: LanguageName.PHP,
	php4: LanguageName.PHP,
	php5: LanguageName.PHP,
	php7: LanguageName.PHP,
	phps: LanguageName.PHP,
	"php-s": LanguageName.PHP,
	bash: LanguageName.BASH,
	sh: LanguageName.BASH,
	json: LanguageName.JSON,
	ts: LanguageName.TYPESCRIPT,
	mts: LanguageName.TYPESCRIPT,
	cts: LanguageName.TYPESCRIPT,
	tsx: LanguageName.TSX,
	// vue: LanguageName.VUE,  // tree-sitter-vue parser is broken
	// The .wasm file being used is faulty, and yaml is split line-by-line anyway for the most part
	// yaml: LanguageName.YAML,
	// yml: LanguageName.YAML,
	elm: LanguageName.ELM,
	js: LanguageName.JAVASCRIPT,
	jsx: LanguageName.JAVASCRIPT,
	mjs: LanguageName.JAVASCRIPT,
	cjs: LanguageName.JAVASCRIPT,
	py: LanguageName.PYTHON,
	// ipynb: LanguageName.PYTHON, // It contains Python, but the file format is a ton of JSON.
	pyw: LanguageName.PYTHON,
	pyi: LanguageName.PYTHON,
	el: LanguageName.ELISP,
	emacs: LanguageName.ELISP,
	ex: LanguageName.ELIXIR,
	exs: LanguageName.ELIXIR,
	go: LanguageName.GO,
	eex: LanguageName.EMBEDDED_TEMPLATE,
	heex: LanguageName.EMBEDDED_TEMPLATE,
	leex: LanguageName.EMBEDDED_TEMPLATE,
	html: LanguageName.HTML,
	htm: LanguageName.HTML,
	java: LanguageName.JAVA,
	lua: LanguageName.LUA,
	luau: LanguageName.LUA,
	ocaml: LanguageName.OCAML,
	ml: LanguageName.OCAML,
	mli: LanguageName.OCAML,
	ql: LanguageName.QL,
	res: LanguageName.RESCRIPT,
	resi: LanguageName.RESCRIPT,
	rb: LanguageName.RUBY,
	erb: LanguageName.RUBY,
	rs: LanguageName.RUST,
	rdl: LanguageName.SYSTEMRDL,
	toml: LanguageName.TOML,
	sol: LanguageName.SOLIDITY,

	// jl: LanguageName.JULIA,
	// swift: LanguageName.SWIFT,
	// kt: LanguageName.KOTLIN,
	// scala: LanguageName.SCALA,
}

export const IGNORE_PATH_PATTERNS: Partial<Record<LanguageName, RegExp[]>> = {
	[LanguageName.TYPESCRIPT]: [/.*node_modules/],
	[LanguageName.JAVASCRIPT]: [/.*node_modules/],
}

let isParserInitialized = false
let emscriptenRuntime: any = null

async function initializeParser() {
	if (!isParserInitialized) {
		console.log("##### 开始初始化 Parser")

		// 加载 Emscripten 运行时
		const runtimePath = path.join(__dirname, "tree-sitter.js")
		// console.log("##### 尝试加载 Emscripten 运行时，路径:", runtimePath);
		// console.log("##### __dirname:", __dirname);

		if (fs.existsSync(runtimePath)) {
			// console.log("##### 找到 Emscripten 运行时文件");
			try {
				// 使用 require 而不是动态导入
				// console.log("##### 开始 require Emscripten 运行时");
				emscriptenRuntime = require(runtimePath)
				// console.log("##### Emscripten 运行时加载成功:", emscriptenRuntime ? "是" : "否");

				// 检查 Emscripten 运行时的关键函数
				// console.log("##### 检查 Emscripten 运行时函数:");
				// console.log("##### emscripten_memcpy_js 是否存在:", typeof emscriptenRuntime.emscripten_memcpy_js === "function");
				// console.log("##### Module 对象:", emscriptenRuntime.Module ? "存在" : "不存在");
				// console.log("##### Module 对象内容:", emscriptenRuntime.Module ? Object.keys(emscriptenRuntime.Module) : "不存在");

				// 确保 Emscripten 运行时环境已经初始化
				if (typeof emscriptenRuntime.ready === "function") {
					// console.log("##### 等待 Emscripten 运行时初始化");
					await emscriptenRuntime.ready
					// console.log("##### Emscripten 运行时初始化完成");
				} else {
					// console.log("##### Emscripten 运行时没有 ready 函数");
				}
			} catch (e) {
				// console.error("##### 加载 Emscripten 运行时失败:", e);
			}
		} else {
			// console.error("##### 未找到 Emscripten 运行时文件");
		}

		try {
			console.log("##### 开始初始化 Parser")
			// console.log("##### 当前工作目录:", process.cwd());
			// console.log("##### 检查 WASM 文件是否存在:", fs.existsSync(path.join(__dirname, "tree-sitter.wasm")));

			// 检查 WASM 文件内容
			const wasmPath = path.join(__dirname, "tree-sitter.wasm")
			if (fs.existsSync(wasmPath)) {
				const wasmStats = fs.statSync(wasmPath)
				console.log("##### WASM 文件大小:", wasmStats.size, "bytes")
			}

			await Parser.init({
				locateFile: (scriptName: string, scriptDirectory: string) => {
					const fullPath = path.join(__dirname, scriptName)
					console.log("##### locateFile 被调用:", { scriptName, scriptDirectory, fullPath })
					return fullPath
				},
				// 提供 Emscripten 运行时环境
				...(emscriptenRuntime ? { Module: emscriptenRuntime } : {}),
			})
			console.log("##### Parser 初始化成功")
			isParserInitialized = true
		} catch (e) {
			console.error("##### Parser 初始化失败:", e)
			throw e
		}
	}
}

export async function getParserForFile(filepath: string) {
	try {
		// console.log("##### 开始获取 Parser，文件:", filepath);
		await initializeParser()
		const parser = new Parser()
		console.log("##### Parser 实例创建成功")

		const language = await getLanguageForFile(filepath)
		if (!language) {
			console.log("##### 无法获取语言支持")
			return undefined
		}
		// console.log("##### 语言支持获取成功");

		parser.setLanguage(language)
		console.log("##### 语言设置成功")

		return parser
	} catch (e) {
		console.error("##### 获取 Parser 失败:", e)
		return undefined
	}
}

// Loading the wasm files to create a Language object is an expensive operation and with
// sufficient number of files can result in errors, instead keep a map of language name
// to Language object
const nameToLanguage = new Map<string, Language>()

export async function getLanguageForFile(filepath: string): Promise<Language | undefined> {
	try {
		await initializeParser()
		const extension = getUriFileExtension(filepath)

		const languageName = supportedLanguages[extension]
		if (!languageName) {
			return undefined
		}
		let language = nameToLanguage.get(languageName)

		if (!language) {
			language = await loadLanguageForFileExt(extension)
			nameToLanguage.set(languageName, language)
		}
		return language
	} catch (e) {
		console.debug("Unable to load language for file", filepath, e)
		return undefined
	}
}

export const getFullLanguageName = (filepath: string) => {
	const extension = getUriFileExtension(filepath)
	return supportedLanguages[extension]
}

export async function getQueryForFile(filepath: string, queryPath: string): Promise<Parser.Query | undefined> {
	const language = await getLanguageForFile(filepath)
	if (!language) {
		return undefined
	}

	const sourcePath = path.join(
		__dirname,
		"..",
		...(process.env.NODE_ENV === "test" ? ["extensions", "vscode", "tree-sitter"] : ["tree-sitter"]),
		queryPath,
	)
	if (!fs.existsSync(sourcePath)) {
		return undefined
	}
	const querySource = fs.readFileSync(sourcePath).toString()

	const query = language.query(querySource)
	return query
}

async function loadLanguageForFileExt(fileExtension: string): Promise<Language> {
	const wasmPath = path.join(__dirname, `tree-sitter-${supportedLanguages[fileExtension]}.wasm`)
	console.log("##### 尝试加载语言 WASM 文件:", wasmPath)
	console.log("##### 文件是否存在:", fs.existsSync(wasmPath))

	try {
		const language = await Parser.Language.load(wasmPath)
		console.log("##### 语言 WASM 文件加载成功")
		return language
	} catch (e) {
		console.error("##### 语言 WASM 文件加载失败:", e)
		throw e
	}
}

// See https://tree-sitter.github.io/tree-sitter/using-parsers
const GET_SYMBOLS_FOR_NODE_TYPES: Parser.SyntaxNode["type"][] = [
	"class_declaration",
	"class_definition",
	"function_item", // function name = first "identifier" child
	"function_definition",
	"method_declaration", // method name = first "identifier" child
	"method_definition",
	"generator_function_declaration",
	// property_identifier
	// field_declaration
	// "arrow_function",
]

export async function getSymbolsForFile(filepath: string, contents: string): Promise<SymbolWithRange[] | undefined> {
	const parser = await getParserForFile(filepath)
	if (!parser) {
		return
	}

	let tree: Parser.Tree
	try {
		tree = parser.parse(contents)
	} catch (e) {
		console.log(`Error parsing file: ${filepath}`)
		return
	}
	// console.log(`file: ${filepath}`);

	// Function to recursively find all named nodes (classes and functions)
	const symbols: SymbolWithRange[] = []
	function findNamedNodesRecursive(node: Parser.SyntaxNode) {
		// console.log(`node: ${node.type}, ${node.text}`);
		if (GET_SYMBOLS_FOR_NODE_TYPES.includes(node.type)) {
			// console.log(`parent: ${node.type}, ${node.text.substring(0, 200)}`);
			// node.children.forEach((child) => {
			//   console.log(`child: ${child.type}, ${child.text}`);
			// });

			// Empirically, the actual name is the last identifier in the node
			// Especially with languages where return type is declared before the name
			// TODO use findLast in newer version of node target
			let identifier: Parser.SyntaxNode | undefined = undefined
			for (let i = node.children.length - 1; i >= 0; i--) {
				if (node.children[i].type === "identifier" || node.children[i].type === "property_identifier") {
					identifier = node.children[i]
					break
				}
			}

			if (identifier?.text) {
				symbols.push({
					filepath,
					type: node.type,
					name: identifier.text,
					range: {
						start: {
							character: node.startPosition.column,
							line: node.startPosition.row,
						},
						end: {
							character: node.endPosition.column + 1,
							line: node.endPosition.row + 1,
						},
					},
					content: node.text,
				})
			}
		}
		node.children.forEach(findNamedNodesRecursive)
	}
	findNamedNodesRecursive(tree.rootNode)
	return symbols
}

export async function getSymbolsForManyFiles(uris: string[], ide: IDE): Promise<FileSymbolMap> {
	const filesAndSymbols = await Promise.all(
		uris.map(async (uri): Promise<[string, SymbolWithRange[]]> => {
			const contents = await ide.readFile(uri)
			let symbols = undefined
			try {
				symbols = await getSymbolsForFile(uri, contents)
			} catch (e) {
				console.error(`Failed to get symbols for ${uri}:`, e)
			}
			return [uri, symbols ?? []]
		}),
	)
	return Object.fromEntries(filesAndSymbols)
}
