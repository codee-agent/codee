import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureRulesDirectoryExists } from './disk';
import { refreshClineRulesToggles } from "@core/context/instructions/user-instructions/cline-rules"
import * as vscode from 'vscode';
import * as os from 'os';
import { Controller } from "@/core/controller"

const memoryBankFileName = 'memory_bank.md';
let memoryBankFilePath: string;

/**
 * Checks if memory_bank.md file exists
 * @returns Promise resolving to boolean indicating file existence
 */
export async function rulesFileExists(): Promise<boolean> {
    if (!memoryBankFilePath) {
        const globalRulesDir = await ensureRulesDirectoryExists();
        memoryBankFilePath = path.join(globalRulesDir, memoryBankFileName);
    }
    
    try {
        await fs.access(memoryBankFilePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Creates or overwrites memory_bank.md file
 * @param content Content to write to the file
 */
export async function rulesFileWrite(content: string): Promise<void> {
    const fileExists = await rulesFileExists();
    
    try {
        await fs.writeFile(memoryBankFilePath, content, 'utf-8');
        console.log(`Successfully ${fileExists ? 'updated' : 'created'} memory_bank.md at ${memoryBankFilePath}`);
    } catch (error) {
        console.error(`Failed to write memory_bank.md: ${error}`);
        throw error;
    }
}

/**
 * Checks if memory_bank.md is activated
 * @returns Promise resolving to boolean indicating activation status
 */
export async function rulesFileIsActivated(context: Controller): Promise<boolean> {
    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || path.join(os.homedir(), 'Desktop');
    const { globalToggles } = await refreshClineRulesToggles(context, cwd);
    return globalToggles[memoryBankFilePath] === true;
}
