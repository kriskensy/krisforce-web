'use client';

import { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function DynamicFormModal({ 
  open, 
  onOpenChange, 
  initialData, 
  endpoint, 
  onSuccess, 
  fields,
  resourceName //"Product", "Category", "Price List"...
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectData, setSelectData] = useState({});

  //init data
  useEffect(() => {
    if (open) {
      const initialValues = {};
      fields.forEach(field => {

        initialValues[field.name] = initialData ? initialData[field.name] : (field.defaultValue ?? (field.type === 'checkbox' ? false : ""));
      });
      setFormData(initialValues);
    }
  }, [open, initialData, fields]);

  //get data for select
  useEffect(() => {
    const fetchSelectOptions = async () => {
      for (const field of fields) {
        if (field.type === 'select' && field.source) {
          try {
            const res = await fetch(`${field.source}?limit=100`);
            const result = await res.json();
            setSelectData(prev => ({ ...prev, [field.name]: result.data || [] }));
          } catch (err) {
            console.error(`Failed to load options for ${field.name}`, err);
          }
        }
      }
    };
    if (open) fetchSelectOptions();
  }, [open, fields]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const method = initialData ? "PUT" : "POST";
    const url = initialData ? `${endpoint}/${initialData.id}` : endpoint;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok)
        throw new Error("Failed to save");

      toast.success(`${resourceName} saved successfully`);
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? `Edit ${resourceName}` : `Add New ${resourceName}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              
              {field.type === 'date' ? (
                <DatePicker 
                  value={formData[field.name]} 
                  onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                  placeholder={field.label}
                />
              ) 
              : field.type === 'checkbox' ? (
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox 
                    id={field.name}
                    checked={formData[field.name]}
                    onCheckedChange={(checked) => setFormData({...formData, [field.name]: checked})}
                  />
                </div>
              )
              : field.type === 'select' ? (
                <Select 
                  value={formData[field.name]?.toString()} 
                  onValueChange={(val) => setFormData({...formData, [field.name]: val})}
                >
                  <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                  <SelectContent className="z-[100]">
                    {selectData[field.name]?.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id.toString()}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) 
              : (
                <Input 
                  id={field.name}
                  type={field.type === 'number' ? 'number' : 'text'}
                  step={field.type === 'number' ? '0.01' : undefined}
                  value={formData[field.name] || ""}
                  onChange={(e) => {
                    const val = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                    setFormData({...formData, [field.name]: val});
                  }}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}