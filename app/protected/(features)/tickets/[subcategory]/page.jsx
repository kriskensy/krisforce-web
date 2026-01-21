import { TICKETS_SUB_FEATURES } from "@/lib/configs/features/tickets";
import { getUserAccessLevel } from "@/lib/utils/auth/getUserAccessLevel";
import { notFound } from "next/navigation";
import FeatureSubcategoryTemplate from "@/components/crud/FeatureSubcategoryTemplate";

export default async function TicketsSubcategoryPage({ params }) {
  const { subcategory } = await params;
  const config = TICKETS_SUB_FEATURES[subcategory];
  const access = await getUserAccessLevel();

  if (!config || access.level < config.minLevel) return notFound();
  
  return (
    <FeatureSubcategoryTemplate 
      config={config}
      userLevel={access.level}
      subcategory={subcategory}
      backHref="/protected/tickets"
      backLabel="Back to Tickets"
    />
  );
}