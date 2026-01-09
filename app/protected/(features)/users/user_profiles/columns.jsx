'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "first_name", header: "First Name" },
  { accessorKey: "last_name", header: "Last Name" },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        userLevel={userLevel} 
        onView={onView}
        onEdit={onEdit} 
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="User Profile" 
      />
    )
  },
];
