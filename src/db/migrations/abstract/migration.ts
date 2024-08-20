import type { Database } from 'bun:sqlite';

export abstract class Migration {
  constructor(protected readonly connection: Database) {}

  up(): unknown {
    throw new Error('Method `up` not implemented.');
  }

  down(): unknown {
    throw new Error('Method `down` not implemented.');
  }
}
