import { vi } from 'vitest'

/**
 * Creates a chainable Supabase mock that supports:
 * - supabase.rpc(name, params)
 * - supabase.auth.signInWithPassword(...)
 * - supabase.auth.getUser()
 * - supabase.auth.signUp(...)
 * - supabase.from(table).select(...).eq(...).single()
 */
export function createMockSupabase(overrides: {
  rpc?: Record<string, { data?: any; error?: any; count?: number | null }>
  auth?: {
    signInWithPassword?: { data?: any; error?: any }
    getUser?: { data?: any; error?: any }
    signUp?: { data?: any; error?: any }
  }
  from?: Record<string, { data?: any; error?: any }>
} = {}) {
  const rpcMock = vi.fn().mockImplementation((name: string, params?: any) => {
    const result = overrides.rpc?.[name] ?? { data: null, error: null }
    return {
      ...result,
      range: vi.fn().mockReturnValue(result),
    }
  })

  const fromChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => {
      return { data: null, error: null }
    }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }

  const fromMock = vi.fn().mockImplementation((table: string) => {
    const result = overrides.from?.[table]
    if (result) {
      fromChain.single = vi.fn().mockReturnValue(result)
    }
    return fromChain
  })

  return {
    rpc: rpcMock,
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(
        overrides.auth?.signInWithPassword ?? { data: { user: null, session: null }, error: null }
      ),
      getUser: vi.fn().mockResolvedValue(
        overrides.auth?.getUser ?? { data: { user: null }, error: null }
      ),
      signUp: vi.fn().mockResolvedValue(
        overrides.auth?.signUp ?? { data: { user: null, session: null }, error: null }
      ),
    },
    from: fromMock,
    _fromChain: fromChain,
  }
}
