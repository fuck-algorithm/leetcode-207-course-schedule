import { describe, expect, it } from 'vitest';
import { MOTION, motionDuration } from './motion';

describe('motionDuration', () => {
  it('scales animation duration with playback speed', () => {
    expect(motionDuration(MOTION.moveMs, 2)).toBe(180);
  });

  it('caps transitions below the dwell time budget', () => {
    expect(motionDuration(2000, 0.5)).toBe(1100);
  });

  it('disables motion for reduced motion and invalid speeds', () => {
    expect(motionDuration(MOTION.moveMs, 1, true)).toBe(0);
    expect(motionDuration(MOTION.moveMs, 0)).toBe(0);
  });
});
