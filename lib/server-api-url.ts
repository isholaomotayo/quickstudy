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

/**
 * Helper function to construct absolute API URLs in server components
 * Uses headers() to get the host information
 */
export async function getServerComponentApiUrl(endpoint: string): Promise<string> {
  const { headers } = await import('next/headers');
  const headersList = await headers();
  
  // Get host from headers
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 
                   (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${protocol}://${host}${cleanEndpoint}`;
}

