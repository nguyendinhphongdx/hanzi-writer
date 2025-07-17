"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { useSpeech } from "@/hooks/use-speech"

interface HanziWriterComponentProps {
  character: string
  pinyin?: string
  size?: number
  autoSpeakOnAnimation?: boolean
}

// Declare HanziWriter type for TypeScript
declare global {
  interface Window {
    HanziWriter: any
  }
}

export default function HanziWriterComponent({ character, pinyin, size = 300, autoSpeakOnAnimation = true }: HanziWriterComponentProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isStrokeAnimating, setIsStrokeAnimating] = useState(false)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [totalStrokes, setTotalStrokes] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const { speakChinese, speakPinyin, stop, isSpeaking, isSupported } = useSpeech()

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
      setError(null) // Clear previous errors when character changes
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

      // Check if character data is available first
      try {
        const charData = await window.HanziWriter.loadCharacterData(character)
        if (!charData || !charData.strokes || charData.strokes.length === 0) {
          throw new Error("Character data not available")
        }
      } catch (dataErr) {
        console.warn(`Character data not available for: ${character}`)
        setError(`Chữ "${character}" không có dữ liệu stroke / Character "${character}" has no stroke data`)
        return
      }

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

      // Get stroke count
      const charData = await window.HanziWriter.loadCharacterData(character)
      const strokeCount = charData.strokes.length

      setTotalStrokes(strokeCount as number)
      setCurrentStroke(0)
      setError(null)
    } catch (err) {
      console.error("Error initializing HanziWriter:", err)
      setError(`Không thể tải dữ liệu chữ "${character}" / Cannot load character data for "${character}"`)
    }
  }

  // Animation controls
  const startAnimation = () => {
    if (!writerRef.current || typeof writerRef.current.animateCharacter !== 'function') return

    setIsAnimating(true)
    
    // Auto-speak character when animation starts
    if (autoSpeakOnAnimation && isSupported) {
      speakChinese(character)
    }
    
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
    if (!writerRef.current || typeof writerRef.current.cancelCurrentAnimation !== 'function') return
    // Cancel any ongoing animation
    writerRef.current.cancelCurrentAnimation()
    setIsAnimating(false)
    setIsStrokeAnimating(false)
  }

  const resetAnimation = () => {
    if (!writerRef.current || typeof writerRef.current.hideCharacter !== 'function') return

    writerRef.current.hideCharacter()
    setCurrentStroke(0)
    setIsAnimating(false)
    setIsStrokeAnimating(false)
  }

  const animateStroke = (strokeNum: number) => {
    if (!writerRef.current || typeof writerRef.current.animateStroke !== 'function' || strokeNum >= totalStrokes) return

    setIsStrokeAnimating(true)
    writerRef.current.animateStroke(strokeNum, {
      onComplete: () => {
        setCurrentStroke(strokeNum + 1)
        setIsStrokeAnimating(false)
      },
    })
  }

  const nextStroke = () => {
    if (currentStroke < totalStrokes) {
      animateStroke(currentStroke)
    }
  }

  const prevStroke = () => {
    if (currentStroke > 0 && writerRef.current && typeof writerRef.current.hideCharacter === 'function') {
      setIsStrokeAnimating(true)
      writerRef.current.hideCharacter()
      // Animate up to previous stroke
      let strokesCompleted = 0
      const targetStrokes = currentStroke - 1
      
      if (targetStrokes === 0) {
        setCurrentStroke(0)
        setIsStrokeAnimating(false)
        return
      }
      
      for (let i = 0; i < targetStrokes; i++) {
        if (typeof writerRef.current.animateStroke === 'function') {
          writerRef.current.animateStroke(i, { 
            duration: 100,
            onComplete: () => {
              strokesCompleted++
              if (strokesCompleted === targetStrokes) {
                setCurrentStroke(targetStrokes)
                setIsStrokeAnimating(false)
              }
            }
          })
        }
      }
    }
  }

  const startQuiz = () => {
    if (!writerRef.current || typeof writerRef.current.quiz !== 'function') return

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
          <p className="text-sm mt-2 text-gray-600">
            Ký tự "{character}" không có dữ liệu animation. Bạn có thể thử chọn ký tự khác.
          </p>
          <button
            onClick={() => {
              setError(null)
              initializeWriter()
            }}
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
        <div className="flex items-center justify-center gap-3 mb-2">
          <h3 className="text-2xl font-bold text-gray-800">{character}</h3>
          {isSupported && (
            <button
              onClick={() => isSpeaking ? stop() : speakChinese(character)}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
              title="Đọc ký tự / Speak character"
            >
              {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}
        </div>
        {pinyin && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg text-blue-600 font-medium">{pinyin}</span>
            {isSupported && (
              <button
                onClick={() => isSpeaking ? stop() : speakPinyin(pinyin)}
                className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                title="Đọc pinyin / Speak pinyin"
              >
                <Volume2 size={16} />
              </button>
            )}
          </div>
        )}
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
          disabled={currentStroke === 0 || !writerRef.current || typeof writerRef.current.hideCharacter !== 'function' || isStrokeAnimating}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Nét trước / Previous stroke"
        >
          <SkipBack size={16} />
        </button>

        <button
          onClick={isAnimating || isStrokeAnimating ? pauseAnimation : startAnimation}
          disabled={!writerRef.current || ((isAnimating || isStrokeAnimating) && typeof writerRef.current.cancelCurrentAnimation !== 'function') || (!(isAnimating || isStrokeAnimating) && (currentStroke === totalStrokes || typeof writerRef.current.animateCharacter !== 'function'))}
          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-colors"
          title={isAnimating || isStrokeAnimating ? "Tạm dừng / Pause" : "Phát / Play"}
        >
          {isAnimating || isStrokeAnimating ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={nextStroke}
          disabled={currentStroke >= totalStrokes || !writerRef.current || typeof writerRef.current.animateStroke !== 'function' || isStrokeAnimating}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Nét tiếp theo / Next stroke"
        >
          <SkipForward size={16} />
        </button>

        <button
          onClick={resetAnimation}
          disabled={!writerRef.current || typeof writerRef.current.hideCharacter !== 'function' || isStrokeAnimating}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            disabled={!writerRef.current || typeof writerRef.current.quiz !== 'function'}
            className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✍️ Luyện viết / Practice Writing
          </button>
          <button
            onClick={() => writerRef.current?.showCharacter && typeof writerRef.current.showCharacter === 'function' && writerRef.current.showCharacter()}
            disabled={!writerRef.current || typeof writerRef.current.showCharacter !== 'function'}
            className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        {isSupported && (
          <p className="text-sm text-green-700 mt-1">
            🔊 <strong>Âm thanh:</strong> Nhấn nút loa để nghe phát âm ký tự và pinyin / 
            <strong>Audio:</strong> Click speaker buttons to hear character and pinyin pronunciation
          </p>
        )}
      </div>
    </div>
  )
}
