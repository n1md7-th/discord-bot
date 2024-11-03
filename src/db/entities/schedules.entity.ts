import { SchedulerAuthorStrategy, SchedulerSendStrategy, SchedulerStatusEnum } from '@db/enums/scheduler.enum.ts';
import { randomUUID } from 'node:crypto';

export class SchedulesEntity {
  id!: string;
  userId!: string; // Owner
  name!: string;
  sendStrategy!: SchedulerSendStrategy;
  authorStrategy!: SchedulerAuthorStrategy;
  targetId!: string; // ServerId, channelId, userId
  runAt!: string;
  payload!: string;
  status!: SchedulerStatusEnum;
  createdAt!: string;
  updatedAt!: string;

  static from(payload: Omit<SchedulesEntity, 'createdAt' | 'updatedAt' | 'id' | 'status'>) {
    return {
      ...payload,
      id: randomUUID(),
      status: SchedulerStatusEnum.Active,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as SchedulesEntity;
  }
}
