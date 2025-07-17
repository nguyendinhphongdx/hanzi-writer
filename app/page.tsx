"use client"

import type React from "react"

import { useState, useRef } from "react"
import { z } from "zod"
import { Volume2, VolumeX } from "lucide-react"
import HanziWriterComponent from "../components/hanzi-writer-component"
import CharacterComparison from "../components/character-comparison"
import { useSpeech } from "../hooks/use-speech"

// Define the schema for Chinese character data
const ChineseCharacterSchema = z.object({
  characters: z.array(
    z.object({
      character: z.string().describe("The Chinese character"),
      pinyin: z.string().describe("The pinyin pronunciation"),
      meaning: z.string().describe("The Vietnamese and English meaning"),
      strokeCount: z.number().describe("Number of strokes in the character"),
      strokeOrderTips: z.string().describe("Tips for writing stroke order"),
      radicals: z.string().describe("Character radicals and components"),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).describe("Learning difficulty level"),
    }),
  ),
})

type ChineseCharacterData = z.infer<typeof ChineseCharacterSchema>

export default function ChineseCharacterLearning() {
  const [inputWord, setInputWord] = useState("")
  const [results, setResults] = useState<ChineseCharacterData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"individual" | "comparison">("individual")
  
  // Create ref for animation section
  const animationRef = useRef<HTMLDivElement>(null)

  // Speech hook
  const { speakChinese, stop, isSpeaking, isSupported } = useSpeech()

  // Function to scroll to animation section
  const scrollToAnimation = () => {
    if (animationRef.current) {
      animationRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  }

  // Function to handle character selection and scroll
  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character)
    setViewMode("individual")
    setError(null) // Clear any previous errors
    // Scroll to animation after state update
    setTimeout(() => {
      scrollToAnimation()
    }, 100)
  }

  // Function to generate Chinese characters using AI
  const generateChineseCharacters = async () => {
    if (!inputWord.trim()) {
      setError("Vui lòng nhập một từ để tìm kiếm / Please enter a word to search")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)
    setSelectedCharacter(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: inputWord }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate characters')
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      setResults(result)
      if (result.characters.length > 0) {
        setSelectedCharacter(result.characters[0].character)
      }
    } catch (err) {
      console.error("Error generating Chinese characters:", err)
      setError(
        "Đã xảy ra lỗi khi tạo chữ Hán. Vui lòng thử lại. / An error occurred while generating Chinese characters. Please try again.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateChineseCharacters()
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      generateChineseCharacters()
    }
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            学习汉字 <span className="text-indigo-600">HanziWriter</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Học viết chữ Hán với animation chuyên nghiệp từ thư viện HanziWriter
            <br />
            <span className="text-sm">
              Learn Chinese characters with professional animations powered by HanziWriter library
            </span>
          </p>
          <div className="mt-4 flex justify-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">✨ Real stroke data</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">🎬 Smooth animations</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">✍️ Interactive practice</span>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="word-input" className="block text-sm font-medium text-gray-700 mb-2">
                Nhập từ cần học / Enter word to learn
              </label>
              <div className="flex gap-4">
                <input
                  id="word-input"
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ví dụ: xin chào, hello, 你好, 学习..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-lg"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputWord.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tạo...
                    </div>
                  ) : (
                    "🎬 Tạo Animation"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-indigo-600">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg font-medium">
                Đang tạo animation chữ Hán... / Generating Chinese character animations...
              </span>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        {results && results.characters && results.characters.length > 1 && (
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-2 shadow-lg">
              <button
                onClick={() => setViewMode("individual")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === "individual" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                📝 Học từng chữ / Individual
              </button>
              <button
                onClick={() => setViewMode("comparison")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === "comparison" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                🔄 So sánh / Comparison
              </button>
            </div>
          </div>
        )}

        {/* HanziWriter Animation Section */}
        {selectedCharacter && viewMode === "individual" && (
          <div ref={animationRef} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              🎬 Animation chữ: {selectedCharacter} / Character Animation: {selectedCharacter}
            </h2>
            <div className="flex justify-center">
              <HanziWriterComponent 
                character={selectedCharacter} 
                pinyin={results?.characters.find(char => char.character === selectedCharacter)?.pinyin}
                size={400} 
              />
            </div>
          </div>
        )}

        {/* Character Comparison Mode */}
        {results && results.characters && viewMode === "comparison" && (
          <div className="mb-8">
            <CharacterComparison characters={results.characters.map((char) => char.character)} />
          </div>
        )}

        {/* Results Section */}
        {results && results.characters && results.characters.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Kết quả cho "{inputWord}" / Results for "{inputWord}"
              </h2>
              
              {/* Speak All Button */}
              {isSupported && (
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stop()
                    } else {
                      const allCharacters = results.characters.map(char => char.character).join('')
                      speakChinese(allCharacters)
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
                  title="Đọc tất cả các ký tự / Speak all characters"
                >
                  {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  {isSpeaking ? "Đang đọc..." : "🔊 Đọc tất cả"}
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.characters.map((char, index) => {
                const isValidChinese = /[\u4e00-\u9fff]/.test(char.character) && char.character.length === 1
                
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 cursor-pointer ${
                      !isValidChinese 
                        ? "border-red-300 bg-red-50" 
                        : selectedCharacter === char.character
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-gray-100 hover:border-indigo-300"
                    }`}
                    onClick={() => handleCharacterSelect(char.character)}
                  >
                    {!isValidChinese && (
                      <div className="text-center mb-4">
                        <span className="text-red-600 text-sm font-medium">
                          ⚠️ Không phải chữ Hán / Not a Chinese character
                        </span>
                      </div>
                    )}
                    
                    {/* Chinese Character Display */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="text-6xl font-bold font-serif text-gray-800">
                          {char.character}
                        </div>
                        {isSupported && isValidChinese && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isSpeaking) {
                                stop()
                              } else {
                                speakChinese(char.character)
                              }
                            }}
                            className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                            title="Đọc ký tự / Speak character"
                          >
                            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          </button>
                        )}
                      </div>
                      <div className="text-xl text-indigo-600 font-medium">{char.pinyin}</div>
                      {selectedCharacter === char.character && isValidChinese && (
                        <div className="mt-2 text-sm text-indigo-600 font-medium">
                          🎬 Đã chọn để xem animation / Selected for animation
                        </div>
                      )}
                    </div>

                  {/* Character Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Nghĩa / Meaning
                      </h3>
                      <p className="text-gray-800 font-medium">{char.meaning}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Số nét / Strokes
                        </h3>
                        <p className="text-gray-800 font-medium">{char.strokeCount || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Độ khó / Difficulty
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(char.difficulty || 'beginner')}`}
                        >
                          {char.difficulty || 'beginner'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Bộ thủ / Radicals
                      </h3>
                      <p className="text-gray-700 text-sm">{char.radicals || 'Đang cập nhật / Updating...'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Mẹo viết / Writing Tips
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{char.strokeOrderTips || 'Đang cập nhật / Updating...'}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCharacterSelect(char.character)
                      }}
                      className={`w-full py-2 px-4 font-medium rounded-lg transition-colors ${
                        isValidChinese 
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {isValidChinese ? "🎬 Xem Animation HanziWriter" : "⚠️ Xem (có thể lỗi)"}
                    </button>
                  </div>
                </div>
              )
              })}
            </div>

            {/* Enhanced Learning Tips */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                💡 Mẹo học tập với HanziWriter / Learning Tips with HanziWriter
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">🎬</span>
                    <span>Xem animation hoàn chỉnh trước khi luyện tập / Watch full animation before practicing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">🔊</span>
                    <span>
                      Sử dụng tính năng đọc để học phát âm / Use speech feature to learn pronunciation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✍️</span>
                    <span>
                      Sử dụng chế độ "Luyện viết" để vẽ trực tiếp / Use "Practice Writing" mode to draw directly
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">🔄</span>
                    <span>Lặp lại animation nhiều lần để ghi nhớ / Repeat animations multiple times to memorize</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">👁️</span>
                    <span>Chú ý đến hướng và thứ tự nét viết / Pay attention to stroke direction and order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">📚</span>
                    <span>Học bộ thủ để hiểu cấu trúc chữ / Learn radicals to understand character structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">🎯</span>
                    <span>
                      Bắt đầu với chữ dễ rồi tăng độ khó / Start with easy characters then increase difficulty
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Được tạo bởi AI với thư viện HanziWriter chuyên nghiệp / Created by AI with professional HanziWriter library
          </p>
          <p className="text-gray-400 text-xs mt-1">
            HanziWriter by{" "}
            <a href="https://github.com/chanind/hanzi-writer" className="text-indigo-500 hover:underline">
              @chanind
            </a>{" "}
            • Data from Makemeahanzi project
          </p>
        </div>
      </div>
    </div>
  )
}
