import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if recommendations are enabled
    const { data: configs } = await supabase.rpc('get_org_ai_config');
    const config = Array.isArray(configs) ? configs[0] : configs;

    if (config && !config.recommendations_enabled) {
      return NextResponse.json({ recommendations: [], enabled: false });
    }

    // Check for cached recommendations
    const { data: cached } = await supabase.rpc('get_learner_recommendations', {
      p_limit: 10,
    });

    if (cached && Array.isArray(cached) && cached.length > 0) {
      return NextResponse.json({
        recommendations: cached,
        enabled: true,
        cached: true,
      });
    }

    // Generate new recommendations
    await supabase.rpc('generate_recommendations', {
      p_user_id: user.id,
    });

    // Fetch freshly generated recommendations
    const { data: fresh } = await supabase.rpc('get_learner_recommendations', {
      p_limit: 10,
    });

    return NextResponse.json({
      recommendations: fresh || [],
      enabled: true,
      cached: false,
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// POST: Force-refresh recommendations
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Regenerate
    await supabase.rpc('generate_recommendations', {
      p_user_id: user.id,
    });

    const { data: fresh } = await supabase.rpc('get_learner_recommendations', {
      p_limit: 10,
    });

    return NextResponse.json({
      recommendations: fresh || [],
      refreshed: true,
    });
  } catch (error) {
    console.error('Recommendations refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh recommendations' },
      { status: 500 }
    );
  }
}
