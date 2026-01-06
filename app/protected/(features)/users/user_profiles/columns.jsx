'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "first_name", header: "First Name" },
  { accessorKey: "last_name", header: "Last Name" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "user_id", header: "User Email",
    cell: ({ row }) => {
      const userEmail = row.original.users?.email;
      return <span>{userEmail || "No email"}</span>;
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
        entityName="User Profile" 
      />
    )
  },
];
