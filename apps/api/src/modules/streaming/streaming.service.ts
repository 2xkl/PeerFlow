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
    this.logger.log(`[GET_INFO] Looking up file: ${fileId}`);

    const file = await this.torrentsService.getFile(fileId);
    this.logger.log(`[GET_INFO] Found file in DB: ${file.filePath}, torrentId=${file.torrentId}`);

    const storageKey = file.storageKey || file.filePath;
    const fullPath = this.storage.getFullPath(storageKey);
    this.logger.log(`[GET_INFO] Full path: ${fullPath}`);

    let fileSize: number;
    let fileExists = false;
    try {
      const stat = await fs.stat(fullPath);
      fileSize = stat.size;
      fileExists = true;
      this.logger.log(`[GET_INFO] File exists on disk, actual size: ${fileSize}`);
    } catch (err: any) {
      fileSize = Number(file.sizeBytes) || 0;
      this.logger.warn(`[GET_INFO] File NOT on disk (${err.code}), using DB size: ${fileSize}`);
    }

    // Check if file is being downloaded (partial file)
    const expectedSize = Number(file.sizeBytes) || 0;
    if (fileExists && fileSize < expectedSize) {
      this.logger.warn(`[GET_INFO] Partial file! Downloaded: ${fileSize}/${expectedSize} (${((fileSize/expectedSize)*100).toFixed(1)}%)`);
    }

    return {
      filePath: fullPath,
      fileSize,
      mimeType: file.mimeType || 'application/octet-stream',
      storageKey,
    };
  }

  async getReadStream(storageKey: string, start: number, end: number) {
    this.logger.log(`[READ_STREAM] Creating stream: ${storageKey} [${start}-${end}]`);
    try {
      const stream = await this.storage.getReadStream(storageKey, { start, end });
      this.logger.log(`[READ_STREAM] Stream created successfully`);
      return stream;
    } catch (err: any) {
      this.logger.error(`[READ_STREAM] Failed to create stream: ${err.message}`);
      throw err;
    }
  }
}
