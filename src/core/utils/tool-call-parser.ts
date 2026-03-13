/**
 * 工具调用解析器状态接口
 */
export interface ToolCallState {
	index: number
	name: string | null
	id: string | null
	currentKey: string | null
	isInValue: boolean
	pendingBackslash: boolean
	accumulatedArgs: string
	parsePosition: number // 记录解析到的位置
	expectingValue: boolean // 标记是否期待value的开始
}

/**
 * 流式工具调用解析器
 * 用于解析 OpenAI 兼容 API 的流式工具调用并转换为 XML 格式
 */
export class ToolCallParser {
	private currentToolCallState: ToolCallState | null = null

	/**
	 * 重置解析器状态
	 */
	public reset(): void {
		this.currentToolCallState = null
	}

	/**
	 * 处理流式工具调用并转换为 XML 格式输出
	 * @param toolCalls 流式工具调用数据
	 * @param isFinished 是否完成
	 * @returns XML 格式的字符串
	 */
	public processStreamingToolCallsToXml(toolCalls: any[], isFinished: boolean): string {
		let output = ""

		for (const toolCall of toolCalls) {
			const index = toolCall.index
			if (index === undefined) continue

			// 初始化或更新当前工具调用状态
			if (!this.currentToolCallState || this.currentToolCallState.index !== index) {
				// 如果有之前的状态，先关闭它
				if (this.currentToolCallState && this.currentToolCallState.currentKey) {
					output += `</${this.currentToolCallState.currentKey}>\n`
				}
				if (this.currentToolCallState && this.currentToolCallState.name) {
					output += `</${this.currentToolCallState.name}>\n`
				}

				// 初始化新状态
				this.currentToolCallState = {
					index,
					name: null,
					id: null,
					currentKey: null,
					isInValue: false,
					pendingBackslash: false,
					accumulatedArgs: "",
					parsePosition: 0,
					expectingValue: false
				}
			}

			// 处理工具调用名称
			if (toolCall.function?.name) {
				this.currentToolCallState.name = toolCall.function.name
				this.currentToolCallState.id = toolCall.id || ""
				output += `\n\n<${toolCall.function.name} id='${toolCall.id || ""}'> \n`
			}

			// 处理参数 - 累积参数并增量解析
			if (toolCall.function?.arguments !== undefined && toolCall.function?.arguments !== null) {
				// 将新的参数片段追加到累积的参数字符串中
				this.currentToolCallState.accumulatedArgs += toolCall.function.arguments
				// 解析累积的参数
				output += this.parseArgumentsToXml(isFinished)
			}
		}

		return output
	}

