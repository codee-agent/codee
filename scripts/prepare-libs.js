#!/usr/bin/env node

/**
 * 这个脚本用于为不同平台准备sqlite3二进制文件
 * 在开发时可以正常运行，在打包插件时会为多个平台准备文件
 */

const fs = require("fs")
const path = require("path")
const { execSync, spawnSync } = require("child_process")
const os = require("os")
const https = require("https")
const { promisify } = require("util")
const exec = promisify(require("child_process").exec)

// 定义支持的平台和架构
const platforms = [
	{ platform: "darwin", arch: "x64", nodeAbi: "darwin-x64" },
	{ platform: "darwin", arch: "arm64", nodeAbi: "darwin-arm64" },
	{ platform: "linux", arch: "x64", nodeAbi: "linux-x64" },
	{ platform: "linux", arch: "arm64", nodeAbi: "linux-arm64" },
	{ platform: "win32", arch: "x64", nodeAbi: "win32-x64" },
]

// 定义预编译二进制文件的下载源
const downloadSources = [
	{
		url: (version, nodeAbi) =>
			`https://github.com/TryGhost/node-sqlite3/releases/download/v${version}/sqlite3-v${version}-napi-v3-${nodeAbi.split("-")[2]}-${nodeAbi.split("-")[3]}.tar.gz`,
		name: "TryGhost",
	},
	{
		url: (version, nodeAbi) => `https://mapbox-node-binary.s3.amazonaws.com/sqlite3/v${version}/${nodeAbi}.tar.gz`,
		name: "Mapbox",
	},
]

// 创建临时目录
function createTempDir() {
	const tempDir = path.join(os.tmpdir(), `sqlite3-${Date.now()}`)
	fs.mkdirSync(tempDir, { recursive: true })
	return tempDir
}

// 下载文件
async function downloadFile(url, dest) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest)
		https
			.get(url, (response) => {
				if (response.statusCode !== 200) {
					reject(new Error(`下载失败: ${response.statusCode}`))
					return
				}
				response.pipe(file)
				file.on("finish", () => {
					file.close()
					resolve()
				})
			})
			.on("error", (err) => {
				fs.unlink(dest, () => {})
				reject(err)
			})
	})
}

// 解压文件
async function extractFile(archivePath, destDir) {
	try {
		if (process.platform === "win32") {
			await exec(`tar -xzf "${archivePath}" -C "${destDir}"`)
		} else {
			await exec(`tar -xzf "${archivePath}" -C "${destDir}"`)
		}
		return true
	} catch (error) {
		console.error(`解压失败: ${error.message}`)
		return false
	}
}

// 确保目录存在
function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

// 复制文件
function copyFile(src, dest) {
	ensureDir(path.dirname(dest))
	if (fs.existsSync(dest)) {
		fs.unlinkSync(dest)
	}
	fs.copyFileSync(src, dest)
	console.log(`已复制文件到: ${dest}`)
}

