import type { OperationEnum } from '@db/workers/enums/operation.enum.ts';

export type RequestType<P, O extends OperationEnum> = {
  operation: O;
  payload: P;
  id: number;
};

export type ResponseType<D = undefined> = {
  id: number;
  data: D;
};
