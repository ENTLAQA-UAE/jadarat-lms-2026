import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabase } from '../../helpers/supabase.mock'

const mockSupabase = createMockSupabase()
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

const { EnrolToCourse } = await import('@/action/leaner/enrolToCourse')
const { revalidatePath } = await import('next/cache')

describe('EnrolToCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully enrols a user and revalidates the path', async () => {
    mockSupabase.rpc.mockReturnValueOnce({ data: null, error: null })

    const result = await EnrolToCourse(42, 'intro-to-ai')

    expect(mockSupabase.rpc).toHaveBeenCalledWith('enrol_to_course', {
      course_input_id: 42,
    })
    expect(result).toEqual({ data: null, error: null })
    expect(revalidatePath).toHaveBeenCalledWith(
      '/dashboard/course/intro-to-ai',
      'page'
    )
  })

  it('returns error message when RPC fails', async () => {
    mockSupabase.rpc.mockReturnValueOnce({
      data: null,
      error: { message: 'Already enrolled' },
    })

    const result = await EnrolToCourse(42, 'intro-to-ai')

    expect(result).toEqual({ error: 'Already enrolled' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('passes the correct course_id to the RPC', async () => {
    mockSupabase.rpc.mockReturnValueOnce({ data: null, error: null })

    await EnrolToCourse(999, 'advanced-ml')

    expect(mockSupabase.rpc).toHaveBeenCalledWith('enrol_to_course', {
      course_input_id: 999,
    })
  })
})
