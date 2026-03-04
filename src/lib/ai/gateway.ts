// ============================================================================
// AI Gateway — Central provider factory with rate limiting
// ============================================================================
// All AI API routes go through this gateway to:
// 1. Read the org's AI config (with encrypted API key)
// 2. Decrypt the org's API key (or fall back to env vars)
// 3. Check rate limits before allowing the request
// 4. Return the correct AI SDK provider/model instance
// ============================================================================

import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { decryptApiKey } from './encryption';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface OrgAIConfigWithKey {
  id: number;
  organization_id: number;
  provider: string;
  model: string;
  api_key_encrypted: string | null;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  rate_limit_rpm: number;
  rate_limit_rpd: number;
  chat_enabled: boolean;
  search_enabled: boolean;
  recommendations_enabled: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  requests_minute: number;
  limit_minute: number;
  requests_day: number;
  limit_day: number;
}

export interface GatewayResult {
  config: OrgAIConfigWithKey;
  model: ReturnType<ReturnType<typeof createAnthropic>> | ReturnType<ReturnType<typeof createOpenAI>>;
  apiKey: string;
}

/**
 * Resolve the API key for a given provider.
 * Priority: org-specific encrypted key > environment variable.
 */
function resolveApiKey(provider: string, encryptedKey: string | null): string {
  // Try org-specific key first
  if (encryptedKey) {
    try {
      return decryptApiKey(encryptedKey);
    } catch (err) {
      console.warn('Failed to decrypt org API key, falling back to env var:', err);
    }
  }

  // Fall back to environment variables
  switch (provider) {
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || '';
    case 'openai':
      return process.env.OPENAI_API_KEY || '';
    case 'google':
      return process.env.GOOGLE_AI_API_KEY || '';
    default:
      return process.env.OPENAI_API_KEY || '';
  }
}

/**
 * Resolve the API key specifically for embedding operations.
 * Embeddings always use OpenAI (text-embedding-3-small), so we check for
 * an org key first, then fall back to OPENAI_API_KEY env var.
 */
export function resolveEmbeddingApiKey(config: OrgAIConfigWithKey | null): string {
  // If org has an OpenAI key stored (or their provider is openai), try decrypting it
  if (config?.api_key_encrypted && config.provider === 'openai') {
    try {
      return decryptApiKey(config.api_key_encrypted);
    } catch {
      // fall through
    }
  }

  // Fall back to env var (embeddings always use OpenAI)
  return process.env.OPENAI_API_KEY || '';
}

/**
 * Get the org AI config including the encrypted API key.
 */
export async function getOrgConfig(
  supabase: SupabaseClient
): Promise<OrgAIConfigWithKey | null> {
  const { data } = await supabase.rpc('get_org_ai_config_with_key');
  const config = Array.isArray(data) ? data[0] : data;
  return config || null;
}

/**
 * Check rate limits for the current user/org/endpoint.
 * Returns the rate limit status.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string
): Promise<RateLimitResult> {
  const { data } = await supabase.rpc('check_ai_rate_limit', {
    p_user_id: userId,
    p_endpoint: endpoint,
  });

  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    // If RPC fails (e.g., no config), allow by default
    return {
      allowed: true,
      requests_minute: 0,
      limit_minute: 30,
      requests_day: 0,
      limit_day: 500,
    };
  }

  return result as RateLimitResult;
}

/**
 * Log a usage event after a successful AI API call.
 */
export async function logUsage(
  supabase: SupabaseClient,
  endpoint: string,
  tokensUsed: number = 0
): Promise<void> {
  await supabase.rpc('log_ai_usage', {
    p_endpoint: endpoint,
    p_tokens_used: tokensUsed,
  });
}

/**
 * Main gateway entry point.
 * Reads org config, checks rate limits, returns the AI model instance.
 *
 * Throws an error with status info if rate limited or misconfigured.
 */
export async function getAIProvider(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string
): Promise<GatewayResult> {
  // 1. Get org config
  const config = await getOrgConfig(supabase);

  if (!config) {
    throw new GatewayError('AI is not configured for this organization', 403);
  }

  // 2. Check rate limits
  const rateLimit = await checkRateLimit(supabase, userId, endpoint);

  if (!rateLimit.allowed) {
    const isMinuteLimit = rateLimit.requests_minute >= rateLimit.limit_minute;
    const detail = isMinuteLimit
      ? `Rate limit exceeded: ${rateLimit.requests_minute}/${rateLimit.limit_minute} requests per minute`
      : `Daily limit exceeded: ${rateLimit.requests_day}/${rateLimit.limit_day} requests per day`;

    throw new GatewayError(detail, 429);
  }

  // 3. Resolve API key
  const provider = config.provider || 'anthropic';
  const modelName = config.model || 'claude-sonnet-4-5-20250929';
  const apiKey = resolveApiKey(provider, config.api_key_encrypted);

  if (!apiKey) {
    throw new GatewayError(
      'No API key configured. Set an org-level key or add the provider environment variable.',
      500
    );
  }

  // 4. Create provider instance
  let model;
  if (provider === 'openai') {
    const openai = createOpenAI({ apiKey });
    model = openai(modelName);
  } else {
    // Default to Anthropic for anthropic, google, jais, custom
    const anthropic = createAnthropic({ apiKey });
    model = anthropic(modelName);
  }

  return { config, model, apiKey };
}

/**
 * Platform-level AI model for authoring features (course generation, refinement).
 * Uses the platform's own ANTHROPIC_API_KEY — NOT the tenant's per-org config.
 * This keeps authoring costs on the platform and works even if the org has no AI config.
 */
export function getPlatformAIModel() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new GatewayError(
      'Platform AI key not configured (ANTHROPIC_API_KEY)',
      500
    );
  }

  const anthropic = createAnthropic({ apiKey });
  const modelId = process.env.PLATFORM_AI_MODEL || 'claude-sonnet-4-5-20250929';
  return {
    model: anthropic(modelId),
    modelId,
  };
}

/**
 * Custom error class with HTTP status code.
 */
export class GatewayError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

/**
 * Retry an async function with exponential backoff.
 * Retries on transient errors (network, 5xx, overloaded) only.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 2, baseDelay = 1000 }: { maxRetries?: number; baseDelay?: number } = {}
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Don't retry on non-transient errors
      if (err instanceof GatewayError && err.status < 500) throw err;
      if (attempt === maxRetries) throw err;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}
