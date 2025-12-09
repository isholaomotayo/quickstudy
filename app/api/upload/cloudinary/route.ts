import { NextRequest, NextResponse } from 'next/server';
import { courseContentUploader } from '@/lib/cloudinary-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'course-content';
    const tags = formData.get('tags') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      );
    }

    // Parse additional tags
    let additionalTags: string[] = [];
    if (tags) {
      additionalTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    // Upload to Cloudinary
    const result = await courseContentUploader.uploadFile(file, {
      folder,
      tags: ['course-content', ...additionalTags],
      resourceType: 'auto'
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('Cloudinary upload API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}