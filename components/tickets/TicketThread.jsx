'use client'

import { format } from "date-fns"
import { MessageSquare, User, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function TicketThread({ comments = [], authorId }) {
  const sortedComments = [...comments].sort(
    (commentA, commentB) => new Date(commentB.created_at) - new Date(commentA.created_at)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Communication Thread
          </span>
        </div>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-4">
        {sortedComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-3xl bg-muted/5">
            <div className="p-3 bg-muted rounded-full mb-3">
              <MessageSquare className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No comments yet.</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div 
              key={comment.id} 
              className="group bg-card dark:bg-zinc-900/50 border border-border/60 rounded-2xl p-5 hover:border-primary/30 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {comment.user_profiles?.first_name} {comment.user_profiles?.last_name}
                    </p>
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 uppercase font-black">
                      {comment.user_id === authorId ? 'Author' : 'Support'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border">
                  <Clock className="h-3 w-3" />
                  {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                </div>
              </div>

              <div className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                {comment.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}