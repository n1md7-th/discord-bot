import { describe, it, expect } from 'bun:test';
import { Counter } from '../counter.ts';

describe('Counter', () => {
  it('should increment the counter', () => {
    // Arrange
    const counter = new Counter();

    // Act
    counter.inc();

    // Assert
    expect(counter.getValue()).toBe(1);
  });

  it('should decrement the counter', () => {
    // Arrange
    const counter = new Counter();

    // Act
    counter.dec();

    // Assert
    expect(counter.getValue()).toBe(-1);
  });

  it('should add a value to the counter', () => {
    // Arrange
    const counter = new Counter();

    // Act
    counter.add(5);

    // Assert
    expect(counter.getValue()).toBe(5);
  });

  it('should subtract a value from the counter', () => {
    // Arrange
    const counter = new Counter();

    // Act
    counter.sub(5);

    // Assert
    expect(counter.getValue()).toBe(-5);
  });

  it('should set the counter to a specific value', () => {
    // Arrange
    const counter = new Counter();

    // Act
    counter.set(10);

    // Assert
    expect(counter.getValue()).toBe(10);
  });

  it('should reset the counter to its initial value', () => {
    // Arrange
    const counter = new Counter(5);

    // Act
    counter.reset();

    // Assert
    expect(counter.getValue()).toBe(5);
  });

  it('should return the current value of the counter', () => {
    // Arrange
    const counter = new Counter(5);

    // Act
    const value = counter.getValue();

    // Assert
    expect(value).toBe(5);
  });

  it('should return true if the counter is positive', () => {
    // Arrange
    const counter = new Counter(5);

    // Act
    const isPositive = counter.isPositive();

    // Assert
    expect(isPositive).toBe(true);
  });

  it('should return true if the counter is negative', () => {
    // Arrange
    const counter = new Counter(-5);

    // Act
    const isNegative = counter.isNegative();

    // Assert
    expect(isNegative).toBe(true);
  });

  it('should return true if the counter is zero', () => {
    // Arrange
    const counter = new Counter();

    // Act
    const isZero = counter.isZero();

    // Assert
    expect(isZero).toBe(true);
  });
});
