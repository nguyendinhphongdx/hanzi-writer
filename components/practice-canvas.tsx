"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Download, RotateCcw } from "lucide-react"

interface PracticeCanvasProps {
  character: string
  size?: number
}

export default function PracticeCanvas({ character, size = 300 }: PracticeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        setContext(ctx)
        setupCanvas(ctx, canvas)
      }
    }
  }, [])

  const setupCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Set canvas size
    canvas.width = size
    canvas.height = size

    // Set drawing styles
    ctx.strokeStyle = "#1f2937"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Draw grid
    drawGrid(ctx, canvas)
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.save()
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 0.5

    // Draw grid lines
    const gridSize = 20
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw center guidelines
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    // Vertical center line
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Horizontal center line
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

    ctx.restore()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return

    setIsDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      context.beginPath()
      context.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      context.lineTo(x, y)
      context.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    drawGrid(context, canvasRef.current)
  }

  const downloadCanvas = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `${character}-practice.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Luyện viết: {character}</h3>
        <p className="text-sm text-gray-600">Vẽ trực tiếp lên canvas để luyện tập</p>
      </div>

      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ width: size, height: size }}
        />
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={clearCanvas}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          <RotateCcw size={16} />
          Xóa hết
        </button>

        <button
          onClick={downloadCanvas}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <Download size={16} />
          Tải xuống
        </button>
      </div>
    </div>
  )
}
