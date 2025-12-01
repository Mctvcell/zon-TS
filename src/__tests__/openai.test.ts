import { ZOpenAI } from '../integrations/openai';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

describe('ZOpenAI', () => {
  let mockCreate: jest.Mock;
  let zopenai: ZOpenAI;

  beforeEach(() => {
    mockCreate = jest.fn();
    // @ts-ignore
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }));
    zopenai = new ZOpenAI(new OpenAI({ apiKey: 'test' }));
  });

  it('injects instructions and parses response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: 'user{name:Alice}'
        }
      }]
    });

    const result = await zopenai.chat({
      messages: [{ role: 'user', content: 'Who is it?' }],
      model: 'gpt-4'
    });

    expect(result).toEqual({ user: { name: 'Alice' } });

    // Verify instructions injected
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].role).toBe('system');
    expect(callArgs.messages[0].content).toContain('RESPONSE FORMAT: You must respond in ZON');
  });

  it('handles markdown code blocks', async () => {
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: '```zon\nuser{name:Bob}\n```'
        }
      }]
    });

    const result = await zopenai.chat({
      messages: [{ role: 'user', content: 'Who is it?' }],
      model: 'gpt-4'
    });

    expect(result).toEqual({ user: { name: 'Bob' } });
  });
});
