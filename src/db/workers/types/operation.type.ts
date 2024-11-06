import type { OperationEnum } from '@db/workers/enums/operation.enum.ts';

export type RequestType<P, O extends OperationEnum> = {
  id: number;
  operation: O;
  payload: P;
};

export type ResponseType<R = undefined> = {
  id: number;
  failed?: boolean;
  response: R;
};
