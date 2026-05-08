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

type WeeklyDayMenu = { day: string; meals: GeneratedMeal[] };

const mealTypeLabel: Record<GeneratedMeal["mealType"], string> = {
  breakfast: "Breakfast",
  morning_snack: "Morning snack",
  lunch: "Lunch",
  afternoon_snack: "Afternoon snack",
  dinner: "Dinner"
};

const mealRowOrder: GeneratedMeal["mealType"][] = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"];

function portionLabel(multiplier: number): string {
  if (multiplier <= 0.85) return "Small portion";
  if (multiplier < 1.15) return "Medium portion";
  return "Large portion";
}

export function WeeklyMenuTable({ generatedMenu }: { generatedMenu: WeeklyDayMenu[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Generated menu</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full border-collapse text-sm">
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
                    <td key={`${day.day}-${mealType}`} className="border p-2">
                      <p className="font-medium">{meal.recipes.join(" + ")}</p>
                      <div className="mt-2 space-y-2">
                        {meal.portions.map((portion) => (
                          <div key={`${day.day}-${mealType}-${portion.personId}`}>
                            <p className="font-medium">{portion.personName}:</p>
                            <ul className="list-disc pl-5 text-slate-700">
                              <li>{portionLabel(portion.multiplier)}</li>
                              <li>{Math.round(portion.estimatedCalories)} kcal estimate</li>
                            </ul>
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