	/**
	 * 解析参数字符串并转换为 XML 格式
	 * 使用累积的参数字符串进行增量解析，从上次解析的位置继续
	 * @param isFinished 是否完成
	 * @returns XML 格式的字符串
	 */
	private parseArgumentsToXml(isFinished: boolean): string {
		if (!this.currentToolCallState) return ""
		
		let output = ""
		const args = this.currentToolCallState.accumulatedArgs
		const state = this.currentToolCallState
		
		let i = state.parsePosition // 从上次解析的位置开始

		while (i < args.length) {
			const char = args[i]

			// 检测 key 的开始（只在非value状态且不期待value时）
			if (char === '"' && !state.isInValue && !state.expectingValue) {
				// 寻找闭合引号
				const keyEnd = args.indexOf('"', i + 1)
				if (keyEnd !== -1) {
					const key = args.substring(i + 1, keyEnd)
					
					// 寻找冒号位置
					let colonPos = -1
					for (let j = keyEnd + 1; j < Math.min(keyEnd + 10, args.length); j++) {
						if (args[j] === ':') {
							colonPos = j
							break
						}
						if (args[j] !== ' ' && args[j] !== '\t' && args[j] !== '\n' && args[j] !== '\r') {
							break
						}
					}

					let nextValueStart = -1
					if (colonPos !== -1) {
						// 跳过冒号后的空白
						for (let j = colonPos + 1; j < args.length; j++) {
							if (args[j] !== ' ' && args[j] !== '\t' && args[j] !== '\n' && args[j] !== '\r') {
								nextValueStart = j
								break
							}
						}
					}

					// 只有当key后面有冒号且有value起始指示符时才处理
					if (colonPos !== -1 && nextValueStart !== -1) {
						// 关闭之前的key
						if (state.currentKey) {
							output += `</${state.currentKey}>\n`
						}

						// 设置新的key
						state.currentKey = key
						state.expectingValue = true
						
						// 更新已处理的位置
						i = nextValueStart
						continue
					} else {
						// 不完整，等待下一个chunk（不更新parsePosition，下次从头处理这个key）
						break
					}
				} else {
					// 不完整，等待下一个chunk
					break
				}
			}

			// 检测 value 的开始（只在期待value时）
			if (char === '"' && state.expectingValue && !state.isInValue) {
				state.isInValue = true
				state.expectingValue = false
				output += `<${state.currentKey}>\n`
				i++
				continue
			}

			// 处理 value 内容
			if (state.isInValue) {
				// 处理转义字符
				if (state.pendingBackslash) {
					state.pendingBackslash = false
					switch (char) {
						case 'n': output += '\n'; break
						case 't': output += '\t'; break
						case 'r': output += '\r'; break
						case '"': output += '"'; break
						case '\\': output += '\\'; break
						case '/': output += '/'; break
						default: output += '\\' + char
					}
					i++
					continue
				}

				// 检测转义开始
				if (char === '\\') {
					state.pendingBackslash = true
					i++
					continue
				}

				// 检测 value 结束（引号）
				// 只有当引号后面跟着逗号或空白或}时，才是真正的结束
				if (char === '"') {
					// 检查下一个字符，如果是 `",`、`" `、`"`、`"\t`等，才是真正的value结束
					if (i + 1 < args.length) {
						const nextChar = args[i + 1]
						if (nextChar === ',' || nextChar === '}' || nextChar === ' ' || nextChar === '\t' || nextChar === '\n' || nextChar === '\r') {
							// 这是真正的value结束
							state.isInValue = false
							output += `\n</${state.currentKey}>\n`
							state.currentKey = null
							
							i++
							
							// 跳过逗号和空白
							while (i < args.length && (args[i] === ',' || args[i] === ' ' || args[i] === '\n' || args[i] === '\t' || args[i] === '\r')) {
								i++
							}
							continue
						} else if (nextChar === '\\') {
							// 这是两个引号的情况 `""` 或 `\"" `，需要进一步判断
							// 让它继续处理，会在下个循环识别
							output += char
							i++
							continue
						}
					} else {
						// 这是字符串的最后一个字符，可能是value结束
						// 但也可能还有更多字符在下一个chunk，先用 isFinished 判断
						if (isFinished || i + 1 >= args.length) {
							state.isInValue = false
							output += `\n</${state.currentKey}>\n`
							state.currentKey = null
							i++
							continue
						}
					}
					
					// 如果到这里还没 continue，说明这个引号可能是转义的（虽然pendingBackslash=false）
					// 或者是不完整的情况，先输出这个引号
					output += char
					i++
				} else {
					// 输出普通字符
					output += char
					i++
				}
			} else {
				// 如果在 expectingValue 状态但遇到非引号，可能是其他类型的值
				if (state.expectingValue && char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
					if (char === '{' || char === '[' || (char >= '0' && char <= '9') || char === 't' || char === 'f') {
						// 非字符串值，暂时跳过
						while (i < args.length) {
							if (args[i] === ',' || args[i] === '}') {
								state.expectingValue = false
								state.currentKey = null
								i++
								break
							}
							i++
						}
						continue
					}
				}
				// 跳过不需要处理的字符
				if (char === '{' || char === '}' || char === ' ' || char === '\t' || char === '\n' || char === '\r') {
					i++
				} else {
					i++
				}
			}
		}

		// 更新解析位置
		state.parsePosition = i

		return output
	}

	/**
	 * 关闭所有未关闭的 XML 标签
	 * @returns 关闭标签的字符串
	 */
	public closeAllTags(): string {
		let output = ""
		
		if (this.currentToolCallState) {
			// 关闭当前 key 标签
			if (this.currentToolCallState.currentKey) {
				output += `</${this.currentToolCallState.currentKey}>\n`
			}
			// 关闭 function name 标签
			if (this.currentToolCallState.name) {
				output += `</${this.currentToolCallState.name}>\n`
			}
		}
		
		return output
	}
}
