import { useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import { TimelineView } from '../components/TimelineView'
import type { TimelineViewType } from '../types'

export function TimelinePage() {
  const { timelineType } = useParams<{ timelineType: string }>()

  // Validate timeline type and default to 'all' if invalid
  const validTimelineTypes: TimelineViewType[] = ['all', 'canonical', 'disputed', 'alternative']
  const validatedTimelineType = validTimelineTypes.includes(timelineType as TimelineViewType)
    ? (timelineType as TimelineViewType)
    : 'all'

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <TimelineView initialTimeline={validatedTimelineType} />
    </div>
  )
}
