'use client';

import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { GenericDetailsModal } from "@/components/crud/GenericDetailsModal";
import { GLOBAL_FEATURES_MAP } from "@/lib/configs/features/features-registry";

export default function GlobalSearchResultsList({ results }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeConfig, setactiveConfig] = useState(null);

  const openModal = (item, sectionKey) => {
    const featureConfig = GLOBAL_FEATURES_MAP[sectionKey];
    
    setSelectedItem(item);
    setactiveConfig(featureConfig);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {Object.entries(results).map(([section, items]) => {

          const sectionConfig = GLOBAL_FEATURES_MAP[section];

          if(!items || items.length === 0) return null;

            return (
              <div key={section} className="flex flex-col border border-border rounded-2xl bg-muted/10 dark:bg-muted/5 w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/20">
                  <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {sectionConfig?.title || section} 
                  </h2>
                </div>

                <div className="p-2">
                  {items.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => openModal(item, section)}
                      className="group w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-white dark:hover:bg-card hover:shadow-sm transition-all border border-transparent hover:border-border mb-1 text-left"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[15px] font-bold text-foreground group-hover:text-primary truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 font-mono">
                          {section.toUpperCase()}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )
        })}
      </div>

      <GenericDetailsModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        fields={activeConfig?.fields || []}
        title={activeConfig?.title || "Details"}
      />
    </>
  );
}