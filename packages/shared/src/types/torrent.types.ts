export enum TorrentStatus {
  DOWNLOADING = 'downloading',
  SEEDING = 'seeding',
  PAUSED = 'paused',
  ERROR = 'error',
  COMPLETED = 'completed',
}

export interface TorrentDto {
  id: string;
  infoHash: string;
  name: string;
  magnetUri: string;
  status: TorrentStatus;
  progress: number;
  sizeBytes: number;
  downloadedBytes: number;
  downloadSpeed: number;
  uploadSpeed: number;
  peers: number;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TorrentFileDto {
  id: string;
  torrentId: string;
  filePath: string;
  sizeBytes: number;
  mimeType: string | null;
  isVideo: boolean;
}

export interface AddTorrentRequest {
  magnetUri?: string;
  torrentFile?: string; // base64 encoded
}

export interface TorrentProgressEvent {
  id: string;
  infoHash: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  peers: number;
  downloadedBytes: number;
  status: TorrentStatus;
}
