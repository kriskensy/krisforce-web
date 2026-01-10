'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "code", header: "Code" },
  { accessorKey: "name", header: "Payment Method" },
  { accessorKey: "active", header: "Record Status in DB",
    cell: ({ row }) => {
      const isActive = row.getValue("active");

      if(isActive) {
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Active
          </span>
        );
      }

      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          Inactive
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
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Payment Method" 
      />
    )
  },
];
