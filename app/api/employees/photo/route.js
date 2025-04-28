import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request) {
  try {
    // Extract `ashima_id` from the query parameters
    const { searchParams } = new URL(request.url);
    const ashima_id = searchParams.get('ashima_id');

    if (!ashima_id) {
      return NextResponse.json(
        { error: 'Ashima ID is required.' },
        { status: 400 }
      );
    }

    // Fetch the photo for the specified `ashima_id`
    const photoQuery = `
      SELECT photo
      FROM employees
      WHERE ashima_id = ?
    `;
    const [result] = await executeQuery({ query: photoQuery, values: [ashima_id] });

    if (!result || !result.photo) {
      return NextResponse.json(
        { error: 'Photo not found for the provided Ashima ID.' },
        { status: 404 }
      );
    }

    // Serve the photo as binary data
    return new Response(result.photo, {
      headers: {
        'Content-Type': 'image/png', // Adjust based on the image type stored
        'Cache-Control': 'public, max-age=31536000', // Cache the image for a year
      },
    });
  } catch (error) {
    console.error('Error fetching employee photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee photo.' },
      { status: 500 }
    );
  }
}