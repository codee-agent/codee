import { ModelFamily } from "@/shared/prompts"
import { Logger } from "@/shared/services/Logger"
import { ClineDefaultTool } from "@/shared/tools"
import { isCodeeFamily } from "@/utils/model-utils"
import { SystemPromptSection } from "../../templates/placeholders"
import { createVariant } from "../variant-builder"
import { validateVariant } from "../variant-validator"
import { codeeComponentOverrides } from "./overrides"
import { baseTemplate } from "./template"

export const config = createVariant(ModelFamily.Codee)
	.description("Prompt optimized for Codee model with advanced agentic capabilities.")
	.version(1)
	.tags("codee", "DeepSeek-","glm-","kimi-k")
	.labels({
		stable: 1,
		production: 1,
		use_native_tools: 1,//huqb
	})
	.matcher((context) => {
		return isCodeeFamily(context.providerInfo.model.id)
	})
	.template(baseTemplate)
	.components(
		SystemPromptSection.AGENT_ROLE,
		SystemPromptSection.TOOL_USE,
		SystemPromptSection.TASK_PROGRESS,
		SystemPromptSection.RULES,
		SystemPromptSection.ACT_VS_PLAN,
		SystemPromptSection.CLI_SUBAGENTS,
		SystemPromptSection.CAPABILITIES,
		SystemPromptSection.EDITING_FILES,
		SystemPromptSection.TODO,
		SystemPromptSection.MCP,
		SystemPromptSection.SYSTEM_INFO,
		SystemPromptSection.OBJECTIVE,
		SystemPromptSection.USER_INSTRUCTIONS,
		SystemPromptSection.SKILLS,
	)
	.tools(
		ClineDefaultTool.BASH,
		ClineDefaultTool.FILE_READ,
		ClineDefaultTool.FILE_NEW,
		ClineDefaultTool.FILE_EDIT,
		ClineDefaultTool.SEARCH,
		ClineDefaultTool.LIST_FILES,
		ClineDefaultTool.LIST_CODE_DEF,
		ClineDefaultTool.BROWSER,
		ClineDefaultTool.MCP_USE,
		ClineDefaultTool.MCP_ACCESS,
		ClineDefaultTool.ASK,
		ClineDefaultTool.ATTEMPT,
		ClineDefaultTool.PLAN_MODE,
		ClineDefaultTool.MCP_DOCS,
		ClineDefaultTool.TODO,
		ClineDefaultTool.GENERATE_EXPLANATION,
		ClineDefaultTool.USE_SKILL,
	)
	.placeholders({
		MODEL_FAMILY: ModelFamily.GLM,
	})
	.config({})
	// Apply CODEE-specific component overrides
	.overrideComponent(SystemPromptSection.TOOL_USE, codeeComponentOverrides[SystemPromptSection.TOOL_USE])
	.overrideComponent(SystemPromptSection.OBJECTIVE, codeeComponentOverrides[SystemPromptSection.OBJECTIVE])
	.overrideComponent(SystemPromptSection.RULES, codeeComponentOverrides[SystemPromptSection.RULES])
	.overrideComponent(SystemPromptSection.TASK_PROGRESS, codeeComponentOverrides[SystemPromptSection.TASK_PROGRESS])
	.overrideComponent(SystemPromptSection.MCP, codeeComponentOverrides[SystemPromptSection.MCP])
	.build()

// Compile-time validation
const validationResult = validateVariant({ ...config, id: "codee" }, { strict: true })
if (!validationResult.isValid) {
	Logger.error("Codee variant configuration validation failed:", validationResult.errors)
	throw new Error(`Invalid Codee variant configuration: ${validationResult.errors.join(", ")}`)
}

if (validationResult.warnings.length > 0) {
	Logger.warn("Codee variant configuration warnings:", validationResult.warnings)
}

// Export type information for better IDE support
export type CodeeVariantConfig = typeof config
