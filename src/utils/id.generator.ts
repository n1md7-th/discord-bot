export function* idGenerator() {
  let id = 0;
  while (true) {
    yield id++;

    if (id > 1000) id = 0;
  }
}
