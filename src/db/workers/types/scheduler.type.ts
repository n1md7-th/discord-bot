import { OperationEnum } from '@db/workers/enums/operation.enum.ts';
import type { RequestType, ResponseType } from '@db/workers/types/operation.type.ts';

export type Changes = { changes: number; lastInsertRowid: number | bigint };
export type RecordType = { id: number; text: string; createdAt: string };

export type InsertOneRequest = RequestType<string, OperationEnum.InsertOne>;
export type FetchManyRequest = RequestType<null, OperationEnum.FetchMany>;
export type SerializeRequest = RequestType<null, OperationEnum.Serialize>;

export type QueryRequest = InsertOneRequest | FetchManyRequest | SerializeRequest;

export type InsertOneResponse = ResponseType<null>;
export type FetchManyResponse = ResponseType<RecordType[]>;

export type QueryResponse = InsertOneResponse | FetchManyResponse;
