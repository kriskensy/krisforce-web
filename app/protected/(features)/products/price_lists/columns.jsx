'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "name", header: "Price List Name" },
  { accessorKey: "valid_from", header: "Valid From",
    cell: ({ row }) => {
      const validFrom = row.getValue("valid_from");
      return validFrom ? new Date(validFrom).toLocaleDateString('de-DE') : "No date";
    }
  },
  { accessorKey: "valid_to", header: "Valid To",
    cell: ({ row }) => {
      const validTo = row.getValue("valid_to");
      return validTo ? new Date(validTo).toLocaleDateString('de-DE') : "No date";
    }
  },
  { accessorKey: "deleted_at", header: "Deactivated?",
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
          Deactivated: {new Date(deletedAt).toLocaleDateString('de-DE')}
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
        entityName="Price List" 
      />
    )
  },
];
