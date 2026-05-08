import React from "react";

export type GeneratedMeal = {
  mealType: "breakfast" | "lunch" | "afternoon_snack" | "dinner" | "morning_snack";
  recipes: string[];
  warning?: string;
  portions: {
    personId: string;
    personName: string;
    multiplier: number;
    estimatedCalories: number;
  }[];
};
type RecipeOption = {
  name: string;
  mealCategories: string[];
  mainFoodGroup: string;
  ingredients: { ingredientName: string; quantityPerStandardPortion: number; unit: string }[];
};

type WeeklyDayMenu = { day: string; meals: GeneratedMeal[] };

const mealTypeLabel: Record<GeneratedMeal["mealType"], string> = {
  breakfast: "Breakfast",
  morning_snack: "Morning snack",
  lunch: "Lunch",
  afternoon_snack: "Afternoon snack",
  dinner: "Dinner"
};

const mealRowOrder: GeneratedMeal["mealType"][] = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"];

export function WeeklyMenuTable({
  generatedMenu,
  recipeOptions,
  onReplaceRecipe
}: {
  generatedMenu: WeeklyDayMenu[];
  recipeOptions: RecipeOption[];
  onReplaceRecipe: (day: string, mealType: GeneratedMeal["mealType"], recipeName: string) => void;
}) {
  const recipeByName = new Map(recipeOptions.map((recipe) => [recipe.name, recipe]));
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Generated menu</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border bg-slate-50 p-2 text-left">Meal</th>
              {generatedMenu.map((day) => (
                <th key={day.day} className="border bg-slate-50 p-2 text-left">{day.day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealRowOrder.map((mealType) => (
              <tr key={mealType} className="align-top">
                <td className="border p-2 font-medium">{mealTypeLabel[mealType]}</td>
                {generatedMenu.map((day) => {
                  const meal = day.meals.find((item) => item.mealType === mealType);
                  if (!meal) {
                    return <td key={`${day.day}-${mealType}`} className="border p-2 text-slate-500">—</td>;
                  }
                  return (
                    <td key={`${day.day}-${mealType}`} className="border p-1.5 align-top">
                      <select className="w-full rounded border p-1 text-xs font-medium" value={meal.recipes[0]} onChange={(e) => onReplaceRecipe(day.day, mealType, e.target.value)}>
                        {recipeOptions
                          .filter((recipe) => recipe.mealCategories.includes(mealType))
                          .map((recipe) => <option key={`${day.day}-${mealType}-${recipe.name}`} value={recipe.name}>{recipe.name}</option>)}
                      </select>
                      <div className="mt-1 space-y-1">
                        {meal.portions.map((portion) => (
                          <div key={`${day.day}-${mealType}-${portion.personId}`} className="text-[11px] text-slate-700">
                            <span className="font-medium">{portion.personName}:</span>{" "}
                            {((recipeByName.get(meal.recipes[0])?.ingredients ?? []).slice(0, 3)).map((ingredient) => `${ingredient.ingredientName} ${ingredient.unit === "piece" ? Math.max(1, Math.round(ingredient.quantityPerStandardPortion * portion.multiplier)) : Math.round(ingredient.quantityPerStandardPortion * portion.multiplier)} ${ingredient.unit}`).join(", ")}
                          </div>
                        ))}
                      </div>
                      {meal.warning ? <p className="mt-2 text-amber-700">⚠ {meal.warning}</p> : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
