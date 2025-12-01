import { streamZon } from '../integrations/ai-sdk';

describe('Vercel AI SDK Integration', () => {
  it('streams ZON objects from an async iterable', async () => {
    async function* generateChunks() {
      yield '@:id,name\n';
      yield '1,Item A\n';
      yield '2,Item B\n';
    }

    const objects: any[] = [];
    for await (const obj of streamZon(generateChunks())) {
      objects.push(obj);
    }

    expect(objects).toEqual([
      { id: 1, name: 'Item A' },
      { id: 2, name: 'Item B' }
    ]);
  });

  it('handles split chunks', async () => {
    async function* generateChunks() {
      yield '@:id,n';
      yield 'ame\n1,Item A\n2,Item B\n';
    }

    const objects: any[] = [];
    for await (const obj of streamZon(generateChunks())) {
      objects.push(obj);
    }

    expect(objects).toEqual([
      { id: 1, name: 'Item A' },
      { id: 2, name: 'Item B' }
    ]);
  });
});
