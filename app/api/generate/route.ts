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
      model: google("gemini-2.0-flash"),
      schema: ChineseCharacterSchema,
      prompt: `TASK: Convert "${word}" to Chinese and analyze EVERY SINGLE CHARACTER separately.

      STEP 1: Translate the input to Chinese characters
      STEP 2: Split the Chinese result into individual characters (ONE character per entry)
      
      ABSOLUTE REQUIREMENTS:
      ❌ NEVER group multiple characters together (like "今天", "星期", "上午")
      ✅ ALWAYS create separate entries for each character (like "今", "天", "星", "期")
      ❌ Do NOT create compound words or phrases
      ✅ Each "character" field must contain exactly ONE Chinese character
      
      For EACH INDIVIDUAL CHARACTER, provide:
      1. character: Single Chinese character (ONE character only)
      2. pinyin: Pronunciation for that specific character 
      3. meaning: Individual character meaning in "Vietnamese / English" format
      4. strokeCount: Number of strokes for that character
      5. radicals: Character components and radicals
      6. difficulty: "beginner", "intermediate", or "advanced"
      
      EXAMPLES:
      
      Input: "hello" → "你好"
      ✅ CORRECT OUTPUT:
      - character: "你", pinyin: "nǐ", meaning: "bạn / you"
      - character: "好", pinyin: "hǎo", meaning: "tốt / good"
      
      Input: "hôm nay" → "今天" 
      ✅ CORRECT OUTPUT:
      - character: "今", pinyin: "jīn", meaning: "hiện tại / now"
      - character: "天", pinyin: "tiān", meaning: "ngày / day"
      
      Input: "thứ hai" → "星期一"
      ✅ CORRECT OUTPUT:
      - character: "星", pinyin: "xīng", meaning: "ngôi sao / star"
      - character: "期", pinyin: "qī", meaning: "thời kỳ / period"  
      - character: "一", pinyin: "yī", meaning: "một / one"
      
      ❌ WRONG (DO NOT DO THIS):
      - character: "今天", pinyin: "jīntiān", meaning: "hôm nay / today"
      - character: "星期", pinyin: "xīngqī", meaning: "tuần / week"
      
      Remember: ONE CHARACTER = ONE ENTRY. No exceptions.`,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error("Error generating Chinese characters:", error)
    return Response.json({ error: "Failed to generate Chinese characters" }, { status: 500 })
  }
}
