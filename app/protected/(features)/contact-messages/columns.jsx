'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";
import { Mail } from "lucide-react";

export const getContactMessagesColumns = (userLevel, onView, onRespond, onDelete, onReactivate) => [
  { accessorKey: "created_at", 
    header: "Received Date",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString()
  },
  { accessorKey: "sender_name", header: "Sender Name" },
  { accessorKey: "sender_email", header: "Sender Email" },
  { accessorKey: "subject", header: "Subject" },
  { accessorKey: "status", 
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const colors = {
        'New': 'bg-red-100 text-red-700',
        'Responded': 'bg-green-100 text-green-700'
      };
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
          {status}
        </span>
      );
    }
  },
  { accessorKey: "responded_at", 
    header: "Responded Date",
    cell: ({ row }) => {
     const value = row.getValue("responded_at");

     if(!value)
      return <span className="text-muted-foreground">-</span>
      return new Date(value).toLocaleDateString();
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        userLevel={userLevel} 
        onView={onView}
        onEdit={onRespond} 
        onDelete={onDelete}
        onReactivate={onReactivate}
        entityName="Contact Message" 
        editLabel="Respond to message" 
        editIcon={Mail}
      />
    )
  },
];