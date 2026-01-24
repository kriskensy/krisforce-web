'use client'

import { useEffect, useState } from "react"
import { GenericDetailsModal } from "@/components/crud/GenericDetailsModal"
import { getTicketDetailsAction } from "@/lib/actions/tickets" 
import { Download, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { getStatusStyles } from "@/lib/utils/features/getStatusStyles"
import { TicketThread } from "./TicketThread"

export default function TicketDetailsModal({ ticketId, isOpen, onClose }) {
  const [ticketData, setTicketData] = useState(null)
  const [loading, setLoading] = useState(false)

  //get data
  useEffect(() => {
    async function fetchData() {
      if (isOpen && ticketId) {
        setLoading(true)
        try {
          const res = await getTicketDetailsAction(ticketId)
          if (res.success) {
            setTicketData(res.data)
          } else {
            console.error("Failed to fetch ticket details:", res.error)
          }
        } catch (err) {
          console.error("Unexpected error:", err)
        } finally {
          setLoading(false)
        }
      } else {
        setTicketData(null) //data reset
      }
    }

    fetchData()
  }, [isOpen, ticketId])

  //modal fields
  const fields = [
    { name: 'ticket_number', label: 'Ticket Reference' },
    { name: 'created_at', label: 'Submission Date', isDate: true },
    { name: 'priority_id', label: 'Priority Level',
      format: (_, item) => (
        <Badge variant="outline" className={getStatusStyles(item.ticket_priorities?.name, 'ticketsPriority')}>
          {item.ticket_priorities?.name || 'Standard'}
        </Badge>
      )},
    { name: 'status_id', label: 'Current Status',
      format: (_, item) => (
        <Badge variant="outline" className={getStatusStyles(item.ticket_statuses?.name, 'ticket')}>
          {item.ticket_statuses?.name || 'New'}
        </Badge>
      )},
    { name: 'created_by_name', label: 'Created by' },
    { name: 'assigned_to_name', label: 'Assigned to' },
    { name: 'subject', label: 'Subject', fullWidth: true },
    { name: 'description', label: 'Detailed Description', fullWidth: true },
    {
      name: 'attachments', //key 'attachments' from domain function
      label: 'Attachment',
      format: (attachments) => {
        const file = attachments?.[0]; //relation 1:1
        
        if (!file?.signedUrl) return <span className="text-muted-foreground/40 text-xs italic">No attachment</span>;

        return (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 border-dashed bg-primary/5 hover:bg-primary/10 border-primary/20"
            asChild
          >
            <a href={file.signedUrl} target="_blank" rel="noopener noreferrer">
              <Paperclip className="h-3.5 w-3.5 text-primary" />
              <span className="truncate max-w-[150px] text-[11px] font-semibold">
                {file.filename}
              </span>
              <Download className="h-3 w-3 opacity-40" />
            </a>
          </Button>
        );
      }
    },
  ]

  return (
    <GenericDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ticket #${ticketData?.ticket_number || '...'}`}
      item={ticketData}
      fields={fields}
      isLoading={loading}
    >
    
    <TicketThread
      comments={ticketData?.ticket_comments} 
      authorId={ticketData?.user_id}
    />
    </GenericDetailsModal>
  )
}