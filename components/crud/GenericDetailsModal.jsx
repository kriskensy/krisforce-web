'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutGrid, X } from "lucide-react";

export function GenericDetailsModal({ isOpen, onClose, item, fields, title, children }) {
  if (!item) return null;

//TODO fix the logic with IDs    
  const getValue = (field, item) => {
    const value = item[field.name];
    const relationName = field.name.endsWith('_id') 
      ? field.name.replace('_id', '') 
      : null;
      
    if (relationName && item[relationName]) {
      return item[relationName].name || item[relationName].number || item[relationName].code;
    }

    if (typeof value === 'boolean') {
      return (
        <Badge 
          variant={value ? "success" : "secondary"} 
          className="uppercase text-[10px] px-2 py-0.5 rounded-md shadow-sm"
        >
          {value ? "Active" : "Inactive"}
        </Badge>
      );
    }

    if (field.isCurrency)
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);

    if (field.name.includes('_at') || field.type === 'date') {
      return value ? new Date(value).toLocaleString('de-DE') : "—";
    }

    return value || <span className="text-muted-foreground/50 italic text-xs font-normal">No data</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] xl:max-w-7xl max-h-[85vh] p-0 flex flex-col border border-border/60 shadow-2xl bg-card dark:bg-[#121212] overflow-hidden ring-1 ring-white/5">
        
        <DialogHeader className="p-8 bg-muted/30 dark:bg-muted/10 border-b border-border/40 relative">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-background dark:bg-zinc-900 rounded-2xl shadow-md border border-border/50 text-primary transition-transform group-hover:scale-105">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center">
                {title} 
                <span className="text-muted-foreground/30 font-thin mx-3 text-3xl">|</span> 
                <span className="text-primary/90 font-semibold uppercase tracking-wider text-lg">Details</span>
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-medium tracking-wide">
                Here you will find additional details about the position you are interested in
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8 bg-background dark:bg-background/95">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {fields.map((field) => (
              <div key={field.name} className="group flex flex-col gap-3">

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 dark:text-muted-foreground group-hover:text-primary transition-colors">
                  {field.label}
                </p>
                
                <div className="relative overflow-hidden text-sm p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300 min-h-[64px] flex items-center shadow-[sm_0_2px_4px_rgba(0,0,0,0.02)]">

                  <div className="absolute left-0 top-0 w-1.5 h-full bg-primary/0 group-hover:bg-primary/60 transition-all duration-300" />
                  
                  <span className="font-bold text-slate-800 dark:text-zinc-200 tracking-tight leading-relaxed pl-1">
                    {getValue(field, item)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {children}
          <div className="h-8" />
        </ScrollArea>
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
      </DialogContent>
    </Dialog>
  );
}