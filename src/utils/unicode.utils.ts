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
    if (!content) return '<empty>';

    if (!this.needsTranslation(content)) return content;

    return '<KA->EN> ' + content.split('').map(this.toEnglish).join('');
  }

  private needsTranslation([letter]: string) {
    return this.map.has(letter);
  }

  private toEnglish([letter]: string) {
    return this.map.get(letter) || letter;
  }
}
