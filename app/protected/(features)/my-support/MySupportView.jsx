'use client'

import { useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import CreateTicketModal from "@/components/tickets/CreateTicketModal"
import TicketDetailsModal from "@/components/tickets/TicketDetailsModal"
import AddCommentModal from "@/components/tickets/AddCommentModal"
import { DataTable } from "@/components/ui/data-table"
import { GLOBAL_COLUMNS_REGISTRY } from "@/lib/configs/columns-registry";

export default function MySupportView({ tickets, priorities, statuses, searchParams, userLevel }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams?.search || '')
  const [viewTicketId, setViewTicketId] = useState(null)
  const [replyTicketId, setReplyTicketId] = useState(null)

  const columns = useMemo(() => {
    const getColumns = GLOBAL_COLUMNS_REGISTRY['my-support']; //tickets from columns-registry
    
    return getColumns(
      userLevel,
      (ticket) => setViewTicketId(ticket.id), // onView
      (ticket) => setReplyTicketId(ticket.id), // onAddComment (onEdit)
    );
  }, [userLevel]);

  const handleSearch = (item) => {
    setSearchValue(item)
    const params = new URLSearchParams(searchParams)
    if (item) params.set('search', item)
    else params.delete('search')
    params.set('page', '1')
    router.replace(`${pathname}?${params.toString()}`)
  }

  const handleStatusFilter = (statusId) => {
    const params = new URLSearchParams(searchParams)
    if (statusId && statusId !== 'all') params.set('status', statusId)
    else params.delete('status')
    params.set('page', '1')
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-8"
              value={searchValue}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>
          
          <Select 
            defaultValue={searchParams?.status || 'all'} 
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Ticket
        </Button>
      </div>

      {/* table on column definition */}
      <div className="rounded-md border">
        <DataTable 
          columns={columns} 
          data={tickets}
        />
      </div>

      {/* create ticket modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          
          <CreateTicketModal 
            onClose={() => setIsCreateOpen(false)} 
            priorities={priorities}
          />
        </DialogContent>
      </Dialog>

      {/* view ticket details modal */}
      <TicketDetailsModal
        ticketId={viewTicketId} 
        isOpen={!!viewTicketId} 
        onClose={() => setViewTicketId(null)}
      />

      {/* add ticket comment modal */}
      <AddCommentModal 
        ticketId={replyTicketId} 
        isOpen={!!replyTicketId} 
        onClose={() => setReplyTicketId(null)} 
      />
    </div>
  )
}