'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
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
  { accessorKey: "content", header: "Comment" },
  { accessorKey: "created_at", header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at");
      return <span>{createdAt ? new Date(createdAt).toLocaleString() : ""}</span>;
    }
  },
  { accessorKey: "is_internal", header: "Internal?",
    cell: ({ row }) => {
      const isInternal = row.getValue("is_internal");
      if (isInternal) {
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            Internal
          </span>
        );
      }
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          Public
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
        onEdit={onEdit}
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Ticket Comment"
      />
    )
  },
];
