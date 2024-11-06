import type { DiscordBot } from '@bot/discord.bot.ts';
import { SchedulerSendStrategy, SchedulerStatusEnum } from '@db/enums/scheduler.enum.ts';
import * as schedulerRepository from '@db/workers/repositories/scheduler.repository.ts';
import type { CreateOnePayload, ScheduleEntityType } from '@db/workers/types/scheduler.type.ts';
import { Job } from '@services/job.service.ts';

export class SchedulerService {
  private readonly bot: DiscordBot;
  private readonly jobs: Map<string, Job>;

  constructor(bot: DiscordBot) {
    this.jobs = new Map();
    this.bot = bot;

    this.scheduleJobs();
  }

  async create(payload: CreateOnePayload) {
    const record = await schedulerRepository.createOne(payload);

    this.scheduleJob(record);
  }

  async cancelOneBy(pk: string) {
    const job = this.jobs.get(pk);
    if (!job) return this.bot.logger.error(`Job ${pk} not found`);

    await schedulerRepository.updateStatusByPk({
      id: pk,
      status: SchedulerStatusEnum.Cancelled,
    });

    this.cancelJob(job);
  }

  async getManyByUserId(userId: string) {
    return await schedulerRepository.getAllByUserId({ userId });
  }

  async cancelManyByUserId(userId: string) {
    await schedulerRepository.updateStatusByUserId({
      userId,
      status: SchedulerStatusEnum.Cancelled,
    });

    this.jobs.forEach((job, pk) => {
      if (job.entity.userId === userId) {
        this.cancelJob(job);
      }
    });
  }

  private cancelJob(job: Job) {
    job.cancel(); // Cancel the job timer
    this.jobs.delete(job.entity.id); // Remove the job from the memory
  }

  private scheduleJob(entity: ScheduleEntityType) {
    // We only want active jobs to be scheduled
    if (entity.status !== SchedulerStatusEnum.Active) return;

    const runAt = this.getDelayInMs(entity.runAt);

    if (runAt < 0) {
      return this.reportExpiredJob(entity.id, runAt);
    }

    const job = new Job(runAt, entity, async () => {
      this.bot.logger.info(`Running job ${entity.id}`, entity);

      try {
        switch (entity.sendStrategy) {
          case SchedulerSendStrategy.DM:
            await this.bot.sendDm(entity.targetId, entity.payload);
            break;
          case SchedulerSendStrategy.Channel:
            await this.bot.sendChannel(entity.targetId, entity.payload);
            break;
          case SchedulerSendStrategy.Thread:
            await this.bot.sendThread(entity.targetId, entity.payload);
            break;
        }

        await schedulerRepository.updateStatusByPk({
          id: entity.id,
          status: SchedulerStatusEnum.Completed,
        });
        this.bot.logger.info(`Job ${entity.id} completed`);
      } catch (error) {
        this.bot.logger.error(`Failed to run job ${entity.id}`);
        this.bot.logger.error(error);
        await schedulerRepository.updateStatusByPk({
          id: entity.id,
          status: SchedulerStatusEnum.Failed,
        });
      }
    });

    this.jobs.set(entity.id, job);

    this.bot.logger.info(`Scheduled job ${entity.id} to run in ${runAt}ms`);
  }

  private getDelayInMs(runAt: string) {
    return new Date(runAt).getTime() - Date.now();
  }

  private scheduleJobs() {
    schedulerRepository.getAll().then((jobs) => {
      jobs.forEach(this.scheduleJob.bind(this));
    });
  }

  private reportExpiredJob(id: string, runAt: number) {
    this.bot.logger.error(`Job ${id} is already late as the runAt time is ${runAt}ms`);
  }
}
