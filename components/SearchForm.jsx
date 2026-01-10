import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchForm = () => {
  return (
    <div className="max-w-md w-full relative hidden sm:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search KrisForce..." 
        className="pl-10 bg-[#F3F3F3] dark:bg-[#0D1117] border-none focus-visible:ring-1 h-9"
      />
    </div>
  )
}