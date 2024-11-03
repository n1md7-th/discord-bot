import { SchedulesEntity } from '@db/entities/schedules.entity.ts';
import type { SchedulerStatusEnum } from '@db/enums/scheduler.enum.ts';
import { Logger } from '@utils/logger.ts';
import type { Database, Statement } from 'bun:sqlite';
import type { ReadInterface } from '../interfaces/read.interface.ts';

export class SchedulesRepository implements ReadInterface<SchedulesEntity> {
  private readonly logger = new Logger({ label: 'SchedulesRepository' });
  private readonly findAllQuery: Statement;
  private readonly findAllByUserQuery: Statement;
  private readonly findByPkQuery: Statement;
  private readonly insertQuery: Statement;
  private readonly updateOneQuery: Statement;
  private readonly updateManyQuery: Statement;

  constructor(private readonly connection: Database) {
    this.findAllQuery = this.createFindAllQuery();
    this.findAllByUserQuery = this.createFindAllByUserQuery();
    this.findByPkQuery = this.createFindByPkQuery();
    this.insertQuery = this.createInsertQuery();
    this.updateOneQuery = this.createUpdateOneQuery();
    this.updateManyQuery = this.createUpdateManyQuery();
  }

  getAll(limit = 100, offset = 0): SchedulesEntity[] {
    return this.findAllQuery.as(SchedulesEntity).all({ offset, limit });
  }

  getManyByUser(userId: string, limit = 100, offset = 0): SchedulesEntity[] {
    return this.findAllByUserQuery.as(SchedulesEntity).all({ userId, offset, limit });
  }

  getOneByPk(id: string): SchedulesEntity | null {
    return this.findByPkQuery.as(SchedulesEntity).get({ id });
  }

  createOneBy(entity: SchedulesEntity): SchedulesEntity {
    this.insertQuery.as(SchedulesEntity).run(entity);

    return entity;
  }

  updateOneByPk(id: string, status: SchedulerStatusEnum) {
    const { changes } = this.updateOneQuery.as(SchedulesEntity).run({ id, status });

    if (!changes) this.logger.error(`Failed to update schedule ${id}`);
  }

  updateManyByUser(userId: string, status: SchedulerStatusEnum) {
    const { changes } = this.updateManyQuery.as(SchedulesEntity).run({ userId, status });

    if (!changes) this.logger.error(`Failed to update schedules for user ${userId}`);
  }

  private createInsertQuery() {
    return this.connection.prepare(`
      INSERT INTO Schedules (id, userId, name, sendStrategy, authorStrategy, targetId, runAt, payload, status,
                             createdAt,
                             updatedAt)
      VALUES ($id, $userId, $name, $sendStrategy, $authorStrategy, $targetId, $runAt, $payload, $status, $createdAt,
              $updatedAt)
    `);
  }

  private createFindAllQuery() {
    return this.connection.prepare(`
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
  }

  private createFindAllByUserQuery() {
    return this.connection.prepare(`
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
  }

  private createFindByPkQuery() {
    return this.connection.prepare(`
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
  }

  private createUpdateOneQuery() {
    return this.connection.prepare(`
      UPDATE Schedules
      SET status = $status
      WHERE id = $id
    `);
  }

  private createUpdateManyQuery() {
    return this.connection.prepare(`
      UPDATE Schedules
      SET status = $status
      WHERE userId = $userId
    `);
  }
}
