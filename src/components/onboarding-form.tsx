"use client";

import { FormEvent, useMemo, useState } from "react";
import { MainFoodGroup } from "@prisma/client";
import { GroceryListSection } from "@/components/grocery-list-section";
import { WeeklyMenuTable, type GeneratedMeal } from "@/components/weekly-menu-table";

type PersonInput = {
  name: string;
  age: number | undefined;
  sex: "male" | "female";
  heightCm: number | undefined;
  weightKg: number | undefined;
};

type SavedPerson = {
  id: string;
  name: string;
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  excludedFoodIds: string[];
  preferredFoodIds: string[];
};

const mealTypeLabel: Record<GeneratedMeal["mealType"], string> = {
  breakfast: "Breakfast",
  morning_snack: "Morning snack",
  lunch: "Lunch",
  afternoon_snack: "Afternoon snack",
  dinner: "Dinner"
};

const foodOptions = [
  { id: "tomato", label: "Tomato" },
  { id: "zucchini", label: "Zucchini" },
  { id: "egg", label: "Egg" },
  { id: "chicken", label: "Chicken" },
  { id: "beef", label: "Beef" },
  { id: "salmon", label: "Salmon" },
  { id: "tuna", label: "Tuna" },
  { id: "lentils", label: "Lentils" },
  { id: "chickpeas", label: "Chickpeas" },
  { id: "rice", label: "Rice" },
  { id: "pasta", label: "Pasta" },
  { id: "yogurt", label: "Yogurt" },
  { id: "cheese", label: "Cheese" }
] as const;

const weeklyDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const mealRows = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"] as const;
const foodGroups: MainFoodGroup[] = ["cereals", "legumes", "fish", "white_meat", "red_meat", "eggs", "cheese", "vegetarian"];

const defaultPerson: PersonInput = { name: "", age: 30, sex: "female", heightCm: 165, weightKg: 60 };

function defaultBalancePlan() {
  return dayKeys.flatMap((dayKey, index) => {
    const dinnerDefaults: MainFoodGroup[] = ["red_meat", "white_meat", "white_meat", "fish", "white_meat", "fish", "legumes"];
    const lunchDefaults: MainFoodGroup[] = ["cereals", "legumes", "vegetarian", "eggs", "cheese", "cereals", "vegetarian"];
    return [
      { dayKey, mealType: "lunch" as const, mainFoodGroup: lunchDefaults[index] },
      { dayKey, mealType: "dinner" as const, mainFoodGroup: dinnerDefaults[index] }
    ];
  });
}

