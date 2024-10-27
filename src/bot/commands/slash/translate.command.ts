import { AiResponse } from '@ai/response/ai.response.ts';
import { withDefault } from '@utils/string.utils.ts';
import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Context } from '@utils/context.ts';
import { randomUUID } from 'node:crypto';
import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';

export class TranslateCommand extends SlashCommandHandler {
  private readonly size = 2000;

  register() {
    return new SlashCommandBuilder()
      .setName('translate')
      .setDescription('Translates text from one language to another (Auto determines the source language)')
      .addStringOption((option) => {
        return option
          .setRequired(true)
          .setName('target')
          .setDescription('The target language to translate to')
          .addChoices(
            {
              name: 'English',
              value: 'English',
            },
            {
              name: 'Georgian',
              value: 'Georgian',
            },
            {
              name: 'Filipino',
              value: 'Filipino',
            },
            {
              name: 'Estonian',
              value: 'Estonian',
            },
            {
              name: 'German',
              value: 'German',
            },
            {
              name: 'Russian',
              value: 'Russian',
            },
            {
              name: 'Spanish',
              value: 'Spanish',
            },
            {
              name: 'Korean',
              value: 'Korean',
            },
            {
              name: 'Japanese',
              value: 'Japanese',
            },
            {
              name: 'Chinese',
              value: 'Chinese',
            },
          );
      })
      .addStringOption((option) => {
        return option.setRequired(true).setName('text').setDescription('The text to translate');
      })
      .addStringOption((option) => {
        return option
          .setRequired(false)
          .setName('visible')
          .setDescription('Whether to send the translated message in the chat. Default is yes')
          .addChoices(
            {
              name: 'Yes',
              value: 'YES',
            },
            {
              name: 'No',
              value: 'NO',
            },
          );
      })
      .addStringOption((option) => {
        return option
          .setRequired(false)
          .setName('spoiler')
          .setDescription('Whether to send the translation as a spoiler')
          .addChoices(
            {
              name: 'Yes',
              value: 'YES',
            },
            {
              name: 'No',
              value: 'NO',
            },
          );
      });
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    const text = interaction.options.getString('text', true);
    const target = interaction.options.getString('target', true);

    const withVisible = withDefault(interaction.options.getString('visible', false), 'YES') === 'YES';
    const withSpoiler = withDefault(interaction.options.getString('spoiler', false), 'NO') === 'YES';
    const ephemeral = !withVisible;

    await interaction.deferReply({ ephemeral }); // When visible we show the message to everyone

    context.logger.info(`Translating __"${text}"__ into **${target}**...`);

    for (const content of await this.getTranslation(target, text, context)) {
      await interaction.followUp({
        content: withVisible ? content : this.asMarkdownCommand(content),
        ephemeral,
      });
    }

    if (withSpoiler) {
      for (const content of AiResponse.from(`||${text}||`, this.size)) {
        await interaction.followUp({ content, ephemeral });
      }
    }
  }

  private async getTranslation(target: string, text: string, context: Context) {
    return this.bot.conversations
      .createTranslateBy(randomUUID(), context)
      .addUserMessage(text)
      .addSystemMessage(`Translate it into ${target}`)
      .addSystemMessage(
        'If the target language is not in English alphabet, please use 2nd option with the English transcription.',
      )
      .sendRequest(context, this.size)
      .catch((error) => {
        context.logger.error('Failed to translate the text', error);

        return AiResponse.from('Failed to translate the text', this.size);
      });
  }

  private asMarkdownCommand(text: string) {
    return 'Translated text is below. :arrow_heading_down:\n\n' + `\`\`\`text\n${text}\n\`\`\``;
  }
}
