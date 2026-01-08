/**
 * Ollama configuration validation
 */

import { z } from 'zod';

/**
 * Ollama configuration schema
 */
const OllamaConfigSchema = z.object({
  modelName: z.string().min(1, 'OLLAMA_MODEL_NAME is required'),
  ollamaBaseUrl: z.string().url().default('http://localhost:11434'),
});

export type OllamaConfig = z.infer<typeof OllamaConfigSchema>;

/**
 * Validate Ollama configuration from environment
 */
export function validateOllamaConfig(): OllamaConfig {
  const config = {
    modelName: process.env.OLLAMA_MODEL_NAME || 'llama2',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  };

  const result = OllamaConfigSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path}: ${e.message}`);
    throw new Error(`Ollama configuration error:\n${errors.join('\n')}`);
  }

  return result.data;
}
