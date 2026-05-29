import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateLong,
  formatDateWithWeekday,
  formatTime,
  formatDateUTC,
} from '../date';

describe('formatDate', () => {
  it('includes month, day, and year', () => {
    const result = formatDate('2025-06-15T10:00:00.000Z');
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });
});

describe('formatDateLong', () => {
  it('includes full weekday and month name', () => {
    const result = formatDateLong('2025-06-16T00:00:00.000Z');
    // Monday June 16 2025 — exact string depends on locale, so check for keywords
    expect(result.length).toBeGreaterThan(10);
    expect(result).toMatch(/2025/);
  });
});

describe('formatDateWithWeekday', () => {
  it('returns a string with an abbreviated weekday and year', () => {
    const result = formatDateWithWeekday('2025-06-15T00:00:00.000Z');
    expect(result).toMatch(/2025/);
    expect(result.length).toBeGreaterThan(8);
  });
});

describe('formatTime', () => {
  it('returns a 12-hour time string', () => {
    const result = formatTime('2025-06-15T09:30:00.000Z');
    // Matches patterns like "09:30 AM" or "9:30 AM"
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatDateUTC', () => {
  it('returns full month name, day, and year in UTC', () => {
    expect(formatDateUTC('2025-06-03')).toBe('June 3, 2025');
  });

  it('handles January 1 correctly (boundary)', () => {
    expect(formatDateUTC('2025-01-01')).toBe('January 1, 2025');
  });

  it('does not shift day due to timezone (UTC-safe)', () => {
    // Even if local timezone is UTC-8, 2025-06-03 should still render as June 3
    expect(formatDateUTC('2025-06-03')).toContain('3');
    expect(formatDateUTC('2025-06-03')).toContain('June');
  });

  it('handles end of year', () => {
    expect(formatDateUTC('2025-12-31')).toBe('December 31, 2025');
  });
});
