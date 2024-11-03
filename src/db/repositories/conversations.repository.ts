import type { Database, Statement } from 'bun:sqlite';
import { ConversationsEntity } from '../entities/conversation.entity.ts';
import { StatusEnum } from '../enums/conversation.enum.ts';
import type { ReadInterface } from '../interfaces/read.interface.ts';

export class ConversationsRepository implements ReadInterface<ConversationsEntity> {
  private readonly findAllQuery: Statement;
  private readonly findByPkQuery: Statement;
  private readonly insertQuery: Statement;
  private readonly updateStatusQuery: Statement;
  private readonly selectStatusQuery: Statement;
  private readonly increaseThresholdQuery: Statement;
  private readonly increaseMessageCounterQuery: Statement;

  constructor(private readonly connection: Database) {
    this.findAllQuery = this.createFindAllQuery();
    this.findByPkQuery = this.createFindByPkQuery();
    this.insertQuery = this.createInsertQuery();
    this.selectStatusQuery = this.createSelectStatusQuery();
    this.updateStatusQuery = this.createStatusUpdateQuery();
    this.increaseThresholdQuery = this.createIncreaseThresholdQuery();
    this.increaseMessageCounterQuery = this.createIncreaseMessageCounterQuery();
  }

  getAll(limit = 100, offset = 0): ConversationsEntity[] {
    return this.findAllQuery.as(ConversationsEntity).all({ offset, limit });
  }

  getOneByPk(id: string): ConversationsEntity | null {
    return this.findByPkQuery.as(ConversationsEntity).get({ id });
  }

  create(
    payload: Omit<
      ConversationsEntity,
      'createdAt' | 'updatedAt' | 'counter' | 'threshold' | 'status'
    >,
  ): ConversationsEntity {
    const entity = ConversationsEntity.from({
      ...payload,
      counter: 0,
      threshold: 10,
      status: StatusEnum.Active,
    });
    try {
      this.insertQuery.run(entity);

      return entity;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create conversation');
    }
  }

  hasReachedThreshold(id: string): boolean {
    const entity = this.getOneByPk(id);
    if (!entity) return false;

    return entity?.counter >= entity?.threshold;
  }

  increaseThreshold(id: string, value: number) {
    const entity = this.getOneByPk(id);
    if (!entity) return;

    return this.increaseThresholdQuery.run({ id, value });
  }

  increaseMessageCounter(id: string) {
    const entity = this.getOneByPk(id);
    if (!entity) return;

    return this.increaseMessageCounterQuery.run({ id });
  }

  disable(id: string) {
    return this.updateStatusQuery.run({ id, status: StatusEnum.Inactive });
  }

  enable(id: string) {
    return this.updateStatusQuery.run({ id, status: StatusEnum.Active });
  }

  isDisabled(id: string): boolean {
    return (
      this.selectStatusQuery.as(ConversationsEntity).get({ id })?.status === StatusEnum.Inactive
    );
  }

  private createSelectStatusQuery() {
    return this.connection.query(`
      SELECT status
      FROM Conversations
      WHERE id = $id
    `);
  }

  private createStatusUpdateQuery() {
    return this.connection.query(`
      UPDATE Conversations
      SET status = $status
      WHERE id = $id
    `);
  }

  private createInsertQuery() {
    return this.connection.query(`
      INSERT INTO Conversations (id, template, strategy, counter, threshold, status, updatedAt)
      VALUES ($id, $template, $strategy, $counter, $threshold, $status, $updatedAt)
    `);
  }

  private createFindAllQuery() {
    return this.connection.query(`
      SELECT id,
             template,
             strategy,
             counter,
             threshold,
             status,
             createdAt,
             updatedAt
      FROM Conversations
      ORDER BY createdAt
      LIMIT $limit OFFSET $offset
    `);
  }

  private createFindByPkQuery() {
    return this.connection.query(`
      SELECT id,
             template,
             strategy,
             counter,
             threshold,
             status,
             createdAt,
             updatedAt
      FROM Conversations
      WHERE id = $id
    `);
  }

  private createIncreaseThresholdQuery() {
    return this.connection.query(`
      UPDATE Conversations
      SET threshold = threshold + $value
      WHERE id = $id
    `);
  }

  private createIncreaseMessageCounterQuery() {
    return this.connection.query(`
      UPDATE Conversations
      SET counter = counter + 1
      WHERE id = $id
    `);
  }
}
