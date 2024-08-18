export class NameMaker {
  *makeThreadName(name: string): Generator<string> {
    let counter = 0;

    while (true) {
      yield `${name} ${String(counter++).padStart(3, '0')}`;
    }
  }
}
