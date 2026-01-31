'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <video
          src={`/api/v1/stream/${fileId}`}
          controls
          autoPlay
          className="w-full h-full object-contain"
          style={{ maxHeight: '100vh' }}
        />
      </div>
    </div>
  );
}
