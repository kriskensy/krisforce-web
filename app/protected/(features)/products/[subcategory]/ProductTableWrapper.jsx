'use client';

import { GLOBAL_COLUMNS_REGISTRY } from "@/lib/configs/columns-registry";
import { useState } from 'react';
import { DataTableServer } from '@/components/ui/data-table-server';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DynamicFormModal from '@/components/crud/DynamicFormModal';
import { DeleteConfirmModal } from "@/components/crud/DeleteConfirmModal";
import { DisplayActiveOnlyRecordsCheckbox }from "@/components/crud/DisplayActiveOnlyRecordsCheckbox";
import { toast } from "sonner";

export default function ProductTableWrapper({ subcategory, userLevel, apiEndpoint, fields, title, description, tableKey }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const res = await fetch(`${apiEndpoint}/${itemToDelete}`, { method: 'DELETE' });

      if (!res.ok)
        throw new Error("Failed to delete");
      
      toast.success("Deleted successfully");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
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

  const columns = getColumnsFunc(userLevel, handleEdit, handleDeleteRequest);

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-4">

        <DisplayActiveOnlyRecordsCheckbox 
          tableKey={tableKey}
          showActiveOnly={showActiveOnly}
          onActiveChange={setShowActiveOnly}
        />
        
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
        activeOnly={showActiveOnly}
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
      <DeleteConfirmModal 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        resourceName={title}
      />
    </div>
  );
}