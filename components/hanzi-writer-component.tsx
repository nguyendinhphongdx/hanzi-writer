"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react"

interface HanziWriterComponentProps {
  character: string
  size?: number
}

// Declare HanziWriter type for TypeScript
declare global {
  interface Window {
    HanziWriter: any
  }
}

export default function HanziWriterComponent({ character, size = 300 }: HanziWriterComponentProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [totalStrokes, setTotalStrokes] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Load HanziWriter library
  useEffect(() => {
    const loadHanziWriter = async () => {
      if (typeof window !== "undefined" && !window.HanziWriter) {
        try {
          // Load HanziWriter from CDN
          const script = document.createElement("script")
          script.src = "https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js"
          script.onload = () => {
            setIsLoaded(true)
          }
          script.onerror = () => {
            setError("Không thể tải thư viện HanziWriter / Failed to load HanziWriter library")
          }
          document.head.appendChild(script)
        } catch (err) {
          setError("Lỗi khi tải thư viện / Error loading library")
        }
      } else if (window.HanziWriter) {
        setIsLoaded(true)
      }
    }

    loadHanziWriter()
  }, [])

  // Initialize HanziWriter when loaded
  useEffect(() => {
    if (isLoaded && targetRef.current && character) {
      initializeWriter()
    }

    return () => {
      if (writerRef.current) {
        writerRef.current = null
      }
    }
  }, [isLoaded, character])

  const initializeWriter = async () => {
    if (!targetRef.current || !window.HanziWriter) return

    try {
      // Clear previous content
      targetRef.current.innerHTML = ""

      // Create new HanziWriter instance
      writerRef.current = window.HanziWriter.create(targetRef.current, character, {
        width: size,
        height: size,
        padding: 20,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
        strokeColor: "#2563eb",
        radicalColor: "#dc2626",
        outlineColor: "#e5e7eb",
        drawingColor: "#059669",
        showCharacter: false,
        showOutline: true,
        showHintAfterMisses: 3,
      })

      // Get stroke count ─ use the static helper instead of an instance method
      const charData = await window.HanziWriter.loadCharacterData(character)
      const strokeCount = charData.strokes.length

      setTotalStrokes(strokeCount as number)
      setCurrentStroke(0)
      setError(null)
    } catch (err) {
      console.error("Error initializing HanziWriter:", err)
      setError("Không thể tải dữ liệu chữ Hán / Cannot load character data")
    }
  }

  // Animation controls
  const startAnimation = () => {
    if (!writerRef.current) return

    setIsAnimating(true)
    writerRef.current
      .animateCharacter({
        onComplete: () => {
          setIsAnimating(false)
          setCurrentStroke(totalStrokes)
        },
      })
      .catch(() => {
        setIsAnimating(false)
        setError("Lỗi animation / Animation error")
      })
  }

  const pauseAnimation = () => {
    if (!writerRef.current) return
    // HanziWriter doesn't have built-in pause, so we'll reset
    writerRef.current.cancelCurrentAnimation()
    setIsAnimating(false)
  }

  const resetAnimation = () => {
    if (!writerRef.current) return

    writerRef.current.hideCharacter()
    setCurrentStroke(0)
    setIsAnimating(false)
  }

  const animateStroke = (strokeNum: number) => {
    if (!writerRef.current || strokeNum >= totalStrokes) return

    writerRef.current.animateStroke(strokeNum, {
      onComplete: () => {
        setCurrentStroke(strokeNum + 1)
      },
    })
  }

  const nextStroke = () => {
    if (currentStroke < totalStrokes) {
      animateStroke(currentStroke)
    }
  }

  const prevStroke = () => {
    if (currentStroke > 0) {
      writerRef.current.hideCharacter()
      // Animate up to previous stroke
      for (let i = 0; i < currentStroke - 1; i++) {
        writerRef.current.animateStroke(i, { duration: 100 })
      }
      setCurrentStroke(currentStroke - 1)
    }
  }

  const startQuiz = () => {
    if (!writerRef.current) return

    writerRef.current.quiz({
      onMistake: (strokeData: any) => {
        console.log("Mistake on stroke:", strokeData)
      },
      onCorrectStroke: (strokeData: any) => {
        console.log("Correct stroke:", strokeData)
      },
      onComplete: () => {
        console.log("Quiz completed!")
      },
    })
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border-2 border-red-200 p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">⚠️ {error}</p>
          <button
            onClick={initializeWriter}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Thử lại / Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải HanziWriter... / Loading HanziWriter...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      {/* Character Info */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{character}</h3>
        <div className="text-sm text-gray-600">
          Nét {currentStroke} / {totalStrokes} • Stroke {currentStroke} / {totalStrokes}
        </div>
      </div>

      {/* HanziWriter Container */}
      <div className="flex justify-center mb-6">
        <div
          ref={targetRef}
          className="border-2 border-gray-300 rounded-lg bg-white"
          style={{ width: size, height: size }}
        />
      </div>

      {/* Animation Controls */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={prevStroke}
          disabled={currentStroke === 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Nét trước / Previous stroke"
        >
          <SkipBack size={16} />
        </button>

        <button
          onClick={isAnimating ? pauseAnimation : startAnimation}
          disabled={currentStroke === totalStrokes}
          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-colors"
          title={isAnimating ? "Tạm dừng / Pause" : "Phát / Play"}
        >
          {isAnimating ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={nextStroke}
          disabled={currentStroke >= totalStrokes}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Nét tiếp theo / Next stroke"
        >
          <SkipForward size={16} />
        </button>

        <button
          onClick={resetAnimation}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Đặt lại / Reset"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${(currentStroke / totalStrokes) * 100}%`,
          }}
        />
      </div>

      {/* Practice Mode */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Chế độ luyện tập / Practice Mode</h4>
        <div className="flex gap-2">
          <button
            onClick={startQuiz}
            className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            ✍️ Luyện viết / Practice Writing
          </button>
          <button
            onClick={() => writerRef.current?.showCharacter()}
            className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            👁️ Hiện chữ / Show Character
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Hướng dẫn:</strong> Nhấn "Phát" để xem animation hoàn chỉnh, hoặc dùng nút "Nét tiếp theo" để xem
          từng nét. Chế độ "Luyện viết" cho phép bạn vẽ trực tiếp lên màn hình.
        </p>
        <p className="text-sm text-blue-700 mt-1">
          💡 <strong>Instructions:</strong> Click "Play" for full animation, or use "Next stroke" for step-by-step.
          "Practice Writing" mode lets you draw directly on screen.
        </p>
      </div>
    </div>
  )
}
