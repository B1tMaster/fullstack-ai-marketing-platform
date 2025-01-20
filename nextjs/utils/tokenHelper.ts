//Used to help with token counting
// use js-tiktoken to count tokens
 Documentation:  https://github.com/dqbd/tiktoken#nextjs

 // create function: export const getPromptTokenCount(prompt: string): number 



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

export function countTokens(text: string): number {
  if (!encoder) {
    throw new Error("Token encoder not initialized. Call initializeTokenEncoder() first.");
  }
  return encoder.encode(text).length;
}

export function freeTokenEncoder() {
  if (encoder) {
    encoder.free();
    encoder = null;
  }
}
