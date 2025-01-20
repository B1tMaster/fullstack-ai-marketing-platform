import { Tiktoken } from "js-tiktoken/lite";
import { encodingForModel } from "js-tiktoken";

let encoder: Tiktoken | null = null;

export async function initializeTokenEncoder() {
  if (!encoder) {
    // Use gpt-3.5-turbo model which uses cl100k_base encoding
    encoder = encodingForModel("gpt-3.5-turbo");
  }
}

export const getPromptTokenCount = (prompt: string): number => {
  if (!encoder) {
    throw new Error("Token encoder not initialized. Call initializeTokenEncoder() first.");
  }
  return encoder.encode(prompt).length;
};

export function freeTokenEncoder() {
  if (encoder) {
    encoder.free();
    encoder = null;
  }
}

