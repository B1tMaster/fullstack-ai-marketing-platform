export interface CommonPrompt {
  id: string;
  name: string;
  prompt: string | null;
  order: number;
  tokenCount: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
