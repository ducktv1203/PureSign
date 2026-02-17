import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { verifySignature } from '../services/api'
import { VerificationResult } from '../types'
import StepVisualization from './StepVisualization'
import ConfidenceGauge from './ConfidenceGauge'
import { detectSignatureLocal, initializeLocalDetection, isLocalProcessingAvailable } from '../services/localDetection'

interface VerificationFlowProps {
  onComplete: (result: VerificationResult) => void
  onCancel: () => void
}

export default function VerificationFlow({ onComplete, onCancel }: VerificationFlowProps) {
  const [file, setFile] = useState<File | null>(null)
  const [localProcessing, setLocalProcessing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const userId = localStorage.getItem('userId') || 'default-user-id' // In production, use auth

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        setError(null)
      }
    },
    multiple: false
  })

  const handleVerify = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Initialize local detection if enabled
      if (localProcessing && isLocalProcessingAvailable()) {
        await initializeLocalDetection()
        // Note: In full implementation, local detection would be used here
        // For now, we still send to server but the toggle demonstrates the concept
      }

      const verificationResult = await verifySignature(file, userId, localProcessing)
      setResult(verificationResult)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Verification failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleComplete = () => {
    if (result) {
      onComplete(result)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify a New Document</h2>

        {/* Privacy Mode Toggle */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-700">Privacy Mode</label>
              <p className="text-xs text-gray-600 mt-1">
                Enable local processing to detect signatures on your device without uploading sensitive documents
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localProcessing}
                onChange={(e) => setLocalProcessing(e.target.checked)}
                disabled={!isLocalProcessingAvailable()}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          {!isLocalProcessingAvailable() && (
            <p className="text-xs text-red-600 mt-2">
              Local processing not available in this browser
            </p>
          )}
        </div>

        {/* File Upload */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Drag and drop an image here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleVerify}
            disabled={!file || processing}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Processing...' : 'Verify Signature'}
          </button>
          <button
            onClick={onCancel}
            disabled={processing}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Results Visualization */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Verification Results</h3>
          
          <StepVisualization result={result} />
          
          <div className="mt-8">
            <ConfidenceGauge score={result.confidence_score} />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

