'use client'

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Plus, Search, Filter, MessageSquare, MoreHorizontal, FileText} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import CreateTicketModal from "@/components/tickets/CreateTicketModal"
import { getStatusStyles } from "@/lib/utils/features/getStatusStyles"

export default function MySupportView({ tickets, priorities, statuses, searchParams }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams?.search || '')

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
          Open New Ticket
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium font-mono text-xs">
                    {ticket.ticket_number || ticket.id.slice(0, 8)}
                  </TableCell>
                  
                  <TableCell>
                    <Link 
                      href={`/protected/my-support/${ticket.id}`} 
                      className="font-medium hover:underline flex items-center gap-2"
                    >
                      {ticket.subject}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={getStatusStyles(ticket.ticket_priorities?.name, 'ticketsPriority')}>
                      {ticket.ticket_priorities?.name}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className={getStatusStyles(ticket.ticket_statuses?.name, 'ticket')}>
                      {ticket.ticket_statuses?.name}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/protected/my-support/${ticket.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', (Number(searchParams.page || 1) - 1).toString());
            router.push(`${pathname}?${params.toString()}`);
          }}
          disabled={(Number(searchParams?.page) || 1) <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', (Number(searchParams.page || 1) + 1).toString());
            router.push(`${pathname}?${params.toString()}`);
          }}
          disabled={tickets.length < (Number(searchParams?.limit) || 10)}
        >
          Next
        </Button>
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
    </div>
  )
}