'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "order_id", header: "Order",
    cell: ({ row }) => {
      const orderNumber = row.original.orders?.order_number;
      return <span>{orderNumber || "No order"}</span>;
    }
  },
  { accessorKey: "old_status_id", header: "Old Status",
    cell: ({ row }) => {
      const statusName = row.original.old_status?.name; //alias from order_workflow domain file
      return <span>{statusName || "No status"}</span>;
    }
  },
  { accessorKey: "new_status_id", header: "New Status",
    cell: ({ row }) => {
      const statusName = row.original.new_status?.name; //alias from order_workflow domain file
      return <span>{statusName || "No status"}</span>;
    }
  },
  { accessorKey: "changed_at", header: "Changed At",
    cell: ({ row }) => {
      const changedAt = row.getValue("changed_at");
      return <span>{new Date(changedAt).toLocaleDateString()}</span>;
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
        entityName="Order Workflow" 
      />
    )
  },
];
