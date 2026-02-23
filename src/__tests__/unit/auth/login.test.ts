import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabase } from '../../helpers/supabase.mock'

// Mock the Supabase server client
const mockSupabase = createMockSupabase()
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

// Import after mocks are set up
const { loginAuth } = await import('@/action/authAction')

function formData(fields: Record<string, string>) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v))
  return fd
}

describe('loginAuth — Zod validation', () => {
  it('rejects empty email', async () => {
    const result = await loginAuth(null, formData({ email: '', password: 'password123' }))
    expect(result).toContain('email')
  })

  it('rejects invalid email format', async () => {
    const result = await loginAuth(null, formData({ email: 'not-email', password: 'password123' }))
    expect(result).toContain('email')
  })

  it('rejects short password (< 6 chars)', async () => {
    const result = await loginAuth(null, formData({ email: 'user@test.com', password: '12345' }))
    expect(result).toContain('6 characters')
  })
})

describe('loginAuth — organization membership check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up env to trigger org check
    process.env.NEXT_PUBLIC_MAIN_DOMIAN = 'main.example.com'
    process.env.NEXT_PUBLIC_MAIN_DOMIAN_DEV = 'dev.example.com'
  })

  it('returns access error when user is not in the organization', async () => {
    mockSupabase.rpc.mockImplementation((name: string) => {
      if (name === 'check_if_user_exists_under_organization') {
        return { data: null, error: null }
      }
      return { data: null, error: null }
    })

    const result = await loginAuth(
      null,
      formData({ email: 'user@test.com', password: 'password123' })
    )
    expect(result).toContain("don't have access")
  })

  it('returns access error when org check RPC fails', async () => {
    mockSupabase.rpc.mockImplementation((name: string) => {
      if (name === 'check_if_user_exists_under_organization') {
        return { data: null, error: { message: 'RPC error' } }
      }
      return { data: null, error: null }
    })

    const result = await loginAuth(
      null,
      formData({ email: 'user@test.com', password: 'password123' })
    )
    expect(result).toContain("don't have access")
  })
})

describe('loginAuth — Supabase auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Use main domain so org check is skipped
    process.env.NEXT_PUBLIC_MAIN_DOMIAN = 'test.jadarat-lms-2026.vercel.app'
  })

  it('returns "Invalid credentials" when auth fails', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    const result = await loginAuth(
      null,
      formData({ email: 'user@test.com', password: 'wrongpassword' })
    )
    expect(result).toBe('Invalid credentials.')
  })

  it('returns "Invalid credentials" when no user is returned', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    })

    const result = await loginAuth(
      null,
      formData({ email: 'user@test.com', password: 'password123' })
    )
    expect(result).toBe('Invalid credentials.')
  })
})
