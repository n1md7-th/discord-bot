import { expect, describe, it } from 'bun:test';
import { Trie } from '../prefix.tree.ts';

describe('Trie', () => {
  it('should find exact match', () => {
    const trie = new Trie('!skip', true);

    trie.set('Kathleen', true);
    trie.set('Harry', true);

    expect(trie.has('Kathleen')).toBe(true);
    expect(trie.has('KaThlEen')).toBe(true);
    expect(trie.has('Harry')).toBe(true);
    expect(trie.has('HarrY')).toBe(true);
    expect(trie.has('!skip')).toBe(true);

    expect(trie.has('!skip ')).toBe(false);
    expect(trie.has('!skip!')).toBe(false);
    expect(trie.has('!skip this message')).toBe(false);
    expect(trie.has('!skip this message!')).toBe(false);
  });

  it('should find prefix match', () => {
    const trie = new Trie('!skip this message', true);

    trie.set('Kathleen', true);
    trie.set('Harry', true);

    expect(trie.startsWith('!skip')).toBe(true);
    expect(trie.startsWith('!skip this')).toBe(true);
    expect(trie.startsWith('ha')).toBe(true);
    expect(trie.startsWith('kath')).toBe(true);
  });
});
