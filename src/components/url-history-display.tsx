// @ts-nocheck
// remove-next-line-disabled-reason: Pending an update that allows for type-safe server actions.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
"use client";

import type { FC } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResolveState } from '@/app/actions';
import { History, ExternalLink, AlertCircle, CheckCircle, ShieldQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface URLHistoryDisplayProps {
  history: ResolveState[];
}

export const URLHistoryDisplay: FC<URLHistoryDisplayProps> = ({ history }) => {
  if (history.length === 0) {
    return null; 
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/D';
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Data Inválida';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl gap-2">
          <History size={28} className="text-primary" />
          Histórico de Investigações
        </CardTitle>
        <CardDescription>
          Um registro das URLs que você investigou anteriormente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">URL Original</TableHead>
              <TableHead>Situação / Destino Final</TableHead>
              <TableHead className="w-[100px] text-center">Status HTTP</TableHead>
              <TableHead className="w-[180px] text-right">Data/Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry, index) => (
              <TableRow key={entry.id || index}>
                <TableCell className="font-medium break-all">
                  <a href={entry.originalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {entry.originalUrl}
                  </a>
                </TableCell>
                <TableCell className="break-all">
                  {entry.error && (!entry.status || entry.status < 400) && (
                    <span className="text-destructive flex items-center gap-1">
                       <AlertCircle size={16} className="shrink-0" /> {entry.error}
                    </span>
                  )}
                  {entry.finalUrl && entry.error && entry.status && entry.status >=400 && (
                     <span className="text-destructive flex items-center gap-1">
                       <AlertCircle size={16} className="shrink-0" /> Erro em: <a href={entry.finalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">{entry.finalUrl} <ExternalLink size={14} className="shrink-0" /></a>
                     </span>
                  )}
                  {entry.finalUrl && !entry.error && (
                    <a href={entry.finalUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                      <CheckCircle size={16} className="text-green-500 shrink-0" /> {entry.finalUrl} <ExternalLink size={14} className="shrink-0" />
                    </a>
                  )}
                  {!entry.finalUrl && !entry.error && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldQuestion size={16} className="shrink-0" /> Sem dados de destino.
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {entry.status ? (
                    <Badge variant={entry.status >= 400 ? "destructive" : entry.status >= 300 && entry.status < 400 ? "secondary" : "default"}>
                      {entry.status}
                    </Badge>
                  ) : (
                    <Badge variant="outline">N/D</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">{formatDate(entry.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
           {history.length > 0 && <TableCaption>Fim do histórico.</TableCaption>}
        </Table>
      </CardContent>
    </Card>
  );
};
