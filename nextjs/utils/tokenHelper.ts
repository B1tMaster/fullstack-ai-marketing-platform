import { Tiktoken } from "js-tiktoken/lite";
import cl100k_base from "js-tiktoken/encoders/cl100k_base.json";

let encoder: Tiktoken | null = null;

export async function initializeTokenEncoder() {
  if (!encoder) {
    encoder = new Tiktoken(
      cl100k_base.bpe_ranks,
      cl100k_base.special_tokens,
      cl100k_base.pat_str
    );
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

