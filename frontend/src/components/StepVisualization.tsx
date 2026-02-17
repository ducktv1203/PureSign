import { VerificationResult } from '../types'

interface StepVisualizationProps {
  result: VerificationResult
}

export default function StepVisualization({ result }: StepVisualizationProps) {
  const steps = [
    {
      title: 'Detected',
      description: 'Signature detected by YOLO',
      imageUrl: result.detected_sig_url,
      status: result.detected_sig_url ? 'success' : 'pending'
    },
    {
      title: 'Purified',
      description: 'Background artifacts removed by CycleGAN',
      imageUrl: result.cleaned_sig_url,
      status: result.cleaned_sig_url ? 'success' : 'pending'
    },
    {
      title: 'Result',
      description: 'Verification complete',
      status: result.status
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {steps.map((step, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
              step.status === 'success' 
                ? 'bg-green-100 text-green-700' 
                : step.status === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {index + 1}
            </div>
            <h4 className="font-semibold text-gray-900">{step.title}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">{step.description}</p>
          {step.imageUrl ? (
            <div className="aspect-square bg-gray-100 rounded overflow-hidden">
              <img
                src={step.imageUrl}
                alt={step.title}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          {step.status && (
            <div className={`mt-3 text-xs font-medium px-2 py-1 rounded inline-block ${
              step.status === 'success'
                ? 'bg-green-100 text-green-700'
                : step.status === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {step.status.toUpperCase()}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

