'use client';

import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusStyles } from "@/lib/utils/features/getStatusStyles";
import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getMySupportColumns = (userLevel, onView, onAddComment, onDelete, onReactivate) => [
  {
    accessorKey: "ticket_number",
    header: "Ticket ID",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <span className="font-medium font-mono text-xs">
          {ticket.ticket_number || ticket.id.slice(0, 8)}
        </span>
      );
    }
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priorityName = row.original.ticket_priorities?.name;
      return (
        <Badge 
          variant="outline" 
          className={getStatusStyles(priorityName, 'ticketsPriority')}
        >
          {priorityName}
        </Badge>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusName = row.original.ticket_statuses?.name;

      return (
        <Badge 
          variant="outline"
          className={getStatusStyles(statusName, 'ticket')}
        >
          {statusName}
        </Badge>
      );
    }
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => format(new Date(row.getValue("created_at")), 'MMM d, yyyy')
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <DataTableRowActions 
          row={row} 
          userLevel={userLevel} 
          onView={onView}
          onEdit={onAddComment}
          onDelete={onDelete}
          onReactivate={onReactivate}
          entityName="Ticket" 
          editLabel="Add Comment" 
          editIcon={MessageSquare}
        />
      </div>
    )
  },
];