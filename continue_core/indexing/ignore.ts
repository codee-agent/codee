import fs from "fs"

import ignore from "ignore"

import { getGlobalContinueIgnorePath } from "../util/paths"

export const DEFAULT_IGNORE_FILETYPES = [
	"*.DS_Store",
	"*-lock.json",
	"*.lock",
	"*.log",
	"*.ttf",
	"*.png",
	"*.jpg",
	"*.jpeg",
	"*.gif",
	"*.mp4",
	"*.svg",
	"*.ico",
	"*.pdf",
	"*.zip",
	"*.gz",
	"*.tar",
	"*.dmg",
	"*.tgz",
	"*.rar",
	"*.7z",
	"*.exe",
	"*.dll",
	"*.obj",
	"*.o",
	"*.o.d",
	"*.a",
	"*.lib",
	"*.so",
	"*.dylib",
	"*.ncb",
	"*.sdf",
	"*.woff",
	"*.woff2",
	"*.eot",
	"*.cur",
	"*.avi",
	"*.mpg",
	"*.mpeg",
	"*.mov",
	"*.mp3",
	"*.mp4",
	"*.mkv",
	"*.mkv",
	"*.webm",
	"*.jar",
	"*.onnx",
	"*.parquet",
	"*.pqt",
	"*.wav",
	"*.webp",
	"*.db",
	"*.sqlite",
	"*.wasm",
	"*.plist",
	"*.profraw",
	"*.gcda",
	"*.gcno",
	"go.sum",
	"*.env",
	"*.gitignore",
	"*.gitkeep",
	"*.codeeignore",
	"config.json",
	"config.yaml",
	"*.csv",
	"*.uasset",
	"*.pdb",
	"*.bin",
	"*.pag",
	"*.swp",
	"*.jsonl",
	// "*.prompt", // can be incredibly confusing for the LLM to have another set of instructions injected into the prompt
]

export const defaultIgnoreFile = ignore().add(DEFAULT_IGNORE_FILETYPES)
export const DEFAULT_IGNORE_DIRS = [
	".git/",
	".svn/",
	".vscode/",
	".idea/",
	".vs/",
	"venv/",
	".venv/",
	"env/",
	".env/",
	"node_modules/",
	"dist/",
	"build/",
	"Build/",
	"target/",
	"out/",
	"bin/",
	".pytest_cache/",
	".vscode-test/",
	".continue/",
	"__pycache__/",
	"site-packages/",
	".gradle/",
	".mvn/",
	".cache/",
	"gems/",
	"vendor/",
]

export const defaultIgnoreDir = ignore().add(DEFAULT_IGNORE_DIRS)

export const DEFAULT_IGNORE = DEFAULT_IGNORE_FILETYPES.join("\n") + "\n" + DEFAULT_IGNORE_DIRS.join("\n")

export const defaultIgnoreFileAndDir = ignore().add(defaultIgnoreFile).add(defaultIgnoreDir)

export function gitIgArrayFromFile(file: string) {
	return file
		.split(/\r?\n/) // Split on new line
		.map((l) => l.trim()) // Remove whitespace
		.filter((l) => !/^#|^$/.test(l)) // Remove empty lines
}

export const getGlobalContinueIgArray = () => {
	const contents = fs.readFileSync(getGlobalContinueIgnorePath(), "utf8")
	return gitIgArrayFromFile(contents)
}
