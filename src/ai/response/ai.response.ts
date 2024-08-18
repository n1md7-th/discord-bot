import { StringUtils } from '../../utils/string.utils.ts';

export class AiResponse {
  readonly chunks: string[];
  readonly size: number;

  constructor(content: string, maxChunkSize: number) {
    this.chunks = StringUtils.getChunkedStringArray(content, maxChunkSize);
    this.size = content.length;
  }

  static from(content: string, maxChunkSize: number): AiResponse {
    return new AiResponse(content, maxChunkSize);
  }
}
