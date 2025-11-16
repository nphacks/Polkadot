import { Link, useLocation } from 'react-router-dom'

export function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const getBreadcrumbName = (segment: string) => {
    // Capitalize and format segment names
    if (segment === 'timeline') return 'Timeline'
    if (segment === 'canonical') return 'Canonical'
    if (segment === 'disputed') return 'Disputed'
    if (segment === 'alternative') return 'Alternative'
    if (segment === 'submit') return 'Submit Event'
    if (segment === 'event') return 'Event'
    
    // If it's a number (event ID), show it as is
    if (!isNaN(Number(segment))) return `#${segment}`
    
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  if (pathnames.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        Home
      </Link>
      {pathnames.map((segment, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1

        return (
          <div key={path} className="flex items-center space-x-2">
            <span className="text-gray-400 dark:text-gray-500">/</span>
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-medium">
                {getBreadcrumbName(segment)}
              </span>
            ) : (
              <Link
                to={path}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {getBreadcrumbName(segment)}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
