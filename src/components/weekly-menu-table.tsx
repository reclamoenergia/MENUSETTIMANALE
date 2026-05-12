import React from "react";
import { IngredientCategory } from "@prisma/client";
import { buildRecipePortionIngredients } from "@/lib/recipe-ingredient-portions";
import { formatPortionQuantity } from "@/lib/portion-format";

export type GeneratedMeal = {
  mealType: "breakfast" | "lunch" | "afternoon_snack" | "dinner" | "morning_snack";
  slot?: 1 | 2;
  recipes: string[];
  warning?: string;
  portions: {
    personId: string;
    personName: string;
    multiplier: number;
    estimatedCalories: number;
    assignedRecipeName?: string;
  }[];
};

type RecipeOption = { name: string; mealCategories: string[]; mainFoodGroup: string; ingredients: { ingredientId: string; ingredientName: string; quantityPerStandardPortion: number; unit: "g" | "ml" | "piece"; category?: IngredientCategory }[] };
type WeeklyDayMenu = { day: string; meals: GeneratedMeal[] };

const mealRows = [
  { key: "breakfast", label: "Colazione" },
  { key: "morning_snack", label: "Spuntino mattutino 1" },
  { key: "morning_snack_2", label: "Spuntino mattutino 2" },
  { key: "lunch", label: "Pranzo" },
  { key: "afternoon_snack", label: "Merenda pomeridiana" },
  { key: "dinner", label: "Cena" }
] as const;

const fixedBreakfasts = new Set(["yogurt greco 150 g con 4 biscotti", "latte e biscotti", "latte e cereali", "pancake semplici con frutta"]);
const fixedMorningSnacks = new Set(["panino con il prosciutto", "panino con il pomodoro", "banana", "taralli", "carote", "merendina", "biscotti ringo"]);
const fixedAfternoonSnacks = new Set(["latte e cereali", "fagottini di bresaola con fiocchi di latte", "pancake con frutta", "merendina", "banana"]);

export function WeeklyMenuTable({ generatedMenu, recipeOptions, onReplaceRecipe }: { generatedMenu: WeeklyDayMenu[]; recipeOptions: RecipeOption[]; onReplaceRecipe: (day: string, mealType: GeneratedMeal["mealType"], slot: number | undefined, personId: string | undefined, recipeName: string) => void; }) {
  const recipeByName = new Map(recipeOptions.map((recipe) => [recipe.name, recipe]));
  const pickMeal = (day: WeeklyDayMenu, rowKey: typeof mealRows[number]["key"]) => {
    if (rowKey === "morning_snack_2") return day.meals.find((m) => m.mealType === "morning_snack" && (m.slot ?? 1) === 2);
    if (rowKey === "morning_snack") return day.meals.find((m) => m.mealType === "morning_snack" && (m.slot ?? 1) === 1);
    return day.meals.find((m) => m.mealType === rowKey);
  };

  const optionsForRow = (rowKey: typeof mealRows[number]["key"]) => recipeOptions.filter((recipe) => {
    if (rowKey === "breakfast") return fixedBreakfasts.has(recipe.name.toLowerCase());
    if (rowKey === "morning_snack" || rowKey === "morning_snack_2") return fixedMorningSnacks.has(recipe.name.toLowerCase());
    if (rowKey === "afternoon_snack") return fixedAfternoonSnacks.has(recipe.name.toLowerCase());
    if (rowKey === "lunch") return recipe.mealCategories.includes("lunch");
    if (rowKey === "dinner") return recipe.mealCategories.includes("dinner");
    return false;
  });

  return (
    <section className="w-full space-y-3">
      <h2 className="text-lg font-semibold">Menu generato</h2>
      <div className="w-full overflow-x-auto">
        <div className="grid min-w-[1100px] grid-cols-[120px_repeat(7,1fr)] divide-y border text-xs">
          <div className="sticky left-0 top-0 z-20 border-r bg-slate-50 p-2 font-semibold">Pasto</div>
          {generatedMenu.map((day) => <div key={day.day} className="sticky top-0 z-10 border-l bg-slate-50 p-2 font-semibold">{day.day}</div>)}

          {mealRows.map((row) => (
            <React.Fragment key={row.key}>
              <div className="sticky left-0 z-10 border-r bg-white p-2 font-medium">{row.label}</div>
              {generatedMenu.map((day) => {
                const meal = pickMeal(day, row.key);
                if (!meal) return <div key={`${day.day}-${row.key}`} className="border-l p-2 text-slate-500">—</div>;
                const rowOptions = optionsForRow(row.key);
                return (
                  <div key={`${day.day}-${row.key}`} className="space-y-1 border-l p-2 align-top">
                    {(row.key === "lunch" || row.key === "dinner") ? <select className="w-full rounded border p-1 text-sm font-medium" value={meal.recipes[0]} onChange={(e) => onReplaceRecipe(day.day, meal.mealType, meal.slot, undefined, e.target.value)}>{!recipeByName.has(meal.recipes[0]) ? <option value={meal.recipes[0]}>{meal.recipes[0]}</option> : null}{rowOptions.map((recipe) => <option key={`${day.day}-${row.key}-${recipe.name}`} value={recipe.name}>{recipe.name}</option>)}</select> : null}
                    <div className="space-y-0.5">
                      {meal.portions.map((portion) => <div key={`${day.day}-${row.key}-${portion.personId}`} className="text-[11px] leading-tight text-slate-700"><span className="font-medium">{portion.personName}:</span> {(row.key === "lunch" || row.key === "dinner") ? (() => { const recipe = recipeByName.get(meal.recipes[0]); if (!recipe) return "dettagli porzione non disponibili"; const details = buildRecipePortionIngredients({ recipeName: recipe.name, ingredients: recipe.ingredients, multiplier: portion.multiplier, onMissingIngredients: () => {} }); if (details.length === 0) return "dettagli porzione non disponibili"; return details.map((ingredient) => `${ingredient.ingredientName} ${formatPortionQuantity(ingredient.quantity, ingredient.unit)}`).join(", "); })() : <select className="ml-1 w-full rounded border p-0.5 text-xs" value={portion.assignedRecipeName ?? ""} onChange={(e) => onReplaceRecipe(day.day, meal.mealType, meal.slot, portion.personId, e.target.value)}><option value="">non previsto</option>{rowOptions.map((recipe) => <option key={`${day.day}-${row.key}-${portion.personId}-${recipe.name}`} value={recipe.name}>{recipe.name}</option>)}</select>}</div>)}
                    </div>
                    {meal.warning ? <p className="text-amber-700">⚠ {meal.warning}</p> : null}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
