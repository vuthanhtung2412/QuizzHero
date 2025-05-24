"use client"

import { useState, useRef, useCallback } from "react"

export interface AudioRecording {
  id: string
  blob: Blob
  url: string
  duration: number
  timestamp: Date
  transcript?: string
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<AudioRecording[]>([])
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(0)

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
    const result = await fetch(`/api/session`, {
      method: 'POST',
    });

    if (!result.ok) {
      throw new Error('Failed to create session');
    }

    const data = await result.json();
    setSessionId(data.session_id);

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

  const stopRecording = useCallback(async () => {
    if (!isRecording || !mediaRecorderRef.current) return

    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) return resolve();

      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Date.now() - recordingStartTimeRef.current;

        const newRecording: AudioRecording = {
          id: Date.now().toString(),
          blob: audioBlob,
          url: audioUrl,
          duration,
          timestamp: new Date(),
        };

        // Convert blob to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        // Send to API immediately with the new recording
        const response = await fetch(`/api/session/${sessionId}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            mimeType: audioBlob.type,
            data: base64Data
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('API Error:', error);
          throw new Error(`API error: ${error.detail?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        alert(data.transcript);

        // Update state after API call
        setRecordings((prev) => [...prev, newRecording]);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        setIsRecording(false);
        resolve();
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording, sessionId]);

  // TODO: get the transcript of the recording
  // then send it the backend and play the audio return from the backend
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
    sessionId,
    startRecording,
    stopRecording,
    toggleRecording,
    deleteRecording,
    clearAllRecordings,
    cleanup,
    init,
  }
}
