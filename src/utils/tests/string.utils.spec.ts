import { describe, expect, it } from 'bun:test';
import { StringUtils } from '../string.utils.ts';

describe('string.utils', () => {
  it('should return an array of strings', () => {
    // Arrange
    const str = 'Hello, World!';
    const chunkSize = 5;

    // Act
    const result = StringUtils.getChunkedStringArray(str, chunkSize);

    // Assert
    expect(result).toEqual(['Hello', ', Wor', 'ld!']);
  });

  it('should return an array with a single element', () => {
    // Arrange
    const str = 'Hello, World!';
    const chunkSize = 100;

    // Act
    const result = StringUtils.getChunkedStringArray(str, chunkSize);

    // Assert
    expect(result).toEqual(['Hello, World!']);
  });

  it('should return an empty array', () => {
    // Arrange
    const str = '';
    const chunkSize = 5;

    // Act
    const result = StringUtils.getChunkedStringArray(str, chunkSize);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return single element array when chunk size is equal to string length', () => {
    // Arrange
    const str = 'Hello, World!';
    const chunkSize = 13;

    // Act
    const result = StringUtils.getChunkedStringArray(str, chunkSize);

    // Assert
    expect(result).toEqual(['Hello, World!']);
  });

  describe.skip('Keep markdown style', () => {
    it('should not break the markdown style for multiline', () => {
      // Arrange
      const str = '```html\n Click Me Hard\n```';
      const chunkSize = 20;

      // Act
      const result = StringUtils.getChunkedStringArray(str, chunkSize);

      // Assert
      expect(result).toEqual(['```html\n Click Me```', '```html\n Hard\n```']);
    });

    it('should not break the markdown style for single line', () => {
      // Arrange
      const str = '`const x = 10;`';
      const chunkSize = 10;

      // Act
      const result = StringUtils.getChunkedStringArray(str, chunkSize);

      // Assert
      expect(result).toEqual(['`const x `', '`= 10;`']);
    });
  });
});
