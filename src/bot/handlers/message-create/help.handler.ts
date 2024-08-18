import { EmbedBuilder, type Message } from 'discord.js';
import { CreateHandler } from '../../abstract/create.handler.ts';
import { version } from '../../../../package.json';

export class HelpHandler extends CreateHandler {
  async handle(message: Message) {
    this.bot.logger.info('!Help handler invoked');

    await message.channel.send({ embeds: [this.getHelpEmbed()] });

    this.bot.logger.info('!Help handler executed');
  }

  private getHelpEmbed() {
    return new EmbedBuilder()
      .setColor('Purple')
      .setTitle('Pico manual')
      .setURL('https://github.com/n1md7-th/discord-bot')
      .setDescription(
        this.bot.username +
          ' is a Discord bot that helps you with your grammar and tech. ' +
          'It uses AI to provide you with the best possible answers. ' +
          'It also has a Grammarly feature that helps you with your grammar.' +
          'It creates a thread for you to interact with the bot.',
      )
      .setThumbnail('https://github.com/n1md7-th/picolingus/blob/master/src/images/avatar.jpg?raw=true')
      .addFields(
        {
          name: 'Summon TechBro',
          value: `Use @${this.bot.username} anywhere in the text or start the text with "Hey ${this.bot.username}" to summon TechBro`,
        },
        { name: 'Summon Grammarly', value: 'React with 📖 (Open Book) emoji to summon Grammarly' },
      )
      .addFields({
        name: 'Supported prefix commands',
        value: '!skip, !enable, !disable, !extend, !help',
      })
      .addFields({
        name: '!skip',
        value:
          'Signal the bot to ignore this message but stay active/enabled in the thread. Example: "!skip How are you?"',
      })
      .addFields({
        name: '!enable',
        value:
          'Enable the bot in the thread (Default enabled). Signal the bot to engage in the conversations. Example: "!enable or !enable Hi there"',
      })
      .addFields({
        name: '!disable',
        value:
          'Disable the bot in the thread. Signal the bot to not engage in the conversations anymore. Example: "!disable or !disable Bye"',
      })
      .addFields({
        name: '!extend',
        value:
          'Extend the conversation. Signal the bot to extend the AI quota for the conversation. Example: "!extend or !extend How are you?"',
      })
      .addFields({
        name: '!help',
        value: 'Display this message',
      })

      .setTimestamp()
      .setFooter({ text: `Version: ${version}`, iconURL: 'https://i.imgur.com/AfFp7pu.png' });
  }
}
