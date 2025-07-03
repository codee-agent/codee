#### 1.安装插件

- 安装[VS code](https://code.visualstudio.com/)软件是前提，Codee是VS code编辑器的一个插件

- 安装Codee插件
  - VS code插件商店内安装
    - 点开VS code的应用商店界面，在搜索框中搜索“codee”，点击“Install”安装即可
    
      <p>
        <image src="https://github.com/user-attachments/assets/118406b6-5cc7-4f2d-84a0-022fef53106c" width="60%"></image>
      </p>
    
  - 或者从[Github](https://code.y5ops.com/coders/codee)的Releases中下载codee-xxxx.vsix后手动安装
    
    - 打开VS code的插件商店界面，选择右上角的“...”，点击菜单的“Install from VSIX...”
    
    - 弹出选择文件夹，选择刚下载的codee-xxxx.vsix，确定即可
    
      <p>
        <image src="https://github.com/user-attachments/assets/520fa113-1e2a-4cf3-b21e-df7bdc059930" width="60%"></image>
      </p>

#### 2.配置聊天编码的模型

- 首次打开Codee插件时，需要配置聊天编码大模型后才能正常使用，具体配置方法参考[**大模型服务器配置方法**](./config.md)。

- 在插件主界面中，点击右上角设置按钮，可以进入设置页面，这里面也可以设置大模型服务器连接信息，选择不同的模型服务器的提供商，填写提供商对应的API key，选择模型。
  - 如果选择的是OpenAI Compatible，还需要输入服务器的URL，以及手动填写模型ID信息。
  
    <p>
      <image src="https://github.com/user-attachments/assets/7e68fa4c-cee1-4606-bef6-be08b4f075fc" width="60%"></image>
    </p>


#### 3.配置代码补全的模型

- 在插件主界面中，点击右上角设置按钮，可以进入设置页面，设置页面中有一个“Autocomplete Settings”的选项

- 目前只实现了openai compatible协议的连接，需要自己填入baseurl,apikey和modelID，具体可以参考[大模型服务器配置方法](https://github.com/codee-agent/codee/blob/main/docs/guide/config.md)

  <p>
    <image src="https://github.com/user-attachments/assets/d395d87d-e237-4fe8-bc0b-fdb207b8a2b7" width="60%"></image>
  </p>

#### 4.设置插件语言

- 在插件主界面中，点击右上角设置按钮，可以进入设置页面

- 设置页面里有一个“语言设置”选项，下拉选择支持12种国际语言设置

  <p>
    <image src="https://github.com/user-attachments/assets/86928e2d-488f-4cfc-b1d6-a834d3f9fe46" width="60%"></image>
  </p>

#### 5.设置插件展示位置

- 默认显示在VS code的左侧栏

- 可以在codee主界面上点击“Open in Editor”，可以在VS code的编辑区弹出一个新界面

- 也可以在codee图标上右键选择：“move to”->"Secondary side bar",将codee展示到右边侧栏区域，**需要重启VS code生效！！！**

  <p>
    <image src="https://github.com/user-attachments/assets/a7c68ea3-bd97-4685-85ad-5309ad9f562a" width="60%"></image>
  </p>

#### 6.开始对话编码

- 对话分为：**规划模式**与**执行模式**。规划模式主要是跟大模型进行一些问题的探讨，或者方案的规划。执行模式是拿到方案后让codee执行代码的编写或者修改。

- 在编写代码前，一定要在VScode中点击“文件”->“打开”，选择一个文件夹，作为工作目录。

- 在执行模式下，输入框中输入描述词，比如：“请使用H5帮我写一个俄罗斯方块的小游戏。要求：UI美观，功能完整，单人单机。”，点发送按钮，或者按回车键，代码就会被生出来并保存到工作空间中。

  <p>
    <image src="https://github.com/user-attachments/assets/1591966a-eedc-42d6-9a07-95dac6bbce7b" width="60%"></image>
  </p>

#### 7.开始代码补全

- 在设置界面中，点开“Autocomplete Settings”，点击勾选“Enable Autocomplete”

- 在需要编写代码的地方，首次激活代码补全需要一个回车键，后面就会开始自动跟随鼠标进行代码补全，补全的代码会显示成灰色，如果需要使用补全的代码，就按Tab键接受，否则不用理会。

  <p>
    <image src="https://github.com/user-attachments/assets/feabeea0-ff9c-4e3d-ba8a-df0ac9a9fdec" width="60%"></image>
  </p>

#### 8.选择编辑功能

- 在代码编辑区域，选择一段代码，点击右键，选择“Add to Codee”；或者在下方的命令行中选择输出内容，右键选择“Add to Codee” ，这时候在聊天输入框中就能看见选择的代码信息，也可以在信息后面继续加上自己的要求，比如：请帮忙优化这几行，要求如下...

  <p>
    <image src="https://github.com/user-attachments/assets/6db9ebec-dc50-4ed3-b7ad-2cf8bfd9cc80" width="60%"></image>
  </p>

- 如果在代码编辑区中，有波浪线提示代码错误的地方，可以选择 Quick fix，然后选择Fix to Codee或者 Add to Codee，快速去解决错误问题

  <p>
    <image src="https://github.com/user-attachments/assets/4949f19b-12c4-4f3f-8c0b-a560663f41ab" width="60%"></image>
  </p>

#### 9.如果让codee配合其它编辑器工作

- 如果你不是使用VS Code编辑器进行工作的，使用的是IDEA、Android Studio、Vistual Studio、Xcode、Clion或者Pycharm等。

- 你可以按照如下方式使用我们的Codee进行AI编程:

  1）打开你自己平常工作的编辑器，打开你的的workspace目录。

  2）使用VScode打开相同的workspace目录。

  3）在VScode中使用Codee进行AI编程操作，同时用自己习惯的编辑器来编译运行，如果过程中有问题就可以将问题贴回到codee中进行修正。

#### 10.设置自动授权

- Codee内部使用的Agent机制进行代码编写，文件操作和命令行执行的，这些操作都有一定的风险性，故每一步都需要征询用户的意见，如果同意就点击“Approve”或者“Save”，否则就点击“Reject”。

- 当然这样操作需要我们频繁的去点击按钮，就需要有一个“自动批准”的设置项：比如，“读文件”，“写文件”，“自行命令”，“调用MCP”等操作，我们可以勾选授权后，默认同意Codee的操作，整个编码过程就不需要我们去参与了。

- 建议自动授权把“读取文件”勾选上。

  <p>
    <image src="https://github.com/user-attachments/assets/21c3c404-de2e-4144-a62b-e6f3554a65fc" width="60%"></image>
  </p>

#### 11.配置忽略文件和规则文件

- 在项目的workspace中，新建一个".codeeignore"文件，里面填写需要忽略的文件。

- 点击插件下方菜单的“管理Codee规则”的按钮，弹出一个弹窗，里面分为全局规则文件和本地项目规则文件管理。

  - 在输入框中填入文件名，比如 flutter.md，点加号，就可以创建一个关于flutter代码编写的规则文件，只需要把自己的规则写进这个md中即可，这个规则文件建完后，还有一个开关，可以控制是否生效。
  - 全局规则配置也是一样的添加和管理。

  <p>
    <image src="https://github.com/user-attachments/assets/f681c5d3-2864-451e-83bb-57c85ac91d98" width="60%"></image>
  </p>

#### 12.MCP的使用

- 点击插件界面上方菜单中的“MCP Servers”，进入MCP界面
- 左边是Marketplace(Cline提供的MCP市场)，中间是配置远程MCP服务的，右边是配置和管理本地MCP服务的。
- 如果本地安装好某一个MCP服务后，可以在最右边的“Installed”页面中，点击“Configure MCP Servers”，弹出一个json文件，将调用MCP服务的配置命令添加到JSON文件中，按Ctrl+S保存。
- 如果明确知道自己不需要使用到MCP，一定要在MCP服务列表中点击开关按钮件MCP关闭掉，这样能节约大量的token

<p>
  <image src="https://github.com/user-attachments/assets/22edc622-e899-4e1a-835f-9f60fc98b9c7" width="60%"></image>
</p>

#### 13.'记忆体'的使用

- 记忆体是一个结构化的文档系统，能记住你项目的所有细节，并且能够跨会话维护上下文，从而让Codee从一个无状态的助手转变为一个长期的开发伙伴。
- 特别是项目较大，内容较多的时候，启用记忆体后，在上下文窗口用完或者意外关闭窗口等场景，需要重新启动上下文窗口的时候，记忆体就能回忆起当前工程等内容，之前做过的内容，而不是从头开始。
- 记忆体只针对当前项目空间有效，首次启用，需要点开高级能力，找到“记忆体”，点击“初始化”。AI辅助完成一些任务后，还需要打开“记忆体”，点击“更新记忆体”，让记忆体始终保持同步。在新开会话窗口或者编写过程中产生了验证幻觉后，需要点用“唤醒记忆”来重新恢复记忆，让codee能够很好的回忆项目的内容以及之前做过的工作。

<p>
  <image src="https://github.com/user-attachments/assets/ec7422b5-2e25-4f25-b99b-809a8b711553" width="60%"></image>
</p>

