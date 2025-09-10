import { CacheService } from "@/core/storage/CacheService"
import * as os from "os"
import * as vscode from "vscode"

/**
 * 获取当前操作系统名称
 * @returns 操作系统名称 (windows, darwin(macOS), linux等)
 */
export function getOperatingSystem(): string {
	return os.platform()
}

/**
 * 获取当前系统的用户名称
 * @returns 用户名称
 */
export function getUserName(): string {
	return os.userInfo().username
}

/**
 * 获取当前VSCode的版本信息
 * @returns VSCode版本号
 */
export function getVSCodeVersion(): string {
	return vscode.version
}

/**
 * 获取系统架构
 * @returns 系统架构 (x64, arm64等)
 */
export function getSystemArchitecture(): string {
	return os.arch()
}

/**
 * 获取系统主机名
 * @returns 主机名
 */
export function getHostName(): string {
	return os.hostname()
}

/**
 * 获取系统主机名
 * @returns 主机名
 */
export async function getCodeeId(cacheService?: CacheService): Promise<number> {
	if (cacheService) {
		const id = cacheService.getSecretKey("codeeId")
		return id ? Number(id) : -1
	}
	return -2
}

/**
 * 获取系统主机名
 * @returns 主机名
 */
export async function getCodeeUserName(cacheService?: CacheService): Promise<string> {
	if (cacheService) {
		const name = cacheService.getSecretKey("codeeUserName")
		return name ?? "Unknow"
	}
	return "unKnow"
}

/**
 * 获取所有系统信息并返回JSON字符串
 * @returns 包含所有系统信息的JSON字符串
 */
export async function getAllSystemInfo(cacheService?: CacheService): Promise<string> {
	const systemInfo = {
		operatingSystem: getOperatingSystem(),
		userName: getUserName(),
		vscodeVersion: getVSCodeVersion(),
		systemArchitecture: getSystemArchitecture(),
		hostName: getHostName(),
		codeeId: await getCodeeId(cacheService),
		codeeUserName: await getCodeeUserName(cacheService),
	}

	return JSON.stringify(systemInfo, null, 2)
}
