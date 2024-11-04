import { OperationEnum } from '@db/workers/enums/operation.enum.ts';
import { operation } from '@db/workers/services/operation.factory.ts';
import type { RecordType } from '@db/workers/types/scheduler.type.ts';

const worker = new Worker('src/db/workers/connections/scheduler.worker.ts');

export const insertOne = (text: string) =>
  operation(worker)({
    operation: OperationEnum.InsertOne,
    payload: text,
  });

export const fetchMany = async () =>
  operation<RecordType[]>(worker)({
    operation: OperationEnum.FetchMany,
  });

export const serializeDatabase = () => operation(worker)({ operation: OperationEnum.Serialize });
