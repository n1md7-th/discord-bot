import { SchedulesEntity } from '@db/entities/schedules.entity.ts';
import type { SchedulerStatusEnum } from '@db/enums/conversation.enum.ts';
import type { Database, Statement } from 'bun:sqlite';
import type { ReadInterface } from '../interfaces/read.interface.ts';

export class SchedulesRepository implements ReadInterface<SchedulesEntity> {
  private readonly findAllQuery: Statement;
  private readonly findAllByUserQuery: Statement;
  private readonly findByPkQuery: Statement;
  private readonly insertQuery: Statement;
  private readonly updateQuery: Statement;

  constructor(private readonly connection: Database) {
    this.findAllQuery = this.createFindAllQuery();
    this.findAllByUserQuery = this.createFindAllByUserQuery();
    this.findByPkQuery = this.createFindByPkQuery();
    this.insertQuery = this.createInsertQuery();
    this.updateQuery = this.createUpdateQuery();
  }

  getAll(limit = 100, offset = 0): SchedulesEntity[] {
    return this.findAllQuery.as(SchedulesEntity).all({ offset, limit });
  }

  getAllByUser(userId: string, limit = 100, offset = 0): SchedulesEntity[] {
    return this.findAllByUserQuery.as(SchedulesEntity).all({ userId, offset, limit });
  }

  getByPk(id: string): SchedulesEntity | null {
    return this.findByPkQuery.as(SchedulesEntity).get({ id });
  }

  create(payload: Omit<SchedulesEntity, 'createdAt' | 'updatedAt' | 'id'>): SchedulesEntity {
    const entity = SchedulesEntity.from(payload);
    this.insertQuery.as(SchedulesEntity).run(entity);

    return entity;
  }

  update(id: string, status: SchedulerStatusEnum) {
    this.updateQuery.run({ id, status });
  }

  private createInsertQuery() {
    return this.connection.prepare(`
      INSERT INTO Schedules (id, userId, name, sendStrategy, authorStrategy, targetId, runAt, payload, status, createdAt,
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

  private createUpdateQuery() {
    return this.connection.prepare(`
      UPDATE Schedules
      SET status = $status
      WHERE id = $id
    `);
  }
}
