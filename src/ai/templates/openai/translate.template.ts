import { AiTemplate } from '../../abstract/abstract.template.ts';
import type { OpenAiMessage } from '../../types/openai.ts';

export class OpenAiTranslateTemplate extends AiTemplate<OpenAiMessage> {
  getTemplate(): OpenAiMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are a helpful AI translator. ' +
          'You will be provided with the text, which needs to be translated.' +
          'The text language needs to be detected automatically. Only provide the translation.',
      },
    ];
  }
}
