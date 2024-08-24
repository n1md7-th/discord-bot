import type { Database, Statement } from 'bun:sqlite';
import { MessagesEntity } from '../entities/messages.entity.ts';
import type { ReadInterface } from '../interfaces/read.interface.ts';

export class MessagesRepository implements ReadInterface<MessagesEntity> {
  private readonly findAllQuery: Statement;
  private readonly findByPkQuery: Statement;
  private readonly insertQuery: Statement;

  constructor(private readonly connection: Database) {
    this.findAllQuery = this.createFindAllQuery();
    this.findByPkQuery = this.createFindByPkQuery();
    this.insertQuery = this.createInsertQuery();
  }

  getAll(limit = 100, offset = 0): MessagesEntity[] {
    return this.findAllQuery.as(MessagesEntity).all({ offset, limit });
  }

  getManyByConversationId(conversationId: string): MessagesEntity[] {
    return this.connection
      .prepare(
        `
          SELECT id,
                 role,
                 content,
                 conversationId,
                 createdAt,
                 updatedAt
          FROM Messages
          WHERE conversationId = $conversationId
          ORDER BY createdAt
        `,
      )
      .all({ conversationId }) as MessagesEntity[];
  }

  getByPk(id: string): MessagesEntity | null {
    return this.findByPkQuery.as(MessagesEntity).get({ id });
  }

  create(payload: Omit<MessagesEntity, 'createdAt' | 'updatedAt' | 'id'>): MessagesEntity {
    const entity = MessagesEntity.from(payload);
    this.insertQuery.as(MessagesEntity).run(entity);

    return entity;
  }

  private createInsertQuery() {
    return this.connection.prepare(`
      INSERT INTO Messages (role, content, conversationId, updatedAt)
      VALUES ($role, $content, $conversationId, $updatedAt)
    `);
  }

  private createFindAllQuery() {
    return this.connection.prepare(`
      SELECT id,
             role,
             content,
             conversationId,
             createdAt,
             updatedAt
      FROM Messages
      ORDER BY createdAt
      LIMIT $limit OFFSET $offset
    `);
  }

  private createFindByPkQuery() {
    return this.connection.prepare(`
      SELECT id,
             role,
             content,
             conversationId,
             createdAt,
             updatedAt
      FROM Messages
      WHERE id = $id
    `);
  }
}
