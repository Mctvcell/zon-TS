import OpenAI from 'openai';
import { decode } from '../index';

/**
 * Wrapper for OpenAI SDK to automatically handle ZON format.
 */
export class ZOpenAI {
  private client: OpenAI;

  constructor(client: OpenAI) {
    this.client = client;
  }

  /**
   * Sends a chat completion request and parses the response as ZON.
   * Automatically appends ZON format instructions to the system prompt.
   */
  async chat(params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming): Promise<any> {
    const messages = [...params.messages];
    const systemMsg = messages.find(m => m.role === 'system');
    
    const instructions = `\n\nRESPONSE FORMAT: You must respond in ZON (Zero Overhead Notation).
Rules:
1. Use 'key:value' for properties.
2. Use 'key{...}' for nested objects.
3. Use 'key[...]' for arrays.
4. Use '@(N):col1,col2' for tables.
5. Use 'T'/'F' for booleans, 'null' for null.
6. Do NOT wrap in markdown code blocks.`;

    if (systemMsg) {
      if (typeof systemMsg.content === 'string') {
        systemMsg.content += instructions;
      } else {
        messages.push({ role: 'system', content: instructions });
      }
    } else {
      messages.unshift({ role: 'system', content: instructions });
    }

    const response = await this.client.chat.completions.create({
      ...params,
      messages,
      stream: false
    });

    const content = response.choices[0]?.message?.content || '';
    
    const cleaned = content.replace(/```(zon|zonf)?/g, "").trim();
    
    return decode(cleaned);
  }
}

/**
 * Helper to create a ZOpenAI instance.
 */
export function createZOpenAI(apiKey?: string): ZOpenAI {
  return new ZOpenAI(new OpenAI({ apiKey }));
}
