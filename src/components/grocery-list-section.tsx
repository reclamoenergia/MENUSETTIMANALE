import React from "react";

type GroceryListGroup = {
  category: string;
  items: { ingredientId: string; ingredientName: string; unit: string; displayQuantity: string }[];
};

type GroceryListData = {
  groups: GroceryListGroup[];
  warnings: string[];
};

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    vegetables: "Verdura",
    fruit: "Frutta",
    meat: "Carne",
    fish: "Pesce",
    dairy: "Latticini",
    legumes: "Legumi",
    pasta_rice_cereals: "Pasta, riso e cereali",
    pantry: "Dispensa",
    condiments: "Condimenti",
    other: "Altro"
  };

  return labels[category] ?? category;
}

export function GroceryListSection({ groceryList, menuHasRecipes }: { groceryList: GroceryListData | null; menuHasRecipes: boolean }) {
  const hasItems = (groceryList?.groups.length ?? 0) > 0;
  const isUnavailable = menuHasRecipes && (!groceryList || groceryList.warnings.length > 0 || !hasItems);

  if (isUnavailable) {
    return <p className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-800">Lista della spesa unavailable because some recipes do not have ingredient data.</p>;
  }

  if (!groceryList) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Lista della spesa</h2>
      <div className="space-y-4">
        {groceryList.groups.map((group) => (
          <div key={group.category}>
            <h3 className="font-medium">{categoryLabel(group.category)}</h3>
            <ul className="mt-1 space-y-1 text-sm">
              {group.items.map((item, index) => (
                <li key={`${item.ingredientId}-${item.unit ?? "no-unit"}-${item.displayQuantity ?? "no-quantity"}-${index}`}>- {item.ingredientName} — {item.displayQuantity}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
