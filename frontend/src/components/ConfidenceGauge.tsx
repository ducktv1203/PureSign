import { useEffect, useRef } from 'react'

interface ConfidenceGaugeProps {
  score: number // 0-1
}

export default function ConfidenceGauge({ score }: ConfidenceGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const percentage = Math.round(score * 100)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 80
    const startAngle = Math.PI
    const endAngle = 0

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false)
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 20
    ctx.lineCap = 'round'
    ctx.stroke()

    // Draw score arc
    const scoreAngle = startAngle + (endAngle - startAngle) * score
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, scoreAngle, false)
    
    // Color based on score
    let color = '#ef4444' // red
    if (score >= 0.7) color = '#10b981' // green
    else if (score >= 0.5) color = '#f59e0b' // yellow
    
    ctx.strokeStyle = color
    ctx.lineWidth = 20
    ctx.lineCap = 'round'
    ctx.stroke()

    // Draw percentage text
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${percentage}%`, centerX, centerY - 10)

    ctx.fillStyle = '#6b7280'
    ctx.font = '14px Arial'
    ctx.fillText('Match Score', centerX, centerY + 20)
  }, [score, percentage])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={240}
        height={140}
        className="mb-4"
      />
      <div className={`text-lg font-semibold ${
        score >= 0.7 ? 'text-green-600' : score >= 0.5 ? 'text-yellow-600' : 'text-red-600'
      }`}>
        {score >= 0.7 ? 'Verified ✓' : score >= 0.5 ? 'Uncertain' : 'Failed ✗'}
      </div>
    </div>
  )
}

