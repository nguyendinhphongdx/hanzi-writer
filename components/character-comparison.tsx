"use client"

import { useState } from "react"
import HanziWriterComponent from "./hanzi-writer-component"

interface CharacterComparisonProps {
  characters: string[]
}

export default function CharacterComparison({ characters }: CharacterComparisonProps) {
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0] || "")

  if (characters.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
        <span className="hidden sm:inline">So sánh chữ Hán / Character Comparison</span>
        <span className="sm:hidden">So sánh chữ Hán</span>
      </h3>

      {/* Character Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-6">
        {characters.map((char, index) => (
          <button
            key={index}
            onClick={() => setSelectedCharacter(char)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-xl sm:text-2xl transition-all touch-manipulation ${
              selectedCharacter === char
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {char}
          </button>
        ))}
      </div>

      {/* Selected Character Animation */}
      {selectedCharacter && (
        <div className="mb-4 sm:mb-6">
          {/* Check if selectedCharacter is a single character or multiple characters */}
          {selectedCharacter.length === 1 ? (
            // Single character - show normal HanziWriter
            <div className="flex justify-center">
              <HanziWriterComponent character={selectedCharacter} />
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
                <div className="text-sm text-blue-700">
                  <p><strong>Số ký tự:</strong> {selectedCharacter.length}</p>
                  <p><strong>Ký tự hợp lệ:</strong> {selectedCharacter.split('').filter(char => /[\u4e00-\u9fff]/.test(char)).length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Character Grid for Quick Reference */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {characters.map((char, index) => (
          <div
            key={index}
            className={`p-3 sm:p-4 border-2 rounded-lg text-center cursor-pointer transition-all touch-manipulation ${
              selectedCharacter === char ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedCharacter(char)}
          >
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{char}</div>
            <div className="text-xs sm:text-sm text-gray-600">
              {char.length > 1 && (
                <div className="mb-1 text-green-600 font-medium">
                  <span className="hidden sm:inline">{char.length} ký tự / {char.length} chars</span>
                  <span className="sm:hidden">{char.length} ký tự</span>
                </div>
              )}
              <div>
                <span className="hidden sm:inline">Nhấn để xem / Click to view</span>
                <span className="sm:hidden">Nhấn để xem</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
