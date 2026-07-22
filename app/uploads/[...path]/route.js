import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    case '.txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(request, context) {
  try {
    const params = await context.params;
    const pathSegments = params?.path || [];
    
    if (!pathSegments.length) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    // Decode each URL component (to handle spaces/special characters in filenames)
    const decodedSegments = pathSegments.map(segment => decodeURIComponent(segment));

    // Prevent directory traversal attacks
    const sanitizedPath = path.normalize(path.join(...decodedSegments)).replace(/^(\.\.[\/\\])+/, '');
    
    // Check multiple potential uploads directories (stand-alone mode vs standard project root)
    const possibleDirs = [
      path.join(process.cwd(), 'public', 'uploads'),
      path.join(process.cwd(), '.next', 'standalone', 'public', 'uploads'),
    ];

    let targetFilePath = null;
    for (const dir of possibleDirs) {
      const fullPath = path.join(dir, sanitizedPath);
      // Ensure the resolved path stays within the intended uploads dir
      if (fullPath.startsWith(dir) && fs.existsSync(fullPath)) {
        targetFilePath = fullPath;
        break;
      }
    }

    if (!targetFilePath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(targetFilePath);
    const contentType = getMimeType(targetFilePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
