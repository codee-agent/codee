import React, { useEffect, useState, useCallback } from 'react';
import { CodeindexServiceClient } from "@/services/grpc-client";
import { EmptyRequest } from "@shared/proto/cline/common";
import { useExtensionState } from "@/context/ExtensionStateContext";
import { indexingStatusResponse, setCodeIndexSettingsRequest, getCodeIndexSettingsResponse } from "@shared/proto/cline/codeindex";
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock";
import { VSCodeCheckbox, VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useTranslation } from "react-i18next";

interface CodeIndexProps {
}

interface LocalCodeIndexSettings {
	// Global state settings
	codebaseIndexEnabled: boolean
	codebaseIndexQdrantUrl: string
	codebaseIndexEmbedderProvider?: string
	codebaseIndexEmbedderBaseUrl?: string
	codebaseIndexEmbedderModelId: string
	codebaseIndexEmbedderModelDimension?: number
	codebaseIndexSearchMaxResults?: number
	codebaseIndexSearchMinScore?: number

	// Secret settings (start empty, will be loaded separately)
	codeIndexOpenAiKey?: string
	codeIndexQdrantApiKey?: string
}

const EMBEDDER_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "ollama", label: "Ollama" },
  { value: "openai-compatible", label: "OpenAI Compatible" },
  { value: "gemini", label: "Gemini" },
  { value: "mistral", label: "Mistral" },
  { value: "vercel-ai-gateway", label: "Vercel AI Gateway" },
];

