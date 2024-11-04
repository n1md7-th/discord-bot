import { OperationEnum } from '@db/workers/enums/operation.enum.ts';
import { idGenerator } from '@utils/id.generator.ts';

const it = idGenerator();
type Options = {
  operation: OperationEnum;
  payload?: unknown;
  timeout?: number;
};
export const operation =
  <R = unknown>(worker: Worker) =>
  ({ payload, operation, timeout = 5000 }: Options): Promise<R> => {
    const id = it.next().value;
    return new Promise((resolve, reject) => {
      const abort = setTimeout(() => reject(new Error(`Operation ${operation} Timeout`)), timeout);

      const onMessage = (event: MessageEvent<{ id: number } & R>) => {
        if (event.data.id !== id) return;

        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        clearTimeout(abort);
        resolve(event.data);
      };

      const onError = (event: ErrorEvent) => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        clearTimeout(abort);
        reject(event.error);
      };

      worker.addEventListener('error', onError);
      worker.addEventListener('message', onMessage);

      worker.postMessage({ operation, id, payload });
    });
  };
