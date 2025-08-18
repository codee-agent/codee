<div align="center"><span style="font-size: larger"> <a href="./README.md" target="_blank">English</a> | <a href="./README-zh.md" target="_blank">简体中文</a>
</span></div>
<br>
<div align="center"><p align="center">
  <img src="https://github.com/user-attachments/assets/8e45c984-0b5a-4f9b-bef9-717d17cdd9ca" width="60%" />
</p></div>

<div align="center">
<table>
<tbody>
<td align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=Codee.codee" target="_blank"><strong>VSCode 应用商店</strong></a>
</td>
</tbody>
</table>
</div>


大家好，Codee（扣迪）是一款AI编程的工具，这个名字取自Code 和 engineer 这两个单词。扣迪将是你开发工作中最得力的软件工程师！

## Codee的主要功能

1. **包括**代码编写与编辑、命令行的操作、MCP的使用、AI模型的配置等
2. **添加界面的国际化，多语言的支持**：English、简体中文
3. **添加了自动代码补全的功能**，需要自己去配置模型，最好配置带有coder优化的模型，这样效果才出众  
4. **为了减少Token的消耗和减少大模型的上下文长度的消耗**  ，做了系统描述词的优化策略

## 开始使用与模型配置

- 请仔细阅读[**使用指南**](./docs/guide/guide.md)！


## Codee的愿景：Where Coders Shine Brighter | 让开发者永远发光

想象这样的清晨：
咖啡还温热的马克杯旁，开发者与Codee的对话像老友协作般自然。
“帮我在支付模块添加风控规则，用我们上周讨论的模式”，当人类说出这句话时，AI已理解上下文中的业务目标、团队规范甚至昨天的会议纪要。

这是我们的未来：  
◼ 当重复性代码成为AI肩上的行囊，开发者终于能挺直腰杆，在架构设计的星空下自由奔跑  
◼ 深夜加班debug的孤独时刻，Codee会成为永不疲倦的守护者："检测到并发问题风险，已预备三种解决方案"  
◼ 每个代码评审会议都变成创意工作坊——人类专注战略洞察，AI实时呈现可执行方案  

Codee将实现：  
✓ 代码有保障：学习20+种团队代码风格，让AI产出代码达到高级工程师水平  
✓ 创新零时差：架构设计到可运行原型的时间缩短80%，让灵感即刻绽放  
✓ 完全自动化：解放双手，你负责指挥，Codee负责落实  

我们不相信"取代"，只创造"新生"：
当AI承担战术性劳作，开发者将成为真正的数字诗人——用业务洞察作韵脚，以系统设计谱新章，在人机共舞中定义软件工程的文艺复兴。

## Codee的后续方向

1. **增加codebase indexing**,引入本地向量数据库。这样做的目的是：可以实现本地代码的检索，增强Codee处理跨文件的能力，也能更加准确的联系上下文写业务逻辑。  
2. **借助MCP来实现Agent的定制化**，让Codee从AI编程工具变成一款AI工具，不仅仅是编程。  

## 建立自己的大模型服务器来服务Codee

这不是必须的，你可以直接使用第三方的大模型服务器提供的服务，比如openrouter、openai、anthropic或者Deepseek.com等。

### 方案一：个人电脑

你可以安装Ollama或者lmstudio这些推理工具来提供推理服务，比如安装qwen2.5-coder:32B，勉强能用，量化后的性能还是有很大损失的。 
Codee直接去访问大模型推理服务器。

### 方案二：专业GPU服务器

你可以采用vllm或者sglang来实现推理，中间网关层可以使用oneAPI或者oneHub来进行大模型服务的控制。  
Codee去访问网关获取服务。

## 贡献

要为项目做出贡献，请遵守[开源公约](https://www.contributor-covenant.org/)。

<details>
<summary>本地开发说明</summary>

1. 克隆仓库 ：
        ```bash
        git clone https://github.com/codee-agent/codee
        ```
2. 在 VSCode 中打开项目：
        ```bash
        code codee
        ```
3. 安装扩展和 webview-gui 的必要依赖：
        ```bash
        npm run install:all
        ```
4. 按 `F5`（或 `运行`->`开始调试`）启动以打开一个加载了扩展的新 VSCode 窗口。（如果你在构建项目时遇到问题，可能需要安装 [esbuild problem matchers 扩展](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers)）

</details>

## 感谢

非常感谢[Cline](https://github.com/cline/cline)工程，AI编程工具中它是第一个使用Agent智能体来解决编程问题的，无论是理念还是技术都非常非常厉害！Codee是从Cline工程fork而来的。  
也非常感谢[Continue](https://github.com/continuedev/continue)工程，它的代码补全功能是所有开源的AI编程项目里面最出色，没有之一！Codee中的代码补全是从Continue继承来的。

## 反馈问题

<p align="left">
  <img src="./assets/icons/qscan.jpeg" width="50%" />
</p>


## 许可证

[GPLv3 © 2025 Codee Studio](./LICENSE)
