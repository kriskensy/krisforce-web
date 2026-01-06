'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "invoice_number", header: "Invoice Number" },
  { accessorKey: "client_id", header: "Client",
    cell: ({ row }) => {
      const clientName = row.original.clients?.name;
      return <span>{clientName || "No client"}</span>;
    }
  },
  { accessorKey: "order_id", header: "Order",
    cell: ({ row }) => {
      const orderNumber = row.original.orders?.order_number;
      return <span>{orderNumber || "No order"}</span>;
    }
  },
  { accessorKey: "invoice_date", header: "Invoice Date",
    cell: ({ row }) => {
      const invoiceDate = row.getValue("invoice_date");
      return <span>{new Date(invoiceDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "due_date", header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date");
      return <span>{new Date(dueDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "invoice_status_id", header: "Status",
    cell: ({ row }) => {
      const statusName = row.original.invoice_statuses?.name;
      return <span>{statusName || "No status"}</span>;
    }
  },
  { accessorKey: "paid_amount", header: "Paid Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("paid_amount") || 0);
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
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
        entityName="Invoice" 
      />
    )
  },
];
