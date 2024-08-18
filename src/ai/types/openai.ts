import { AiTemplate } from '../abstract/abstract.template.ts';
import OpenAI from 'openai';

export type OpenAiMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type OpenAiTemplate = AiTemplate<OpenAiMessage>;
