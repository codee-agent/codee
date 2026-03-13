import { EmptyRequest, SetAutoCompletionRequest } from "@shared/proto/index.cline"
import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CodeeConfig } from "@continuedev/core/util/codaiConfigUtil"
import { BusinessServiceClient } from "@/services/grpc-client"
import { VALUE_DEFAULT_AUTOCOMPLETE_PROVIDER, VALUE_CODEE_BASE_URL } from "@rootUtils/values"

interface AutoCompleteProps {
  isPopup?: boolean
  currentMode?: Mode
}

const AutoComplete = ({ isPopup }: AutoCompleteProps) => {
  const { t } = useTranslation()
  const { apiConfiguration } = useExtensionState()
  const extensionState = useExtensionState()
  const [isLoading, setIsLoading] = useState(true)
  const [autocompleteConfig, setAutocompleteConfig] = useState({
    provider: "Openai Compatible",
    title: "autocomplete-coder",
    apiKey: "",
    model: "",
    apiBase: "",
    enable: false,
  })
  const codeeApiKey = apiConfiguration?.apiKey
  const [autocompleteConfigList, setAutocompleteConfigList] = useState<CodeeConfig["autocomplete"]>([])

  const setCodeeProviderDefaults = (providerConfig: any) => {
    if (!providerConfig) return providerConfig;
    
    const updatedConfig = { ...providerConfig };
    
    if (!updatedConfig.apiBase && VALUE_CODEE_BASE_URL) {
      updatedConfig.apiBase = `${VALUE_CODEE_BASE_URL}v1`;
    }
    if (!updatedConfig.apiKey && apiConfiguration?.codeeApiKey) {
      updatedConfig.apiKey = apiConfiguration.codeeApiKey;
    }
    if (!updatedConfig.model && extensionState.codeeCompleteModels?.[0]) {
      updatedConfig.model = extensionState.codeeCompleteModels[0];
    }
    
    return updatedConfig;
  };

  const getAutoComplete = () => {
    BusinessServiceClient.getAllAutoCompletion(EmptyRequest.create())
    .then((response: any) => {
      if (response.autoCompletion) {
        console.log('getAllAutoCompletion response', response)
        const currentProvider = response.autoCompletion.find(
          (item: any) => item.provider.toLowerCase() === response.currentCompleteProvider.toLowerCase(),
        )
        const defaultProvider = response.autoCompletion.find(
          (item: any) => item.provider.toLowerCase() === VALUE_DEFAULT_AUTOCOMPLETE_PROVIDER.toLowerCase(),
        )
        let setProvider = currentProvider
        if (currentProvider) {
          if (currentProvider.provider === 'codee' && !apiConfiguration?.codeeApiKey && defaultProvider) {
            setProvider = defaultProvider
          }
        } else {
          if (defaultProvider) {
            setProvider = defaultProvider
          }
        }
        if (setProvider) {
          if (setProvider.provider.toLowerCase() === 'codee') {
            setProvider = setCodeeProviderDefaults(setProvider)
          }
          setAutocompleteConfig(prev => ({ ...prev, ...setProvider }))
        }
        setAutocompleteConfigList([...response.autoCompletion])
        setIsLoading(false)
      }
    })
    .catch((error) => {
      setIsLoading(false)
      console.error("Failed to get auto-completion settings:", error)
    })
  }

  useEffect(() => {
    getAutoComplete()
  }, [codeeApiKey])

  const handleFieldUpdate = (field: string, value: string | boolean) => {
    setAutocompleteConfig(prev => {
      const newConfig = {
        ...prev,
        [field]: value
      };
      BusinessServiceClient.setAutoCompletion(SetAutoCompletionRequest.create({
        autoCompletion: newConfig
      })).catch((error) => {
        console.error("Failed to update auto-completion settings:", error)
      });
      return newConfig;
    });
  };

  const handleProviderChange = (newProvider: string) => {
    setAutocompleteConfig(prev => {
      console.log('handleProviderChange prev', prev)
      let newConfig = autocompleteConfigList.find((item: any) => item.provider === newProvider)
      if (newConfig) {
        if (newProvider.toLowerCase() === 'codee') {
          newConfig = setCodeeProviderDefaults(newConfig)
        }
        BusinessServiceClient.setAutoCompletion(SetAutoCompletionRequest.create({
          autoCompletion: {
            ...newConfig,
            provider: newProvider
          }
        })).then(() => {
          getAutoComplete()
        }).catch((error) => {
          console.error("Failed to update auto-completion settings:", error)
        })
      }
      return prev // Keep current state until getAutoComplete() updates it
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: isPopup ? -10 : 0 }}>
      {isLoading ? (<div>Loading...</div>) : 
        (
          <div className="border border-solid border-[var(--vscode-panel-border)] rounded-md p-[10px] mb-5 bg-[var(--vscode-panel-background)] [&_vscode-dropdown]:w-full [&_vscode-text-field]:w-full">
            <details open>
              <summary className="cursor-pointer font-medium">{t("settings.autocomplete.title")}</summary>
              <div className="mt-3 space-y-3">
                <span style={{ fontWeight: 500 }}>{t("settings.api.provider")}</span>
                <VSCodeDropdown
                  onChange={(e: any) => handleProviderChange(e.target.value)}
                  value={autocompleteConfig.provider}>
                  <VSCodeOption
                    disabled={!apiConfiguration?.codeeApiKey}
                    title={!apiConfiguration?.codeeApiKey ? t("settings.autocomplete.disableTitle") : ""}
                    value="codee">
                    Codee
                  </VSCodeOption>
                  <VSCodeOption value="Openai Compatible">OpenAI Compatible</VSCodeOption>
                </VSCodeDropdown>

                {autocompleteConfig.provider !== "codee" && (
                  <VSCodeTextField
                    onInput={(e: any) => handleFieldUpdate('apiBase', e.target.value)}
                    placeholder={t("settings.autocomplete.apiBase")}
                    value={autocompleteConfig.apiBase}>
                    {t("settings.autocomplete.apiBase")}
                  </VSCodeTextField>
                )}

                {autocompleteConfig.provider !== "codee" && (
                  <VSCodeTextField
                    onInput={(e: any) => handleFieldUpdate('apiKey', e.target.value)}
                    placeholder={t("settings.autocomplete.apiKey")}
                    type="password"
                    value={autocompleteConfig.apiKey}>
                    {t("settings.autocomplete.apiKey")}
                  </VSCodeTextField>
                )}

                {autocompleteConfig.provider === "codee" ? (
                  <div>
                    <div style={{ marginBottom: "2px" }}>
                      <span style={{ fontWeight: 500 }}>{t("settings.autocomplete.model")}</span>
                    </div>
                    <VSCodeDropdown
                      onChange={(e: any) => handleFieldUpdate('model', e.target.value)}
                      value={autocompleteConfig.model}>
                      {extensionState.codeeCompleteModels?.map((model) => (
                        <VSCodeOption key={model} value={model}>
                          {model}
                        </VSCodeOption>
                      ))}
                    </VSCodeDropdown>
                  </div>
                ) : (
                  <VSCodeTextField
                    onInput={(e: any) => handleFieldUpdate('model', e.target.value)}
                    placeholder={t("settings.autocomplete.model")}
                    value={autocompleteConfig.model}>
                    {t("settings.autocomplete.model")}
                  </VSCodeTextField>
                )}

                <VSCodeCheckbox
                  checked={autocompleteConfig.enable}
                  onChange={(e: any) => handleFieldUpdate('enable', e.target.checked)}>
                  {t("settings.autocomplete.enable")}
                </VSCodeCheckbox>
              </div>
            </details>
          </div>
        )}
    </div>
  )
}

export default AutoComplete
