'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api-client';
import type { TorrentProgressEvent } from '@peerflow/shared';

interface Torrent {
  id: string;
  infoHash: string;
  name: string;
  status: string;
  progress: number;
  sizeBytes: number;
  downloadedBytes: number;
  downloadSpeed: number;
  uploadSpeed: number;
  peers: number;
  files: {
    id: string;
    filePath: string;
    sizeBytes: number;
    mimeType: string;
    isVideo: boolean;
  }[];
  createdAt: string;
}

export function useDownloads() {
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTorrents = useCallback(async () => {
    try {
      const data = await api.get<Torrent[]>('/torrents');
      setTorrents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch torrents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTorrents();
  }, [fetchTorrents]);

  useEffect(() => {
    const socket: Socket = io('/ws/torrents', {
      transports: ['websocket'],
    });

    socket.on('torrent:progress', (states: TorrentProgressEvent[]) => {
      setTorrents((prev) =>
        prev.map((torrent) => {
          const state = states.find((s) => s.infoHash === torrent.infoHash);
          if (state) {
            return {
              ...torrent,
              progress: Math.round(state.progress * 10000) / 100,
              downloadSpeed: state.downloadSpeed,
              uploadSpeed: state.uploadSpeed,
              peers: state.peers,
              downloadedBytes: state.downloadedBytes,
              status: state.status,
            };
          }
          return torrent;
        }),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addTorrent = useCallback(
    async (magnetUri: string) => {
      await api.post('/torrents', { magnetUri });
      await fetchTorrents();
    },
    [fetchTorrents],
  );

  const removeTorrent = useCallback(
    async (id: string) => {
      await api.delete(`/torrents/${id}`);
      await fetchTorrents();
    },
    [fetchTorrents],
  );

  const pauseTorrent = useCallback(async (id: string) => {
    await api.post(`/torrents/${id}/pause`);
  }, []);

  const resumeTorrent = useCallback(async (id: string) => {
    await api.post(`/torrents/${id}/resume`);
  }, []);

  return {
    torrents,
    loading,
    error,
    addTorrent,
    removeTorrent,
    pauseTorrent,
    resumeTorrent,
    refresh: fetchTorrents,
  };
}
