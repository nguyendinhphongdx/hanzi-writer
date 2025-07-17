"use client"

import { useCallback, useEffect, useState } from "react"

export interface SpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
      
      const updateVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
      }

      updateVoices()
      speechSynthesis.onvoiceschanged = updateVoices
    }
  }, [])

  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!isSupported || !text.trim()) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set options
    utterance.lang = options.lang || 'zh-CN'
    utterance.rate = options.rate || 0.8
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1

    // Try to find a Chinese voice
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN')
    )
    if (chineseVoice) {
      utterance.voice = chineseVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    speechSynthesis.speak(utterance)
  }, [isSupported, voices])

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const speakPinyin = useCallback((pinyin: string) => {
    // Remove tone marks and speak with English voice for better pinyin pronunciation
    const cleanPinyin = pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    speak(cleanPinyin, { lang: 'en-US', rate: 0.7 })
  }, [speak])

  const speakChinese = useCallback((text: string) => {
    speak(text, { lang: 'zh-CN', rate: 0.8 })
  }, [speak])

  return {
    speak,
    speakPinyin,
    speakChinese,
    stop,
    isSpeaking,
    isSupported
  }
}
