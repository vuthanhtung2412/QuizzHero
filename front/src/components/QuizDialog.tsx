"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Play, Pause, Trash2, X, Square, Loader2 } from "lucide-react"
import { useVoiceRecorder, type AudioRecording } from "@/hooks/use-voice-recorder"

export function QuizDialog(
  // TODO: property to access the list of images
  props: {
    photos?: string[] // Optional array of image URLs
  }
) {
  const [open, setOpen] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const {
    isRecording,
    recordings,
    hasPermission,
    isLoading,
    sessionId,
    toggleRecording,
    deleteRecording,
    cleanup,
    init
  } = useVoiceRecorder()

  // Handle dialog open/close
  // TODO: send the images to the backend
  const handleOpenChange = useCallback(async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      await init()
    }
  }, [init])

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const playRecording = useCallback(
    async (recording: AudioRecording) => {
      if (playingId === recording.id) {
        setPlayingId(null)
        return
      }

      try {
        const audio = new Audio(recording.url)

        // Wait for audio to be loaded before playing
        await new Promise((resolve, reject) => {
          audio.oncanplaythrough = resolve
          audio.onerror = reject
          audio.load()
        })

        setPlayingId(recording.id)

        audio.onended = () => {
          setPlayingId(null)
        }

        audio.onerror = (e) => {
          console.error('Audio playback error:', e)
          setPlayingId(null)
        }

        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Playback failed:', error)
            setPlayingId(null)
          })
        }
      } catch (error) {
        console.error('Error setting up audio:', error)
        setPlayingId(null)
      }
    },
    [playingId],
  )

  const handleDeleteRecording = useCallback(
    (id: string) => {
      deleteRecording(id)
      if (playingId === id) {
        setPlayingId(null)
      }
    },
    [deleteRecording, playingId],
  )

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mic className="w-4 h-4 mr-2" />
          Start Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle> {`Quiz session ${sessionId}`} </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {hasPermission === false && (
            <div className="text-sm text-red-500 text-center">
              Microphone access denied. Please enable microphone permissions and try again.
            </div>
          )}

          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className="w-20 h-20 rounded-full"
            onClick={toggleRecording}
            disabled={hasPermission === false || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isRecording ? (
              <Square className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            {isLoading
              ? "Setting up microphone..."
              : isRecording
                ? "Recording... Click to stop"
                : "Click to start recording"
            }
          </div>
        </div>

        {recordings.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <h4 className="text-sm font-medium">Recordings ({recordings.length})</h4>
            {recordings.map((recording) => (
              <Card key={recording.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => playRecording(recording)}>
                        {playingId === recording.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        <div>{formatDuration(recording.duration)}</div>
                        <div>{formatTimestamp(recording.timestamp)}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteRecording(recording.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" className="mx-auto" onClick={() => setOpen(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
