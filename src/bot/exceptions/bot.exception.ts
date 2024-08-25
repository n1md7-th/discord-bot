type Params = {
  message: string;
  exception?: unknown;
  channelId?: string;
  messageId?: string;
};

export class BotException extends Error {
  readonly channelId?: string;
  readonly messageId?: string;
  readonly exception?: unknown;

  constructor(params: Params) {
    super(params.message);
    this.name = 'BotException';
    this.exception = params.exception;
    this.channelId = params.channelId;
    this.messageId = params.messageId;
  }

  getErrorMessage() {
    if (this.message) return this.message;

    return 'An error occurred';
  }

  getPrivateMessage() {
    if (this.exception instanceof Error) {
      return this.exception.message;
    }

    return this.message;
  }
}
