import { Tiktoken } from "js-tiktoken/lite";
import { encodingForModel } from "js-tiktoken";

let encoder: Tiktoken | null = null;
let encoderInitialized = false;

async function initializeTokenEncoder(): Promise<boolean> {
  try {
    if (encoderInitialized) return true;
    
    encoder = await encodingForModel("gpt-4o");
    encoderInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize token encoder:", error);
    encoderInitialized = false;
    return false;
  }
}

export function formatTokens(tokenCount: number): string {
  if (tokenCount < 1000) {
    return tokenCount.toString();
  } else {
    const kCount = tokenCount / 1000;
    const roundedKCount = Math.round(kCount * 10) / 10;
    return `${roundedKCount}k`;
  }
}

export const getPromptTokenCount = async (prompt: string): Promise<number> => {
  try {
    // Handle empty string case
    if (!prompt || prompt.trim().length === 0) return 0;
    
    // Ensure encoder is initialized
    const isReady = await initializeTokenEncoder();
    if (!isReady || !encoder) {
      throw new Error("Token encoder not initialized");
    }
    
    // Actual token calculation
    return encoder.encode(prompt).length;
  } catch (error) {
    console.error("Token calculation error:", error);
    return 0; // Return 0 instead of NaN on error
  }
};

export function freeTokenEncoder() {
  encoder = null;
}
