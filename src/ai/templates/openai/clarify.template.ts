import { AiTemplate } from '../../abstract/abstract.template.ts';
import type { OpenAiMessage } from '../../types/openai.ts';

export class OpenAiClarifyTemplate extends AiTemplate<OpenAiMessage> {
  getTemplate(): OpenAiMessage[] {
    return [
      {
        role: 'system',
        content:
          'You will be provided with statements, or attachments.' +
          'Explain in details what it is. It can be text based or visual.' +
          'Provide the meaning, context, and any relevant information.',
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
