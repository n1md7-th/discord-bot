import { expect, describe, it } from 'bun:test';
import { Trie } from '../prefix.tree.ts';

describe('Trie', () => {
  describe('set', () => {
    it('should set a value', () => {
      const trie = new Trie();

      trie.set('hello', true);

      expect(trie.has('hello')).toBe(true);
    });
  });

  describe('exact match', () => {
    describe('has', () => {
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
    });

    describe('get', () => {
      it('should find and get exact match', () => {
        const trie = new Trie('!skip', true);

        trie.set('Kathleen', true);
        trie.set('Harry', true);

        expect(trie.get('Kathleen')).toBe(true);
        expect(trie.get('KaThlEen')).toBe(true);
        expect(trie.get('Harry')).toBe(true);
        expect(trie.get('HarrY')).toBe(true);
        expect(trie.get('!skip')).toBe(true);

        expect(trie.get('!skip ')).toBeUndefined();
        expect(trie.get('!skip!')).toBeUndefined();
        expect(trie.get('!skip this message')).toBeUndefined();
        expect(trie.get('!skip this message!')).toBeUndefined();
      });
    });
  });

  describe('prefix match', () => {
    describe('startsWith', () => {
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

    describe('getByPrefix', () => {
      it('should find and get prefix match', () => {
        const trie = new Trie();

        trie.set('!skip', 'SKIP COMMAND');
        trie.set('!extend', 'EXTEND COMMAND');
        trie.set('!enable', 'ENABLE COMMAND');
        trie.set('!disable', 'DISABLE COMMAND');

        expect(trie.getByPrefix('!skip')).toBe('SKIP COMMAND');
        expect(trie.getByPrefix('!extend')).toBe('EXTEND COMMAND');
        expect(trie.getByPrefix('!enable')).toBe('ENABLE COMMAND');
        expect(trie.getByPrefix('!disable')).toBe('DISABLE COMMAND');
      });
    });
  });
});
