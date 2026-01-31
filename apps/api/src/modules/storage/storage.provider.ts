import { Readable } from 'stream';

export interface ByteRange {
  start: number;
  end: number;
}

export abstract class StorageProvider {
  abstract getReadStream(key: string, range?: ByteRange): Promise<Readable>;
  abstract writeStream(key: string, stream: Readable, size?: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
  abstract getSize(key: string): Promise<number>;
  abstract getFullPath(key: string): string;
}
