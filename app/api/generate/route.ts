import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

const ChineseCharacterSchema = z.object({
  characters: z.array(
    z.object({
      character: z.string().describe("The Chinese character"),
      pinyin: z.string().describe("The pinyin pronunciation"),
      meaning: z.string().describe("The Vietnamese and English meaning"),
      strokeCount: z.number().describe("Number of strokes in the character"),
      strokeOrderTips: z.string().describe("Tips for writing stroke order"),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { word } = await req.json()

    if (!word) {
      return Response.json({ error: "Word is required" }, { status: 400 })
    }

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: ChineseCharacterSchema,
      prompt: `Convert the word "${word}" to Chinese characters. For each character, provide:
      1. The Chinese character itself
      2. Pinyin pronunciation with tone marks
      3. Meaning in both Vietnamese and English (format: "Vietnamese / English")
      4. Number of strokes
      5. Tips for stroke order and writing technique
      
      If the input is already in Chinese, break it down character by character.
      If it's Vietnamese or English, find the most appropriate Chinese translation.`,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error("Error generating Chinese characters:", error)
    return Response.json({ error: "Failed to generate Chinese characters" }, { status: 500 })
  }
}
