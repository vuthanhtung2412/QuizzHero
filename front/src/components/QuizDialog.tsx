"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Mic, X, Square, Loader2, ArrowRight,Volume2 } from "lucide-react"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"

export function QuizDialog(
  props: {
    photosBase64Url?: string[]
  }
) {
  const [open, setOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingFeedback, setIsPlayingFeedback] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string | null>(null)
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedFeedbackRef = useRef<string | null>(null);

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

  const playAudio = async (transcript: string) => {
    try {
      setIsPlayingAudio(true);
      const response = await fetch('/api/t2p', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) throw new Error('Failed to get audio');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  };

    const playFeedbackAudio = async (feedbackText: string) => {
      try {
        setIsPlayingFeedback(true);
        const response = await fetch('/api/t2p', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript: feedbackText }),
        });

        if (!response.ok) throw new Error('Failed to get feedback audio');

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
        }
      } catch (error) {
        console.error('Error playing feedback audio:', error);
      } finally {
        setIsPlayingFeedback(false);
      }
    };


  // Upload photos when sessionId becomes available and dialog is open
  useEffect(() => {
    if (open && sessionId && props.photosBase64Url && props.photosBase64Url.length > 0) {
      const uploadPhotosAndGetQuestion = async () => {
        try {
          // Reset states and start loading
          setCurrentQuestion(null);
          setQuestionError(null);
          setUserTranscript(null);
          setAiFeedback(null);
          setIsProcessingAnswer(false);
          setIsLoadingQuestion(true);
          setIsQuestionReady(false);

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
              setIsLoadingQuestion(false);
              console.log("Here is the obtained question", questionData.question)

              // Play audio and mark as ready when audio finishes
              await playAudio(questionData.question);
              setIsQuestionReady(true);
            } else {
              setQuestionError('Failed to load question');
              setIsLoadingQuestion(false);
            }
          } else {
            console.error('Failed to upload photos:', data.error);
            setQuestionError('Failed to upload photos');
            setIsLoadingQuestion(false);
          }
        } catch (error) {
          console.error('Error uploading photos:', error);
          setQuestionError('Failed to load question');
          setIsLoadingQuestion(false);
        }
      }
      uploadPhotosAndGetQuestion()
    }
  }, [open, sessionId, props.photosBase64Url])

  // Monitor recordings for transcript and feedback updates
  useEffect(() => {
    if (recordings.length > 0) {
      const latestRecording = recordings[recordings.length - 1];
      if (latestRecording.transcript) {
        setUserTranscript(latestRecording.transcript);
        setAiFeedback(latestRecording.feedback || null);
        setIsProcessingAnswer(false);

        // Auto-play feedback audio when it becomes available (only if we haven't played this feedback before)
        if (latestRecording.feedback &&
            latestRecording.feedback !== lastPlayedFeedbackRef.current &&
            !isPlayingAudio &&
            !isPlayingFeedback) {
          lastPlayedFeedbackRef.current = latestRecording.feedback;
          playFeedbackAudio(latestRecording.feedback);
        }
      }
    }
  }, [recordings])

  // Monitor recording state to show processing indicator
  useEffect(() => {
    if (isRecording) {
      setUserTranscript(null);
      setAiFeedback(null);
      setIsProcessingAnswer(false);
      // Reset the last played feedback ref when starting a new recording
      lastPlayedFeedbackRef.current = null;
    } else if (!isRecording && recordings.length > 0) {
      const latestRecording = recordings[recordings.length - 1];
      if (!latestRecording.transcript) {
        setIsProcessingAnswer(true);
      }
    }
  }, [isRecording, recordings])

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const handleNextQuestion = async () => {
    try {
      // Reset previous answer and feedback before loading new question
      setUserTranscript(null);
      setAiFeedback(null);
      setIsProcessingAnswer(false);
      setIsLoadingQuestion(true);
      setIsQuestionReady(false);
      setQuestionError(null);

      const questionResponse = await fetch(`/api/session/${sessionId}/question`);
      if (questionResponse.ok) {
        const questionData = await questionResponse.json();
        setCurrentQuestion(questionData.question);
        setIsLoadingQuestion(false);

        // Play audio and mark as ready when audio finishes
        await playAudio(questionData.question);
        setIsQuestionReady(true);
      } else {
        setQuestionError('Failed to load question');
        setIsLoadingQuestion(false);
      }
    } catch (error) {
      console.error('Error loading next question:', error);
      setQuestionError('Failed to load question');
      setIsLoadingQuestion(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mic className="w-4 h-4 mr-2" />
          Start Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle> {`Quiz session ${sessionId}`} </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Question Loading State */}
          {isLoadingQuestion && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
              <p className="text-sm text-blue-800">Loading question...</p>
            </div>
          )}

          {/* Question Display Section */}
          {currentQuestion && !isLoadingQuestion && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">Question:</p>
                {isPlayingAudio && (
                  <div className="flex items-center">
                    <Volume2 className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-xs text-blue-600">Preparing audio...</span>
                  </div>
                )}
              </div>
              <p className="text-base text-blue-800">{currentQuestion}</p>
            </div>
          )}

          {/* Error state */}
          {questionError && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">{questionError}</p>
            </div>
          )}

          {/* User Transcript Display */}
          {userTranscript && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">Your Answer:</p>
              <p className="text-base text-green-800">{userTranscript}</p>
            </div>
          )}

          {/* Processing State */}
          {isProcessingAnswer && (
            <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-yellow-600" />
              <p className="text-sm text-yellow-800">Processing answer...</p>
            </div>
          )}

          {/* AI Feedback Display */}
          {aiFeedback && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-900">AI Feedback:</p>
                {isPlayingFeedback && (
                  <div className="flex items-center">
                    <Volume2 className="w-4 h-4 text-purple-600 mr-1" />
                    <span className="text-xs text-purple-600">Loading feedback audio...</span>
                  </div>
                )}
              </div>
              <p className="text-base text-purple-800">{aiFeedback}</p>
            </div>
          )}
        </div>

        {/* Fixed Recording Section */}
        <div className="flex-shrink-0 flex flex-col items-center space-y-6 py-4 border-t">
          {hasPermission === false && (
            <div className="text-sm text-red-500 text-center">
              Microphone access denied. Please enable microphone permissions and try again.
            </div>
          )}
        <audio ref={audioRef} onEnded={() => {
          setIsPlayingAudio(false);
          setIsPlayingFeedback(false);
        }} />

          {/* Show loading state when question is not ready */}
          {(isLoadingQuestion || isPlayingAudio || !isQuestionReady) && !questionError ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
              <div className="text-sm text-muted-foreground text-center">
                {isLoadingQuestion
                  ? "Loading question..."
                  : isPlayingAudio
                    ? "Preparing audio..."
                    : "Getting ready..."
                }
              </div>
            </div>
          ) : (
            /* Show record button when question is ready */
            <>
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="w-20 h-20 rounded-full"
                onClick={toggleRecording}
                disabled={hasPermission === false || isLoading || !isQuestionReady}
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
            </>
          )}
        </div>


        <DialogFooter>
          <div className="flex justify-between w-full gap-4">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button
              className="flex-1 flex items-center justify-center"
              onClick={handleNextQuestion}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Next Question
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
