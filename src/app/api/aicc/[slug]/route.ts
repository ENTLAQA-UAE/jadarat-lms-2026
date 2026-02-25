import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const formData = await request.formData()
    const command = formData.get('command')
    const sessionId = formData.get('session_id')
    const aiccData = formData.get('aicc_data')

    // Standard AICC response header
    const headers = {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
    }

    // Handle different AICC commands
    switch (command) {
      case 'GetParam':
        return new NextResponse(
          [
            'error=0',
            'error_text=Successful',
            'aicc_data=',
            'student_id=1',
            'student_name=Test Student',
            'lesson_location=',
            'credit=credit',
            'lesson_status=incomplete',
            'score=0',
            'time=00:00:00',
            'lesson_mode=normal',
            'course_id=' + params.slug,
          ].join('\n'),
          { headers }
        )

      case 'PutParam':
        // Handle saving AICC data
        return new NextResponse('error=0\nerror_text=Successful', { headers })

      case 'ExitAU':
        return new NextResponse('error=0\nerror_text=Successful', { headers })

      default:
        return new NextResponse(
          'error=1\nerror_text=Unknown command',
          { headers, status: 400 }
        )
    }
  } catch (error) {
    console.error('AICC API Error:', error)
    return new NextResponse(
      'error=1\nerror_text=Internal server error',
      { status: 500 }
    )
  }
}

// Also allow OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 