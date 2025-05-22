// @ts-nocheck
// remove-next-line-disabled-reason: Pending an update that allows for type-safe server actions.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
"use client";

import React, { useState, useCallback } from 'react';
import { URLResolverForm } from '@/components/url-resolver-form';
import { URLHistoryDisplay } from '@/components/url-history-display';
import type { ResolveState } from '@/app/actions';
import { Zap } from 'lucide-react'; 

export default function URLSleuthPage() {
  const [history, setHistory] = useState<ResolveState[]>([]);

  const handleNewUrlResolved = useCallback((entry: ResolveState) => {
    setHistory(prev => [entry, ...prev].slice(0, 20)); 
  }, []);

  return (
    <div className="bg-background min-h-screen py-8 px-4">
      <main className="container mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Zap size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
            Detetive de URL
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Desvende os mistérios dos links da web. Insira qualquer URL para descobrir seu verdadeiro destino final e rastrear seu caminho.
          </p>
        </header>

        <div className="space-y-12">
          <URLResolverForm onNewUrlResolved={handleNewUrlResolved} />
          {history.length > 0 && <URLHistoryDisplay history={history} />}
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Detetive de URL. Desenvolvido com Next.js.</p>
          <p className="mt-1">Projetado para clareza e discernimento.</p>
        </footer>
      </main>
    </div>
  );
}
