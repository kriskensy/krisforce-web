'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default async function DynamicFormModal({ open, onOpenChange, initialData, endpoint, fields, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectOptions, setSelectOptions] = useState({});

  useEffect(() => {
    if (open) {
      //initial data
      const initial = {};
      fields.forEach(f => {
        initial[f.name] = initialData ? initialData[f.name] : (f.defaultValue ?? (f.type === 'number' ? 0 : ""));
      });
      setFormData(initial);

      //get data for select
      fields.forEach(async (f) => {
        if (f.type === 'select' && f.source) {
          try {
            const res = await fetch(f.source);
            const result = await res.json();
            setSelectOptions(prev => ({ ...prev, [f.name]: result.data || [] }));
          } catch (err) {
            console.error(`Failed to load options for ${f.name}`, err);
          }
        }
      });
    }
  }, [open, initialData, fields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const method = initialData ? "PUT" : "POST";
    const url = initialData ? `${endpoint}/${initialData.id}` : endpoint;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Operation failed");

      toast.success(initialData ? "Updated successfully" : "Created successfully");
      onSuccess();//refresh table
      onOpenChange(false);
    } catch (err) {
      toast.error("Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Record" : "Add New Record"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              
              {field.type === 'select' ? (
                <Select 
                  value={formData[field.name]?.toString()} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label}...`} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[110]">
                    {(selectOptions[field.name] || []).map(opt => (
                      <SelectItem key={opt.id} value={opt.id.toString()}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox 
                    id={field.name} 
                    checked={formData[field.name]} 
                    onCheckedChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))} 
                  />
                  <Label htmlFor={field.name} className="text-sm font-normal">Active / Enabled</Label>
                </div>
              ) : (
                <Input 
                  id={field.name}
                  type={field.type}
                  step={field.type === 'number' ? '0.01' : undefined}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [field.name]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value 
                  }))}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : (initialData ? "Save Changes" : "Create Record")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}