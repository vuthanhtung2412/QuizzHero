"use client"

import { useState, useRef, useCallback } from "react"

export interface AudioRecording {
  id: string
  blob: Blob
  url: string
  duration: number
  timestamp: Date
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<AudioRecording[]>([])
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordingStartTimeRef = useRef<number>(0)

  const requestMicrophonePermission = useCallback(async () => {
    try {
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)
      return stream
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setHasPermission(false)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const init = useCallback(async () => {
    await requestMicrophonePermission()
  }, [requestMicrophonePermission])

  const startRecording = useCallback(async () => {
    if (isRecording) return

    const stream = await requestMicrophonePermission()
    if (!stream) return

    streamRef.current = stream
    audioChunksRef.current = []
    recordingStartTimeRef.current = Date.now()

    // Try to use audio/mp4 first, fallback to audio/webm
    const mimeType = MediaRecorder.isTypeSupported('audio/mp4') 
      ? 'audio/mp4' 
      : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/ogg';

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 128000
    })
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
      const audioUrl = URL.createObjectURL(audioBlob)
      const duration = Date.now() - recordingStartTimeRef.current

      const newRecording: AudioRecording = {
        id: Date.now().toString(),
        blob: audioBlob,
        url: audioUrl,
        duration,
        timestamp: new Date(),
      }

      setRecordings((prev) => [...prev, newRecording])

      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }

    // Request data more frequently for better streaming
    mediaRecorder.start(100) // Get data every 100ms
    setIsRecording(true)
  }, [isRecording, requestMicrophonePermission])

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }, [isRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const recording = prev.find((r) => r.id === id)
      if (recording) {
        URL.revokeObjectURL(recording.url)
      }
      return prev.filter((r) => r.id !== id)
    })
  }, [])

  const clearAllRecordings = useCallback(() => {
    recordings.forEach((recording) => {
      URL.revokeObjectURL(recording.url)
    })
    setRecordings([])
  }, [recordings])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    recordings.forEach((recording) => {
      URL.revokeObjectURL(recording.url)
    })
  }, [recordings])

  return {
    isRecording,
    recordings,
    hasPermission,
    isLoading,
    startRecording,
    stopRecording,
    toggleRecording,
    deleteRecording,
    clearAllRecordings,
    cleanup,
    init,
  }
}
