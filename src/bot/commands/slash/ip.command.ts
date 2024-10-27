import type { Context } from '@utils/context.ts';
import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommandHandler } from '../../abstract/handlers/slash.command.ts';

export class IpCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder().setName('ip').setDescription('Replies with server IP!');
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    await interaction.deferReply({ ephemeral: true }); // Shows "App thinking..." status

    await interaction.editReply(`Server IP: **${await this.getIp(context)}**`);
  }

  private async getIp(context: Context) {
    context.logger.info('Getting IP address...');

    return await Promise.allSettled([this.getFromIfconfig(), this.getFromIpify()])
      .then((results) => {
        for (const result of results) {
          if (result.status === 'fulfilled') {
            return result.value;
          }

          context.logger.error('Failed to get IP address', result.reason);
        }

        return 'Unable to get IP address from any service';
      })
      .finally(() => {
        context.logger.info('IP address retrieved');
      });
  }

  private async getFromIfconfig() {
    return fetch('https://ifconfig.me/ip').then((res) => res.text());
  }

  private async getFromIpify() {
    return fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => data.ip);
  }
}
