export type LoggerOptions = {
  label: string;
  messageId?: string;
  channelId?: string;
};

export class Logger {
  constructor(private readonly options: LoggerOptions) {}

  info(message?: string) {
    console.log(...this.template('info', this.nullishStringify(message)));
  }

  warn(message?: string) {
    console.warn(...this.template('warn', this.nullishStringify(message)));
  }

  error(message?: string, error?: unknown) {
    console.error(...this.template('error', this.nullishStringify(message)), error);
  }

  debug(message?: string) {
    console.debug(...this.template('debug', this.nullishStringify(message)));
  }

  private template(level: string, message: string) {
    return [
      [
        `[${new Date().toISOString()}]`,
        `[${level.toUpperCase()}]`,
        `[MSG:${this.options.messageId ?? '<EMPTY>'}]`,
        `[CHA:${this.options.channelId ?? '<EMPTY>'}]`,
        `[${this.options.label}]`,
      ].join(''),
      message,
    ];
  }

  private nullishStringify(value: unknown) {
    if (value === null) return '<NULL>';
    if (value === undefined) return '<UNDEFINED>';

    if (value === '') return '<EMPTY>';

    return String(value);
  }
}
