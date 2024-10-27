import type { Context } from '@utils/context.ts';
import type { ShellPromise } from 'bun';

export abstract class Deployment {
  readonly name!: string;

  protected readonly path!: string;
  protected readonly commands!: {
    name: string;
    command: () => ShellPromise;
  }[];

  constructor(options: Partial<Deployment> = {}) {
    Object.assign(this, options);
  }

  async deploy(context: Context) {
    for (const { command, name } of this.commands) {
      try {
        context.logger.info(`Executing command: ${name}`);
        await command();
        context.logger.info(`Command executed: ${name}`);
      } catch (error) {
        context.logger.error(`Failed to execute command: ${name}`, error);

        return `Failed to execute command: ${name}`;
      }
    }

    context.logger.info(`Deployment ${this.name} completed successfully`);

    return `Deployment ${this.name} completed successfully`;
  }
}
