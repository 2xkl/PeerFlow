'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'playing'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ buffered: 0, currentTime: 0, duration: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      console.log('[VIDEO] loadstart');
      setStatus('loading');
    };

    const handleLoadedMetadata = () => {
      console.log('[VIDEO] loadedmetadata, duration:', video.duration);
      setStatus('ready');
    };

    const handleCanPlay = () => {
      console.log('[VIDEO] canplay');
      setStatus('ready');
    };

    const handlePlaying = () => {
      console.log('[VIDEO] playing');
      setStatus('playing');
    };

    const handleWaiting = () => {
      console.log('[VIDEO] waiting (buffering)');
      setStatus('loading');
    };

    const handleError = () => {
      const err = video.error;
      const errorMsg = err ? `Error ${err.code}: ${err.message}` : 'Unknown error';
      console.error('[VIDEO] error:', errorMsg);
      setError(errorMsg);
      setStatus('error');
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = video.buffered.end(video.buffered.length - 1);
        setProgress(prev => ({ ...prev, buffered }));
        console.log('[VIDEO] buffered:', buffered.toFixed(2), '/', video.duration?.toFixed(2));
      }
    };

    const handleTimeUpdate = () => {
      setProgress(prev => ({
        ...prev,
        currentTime: video.currentTime,
        duration: video.duration || 0
      }));
    };

    const handleStalled = () => {
      console.log('[VIDEO] stalled');
    };

    const handleSuspend = () => {
      console.log('[VIDEO] suspend');
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('suspend', handleSuspend);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('suspend', handleSuspend);
    };
  }, []);

  const streamUrl = `/api/v1/stream/${fileId}`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <span className="text-white/60 text-xs">
          {status === 'loading' && 'Loading...'}
          {status === 'playing' && `${progress.currentTime.toFixed(0)}s / ${progress.duration.toFixed(0)}s`}
          {status === 'error' && 'Error'}
        </span>
      </div>

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg">Failed to load video</p>
          <p className="text-sm text-white/60 mt-2">{error}</p>
          <p className="text-xs text-white/40 mt-4">Stream URL: {streamUrl}</p>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          style={{ maxHeight: '100vh' }}
        />
      </div>
    </div>
  );
}
