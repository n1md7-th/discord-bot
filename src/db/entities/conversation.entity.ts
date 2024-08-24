import { StatusEnum, StrategyEnum, TemplateEnum } from '../enums/conversation.enum.ts';

export class ConversationsEntity {
  id!: string;
  template!: TemplateEnum;
  strategy!: StrategyEnum;
  counter!: number;
  threshold!: number;
  status!: StatusEnum;

  createdAt!: string;
  updatedAt!: string;

  static from(payload: Omit<ConversationsEntity, 'createdAt' | 'updatedAt'>) {
    return {
      ...payload,
      updatedAt: new Date().toISOString(),
    } as ConversationsEntity;
  }
}
