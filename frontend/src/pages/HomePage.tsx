import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Breadcrumb } from '../components/Breadcrumb'

export function HomePage() {
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(false)

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Welcome to HistoryDAO
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Connect your Polkadot wallet to start submitting historical events,
          voting on their accuracy, and participating in consensus-building.
        </p>
        
        {/* Collapsible Getting Started Section */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsGettingStartedOpen(!isGettingStartedOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
            aria-expanded={isGettingStartedOpen}
          >
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Getting Started
            </h3>
            <svg
              className={`w-5 h-5 text-blue-900 dark:text-blue-200 transition-transform ${
                isGettingStartedOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isGettingStartedOpen && (
            <div className="px-4 pb-4">
              <ol className="text-sm text-gray-800 dark:text-gray-200 space-y-1 list-decimal list-inside">
                <li>Install the Polkadot.js browser extension</li>
                <li>Create or import an account</li>
                <li>Click "Connect Wallet" in the top right</li>
                <li>Start exploring historical timelines</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/timeline/all"
          className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg shadow-sm border-2 border-primary-300 dark:border-primary-700 p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">📚</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Events
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            View all historical events from all timelines in chronological order
          </p>
        </Link>

        <Link
          to="/timeline/canonical"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Canonical
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Events with high community consensus (≥75% support)
          </p>
        </Link>

        <Link
          to="/timeline/disputed"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Disputed
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Events under active debate (26-74% support)
          </p>
        </Link>

        <Link
          to="/timeline/alternative"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alternative
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Alternative interpretations (≤25% support)
          </p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/submit"
            className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-center shadow-sm"
          >
            Submit New Event
          </Link>
          <Link
            to="/timeline/all"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center border border-gray-300 dark:border-gray-600"
          >
            View All Events
          </Link>
        </div>
      </div>
    </div>
  )
}
