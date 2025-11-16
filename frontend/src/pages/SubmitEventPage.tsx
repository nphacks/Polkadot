import { Breadcrumb } from '../components/Breadcrumb'
import { EventSubmission } from '../components/EventSubmission'

export function SubmitEventPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb />
      <EventSubmission />
    </div>
  )
}
