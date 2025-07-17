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
        <div className="flex justify-center">
          <HanziWriterComponent character={selectedCharacter} />
        </div>
      )}

      {/* Character Grid for Quick Reference */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
              <span className="hidden sm:inline">Nhấn để xem / Click to view</span>
              <span className="sm:hidden">Nhấn để xem</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
