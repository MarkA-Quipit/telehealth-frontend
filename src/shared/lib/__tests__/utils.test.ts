import { describe, it, expect } from 'vitest';
import { cn, formatDuration } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignores falsy values', () => {
    expect(cn(undefined, false as unknown as string, 'a')).toBe('a');
  });

  it('handles empty call', () => {
    expect(cn()).toBe('');
  });
});

describe('formatDuration', () => {
  it('returns minutes only when < 60', () => {
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(59)).toBe('59 min');
  });

  it('returns hours only when evenly divisible', () => {
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(120)).toBe('2 hr');
  });

  it('returns hours and minutes when there is a remainder', () => {
    expect(formatDuration(90)).toBe('1 hr 30 min');
    expect(formatDuration(75)).toBe('1 hr 15 min');
  });
});
