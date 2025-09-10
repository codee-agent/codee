import crypto from "crypto"
import * as vscode from "vscode" // 正确引用

export class EncryptUtil {
	private static readonly AES_KEY = "a1b2c3d4e5f6g7h8a1b2c3d4e5f6g7h8" // 32字节密钥
	private static readonly AES_IV_LENGTH = 16 // AES块大小
	private static readonly ALGORITHM = "aes-256-cbc"
	/**
	 * 加密字符串
	 * @param input 要加密的字符串
	 * @returns 格式为 "时间戳-Base64字符串"
	 */
	static encrypt(input: string): string {
		// 获取当前时间戳
		const timestamp = Date.now().toString()

		// 拼接时间戳和输入字符串
		const combined = timestamp + input

		// 创建SHA-256哈希
		const hash = crypto.createHash("sha256").update(combined).digest()

		// 转换为Base64
		const base64 = hash.toString("base64")

		// 返回格式为 "时间戳-Base64字符串"
		return `${timestamp}-${base64}`
	}

	/**
	 * AES加密字符串
	 * @param text 要加密的字符串
	 * @returns 格式为 "iv.encryptedData" 的Base64字符串
	 */
	static aesEncrypt(text: string): string {
		const iv = crypto.randomBytes(this.AES_IV_LENGTH)
		const key = Buffer.from(this.AES_KEY, "utf8")
		const cipher = crypto.createCipheriv(this.ALGORITHM, Uint8Array.from(key), Uint8Array.from(iv))

		let encrypted = cipher.update(text, "utf8", "base64")
		encrypted += cipher.final("base64")

		return `${iv.toString("base64")}.${encrypted}`
	}

	/**
	 * AES解密字符串
	 * @param encryptedText 格式为 "iv.encryptedData" 的Base64字符串
	 * @returns 解密后的原始字符串
	 */
	static aesDecrypt(encryptedText: string): string {
		const [ivBase64, encryptedData] = encryptedText.split(".")
		const iv = Buffer.from(ivBase64, "base64")
		const key = Buffer.from(this.AES_KEY, "utf8")

		const decipher = crypto.createDecipheriv(this.ALGORITHM, Uint8Array.from(key), Uint8Array.from(iv))

		let decrypted = decipher.update(encryptedData, "base64", "utf8")
		decrypted += decipher.final("utf8")

		return decrypted
	}
}

// 工具函数示例//huqb
export function getPluginVersion() {
	const extension = vscode.extensions.getExtension("Codee.codee")
	console.log("@@@,extension:" + extension)
	return `v${extension?.packageJSON.version || "1.0.0"}`
}
