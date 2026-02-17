import { VerificationResult } from '../types'
import ConfidenceGauge from './ConfidenceGauge'

interface VerificationCardProps {
  result: VerificationResult
}

export default function VerificationCard({ result }: VerificationCardProps) {
  return (
    <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Verification ID</h4>
          <p className="text-sm font-mono text-gray-900">{result.verification_id}</p>
          
          <h4 className="text-sm font-medium text-gray-500 mb-2 mt-4">Status</h4>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            result.status === 'success'
              ? 'bg-green-100 text-green-800'
              : result.status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {result.status.toUpperCase()}
          </span>
          
          <h4 className="text-sm font-medium text-gray-500 mb-2 mt-4">Timestamp</h4>
          <p className="text-sm text-gray-900">
            {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        
        <div className="flex items-center justify-center">
          <ConfidenceGauge score={result.confidence_score} />
        </div>
      </div>
    </div>
  )
}

