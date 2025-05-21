// @ts-nocheck
// remove-next-line-disabled-reason: Pending an update that allows for type-safe server actions.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
'use server';

export type ResolveState = {
  id?: string; // To help with keying in lists if needed immediately
  originalUrl?: string;
  finalUrl?: string;
  error?: string;
  timestamp?: string; // ISO string
  message?: string; // For general feedback to the user
  status?: number; // HTTP status of the final URL
};

export async function resolveUrlAction(
  prevState: ResolveState,
  formData: FormData,
): Promise<ResolveState> {
  const rawUrl = formData.get('url');

  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return { error: 'URL cannot be empty.', message: 'Please enter a URL.' };
  }

  let urlInstance;
  try {
    // Ensure URL has a scheme for the URL constructor and fetch
    urlInstance = new URL(rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `http://${rawUrl}`);
  } catch (e) {
    return { originalUrl: rawUrl, error: 'Invalid URL format.', message: 'The URL provided is not valid.' };
  }

  const validatedUrl = urlInstance.toString();

  try {
    const response = await fetch(validatedUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'URLSleuth/1.0 (URL Resolver)', // A descriptive user agent
      },
      // Add a timeout to prevent hanging indefinitely
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    const finalUrl = response.url;
    const status = response.status;
    const timestamp = new Date().toISOString();

    let message = `URL resolved. Final destination status: ${status}.`;
    let error;

    if (status >= 400) {
      error = `HTTP Error: ${status} ${response.statusText || 'Error'}`;
      message = `The URL resolved to an error page (Status: ${status}).`;
    } else if (finalUrl !== validatedUrl) {
      message = 'URL resolved successfully after one or more redirects.';
    } else {
      message = 'URL resolved successfully. No redirects detected.';
    }
    
    return {
      id: Math.random().toString(36).substring(7), // simple unique id for potential immediate use
      originalUrl: validatedUrl,
      finalUrl: finalUrl,
      error: error,
      timestamp: timestamp,
      message: message,
      status: status,
    };

  } catch (e: any) {
    console.error('Error resolving URL:', e);
    let errorMessage = 'Failed to resolve URL.';
    if (e.name === 'AbortError') {
        errorMessage = 'Request timed out after 10 seconds.';
    } else if (e.cause && typeof e.cause === 'object') {
        // @ts-ignore
        const causeCode = e.cause.code;
        if (causeCode === 'ENOTFOUND') errorMessage = 'Domain not found. Check the URL and try again.';
        else if (causeCode === 'ECONNREFUSED') errorMessage = 'Connection refused by the server.';
        else if (causeCode === 'EAI_AGAIN') errorMessage = 'Temporary failure in name resolution. Please try again later.';
        else errorMessage = `Network error: ${causeCode || 'Unknown'}.`;
    } else if (e instanceof TypeError && e.message.includes('fetch')) {
        errorMessage = 'Invalid URL or network issue. Please check the URL.';
    }
    
    return {
      originalUrl: validatedUrl, // Use validatedUrl as originalUrl even on error
      error: errorMessage,
      timestamp: new Date().toISOString(),
      message: 'Could not retrieve the final URL due to an error.'
    };
  }
}
