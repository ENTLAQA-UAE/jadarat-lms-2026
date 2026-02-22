import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrgConfig, checkRateLimit, logUsage, resolveEmbeddingApiKey } from '@/lib/ai/gateway';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get user's org
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orgId = userData.organization_id;

    // Get org AI config via gateway
    const config = await getOrgConfig(supabase);

    // Check rate limits for search
    const rateLimit = await checkRateLimit(supabase, user.id, 'search');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Strategy 1: Text-based search (always available, fast)
    const { data: textResults } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        thumbnail,
        level,
        categories!inner(name)
      `)
      .eq('organization_id', orgId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);

    // Strategy 2: If embeddings exist and search is enabled, do semantic search
    let semanticResults: Array<{
      course_id: number;
      title: string;
      description: string;
      thumbnail: string | null;
      category_name: string | null;
      level: string;
      similarity: number;
      matched_content: string;
      content_type: string;
    }> = [];

    if (config?.search_enabled) {
      // Resolve embedding API key from org config (with env var fallback)
      const embeddingApiKey = resolveEmbeddingApiKey(config);

      if (embeddingApiKey) {
        try {
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${embeddingApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: query,
              model: 'text-embedding-3-small',
            }),
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            const queryEmbedding = embeddingData.data?.[0]?.embedding;

            if (queryEmbedding) {
              const { data: semResults } = await supabase.rpc('semantic_search_courses', {
                p_query_embedding: queryEmbedding,
                p_org_id: orgId,
                p_limit: 10,
                p_similarity_threshold: 0.3,
              });

              if (semResults) {
                semanticResults = semResults;
              }
            }
          }
        } catch (embError) {
          console.error('Embedding generation failed, falling back to text search:', embError);
        }
      }
    }

    // Log usage
    await logUsage(supabase, 'search');

    // Merge and deduplicate results (semantic first, then text)
    const seenIds = new Set<number>();
    const mergedResults: Array<{
      course_id: number;
      title: string;
      description: string;
      thumbnail: string | null;
      category_name: string | null;
      level: string;
      similarity: number;
      source: 'semantic' | 'text';
    }> = [];

    // Add semantic results first (higher quality)
    for (const sr of semanticResults) {
      seenIds.add(sr.course_id);
      mergedResults.push({
        course_id: sr.course_id,
        title: sr.title,
        description: sr.description,
        thumbnail: sr.thumbnail,
        category_name: sr.category_name,
        level: sr.level,
        similarity: sr.similarity,
        source: 'semantic',
      });
    }

    // Add text results that aren't already in semantic results
    if (textResults) {
      for (const tr of textResults) {
        if (!seenIds.has(tr.id)) {
          seenIds.add(tr.id);
          mergedResults.push({
            course_id: tr.id,
            title: tr.title,
            description: tr.description,
            thumbnail: tr.thumbnail,
            category_name: (tr.categories as unknown as { name: string } | null)?.name || null,
            level: tr.level,
            similarity: 0,
            source: 'text',
          });
        }
      }
    }

    return NextResponse.json({
      results: mergedResults,
      total: mergedResults.length,
      has_semantic: semanticResults.length > 0,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}
