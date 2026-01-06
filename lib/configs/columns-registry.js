
import { getColumns as getProductColumns } from "@/app/protected/(features)/products/list/columns";
import { getColumns as getProductCategoriesColumns } from "@/app/protected/(features)/products/categories/columns";
import { getColumns as getPriceListsColumns } from "@/app/protected/(features)/products/price_lists/columns";
import { getColumns as getPriceListsItemsColumns } from "@/app/protected/(features)/products/price_list_items/columns";

export const GLOBAL_COLUMNS_REGISTRY = {
  'products': getProductColumns,
  'product_categories': getProductCategoriesColumns,
  'price_lists': getPriceListsColumns,
  'price_lists_items': getPriceListsItemsColumns
};