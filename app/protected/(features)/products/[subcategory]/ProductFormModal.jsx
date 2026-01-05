'use client';

import { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ProductFormModal({ open, onOpenChange, initialData, endpoint, onSuccess, fields }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectData, setSelectData] = useState({});

  //data init
  useEffect(() => {
    if (open) {
      const initialValues = {};
      fields.forEach(f => {
        initialValues[f.name] = initialData ? initialData[f.name] : (f.defaultValue ?? "");
      });
      setFormData(initialValues);
    }
  }, [open, initialData, fields]);

  //get data for selects
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

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Saved successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error("Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add New"}</DialogTitle>
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
              ) : field.type === 'select' ? (
                <Select 
                  value={formData[field.name]?.toString()} 
                  onValueChange={(val) => setFormData({...formData, [field.name]: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[100]">
                    {selectData[field.name]?.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id.toString()}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  id={field.name}
                  type={field.type === 'number' ? 'number' : 'text'}
                  step={field.type === 'number' ? '0.01' : undefined}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
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