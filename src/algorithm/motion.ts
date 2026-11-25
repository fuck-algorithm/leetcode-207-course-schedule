export const MOTION = {
  nodeEnterMs: 220,
  moveMs: 360,
  exitMs: 180,
  stateMs: 240,
  arrowMs: 420,
  dwellMs: 1000,
} as const;

export function motionDuration(duration: number, speed = 1, reducedMotion = false): number {
  if (reducedMotion || !Number.isFinite(speed) || speed <= 0) return 0;
  return Math.min(duration / speed, (MOTION.dwellMs / speed) * 0.55);
}
