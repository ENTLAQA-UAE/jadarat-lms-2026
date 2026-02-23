import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabase } from '../../helpers/supabase.mock'

const mockSupabase = createMockSupabase()
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

const {
  enrollmentsActivity,
  getAllEnrollments,
  getEnrollmentsOptions,
} = await import('@/action/lms-admin/enrollments/enrollmentsActions')

describe('enrollmentsActivity', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls RPC with correct pagination and filters', async () => {
    const mockData = [{ id: 1, name: 'User A' }]
    mockSupabase.rpc.mockReturnValue({
      data: mockData,
      error: null,
      count: 1,
      range: vi.fn().mockReturnValue({ data: mockData, error: null, count: 1 }),
    })

    const result = await enrollmentsActivity(1, 10, {
      _name: 'test',
      _course: null,
      _department: null,
      _group_name: null,
      _start_date: null,
      _end_date: null,
      _enrollment_status: null,
    })

    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_enrollment_activity',
      expect.objectContaining({ _name: 'test' }),
      { count: 'exact' }
    )
    expect(result.loading).toBe(false)
    expect(result.data).toEqual(mockData)
  })

  it('handles RPC errors gracefully', async () => {
    mockSupabase.rpc.mockReturnValue({
      data: null,
      error: { message: 'Database error' },
      count: null,
      range: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'Database error' },
        count: null,
      }),
    })

    const result = await enrollmentsActivity(1, 10)

    expect(result.loading).toBe(false)
    expect(result.errorMessage).toContain('Database error')
    expect(result.data).toEqual([])
  })
})

describe('getAllEnrollments', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches all enrollments with null filters', async () => {
    const mockData = [{ id: 1 }, { id: 2 }]
    mockSupabase.rpc.mockReturnValueOnce({ data: mockData, error: null })

    const result = await getAllEnrollments()
    expect(result.data).toEqual(mockData)
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_enrollment_activity',
      expect.objectContaining({
        _name: null,
        _course: null,
        _department: null,
      })
    )
  })

  it('throws on RPC error', async () => {
    mockSupabase.rpc.mockReturnValueOnce({
      data: null,
      error: { message: 'Connection failed' },
    })

    await expect(getAllEnrollments()).rejects.toThrow('Connection failed')
  })
})

describe('getEnrollmentsOptions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches enrollment options', async () => {
    const options = { courses: [{ id: 1, name: 'AI 101' }] }
    mockSupabase.rpc.mockReturnValueOnce({ data: options, error: null })

    const result = await getEnrollmentsOptions()
    expect(result.data).toEqual(options)
  })

  it('throws on RPC error', async () => {
    mockSupabase.rpc.mockReturnValueOnce({
      data: null,
      error: { message: 'RPC not found' },
    })

    await expect(getEnrollmentsOptions()).rejects.toThrow('RPC not found')
  })
})
