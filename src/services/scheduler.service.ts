import type { DiscordBot } from '@bot/discord.bot.ts';
import { SchedulesEntity } from '@db/entities/schedules.entity.ts';
import { SchedulerSendStrategy, SchedulerStatusEnum } from '@db/enums/scheduler.enum.ts';
import { Job } from '@services/job.service.ts';

export class SchedulerService {
  private readonly bot: DiscordBot;
  private readonly jobs: Map<string, Job>;

  constructor(bot: DiscordBot) {
    this.jobs = new Map();
    this.bot = bot;

    this.scheduleJobs();
  }

  async create(payload: Omit<SchedulesEntity, 'createdAt' | 'updatedAt' | 'id' | 'status'>) {
    const entity = SchedulesEntity.from(payload);

    this.bot.schedulesRepository.createOneBy(entity);

    this.scheduleJob(entity);
  }

  cancelOneBy(pk: string) {
    const job = this.jobs.get(pk);
    if (!job) return this.bot.logger.error(`Job ${pk} not found`);

    this.bot.schedulesRepository.updateOneByPk(pk, SchedulerStatusEnum.Cancelled);

    this.cancelJob(job);
  }

  getManyByUserId(userId: string) {
    return this.bot.schedulesRepository.getManyByUser(userId);
  }

  cancelManyByUserId(userId: string) {
    this.bot.schedulesRepository.updateManyByUser(userId, SchedulerStatusEnum.Cancelled);

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

  private scheduleJob(entity: SchedulesEntity) {
    if (!entity.id) return this.bot.logger.error('Missing id in entity', entity);
    if (entity.status !== SchedulerStatusEnum.Active) return;

    const runAt = this.getDelayInMs(entity.runAt);

    if (runAt < 0) {
      return this.bot.logger.error(
        `Job ${entity.id} is already late as the runAt time is ${runAt}ms`,
      );
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

        this.bot.schedulesRepository.updateOneByPk(entity.id, SchedulerStatusEnum.Completed);
        this.bot.logger.info(`Job ${entity.id} completed`);
      } catch (error) {
        this.bot.logger.error(`Failed to run job ${entity.id}`);
        this.bot.logger.error(error);
        this.bot.schedulesRepository.updateOneByPk(entity.id, SchedulerStatusEnum.Failed);
      }
    });

    this.jobs.set(entity.id, job);

    this.bot.logger.info(`Scheduled job ${entity.id} to run in ${runAt}ms`);
  }

  private getDelayInMs(runAt: string) {
    return new Date(runAt).getTime() - Date.now();
  }

  private scheduleJobs() {
    this.bot.schedulesRepository.getAll(1000).forEach((schedule) => this.scheduleJob(schedule));
  }
}
