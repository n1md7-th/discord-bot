import { Migration } from '../abstract/migration.ts';

export class MigrationsCreate extends Migration {
  override up() {
    return this.connection.exec(`
      CREATE TABLE IF NOT EXISTS migrations
      (
        id        INTEGER PRIMARY KEY,
        name      TEXT    NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `);
  }

  override down() {
    return this.connection.exec('DROP TABLE IF EXISTS migrations');
  }
}
