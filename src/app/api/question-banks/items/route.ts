import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/question-banks/items?bank_id=...&type=...&difficulty=...
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bankId = searchParams.get('bank_id');
    const blockType = searchParams.get('type') || null;
    const difficulty = searchParams.get('difficulty') || null;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!bankId) {
      return NextResponse.json({ error: 'bank_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('get_bank_questions', {
      p_bank_id: bankId,
      p_block_type: blockType,
      p_difficulty: difficulty,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;

    return NextResponse.json({ items: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/question-banks/items - Add question to a bank
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bank_id, block_type, block_data, difficulty, tags, points } = body;

    if (!bank_id || !block_type || !block_data) {
      return NextResponse.json(
        { error: 'bank_id, block_type, and block_data are required' },
        { status: 400 }
      );
    }

    const validTypes = [
      'multiple_choice', 'true_false', 'multiple_response',
      'fill_in_blank', 'matching', 'sorting',
    ];
    if (!validTypes.includes(block_type)) {
      return NextResponse.json(
        { error: `Invalid block_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('question_bank_items')
      .insert({
        bank_id,
        block_type,
        block_data,
        difficulty: difficulty || 'medium',
        tags: tags || [],
        points: points || 1,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/question-banks/items - Update a question
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, block_data, difficulty, tags, points } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (block_data !== undefined) updates.block_data = block_data;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (tags !== undefined) updates.tags = tags;
    if (points !== undefined) updates.points = points;

    const { data, error } = await supabase
      .from('question_bank_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/question-banks/items - Archive a question
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('question_bank_items')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
