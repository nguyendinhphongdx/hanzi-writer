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
      strokeOrderTips: z.string().describe("Tips for writing stroke order, max 50 characters"),
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
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 px-4">
            学习汉字 <span className="text-indigo-600">HanziWriter</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Học viết chữ Hán với animation chuyên nghiệp từ thư viện HanziWriter
            <br className="hidden sm:block" />
            <span className="text-sm sm:text-base block sm:inline mt-2 sm:mt-0">
              Learn Chinese characters with professional animations powered by HanziWriter library
            </span>
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-gray-500 px-4">
            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full">✨ Real stroke data</span>
            <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full">🎬 Smooth animations</span>
            <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full">✍️ Interactive practice</span>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 md:mb-8 mx-2 sm:mx-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="word-input" className="block text-sm font-medium text-gray-700 mb-2">
                Nhập từ cần học / Enter word to learn
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  id="word-input"
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ví dụ: xin chào, hello, 你好, 学习..."
                  className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-base sm:text-lg"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputWord.trim()}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Đang tạo...</span>
                      <span className="sm:hidden">Tạo...</span>
                    </div>
                  ) : (
                    <span>
                      🎬 <span className="hidden sm:inline">Tạo Animation</span>
                      <span className="sm:hidden">Tạo</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl mx-2 sm:mx-0">
              <p className="text-red-700 text-center text-sm sm:text-base">{error}</p>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="inline-flex items-center gap-3 text-indigo-600">
              <div className="w-6 sm:w-8 h-6 sm:h-8 border-2 sm:border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-base sm:text-lg font-medium">
                <span className="hidden sm:inline">Đang tạo animation chữ Hán... / Generating Chinese character animations...</span>
                <span className="sm:hidden">Đang tạo...</span>
              </span>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        {results && results.characters && results.characters.length > 1 && (
          <div className="flex justify-center mb-6 md:mb-8 px-4">
            <div className="bg-white rounded-xl p-1 sm:p-2 shadow-lg">
              <button
                onClick={() => setViewMode("individual")}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                  viewMode === "individual" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">📝 Học từng chữ / Individual</span>
                <span className="sm:hidden">📝 Từng chữ</span>
              </button>
              <button
                onClick={() => setViewMode("comparison")}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                  viewMode === "comparison" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">🔄 So sánh / Comparison</span>
                <span className="sm:hidden">🔄 So sánh</span>
              </button>
            </div>
          </div>
        )}

        {/* HanziWriter Animation Section */}
        {selectedCharacter && viewMode === "individual" && (
          <div ref={animationRef} className="mb-6 md:mb-8 px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4 sm:mb-6">
              <span className="hidden sm:inline">🎬 Animation chữ: {selectedCharacter} / Character Animation: {selectedCharacter}</span>
              <span className="sm:hidden">🎬 {selectedCharacter}</span>
            </h2>
            
            {/* Check if selectedCharacter is a single character or multiple characters */}
            {selectedCharacter.length === 1 ? (
              // Single character - show normal HanziWriter
              <div className="flex justify-center">
                <HanziWriterComponent 
                  character={selectedCharacter} 
                  pinyin={results?.characters.find(char => char.character === selectedCharacter)?.pinyin}
                />
              </div>
            ) : (
              // Multiple characters - show each character separately
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm sm:text-base text-gray-600">
                    <span className="hidden sm:inline">Từ "{selectedCharacter}" có {selectedCharacter.length} ký tự. Mỗi ký tự sẽ được hiển thị riêng biệt:</span>
                    <span className="sm:hidden">Từ có {selectedCharacter.length} ký tự:</span>
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {selectedCharacter.split('').map((char, index) => {
                    // Check if this character is valid Chinese character
                    const isValidChinese = /[\u4e00-\u9fff]/.test(char)
                    
                    if (!isValidChinese) {
                      return (
                        <div key={index} className="flex justify-center">
                          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                            <div className="text-4xl mb-2">{char}</div>
                            <p className="text-sm text-yellow-700">
                              <span className="hidden sm:inline">Không phải chữ Hán / Not Chinese character</span>
                              <span className="sm:hidden">Không phải chữ Hán</span>
                            </p>
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                      <div key={index} className="flex justify-center">
                        <div className="w-full max-w-sm">
                          <div className="text-center mb-2">
                            <span className="text-sm font-medium text-gray-600">
                              <span className="hidden sm:inline">Ký tự {index + 1} / Character {index + 1}</span>
                              <span className="sm:hidden">Ký tự {index + 1}</span>
                            </span>
                          </div>
                          <HanziWriterComponent 
                            character={char} 
                            pinyin={results?.characters.find(charData => charData.character === selectedCharacter)?.pinyin}
                            size={250}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Overall word information */}
                <div className="bg-blue-50 rounded-xl p-4 mt-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    <span className="hidden sm:inline">Thông tin về từ "{selectedCharacter}" / Information about word "{selectedCharacter}"</span>
                    <span className="sm:hidden">Thông tin về từ "{selectedCharacter}"</span>
                  </h3>
                  {results?.characters.find(char => char.character === selectedCharacter) && (
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Pinyin:</strong> {results.characters.find(char => char.character === selectedCharacter)?.pinyin}</p>
                      <p><strong>Nghĩa:</strong> {results.characters.find(char => char.character === selectedCharacter)?.meaning}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Character Comparison Mode */}
        {results && results.characters && viewMode === "comparison" && (
          <div className="mb-6 md:mb-8 px-4">
            <CharacterComparison characters={results.characters.map((char) => char.character)} />
          </div>
        )}

        {/* Results Section */}
        {results && results.characters && results.characters.length > 0 && (
          <div className="space-y-6 px-2 sm:px-0">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 px-4">
                <span className="hidden sm:inline">Kết quả cho "{inputWord}" / Results for "{inputWord}"</span>
                <span className="sm:hidden">Kết quả: "{inputWord}"</span>
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
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors text-sm sm:text-base"
                  title="Đọc tất cả các ký tự / Speak all characters"
                >
                  {isSpeaking ? <VolumeX size={16} className="sm:w-5 sm:h-5" /> : <Volume2 size={16} className="sm:w-5 sm:h-5" />}
                  <span className="hidden sm:inline">{isSpeaking ? "Đang đọc..." : "🔊 Đọc tất cả"}</span>
                  <span className="sm:hidden">{isSpeaking ? "Đọc..." : "🔊"}</span>
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.characters.map((char, index) => {
                const isValidChinese = /[\u4e00-\u9fff]/.test(char.character) && char.character.length === 1
                
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-2 cursor-pointer ${
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
                        <span className="text-red-600 text-xs sm:text-sm font-medium">
                          ⚠️ <span className="hidden sm:inline">Không phải chữ Hán / Not a Chinese character</span>
                          <span className="sm:hidden">Không phải chữ Hán</span>
                        </span>
                      </div>
                    )}
                    
                    {/* Chinese Character Display */}
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                        <div className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-gray-800">
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
                            className="p-1.5 sm:p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors touch-manipulation"
                            title="Đọc ký tự / Speak character"
                          >
                            {isSpeaking ? <VolumeX size={14} className="sm:w-4 sm:h-4" /> : <Volume2 size={14} className="sm:w-4 sm:h-4" />}
                          </button>
                        )}
                      </div>
                      <div className="text-lg sm:text-xl text-indigo-600 font-medium">{char.pinyin}</div>
                      {selectedCharacter === char.character && isValidChinese && (
                        <div className="mt-2 text-xs sm:text-sm text-indigo-600 font-medium">
                          🎬 <span className="hidden sm:inline">Đã chọn để xem animation / Selected for animation</span>
                          <span className="sm:hidden">Đã chọn</span>
                        </div>
                      )}
                    </div>

                  {/* Character Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Nghĩa / Meaning
                      </h3>
                      <p className="text-gray-800 font-medium text-sm sm:text-base">{char.meaning}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Số nét / Strokes
                        </h3>
                        <p className="text-gray-800 font-medium text-sm sm:text-base">{char.strokeCount || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
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
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Bộ thủ / Radicals
                      </h3>
                      <p className="text-gray-700 text-xs sm:text-sm">{char.radicals || 'Đang cập nhật / Updating...'}</p>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Mẹo viết / Writing Tips
                      </h3>
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{char.strokeOrderTips || 'Đang cập nhật / Updating...'}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCharacterSelect(char.character)
                      }}
                      className={`w-full py-2 px-4 font-medium rounded-lg transition-colors text-sm sm:text-base touch-manipulation ${
                        isValidChinese 
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {isValidChinese ? (
                        <>
                          <span className="hidden sm:inline">🎬 Xem Animation HanziWriter</span>
                          <span className="sm:hidden">🎬 Xem Animation</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">⚠️ Xem (có thể lỗi)</span>
                          <span className="sm:hidden">⚠️ Xem</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
              })}
            </div>

            {/* Enhanced Learning Tips */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                💡 <span className="hidden sm:inline">Mẹo học tập với HanziWriter / Learning Tips with HanziWriter</span>
                <span className="sm:hidden">Mẹo học tập</span>
              </h3>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 text-gray-700 text-sm sm:text-base">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">🎬</span>
                    <span>
                      <span className="hidden sm:inline">Xem animation hoàn chỉnh trước khi luyện tập / Watch full animation before practicing</span>
                      <span className="sm:hidden">Xem animation trước khi luyện tập</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">🔊</span>
                    <span>
                      <span className="hidden sm:inline">Sử dụng tính năng đọc để học phát âm / Use speech feature to learn pronunciation</span>
                      <span className="sm:hidden">Sử dụng tính năng đọc để học phát âm</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✍️</span>
                    <span>
                      <span className="hidden sm:inline">Sử dụng chế độ "Luyện viết" để vẽ trực tiếp / Use "Practice Writing" mode to draw directly</span>
                      <span className="sm:hidden">Sử dụng chế độ "Luyện viết"</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">🔄</span>
                    <span>
                      <span className="hidden sm:inline">Lặp lại animation nhiều lần để ghi nhớ / Repeat animations multiple times to memorize</span>
                      <span className="sm:hidden">Lặp lại animation nhiều lần</span>
                    </span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">👁️</span>
                    <span>
                      <span className="hidden sm:inline">Chú ý đến hướng và thứ tự nét viết / Pay attention to stroke direction and order</span>
                      <span className="sm:hidden">Chú ý hướng và thứ tự nét viết</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">📚</span>
                    <span>
                      <span className="hidden sm:inline">Học bộ thủ để hiểu cấu trúc chữ / Learn radicals to understand character structure</span>
                      <span className="sm:hidden">Học bộ thủ để hiểu cấu trúc chữ</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">🎯</span>
                    <span>
                      <span className="hidden sm:inline">Bắt đầu với chữ dễ rồi tăng độ khó / Start with easy characters then increase difficulty</span>
                      <span className="sm:hidden">Bắt đầu với chữ dễ rồi tăng độ khó</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 px-4">
          <p className="text-gray-500 text-xs sm:text-sm">
            <span className="hidden sm:inline">Được tạo bởi AI với thư viện HanziWriter chuyên nghiệp / Created by AI with professional HanziWriter library</span>
            <span className="sm:hidden">Được tạo bởi AI với HanziWriter</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            HanziWriter by{" "}
            <a href="https://github.com/phongnd-base" className="text-indigo-500 hover:underline">
              @phong.nguyen02@base.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
