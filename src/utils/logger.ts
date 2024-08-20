export type LoggerOptions = {
  label: string;
  messageId?: string;
  channelId?: string;
};

export class Logger {
  constructor(private readonly options: LoggerOptions) {
    this.nullishStringify = this.nullishStringify.bind(this);
  }

  info(...message: unknown[]) {
    console.log(...this.template('info', ...message.map(this.nullishStringify)));
  }

  warn(...message: unknown[]) {
    console.warn(...this.template('warn', ...message.map(this.nullishStringify)));
  }

  error(message?: unknown, ...error: unknown[]) {
    console.error(...this.template('error', this.nullishStringify(message)), ...error);
  }

  debug(...message: unknown[]) {
    console.debug(...this.template('debug', ...message.map(this.nullishStringify)));
  }

  private template(level: string, ...message: string[]) {
    return [
      [
        `[${new Date().toISOString()}]`,
        `[${level.toUpperCase()}]`,
        `[MSG:${this.options.messageId ?? '<EMPTY>'}]`,
        `[CHA:${this.options.channelId ?? '<EMPTY>'}]`,
        `[${this.options.label}]`,
      ].join(''),
      ...message,
    ];
  }

  private nullishStringify(value: unknown) {
    if (value === null) return '<NULL>';
    if (value === undefined) return '<UNDEFINED>';

    if (value === '') return '<EMPTY>';

    return String(value);
  }
}
