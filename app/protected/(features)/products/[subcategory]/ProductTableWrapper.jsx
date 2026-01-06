'use client';

import { GLOBAL_COLUMNS_REGISTRY } from "@/lib/configs/columns-registry";
import { useState } from 'react';
import { DataTableServer } from '@/components/ui/data-table-server';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DynamicFormModal from '@/components/crud/DynamicFormModal';

export default function ProductTableWrapper({ subcategory, userLevel, apiEndpoint, fields, title, description, tableKey }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
    setRefreshKey(prev => prev + 1);
  };

  const getColumnsFunc = GLOBAL_COLUMNS_REGISTRY[tableKey];

  if (!getColumnsFunc) {
    console.error(`Registry error: No columns for key "${tableKey}"`);
    return (
      <div className="p-4 border border-destructive text-destructive">
        Table configuration error: No columns found for <b>{tableKey}</b>.
      </div>
    );
  }

  const columns = getColumnsFunc(userLevel, handleEdit, handleDelete);

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        
        {/* manager+*/}
        {userLevel >= 2 && (
          <Button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        )}
      </div>

      <DataTableServer 
        key={`${subcategory}-${refreshKey}`}
        columns={columns}
        endpoint={apiEndpoint}
        userLevel={userLevel}
      />

      <DynamicFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false);
          setRefreshKey(prev => prev + 1);
        }}
        initialData={selectedItem}
        fields={fields} 
        endpoint={apiEndpoint}
        resourceName={title}
      />
    </div>
  );
}