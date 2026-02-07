'use client';

import { formatBytes } from '@peerflow/shared';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Pause, Play, Trash2, PlayCircle } from 'lucide-react';
import Link from 'next/link';

interface TorrentFile {
  id: string;
  filePath: string;
  sizeBytes: number;
  mimeType: string;
  isVideo: boolean;
}

interface Torrent {
  id: string;
  name: string;
  status: string;
  progress: number;
  sizeBytes: number;
  downloadedBytes: number;
  downloadSpeed: number;
  uploadSpeed: number;
  peers: number;
  files: TorrentFile[];
}

interface DownloadListProps {
  torrents: Torrent[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRemove: (id: string) => void;
}

export function DownloadList({ torrents, onPause, onResume, onRemove }: DownloadListProps) {
  if (torrents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No downloads yet</p>
        <p className="text-sm">Add a torrent to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {torrents.map((torrent) => {
        const videoFile = torrent.files?.find((f) => f.isVideo);

        return (
          <div
            key={torrent.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{torrent.name}</h3>
                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatBytes(torrent.downloadedBytes)} / {formatBytes(torrent.sizeBytes)}</span>
                  {torrent.status === 'downloading' && (
                    <>
                      <span>{formatBytes(torrent.downloadSpeed)}/s</span>
                      <span>{torrent.peers} peers</span>
                    </>
                  )}
                  <span className="capitalize">{torrent.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {videoFile && (
                  <Link href={`/watch/${videoFile.id}`}>
                    <Button variant="ghost" size="icon" title="Play">
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {torrent.status === 'downloading' ? (
                  <Button variant="ghost" size="icon" onClick={() => onPause(torrent.id)} title="Pause">
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : torrent.status === 'paused' ? (
                  <Button variant="ghost" size="icon" onClick={() => onResume(torrent.id)} title="Resume">
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button variant="ghost" size="icon" onClick={() => onRemove(torrent.id)} title="Remove">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <Progress value={torrent.progress ?? 0} className="mt-3" />
            <div className="mt-1 text-xs text-muted-foreground text-right">
              {(torrent.progress ?? 0).toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
