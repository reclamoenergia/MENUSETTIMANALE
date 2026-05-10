import React from "react";
import { IngredientCategory } from "@prisma/client";
import { buildRecipePortionIngredients } from "@/lib/recipe-ingredient-portions";

export type GeneratedMeal = {
  mealType: "breakfast" | "lunch" | "afternoon_snack" | "dinner" | "morning_snack";
  recipes: string[];
  warning?: string;
  portions: {
    personId: string;
    personName: string;
    multiplier: number;
    estimatedCalories: number;
    assignedRecipeName?: string;
    snackSlot?: "morning_snack_2";
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

export function WeeklyMenuTable({ generatedMenu, recipeOptions, onReplaceRecipe }: { generatedMenu: WeeklyDayMenu[]; recipeOptions: RecipeOption[]; onReplaceRecipe: (day: string, mealType: GeneratedMeal["mealType"], recipeName: string) => void; }) {
  const recipeByName = new Map(recipeOptions.map((recipe) => [recipe.name, recipe]));
  const pickMeal = (day: WeeklyDayMenu, rowKey: typeof mealRows[number]["key"]) => {
    if (rowKey === "morning_snack_2") return day.meals.filter((m) => m.mealType === "morning_snack")[1];
    if (rowKey === "morning_snack") return day.meals.filter((m) => m.mealType === "morning_snack")[0];
    return day.meals.find((m) => m.mealType === rowKey);
  };

  return <section className="space-y-3"><h2 className="text-lg font-semibold">Menu generato</h2><div className="overflow-x-auto"><table className="min-w-[1100px] w-full border-collapse text-xs"><thead><tr><th className="border bg-slate-50 p-2 text-left">Pasto</th>{generatedMenu.map((day) => <th key={day.day} className="border bg-slate-50 p-2 text-left">{day.day}</th>)}</tr></thead><tbody>{mealRows.map((row) => <tr key={row.key} className="align-top"><td className="border p-2 font-medium">{row.label}</td>{generatedMenu.map((day) => { const meal = pickMeal(day, row.key); if (!meal) return <td key={`${day.day}-${row.key}`} className="border p-2 text-slate-500">—</td>; return <td key={`${day.day}-${row.key}`} className="border p-1.5 align-top"><select className="w-full rounded border p-1 text-xs font-medium" value={meal.recipes[0]} onChange={(e) => onReplaceRecipe(day.day, meal.mealType, e.target.value)}>{!recipeByName.has(meal.recipes[0]) ? <option value={meal.recipes[0]}>{meal.recipes[0]}</option> : null}{recipeOptions.filter((recipe) => { if (row.key === "breakfast") return fixedBreakfasts.has(recipe.name.toLowerCase()); if (row.key === "morning_snack" || row.key === "morning_snack_2") return fixedMorningSnacks.has(recipe.name.toLowerCase()); if (row.key === "afternoon_snack") return fixedAfternoonSnacks.has(recipe.name.toLowerCase()); if (row.key === "lunch") return recipe.mealCategories.includes("lunch"); if (row.key === "dinner") return recipe.mealCategories.includes("dinner"); return recipe.mealCategories.includes("side_dish"); }).map((recipe) => <option key={`${day.day}-${row.key}-${recipe.name}`} value={recipe.name}>{recipe.name}</option>)}</select><div className="mt-1 space-y-1">{meal.portions.filter((portion) => row.key !== "morning_snack_2" ? portion.snackSlot !== "morning_snack_2" : portion.snackSlot === "morning_snack_2").map((portion) => <div key={`${day.day}-${row.key}-${portion.personId}`} className="text-[11px] text-slate-700"><span className="font-medium">{portion.personName}:</span> {(() => { const selectedName = portion.assignedRecipeName ?? meal.recipes[0]; const recipe = recipeByName.get(selectedName); if (!recipe) return "dettagli porzione non disponibili"; const details = buildRecipePortionIngredients({ recipeName: recipe.name, ingredients: recipe.ingredients, multiplier: portion.multiplier, onMissingIngredients: () => {} }); if (details.length === 0) return "dettagli porzione non disponibili"; return details.map((ingredient) => `${ingredient.ingredientName} ${ingredient.unit === "piece" ? Math.max(1, Math.round(ingredient.quantity)) : Math.round(ingredient.quantity)} ${ingredient.unit}`).join(", "); })()}</div>)}</div>{meal.warning ? <p className="mt-2 text-amber-700">⚠ {meal.warning}</p> : null}</td>; })}</tr>)}</tbody></table></div></section>;
}
