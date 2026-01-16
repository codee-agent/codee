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
<a href="https://github.com/codee-agent/codee" target="_blank" style="text-decoration: underline;"><strong>Codee(koʊˈdiː)</strong></a>  is an AI-powered programming tool. The name is derived from the words "Code" and "engineer".It is your professional code engineer!

## Key Features of Codee

1. **Including** code writing and editing, command-line operations, MCP usage, AI model configuration, and more.  
2. **Added internationalization support for the interface, including multiple languages**: English, 简体中文.  
3. **Added automatic code completion functionality**. You need to configure the model yourself, preferably one optimized for coding, to achieve outstanding results!  
4. **Optimized system prompts to reduce token consumption and minimize context length usage in large models**

## Getting Started and Model Configuration

- Please read the [**guidance document**](./docs/guide/guide-en.md) carefully!


## The Vision of Codee：Where Coders Shine Brighter | 让开发者永远发光
Imagine such mornings: 
Beside a still-warm coffee mug, developers converse with Codee as naturally as collaborating with an old friend. When a human says “Help add risk control rules to the payment module using the pattern we discussed last week,” the AI already understands the business objectives, team conventions, and even yesterday’s meeting notes within context.

This is our future:  
◼ When repetitive code becomes AI’s responsibility, developers finally stand tall, freely exploring under the starlight of architectural design  
◼ During lonely late-night debugging sessions, Codee becomes an tireless guardian: "Concurrency issue risks detected - three solutions prepared"  
◼ Every code review transforms into a creative workshop - humans focus on strategic insights while AI presents executable solutions in real-time  

Codee will achieve:  
✓ Code Assurance: Master 20+ team coding styles to make AI-generated code reach senior engineer-level quality  
✓ Zero-Lag Innovation: Reduce prototype development time from architecture design by 80%, turning inspiration into reality instantly  
✓ Full Automation: Free your hands - you command, Codee executes  

We don’t believe in “replacement” - we create “rebirth”: When AI handles tactical labor, developers become true digital poets - weaving business insights into verse, composing new chapters through system design, defining software engineering’s renaissance through human-AI collaboration.


## Future Directions for Codee

1. **Add codebase indexing** and introduce a local vector database. This will enable local code retrieval, enhance Codee’s ability to handle cross-file operations, and improve accuracy in writing business logic with context.  
2. **Leverage MCP to customize Agents**, transforming Codee from an AI programming tool into a versatile AI tool.  

## Setting Up Your Own LLM Server for Codee

This is optional. You can directly use third-party large model services like openrouter, OpenAI, Anthropic, or Deepseek.com.  

### Option 1: Personal Computer  

You can install inference tools like Ollama or lmstudio to provide inference services. For example, installing qwen2.5-coder:32B is workable, though quantized performance may suffer.  
Codee can directly access the inference server.  

### Option 2: Professional GPU Server  

You can use vllm or sglang for inference, with a gateway layer like oneAPI or oneHub to control the large model services.  
Codee accesses the gateway to obtain services.  

## Contribution  

To contribute to the project,you need to comply with the [Contributor Covenant]((https://www.contributor-covenant.org/)).  

<details>
<summary>Local Development Instructions</summary>

1. Clone the repository:
        ```bash
        git clone https://code.y5ops.com/coders/codee
        ```
2. Open the project in VSCode:
        ```bash
        code codee
        ```
3. Install the extension and necessary dependencies for webview-gui:
        ```bash
        npm run install:all
        ```
4. Press `F5` (or `Run` -> `Start Debugging`) to launch a new VSCode window with the extension loaded. (If you encounter issues during the build, you may need to install the [esbuild problem matchers extension](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers).)

</details>

## Thanks

Thanks to the [Cline](https://github.com/cline/cline) project. It is the first AI programming tool to use the Agent to solve programming problems, and its concepts and technology are truly remarkable! Codee is forked from the Cline project.  
Thanks to the [Continue](https://github.com/continuedev/continue) project. Its autocompletion feature is the best among all open-source AI programming projects! Codee's autocompletion is inherited from Continue.

## License  

[GPLv3 © 2025 Codee Studio](./LICENSE)
