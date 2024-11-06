import { SchedulerAuthorStrategy, SchedulerSendStrategy, type SchedulerStatusEnum } from '@db/enums/scheduler.enum.ts';
import { OperationEnum } from '@db/workers/enums/operation.enum.ts';
import type { RequestType } from '@db/workers/types/operation.type.ts';

export type ScheduleEntityType = {
  id: string;
  userId: string; // Owner
  name: string;
  sendStrategy: SchedulerSendStrategy;
  authorStrategy: SchedulerAuthorStrategy;
  targetId: string; // ServerId, channelId, userId
  runAt: string;
  payload: string;
  status: SchedulerStatusEnum;
  createdAt: string;
  updatedAt: string;
};

export type Page = {
  limit?: number;
  offset?: number;
};

export type CreateOnePayload = Omit<ScheduleEntityType, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
export type GetAllPayload = Page;
export type GetAllByUserIdPayload = Page & { userId: string };
export type GetOneByPkPayload = string;
export type UpdateStatusByPkPayload = {
  id: string;
  status: SchedulerStatusEnum;
};
export type UpdateStatusByUserIdPayload = {
  userId: string;
  status: SchedulerStatusEnum;
};

export type CreateOneRequest = RequestType<CreateOnePayload, OperationEnum.CreateOne>;
export type GetAllRequest = RequestType<GetAllPayload, OperationEnum.GetAll>;
export type GetAllByUserIdRequest = RequestType<GetAllByUserIdPayload, OperationEnum.GetAllByUser>;
export type GetOneByPkRequest = RequestType<GetOneByPkPayload, OperationEnum.GetOneByPk>;
export type UpdateStatusByPkRequest = RequestType<UpdateStatusByPkPayload, OperationEnum.UpdateStatusByPk>;
export type UpdateStatusByUserIdRequest = RequestType<UpdateStatusByUserIdPayload, OperationEnum.UpdateStatusByUserId>;

export type QueryRequest =
  | CreateOneRequest
  | GetAllRequest
  | GetAllByUserIdRequest
  | GetOneByPkRequest
  | UpdateStatusByPkRequest
  | UpdateStatusByUserIdRequest;
