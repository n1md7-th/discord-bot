export interface ReadInterface<T = unknown> {
  getOneByPk(id: string): T | null;
  getAll(limit?: number, offset?: number): T[];
}
