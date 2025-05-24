"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mic, X, Square, Loader2 } from "lucide-react"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"

export function QuizDialog(
  // TODO: property to access the list of images
  props: {
    photos?: string[] // Optional array of image URLs
  }
) {
  const [open, setOpen] = useState(false)

  const {
    isRecording,
    recordings,
    hasPermission,
    isLoading,
    sessionId,
    toggleRecording,
    cleanup,
    init
  } = useVoiceRecorder()

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
                ? "Recording answer... Click to stop"
                : "Click to answer"
            }
          </div>
        </div>

        {/* to be removed */}
        <div>
          {recordings.length}
        </div>

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
