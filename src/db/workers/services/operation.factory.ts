import { OperationEnum } from '@db/workers/enums/operation.enum.ts';
import type { ResponseType } from '@db/workers/types/operation.type.ts';
import { idGenerator } from '@utils/id.generator.ts';

const it = idGenerator();
type Options<Payload = unknown> = {
  operation: OperationEnum;
  payload?: Payload;
  timeout?: number;
};
export const operation =
  <Req = unknown, Res = null>(worker: Worker) =>
  ({ payload, operation, timeout = 5000 }: Options<Req>): Promise<Res> => {
    const id = it.next().value;
    return new Promise((resolve, reject) => {
      const abort = setTimeout(() => reject(new Error(`Operation ${operation} Timeout`)), timeout);

      const onMessage = (event: MessageEvent<ResponseType<Res>>) => {
        if (event.data.id !== id) return;

        worker.removeEventListener('message', onMessage);
        clearTimeout(abort);

        event.data.failed ? reject(event.data.response) : resolve(event.data.response);
      };

      worker.addEventListener('message', onMessage);

      worker.postMessage({ operation, id, payload });
    });
  };
