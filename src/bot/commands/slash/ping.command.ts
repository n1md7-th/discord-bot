import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Context } from '@utils/context.ts';
import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';

export class PingCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Pings the target websites to check if they are up')
      .addStringOption((option) => {
        return option.setRequired(true).setName('target').setDescription('The target to ping').addChoices(
          {
            name: 'www.megrulad.ge',
            value: 'https://megrulad.ge',
          },
          {
            name: 'www.kodugroup.ge',
            value: 'https://www.kodugroup.ge',
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
        );
      });
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    context.logger.info(`Pinging ${interaction.options.getString('target') ?? ''}...`);

    await interaction.deferReply();
    await interaction.followUp({
      content: await this.pingTarget(interaction.options.getString('target') ?? '', context),
    });
  }

  private async pingTarget(target: string, context: Context) {
    const startedAt = new Date();

    return fetch(target, { mode: 'no-cors' })
      .then((response) => this.getStatusText(response, startedAt))
      .catch((error) => {
        context.logger.error('Failed to ping the target', error);

        return 'Failed to ping the target';
      });
  }

  private getStatusText(response: Response, startedAt: Date) {
    const delta = Date.now() - startedAt.getTime();
    const status = response.status < 400 ? 'UP' : 'DOWN';

    return `**${response.url}** is **${status}** and running! Status code: **${response.status}** (took ${delta}ms)`;
  }
}
