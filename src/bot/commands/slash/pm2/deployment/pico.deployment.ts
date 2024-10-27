import { Deployment } from '@bot/commands/slash/pm2/deployment/deployment.abstract.ts';
import { $ } from 'bun';

export class PicoDeployment extends Deployment {
  override readonly name = 'Pico';
  override readonly path = '~/apps/discord-bot';
  override readonly commands = [
    {
      name: 'Pull, build and restart',
      command: () =>
        $`
          cd ${this.path}
          git checkout bun.lockb
          git pull origin master
          bun install
          pm2 reload ecosystem.config.cjs --env production
        `.nothrow(),
    },
  ];
}
