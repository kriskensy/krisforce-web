'use client';

import { DataTableRowActions } from "@/components/crud/DataTableRowActions";

export const getColumns = (userLevel, onEdit, onDeactivate, onReactivate) => [
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role_id", header: "Role",
    cell: ({ row }) => {
      const roleName = row.original.roles?.name;
      return <span>{roleName || "No role"}</span>;
    }
  },
  { accessorKey: "user_id", header: "Full Name",
    cell: ({ row }) => {
      const profile = row.original.user_profiles;
      const fullName = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : "Unknown";
      return <span>{fullName}</span>;
    }
  },
  { accessorKey: "active", header: "Status",
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
        onEdit={onEdit} 
        onDelete={onDeactivate}
        onReactivate={onReactivate}
        entityName="User" 
      />
    )
  },
];
