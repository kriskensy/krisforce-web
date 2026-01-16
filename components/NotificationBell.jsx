'use client';

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export function NotificationBell() {
  const supabase = getBrowserClient();

  //query definition
  const { data: count = 0 } = useQuery({
    queryKey: ['messages-count', 'new'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'New')
        .is('deleted_at', null);
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 5000, //polling, refresh every X seconds
    refetchOnWindowFocus: true, //refresh after tab change
  });

  return (
    <Link href="/protected/contact-messages">
      <Button variant="ghost" size="icon" className="text-muted-foreground relative">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-[#161B22]"></span>
          </span>
        )}
      </Button>
    </Link>
  );
}