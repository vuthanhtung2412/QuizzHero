"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Mic, X, Square, Loader2 } from "lucide-react"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"

export function QuizDialog(
  props: {
    photosBase64Url?: string[]
  }
) {
  const [open, setOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [questionError, setQuestionError] = useState<string | null>(null)

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

  // Handle dialog open/close
  const handleOpenChange = useCallback(async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      await init()
    }
  }, [init])

  // Upload photos when sessionId becomes available and dialog is open
  useEffect(() => {
    if (open && sessionId && props.photosBase64Url && props.photosBase64Url.length > 0) {
      const uploadPhotosAndGetQuestion = async () => {
        try {
          // Reset states
          setCurrentQuestion(null);
          setQuestionError(null);

          // Upload photos
          const photos = props.photosBase64Url!.map(base64Url => ({ base64Url }));
          const response = await fetch(`/api/session/${sessionId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photos })
          });

          const data = await response.json();

          if (response.ok) {
            console.log('Photos uploaded successfully:', data.message);

            // Fetch the first question after successful photo upload
            const questionResponse = await fetch(`/api/session/${sessionId}/question`);

            if (questionResponse.ok) {
              const questionData = await questionResponse.json();
              setCurrentQuestion(questionData.question);
              console.log("Here is the obtained question", questionData.question)
            } else {
              setQuestionError('Failed to load question');
            }
          } else {
            console.error('Failed to upload photos:', data.error);
            setQuestionError('Failed to upload photos');
          }
        } catch (error) {
          console.error('Error uploading photos:', error);
          setQuestionError('Failed to load question');
        }
      }
      uploadPhotosAndGetQuestion()
    }
  }, [open, sessionId, props.photosBase64Url])

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

        {/* Question Display Section */}
        {currentQuestion && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Question:</p>
            <p className="text-base text-blue-800">{currentQuestion}</p>
          </div>
        )}

        {/* Error state */}
        {questionError && (
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-600">{questionError}</p>
          </div>
        )}

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
