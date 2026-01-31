import { createReadStream, promises as fs } from 'fs';
import { Readable } from 'stream';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { StorageProvider, ByteRange } from '../storage.provider';

export class LocalStorageProvider extends StorageProvider {
  private readonly basePath: string;

  constructor(config: ConfigService) {
    super();
    this.basePath = config.get('DOWNLOAD_PATH', '/data/downloads');
  }

  async getReadStream(key: string, range?: ByteRange): Promise<Readable> {
    const filePath = this.getFullPath(key);
    const options = range ? { start: range.start, end: range.end } : undefined;
    return createReadStream(filePath, options);
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
