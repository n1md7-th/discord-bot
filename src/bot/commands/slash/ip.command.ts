import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { SlashCommandHandler } from '../../abstract/handlers/slash.command.ts';

export class IpCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder().setName('ip').setDescription('Replies with server IP!');
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    await interaction.reply({
      content: `Server IP: ${await this.getIp()}`,
    });
  }

  private async getIp() {
    return fetch('https://ifconfig.me/ip')
      .then((res) => res.text())
      .catch(() => 'Failed to get IP address');
  }
}
