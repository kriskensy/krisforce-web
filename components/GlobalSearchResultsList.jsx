'use client';

import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { GenericDetailsModal } from "@/components/crud/GenericDetailsModal";
import TicketDetailsModal from "@/components/tickets/TicketDetailsModal";
import { GLOBAL_FEATURES_MAP } from "@/lib/configs/features/features-registry";
import { toast } from "sonner";

export default function GlobalSearchResultsList({ results, userLevel }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeConfig, setactiveConfig] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

    const openModal = async (searchResult, sectionKey) => {
    const featureConfig = GLOBAL_FEATURES_MAP[sectionKey];
    if(!featureConfig) return;
    
    setactiveConfig(featureConfig);
    setIsFetching(true);
    setSelectedItem(searchResult);

    try{
      //change apiEdnpoint to real ID
      let endpoint = featureConfig.apiEndpoint;
      if(endpoint.includes('[id]')) {
        endpoint = endpoint.replace('[id]', searchResult.id);
      } else {
        endpoint = `${endpoint}/${searchResult.id}`;
      }

      const response = await fetch(endpoint);
      if(!response.ok) throw new Error('Failed to fetch full record');

      const fullData = await response.json()

      setSelectedItem(fullData.data || fullData);
    } catch(error){
      console.error("Search detail fetch error: ", error);
      toast.error("Could not load full details");
    } finally {
      setIsFetching(false);
    }
  };

  const isTicketsOpen = activeConfig?.tableKey === 'tickets' && !!selectedItem; //flag for tickets modal

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

      {isTicketsOpen ? (
        <TicketDetailsModal
          ticketId={selectedItem?.id}
          isOpen={true}
          onClose={() => {
            setSelectedItem(null);
            setactiveConfig(null);
          }}
          userLevel={userLevel}
        />
      ) : (
        <GenericDetailsModal
          isOpen={!!selectedItem && !!activeConfig}
          onClose={() => {
            setSelectedItem(null);
            setIsFetching(false);
          }}
          item={selectedItem}
          fields={activeConfig?.fields || []}
          title={activeConfig?.title || "Details"}
          isLoading={isFetching}
        />
      )}
    </>
  );
}