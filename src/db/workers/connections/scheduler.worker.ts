import { SchedulerStatusEnum } from '@db/enums/scheduler.enum.ts';
import { OperationEnum } from '@db/workers/enums/operation.enum.ts';
import type { ResponseType } from '@db/workers/types/operation.type.ts';
import type { QueryRequest, ScheduleEntityType } from '@db/workers/types/scheduler.type.ts';
import { Logger } from '@utils/logger.ts';
import { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';

declare var self: Worker;

const logger = new Logger({ label: 'SchedulerWorker' });

const connection = new Database(`.dbs/scheduler.db`, {
  readwrite: true,
  strict: true,
  create: true,
});

connection.exec(`
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

// language=SQL format=false
const insertQuery = connection.prepare(`
    INSERT INTO
      Schedules (
         id, userId, name, sendStrategy, authorStrategy,
         targetId, runAt, payload, status,
         createdAt,updatedAt
      )
    VALUES (
      $id, $userId, $name, $sendStrategy, $authorStrategy,
      $targetId, $runAt, $payload, $status, $createdAt,
      $updatedAt
    )
  `);

const findAllQuery = connection.prepare(`
  SELECT id,
         userId,
         name,
         sendStrategy,
         authorStrategy,
         targetId,
         runAt,
         payload,
         status,
         createdAt,
         updatedAt
  FROM Schedules
  ORDER BY createdAt
  LIMIT $limit OFFSET $offset
`);

const findAllByUserQuery = connection.prepare(`
  SELECT id,
         userId,
         name,
         sendStrategy,
         authorStrategy,
         targetId,
         runAt,
         payload,
         status,
         createdAt,
         updatedAt
  FROM Schedules
  WHERE userId = $userId
  ORDER BY createdAt
  LIMIT $limit OFFSET $offset
`);

const findByPkQuery = connection.prepare(`
  SELECT id,
         userId,
         name,
         sendStrategy,
         authorStrategy,
         targetId,
         runAt,
         payload,
         status,
         createdAt,
         updatedAt
  FROM Schedules
  WHERE id = $id
`);

const updateStatusByIdQuery = connection.prepare(`
  UPDATE Schedules
  SET status = $status
  WHERE id = $id
`);

const updateStatusByUserIdQuery = connection.prepare(`
  UPDATE Schedules
  SET status = $status
  WHERE userId = $userId
`);

class Message {
  send<R>(event: MessageEvent<QueryRequest>, response: R) {
    self.postMessage({
      id: event.data.id,
      response,
    } as ResponseType<R>);
  }
}

const message = new Message();

self.onmessage = async (event: MessageEvent<QueryRequest>) => {
  logger.info('Scheduler Worker received:', event.data);

  try {
    switch (event.data.operation) {
      case OperationEnum.CreateOne: {
        const payload: ScheduleEntityType = {
          id: randomUUID(),
          userId: event.data.payload.userId,
          name: event.data.payload.name,
          sendStrategy: event.data.payload.sendStrategy,
          authorStrategy: event.data.payload.authorStrategy,
          targetId: event.data.payload.targetId,
          runAt: event.data.payload.runAt,
          payload: event.data.payload.payload,
          status: SchedulerStatusEnum.Active,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        insertQuery.run(payload);

        return message.send(event, payload);
      }

      case OperationEnum.GetAll: {
        return message.send(event, findAllQuery.all(event.data.payload) as ScheduleEntityType[]);
      }

      case OperationEnum.GetAllByUser: {
        return message.send(event, findAllByUserQuery.all(event.data.payload) as ScheduleEntityType[]);
      }

      case OperationEnum.GetOneByPk: {
        return message.send(event, findByPkQuery.get({ id: event.data.payload }) as ScheduleEntityType);
      }

      case OperationEnum.UpdateStatusByPk: {
        updateStatusByIdQuery.run({ id: event.data.payload.id, status: event.data.payload.status });

        return message.send(event, event.data.payload.id);
      }

      case OperationEnum.UpdateStatusByUserId: {
        updateStatusByUserIdQuery.run({ userId: event.data.payload.userId, status: event.data.payload.status });

        return message.send(event, event.data.payload.userId);
      }

      default: {
        throw new Error(`Operation ${(event.data as any).operation} not supported`);
      }
    }
  } catch (error) {
    self.postMessage({
      id: event.data.id,
      failed: true,
      response: error,
    } as ResponseType<Error>);
  }
};
