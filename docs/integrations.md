# Integrations Guide

**Version:** 1.1.0 
**Status:** Stable

## Overview

ZON provides first-class integrations with popular AI frameworks, making it easy to use token-efficient serialization in your existing workflows.

## Table of Contents

- [LangChain](#langchain)
- [Vercel AI SDK](#vercel-ai-sdk)
- [OpenAI](#openai)

---

## LangChain

### Installation

```bash
npm install zon-format @langchain/core
```

### ZonOutputParser

Parse ZON responses from LLM chains:

```typescript
import { ZonOutputParser } from 'zon-format/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const parser = new ZonOutputParser();

const prompt = ChatPromptTemplate.fromMessages([
  ['system', parser.getFormatInstructions()],
  ['user', 'List 3 programming languages with their year of creation']
]);

const model = new ChatOpenAI({ temperature: 0 });
const chain = prompt.pipe(model).pipe(parser);

const result = await chain.invoke({});
console.log(result);
// {
//   languages: [
//     { name: 'Python', year: 1991 },
//     { name: 'JavaScript', year: 1995 },
//     { name: 'Rust', year: 2010 }
//   ]
// }
```

### Format Instructions

The parser automatically provides format instructions:

```typescript
const instructions = parser.getFormatInstructions();
console.log(instructions);
/*
Your response must be formatted as ZON (Zero Overhead Notation).
ZON is a compact format for structured data.
Rules:
1. Use 'key:value' for properties.
2. Use 'key{...}' for nested objects.
3. Use 'key[...]' for arrays.
4. Use '@(N):col1,col2' for tables.
5. Use 'T'/'F' for booleans, 'null' for null.
...
*/
```

### Error Handling

```typescript
try {
  const result = await chain.invoke({});
} catch (error) {
  if (error.message.includes('Failed to parse ZON')) {
    console.error('LLM returned invalid ZON:', error);
  }
}
```

---

## Vercel AI SDK

### Installation

```bash
npm install zon-format ai
```

### Streaming ZON Responses

Use `streamZon` to parse streaming ZON responses in Next.js:

```typescript
import { streamZon } from 'zon-format/ai-sdk';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await streamText({
    model: openai('gpt-4'),
    system: 'Respond in ZON format. Use @:col1,col2 for tables.',
    prompt
  });

  // Parse streaming ZON
  const objects = [];
  for await (const obj of streamZon(result.textStream)) {
    objects.push(obj);
  }

  return Response.json(objects);
}
```

### Client-Side Usage

```typescript
'use client';

import { useChat } from 'ai/react';
import { streamZon } from 'zon-format/ai-sdk';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  async function handleZonSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: input })
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    async function* readStream() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value);
      }
    }

    for await (const obj of streamZon(readStream())) {
      console.log('Received object:', obj);
    }
  }

  return (
    <form onSubmit={handleZonSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button type="submit">Send</button>
    </form>
  );
}
```

---

## OpenAI

### Installation

```bash
npm install zon-format openai
```

### ZOpenAI Wrapper

Automatically handle ZON format in OpenAI API calls:

```typescript
import { createZOpenAI } from 'zon-format/openai';

const client = createZOpenAI(process.env.OPENAI_API_KEY);

const data = await client.chat({
  model: 'gpt-4',
  messages: [
    {
      role: 'user',
      content: 'List the top 5 programming languages with their primary use case'
    }
  ]
});

console.log(data);
// {
//   languages: [
//     { name: 'Python', useCase: 'Data Science' },
//     { name: 'JavaScript', useCase: 'Web Development' },
//     ...
//   ]
// }
```

### How It Works

The wrapper:
1. Automatically injects ZON format instructions into the system prompt
2. Sends the request to OpenAI
3. Parses the ZON response
4. Returns clean JavaScript objects

### Custom System Prompt

Add your own instructions alongside ZON format:

```typescript
const data = await client.chat({
  model: 'gpt-4',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant. Be concise.'
    },
    {
      role: 'user',
      content: 'Summarize the React framework'
    }
  ]
});
```

The wrapper appends ZON instructions to your system prompt.

### Handling Markdown Code Blocks

The wrapper automatically strips markdown code blocks if the model ignores instructions:

```
```zon
user{name:Alice}
```
```

↓ Automatically cleaned to:

```
user{name:Alice}
```

---

## Best Practices

### 1. Always Provide Examples

LLMs learn better with examples:

```typescript
const prompt = `
Respond in ZON format. Example:

users:@(2):id,name,role
1,Alice,Admin
2,Bob,User

Now list 3 products:
`;
```

### 2. Use Streaming for Large Datasets

Streaming reduces latency and memory usage:

```typescript
// ✅ Good: Stream results as they arrive
for await (const obj of streamZon(response)) {
  await processObject(obj);
}

// ❌ Bad: Wait for entire response
const text = await response.text();
const objects = decode(text);
```

### 3. Handle Parsing Errors Gracefully

```typescript
try {
  const result = await client.chat({ ... });
} catch (error) {
  if (error.message.includes('Failed to parse ZON')) {
    // Retry with more explicit instructions
    // or fallback to JSON
  }
}
```

---

## See Also

- [API Reference](api-reference.md) - Full API documentation
- [LLM Best Practices](llm-best-practices.md) - Tips for LLM integration
- [Streaming Guide](streaming-guide.md) - Streaming details
