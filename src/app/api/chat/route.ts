import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { streamText, createUIMessageStreamResponse } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { message, conversationId } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 });
    }

    // Get org AI config
    const { data: configs } = await supabase.rpc('get_org_ai_config');
    const config = Array.isArray(configs) ? configs[0] : configs;

    if (!config?.chat_enabled) {
      return new Response('AI Chat is not enabled for this organization', { status: 403 });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: conv } = await supabase.rpc('create_ai_conversation', {
        p_title: null,
      });
      const convResult = Array.isArray(conv) ? conv[0] : conv;
      convId = convResult?.id;
    }

    // Save user message
    if (convId) {
      await supabase.rpc('save_ai_message', {
        p_conversation_id: convId,
        p_role: 'user',
        p_content: message,
      });
    }

    // Get conversation history for context
    let previousMessages: { role: 'user' | 'assistant'; content: string }[] = [];
    if (convId) {
      const { data: messages } = await supabase.rpc('get_ai_messages', {
        p_conversation_id: convId,
      });
      if (messages && Array.isArray(messages)) {
        previousMessages = messages
          .filter((m: { role: string }) => m.role !== 'system')
          .slice(-10) // last 10 messages for context
          .map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));
      }
    }

    // Get RAG context (enrolled courses, available courses)
    const { data: contextRows } = await supabase.rpc('get_ai_chat_context', {
      p_user_id: user.id,
    });
    let ragContext = '';
    if (contextRows && Array.isArray(contextRows)) {
      ragContext = contextRows
        .map((r: { context_type: string; content: string }) => r.content)
        .join('\n');
    }

    // Build system prompt with RAG context
    const systemPrompt = `${config.system_prompt || 'You are a helpful learning assistant.'}

## Learner Context
${ragContext || 'No course data available yet.'}

## Instructions
- Answer questions about courses, learning progress, and recommendations
- If asked about specific courses, use the context above
- Always be helpful, encouraging, and supportive of the learner's goals
- Respond in the same language as the user's question (Arabic or English)
- Keep responses concise and actionable`;

    // Create provider based on config
    const provider = config.provider || 'anthropic';
    const modelName = config.model || 'claude-sonnet-4-5-20250929';

    let model;
    if (provider === 'openai') {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
      });
      model = openai(modelName);
    } else {
      // Default to Anthropic
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });
      model = anthropic(modelName);
    }

    // Stream the response
    const result = streamText({
      model,
      system: systemPrompt,
      messages: [
        ...previousMessages.slice(0, -1), // history (excluding current message which is the last)
        { role: 'user', content: message },
      ],
      temperature: config.temperature || 0.7,
      onFinish: async ({ text }) => {
        // Save assistant response
        if (convId) {
          await supabase.rpc('save_ai_message', {
            p_conversation_id: convId,
            p_role: 'assistant',
            p_content: text,
            p_model: modelName,
          });
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'X-Conversation-Id': String(convId || ''),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
