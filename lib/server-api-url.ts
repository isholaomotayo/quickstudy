/**
 * Helper function to construct absolute API URLs for server-side fetch calls
 * In Next.js API routes, relative URLs don't work, so we need to construct
 * absolute URLs from the request origin
 */
export function getServerApiUrl(request: Request, endpoint: string): string {
  // Get the origin from the request URL
  const url = new URL(request.url);
  const origin = url.origin;
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${origin}${cleanEndpoint}`;
}

