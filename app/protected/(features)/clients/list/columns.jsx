'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "name", header: "Client Name" },
  { accessorKey: "nip", header: "NIP" },
  { accessorKey: "created_by", header: "Created By",
    cell: ({ row }) => {
      const creatorName = row.original.users?.user_profiles?.first_name && row.original.users?.user_profiles?.last_name
        ? `${row.original.users.user_profiles.first_name} ${row.original.users.user_profiles.last_name}`
        : row.original.users?.email || "Unknown";
      return <span>{creatorName}</span>;
    }
  },
  { accessorKey: "created_at", header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at");
      return <span>{new Date(createdAt).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "deleted_at", header: "Status",
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
        onEdit={onEdit} 
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Client" 
      />
    )
  },
];
