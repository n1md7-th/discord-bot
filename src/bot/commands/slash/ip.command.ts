import type { Context } from '@utils/context.ts';
import { networkInterfaces } from 'os';
import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommandHandler } from '../../abstract/handlers/slash.command.ts';

export class IpCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder().setName('ip').setDescription('Replies with server IP!');
  }

  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true }); // Shows "App thinking..." status

    await interaction.editReply(
      [
        `Server Global IP: **${await this.getGlobalIp(context)}**`,
        `Server Local IP: **${await this.getLocalIp(context)}**`,
      ].join('\n'),
    );
  }

  private async getGlobalIp(context: Context) {
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

  private async getLocalIp(context: Context) {
    return (
      Object.values(networkInterfaces())
        .flat()
        .reduce((ips, iface) => {
          if (!iface) return ips;
          if (iface.family !== 'IPv4') return ips;
          if (iface.internal) return ips;

          ips.push(iface.address);

          return ips;
        }, [] as string[])
        .join('; ') || 'Unable to get local IP address'
    );
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
