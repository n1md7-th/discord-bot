export class Randomizer<Type = string> {
  constructor(private readonly content: readonly Type[]) {}

  getRandom() {
    return this.content[this.getRandomInteger(0, this.content.length - 1)];
  }

  getRandomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
