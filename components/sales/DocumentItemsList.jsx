'use client'

import { Package, Hash, Banknote } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function DocumentItemsList({ items = [], title = "Document Items" }) {

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Hash className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        </div>
        <Separator className="flex-1" />
      </div>

      <div className="border rounded-2xl overflow-hidden bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground text-[11px] uppercase font-bold">
            <tr>
              <th className="px-4 py-3">Product / Description</th>
              <th className="px-4 py-3 text-center">Quantity</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                  No items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/5 rounded-lg">
                        <Package className="h-4 w-4 text-primary/70" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.products?.name || item.description}
                        </p>
                        {item.products?.code && (
                          <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                            Code: {item.products.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.total_price)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}