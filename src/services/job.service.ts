import type { SchedulesEntity } from '@db/entities/schedules.entity.ts';

export class Job {
  readonly id: Timer;
  readonly entity: SchedulesEntity;

  constructor(runAt: number, entity: SchedulesEntity, job: () => Promise<void>) {
    this.entity = entity;
    this.id = setTimeout(job, runAt);
  }

  cancel() {
    clearTimeout(this.id);
  }
}
