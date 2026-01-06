'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function DisplayActiveOnlyRecordsCheckbox({ showActiveOnly, onActiveChange, tableKey }) {
  const excludedTables = [
    'invoice_items',
    'order_items',
    'order_shipments',
    'order_workflow',
    'ticket_attachments',
    'ticket_comments',
    'users',
    'user_profiles',
  ];
  
  if (excludedTables.includes(tableKey)) return null;

  return (
    <div className="flex items-center space-x-2 border rounded-md px-3 py-1.5 bg-background shadow-sm transition-all hover:bg-accent/50">
      <Label 
        htmlFor="active-filter" 
        className="text-xs font-medium cursor-pointer select-none leading-none"
      >
        Display active only
      </Label>
      <Checkbox 
        id="active-filter" 
        checked={showActiveOnly} 
        onCheckedChange={onActiveChange} 
      />
    </div>
  );
}