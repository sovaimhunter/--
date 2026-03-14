import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './RandomWheel.css'

interface Item {
  id: string
  label: string
}

interface Props {
  items: Item[]
}

const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
]

export default function RandomWheel({ items }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selected, setSelected] = useState<Item | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()

  const drawWheel = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 4
    const arc = (2 * Math.PI) / items.length

    ctx.clearRect(0, 0, size, size)

    items.forEach((item, i) => {
      const startAngle = i * arc
      const endAngle = startAngle + arc

      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = '13px system-ui'
      const label = item.label.length > 10 ? item.label.slice(0, 10) + '…' : item.label
      ctx.fillText(label, radius - 12, 5)
      ctx.restore()
    })
  }

  const handleSpin = () => {
    if (spinning || items.length === 0) return
    setSpinning(true)
    setSelected(null)

    const extraSpins = 5 + Math.random() * 5
    const targetAngle = extraSpins * 360 + Math.random() * 360
    setRotation((prev) => prev + targetAngle)

    setTimeout(() => {
      const finalAngle = (rotation + targetAngle) % 360
      const arc = 360 / items.length
      const index = Math.floor((360 - finalAngle) / arc) % items.length
      setSelected(items[index])
      setSpinning(false)
    }, 3000)
  }

  return (
    <div className="wheel-section">
      <div className="wheel-container">
        <div className="wheel-pointer">▼</div>
        <canvas
          ref={(canvas) => {
            canvasRef.current = canvas
            if (canvas) {
              canvas.width = 300
              canvas.height = 300
              drawWheel(canvas)
            }
          }}
          className="wheel-canvas"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        />
      </div>
      <div className="wheel-controls">
        <button
          className="btn-primary spin-btn"
          onClick={handleSpin}
          disabled={spinning || items.length === 0}
        >
          {spinning ? '抽取中...' : '随机抽题'}
        </button>
        {selected && (
          <div className="wheel-result">
            <span>抽到：<strong>{selected.label}</strong></span>
            <button className="btn-primary" onClick={() => navigate(`/algorithm/${selected.id}`)}>
              去做题
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
