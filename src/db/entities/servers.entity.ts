export class ServersEntity {
  id!: number;
  code!: string;
  name!: string;
  createdAt!: number;

  static from(payload: Pick<ServersEntity, 'code' | 'name' | 'createdAt'>) {
    return Object.assign({}, payload) as ServersEntity;
  }
}
