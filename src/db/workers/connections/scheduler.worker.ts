import { OperationEnum } from '@db/workers/enums/operation.enum.ts';
import { BackupFactory } from '@db/workers/services/backup.factory.ts';
import type {
  FetchManyResponse,
  InsertOneResponse,
  QueryRequest,
} from '@db/workers/types/scheduler.type.ts';
import { Logger } from '@utils/logger.ts';

declare var self: Worker;

const logger = new Logger({ label: 'Scheduler-worker' });

const factory = new BackupFactory('scheduler', logger);
const inmemory = factory.getDatabase();
inmemory.exec(`
  CREATE TABLE IF NOT EXISTS Worker
  (
    id        INTEGER PRIMARY KEY,
    name      TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
const insertQuery = inmemory.prepare('INSERT INTO Worker (name) VALUES ($name)');
const selectQuery = inmemory.prepare('SELECT * FROM Worker');

self.onmessage = async (event: MessageEvent<QueryRequest>) => {
  try {
    switch (event.data.operation) {
      case OperationEnum.InsertOne: {
        const { id, payload } = event.data;
        insertQuery.run({ $name: payload });
        self.postMessage({ id } as InsertOneResponse);
        break;
      }
      case OperationEnum.FetchMany: {
        self.postMessage({ id: event.data.id, data: selectQuery.all() } as FetchManyResponse);
        break;
      }
      case OperationEnum.Serialize: {
        const { changes } = factory.backupDatabase();
        self.postMessage({ id: event.data.id, changes });
        break;
      }
      default: {
        logger.error('Unknown message type:', event.data);
        self.dispatchEvent(new ErrorEvent('error', { error: new Error('Unknown message type') }));
      }
    }
  } catch (error) {
    logger.error('Error:', error);
    self.dispatchEvent(new ErrorEvent('error', { error }));
  }
};
