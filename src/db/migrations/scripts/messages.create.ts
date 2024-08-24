import { Migration } from '../abstract/migration.ts';

export class MessagesCreate extends Migration {
  override up() {
    return this.connection.exec(`
      CREATE TABLE IF NOT EXISTS Messages
      (
        id             INTEGER PRIMARY KEY,
        role           TEXT NOT NULL,
        content        TEXT NOT NULL,
        createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
        conversationId TEXT NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES Conversations (id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
  }

  override down() {
    return this.connection.exec('DROP TABLE IF EXISTS Messages');
  }
}
