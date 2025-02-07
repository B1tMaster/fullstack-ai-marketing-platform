import { Tiktoken } from "js-tiktoken/lite";
import { encodingForModel } from "js-tiktoken";
import logger from "@/utils/logger";

let encoder: Tiktoken | null = null;
let encoderInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

async function initializeTokenEncoder(): Promise<boolean> {
  // If already initialized successfully, return true
  if (encoderInitialized && encoder) return true;
  
  // If initialization is in progress, wait for it
  if (initializationPromise) return initializationPromise;
  
  // Start new initialization
  initializationPromise = (async () => {
    try {
      encoder = await encodingForModel("gpt-4o");
      encoderInitialized = encoder !== null;
      return encoderInitialized;
    } catch (error) {
      logger.error("Failed to initialize token encoder", error instanceof Error ? error : new Error(String(error)), {
        component: 'tokenHelper',
        action: 'initializeTokenEncoder'
      });
      encoder = null;
      encoderInitialized = false;
      return false;
    } finally {
      initializationPromise = null;
    }
  })();
  
  return initializationPromise;
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
    
    // Try to initialize encoder with exponential backoff
    for (let i = 0; i < 3; i++) {
      const isReady = await initializeTokenEncoder();
      if (isReady && encoder) {
        return encoder.encode(prompt).length;
      }
      // Exponential backoff between retries
      const delay = Math.pow(2, i) * 100; // 100ms, 200ms, 400ms
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    logger.warn("Token encoder initialization failed after retries", {
      component: 'tokenHelper',
      action: 'getPromptTokenCount',
      retryCount: 3
    });
    return 0;
  } catch (error) {
    logger.error("Token calculation error", error instanceof Error ? error : new Error(String(error)), {
      component: 'tokenHelper',
      action: 'getPromptTokenCount'
    });
    return 0;
  }
};

export function freeTokenEncoder() {
  encoder = null;
}
