import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { isVideoFile } from '@peerflow/shared';

export interface TorrentState {
  infoHash: string;
  name: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  downloaded: number;
  size: number;
  done: boolean;
  files: { name: string; path: string; length: number }[];
}

interface WTorrent {
  infoHash: string;
  name: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  downloaded: number;
  length: number;
  done: boolean;
  paused: boolean;
  files: { name: string; path: string; length: number; select(): void }[];
  pause(): void;
  resume(): void;
  destroy(cb?: (err?: Error) => void): void;
  on(event: string, listener: (...args: any[]) => void): this;
}

interface WTorrentClient {
  torrents: WTorrent[];
  add(torrentId: string | Buffer, opts?: any): WTorrent;
  get(torrentId: string): WTorrent | null;
  destroy(cb?: (err?: Error) => void): void;
  on(event: string, listener: (...args: any[]) => void): this;
}

@Injectable()
export class TorrentEngineService implements OnModuleInit, OnModuleDestroy {
  private client: WTorrentClient;
  private readonly logger = new Logger(TorrentEngineService.name);
  private readonly downloadPath: string;

  constructor(private config: ConfigService) {
    this.downloadPath = config.get('DOWNLOAD_PATH', '/data/downloads');
  }

  async onModuleInit() {
    const WebTorrent = (await import('webtorrent')).default;
    this.client = new WebTorrent({
      maxConns: 50,
    }) as unknown as WTorrentClient;

    this.client.on('error', (err: Error) => {
      this.logger.error('WebTorrent error', err.message);
    });

    this.logger.log('WebTorrent engine initialized');
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.destroy();
      this.logger.log('WebTorrent engine destroyed');
    }
  }

  async addMagnet(magnetUri: string): Promise<TorrentState> {
    return new Promise((resolve, reject) => {
      const torrent = this.client.add(magnetUri, {
        path: this.downloadPath,
      });

      const timeout = setTimeout(() => {
        reject(new Error('Torrent metadata timeout'));
      }, 60000);

      torrent.on('metadata', () => {
        clearTimeout(timeout);
        this.enableSequentialForVideo(torrent);
        resolve(this.getTorrentState(torrent) as TorrentState);
      });

      torrent.on('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  async addTorrentFile(torrentBuffer: Buffer): Promise<TorrentState> {
    return new Promise((resolve, reject) => {
      const torrent = this.client.add(torrentBuffer, {
        path: this.downloadPath,
      });

      const timeout = setTimeout(() => {
        reject(new Error('Torrent metadata timeout'));
      }, 60000);

      torrent.on('metadata', () => {
        clearTimeout(timeout);
        this.enableSequentialForVideo(torrent);
        resolve(this.getTorrentState(torrent) as TorrentState);
      });

      torrent.on('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  removeTorrent(infoHash: string): void {
    const torrent = this.client.get(infoHash);
    if (torrent) {
      torrent.destroy();
    }
  }

  pauseTorrent(infoHash: string): void {
    const torrent = this.client.get(infoHash);
    if (torrent) {
      torrent.pause();
    }
  }

  resumeTorrent(infoHash: string): void {
    const torrent = this.client.get(infoHash);
    if (torrent) {
      torrent.resume();
    }
  }

  getTorrentState(torrentOrHash: WTorrent | string): TorrentState | null {
    const torrent =
      typeof torrentOrHash === 'string'
        ? this.client.get(torrentOrHash)
        : torrentOrHash;

    if (!torrent) return null;

    return {
      infoHash: torrent.infoHash,
      name: torrent.name || 'Unknown',
      progress: torrent.progress,
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      numPeers: torrent.numPeers,
      downloaded: torrent.downloaded,
      size: torrent.length || 0,
      done: torrent.done,
      files: torrent.files.map((f) => ({
        name: f.name,
        path: f.path,
        length: f.length,
      })),
    };
  }

  getAllStates(): TorrentState[] {
    if (!this.client) return [];
    return this.client.torrents
      .map((t) => this.getTorrentState(t))
      .filter(Boolean) as TorrentState[];
  }

  getFilePath(infoHash: string, filePath: string): string {
    return path.join(this.downloadPath, filePath);
  }

  isActive(infoHash: string): boolean {
    return !!this.client?.get(infoHash);
  }

  private enableSequentialForVideo(torrent: WTorrent): void {
    const videoFile = torrent.files.find((f) => isVideoFile(f.name));
    if (videoFile) {
      videoFile.select();
      this.logger.log(`Sequential download enabled for: ${videoFile.name}`);
    }
  }
}
