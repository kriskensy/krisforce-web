'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutGrid, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function GenericDetailsModal({ isOpen, onClose, item, fields, title, children, isLoading = false }) {
  
  const getValue = (field, item) => {
    if (!item) return null;

    if (field.format) return field.format(item[field.name], item);

    if (field.relationName && item[field.relationName]) {
    const displayKey = field.displayKey || 'name';
    return item[field.relationName][displayKey] || "—";
  }

    const value = item[field.name];
    const relationName = field.name.endsWith('_id') ? field.name.replace('_id', '') : null;

    if (relationName) {
    const relData = item[relationName] || item[`${relationName}s`];

    if (relData) {
      return relData.name || relData.order_number || relData.invoice_number || relData.code || relData.title;
    }
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

    if (field.name.includes('_at') || field.type === 'date' || field.isDate) {
      return value ? new Date(value).toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        // hour: '2-digit',
        // minute: '2-digit'
      }) : "—";
    }

    return value || <span className="text-muted-foreground/50 italic text-xs font-normal">No data</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] xl:max-w-5xl max-h-[85vh] p-0 flex flex-col border border-border/60 shadow-2xl bg-card dark:bg-[#121212] overflow-hidden">
        
        <DialogHeader className="p-6 bg-muted/30 dark:bg-muted/10 border-b border-border/40 relative flex-shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-background dark:bg-zinc-900 rounded-2xl shadow-md border border-border/50 text-primary">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center">
                {title} 
                <span className="text-muted-foreground/30 font-thin mx-3 text-3xl">|</span> 
                <span className="text-primary/90 font-semibold uppercase tracking-wider text-lg">Details</span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-medium tracking-wide">
                Full record information and associated history
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-background dark:bg-background/95">
          <div className="p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
                <p className="text-sm text-muted-foreground animate-pulse">Fetching latest data...</p>
              </div>
            ) : item ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                  {fields.map((field) => (
                    <div key={field.name} className={cn("group flex flex-col gap-3", field.fullWidth && "col-span-full")}>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 group-hover:text-primary transition-colors">
                        {field.label}
                      </p>
                      
                      <div className="relative overflow-hidden text-sm p-5 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/40 transition-all duration-300 min-h-[64px] flex items-center shadow-sm">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary/0 group-hover:bg-primary/60 transition-all duration-300" />
                        <span className="font-bold text-slate-800 dark:text-zinc-200 tracking-tight leading-relaxed pl-1">
                          {getValue(field, item)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* comments section */}
                {children && (
                  <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                  </div>
                )}
              </>
            ) : (
              // if no data
              <div className="text-center py-20 text-muted-foreground italic">
                No information available.
              </div>
            )}
            <div className="h-4" />
          </div>
        </ScrollArea>
        
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
      </DialogContent>
    </Dialog>
  );
}