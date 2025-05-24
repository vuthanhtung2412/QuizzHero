import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface QuizDialogProps {
  onClick: () => void;
}

export function QuizDialog({ onClick }: QuizDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={onClick}
        >
          Take Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quiz</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">Answer</Button>
          <br />
          <Button type="submit">Stop Quiz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