const CodeIndex: React.FC<CodeIndexProps> = () => {
  const { t } = useTranslation() 
  const [indexingStatus, setIndexingStatus] = useState<indexingStatusResponse>({
    systemStatus: "Standby",
		processedItems: 0,
		totalItems: 0,
		currentItemUnit: "items",
    message: ""
  })
  const [currentSettings, setCurrentSettings] = useState<LocalCodeIndexSettings>({
		codebaseIndexEnabled: true,
		codebaseIndexQdrantUrl: "",
		codebaseIndexEmbedderBaseUrl: "",
		codebaseIndexEmbedderModelId: "",
		codebaseIndexEmbedderModelDimension: 1024,
		codebaseIndexSearchMaxResults: 50,
		codebaseIndexSearchMinScore: 0.4,
		codeIndexOpenAiKey: "",
		codeIndexQdrantApiKey: "",
	})
  const [startIndexingLoading, setStartIndexingLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isUserAction, setIsUserAction] = useState(false)
  const [isSetupExpanded, setIsSetupExpanded] = useState(false)
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<LocalCodeIndexSettings | null>(null)

  const { cwd } = useExtensionState()

  const handleClearIndexData = () => {
    console.log('handleClearIndexData')
    CodeindexServiceClient.clearIndexData(EmptyRequest.create()).catch((err) => {
      console.log('clearIndexData error: ', err)
    })
  }

  const handleStartIndexing = () => {
    setStartIndexingLoading(true)
    CodeindexServiceClient.startIndexing(EmptyRequest.create()).then(() => {
      setStartIndexingLoading(false)
    }).catch((err) => {
      console.log('handleStartIndexing err', err)
      setStartIndexingLoading(false)
    })
  }

  const updateSettings = (value: boolean) => {
    CodeindexServiceClient.setCodeIndexSettings(setCodeIndexSettingsRequest.create({
      codebaseIndexEnabled: value
    }), {
      onResponse: (response) => {
        console.log('setIndexingSetting response: ', response)
      },
      onError: (error) => {
				console.error("Error in setIndexingSetting subscription:", error)
			},
			onComplete: () => {
				console.log("setIndexingSetting completed")
			},
    })
  }

  const saveAllSettings = useCallback(() => {
    const request = setCodeIndexSettingsRequest.create({
      codebaseIndexEnabled: currentSettings.codebaseIndexEnabled,
      codebaseIndexQdrantUrl: currentSettings.codebaseIndexQdrantUrl || undefined,
      codebaseIndexEmbedderProvider: currentSettings.codebaseIndexEmbedderProvider || undefined,
      codebaseIndexEmbedderBaseUrl: currentSettings.codebaseIndexEmbedderBaseUrl || undefined,
      codebaseIndexEmbedderModelId: currentSettings.codebaseIndexEmbedderModelId || undefined,
      codebaseIndexEmbedderModelDimension: currentSettings.codebaseIndexEmbedderModelDimension,
      codebaseIndexSearchMaxResults: currentSettings.codebaseIndexSearchMaxResults,
      codebaseIndexSearchMinScore: currentSettings.codebaseIndexSearchMinScore,
      codeIndexOpenAiKey: currentSettings.codeIndexOpenAiKey || undefined,
      codeIndexQdrantApiKey: currentSettings.codeIndexQdrantApiKey || undefined,
    })

    CodeindexServiceClient.setCodeIndexSettings(request, {
      onResponse: (response) => {
        console.log('saveAllSettings response: ', response)
        // 保存成功后更新原始设置为当前值
        setOriginalSettings({ ...currentSettings })
        setHasChanges(false)
      },
      onError: (error) => {
        console.error("Error in saveAllSettings:", error)
      },
      onComplete: () => {
        console.log("saveAllSettings completed")
      },
    })
  }, [currentSettings])

  const getSettings = () => {
    CodeindexServiceClient.getCodeIndexSettings(EmptyRequest.create()).then((response: getCodeIndexSettingsResponse) => {
      const loadedSettings: LocalCodeIndexSettings = {
        codebaseIndexEnabled: response.codebaseIndexEnabled,
        codebaseIndexQdrantUrl: response.codebaseIndexQdrantUrl ?? "",
        codebaseIndexEmbedderBaseUrl: response.codebaseIndexEmbedderBaseUrl ?? "",
        codebaseIndexEmbedderProvider: response.codebaseIndexEmbedderProvider ?? "openai-compatible",
        codebaseIndexEmbedderModelId: response.codebaseIndexEmbedderModelId ?? "",
        codebaseIndexEmbedderModelDimension: response.codebaseIndexEmbedderModelDimension ?? 1024,
        codebaseIndexSearchMaxResults: response.codebaseIndexSearchMaxResults ?? 50,
        codebaseIndexSearchMinScore: response.codebaseIndexSearchMinScore ?? 0.4,
        codeIndexOpenAiKey: response.codeIndexOpenAiKey ?? "",
        codeIndexQdrantApiKey: response.codeIndexQdrantApiKey ?? "",
      }
      setCurrentSettings(loadedSettings)
      setOriginalSettings(loadedSettings)
      setIsInitialized(true)
    })
  }

  const handleFieldUpdate = (value: boolean) => {
    // 只有在组件初始化完成且是用户操作时才更新设置
    if (isInitialized && !isUserAction) {
      setIsUserAction(true)
      // 只有当值真正改变时才更新设置
      if (value !== currentSettings.codebaseIndexEnabled) {
        console.log('handleFieldUpdate value changed', value)
        updateSettings(value)
        setCurrentSettings(prevSettings => ({
          ...prevSettings,
          codebaseIndexEnabled: value
        }))
      }
      // 重置用户操作标志
      setTimeout(() => setIsUserAction(false), 100)
    }
  };

  const handleSettingChange = (field: keyof LocalCodeIndexSettings, value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 实时监控设置变化
  useEffect(() => {
    if (originalSettings) {
      const changed = 
        currentSettings.codebaseIndexQdrantUrl !== originalSettings.codebaseIndexQdrantUrl ||
        currentSettings.codebaseIndexEmbedderProvider !== originalSettings.codebaseIndexEmbedderProvider ||
        currentSettings.codebaseIndexEmbedderBaseUrl !== originalSettings.codebaseIndexEmbedderBaseUrl ||
        currentSettings.codebaseIndexEmbedderModelId !== originalSettings.codebaseIndexEmbedderModelId ||
        currentSettings.codebaseIndexEmbedderModelDimension !== originalSettings.codebaseIndexEmbedderModelDimension ||
        currentSettings.codebaseIndexSearchMaxResults !== originalSettings.codebaseIndexSearchMaxResults ||
        currentSettings.codebaseIndexSearchMinScore !== originalSettings.codebaseIndexSearchMinScore ||
        currentSettings.codeIndexOpenAiKey !== originalSettings.codeIndexOpenAiKey ||
        currentSettings.codeIndexQdrantApiKey !== originalSettings.codeIndexQdrantApiKey
      setHasChanges(changed)
    }
  }, [currentSettings, originalSettings])

  useEffect(() => {
    console.log('cwdddd==========', cwd)
    CodeindexServiceClient.getIndexingStatus(EmptyRequest.create(), {
      onResponse: (response) => {
        if (!response?.workerspacePath || response?.workerspacePath === cwd) {
          setIndexingStatus({
            systemStatus: response.systemStatus,
						message: response.message || "",
						processedItems: response.processedItems,
						totalItems: response.totalItems,
						currentItemUnit: response.currentItemUnit || "items",
          })
        }
      },
      onError: (error) => {console.error("Error in getIndexingStatus subscription:", error)},
			onComplete: () => {console.log("getIndexingStatus completed")},
    })
    getSettings()
  }, [])

  const getStatusColor = () => {
    switch (indexingStatus.systemStatus) {
      case 'Standby':
        return 'bg-gray-600';
      case 'Indexing':
        return 'bg-yellow-600 animate-pulse';
      case 'Indexed':
        return 'bg-green-600';
      case 'Error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  // 根据选择的 provider 显示对应的 API key 字段
  const getApiKeyField = () => {
    if (!currentSettings.codebaseIndexEmbedderProvider) return null;
    
    const provider = currentSettings.codebaseIndexEmbedderProvider;
    let label = "API Key";
    let placeholder = "Enter your API key";
    
    switch (provider) {
      case "openai":
        label = t("advanced.codeIndex.openAiKey") || "API Key";
        break;
      case "qdrant":
        label = t("advanced.codeIndex.qdrantApiKey") || "Qdrant API Key";
        placeholder = "Enter your Qdrant API key (optional)";
        break;
    }
    
    return (
      <div className="mb-3">
        <label className="block text-xs mb-1 opacity-80">{label}</label>
        <VSCodeTextField
          type="password"
          value={currentSettings.codeIndexOpenAiKey || ""}
          onChange={(e: any) => handleSettingChange("codeIndexOpenAiKey", e.target.value)}
          placeholder={placeholder}
          className="w-full"
        />
      </div>
    );
  };

  const renderSetupSection = () => {
    if (!isSetupExpanded) {
      return (
        <div
          className="mt-3 cursor-pointer flex items-center gap-2 text-sm select-none"
          onClick={() => setIsSetupExpanded(true)}
        >
          <span className="codicon codicon-chevron-right text-vscode-foreground opacity-70"></span>
          <span className="font-medium">{t("advanced.codeIndex.setup")}</span>
        </div>
      );
    }

    return (
      <div className="mt-3">
        <div
          className="cursor-pointer flex items-center gap-2 text-sm select-none mb-2"
          onClick={() => setIsSetupExpanded(false)}
        >
          <span className="codicon codicon-chevron-down text-vscode-foreground opacity-70"></span>
          <span className="font-medium">{t("advanced.codeIndex.setup")}</span>
        </div>
        <div className="pl-5 pr-2 py-2 space-y-3">
          {/* Embedder Provider */}
          <div className="mb-3">
            <label className="block text-xs mb-1 opacity-80">{t("advanced.codeIndex.embedderProvider")}</label>
            <VSCodeDropdown
              value={currentSettings.codebaseIndexEmbedderProvider || "openai-compatible"}
              onChange={(e: any) => handleSettingChange("codebaseIndexEmbedderProvider", e.target.value)}
              className="w-full"
            >
              <VSCodeOption value="">Select Provider</VSCodeOption>
              {EMBEDDER_PROVIDERS.map(provider => (
                <VSCodeOption key={provider.value} value={provider.value}>{provider.label}</VSCodeOption>
              ))}
            </VSCodeDropdown>
          </div>

          {/* Base URL */}
          <div className="mb-3">
            <label className="block text-xs mb-1 opacity-80">{t("advanced.codeIndex.baseUrl")}</label>
            <VSCodeTextField
              value={currentSettings.codebaseIndexEmbedderBaseUrl || ""}
              onChange={(e: any) => handleSettingChange("codebaseIndexEmbedderBaseUrl", e.target.value)}
              placeholder="https://api.example.com"
              className="w-full"
            />
          </div>

          {/* API Key */}
          {getApiKeyField()}

          {/* Model */}
          <div className="mb-3">
            <label className="block text-xs mb-1 opacity-80">{t("advanced.codeIndex.model")}</label>
            <VSCodeTextField
              value={currentSettings.codebaseIndexEmbedderModelId || ""}
              onChange={(e: any) => handleSettingChange("codebaseIndexEmbedderModelId", e.target.value)}
              placeholder="Enter model name"
              className="w-full"
            />
          </div>

          {/* Model Dimension */}
          <div className="mb-3">
            <label className="block text-xs mb-1 opacity-80">{t("advanced.codeIndex.modelDimension")}</label>
            <VSCodeTextField
              value={currentSettings.codebaseIndexEmbedderModelDimension?.toString() || "1024"}
              onInput={(e: any) => handleSettingChange("codebaseIndexEmbedderModelDimension", parseInt(e.target.value) || 1024)}
              className="w-full"
            />
          </div>

          {/* Qdrant URL */}
          <div className="mb-3">
            <label className="block text-xs mb-1 opacity-80">{t("advanced.codeIndex.qdrantUrl")}</label>
            <VSCodeTextField
              value={currentSettings.codebaseIndexQdrantUrl || ""}
              onChange={(e: any) => handleSettingChange("codebaseIndexQdrantUrl", e.target.value)}
              placeholder="http://localhost:6333"
              className="w-full"
            />
          </div>

          {/* Qdrant API Key */}
          <div className="mb-3">
            <label className="block text-xs mb-1 opacity-80">{t("advanced.codeIndex.qdrantApiKey")}</label>
            <VSCodeTextField
              type="password"
              value={currentSettings.codeIndexQdrantApiKey || ""}
              onChange={(e: any) => handleSettingChange("codeIndexQdrantApiKey", e.target.value)}
              placeholder="Enter your Qdrant API key (optional)"
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderAdvancedSection = () => {
    if (!isAdvancedExpanded) {
      return (
        <div
          className="mt-3 cursor-pointer flex items-center gap-2 text-sm select-none"
          onClick={() => setIsAdvancedExpanded(true)}
        >
          <span className="codicon codicon-chevron-right text-vscode-foreground opacity-70"></span>
          <span className="font-medium">{t("advanced.codeIndex.advancedConfiguration")}</span>
        </div>
      );
    }

    return (
      <div className="mt-3">
        <div
          className="cursor-pointer flex items-center gap-2 text-sm select-none mb-2"
          onClick={() => setIsAdvancedExpanded(false)}
        >
          <span className="codicon codicon-chevron-down text-vscode-foreground opacity-70"></span>
          <span className="font-medium">{t("advanced.codeIndex.advancedConfiguration")}</span>
        </div>
        <div className="pl-5 pr-2 py-2 space-y-4">
          {/* Search Score Threshold */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs opacity-80">{t("advanced.codeIndex.searchScoreThreshold")}</label>
              <span 
                className="codicon codicon-info text-vscode-descriptionForeground cursor-help"
                title="Minimum similarity score for search results (0-1)"
              />
              <span className="ml-auto text-xs tabular-nums">
                {currentSettings.codebaseIndexSearchMinScore?.toFixed(2) || "0.40"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={currentSettings.codebaseIndexSearchMinScore ?? 0.4}
              onChange={(e) => handleSettingChange("codebaseIndexSearchMinScore", parseFloat(e.target.value))}
              className="w-full accent-vscode-button-background"
            />
          </div>

          {/* Maximum Search Results */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs opacity-80">{t("advanced.codeIndex.maximumSearchResults")}</label>
              <span 
                className="codicon codicon-info text-vscode-descriptionForeground cursor-help"
                title="Maximum number of results to return from search"
              />
              <span className="ml-auto text-xs tabular-nums">
                {currentSettings.codebaseIndexSearchMaxResults ?? 50}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={10}
              value={currentSettings.codebaseIndexSearchMaxResults ?? 50}
              onChange={(e) => handleSettingChange("codebaseIndexSearchMaxResults", parseInt(e.target.value))}
              className="w-full accent-vscode-button-background"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg mb-5 mt-6" style={{ background: CODE_BLOCK_BG_COLOR }}>
      <div className="font-medium mb-2.5">{t("advanced.codeIndex.title")}:</div>
      <div className="text-sm mb-2">{t("advanced.codeIndex.description")}</div>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <VSCodeCheckbox
            checked={isInitialized ? currentSettings.codebaseIndexEnabled : false}
            onChange={(e: any) => handleFieldUpdate(e.target.checked)}
            disabled={!isInitialized}
          >
            {t("advanced.codeIndex.enableLabel")}
          </VSCodeCheckbox>
        </div>
        <div className="text-sm font-medium">
          {t("advanced.codeIndex.statusTitle")}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-vscode-descriptionForeground flex items-center">
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}
            />
            {t(`advanced.codeIndex.indexingStatuses.${indexingStatus.systemStatus.toLowerCase()}`)}
            {indexingStatus.message ? 
            ` - ${ !indexingStatus.message?.includes(' ') ?
             t(`codebaseSearch.${indexingStatus.message}`) : indexingStatus.message }` : ""}
          </div>
        </div>
        {indexingStatus.systemStatus === "Indexing" && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${indexingStatus.totalItems > 0 
                      ? (indexingStatus.processedItems / indexingStatus.totalItems) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              {/* <span className="text-vscode-descriptionForeground whitespace-nowrap">
                {indexingStatus.totalItems > 0 
                  ? `${Math.round((indexingStatus.processedItems / indexingStatus.totalItems) * 100)}%`
                  : "0%"}
              </span> */}
            </div>
          </div>
        )}
        {
          currentSettings.codebaseIndexEnabled && (indexingStatus.systemStatus === "Indexed" ||
            indexingStatus.systemStatus === "Error") && (
              <div className="mt-2">
                <VSCodeButton
                  appearance="secondary"
                  onClick={handleClearIndexData}
                >
                  {t("advanced.codeIndex.clearIndexButton")}
                </VSCodeButton>
              </div>
            )
        }

        {currentSettings.codebaseIndexEnabled &&
          (indexingStatus.systemStatus === "Error" ||
            indexingStatus.systemStatus === "Standby") && (
              <div className="mt-2">
                <VSCodeButton
                  onClick={handleStartIndexing}
                  disabled={startIndexingLoading}
                >
                  {t("advanced.codeIndex.startIndexingButton")}
                </VSCodeButton>
              </div>
            )
        }

        {/* Setup Section */}
        {currentSettings.codebaseIndexEnabled && renderSetupSection()}

        {/* Advanced Configuration Section */}
        {currentSettings.codebaseIndexEnabled && renderAdvancedSection()}

        {/* Save Button */}
        {currentSettings.codebaseIndexEnabled && (isSetupExpanded || isAdvancedExpanded) && hasChanges && (
          <div className="mt-2 flex justify-end">
            <VSCodeButton
              appearance="primary"
              onClick={saveAllSettings}
            >
              {t("advanced.codeIndex.save")}
            </VSCodeButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeIndex;
