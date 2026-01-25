'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate, onAddComment) => [
  { accessorKey: "ticket_number", header: "Ticket Number" },
  { accessorKey: "subject", header: "Title" },
  { accessorKey: "client_id", header: "Client",
    cell: ({ row }) => {
      const clientName = row.original.clients?.name;
      return <span>{clientName || "No client"}</span>;
    }
  },
  { accessorKey: "ticket_status_id", header: "Status",
    cell: ({ row }) => {
      const statusName = row.original.ticket_statuses?.name;
      return <span>{statusName || "No status"}</span>;
    }
  },
  { accessorKey: "ticket_priority_id", header: "Priority",
    cell: ({ row }) => {
      const priorityName = row.original.ticket_priorities?.name;
      return <span>{priorityName || "No priority"}</span>;
    }
  },
  { accessorKey: "created_at", header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at");
      return <span>{new Date(createdAt).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "deleted_at", header: "Record Status in DB",
    cell: ({ row }) => {
      const deletedAt = row.getValue("deleted_at");

      if(!deletedAt) {
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Active
          </span>
        );
      }

      return (
        <span className="text-muted-foreground text-xs">
          Deactivated: {new Date(deletedAt).toLocaleDateString()}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        userLevel={userLevel} 
        onView={onView}
        onEdit={onEdit} 
        onAddComment={onAddComment}
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Ticket" 
      />
    )
  },
];
