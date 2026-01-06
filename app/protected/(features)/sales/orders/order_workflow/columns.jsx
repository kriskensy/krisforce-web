'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "order_id", header: "Order",
    cell: ({ row }) => {
      const orderNumber = row.original.orders?.order_number;
      return <span>{orderNumber || "No order"}</span>;
    }
  },
  { accessorKey: "from_status_id", header: "From Status",
    cell: ({ row }) => {
      const statusName = row.original.order_statuses_from?.name;
      return <span>{statusName || "No status"}</span>;
    }
  },
  { accessorKey: "to_status_id", header: "To Status",
    cell: ({ row }) => {
      const statusName = row.original.order_statuses_to?.name;
      return <span>{statusName || "No status"}</span>;
    }
  },
  { accessorKey: "changed_at", header: "Changed At",
    cell: ({ row }) => {
      const changedAt = row.getValue("changed_at");
      return <span>{new Date(changedAt).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "reason", header: "Reason" },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        userLevel={userLevel} 
        onEdit={onEdit} 
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="Order Workflow" 
      />
    )
  },
];
