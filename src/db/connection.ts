import { Database } from 'bun:sqlite';

export const connection = new Database('sqlite.db', {
  readwrite: true,
  strict: true,
});
