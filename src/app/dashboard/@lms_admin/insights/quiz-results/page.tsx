import NavLMS from '@/hoc/nav-lms.hoc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck } from 'lucide-react'

export default function QuizResultsPage() {
  return (
    <div className="flex flex-col">
      <NavLMS data={[]}>
        <Card className="mx-auto max-w-lg mt-12">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Quiz analytics and detailed result breakdowns are coming soon.
              You will be able to view pass/fail rates, score distributions,
              and per-question analysis here.
            </p>
          </CardContent>
        </Card>
      </NavLMS>
    </div>
  )
}
