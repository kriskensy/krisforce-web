import { Search } from "lucide-react"

export const GlobalSearchHeader = ({ query }) => {
  return (
    <div className="flex flex-col gap-2 mb-10">
      <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-wider font-semibold">
        <Search size={16} />
        <span>Global Database Search</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Results for: <span className="text-primary">"{query}"</span>
      </h1>
      <div className="h-1 w-20 bg-primary mt-2 rounded-full" />
    </div>
  )
}