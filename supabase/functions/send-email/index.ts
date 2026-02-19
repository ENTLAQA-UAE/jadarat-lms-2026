// @ts-nocheck

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { serve } from 'https://deno.land/std@0.114.0/http/server.ts';

console.log('Hello from `resend` function!');

type User = Database['public']['Tables']['users']['Row'];
type Course = Database['public']['Tables']['courses']['Row'] & {
  slug: string;
  organization_id: string;
};

type CourseRecord = Database['public']['Tables']['user_courses']['Row'];
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: null | CourseRecord;
  schema: 'public';
  old_record: null | CourseRecord;
}

async function getUserById(userId: string): Promise<User | null> {
  const response = await fetch(
    `https://brfxdvhnrvldmtbldmzl.supabase.co/rest/v1/users?id=eq.${userId}&select=*`,
    {
      headers: {
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const users = await response.json();
  console.log(users);
  return users.length > 0 ? users[0] : null;
}

async function getCourseById(courseId: string): Promise<Course | null> {
  const response = await fetch(
    `https://brfxdvhnrvldmtbldmzl.supabase.co/rest/v1/courses?id=eq.${courseId}&select=*,slug,organization_id`,
    {
      headers: {
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const courses = await response.json();
  console.log(courses);
  return courses.length > 0 ? courses[0] : null;
}

async function getHtmlTemplate(): Promise<string> {
  const response = await fetch(
    'https://brfxdvhnrvldmtbldmzl.supabase.co/storage/v1/object/sign/Emails/enrollmentTemplete.html?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJFbWFpbHMvZW5yb2xsbWVudFRlbXBsZXRlLmh0bWwiLCJpYXQiOjE3MjYwNjM5MzcsImV4cCI6MjYwOTA3MTkzN30.KddLVNTfq4MZm5Ga6EQXCOjEf9vBGBJgbRueNbaGVeQ&t=2024-09-11T14%3A12%3A17.693Z',
    {
      headers: {
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      },
    }
  );
  const htmlTemplate = await response.text();
  return htmlTemplate;
}

// New function to get organization domain
async function getOrganizationDomain(
  organizationId: string
): Promise<string | null> {
  const response = await fetch(
    `https://brfxdvhnrvldmtbldmzl.supabase.co/rest/v1/organization?id=eq.${organizationId}&select=domain`,
    {
      headers: {
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const organizations = await response.json();
  return organizations.length > 0 ? organizations[0].domain : null;
}

serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const newUserCourse = payload.record;
  console.log(newUserCourse);
  if (newUserCourse) {
    // Get user data
    const user = await getUserById(newUserCourse.user_id);
    // Get course data
    const course = await getCourseById(newUserCourse.course_id);

    if (user && course) {
      // Get organization domain
      const orgDomain = await getOrganizationDomain(course.organization_id);

      if (!orgDomain) {
        console.error('Organization domain not found.');
        return new Response('Organization domain not found', { status: 404 });
      }

      // Construct the full course URL
      const courseUrl = `https://${orgDomain}/dashboard/course/${course.slug}`;

      // Read the HTML template from the file
      const htmlTemplate = await getHtmlTemplate();

      // Replace placeholders in the template
      const htmlContent = htmlTemplate
        .replace('{{ courseName }}', course.title)
        .replace('{{ courseUrl }}', courseUrl);

      // Send email to the user
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        },
        body: JSON.stringify({
          from: 'ENTLAQA LMS <noreply@lms.entlaqa.com>',
          to: [user.email],
          subject: `Thank You for Enrolling in ${course.title}`,
          html: htmlContent,
        }),
      });

      const data = await res.json();
      console.log({ data });
    } else {
      console.error('User or course not found.');
    }
  } else {
    console.error('No new user course found in payload.');
  }

  return new Response('ok');
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/