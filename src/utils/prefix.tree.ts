class TrieNode<Type = unknown> extends Map {
  value?: Type;
  isEnd = false;
}

export class Trie<Type = unknown> {
  private readonly root = new TrieNode<Type>();

  constructor(key?: string, value?: Type) {
    if (key && value) {
      this.set(key, value);
    }
  }

  set(key: string, value: Type): void {
    let node = this.root;
    for (const c of key) {
      const char = c.toLowerCase();
      if (!node.has(char)) {
        node.set(char, new TrieNode<Type>());
      }
      node = node.get(char);
    }

    node.value = value;
    node.isEnd = true;
  }

  has(key: string): boolean {
    let node = this.root;
    for (const c of key) {
      const char = c.toLowerCase();
      if (!node.has(char)) return false;
      node = node.get(char);
    }

    return node.isEnd;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const c of prefix) {
      const char = c.toLowerCase();
      if (!node.has(char)) return false;
      node = node.get(char);
    }

    return true;
  }

  get(key: string) {
    let node = this.root;
    for (const c of key) {
      const char = c.toLowerCase();
      if (!node.has(char)) return;
      node = node.get(char);
    }

    return node.value;
  }
}
