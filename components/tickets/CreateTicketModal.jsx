'use client'

import { useState, useRef } from "react"
import { createTicketAction } from "@/lib/actions/tickets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Paperclip, Loader2, X } from "lucide-react"

export default function CreateTicketModal({ onClose, priorities = [] }) {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("File is too large (max 1MB)")
        event.target.value = ""
        return
      }
      setFileName(file.name)
    } else {
      setFileName(null)
    }
  }

  const clearFile = () => {
    setFileName(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (formData) => {
    setLoading(true)
    
    //server action
    const result = await createTicketAction(formData)

    if (result.success) {
      toast.success("Ticket created successfully")
      onClose() //close modal
    } else {
      toast.error(result.error || "Failed to create ticket")
    }
    
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <Input name="subject" placeholder="Brief summary of the issue" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          {/* default prio: normal */}
          <Select name="priority_id" required defaultValue={priorities[2]?.id}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(priority => (
                <SelectItem key={priority.id} value={priority.id}>{priority.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea 
          name="message" 
          placeholder="Please describe the issue in detail..." 
          className="min-h-[120px]" 
          required 
        />
      </div>

      {/* file section */}
      <div className="bg-muted/30 p-3 rounded-md border border-dashed border-muted-foreground/25">
        <input 
          type="file" 
          name="attachment" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="ticket-attachment"
        />
        
        {!fileName ? (
          <label 
            htmlFor="ticket-attachment" 
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-2"
          >
            <Paperclip className="w-4 h-4" />
            <span>Attach a file (optional)</span>
          </label>
        ) : (
          <div className="flex items-center justify-between text-sm bg-background p-2 rounded border">
            <span className="truncate max-w-[200px] flex items-center gap-2">
                <Paperclip className="w-3 h-3 text-muted-foreground" />
                {fileName}
            </span>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile}>
                <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Submit Ticket
        </Button>
      </div>
    </form>
  )
}