export class StringUtils {
  static getChunkedStringArray(str: string, chunkSize: number): string[] {
    const chunks: string[] = [];

    for (let i = 0; i < str.length; i += chunkSize) {
      chunks.push(str.slice(i, i + chunkSize));
    }

    return chunks;
  }
}

export const withDefault = <T>(value: T, defaultValue: T): T => {
  return value || defaultValue;
};
