import { REST, Routes } from 'discord.js';
import { SlashCommands } from '../bot/commands/slash.commands.ts';
import type { DiscordBot } from '../bot/discord.bot.ts';
import { clientId, guildIds, token } from '../config';
import { Logger } from '../utils/logger.ts';

const logger = new Logger({ label: 'SlashCommands' });

const rest = new REST().setToken(token);

(async () => {
  for (const guildId of guildIds) {
    try {
      logger.info('Started registering application commands', { guildId });
      const commands = new SlashCommands({} as DiscordBot).toREST();
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

      logger.info('Successfully registered application commands', { guildId });
    } catch (error) {
      logger.error(error, { guildId });
    }
  }
})();
