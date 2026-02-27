import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DocumentProcessor } from '@/lib/ai/document-processor';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are supported' },
        { status: 400 }
      );
    }

    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be under 50MB' },
        { status: 400 }
      );
    }

    const processor = new DocumentProcessor();
    const buffer = await file.arrayBuffer();
    const chunks = await processor.extract(buffer, file.name);

    return NextResponse.json({
      chunks,
      total_chunks: chunks.length,
      total_chars: chunks.reduce((sum, c) => sum + c.text.length, 0),
      filename: file.name,
    });
  } catch (error) {
    console.error('Document extraction error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to extract document',
      },
      { status: 500 }
    );
  }
}
