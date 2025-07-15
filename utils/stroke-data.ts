// Sample stroke data for common Chinese characters
// In a real application, you would fetch this from a stroke order database

export interface StrokeData {
  path: string
  duration: number
  delay: number
}

export const strokeDatabase: Record<string, StrokeData[]> = {
  你: [
    { path: "M50 50 L50 150", duration: 800, delay: 0 },
    { path: "M30 80 L70 80", duration: 600, delay: 200 },
    { path: "M90 40 L90 160", duration: 1000, delay: 400 },
    { path: "M110 60 L150 60", duration: 500, delay: 600 },
    { path: "M110 100 L150 100", duration: 500, delay: 800 },
    { path: "M130 60 L130 140", duration: 700, delay: 1000 },
    { path: "M110 140 L150 140", duration: 500, delay: 1200 },
  ],
  好: [
    { path: "M40 50 L40 150", duration: 800, delay: 0 },
    { path: "M20 80 L60 80", duration: 600, delay: 200 },
    { path: "M20 120 L60 120", duration: 600, delay: 400 },
    { path: "M100 40 L100 80", duration: 600, delay: 600 },
    { path: "M80 60 L120 60", duration: 500, delay: 800 },
    { path: "M140 40 L140 160", duration: 1000, delay: 1000 },
  ],
  我: [
    { path: "M50 40 L50 80", duration: 600, delay: 0 },
    { path: "M30 60 L70 60", duration: 500, delay: 200 },
    { path: "M90 50 L130 90", duration: 700, delay: 400 },
    { path: "M130 50 L90 90", duration: 700, delay: 600 },
    { path: "M110 90 L110 130", duration: 600, delay: 800 },
    { path: "M90 130 L130 130", duration: 500, delay: 1000 },
    { path: "M110 130 L110 160", duration: 500, delay: 1200 },
  ],
}

// Generate sample stroke data for characters not in database
export function generateSampleStrokes(character: string): StrokeData[] {
  // This is a simplified version - in reality you'd use a proper stroke order API
  const strokeCount = Math.min(character.length * 3 + Math.random() * 5, 12)
  const strokes: StrokeData[] = []

  for (let i = 0; i < strokeCount; i++) {
    const startX = 50 + Math.random() * 100
    const startY = 50 + Math.random() * 100
    const endX = startX + (Math.random() - 0.5) * 60
    const endY = startY + (Math.random() - 0.5) * 60

    strokes.push({
      path: `M${startX} ${startY} L${endX} ${endY}`,
      duration: 500 + Math.random() * 500,
      delay: i * 200,
    })
  }

  return strokes
}

export function getStrokeData(character: string): StrokeData[] {
  return strokeDatabase[character] || generateSampleStrokes(character)
}
