import { Migration } from '../abstract/migration.ts';

export class MigrationsCreate extends Migration {
  override up() {
    return this.connection.exec(`
      CREATE TABLE IF NOT EXISTS Migrations
      (
        id        INTEGER PRIMARY KEY,
        name      TEXT    NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  override down() {
    return this.connection.exec('DROP TABLE IF EXISTS Migrations');
  }
}