// 编译 sqlite3
async function compileSqlite3(platform, arch) {
	const tempDir = createTempDir()
	const version = "5.1.7"
	const nodeAbiVersion = "132"

	console.log(`开始为 ${platform}-${arch} 编译 sqlite3...`)

	try {
		// 设置环境变量
		const env = {
			...process.env,
			npm_config_platform: platform,
			npm_config_arch: arch,
			npm_config_target_platform: platform,
			npm_config_target_arch: arch,
		}

		// 安装 sqlite3
		await exec(`npm install sqlite3@${version} --build-from-source --target_platform=${platform} --target_arch=${arch}`, {
			env,
		})

		// 复制编译后的文件到目标目录
		const sourceDir = path.join(process.cwd(), "node_modules/sqlite3")
		const targetDir = path.join(
			process.cwd(),
			"node_modules/sqlite3",
			"lib",
			"binding",
			`node-v${nodeAbiVersion}-${platform}-${arch}`,
		)

		// 确保目标目录存在
		fs.mkdirSync(targetDir, { recursive: true })

		// 复制必要的文件
		const filesToCopy = ["node_sqlite3.node", "sqlite3.a", "sqlite3.lib"]

		for (const file of filesToCopy) {
			const sourcePath = path.join(sourceDir, "build", "Release", file)
			if (fs.existsSync(sourcePath)) {
				fs.copyFileSync(sourcePath, path.join(targetDir, file))
			}
		}

		// // 创建符号链接到预期的路径
		// const expectedPaths = [
		//     path.join(process.cwd(), 'build', 'node_sqlite3.node'),
		//     path.join(process.cwd(), 'build', 'Release', 'node_sqlite3.node'),
		//     path.join(process.cwd(), 'lib', 'binding', `node-v${nodeAbiVersion}-${platform}-${arch}`, 'node_sqlite3.node')
		// ];

		// for (const expectedPath of expectedPaths) {
		//     const dir = path.dirname(expectedPath);
		//     fs.mkdirSync(dir, { recursive: true });

		//     if (fs.existsSync(expectedPath)) {
		//         fs.unlinkSync(expectedPath);
		//     }

		//     fs.copyFileSync(
		//         path.join(targetDir, 'node_sqlite3.node'),
		//         expectedPath
		//     );
		//     console.log(`已复制二进制文件到: ${expectedPath}`);
		// }

		console.log(`成功为 ${platform}-${arch} 编译 sqlite3`)
		return true
	} catch (error) {
		console.error(`为 ${platform}-${arch} 编译失败: ${error.message}`)
		return false
	} finally {
		// 清理临时目录
		try {
			fs.rmSync(tempDir, { recursive: true, force: true })
		} catch (error) {
			console.error(`清理临时目录失败: ${error.message}`)
		}
	}
}

// 复制其他必要文件
function copyAdditionalFiles() {
	console.log("开始复制其他必要文件...")

	const distDir = path.join(__dirname, "..", "dist")
	ensureDir(distDir)

	// 复制 xhr-sync-worker.js
	const xhrWorkerSrc = path.join(
		__dirname,
		"..",
		"continue_core",
		"node_modules",
		"jsdom",
		"lib",
		"jsdom",
		"living",
		"xhr",
		"xhr-sync-worker.js",
	)
	const xhrWorkerDest = path.join(distDir, "xhr-sync-worker.js")
	if (fs.existsSync(xhrWorkerSrc)) {
		copyFile(xhrWorkerSrc, xhrWorkerDest)
	} else {
		console.warn(`警告: 找不到文件 ${xhrWorkerSrc}`)
	}

	// 复制 tiktokenWorkerPool.mjs
	const tiktokenWorkerSrc = path.join(__dirname, "..", "continue_core", "llm", "tiktokenWorkerPool.mjs")
	const tiktokenWorkerDest = path.join(distDir, "tiktokenWorkerPool.mjs")
	if (fs.existsSync(tiktokenWorkerSrc)) {
		copyFile(tiktokenWorkerSrc, tiktokenWorkerDest)
	} else {
		console.warn(`警告: 找不到文件 ${tiktokenWorkerSrc}`)
	}

	// 复制 llamaTokenizerWorkerPool.mjs
	const llamaWorkerSrc = path.join(__dirname, "..", "continue_core", "llm", "llamaTokenizerWorkerPool.mjs")
	const llamaWorkerDest = path.join(distDir, "llamaTokenizerWorkerPool.mjs")
	if (fs.existsSync(llamaWorkerSrc)) {
		copyFile(llamaWorkerSrc, llamaWorkerDest)
	} else {
		console.warn(`警告: 找不到文件 ${llamaWorkerSrc}`)
	}

	console.log("其他必要文件复制完成")
}

// 主函数
async function main() {
	console.log("开始准备跨平台 sqlite3 二进制文件...")

	// 为每个平台编译 sqlite3 暂时不编译，编译的话就需要分包分发插件，暂时一个包打出来，在extension.ts中去拷贝对应平台的库//huqb
	// for (const { platform, arch } of platforms) {
	//     await compileSqlite3(platform, arch);
	// }
	// console.log('sqlite3 跨平台编译完成!');

	// 复制其他必要文件
	copyAdditionalFiles()
}

// 运行主函数
main().catch((error) => {
	console.error("发生错误:", error)
	process.exit(1)
})
