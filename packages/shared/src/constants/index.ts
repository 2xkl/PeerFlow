export const VIDEO_EXTENSIONS = [
  '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv',
  '.webm', '.m4v', '.mpg', '.mpeg', '.ts', '.ogv',
] as const;

export const BROWSER_PLAYABLE_CODECS = {
  video: ['h264', 'vp8', 'vp9', 'av1'],
  audio: ['aac', 'mp3', 'opus', 'vorbis', 'flac'],
  container: ['mp4', 'webm', 'ogg'],
} as const;

export const TORRENT_PROGRESS_INTERVAL_MS = 2000;

export const WATCH_PROGRESS_SAVE_INTERVAL_MS = 10000;

export const COMPLETED_THRESHOLD = 0.9;
