export interface ReadInterface<T = unknown> {
  getByPk(id: string): T | null;
  getAll(limit?: number, offset?: number): T[];
}
