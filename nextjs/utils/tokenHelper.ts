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
    // Use gpt-3.5-turbo model which uses cl100k_base encoding
    encoder = encodingForModel("gpt-4o");
  }
}

export const getPromptTokenCount = (prompt: string): number => {
  if (!encoder) {
    throw new Error(
      "Token encoder not initialized. Call initializeTokenEncoder() first."
    );
  }
  return encoder.encode(prompt).length;
};

export function freeTokenEncoder() {
  encoder = null;
}
