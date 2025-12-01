import { ZonStreamDecoder } from "../core/stream";

/**
 * Parses a stream of ZON text (e.g. from Vercel AI SDK's useChat) into objects.
 * 
 * @param stream - The ReadableStream of text chunks.
 * @returns An AsyncGenerator yielding parsed objects.
 */
export async function* parseZonStream<T = any>(stream: ReadableStream<string> | AsyncIterable<string>): AsyncGenerator<T, void, unknown> {
  yield* streamZon<T>(stream);
}

async function* streamToAsyncIterable(stream: ReadableStream<string>): AsyncIterable<string> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) yield value;
    }
  } finally {
    reader.releaseLock();
  }
}



/**
 * Wrapper to use ZonStreamDecoder with a stream.
 */
export function streamZon<T = any>(stream: ReadableStream<string> | AsyncIterable<string>): AsyncGenerator<T, void, unknown> {
  const decoder = new ZonStreamDecoder();
  const iterator = (stream as any)[Symbol.asyncIterator] 
    ? (stream as AsyncIterable<string>) 
    : streamToAsyncIterable(stream as ReadableStream<string>);
    
  return decoder.decode(iterator);
}
