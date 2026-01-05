'use client';

import { useState } from 'react';
import { DataTableServer } from '@/components/ui/data-table-server';
import ProductFormModal from './ProductFormModal';
import { getColumns } from '../list/columns';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ProductTableWrapper({ subcategory, userLevel, apiEndpoint, fields, title, description }) {
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

  const columns = getColumns(userLevel, handleEdit, handleDelete);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
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

      <ProductFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false);
          setRefreshKey(prev => prev + 1);
        }}
        initialData={selectedItem}
        fields={fields} 
        endpoint={apiEndpoint}
      />
    </div>
  );
}



//TODO DynamicFormModal
// 'use client';

// import { useState } from "react";
// import { DataTableServer } from "@/components/ui/data-table-server";
// import { getColumns } from "../list/columns";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// // IMPORTUJEMY NOWY UNIWERSALNY MODAL
// import DynamicFormModal from "@/components/crud/DynamicFormModal";

// export default function ProductTableWrapper({ userLevel, apiEndpoint, fields }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const handleEdit = (item) => {
//     setSelectedItem(item);
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to deactivate this item?")) return;
//     try {
//       const res = await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
//       if (res.ok) setRefreshKey(prev => prev + 1);
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const columns = getColumns(userLevel, handleEdit, handleDelete);

//   return (
//     <>
//       <div className="flex justify-end mb-4">
//         {userLevel >= 2 && (
//           <Button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}>
//             <Plus className="mr-2 h-4 w-4" /> Add New
//           </Button>
//         )}
//       </div>

//       <DataTableServer 
//         key={refreshKey}
//         columns={columns} 
//         endpoint={apiEndpoint} 
//         userLevel={userLevel}
//       />

//       {/* UŻYCIE UNIWERSALNEGO MODALU */}
//       <DynamicFormModal 
//         open={isModalOpen}
//         onOpenChange={setIsModalOpen}
//         initialData={selectedItem}
//         endpoint={apiEndpoint}
//         fields={fields} // Pola wpadają z configu przekazanego przez page.jsx
//         onSuccess={() => setRefreshKey(prev => prev + 1)}
//       />
//     </>
//   );
// }