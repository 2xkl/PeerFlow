'use client';

import { useDownloads } from '@/hooks/use-downloads';
import { AddTorrentDialog } from '@/components/downloads/add-torrent-dialog';
import { DownloadList } from '@/components/downloads/download-list';

export default function DownloadsPage() {
  const {
    torrents,
    loading,
    error,
    addTorrent,
    removeTorrent,
    pauseTorrent,
    resumeTorrent,
  } = useDownloads();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Downloads</h1>
          <p className="text-sm text-muted-foreground">
            {torrents.length} torrent{torrents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddTorrentDialog onAdd={addTorrent} />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <DownloadList
          torrents={torrents}
          onPause={pauseTorrent}
          onResume={resumeTorrent}
          onRemove={removeTorrent}
        />
      )}
    </div>
  );
}
