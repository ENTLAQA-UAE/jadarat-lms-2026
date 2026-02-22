import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST: Generate embeddings for courses in the organization.
// Called by admin to index/re-index course content for semantic search.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (!userData || !['organizationAdmin', 'LMSAdmin', 'superAdmin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const orgId = userData.organization_id;
    const embeddingApiKey = process.env.OPENAI_API_KEY;

    if (!embeddingApiKey) {
      return NextResponse.json(
        { error: 'Embedding API key not configured' },
        { status: 500 }
      );
    }

    // Get all courses for the organization
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, description, outcomes, level')
      .eq('organization_id', orgId);

    if (!courses || courses.length === 0) {
      return NextResponse.json({ message: 'No courses to embed', count: 0 });
    }

    let embeddedCount = 0;
    const errors: string[] = [];

    for (const course of courses) {
      // Build text chunks for each course
      const chunks: { content: string; type: string; index: number }[] = [];

      // Title chunk
      if (course.title) {
        chunks.push({ content: course.title, type: 'title', index: 0 });
      }

      // Description chunk
      if (course.description) {
        chunks.push({ content: course.description, type: 'description', index: 0 });
      }

      // Outcomes chunks
      if (course.outcomes && Array.isArray(course.outcomes)) {
        const outcomesText = course.outcomes
          .map((o: { title?: string; description?: string }) =>
            [o.title, o.description].filter(Boolean).join(': ')
          )
          .join('. ');
        if (outcomesText) {
          chunks.push({ content: outcomesText, type: 'outcome', index: 0 });
        }
      }

      // Combined chunk for better semantic matching
      const combined = [course.title, course.description].filter(Boolean).join('. ');
      if (combined) {
        chunks.push({ content: combined, type: 'combined', index: 0 });
      }

      // Generate embeddings for each chunk
      for (const chunk of chunks) {
        try {
          const embResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${embeddingApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: chunk.content,
              model: 'text-embedding-3-small',
            }),
          });

          if (!embResponse.ok) {
            errors.push(`Failed to embed ${course.title} (${chunk.type})`);
            continue;
          }

          const embData = await embResponse.json();
          const embedding = embData.data?.[0]?.embedding;

          if (embedding) {
            // Upsert embedding
            await supabase
              .from('course_embeddings')
              .upsert({
                course_id: course.id,
                organization_id: orgId,
                chunk_index: chunk.index,
                content: chunk.content,
                content_type: chunk.type,
                language: detectLanguage(chunk.content),
                embedding: embedding,
              }, {
                onConflict: 'course_id,chunk_index,content_type,language',
              });

            embeddedCount++;
          }
        } catch (chunkError) {
          errors.push(`Error embedding ${course.title} (${chunk.type}): ${chunkError}`);
        }
      }
    }

    return NextResponse.json({
      message: `Embedded ${embeddedCount} chunks from ${courses.length} courses`,
      count: embeddedCount,
      courses: courses.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

// Simple Arabic detection based on Unicode range
function detectLanguage(text: string): string {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const arabicChars = (text.match(new RegExp(arabicRegex.source, 'g')) || []).length;
  return arabicChars > text.length * 0.3 ? 'ar' : 'en';
}
