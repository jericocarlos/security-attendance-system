import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Only initialize serial port connection on server startup
  if (process.env.NODE_ENV === 'production') {
    try {
      // Use a relative URL to the API route that initializes the serial port
      await fetch(new URL('/api/serial/init', request.url));
    } catch (error) {
      console.error('Failed to initialize serial port in middleware:', error);
    }
  }
  
  return NextResponse.next();
}

// Configure this middleware to run on specific paths
export const config = {
  matcher: ['/'],
};