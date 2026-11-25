export const PLAYBACK_SPEEDS = [1500, 1000, 500, 333] as const;
const STORAGE_KEY = 'playback-speed';

export function readPlaybackSpeed(storage: Pick<Storage, 'getItem'> | null): number {
  try {
    const saved = Number(storage?.getItem(STORAGE_KEY));
    return PLAYBACK_SPEEDS.includes(saved as (typeof PLAYBACK_SPEEDS)[number]) ? saved : 1000;
  } catch {
    return 1000;
  }
}

export function writePlaybackSpeed(storage: Pick<Storage, 'setItem'> | null, speed: number): void {
  try {
    storage?.setItem(STORAGE_KEY, String(speed));
  } catch {
    // Playback remains functional when browser storage is unavailable.
  }
}
