"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { useState } from "react"

export function QuizDialog() {
  const [sessionId, setSessionId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleTakeQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.session_id);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={handleTakeQuiz}
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Take Quiz"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{`Quiz Session ${sessionId}`}</DialogTitle>
        </DialogHeader>
        <Button
          onClick={() => {
            alert("Quiz started");
          }}
          disabled={!sessionId}
        >
          Answer
        </Button>
        <DialogFooter>
          <br />
          <DialogClose asChild>
            <Button
              onClick={() => {
                alert("Quiz stopped");
              }}
            >
              Stop Quiz
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

