/**
 * Local Ollama LLM Client
 */

import { Ollama } from 'ollama';
import type {
  ILLMClient,
  ILLMChatSession,
  Message,
  LLMResponse,
} from '../types/index.js';
import { validateOllamaConfig } from './ollamaValidation.js';

/**
 * Wrapper for Ollama chat session to provide universal interface
 */
class OllamaChatSessionWrapper implements ILLMChatSession {
  private ollama: Ollama;
  private modelName: string;
  private systemInstruction: string;
  private history: Message[] = [];

  constructor(
    ollama: Ollama,
    modelName: string,
    systemInstruction: string,
    initialHistory?: Message[]
  ) {
    this.ollama = ollama;
    this.modelName = modelName;
    this.systemInstruction = systemInstruction;
    this.history = initialHistory || [];
  }

  async sendMessage(text: string): Promise<LLMResponse> {
    // Build messages array with system instruction and history
    const messages: any[] = [
      {
        role: 'system',
        content: this.systemInstruction,
      },
    ];

    // Add conversation history
    for (const msg of this.history) {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.parts.map((p) => p.text).join('\n'),
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: text,
    });

    // Call Ollama API
    const response = await this.ollama.chat({
      model: this.modelName,
      messages: messages,
      stream: false,
    });

    const responseText = response.message.content;

    // Add to history
    this.history.push({
      role: 'user',
      parts: [{ text }],
    });
    this.history.push({
      role: 'model',
      parts: [{ text: responseText }],
    });

    return { text: responseText };
  }

  getHistory(): Message[] {
    return this.history;
  }
}

/**
 * Ollama LLM Client implementation
 */
export class OllamaLLMClient implements ILLMClient {
  private ollama: Ollama;
  private modelName: string;
  private baseUrl: string;

  constructor(modelName: string, baseUrl: string) {
    this.modelName = modelName;
    this.baseUrl = baseUrl;
    this.ollama = new Ollama({ host: baseUrl });
  }

  /**
   * Create client from environment variables
   */
  static fromEnvironment(): OllamaLLMClient {
    const config = validateOllamaConfig();
    return new OllamaLLMClient(config.modelName, config.ollamaBaseUrl);
  }

  /**
   * Create a chat session
   */
  createChatSession(
    systemInstruction: string,
    history?: Message[]
  ): ILLMChatSession {
    return new OllamaChatSessionWrapper(
      this.ollama,
      this.modelName,
      systemInstruction,
      history
    );
  }

  /**
   * Count tokens in history (approximate)
   */
  countHistoryTokens(history: Message[]): number {
    // Rough estimation (1 token ≈ 4 characters)
    let totalTokens = 0;
    for (const msg of history) {
      for (const part of msg.parts) {
        totalTokens += Math.ceil(part.text.length / 4);
      }
    }
    return totalTokens;
  }

  /**
   * Get model name
   */
  getModelName(): string {
    return this.modelName;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    const response = await this.ollama.list();
    return response.models.map((model) => model.name);
  }

  isAvailable(): boolean {
    return true;
  }

  readyForUseMessage(): string {
    return `Ollama LLM Client is configured to use model "${this.modelName}" at ${this.baseUrl}`;
  }

  preparingForUseMessage(): string {
    return `Preparing Ollama LLM Client with model "${this.modelName}" at ${this.baseUrl}`;
  }

  /**
   * Check if model exists
   */
  async modelExists(modelName?: string): Promise<boolean> {
    const name = modelName || this.modelName;
    const models = await this.listModels();
    return models.some((m) => m.includes(name));
  }
}
