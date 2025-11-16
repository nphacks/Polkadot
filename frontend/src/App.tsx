import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { TimelinePage } from './pages/TimelinePage'
import { SubmitEventPage } from './pages/SubmitEventPage'
import { EventDetailPage } from './pages/EventDetailPage'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-primary-50 dark:bg-slate-900 transition-colors">
              <Header />
              
              <main className="container mx-auto px-4 py-8 max-w-7xl">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/timeline/:timelineType" element={<TimelinePage />} />
                  <Route path="/submit" element={<SubmitEventPage />} />
                  <Route path="/event/:eventId" element={<EventDetailPage />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
