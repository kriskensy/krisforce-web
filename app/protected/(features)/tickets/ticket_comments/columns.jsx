'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "ticket_id", header: "Ticket",
    cell: ({ row }) => {
      const ticketNumber = row.original.tickets?.ticket_number;
      return <span>{ticketNumber || "No ticket"}</span>;
    }
  },
  { accessorKey: "user_id", header: "User",
    cell: ({ row }) => {
      const profile = row.original.user_profiles;
      const fullName = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile?.first_name || "Unknown";
      return <span>{fullName}</span>;
    }
  },
  { accessorKey: "message", header: "Comment" },
  { accessorKey: "created_at", header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at");
      return <span>{createdAt ? new Date(createdAt).toLocaleString() : ""}</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        userLevel={userLevel}
        onEdit={onEdit}
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Ticket Comment"
      />
    )
  },
];
