import { Tiktoken } from "js-tiktoken/lite";
import { encodingForModel } from "js-tiktoken";

let encoder: Tiktoken | null = null;

export function formatTokens(tokenCount: number): string {
  if (tokenCount < 1000) {
    return tokenCount.toString();
  } else {
    const kCount = tokenCount / 1000;
    const roundedKCount = Math.round(kCount * 10) / 10;
    return `${roundedKCount}k`;
  }
}

export async function initializeTokenEncoder() {
  if (!encoder) {
    encoder = encodingForModel("gpt-4o");
  }
}

export const getPromptTokenCount = async (prompt: string): Promise<number> => {
  if (!encoder) {
    try {
      await initializeTokenEncoder();
    } catch (error) {
      console.error("Error initializing token encoder", error);
      throw new Error("Error initializing token encoder");
    }
  }
  if (!encoder) {
    throw new Error(
      "Token encoder still not initialized.. after initializeTokenEncoder()"
    );
  }
  return encoder.encode(prompt).length;
};

export function freeTokenEncoder() {
  encoder = null;
}
