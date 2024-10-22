import { type CacheType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SlashCommandHandler } from '../../abstract/handlers/slash.command.ts';
import type { Context } from '@utils/context.ts';
import { $ } from 'bun';

export class Pm2Command extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('pm2')
      .setDescription('PM2 commands')
      .addSubcommand((subcommand) => {
        return subcommand.setName('status').setDescription('Get PM2 status');
      })
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    context.logger.info(`Executing pm2 ${subcommand} command`);

    const formattedStatus = await this.getFormattedStatus();

    context.logger.info(`Formatted status: ${formattedStatus}`);

    switch (subcommand) {
      case 'status':
        await interaction.reply({
          content: formattedStatus || 'No processes found',
        });
        break;
    }
  }

  async getFormattedStatus() {
    const builder: string[] = [];
    const list = await $`pm2 jlist`.json();

    for (const process of list) {
      builder.push(`**${process.name}** - ${process.pm2_env.status} - ${process.pm2_env.restart_time} restarts`);
    }

    return builder.join('\n');
  }
}
