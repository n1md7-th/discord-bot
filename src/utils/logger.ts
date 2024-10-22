import chalk from 'chalk';

export type LoggerOptions = {
  label: string;
  type?: string;
  messageId?: string;
  channelId?: string;
};

export class Logger {
  private readonly EMPTY: string;

  private updatedAt: number;

  constructor(private readonly options: LoggerOptions) {
    this.nullishStringify = this.nullishStringify.bind(this);
    this.EMPTY = chalk.italic(chalk.gray('<EMPTY>'));
    this.updatedAt = Date.now();

    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.debug = this.debug.bind(this);
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

  private template(level: string, ...message: unknown[]) {
    return [
      [
        `[${this.getFormattedDate()}]`,
        `[${this.getFormattedLevel(level)}]`,
        `[${this.getFormattedChannelId(this.options.channelId)}]`,
        `[${this.getFormattedMessageId(this.options.messageId)}]`,
        `[${chalk.bold(chalk.cyan(this.options.label))}]`,
        `[+${this.getDelta()}ms]`,
        `[${this.options.type || ''}]`,
      ].join(''),
      ...message,
    ];
  }

  private nullishStringify(value: unknown) {
    if (value === null) return chalk.yellow('<NULL>');
    if (value === undefined) return chalk.yellow('<UNDEFINED>');

    if (value === '') return chalk.yellow('<EMPTY>');

    return value;
  }

  private getDelta() {
    const delta = Date.now() - this.updatedAt;

    this.updatedAt = Date.now();

    return chalk.bold(chalk.gray(delta.toString()));
  }

  private getFormattedDate() {
    return new Date().toISOString().replace('T', ' ').replace('Z', '');
  }

  private getFormattedLevel(level: string) {
    switch (level) {
      case 'info':
        return chalk.blueBright('INFO');
      case 'warn':
        return chalk.yellowBright('WARN');
      case 'error':
        return chalk.redBright('ERROR');
      case 'debug':
        return chalk.greenBright('DEBUG');
      default:
        throw new Error(`Unknown level: ${level}`);
    }
  }

  private getFormattedMessageId(message?: string) {
    if (!message) return this.EMPTY;

    return chalk.bold(chalk.blueBright(message));
  }

  private getFormattedChannelId(channel?: string) {
    if (!channel) return this.EMPTY;

    return chalk.greenBright(channel);
  }
}
