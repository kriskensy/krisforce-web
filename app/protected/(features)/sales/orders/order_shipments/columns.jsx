'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "order_id", header: "Order",
    cell: ({ row }) => {
      const orderNumber = row.original.orders?.order_number;
      return <span>{orderNumber || "No order"}</span>;
    }
  },
  { accessorKey: "shipment_date", header: "Shipment Date",
    cell: ({ row }) => {
      const shipmentDate = row.getValue("shipment_date");
      return <span>{new Date(shipmentDate).toLocaleDateString()}</span>;
    }
  },
  { accessorKey: "tracking_number", header: "Tracking Number" },
  { accessorKey: "carrier", header: "Carrier" },
  { accessorKey: "expected_delivery_date", header: "Expected Delivery",
    cell: ({ row }) => {
      const expectedDate = row.getValue("expected_delivery_date");
      return <span>{expectedDate ? new Date(expectedDate).toLocaleDateString() : "N/A"}</span>;
    }
  },
  { accessorKey: "actual_delivery_date", header: "Actual Delivery",
    cell: ({ row }) => {
      const actualDate = row.getValue("actual_delivery_date");
      return <span>{actualDate ? new Date(actualDate).toLocaleDateString() : "Pending"}</span>;
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
        entityName="Order Shipment" 
      />
    )
  },
];
