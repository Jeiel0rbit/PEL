// @ts-nocheck
// remove-next-line-disabled-reason: Pending an update that allows for type-safe server actions.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
"use client";

import React, { useState, useCallback } from 'react';
import { URLResolverForm } from '@/components/url-resolver-form';
import { URLHistoryDisplay } from '@/components/url-history-display';
import type { ResolveState } from '@/app/actions';
import { Zap } from 'lucide-react'; // Using Zap for Sleuth/Detective theme

export default function URLSleuthPage() {
  const [history, setHistory] = useState<ResolveState[]>([]);

  const handleNewUrlResolved = useCallback((entry: ResolveState) => {
    // Add to history, ensuring not to add duplicates if the exact same resolution (e.g. from form resubmit)
    // For simplicity, we'll add it. A more robust check might involve entry.id or content hash.
    setHistory(prev => [entry, ...prev].slice(0, 20)); // Keep last 20 entries
  }, []);

  return (
    <div className="bg-background min-h-screen py-8 px-4">
      <main className="container mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Zap size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
            URL Sleuth
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Unravel the mysteries of web links. Enter any URL to discover its true final destination and trace its path.
          </p>
        </header>

        <div className="space-y-12">
          <URLResolverForm onNewUrlResolved={handleNewUrlResolved} />
          {history.length > 0 && <URLHistoryDisplay history={history} />}
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} URL Sleuth. Powered by Next.js & Vercel.</p>
          <p className="mt-1">Designed for clarity and insight.</p>
        </footer>
      </main>
    </div>
  );
}
