"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react"

interface StrokeData {
  path: string
  duration: number
  delay: number
}

interface StrokeAnimationProps {
  character: string
  strokes: StrokeData[]
  size?: number
}

export default function StrokeAnimation({ character, strokes, size = 200 }: StrokeAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [animationProgress, setAnimationProgress] = useState(0)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  // Reset animation
  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentStroke(0)
    setAnimationProgress(0)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  // Play/Pause animation
  const toggleAnimation = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    } else {
      setIsPlaying(true)
      startTimeRef.current = Date.now()
      animate()
    }
  }

  // Animation loop
  const animate = () => {
    if (!startTimeRef.current) return

    const elapsed = Date.now() - startTimeRef.current
    const currentStrokeData = strokes[currentStroke]

    if (!currentStrokeData) {
      setIsPlaying(false)
      return
    }

    const strokeProgress = Math.min((elapsed - currentStrokeData.delay) / currentStrokeData.duration, 1)

    if (strokeProgress >= 0) {
      setAnimationProgress(strokeProgress)
    }

    if (strokeProgress >= 1) {
      if (currentStroke < strokes.length - 1) {
        setCurrentStroke((prev) => prev + 1)
        startTimeRef.current = Date.now()
      } else {
        setIsPlaying(false)
        return
      }
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }

  // Step controls
  const nextStroke = () => {
    if (currentStroke < strokes.length - 1) {
      setCurrentStroke((prev) => prev + 1)
      setAnimationProgress(0)
    }
  }

  const prevStroke = () => {
    if (currentStroke > 0) {
      setCurrentStroke((prev) => prev - 1)
      setAnimationProgress(0)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
      {/* Character Display */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-gray-800 mb-2">{character}</div>
        <div className="text-sm text-gray-600">
          Nét {currentStroke + 1} / {strokes.length}
        </div>
      </div>

      {/* SVG Animation Area */}
      <div className="flex justify-center mb-4">
        <svg width={size} height={size} viewBox="0 0 200 200" className="border border-gray-300 rounded-lg bg-gray-50">
          {/* Grid lines for practice */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#grid)" />

          {/* Center guidelines */}
          <line x1="100" y1="0" x2="100" y2="200" stroke="#d1d5db" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="#d1d5db" strokeWidth="1" strokeDasharray="5,5" />

          {/* Completed strokes */}
          {strokes.slice(0, currentStroke).map((stroke, index) => (
            <path
              key={`completed-${index}`}
              d={stroke.path}
              fill="none"
              stroke="#1f2937"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Current stroke being animated */}
          {strokes[currentStroke] && (
            <path
              d={strokes[currentStroke].path}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1000"
              strokeDashoffset={1000 * (1 - animationProgress)}
              style={{
                transition: isPlaying ? "none" : "stroke-dashoffset 0.3s ease",
              }}
            />
          )}

          {/* Upcoming strokes (faded) */}
          {strokes.slice(currentStroke + 1).map((stroke, index) => (
            <path
              key={`upcoming-${index}`}
              d={stroke.path}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5,5"
            />
          ))}
        </svg>
      </div>

      {/* Animation Controls */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={prevStroke}
          disabled={currentStroke === 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Nét trước"
        >
          <SkipBack size={16} />
        </button>

        <button
          onClick={toggleAnimation}
          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          title={isPlaying ? "Tạm dừng" : "Phát"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={nextStroke}
          disabled={currentStroke === strokes.length - 1}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Nét tiếp theo"
        >
          <SkipForward size={16} />
        </button>

        <button
          onClick={resetAnimation}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Đặt lại"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentStroke + animationProgress) / strokes.length) * 100}%`,
          }}
        />
      </div>

      {/* Stroke Information */}
      <div className="text-center text-sm text-gray-600">
        <p>Tiến độ: {Math.round(((currentStroke + animationProgress) / strokes.length) * 100)}%</p>
      </div>
    </div>
  )
}
