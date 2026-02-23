import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabase } from '../../helpers/supabase.mock'

const mockSupabase = createMockSupabase()
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

const { fetchUserData } = await import('@/action/authAction')

describe('fetchUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user data on successful RPC call', async () => {
    const userData = { user_role: 'learner', is_active: true }
    mockSupabase.rpc.mockReturnValueOnce({
      data: [userData],
      error: null,
    })

    const result = await fetchUserData()
    expect(result).toEqual(userData)
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_role')
  })

  it('returns null when RPC returns error', async () => {
    mockSupabase.rpc.mockReturnValueOnce({
      data: null,
      error: { message: 'RPC error' },
    })

    const result = await fetchUserData()
    expect(result).toBeNull()
  })

  it('returns null when RPC returns empty array', async () => {
    mockSupabase.rpc.mockReturnValueOnce({
      data: [],
      error: null,
    })

    const result = await fetchUserData()
    expect(result).toBeNull()
  })

  it('returns null when RPC returns null data', async () => {
    mockSupabase.rpc.mockReturnValueOnce({
      data: null,
      error: null,
    })

    const result = await fetchUserData()
    expect(result).toBeNull()
  })
})
