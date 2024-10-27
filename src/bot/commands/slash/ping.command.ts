import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Context } from '@utils/context.ts';
import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';

const targets = [
  {
    name: 'www.megrulad.ge',
    value: 'https://megrulad.ge',
  },
  {
    name: 'www.kodugroup.ge',
    value: 'https://www.kodugroup.ge/',
  },
  {
    name: 'www.keskia.ge',
    value: 'https://keskia.ge',
  },
  {
    name: 'www.furti.ge',
    value: 'https://furti.ge',
  },
  {
    name: 'www.freegame.ge',
    value: 'https://freegame.ge',
  },
];

export class PingCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Pings the target websites to check if they are up')
      .addStringOption((option) => {
        return option
          .setRequired(false)
          .setName('target')
          .setDescription('The target to ping. Default is all targets when not provided')
          .addChoices(...targets);
      });
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    const target = interaction.options.getString('target') ?? 'ALL';

    context.logger.info(`Pinging ${target}...`);

    await interaction.deferReply({ ephemeral: true });

    const content = target === 'ALL' ? await this.pingAllTargets(context) : await this.pingTarget(target, context);

    await interaction.followUp({ content });
  }

  private async pingAllTargets(context: Context) {
    const responses = await Promise.allSettled(targets.map((target) => this.pingTarget(target.value, context)));

    return responses
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }

        const target = targets[index];
        context.logger.error(`Unsuccessful ping on ${target.name}`, result.reason);

        return `${target.value}: ${result.reason}`;
      })
      .join('\n');
  }

  private async pingTarget(target: string, context: Context) {
    const startedAt = new Date();

    context.logger.info(`Pinging ${target}...`);

    return fetch(target, { mode: 'no-cors', signal: AbortSignal.timeout(5000) })
      .then((response) => this.getStatusText(response, startedAt))
      .finally(() => {
        context.logger.info(`Pinged ${target}`);
      });
  }

  private getStatusText(response: Response, startedAt: Date) {
    const delta = Date.now() - startedAt.getTime();
    const status = response.status < 400 ? 'UP' : 'DOWN';

    return this.getTemplate(response.url, response.status, status, delta);
  }

  private getTemplate(url: string, statusCode: number, status: string, delta: number) {
    return `**${url}** is **${status}** and running! Status code: **${statusCode}** (took ${delta}ms)`;
  }
}
