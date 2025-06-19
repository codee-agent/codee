## 如何获取大语言模型的配置信息

在我们Codee中使用到了三种模型：

- 第一种是聊天和编码的模型（需要支持工具调用(Tool use)，比如deepseek-v3，Claude sonet 3.5/3.7等），这个模型是必须的，不配置Codee就没办法工作。
- 第二种是代码补全的模型（需要专门针对代码训练的，比如Qwen2.5-coder-3b/Qwen2.5-coder-7b等），这个模型不需要大参数量，1.5b、3b和7b就可以了，它只有在你写代码的时候，需要启用代码补全的时候才会去使用，故不是必须的，如果不配置，代码补全的功能无效。
- 第三种是向量模型，用来做代码的本地检索（比如rerank，nomic-embed-text等），功能还在开发中，暂时无需配置.

**这里提供的平台，模型可能是需要付费，也可能有免费提供，具体自己去平台上查看和咨询。**

#### 1.deepseek官网

- 建议使用该官网中的deepseek-chat进行聊天编码，目前验证过，编码能力比较强
- 申请与配置：
  - 打开[deepseek官网](https://deepseek.com)，点击页面右上角“API开放平台”
  - 登录后，点击左侧菜单“API keys”，如果未申请过，请点击“创建 API key”，填写名称后，点击“创建”
  - 将创建的APK key复制保存到本地计算机。
  - Codee中配置聊天编码大模型：
    - 在服务提供商下拉框中选择“Deepseek”
    - 填入刚申请的API key到apikey输入框中
    - 点击“开始使用”，或者是“完成”按钮，配置编码模型完成

#### 2.华为的硅基流动

- 建议使用该平台中的deepseek-v3(0324)进行聊天编码
- 建议使用该平台中的Qwen/Qwen2.5-Coder-7B-Instruct（该模型有一款是免费的）
- 申请与配置
  - 打开[硅基流动官网](https://siliconflow.cn/)，先登录
  - 登录后，点击左侧菜单“API密钥”，再点击“新建API密钥”
  - 输入密钥描述后点击“新建密钥”，将APIkey保存到本地
  - Codee中配置聊天编码模型：
    - 在服务提供商下拉框中选择“Openai Compatible”
    - BaseURL中填：https://api.siliconflow.cn/v1
    - 填入刚申请的API key到apikey输入框中
    - 在硅基流动的官网左侧菜单中点击”模型广场“，选择deepseek-v3或者qwen2.5-coder-32b的模型，复制模型名称，比如：Pro/deepseek-ai/DeepSeek-V3，填入到ModeID中
    - 点击“开始使用”，或者是“完成”按钮，配置编码模型完成
  - Codee中配置代码补全模型：
    - 在Codee设置界面点击“代码补全设置”
    - 服务器URL中填：https://api.siliconflow.cn/v1
    - 填入刚申请的API key到apikey输入框中
    - 在硅基流动的官网左侧菜单中点击”模型广场“，选择一款小模型，比如Qwen/Qwen2.5-Coder-7B-Instruct模型，将Qwen/Qwen2.5-Coder-7B-Instruct填入到ModeID中
    - 点击“完成”按钮，配置代码补全模型完成

#### 3.百度的千帆

- 打开[千帆官网](https://cloud.baidu.com/product-s/qianfan_home)，先登录
- 点击[模型开发及服务](https://cloud.baidu.com/product-s/qianfan_modelbuilder)，再点击左侧的菜单“API KEY”
- 创建APIkey，并复制保存到本地
- 在“模型开发及服务”页面的右侧菜单中点击“模型广场”，搜索“deepseek-v3”，复制模型ID，作为codee的聊天编码模型
- Codee中配置聊天编码模型：
  - 在服务提供商下拉框中选择“Openai Compatible”
  - BaseURL中填：https://qianfan.baidubce.com/v2
  - 填入刚申请的API key到apikey输入框中
  - 模型ID填在模型广场中复制的ID
  - 点击“完成”
- Codee中配置代码补全模型：
  - 在Codee设置界面点击“代码补全设置”
  - 具体配置同上，只是模型ID需要注意，在模型广场中搜索一个带coder的小参数模型，比如Qwen2.5-Coder-14B-Instruct，复制其模型ID：amv-tt709yf37zke

#### 4.阿里的百炼

- 打开[百炼官网](https://www.aliyun.com/product/bailian/)，登录
- 进入[模型广场](https://bailian.console.aliyun.com/?tab=model#/model-market)，点击左侧菜单“APIKey”，再点击创建“我的API key“
- 选择业务归宿空间后，点“创建”，把创建好的APIkey记录到本地
- Codee中配置聊天编码模型：
  - 在服务提供商下拉框中选择“Alibaba Qwen”；如果选择“Openai Compatible”话，需要在URL配置中填：https://dashscope.aliyuncs.com/compatible-mode/v1
  - 填入刚申请的API key到apikey输入框中
  - 模型ID中下拉选择deepseek-v3；如果选择“Openai Compatible”话，需要在模型广场拷贝模型ID。
  - 点击“完成”
- Codee中配置代码补全模型：
  - BaseURL中填：https://dashscope.aliyuncs.com/compatible-mode/v1
  - 填入刚申请的API key到apikey输入框中
  - 模型ID填在模型广场中复制的ID，比如：qwen2.5-coder-7b-instruct
  - 点击“完成”

#### 5.字节跳动的火山引擎

- 打开[火山引擎官网](https://www.volcengine.com/)，登录
- 打开[API应用](https://console.volcengine.com/ark/region:ark+cn-beijing/overview?briefPage=0&briefType=introduce&type=new)页面，点击左侧菜单“API key管理”，创建API key后保存到本地
- 点击左侧菜单“开通管理”，找到deepseek-v3模型，点击开通服务（可能需要进行实名认证），点击“立即开通”
- Codee中配置聊天编码模型：
  - 在服务提供商下拉框中选择“Bytedance Doubao”；如果选择“Openai Compatible”话，需要在URL配置中填：https://ark.cn-beijing.volces.com/api/v3
  - 填入刚申请的API key到apikey输入框中
  - 模型ID中下拉选择deepseek-v3-250324；如果选择“Openai Compatible”话，需要在模型广场拷贝模型ID。
  - 点击“完成”

#### 6.Openrouter

- 打开[openrouter](https://openrouter.ai/)的官网，登录
- 在用户信息下拉选择中点击“keys”，再点击“create key”，将创建的apikey保存到本地
- Codee中配置聊天编码模型：
  - 在服务提供商下拉框中选择“Openrouter”
  - 填入刚申请的API key到apikey输入框中
  - 模型ID中下拉选择deepseek-chat或者Claude-3.5-sonnet或者3.7-sonnet
  - 点击“完成”
- Codee中配置代码补全模型：
  - BaseURL中填：https://openrouter.ai/api/v1
  - 填入刚申请的API key到apikey输入框中
  - 模型ID填在模型广场中复制的ID，比如：qwen/qwen2.5-coder-7b-instruct
  - 点击“完成”

#### 7.Authropic

- 打开[claude官网](https://claude.ai/)，登录
- 点击进入[控制台页面](https://console.anthropic.com/dashboard)，点击左侧下方的菜单“API keys”，点击“create key”，保存API key到本地（这个key没有免费试用的机会，需要充值后才能使用）
- Codee中配置聊天编码模型：
  - 在服务提供商下拉框中选择“Authropic”
  - 填入刚申请的API key到apikey输入框中
  - 模型ID中下拉选择Claude-sonnet-3.5或者sonnet-3.7（地表最强编码模型）
  - 点击“完成”
- 不建议代码补全也设置Claude模型，太贵，太浪费

#### 8.OpenAI

- 打开[OpenAI官网](https://openai.com/)，登录
- 进入[api platform页面](https://platform.openai.com/api-keys)，点击‘’Create an API key“，并保存到本地
- Codee中配置聊天编码模型：
  - 在服务提供商下拉框中选择“OpenAI”
  - 填入刚申请的API key到apikey输入框中
  - 模型ID中下拉选择Gpt-4.1或者Gpt-4o
  - 点击“完成”

#### 9.Google

- 点击进入[google aistudio](https://aistudio.google.com/apikey)，并登录
- 点击“Create API key”，并记录到本地
- Codee中配置聊天编码模型：
  - 在服务提供商下拉框中选择“Google Gemini”
  - 填入刚申请的API key到apikey输入框中
  - 模型ID中下拉选择Gemini-2.5-flash或者Gemini-2.5-pro
  - 点击“完成”