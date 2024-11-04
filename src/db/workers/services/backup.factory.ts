import { Logger } from '@utils/logger.ts';
import { Database } from 'bun:sqlite';

export class BackupFactory {
  private readonly backup: Database;
  private readonly inmemory: Database;

  constructor(
    private readonly filename: string,
    private readonly logger: Logger,
  ) {
    this.backup = new Database(`${filename}.backup`, {
      readwrite: true,
      strict: true,
      create: true,
    });
    this.backup.exec(`
      CREATE TABLE IF NOT EXISTS Backup
      (
        id        INTEGER PRIMARY KEY,
        data      BLOB NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Keep only 10 latest backups
    this.backup.exec(`
      DELETE
      FROM Backup
      WHERE id NOT IN (SELECT id
                       FROM Backup
                       ORDER BY createdAt DESC
                       LIMIT 10);
    `);

    this.inmemory = this.restoreDatabase();
  }

  getDatabase() {
    return this.inmemory;
  }

  backupDatabase() {
    this.logger.info(`Serializing database(${this.filename})...`);

    const data = this.inmemory.serialize();

    this.logger.info(`Database serialized(${this.filename})`, data.byteLength);

    return this.backup.query('INSERT INTO Backup (data) VALUES (?)').run(data);
  }

  /**
   * Returns restored database from the backup.
   *
   * No strict mode is used here, deserialization does not support it.
   */
  private restoreDatabase(): Database {
    this.logger.info(`Restoring database from ${this.filename}.backup...`);

    const backup = this.backup
      .query('SELECT * FROM Backup ORDER BY createdAt DESC LIMIT 1')
      .get() as { data: ArrayBuffer } | null;

    this.logger.info(backup ? 'Restoring database...' : 'No backup found');

    return backup ? Database.deserialize(backup.data) : new Database(':memory:');
  }
}
