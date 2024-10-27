import type { Context } from '@utils/context.ts';
import { $ } from 'bun';

export class StatusCommand {
  async execute(context: Context): Promise<string> {
    context.logger.info('Executing pm2 status command');

    return await $`pm2 jlist`
      .nothrow()
      .json()
      .then((list) => {
        const builder: string[] = [];
        for (const process of list) {
          builder.push(
            `**${process.pm_id}** - **${process.name}** - ${process.pm2_env.status} - ${process.pm2_env.restart_time} restarts`,
          );
        }
        return builder.join('\n');
      })
      .catch((error) => {
        context.logger.error('Failed to get pm2 process list', error);
        return 'Failed to get pm2 process list';
      });
  }
}
