import { Logger } from '../../utils/logger.ts';
import { MigrationsEntity } from '../entities/migrations.entity.ts';
import { MigrationsCreate } from '../migrations/scripts/migrations.create.ts';
import type { Database, Statement } from 'bun:sqlite';
import type { Migration } from '../migrations/abstract/migration.ts';

export class MigrationsService {
  private readonly logger: Logger;
  private readonly migrations: Map<string, Migration>;
  private readonly connection: Database;
  private readonly insert: Statement;
  private readonly delete: Statement;

  constructor(logger: Logger, connection: Database, migrations: Migration[]) {
    this.logger = logger;
    this.connection = connection;
    this.migrations = new Map();
    new MigrationsCreate(connection).up();

    this.insert = this.createInsertQuery();
    this.delete = this.createDeleteQuery();

    for (const migration of migrations) {
      this.migrations.set(migration.constructor.name, migration);
    }
    this.getMigrationsToRun();
  }

  execute() {
    if (this.migrations.size === 0) {
      return this.logger.info('No new migrations to run');
    }

    for (const [name, migration] of this.migrations.entries()) {
      this.logger.info(`[..] Running migration: ${name}.UP`);

      this.logger.info(JSON.stringify(migration.up()));
      this.insert.run({ name, createdAt: Date.now() });

      this.logger.info(`[OK] Migration completed: ${name}`);
    }
  }

  revert() {
    for (const [name, migration] of this.migrations) {
      this.logger.info(`[..] Reverting migration: ${name}.DOWN`);

      this.logger.info(JSON.stringify(migration.down()));
      this.delete.run({ name });

      this.logger.info(`[OK] Migration reverted: ${name}`);
    }
  }

  private getMigrationsToRun() {
    const migrations = this.getAllMigrations();
    const names = migrations.all().map((migration) => migration.name);

    for (const name of names) {
      this.migrations.delete(name);
    }

    return this.migrations;
  }

  getAllMigrations() {
    return this.connection.prepare('SELECT * FROM migrations').as(MigrationsEntity);
  }

  private createInsertQuery() {
    return this.connection.prepare('INSERT INTO migrations (name, createdAt) VALUES ($name, $createdAt)');
  }

  private createDeleteQuery() {
    return this.connection.prepare('DELETE FROM migrations WHERE name = $name');
  }
}
