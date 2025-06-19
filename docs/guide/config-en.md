## How to Configure Large Language Models in Codee

Codee utilizes three types of models:

1. **Chat and Coding Model** (Must support tool calling, e.g., deepseek-v3, Claude sonet 3.5/3.7) - This model is essential for Codee to function. Without it, Codee won't work.
2. **Code Completion Model** (Specialized for code, e.g., Qwen2.5-coder-3b/Qwen2.5-coder-7b) - Smaller models (1.5b, 3b, or 7b parameters) are sufficient. This is only used when code completion is enabled, making it optional. Without configuration, code completion won't work.
3. **Embedding Model** (For local code retrieval, e.g., rerank, nomic-embed-text) - Currently under development and not required for configuration.

**Note:** Platforms listed may offer both paid and free models. Please check each platform for details.

### 1. Deepseek Official Website

- Recommended model: deepseek-chat for chat and coding (verified strong coding capabilities)
- Setup:
  - Visit [Deepseek website](https://deepseek.com), click "API Platform" in top-right
  - After login, click "API keys" in left menu. If no key exists, click "Create API key", enter a name, then create
  - Copy and save the API key locally
  - Codee configuration for chat/coding model:
    - Select "Deepseek" from provider dropdown
    - Paste API key into apikey field
    - Click "Start Using" or "Finish" to complete setup

### 2. Huawei's SiliconFlow

- Recommended models:
  - deepseek-v3(0324) for chat/coding
  - Qwen/Qwen2.5-Coder-7B-Instruct (includes a free option)
- Setup:
  - Visit [SiliconFlow](https://siliconflow.cn/) and login
  - Click "API Keys" in left menu, then "New API Key"
  - Enter description and create key, then save locally
  - Codee chat/coding model setup:
    - Select "Openai Compatible" provider
    - BaseURL: https://api.siliconflow.cn/v1
    - Enter API key
    - From "Model Hub" copy model name (e.g., Pro/deepseek-ai/DeepSeek-V3) into ModelID
    - Click "Start Using" or "Finish"
  - Codee code completion setup:
    - Click "Code Completion Settings"
    - Server URL: https://api.siliconflow.cn/v1
    - Enter API key
    - From "Model Hub" select a small model (e.g., Qwen/Qwen2.5-Coder-7B-Instruct) for ModelID
    - Click "Finish"

### 3. Baidu's Qianfan

- Visit [Qianfan](https://cloud.baidu.com/product-s/qianfan_home) and login
- Go to [Model Development](https://cloud.baidu.com/product-s/qianfan_modelbuilder), click "API KEY" in left menu
- Create and save API key
- From "Model Hub" search for "deepseek-v3" and copy model ID
- Codee chat/coding setup:
  - Select "Openai Compatible" provider
  - BaseURL: https://qianfan.baidubce.com/v2
  - Enter API key
  - Paste model ID
  - Click "Finish"
- Codee code completion setup:
  - Click "Code Completion Settings"
  - Same as above, but search Model Hub for a small coder model (e.g., Qwen2.5-Coder-14B-Instruct) and use its ID: amv-tt709yf37zke

### 4. Alibaba's Bailian

- Visit [Bailian](https://www.aliyun.com/product/bailian/) and login
- Go to [Model Hub](https://bailian.console.aliyun.com/?tab=model#/model-market), click "APIKey" then "Create API key"
- Select business space and create key, then save
- Codee chat/coding setup:
  - Select "Alibaba Qwen" provider (or "Openai Compatible" with URL: https://dashscope.aliyuncs.com/compatible-mode/v1)
  - Enter API key
  - Select deepseek-v3 from dropdown (or paste ID if using Openai Compatible)
  - Click "Finish"
- Codee code completion setup:
  - BaseURL: https://dashscope.aliyuncs.com/compatible-mode/v1
  - Enter API key
  - Paste model ID (e.g., qwen2.5-coder-7b-instruct)
  - Click "Finish"

### 5. ByteDance's Volcano Engine

- Visit [Volcano Engine](https://www.volcengine.com/) and login
- Go to [API Applications](https://console.volcengine.com/ark/region:ark+cn-beijing/overview?briefPage=0&briefType=introduce&type=new), click "API Key Management" to create and save key
- Click "Service Management", find deepseek-v3 and enable service (may require real-name verification)
- Codee chat/coding setup:
  - Select "Bytedance Doubao" provider (or "Openai Compatible" with URL: https://ark.cn-beijing.volces.com/api/v3)
  - Enter API key
  - Select deepseek-v3-250324 from dropdown (or paste ID if using Openai Compatible)
  - Click "Finish"

### 6. Openrouter

- Visit [Openrouter](https://openrouter.ai/) and login
- Click "keys" under user menu, then "create key" and save
- Codee chat/coding setup:
  - Select "Openrouter" provider
  - Enter API key
  - Select deepseek-chat or Claude-3.5-sonnet/3.7-sonnet from dropdown
  - Click "Finish"
- Codee code completion setup:
  - BaseURL: https://openrouter.ai/api/v1
  - Enter API key
  - Paste model ID (e.g., qwen/qwen2.5-coder-7b-instruct)
  - Click "Finish"

### 7. Anthropic

- Visit [Claude](https://claude.ai/) and login
- Go to [Console](https://console.anthropic.com/dashboard), click "API keys" then "create key" and save (requires payment)
- Codee chat/coding setup:
  - Select "Anthropic" provider
  - Enter API key
  - Select Claude-sonnet-3.5 or sonnet-3.7 (top-tier coding models)
  - Click "Finish"
- Not recommended for code completion due to high cost

### 8. OpenAI

- Visit [OpenAI](https://openai.com/) and login
- Go to [API Platform](https://platform.openai.com/api-keys), click "Create an API key" and save
- Codee chat/coding setup:
  - Select "OpenAI" provider
  - Enter API key
  - Select GPT-4.1 or GPT-4o from dropdown
  - Click "Finish"

### 9. Google

- Visit [Google AI Studio](https://aistudio.google.com/apikey) and login
- Click "Create API key" and save
- Codee chat/coding setup:
  - Select "Google Gemini" provider
  - Enter API key
  - Select Gemini-2.5-flash or Gemini-2.5-pro from dropdown
  - Click "Finish"
