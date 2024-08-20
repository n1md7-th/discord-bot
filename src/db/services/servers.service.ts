import { type Database, type Statement } from 'bun:sqlite';
import type { Context } from '../../utils/context.ts';
import { ServersEntity } from '../entities/servers.entity.ts';

export class ServersService {
  private readonly connection: Database;
  private readonly insert: Statement;
  private readonly selectMany: Statement;
  private readonly selectOne: Statement;

  constructor(connection: Database) {
    this.connection = connection;

    this.insert = this.createInsertStatement();
    this.selectMany = this.createSelectMany();
    this.selectOne = this.createSelectOne();
  }

  public getAll() {
    this.selectMany.all();
  }

  public getById(id: number) {
    return this.selectOne.all({ id });
  }

  public insertBy(name: string, code: string, ctx: Context) {
    const payload = ServersEntity.from({
      name,
      code,
      createdAt: Date.now(),
    });

    try {
      return this.insert.run(payload);
    } catch (error) {
      ctx.logger.info('Query:', this.insert.toString(), JSON.stringify(payload));
      ctx.logger.error('Failed to insert server', error);
      throw error;
    }
  }

  private createInsertStatement() {
    return this.connection.prepare('INSERT INTO servers (name, code, createdAt) VALUES ($name, $code, $createdAt)');
  }

  private createSelectMany() {
    return this.connection.prepare('SELECT * FROM servers').as(ServersEntity);
  }

  private createSelectOne() {
    return this.connection.prepare('SELECT * FROM servers WHERE id = $id').as(ServersEntity);
  }
}
