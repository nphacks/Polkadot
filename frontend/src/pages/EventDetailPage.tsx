import { useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import { EventDetail } from '../components/EventDetail'

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()

  if (!eventId) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600">Event not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <EventDetail eventId={eventId} />
    </div>
  )
}
