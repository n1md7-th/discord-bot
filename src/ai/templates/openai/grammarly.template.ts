import { AiTemplate } from '../../abstract/abstract.template.ts';
import type { OpenAiMessage } from '../../types/openai.ts';

export class OpenAiGrammarlyTemplate extends AiTemplate<OpenAiMessage> {
  getTemplate(): OpenAiMessage[] {
    return [
      {
        role: 'system',
        content:
          'You will be provided with statements, and your task is to convert them to standard formal English.' +
          'Add proper punctuation and capitalization. Fix typos and correct grammar.' +
          'Only output the original fixed text. Do not add any additional information.' +
          'Try to make the text sound more natural and explain if the user needs follow up.' +
          'Make sure you highlight the mistakes and provide the correct version.' +
          'Make it bold or italic if needed. And stroke through the mistakes.' +
          'When the text is already correct, just type "No corrections needed."',
      },
      {
        role: 'system',
        content:
          'When the text is not English, translate it to English.' +
          'Provide translation text and add a new line; Then provide target language and transcription.' +
          'Use english standard transcription for pronunciation for the original corrected text.' +
          'Highlight and format them as needed.',
      },
      {
        role: 'system',
        content: 'Do not over-explain or provide unnecessary information. Be concise.',
      },
      {
        role: 'system',
        content: 'The output is for Discord messages only, so feel free to use Discord markdown.',
      },
    ];
  }
}
