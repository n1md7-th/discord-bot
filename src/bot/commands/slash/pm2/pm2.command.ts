import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';
import { DeploymentCommand } from '@bot/commands/slash/pm2/deployment/deployment.command.ts';
import { StatusCommand } from '@bot/commands/slash/pm2/status/status.command.ts';
import type { Context } from '@utils/context.ts';
import { type CacheType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export class Pm2Command extends SlashCommandHandler {
  private readonly subcommands = {
    status: new StatusCommand(),
    deployment: new DeploymentCommand(),
  };

  register() {
    return new SlashCommandBuilder()
      .setName('pm2')
      .setDescription('PM2 commands')
      .addSubcommand((subcommand) => {
        return subcommand.setName('status').setDescription('Get PM2 status');
      })
      .addSubcommand((subcommand) => {
        return subcommand
          .setName('deploy')
          .setDescription('Deploy the specified deployment')
          .addStringOption((option) => {
            return option
              .setName('deployment')
              .setDescription('The deployment to deploy')
              .setRequired(true)
              .addChoices(...this.subcommands.deployment.toChoices());
          });
      })
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const subcommand = interaction.options.getSubcommand();

    context.logger.info(`Executing pm2 ${subcommand} command`);

    switch (subcommand) {
      case 'status': {
        await interaction.editReply({
          content: await this.subcommands.status.execute(context),
        });
        break;
      }
      case 'deploy': {
        const project = interaction.options.getString('deployment');

        context.logger.info(`Deploying ${project}...`);

        switch (project) {
          case 'pico': {
            await interaction.editReply({
              content: await this.subcommands.deployment.Pico.deploy(context),
            });
            break;
          }
          default: {
            await interaction.editReply('Unknown deployment');
            break;
          }
        }
        break;
      }
    }
  }
}
