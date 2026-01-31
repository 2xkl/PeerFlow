import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { StorageProvider } from '../storage/storage.provider';
import { TorrentsService } from '../torrents/torrents.service';

export interface StreamInfo {
  filePath: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
}

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);

  constructor(
    private readonly storage: StorageProvider,
    private readonly torrentsService: TorrentsService,
  ) {}

  async getStreamInfo(fileId: string): Promise<StreamInfo> {
    const file = await this.torrentsService.getFile(fileId);
    const storageKey = file.storageKey || file.filePath;
    const fullPath = this.storage.getFullPath(storageKey);

    let fileSize: number;
    try {
      const stat = await fs.stat(fullPath);
      fileSize = stat.size;
    } catch {
      fileSize = Number(file.sizeBytes) || 0;
    }

    return {
      filePath: fullPath,
      fileSize,
      mimeType: file.mimeType || 'application/octet-stream',
      storageKey,
    };
  }

  async getReadStream(storageKey: string, start: number, end: number) {
    return this.storage.getReadStream(storageKey, { start, end });
  }
}
