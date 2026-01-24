import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ItemsTableWrapper from "@/components/crud/ItemsTableWrapper";

export default function FeatureSubcategoryTemplate({ config, userLevel, subcategory, backHref, backLabel }) {
  const Icon = config.icon;

  return (
    <div className="p-8 space-y-4">
      <Button variant="ghost" asChild className="mb-2 -ml-4 text-muted-foreground">
        <Link href={backHref}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-8 w-8 text-primary" />}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>
      
      <ItemsTableWrapper 
        subcategory={subcategory}
        userLevel={userLevel}
        apiEndpoint={config.apiEndpoint}
        fields={config.fields}
        tableKey={config.tableKey}
        title={config.title}
        description={config.description}
        hideAddButton={config.hideAddButton}
      />
    </div>
  );
}