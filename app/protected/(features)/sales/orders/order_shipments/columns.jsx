'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onView, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "order_id", header: "Order",
    cell: ({ row }) => {
      const orderNumber = row.original.orders?.order_number;
      return <span>{orderNumber || "No order"}</span>;
    }
  },
  { accessorKey: "shipped_date", header: "Shipment Date",
    cell: ({ row }) => {
      const shipmentDate = row.getValue("shipped_date");
      return <span>{new Date(shipmentDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "tracking_number", header: "Tracking Number" },
  { accessorKey: "carrier", header: "Carrier" },
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
        entityName="Order Shipment" 
      />
    )
  },
];
