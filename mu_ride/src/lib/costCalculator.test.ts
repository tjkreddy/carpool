import { describe, it, expect } from 'vitest';
import { formatCurrency } from './costCalculator';

describe('formatCurrency', () => {
  it('should format a number with two decimal places', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
  });

  it('should format an integer with two decimal places', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle already correctly formatted numbers', () => {
    expect(formatCurrency(12.34)).toBe('$12.34');
  });
});
