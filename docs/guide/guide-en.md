#### 1. Install the Plugin

- First, install [VS Code](https://code.visualstudio.com/) as it's required. Codee is a plugin for the VS Code editor.

- Installing the Codee plugin:
  - Install from VS Code extensions marketplace:
    - Open the VS Code extensions marketplace, search for "codee", then click "Install"
    
     <p>
      <image src="https://github.com/user-attachments/assets/118406b6-5cc7-4f2d-84a0-022fef53106c" width="60%"></image>
     </p>
    
  - Or manually install from [Github](https://github.com/codee-agent/codee/releases) Releases:
    - Download the codee-me-xxxx.vsix file
    - Open VS Code extensions marketplace, click the "..." menu in top right, select "Install from VSIX..."
    - Select the downloaded codee-me-xxxx.vsix file
    
      <p>
        <image src="https://github.com/user-attachments/assets/520fa113-1e2a-4cf3-b21e-df7bdc059930" width="60%"></image>
      </p>

#### 2. Configure the Chat Model

- When opening the Codee plugin for the first time, it is necessary to configure the chat encoding large model before it can be used normally,. See [**AI Model Server Configuration Guide**](./config-en.md) for details.

- In the plugin's main interface, click the settings button (top right) to configure model server connection:
  - Select model provider, enter corresponding API key, and choose model
  - For "OpenAI Compatible", you also need to enter server URL and manually input model ID
  
    <p>
      <image src="https://github.com/user-attachments/assets/7e68fa4c-cee1-4606-bef6-be08b4f075fc" width="60%"></image>
    </p>

#### 3. Configure Code AutoComplete Model

- In the plugin's main interface, click settings button (top right)
- Under "Autocomplete Settings":
  - Currently only supports OpenAI compatible protocol
  - Need to manually enter base URL, API key and model ID (see [AI Model Server Configuration Guide](https://github.com/codee-agent/codee/blob/main/docs/guide/config.md))

  <p>
    <image src="https://github.com/user-attachments/assets/d395d87d-e237-4fe8-bc0b-fdb207b8a2b7" width="60%"></image>
  </p>

#### 4. Set Plugin Language

- In plugin's main interface, click settings button (top right)
- Under "Language Settings", select from 12 supported languages

  <p>
    <image src="https://github.com/user-attachments/assets/86928e2d-488f-4cfc-b1d6-a834d3f9fe46" width="60%"></image>
  </p>

#### 5. Set Plugin Display Position

- Default shows in VS Code left sidebar
- Click "Open in Editor" in Codee interface to open in editor area
- Right-click Codee icon and select "Move to" → "Secondary side bar" to move to right sidebar (requires VS Code restart)

  <p>
    <image src="https://github.com/user-attachments/assets/a7c68ea3-bd97-4685-85ad-5309ad9f562a" width="60%"></image>
  </p>

#### 6. Start Chat Coding

- Two modes: **Plan Mode** (discussing problems/solutions with AI) and **Act Mode** (executing code writing/modifications)
- Before coding, open a folder in VS Code via "File" → "Open" as working directory
- In Act Mode, enter prompt like: "Please use HTML5 to create a Tetris game. Requirements: Beautiful UI, complete functionality, single-player." Press enter to generate and save code.

  <p>
    <image src="https://github.com/user-attachments/assets/1591966a-eedc-42d6-9a07-95dac6bbce7b" width="60%"></image>
  </p>

#### 7. Start Code AutoComplete

- In settings, enable "Autocomplete Settings" → "Enable Autocomplete"
- At code location, press enter once to activate, then it will follow cursor
- Gray text shows suggestions - press Tab to accept or ignore

  <p>
    <image src="https://github.com/user-attachments/assets/feabeea0-ff9c-4e3d-ba8a-df0ac9a9fdec" width="60%"></image>
  </p>

#### 8. Edit Features

- Select code and right-click → "Add to Codee", or select terminal output → right-click → "Add to Codee"
- Selected code appears in chat - you can add requests like "Please optimize this code with these requirements..."

  <p>
    <image src="https://github.com/user-attachments/assets/6db9ebec-dc50-4ed3-b7ad-2cf8bfd9cc80" width="60%"></image>
  </p>

- For code errors (wavy underline), use Quick Fix → "Fix to Codee" or "Add to Codee"

  <p>
    <image src="https://github.com/user-attachments/assets/4949f19b-12c4-4f3f-8c0b-a560663f41ab" width="60%"></image>
  </p>

#### 9. Using Codee with Other Editors

- If using IDEA, Android Studio, Visual Studio, Xcode etc:
  1) Open your workspace in your usual editor
  2) Open same workspace in VS Code
  3) Use Codee in VS Code for AI programming while using your preferred editor to compile/run
  4) Paste any issues back to Codee for fixes

#### 10. Set Auto-Approval

- Codee uses Agent mechanism requiring approval for file operations/commands
- Enable auto-approval for operations like "Read files", "Write files", "Execute commands" etc
- Recommended to enable "Read files" auto-approval

  <p>
    <image src="https://github.com/user-attachments/assets/21c3c404-de2e-4144-a62b-e6f3554a65fc" width="60%"></image>
  </p>

#### 11. Configure Ignore Files and Rule Files

- Create ".codeeignore" in workspace to specify ignored files
- Click "Manage Codee Rules" button (bottom menu) to manage:
  - Global rule files
  - Local project rule files
  - Create new rule files (e.g. flutter.md) with your coding rules

  <p>
    <image src="https://github.com/user-attachments/assets/f681c5d3-2864-451e-83bb-57c85ac91d98" width="60%"></image>
  </p>

#### 12. Using MCP

- Click "MCP Servers" (top menu) to access MCP interface:
  - Left: Marketplace (MCP services)
  - Middle: Configure remote MCP
  - Right: Configure local MCP
- After installing MCP service, edit JSON config file via "Configure MCP Servers"
- Disable unused MCP services to save tokens

<p>
  <image src="https://github.com/user-attachments/assets/22edc622-e899-4e1a-835f-9f60fc98b9c7" width="60%"></image>
</p>

