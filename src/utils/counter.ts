export class Counter {
  protected readonly MIN: number;
  protected readonly MAX: number;
  protected readonly start: number;

  protected count: number;

  constructor(start?: number, minThreshold?: number, maxThreshold?: number) {
    this.count = start || 0;
    this.start = start || 0;
    this.MIN = minThreshold ?? Number.MIN_SAFE_INTEGER;
    this.MAX = maxThreshold ?? Number.MAX_SAFE_INTEGER;
  }

  inc() {
    return (this.count = Math.min(this.count + 1, this.MAX));
  }

  dec() {
    return (this.count = Math.max(this.count - 1, this.MIN));
  }

  add(value: number) {
    return (this.count = Math.min(this.count + value, this.MAX));
  }

  sub(value: number) {
    return (this.count = Math.max(this.count - value, this.MIN));
  }

  set(value: number) {
    if (value > this.MAX) value = this.MAX;
    if (value < this.MIN) value = this.MIN;

    return (this.count = value);
  }

  reset() {
    return (this.count = this.start);
  }

  getValue() {
    return this.count;
  }

  isPositive() {
    return this.count > 0;
  }

  isNegative() {
    return this.count < 0;
  }

  isZero() {
    return this.count === 0;
  }
}
