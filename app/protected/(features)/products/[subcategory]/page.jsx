import { PRODUCTS_SUB_FEATURES } from "@/lib/configs/features/products";
import { getUserAccessLevel } from "@/lib/utils/auth/getUserAccessLevel";
import { notFound } from "next/navigation";
import ProductTableWrapper from "./ProductTableWrapper";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ProductsSubcategoryPage({ params }) {
  const { subcategory } = await params;
  const config = PRODUCTS_SUB_FEATURES[subcategory];
  const access = await getUserAccessLevel();

  if (!config || access.level < config.minLevel) return notFound();

  const Icon = config.icon;

  return (
    <div className="p-8 space-y-4">
      <Button variant="ghost" asChild className="mb-2 -ml-4 text-muted-foreground">
        <Link href="/protected/products">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-8 w-8 text-primary" />}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>
      
      <ProductTableWrapper 
        subcategory={subcategory}
        userLevel={access.level}
        apiEndpoint={config.apiEndpoint}
        fields={config.fields}
      />
    </div>
  );
}