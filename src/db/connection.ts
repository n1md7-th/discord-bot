import { Database } from 'bun:sqlite';

export const connection = new Database('.dbs/sqlite.db', {
  readwrite: true,
  strict: true,
});
