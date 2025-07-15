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
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">So sánh chữ Hán / Character Comparison</h3>

      {/* Character Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {characters.map((char, index) => (
          <button
            key={index}
            onClick={() => setSelectedCharacter(char)}
            className={`px-4 py-2 rounded-lg font-bold text-2xl transition-all ${
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
          <HanziWriterComponent character={selectedCharacter} size={350} />
        </div>
      )}

      {/* Character Grid for Quick Reference */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {characters.map((char, index) => (
          <div
            key={index}
            className={`p-4 border-2 rounded-lg text-center cursor-pointer transition-all ${
              selectedCharacter === char ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedCharacter(char)}
          >
            <div className="text-3xl font-bold text-gray-800 mb-2">{char}</div>
            <div className="text-sm text-gray-600">Nhấn để xem / Click to view</div>
          </div>
        ))}
      </div>
    </div>
  )
}
