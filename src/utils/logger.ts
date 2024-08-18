export class Logger {
  constructor(private readonly label: string) {}

  info(message?: string) {
    console.log(this.template('info', this.nullishStringify(message)));
  }

  warn(message?: string) {
    console.warn(this.template('warn', this.nullishStringify(message)));
  }

  error(message?: string, error?: unknown) {
    console.error(this.template('error', this.nullishStringify(message)), error);
  }

  private template(level: string, message: string) {
    return `[${level.toUpperCase()}][${new Date().toISOString()}][${this.label}] ${message}`;
  }

  private nullishStringify(value: unknown) {
    if (value === null) return '<NULL>';
    if (value === undefined) return '<UNDEFINED>';

    if (value === '') return '<EMPTY>';

    return String(value);
  }
}
