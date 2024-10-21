import chalk from 'chalk';

export class UnicodeUtils {
  private readonly map = new Map([
    ['ა', 'a'],
    ['ბ', 'b'],
    ['გ', 'g'],
    ['დ', 'd'],
    ['ე', 'e'],
    ['ვ', 'v'],
    ['ზ', 'z'],
    ['თ', 't'],
    ['ი', 'i'],
    ['კ', 'k'],
    ['ლ', 'l'],
    ['მ', 'm'],
    ['ნ', 'n'],
    ['ო', 'o'],
    ['პ', 'p'],
    ['ჟ', 'zh'],
    ['რ', 'r'],
    ['ს', 's'],
    ['ტ', 't'],
    ['უ', 'u'],
    ['ფ', 'p'],
    ['ქ', 'k'],
    ['ღ', 'gh'],
    ['ყ', 'q'],
    ['შ', 'sh'],
    ['ჩ', 'ch'],
    ['ც', 'ts'],
    ['ძ', 'dz'],
    ['წ', 'ts'],
    ['ჭ', 'ch'],
    ['ხ', 'kh'],
    ['ჯ', 'j'],
    ['ჰ', 'h'],
  ]);

  constructor() {
    this.toAscii = this.toAscii.bind(this);
    this.toEnglish = this.toEnglish.bind(this);
  }

  toAscii(content: string | null) {
    if (!content) return chalk.grey('<EMPTY>');

    if (!this.needsTranslation(content)) return content;

    return chalk.blueBright('<KA->EN> ') + content.split('').map(this.toEnglish).join('');
  }

  private needsTranslation(letter: string) {
    for (let i = 0; i < Math.min(32, letter.length); i++) {
      if (this.map.has(letter[i])) return true;
    }

    return false;
  }

  private toEnglish([letter]: string) {
    return this.map.get(letter) || letter;
  }
}
