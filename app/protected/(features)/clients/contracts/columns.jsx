'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "client_id", header: "Client",
    cell: ({ row }) => {
      const clientName = row.original.clients?.name;
      return <span>{clientName || "No client"}</span>;
    }
  },
  { accessorKey: "number", header: "Contract Number" },
  { accessorKey: "start_date", header: "Start Date",
    cell: ({ row }) => {
      const startDate = row.getValue("start_date");
      return <span>{new Date(startDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "end_date", header: "End Date",
    cell: ({ row }) => {
      const endDate = row.getValue("end_date");
      return <span>{new Date(endDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "value", header: "Contract Value",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("value"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
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
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Contract" 
      />
    )
  },
];
