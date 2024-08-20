import { Migration } from '../abstract/migration.ts';

export class ServersCreate extends Migration {
  override up() {
    return this.connection.exec(`
      CREATE TABLE IF NOT EXISTS servers
      (
        id        INTEGER PRIMARY KEY,
        code      TEXT    NOT NULL,
        name      TEXT    NOT NULL,
        createdAt INTEGER NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS servers_code_uindex ON servers (code);
    `);
  }

  override down() {
    return this.connection.exec('DROP TABLE IF EXISTS servers');
  }
}
