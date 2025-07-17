import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

const ChineseCharacterSchema = z.object({
  characters: z.array(
    z.object({
      character: z.string().describe("The character or symbol"),
      pinyin: z.string().describe("The pinyin pronunciation or description"),
      meaning: z.string().describe("The Vietnamese and English meaning"),
      strokeCount: z.number().describe("Number of strokes (0 for punctuation)"),
      strokeOrderTips: z.string().describe("Tips for writing stroke order"),
      radicals: z.string().describe("Character radicals and components"),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).describe("Learning difficulty level"),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    // Check if API key is available
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
    console.log("API Key available:", !!apiKey)
    
    if (!apiKey) {
      console.error("Google AI API key is not set")
      return Response.json({ error: "API key is not configured" }, { status: 500 })
    }

    const { word } = await req.json()

    if (!word) {
      return Response.json({ error: "Word is required" }, { status: 400 })
    }

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: ChineseCharacterSchema,
      prompt: `Convert the word "${word}" to Chinese characters and any punctuation. For each character/symbol, provide:
      1. The character itself (Chinese characters, punctuation marks, spaces, etc.)
      2. Pinyin pronunciation (for Chinese characters) or description (for punctuation)
      3. Meaning in both Vietnamese and English (format: "Vietnamese / English")
      4. Number of strokes (for Chinese characters, 0 for punctuation)
      5. Tips for stroke order and writing technique (for Chinese characters)
      6. Character radicals and components (for Chinese characters)
      7. Difficulty level: choose exactly one of "beginner", "intermediate", or "advanced"
      
      Include ALL characters and punctuation from the input phrase exactly as they appear.
      
      If the input is already in Chinese, break it down character by character including punctuation.
      If it's Vietnamese or English, translate to Chinese and include punctuation.
      
      Example for "你好, 世界!":
      - character: "你", pinyin: "nǐ", meaning: "bạn / you", strokeCount: 7, difficulty: "beginner"
      - character: "好", pinyin: "hǎo", meaning: "tốt / good", strokeCount: 6, difficulty: "beginner"  
      - character: ",", pinyin: "comma", meaning: "dấu phẩy / comma", strokeCount: 0, difficulty: "beginner"
      - character: "世", pinyin: "shì", meaning: "thế giới / world", strokeCount: 5, difficulty: "intermediate"
      - character: "界", pinyin: "jiè", meaning: "giới / boundary", strokeCount: 9, difficulty: "intermediate"
      - character: "!", pinyin: "exclamation", meaning: "dấu chấm than / exclamation", strokeCount: 0, difficulty: "beginner"`,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error("Error generating Chinese characters:", error)
    return Response.json({ error: "Failed to generate Chinese characters" }, { status: 500 })
  }
}
