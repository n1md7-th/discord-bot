import { OperationEnum } from '@db/workers/enums/operation.enum.ts';
import { operation } from '@db/workers/services/operation.factory.ts';
import type {
  CreateOnePayload,
  GetAllByUserIdPayload,
  GetAllPayload,
  GetOneByPkPayload,
  ScheduleEntityType,
  UpdateStatusByPkPayload,
  UpdateStatusByUserIdPayload,
} from '@db/workers/types/scheduler.type.ts';

const worker = new Worker('src/db/workers/connections/scheduler.worker.ts');

export const createOne = (payload: CreateOnePayload) =>
  operation<CreateOnePayload, ScheduleEntityType>(worker)({
    operation: OperationEnum.CreateOne,
    payload,
  });

export const getAll = ({ limit = 20, offset = 0 }: GetAllPayload = {}) =>
  operation<GetAllPayload, ScheduleEntityType[]>(worker)({
    operation: OperationEnum.GetAll,
    payload: { limit, offset },
  });

export const getAllByUserId = ({ limit = 20, offset = 0, userId }: GetAllByUserIdPayload) =>
  operation<GetAllByUserIdPayload, ScheduleEntityType[]>(worker)({
    operation: OperationEnum.GetAllByUser,
    payload: { limit, offset, userId },
  });

export const getOneByPk = (payload: GetOneByPkPayload) =>
  operation<GetOneByPkPayload, ScheduleEntityType>(worker)({
    operation: OperationEnum.GetOneByPk,
    payload,
  });

export const updateStatusByPk = (payload: UpdateStatusByPkPayload) =>
  operation<UpdateStatusByPkPayload>(worker)({
    operation: OperationEnum.UpdateStatusByPk,
    payload,
  });

export const updateStatusByUserId = (payload: UpdateStatusByUserIdPayload) =>
  operation<UpdateStatusByUserIdPayload, number>(worker)({
    operation: OperationEnum.UpdateStatusByUserId,
    payload,
  });
