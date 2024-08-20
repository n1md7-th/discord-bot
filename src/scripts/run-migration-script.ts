import { exit } from 'node:process';
import { connection } from '../db/connection.ts';
import { ServersCreate } from '../db/migrations/scripts/servers.create.ts';
import { MigrationsService } from '../db/services/migrations.service.ts';
import { Logger } from '../utils/logger.ts';

const logger = new Logger({ label: 'Migrations' });
try {
  const migrations = new MigrationsService(logger, connection, [new ServersCreate(connection)]);

  migrations.execute();
} catch (error) {
  logger.error('Error running migrations: ', error);
  exit(1);
}
