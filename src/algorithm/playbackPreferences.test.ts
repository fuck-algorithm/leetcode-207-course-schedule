import { describe, expect, it } from 'vitest';
import { readPlaybackSpeed, writePlaybackSpeed } from './playbackPreferences';

describe('playback speed preferences', () => {
  it('reads supported speeds and falls back for unknown values', () => {
    expect(readPlaybackSpeed({ getItem: () => '333' })).toBe(333);
    expect(readPlaybackSpeed({ getItem: () => 'fast' })).toBe(1000);
    expect(readPlaybackSpeed(null)).toBe(1000);
  });

  it('survives browser storage access failures', () => {
    const blocked = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    };
    expect(readPlaybackSpeed(blocked)).toBe(1000);
    expect(() => writePlaybackSpeed(blocked, 500)).not.toThrow();
  });
});
