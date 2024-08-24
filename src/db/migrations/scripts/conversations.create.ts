import { Migration } from '../abstract/migration.ts';

export class ConversationsCreate extends Migration {
  override up() {
    return this.connection.exec(`
      CREATE TABLE IF NOT EXISTS Conversations
      (
        id        TEXT PRIMARY KEY,
        template  TEXT    NOT NULL,
        strategy  TEXT    NOT NULL,
        counter   INTEGER NOT NULL DEFAULT 0,
        threshold INTEGER NOT NULL DEFAULT 10,
        status    TEXT    NOT NULL DEFAULT 0,
        createdAt DATETIME         DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME         DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  override down() {
    return this.connection.exec('DROP TABLE IF EXISTS Conversations');
  }
}
