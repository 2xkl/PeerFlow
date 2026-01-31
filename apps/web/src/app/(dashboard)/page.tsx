'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome to PeerFlow</h1>
      <p className="text-muted-foreground mb-8">Self-hosted P2P streaming</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/downloads" className="group">
          <div className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50">
            <Download className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-semibold mb-1">Downloads</h2>
            <p className="text-sm text-muted-foreground">
              Manage your torrents and watch progress
            </p>
            <div className="mt-4 flex items-center text-sm text-primary">
              Go to Downloads
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
