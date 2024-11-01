import { SchedulesCreate } from '@db/migrations/scripts/schedules.create.ts';
import { exit } from 'node:process';
import { connection } from '../db/connection.ts';
import { ConversationsCreate } from '../db/migrations/scripts/conversations.create.ts';
import { MessagesCreate } from '../db/migrations/scripts/messages.create.ts';
import { MigrationsService } from '../db/services/migrations.service.ts';
import { Logger } from '../utils/logger.ts';

const logger = new Logger({ label: 'Migrations' });
try {
  const migrations = new MigrationsService(logger, connection, [
    new ConversationsCreate(connection),
    new MessagesCreate(connection),
    new SchedulesCreate(connection),
  ]);

  migrations.execute();
} catch (error) {
  logger.error('Error running migrations: ', error);
  exit(1);
}
