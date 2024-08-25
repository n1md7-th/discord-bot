import { existsSync, writeFileSync } from 'node:fs';
import { cwd } from 'node:process';
import { Logger } from '../utils/logger.ts';

const path = cwd() + '/.dbs/sqlite.db';
const logger = new Logger({ label: 'VerifyDB' });

if (!existsSync(path)) {
  try {
    logger.info('Database file does not exist, creating one...');
    writeFileSync(path, '');
    logger.info('Database file created successfully');
  } catch (error) {
    logger.error('Error creating database file:', error);
  }
}
