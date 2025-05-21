// @ts-nocheck
// remove-next-line-disabled-reason: Pending an update that allows for type-safe server actions.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
"use client";

import type { FC } from 'react';
import React, { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { resolveUrlAction, type ResolveState } from '@/app/actions';
import { Link as LinkIcon, Search, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface URLResolverFormProps {
  onNewUrlResolved: (entry: ResolveState) => void;
}

const initialState: ResolveState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sleuthing...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Sleuth URL
        </>
      )}
    </Button>
  );
}

export const URLResolverForm: FC<URLResolverFormProps> = ({ onNewUrlResolved }) => {
  const [state, formAction] = useActionState(resolveUrlAction, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
        const variant = state.error ? "destructive" : "default";
        toast({
            title: state.error ? "Error" : "Notification",
            description: state.message,
            variant: variant,
        });
    }

    if (state?.originalUrl && (state?.finalUrl || state?.error)) {
      onNewUrlResolved(state);
      // Clear input on successful resolution or if there's an error message (implying processing finished)
      if (inputRef.current && !state.error) { // Only clear on success
         // inputRef.current.value = ""; // Decided against auto-clearing for user convenience
      }
    }
  }, [state, onNewUrlResolved, toast]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl gap-2">
          <Search size={28} className="text-primary" />
          URL Investigator
        </CardTitle>
        <CardDescription>
          Enter a URL below to trace its path and uncover its final destination.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="relative flex-grow w-full">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="url"
                name="url"
                placeholder="e.g., https://short.url/example"
                required
                className="pl-10 text-base"
                aria-label="URL to resolve"
              />
            </div>
            <SubmitButton />
          </div>
        </CardContent>
      </form>
      {state?.originalUrl && (state?.finalUrl || state?.error) && (
        <CardFooter className="flex-col items-start space-y-3 pt-4 border-t">
           <h3 className="text-lg font-semibold text-primary">Resolution Result:</h3>
           <p className="text-sm">
            <span className="font-medium">Original URL:</span>{' '}
            <a href={state.originalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                {state.originalUrl}
            </a>
           </p>
          {state.finalUrl && !state.error && (
            <Alert variant="default" className="w-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle className="font-semibold">Final Destination:</AlertTitle>
              <AlertDescription className="break-all">
                <a href={state.finalUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium flex items-center gap-1">
                  {state.finalUrl} <ExternalLink size={14} />
                </a>
                {state.status && <span className="text-xs text-muted-foreground block mt-1">Status: {state.status}</span>}
              </AlertDescription>
            </Alert>
          )}
          {state.finalUrl && state.error && state.status && state.status >= 400 && (
             <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Resolved to Error Page:</AlertTitle>
              <AlertDescription className="break-all">
                <p className="mb-1">{state.error}</p>
                <p>
                    Destination: <a href={state.finalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium flex items-center gap-1">
                    {state.finalUrl} <ExternalLink size={14} />
                    </a>
                </p>
                <span className="text-xs block mt-1">Status: {state.status}</span>
              </AlertDescription>
            </Alert>
          )}
          {state.error && (!state.status || state.status < 400) && (
             <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Error:</AlertTitle>
              <AlertDescription>
                {state.error}
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
