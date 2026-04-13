import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

function getImageContentType(photoBuffer) {
  if (photoBuffer.length >= 8 && photoBuffer[0] === 0x89 && photoBuffer[1] === 0x50 && photoBuffer[2] === 0x4e && photoBuffer[3] === 0x47) {
    return 'image/png';
  }

  if (photoBuffer.length >= 3 && photoBuffer[0] === 0xff && photoBuffer[1] === 0xd8 && photoBuffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (photoBuffer.length >= 6) {
    const signature = photoBuffer.subarray(0, 6).toString('ascii');
    if (signature === 'GIF87a' || signature === 'GIF89a') {
      return 'image/gif';
    }
  }

  if (photoBuffer.length >= 12 && photoBuffer.subarray(0, 4).toString('ascii') === 'RIFF' && photoBuffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }

  return 'application/octet-stream';
}

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

    if (!result?.photo) {
      console.error(`Photo not found for Ashima ID: ${ashima_id}`);
      return NextResponse.json(
        { error: 'Photo not found for the provided Ashima ID.' },
        { status: 404 }
      );
    }

    const photoBuffer = Buffer.isBuffer(result.photo) ? result.photo : Buffer.from(result.photo);
    if (photoBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Photo not found for the provided Ashima ID.' },
        { status: 404 }
      );
    }

    console.log(`Photo fetched for Ashima ID: ${ashima_id}, size: ${photoBuffer.length} bytes`);

    // Serve the photo as binary data
    return new Response(photoBuffer, {
      headers: {
        'Content-Type': getImageContentType(photoBuffer),
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