export function OnboardingForm() {
  const [email, setEmail] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [persons, setPersons] = useState<PersonInput[]>([defaultPerson]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedOnboarding, setSavedOnboarding] = useState<{ household: { id: string; name: string }; persons: SavedPerson[] } | null>(null);
  const [generatedMenu, setGeneratedMenu] = useState<{ day: string; meals: GeneratedMeal[] }[] | null>(null);
  const [groceryList, setGroceryList] = useState<{ groups: { category: string; items: { ingredientId: string; ingredientName: string; unit: string; displayQuantity: string }[] }[]; warnings: string[] } | null>(null);
  const [recipeOptions, setRecipeOptions] = useState<{ name: string; mealCategories: string[]; mainFoodGroup: string; ingredients: { ingredientId: string; ingredientName: string; quantityPerStandardPortion: number; unit: string }[] }[]>([]);
  const [menuConfirmed, setMenuConfirmed] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedForbiddenFoods, setSelectedForbiddenFoods] = useState<string[]>([]);
  const [selectedPreferredFoods, setSelectedPreferredFoods] = useState<string[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [sportDaysMap, setSportDaysMap] = useState<Record<string, boolean>>({});
  const [balancePlan, setBalancePlan] = useState(defaultBalancePlan());

  const updatePerson = <K extends keyof PersonInput>(index: number, field: K, value: PersonInput[K]) => {
    setPersons((current) => current.map((person, personIndex) => (personIndex === index ? { ...person, [field]: value } : person)));
  };

  const parseNumericInput = (value: string): number | undefined => (value === "" ? undefined : Number(value));
  const addPerson = () => setPersons((current) => [...current, { ...defaultPerson }]);
  const removePerson = (index: number) => setPersons((current) => current.filter((_, personIndex) => personIndex !== index));

  const toggleFood = (current: string[], setFn: (next: string[]) => void, id: string) => {
    setFn(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  };

  const keyFor = (mealOrSport: string, day: string, personId: string) => `${mealOrSport}:${day}:${personId}`;
  const setPresence = (mealType: string, day: string, personId: string, checked: boolean) => setPresenceMap((prev) => ({ ...prev, [keyFor(mealType, day, personId)]: checked }));
  const setSportDay = (day: string, personId: string, checked: boolean) => setSportDaysMap((prev) => ({ ...prev, [keyFor("sport", day, personId)]: checked }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const householdResponse = await fetch("/api/households", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: householdName, email }) });
      if (!householdResponse.ok) throw new Error("Unable to create household");
      const household = await householdResponse.json();
      const createdPersons: SavedPerson[] = [];
      for (const person of persons) {
        const personResponse = await fetch("/api/persons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            householdId: household.id,
            ...person,
            activityLevel: "lightly_active",
            goal: "maintenance",
            excludedFoodIds: [],
            preferredFoodIds: [],
            defaultManagedMeals: ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"]
          })
        });
        if (!personResponse.ok) throw new Error(`Unable to create person: ${person.name}`);
        createdPersons.push(await personResponse.json());
      }
      setSavedOnboarding({ household, persons: createdPersons });
      setStep(2);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unexpected error while saving onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dinnerCerealsWarning = useMemo(() => balancePlan.some((slot) => slot.mealType === "dinner" && slot.mainFoodGroup === "cereals"), [balancePlan]);

  const generateMenu = async () => {
    if (!savedOnboarding) return;
    setSubmitError(null);
    const response = await fetch("/api/menu/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        householdId: savedOnboarding.household.id,
        breakfastSnackMode: "recipes",
        forbiddenFoodIds: selectedForbiddenFoods,
        preferredFoodIds: selectedPreferredFoods,
        presence: presenceMap,
        sportDays: sportDaysMap,
        weeklyBalanceSlots: balancePlan
      })
    });
    if (!response.ok) {
      setSubmitError("Unable to generate weekly menu");
      return;
    }
    const menu = await response.json();
    setGeneratedMenu(menu.meals);
    setGroceryList(menu.groceryList);
    setRecipeOptions(menu.recipeOptions ?? []);
    setMenuConfirmed(false);
  };
  const rebuildGrocery = (nextMenu: { day: string; meals: GeneratedMeal[] }[]) => {
    const map = new Map<string, { ingredientId: string; ingredientName: string; unit: string; quantity: number; category: string }>();
    const byName = new Map(recipeOptions.map((r) => [r.name, r]));
    for (const day of nextMenu) for (const meal of day.meals) for (const recipeName of meal.recipes) {
      const recipe = byName.get(recipeName);
      if (!recipe || recipe.ingredients.length === 0) continue;
      for (const ing of recipe.ingredients) {
        const totalMultiplier = meal.portions.reduce((sum, p) => sum + p.multiplier, 0);
        const key = `${ing.ingredientId}:${ing.unit}`;
        const existing = map.get(key);
        const qty = ing.quantityPerStandardPortion * totalMultiplier;
        if (existing) existing.quantity += qty; else map.set(key, { ingredientId: ing.ingredientId, ingredientName: ing.ingredientName, unit: ing.unit, quantity: qty, category: "other" });
      }
    }
    const items = Array.from(map.values()).map((i) => ({ ingredientId: i.ingredientId, ingredientName: i.ingredientName, unit: i.unit, displayQuantity: i.unit === "piece" ? `${Math.ceil(i.quantity)} pieces` : `${Math.round(i.quantity)} ${i.unit}` }));
    setGroceryList({ groups: [{ category: "other", items }], warnings: [] });
  };
  const onReplaceRecipe = (dayName: string, mealType: GeneratedMeal["mealType"], recipeName: string) => {
    if (!generatedMenu) return;
    const next = generatedMenu.map((day) => day.day !== dayName ? day : ({ ...day, meals: day.meals.map((meal) => meal.mealType === mealType ? { ...meal, recipes: [recipeName] } : meal) }));
    setGeneratedMenu(next);
    rebuildGrocery(next);
    setMenuConfirmed(false);
  };

  const navigateNext = async () => {
    if (step === 6) {
      await generateMenu();
      return;
    }
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const navigateBack = () => setStep((prev) => Math.max(prev - 1, savedOnboarding ? 2 : 1));

  if (!savedOnboarding) {
    return (
      <form onSubmit={onSubmit} className="space-y-4 rounded border bg-white p-4">
        <h2 className="text-lg font-semibold">Step 1 — Household</h2>
        <label className="block text-sm">Email<input className="mt-1 w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="block text-sm">Household name<input className="mt-1 w-full rounded border p-2" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} required /></label>
        {persons.map((person, index) => (
          <div key={index} className="space-y-2 rounded border p-3">
            <div className="flex items-center justify-between"><h3 className="font-medium">Person {index + 1}</h3>{persons.length > 1 ? <button type="button" className="text-red-600" onClick={() => removePerson(index)}>Remove</button> : null}</div>
            <input className="w-full rounded border p-2" placeholder="Name" value={person.name} onChange={(e) => updatePerson(index, "name", e.target.value)} required />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded border p-2" placeholder="Age" type="number" value={person.age ?? ""} onChange={(e) => updatePerson(index, "age", parseNumericInput(e.target.value))} required />
              <select className="rounded border p-2" value={person.sex} onChange={(e) => updatePerson(index, "sex", e.target.value as PersonInput["sex"])}><option value="female">Female</option><option value="male">Male</option></select>
              <input className="rounded border p-2" placeholder="Height (cm)" type="number" value={person.heightCm ?? ""} onChange={(e) => updatePerson(index, "heightCm", parseNumericInput(e.target.value))} required />
              <input className="rounded border p-2" placeholder="Weight (kg)" type="number" value={person.weightKg ?? ""} onChange={(e) => updatePerson(index, "weightKg", parseNumericInput(e.target.value))} required />
            </div>
          </div>
        ))}
        <button type="button" className="rounded border px-3 py-2" onClick={addPerson}>Add person</button>
        <div><button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save household"}</button></div>
        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
      </form>
    );
  }

  return (
    <div className="space-y-4 rounded border bg-white p-4">
      <p className="text-sm text-slate-600">Household: {savedOnboarding.household.name} · Step {step}/6</p>

      {step === 2 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Step 2 — Food preferences</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div><h3 className="font-medium">Forbidden foods</h3>{foodOptions.map((food) => <label key={`f-${food.id}`} className="block"><input type="checkbox" checked={selectedForbiddenFoods.includes(food.id)} onChange={() => toggleFood(selectedForbiddenFoods, setSelectedForbiddenFoods, food.id)} /> {food.label}</label>)}</div>
            <div><h3 className="font-medium">Preferred foods</h3>{foodOptions.map((food) => <label key={`p-${food.id}`} className="block"><input type="checkbox" checked={selectedPreferredFoods.includes(food.id)} onChange={() => toggleFood(selectedPreferredFoods, setSelectedPreferredFoods, food.id)} /> {food.label}</label>)}</div>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-3 overflow-auto">
          <h2 className="text-lg font-semibold">Step 3 — Meal presence</h2>
          {savedOnboarding.persons.map((person) => (
            <div key={person.id} className="space-y-2">
              <h3 className="font-medium">{person.name}</h3>
              <table className="w-full border-collapse text-sm"><thead><tr><th className="border p-1 text-left">Meal</th>{weeklyDays.map((d) => <th key={d} className="border p-1">{d}</th>)}</tr></thead>
                <tbody>{mealRows.map((meal) => <tr key={`${person.id}-${meal}`}><td className="border p-1">{mealTypeLabel[meal]}</td>{dayKeys.map((day, i) => <td key={`${person.id}-${meal}-${day}`} className="border p-1 text-center"><input type="checkbox" checked={presenceMap[keyFor(meal, day, person.id)] ?? true} onChange={(e) => setPresence(meal, day, person.id, e.target.checked)} /></td>)}</tr>)}</tbody></table>
            </div>
          ))}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="space-y-3 overflow-auto">
          <h2 className="text-lg font-semibold">Step 4 — Sport days</h2>
          <p className="text-sm text-slate-600">Sport day applies +10% calories for that person/day.</p>
          <table className="w-full border-collapse text-sm"><thead><tr><th className="border p-1 text-left">Person</th>{weeklyDays.map((d) => <th key={d} className="border p-1">{d}</th>)}</tr></thead>
            <tbody>{savedOnboarding.persons.map((person) => <tr key={`sport-${person.id}`}><td className="border p-1">{person.name}</td>{dayKeys.map((day) => <td key={`${person.id}-${day}`} className="border p-1 text-center"><input type="checkbox" checked={sportDaysMap[keyFor("sport", day, person.id)] ?? false} onChange={(e) => setSportDay(day, person.id, e.target.checked)} /></td>)}</tr>)}</tbody></table>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="space-y-3 overflow-auto">
          <h2 className="text-lg font-semibold">Step 5 — Weekly balance plan</h2>
          <table className="w-full border-collapse text-sm"><thead><tr><th className="border p-1 text-left">Day</th><th className="border p-1">Lunch type</th><th className="border p-1">Dinner type</th></tr></thead>
            <tbody>{dayKeys.map((day, index) => {
              const lunchSlot = balancePlan.find((slot) => slot.dayKey === day && slot.mealType === "lunch");
              const dinnerSlot = balancePlan.find((slot) => slot.dayKey === day && slot.mealType === "dinner");
              return <tr key={day}><td className="border p-1">{weeklyDays[index]}</td><td className="border p-1"><select className="w-full rounded border p-1" value={lunchSlot?.mainFoodGroup ?? "cereals"} onChange={(e) => setBalancePlan((prev) => prev.map((slot) => slot.dayKey === day && slot.mealType === "lunch" ? { ...slot, mainFoodGroup: e.target.value as MainFoodGroup } : slot))}>{foodGroups.map((group) => <option key={`l-${day}-${group}`} value={group}>{group}</option>)}</select></td><td className="border p-1"><select className="w-full rounded border p-1" value={dinnerSlot?.mainFoodGroup ?? "white_meat"} onChange={(e) => setBalancePlan((prev) => prev.map((slot) => slot.dayKey === day && slot.mealType === "dinner" ? { ...slot, mainFoodGroup: e.target.value as MainFoodGroup } : slot))}>{foodGroups.map((group) => <option key={`d-${day}-${group}`} value={group}>{group}</option>)}</select></td></tr>;
            })}</tbody></table>
          {dinnerCerealsWarning ? <p className="rounded bg-amber-50 p-2 text-amber-800">Warning: cereals selected at dinner. Allowed, but not recommended.</p> : null}
        </section>
      ) : null}

      {step === 6 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Step 6 — Review & confirm</h2>
          <ul className="list-disc pl-5 text-sm">
            <li>Forbidden foods: {selectedForbiddenFoods.join(", ") || "none"}</li>
            <li>Preferred foods: {selectedPreferredFoods.join(", ") || "none"}</li>
            <li>People configured: {savedOnboarding.persons.length}</li>
          </ul>
          <p className="text-sm">Confirm to generate the weekly menu using all onboarding inputs.</p>
        </section>
      ) : null}

      <div className="flex gap-2">
        <button type="button" className="rounded border px-3 py-2" onClick={navigateBack} disabled={step <= 2}>Back</button>
        <button type="button" className="rounded bg-slate-900 px-4 py-2 text-white" onClick={navigateNext}>{step === 6 ? "Confirm & generate" : "Next"}</button>
      </div>

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

      {generatedMenu ? <WeeklyMenuTable generatedMenu={generatedMenu} recipeOptions={recipeOptions} onReplaceRecipe={onReplaceRecipe} /> : null}
      {generatedMenu ? <button type="button" className="rounded bg-emerald-700 px-3 py-2 text-white" onClick={() => setMenuConfirmed(true)}>Confirm final menu for grocery list</button> : null}
      {menuConfirmed ? <GroceryListSection groceryList={groceryList} menuHasRecipes={Boolean(generatedMenu?.some((day) => day.meals.some((meal) => meal.recipes.length > 0)))} /> : null}
    </div>
  );
}
