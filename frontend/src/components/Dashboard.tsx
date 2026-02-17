import { useEffect, useState } from 'react'
import { VerificationResult, VerificationHistory } from '../types'
import { getVerifications } from '../services/api'
import VerificationCard from './VerificationCard'
import HistoryTable from './HistoryTable'

interface DashboardProps {
  verificationResult: VerificationResult | null
  onStartVerification: () => void
}

export default function Dashboard({ verificationResult, onStartVerification }: DashboardProps) {
  const [history, setHistory] = useState<VerificationHistory[]>([])
  const [loading, setLoading] = useState(false)
  const userId = localStorage.getItem('userId') || 'default-user-id' // In production, use auth

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    if (verificationResult) {
      loadHistory()
    }
  }, [verificationResult])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const verifications = await getVerifications(userId)
      setHistory(verifications)
    } catch (error) {
      console.error('Failed to load verification history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-2 text-gray-600">Monitor and manage signature verifications</p>
          </div>
          <button
            onClick={onStartVerification}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
          >
            Verify New Document
          </button>
        </div>
      </div>

      {/* Latest Result */}
      {verificationResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Latest Verification</h3>
          <VerificationCard result={verificationResult} />
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Verification History</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <HistoryTable verifications={history} />
        )}
      </div>
    </div>
  )
}

