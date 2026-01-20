'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addTicketCommentAction } from "@/lib/actions/tickets"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AddCommentModal({ ticketId, isOpen, onClose }) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const result = await addTicketCommentAction(ticketId, message)
    
    if (result.success) {
      toast.success("Comment has been added")
      setMessage("")
      onClose()
    } else {
      toast.error(result.error || "An error occurred")
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-border/60 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl">Add comment</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Enter your response..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px] resize-none bg-muted/20 focus-visible:ring-primary/30"
          />
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            Your response will be attached to the ticket history.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || message.trim().length < 3}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
