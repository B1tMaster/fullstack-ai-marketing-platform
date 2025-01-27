import { Tiktoken } from "js-tiktoken/lite";
import { encodingForModel } from "js-tiktoken";

let encoder: Tiktoken | null = null;
let encoderInitialized = false;

async function initializeTokenEncoder(): Promise<boolean> {
  try {
    if (encoderInitialized && encoder) return true;
    
    encoder = await encodingForModel("gpt-4o");
    encoderInitialized = encoder !== null;
    return encoderInitialized;
  } catch (error) {
    console.error("Failed to initialize token encoder:", error);
    encoder = null;
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
    
    // Try to initialize encoder up to 3 times
    for (let i = 0; i < 3; i++) {
      const isReady = await initializeTokenEncoder();
      if (isReady && encoder) {
        return encoder.encode(prompt).length;
      }
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.warn("Token encoder initialization failed after retries");
    return 0;
  } catch (error) {
    console.error("Token calculation error:", error);
    return 0;
  }
};

export function freeTokenEncoder() {
  encoder = null;
}
