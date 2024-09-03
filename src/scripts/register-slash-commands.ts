import { REST, Routes } from 'discord.js';
import { SlashCommands } from '../bot/commands/slash.commands.ts';
import type { DiscordBot } from '../bot/discord.bot.ts';
import { clientId, guildId, token } from '../config';
import { Logger } from '../utils/logger.ts';

const logger = new Logger({ label: 'SlashCommands' });

const rest = new REST().setToken(token);

(async () => {
  try {
    logger.info('Started registering application commands');
    const commands = new SlashCommands({} as DiscordBot).toREST();
    const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

    logger.info('Successfully registered application commands', data);
  } catch (error) {
    logger.error(error);
  }
})();
