'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onCreateInvoice, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "client_id", header: "Client",
    cell: ({ row }) => {
      const clientName = row.original.clients?.name;
      return <span>{clientName || "No client"}</span>;
    }
  },
  { accessorKey: "order_number", header: "Order Number" },
  { accessorKey: "order_date", header: "Order Date",
    cell: ({ row }) => {
      const orderDate = row.getValue("order_date");
      return <span>{new Date(orderDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "order_status_id", header: "Status",
    cell: ({ row }) => {
      const statusName = row.original.order_statuses?.name;
      return <span>{statusName || "No status"}</span>;
    }
  },
  { accessorKey: "total_amount", header: "Total Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"));
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
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
        onCreateInvoice={onCreateInvoice}
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Order" 
      />
    )
  },
];
