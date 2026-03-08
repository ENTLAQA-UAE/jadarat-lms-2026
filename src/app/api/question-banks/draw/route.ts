import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST /api/question-banks/draw - Draw random questions from banks for quiz use
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bank_refs } = body as {
      bank_refs: {
        bank_id: string;
        draw_count: number;
        block_type_filter?: string;
        difficulty_filter?: string;
      }[];
    };

    if (!bank_refs || !Array.isArray(bank_refs) || bank_refs.length === 0) {
      return NextResponse.json(
        { error: 'bank_refs array is required' },
        { status: 400 }
      );
    }

    // Draw from each bank in parallel
    const drawResults = await Promise.all(
      bank_refs.map(async (ref) => {
        const { data, error } = await supabase.rpc('draw_random_questions', {
          p_bank_id: ref.bank_id,
          p_count: ref.draw_count,
          p_block_type: ref.block_type_filter || null,
          p_difficulty: ref.difficulty_filter || null,
        });

        if (error) throw error;
        return data ?? [];
      })
    );

    // Flatten and increment usage counts
    const allQuestions = drawResults.flat();

    // Batch update usage_count for drawn questions
    const drawnIds = allQuestions.map((q: { id: string }) => q.id);
    if (drawnIds.length > 0) {
      await supabase.rpc('increment_question_usage', { p_item_ids: drawnIds }).catch(() => {
        // Non-critical, don't fail the draw if usage tracking fails
      });
    }

    return NextResponse.json({ questions: allQuestions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
