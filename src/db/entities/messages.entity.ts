import { RoleEnum } from '../enums/message.enum.ts';

export class MessagesEntity {
  id!: number;
  role!: RoleEnum;
  content!: string;

  conversationId!: string; // FK

  createdAt!: string;
  updatedAt!: string;

  static from(payload: Omit<MessagesEntity, 'createdAt' | 'updatedAt' | 'id'>) {
    return {
      ...payload,
      updatedAt: new Date().toISOString(),
    } as MessagesEntity;
  }
}
