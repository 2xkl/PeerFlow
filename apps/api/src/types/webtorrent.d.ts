declare module 'webtorrent' {
  import { EventEmitter } from 'events';
  import { Readable } from 'stream';

  namespace WebTorrent {
    interface TorrentFile {
      name: string;
      path: string;
      length: number;
      offset: number;
      select(): void;
      deselect(): void;
      createReadStream(opts?: { start?: number; end?: number }): Readable;
    }

    interface Torrent extends EventEmitter {
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
      files: TorrentFile[];
      pieces: any[];
      pieceLength: number;

      pause(): void;
      resume(): void;
      destroy(cb?: (err?: Error) => void): void;
      select(start: number, end: number, priority?: number): void;
      deselect(start: number, end: number, priority?: number): void;
      critical(start: number, end: number): void;

      on(event: 'metadata', listener: () => void): this;
      on(event: 'ready', listener: () => void): this;
      on(event: 'done', listener: () => void): this;
      on(event: 'error', listener: (err: Error) => void): this;
      on(event: 'download', listener: (bytes: number) => void): this;
      on(event: 'upload', listener: (bytes: number) => void): this;
      on(event: string, listener: (...args: any[]) => void): this;
    }

    interface Options {
      maxConns?: number;
      path?: string;
      tracker?: boolean | object;
      dht?: boolean | object;
    }

    interface AddOptions {
      path?: string;
      announce?: string[];
    }
  }

  class WebTorrent extends EventEmitter {
    constructor(opts?: WebTorrent.Options);

    torrents: WebTorrent.Torrent[];

    add(
      torrentId: string | Buffer,
      opts?: WebTorrent.AddOptions,
      cb?: (torrent: WebTorrent.Torrent) => void,
    ): WebTorrent.Torrent;
    add(
      torrentId: string | Buffer,
      cb?: (torrent: WebTorrent.Torrent) => void,
    ): WebTorrent.Torrent;

    get(torrentId: string): WebTorrent.Torrent | null;
    remove(torrentId: string, cb?: (err?: Error) => void): void;
    destroy(cb?: (err?: Error) => void): void;

    on(event: 'error', listener: (err: Error) => void): this;
    on(
      event: 'torrent',
      listener: (torrent: WebTorrent.Torrent) => void,
    ): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export = WebTorrent;
}
