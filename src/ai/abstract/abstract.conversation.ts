import type { Context } from '../../utils/context.ts';
import { Counter } from '../../utils/counter.ts';
import { AiResponse } from '../response/ai.response.ts';

export abstract class Conversation {
  private disabled = false;
  private readonly counter: Counter;
  private readonly maxRequests: Counter;

  protected constructor(maxRequests: number) {
    this.counter = new Counter(0);
    this.maxRequests = new Counter(maxRequests);
  }

  isDisabled() {
    return this.disabled;
  }

  enable() {
    this.disabled = false;
  }

  disable() {
    this.disabled = true;
  }

  increaseRequestsBy(value: number) {
    this.maxRequests.add(value);
  }

  hasReachedLimit() {
    return this.counter.getValue() >= this.maxRequests.getValue();
  }

  addUserMessage(content: string) {
    this.counter.inc();

    return this;
  }

  abstract sendRequest(context: Context, maxChunkSize?: number): Promise<AiResponse>;
}
