import { VerificationHistory } from '../types'

interface HistoryTableProps {
  verifications: VerificationHistory[]
}

export default function HistoryTable({ verifications }: HistoryTableProps) {
  if (verifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No verification history yet. Start by verifying a document.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {verifications.map((verification) => (
            <tr key={verification.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(verification.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  verification.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : verification.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {verification.status.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {verification.confidence_score !== null && verification.confidence_score !== undefined
                  ? `${Math.round(verification.confidence_score * 100)}%`
                  : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {verification.cleaned_sig_url && (
                  <a
                    href={verification.cleaned_sig_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-900"
                  >
                    View
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

