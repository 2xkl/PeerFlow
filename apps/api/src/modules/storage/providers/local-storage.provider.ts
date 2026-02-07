import { createReadStream, promises as fs } from 'fs';
import { Readable } from 'stream';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { StorageProvider, ByteRange } from '../storage.provider';

export class LocalStorageProvider extends StorageProvider {
  private readonly basePath: string;
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor(config: ConfigService) {
    super();
    this.basePath = config.get('DOWNLOAD_PATH', '/data/downloads');
    this.logger.log(`[INIT] Storage base path: ${this.basePath}`);
  }

  async getReadStream(key: string, range?: ByteRange): Promise<Readable> {
    const filePath = this.getFullPath(key);
    const options = range ? { start: range.start, end: range.end } : undefined;

    this.logger.log(`[READ] Opening: ${filePath}`);
    if (range) {
      this.logger.log(`[READ] Range: ${range.start}-${range.end}`);
    }

    // Check if file exists before creating stream
    try {
      const stat = await fs.stat(filePath);
      this.logger.log(`[READ] File stat: size=${stat.size}, modified=${stat.mtime.toISOString()}`);

      if (range && range.start > stat.size) {
        this.logger.error(`[READ] Range start (${range.start}) exceeds file size (${stat.size})`);
        throw new Error(`Range start exceeds file size`);
      }
      if (range && range.end > stat.size - 1) {
        this.logger.warn(`[READ] Adjusting range end from ${range.end} to ${stat.size - 1}`);
        range.end = stat.size - 1;
      }
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.logger.error(`[READ] File does not exist: ${filePath}`);
        throw new Error(`File not found: ${key}`);
      }
      throw err;
    }

    const stream = createReadStream(filePath, options);

    stream.on('open', (fd) => {
      this.logger.log(`[READ] Stream opened, fd=${fd}`);
    });

    stream.on('error', (err) => {
      this.logger.error(`[READ] Stream error: ${err.message}`);
    });

    return stream;
  }

  async writeStream(key: string, stream: Readable): Promise<void> {
    const filePath = this.getFullPath(key);
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    await fs.mkdir(dir, { recursive: true });
    const { createWriteStream } = await import('fs');
    return new Promise((resolve, reject) => {
      const ws = createWriteStream(filePath);
      stream.pipe(ws);
      ws.on('finish', resolve);
      ws.on('error', reject);
    });
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFullPath(key);
    await fs.unlink(filePath).catch(() => {});
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.getFullPath(key));
      return true;
    } catch {
      return false;
    }
  }

  async getSize(key: string): Promise<number> {
    const stat = await fs.stat(this.getFullPath(key));
    return stat.size;
  }

  getFullPath(key: string): string {
    return join(this.basePath, key);
  }
}
