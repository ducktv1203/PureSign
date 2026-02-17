import { useState } from 'react'
import Dashboard from './components/Dashboard'
import VerificationFlow from './components/VerificationFlow'
import { VerificationResult } from './types'

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'verify'>('dashboard')
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">PureSign</h1>
              <span className="ml-2 text-sm text-gray-500">AI Signature Verification</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentView === 'dashboard'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('verify')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  currentView === 'verify'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Verify Document
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard 
            verificationResult={verificationResult}
            onStartVerification={() => setCurrentView('verify')}
          />
        ) : (
          <VerificationFlow
            onComplete={(result) => {
              setVerificationResult(result)
              setCurrentView('dashboard')
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
      </main>
    </div>
  )
}

export default App

