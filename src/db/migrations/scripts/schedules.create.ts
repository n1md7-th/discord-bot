import { Migration } from '../abstract/migration.ts';

export class SchedulesCreate extends Migration {
  override up() {
    return this.connection.exec(`
      CREATE TABLE IF NOT EXISTS Schedules
      (
        id             TEXT PRIMARY KEY,
        name           TEXT     NOT NULL,
        userId         TEXT     NOT NULL,
        sendStrategy   TEXT     NOT NULL,
        authorStrategy TEXT     NOT NULL,
        targetId       TEXT     NOT NULL,
        runAt          DATETIME NOT NULL,
        payload        TEXT     NOT NULL,
        status         TEXT     NOT NULL,
        createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_schedules_userId ON Schedules (userId);
    `);
  }

  override down() {
    return this.connection.exec('DROP TABLE IF EXISTS Migrations');
  }
}
