"use client";

import Link from "next/link";
import { IngredientCategory, MainFoodGroup, RecipeMealCategory, RecipeTag, Unit } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type IngredientOption = { id: string; name: string; category: IngredientCategory };
type RecipeIngredientRow = { ingredientId: string; quantityPerStandardPortion: number; unit: Unit };
type NutritionPerStandardPortion = { kcal: number; proteinG: number; carbsG: number; fatG: number; sugarsG: number };

type RecipePayload = {
  id?: string;
  name: string;
  mealCategories: RecipeMealCategory[];
  recipeTags: RecipeTag[];
  regionalTags: string[];
  mainFoodGroup: MainFoodGroup;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  canBePreparedDayBefore: boolean;
  suitableForChildren: boolean;
  isSideDish: boolean;
  nutritionPerStandardPortion: NutritionPerStandardPortion;
  steps: string[];
  ingredients: RecipeIngredientRow[];
};

type FormErrors = {
  name?: string;
  ingredients?: string;
  ingredientRows: Array<{ ingredientId?: string; quantityPerStandardPortion?: string; unit?: string }>;
};

const ALLOWED_UNITS: Unit[] = [Unit.g, Unit.ml, Unit.piece, Unit.tbsp, Unit.tsp];

export function RecipeEditor({ recipe, ingredients, isNew }: { recipe: any; ingredients: IngredientOption[]; isNew: boolean }) {
  const [form, setForm] = useState<RecipePayload>(recipe);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({ ingredientRows: [] });
  const router = useRouter();

  const ingredientLabelById = useMemo(() => new Map(ingredients.map((i) => [i.id, `${i.name} (${i.category})`])), [ingredients]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = { ingredientRows: form.ingredients.map(() => ({})) };

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (form.ingredients.length === 0) nextErrors.ingredients = "At least one ingredient is required.";

    const seen = new Set<string>();
    form.ingredients.forEach((row, idx) => {
      if (!row.ingredientId) nextErrors.ingredientRows[idx].ingredientId = "Select an ingredient.";
      if (row.ingredientId && seen.has(row.ingredientId)) nextErrors.ingredientRows[idx].ingredientId = "Duplicate ingredient. Use one row per ingredient.";
      seen.add(row.ingredientId);
      if (!(row.quantityPerStandardPortion > 0)) nextErrors.ingredientRows[idx].quantityPerStandardPortion = "Quantity must be greater than 0.";
      if (!row.unit) nextErrors.ingredientRows[idx].unit = "Unit is required.";
    });

    return nextErrors;
  };

  const hasErrors = (validationErrors: FormErrors) => {
    return Boolean(
      validationErrors.name
      || validationErrors.ingredients
      || validationErrors.ingredientRows.some((row) => row.ingredientId || row.quantityPerStandardPortion || row.unit)
    );
  };

  const addIngredientRow = () => {
    const firstAvailable = ingredients.find((option) => !form.ingredients.some((row) => row.ingredientId === option.id));
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientId: firstAvailable?.id ?? "", quantityPerStandardPortion: 1, unit: ALLOWED_UNITS[0] }]
    }));
  };

  const updateIngredientRow = (idx: number, nextRow: RecipeIngredientRow) => {
    const nextRows = [...form.ingredients];
    nextRows[idx] = nextRow;
    setForm({ ...form, ingredients: nextRows });
  };

  const save = async () => {
    setStatus(null);
    const validationErrors = validate();
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsSaving(true);
    setStatus("Saving...");
    const url = isNew ? "/api/admin/recipes" : `/api/admin/recipes/${recipe.id}`;
    const method = isNew ? "POST" : "PUT";
    const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) {
      setIsSaving(false);
      setStatus(data.error ?? "Error");
      return;
    }

    setStatus("Saved successfully.");
    setIsSaving(false);
    if (isNew) router.push(`/admin/recipes/${data.id}`);
    router.refresh();
  };

  return <div className="space-y-6">
    <div className="flex items-center justify-between rounded border bg-white px-4 py-3 sticky top-0 z-10">
      <Link href="/admin/recipes" className="text-sm font-medium text-slate-700 hover:text-slate-900">← Back to recipes</Link>
      <div className="flex items-center gap-3">
        {status ? <span className="text-sm text-slate-700">{status}</span> : null}
        <button disabled={isSaving} className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60" onClick={save}>{isSaving ? "Saving..." : "Save recipe"}</button>
      </div>
    </div>

    <section className="space-y-3 rounded border bg-white p-4">
      <h2 className="text-base font-semibold">Basic info</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Name</span><input className="w-full rounded border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Main food group</span><select className="w-full rounded border px-3 py-2" value={form.mainFoodGroup} onChange={(e) => setForm({ ...form, mainFoodGroup: e.target.value as MainFoodGroup })}>{Object.values(MainFoodGroup).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Meal categories</span><select multiple className="h-28 w-full rounded border px-3 py-2" value={form.mealCategories} onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map((option) => option.value as RecipeMealCategory);
          setForm({ ...form, mealCategories: selected });
        }}>{Object.values(RecipeMealCategory).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Prep time (minutes)</span><input type="number" min={0} className="w-full rounded border px-3 py-2" value={form.prepTimeMinutes} onChange={(e) => setForm({ ...form, prepTimeMinutes: Number(e.target.value) })} /></label>
          <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Cook time (minutes)</span><input type="number" min={0} className="w-full rounded border px-3 py-2" value={form.cookTimeMinutes} onChange={(e) => setForm({ ...form, cookTimeMinutes: Number(e.target.value) })} /></label>
        </div>
      </div>
      {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
    </section>

    <section className="space-y-3 rounded border bg-white p-4">
      <h2 className="text-base font-semibold">Ingredients</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="p-2">Ingredient</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Unit</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {form.ingredients.map((row, idx) => <tr key={`${row.ingredientId}-${idx}`} className="border-t align-top">
              <td className="p-2">
                <select className="w-full rounded border px-2 py-1" value={row.ingredientId} onChange={(e) => {
                  updateIngredientRow(idx, { ...row, ingredientId: e.target.value });
                }}>
                  <option value="">Select ingredient</option>
                  {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} — {i.category}</option>)}
                </select>
                {errors.ingredientRows[idx]?.ingredientId ? <p className="mt-1 text-xs text-red-600">{errors.ingredientRows[idx]?.ingredientId}</p> : null}
              </td>
              <td className="p-2">
                <input type="number" min={0.01} step="0.01" className="w-full rounded border px-2 py-1" value={row.quantityPerStandardPortion} onChange={(e) => {
                  updateIngredientRow(idx, { ...row, quantityPerStandardPortion: Number(e.target.value) });
                }} />
                {errors.ingredientRows[idx]?.quantityPerStandardPortion ? <p className="mt-1 text-xs text-red-600">{errors.ingredientRows[idx]?.quantityPerStandardPortion}</p> : null}
              </td>
              <td className="p-2">
                <select className="w-full rounded border px-2 py-1" value={row.unit} onChange={(e) => {
                  updateIngredientRow(idx, { ...row, unit: e.target.value as Unit });
                }}>
                  {ALLOWED_UNITS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                {errors.ingredientRows[idx]?.unit ? <p className="mt-1 text-xs text-red-600">{errors.ingredientRows[idx]?.unit}</p> : null}
              </td>
              <td className="p-2"><button className="rounded bg-red-100 px-2 py-1 text-red-700" onClick={() => setForm({ ...form, ingredients: form.ingredients.filter((_, rowIndex) => rowIndex !== idx) })}>Remove</button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {errors.ingredients ? <p className="text-sm text-red-600">{errors.ingredients}</p> : null}
      <button className="rounded bg-slate-200 px-3 py-1.5 text-sm" onClick={addIngredientRow}>Add ingredient</button>
      <p className="text-xs text-slate-500">Loaded ingredients: {form.ingredients.map((row) => ingredientLabelById.get(row.ingredientId) ?? "Unknown ingredient").join(", ") || "None"}</p>
    </section>

    <section className="space-y-3 rounded border bg-white p-4">
      <h2 className="text-base font-semibold">Nutrition (per standard portion)</h2>
      <p className="text-sm text-slate-600">Values refer to one standard portion of the recipe.</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Calories (kcal)</span><input type="number" min={0} className="w-full rounded border px-3 py-2" value={form.nutritionPerStandardPortion.kcal} onChange={(e) => setForm({ ...form, nutritionPerStandardPortion: { ...form.nutritionPerStandardPortion, kcal: Number(e.target.value) } })} /></label>
        <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Protein (g)</span><input type="number" min={0} className="w-full rounded border px-3 py-2" value={form.nutritionPerStandardPortion.proteinG} onChange={(e) => setForm({ ...form, nutritionPerStandardPortion: { ...form.nutritionPerStandardPortion, proteinG: Number(e.target.value) } })} /></label>
        <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Carbs (g)</span><input type="number" min={0} className="w-full rounded border px-3 py-2" value={form.nutritionPerStandardPortion.carbsG} onChange={(e) => setForm({ ...form, nutritionPerStandardPortion: { ...form.nutritionPerStandardPortion, carbsG: Number(e.target.value) } })} /></label>
        <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Fat (g)</span><input type="number" min={0} className="w-full rounded border px-3 py-2" value={form.nutritionPerStandardPortion.fatG} onChange={(e) => setForm({ ...form, nutritionPerStandardPortion: { ...form.nutritionPerStandardPortion, fatG: Number(e.target.value) } })} /></label>
        <label className="space-y-1"><span className="text-sm font-medium text-slate-700">Sugars (g)</span><input type="number" min={0} className="w-full rounded border px-3 py-2" value={form.nutritionPerStandardPortion.sugarsG} onChange={(e) => setForm({ ...form, nutritionPerStandardPortion: { ...form.nutritionPerStandardPortion, sugarsG: Number(e.target.value) } })} /></label>
      </div>
    </section>

    <section className="space-y-3 rounded border bg-white p-4">
      <h2 className="text-base font-semibold">Steps</h2>
      <textarea className="min-h-40 w-full rounded border px-3 py-2" value={form.steps.join("\n")} onChange={(e) => setForm({ ...form, steps: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} placeholder="Describe preparation steps (one per line or paragraph)" />
    </section>
  </div>;
}

export function defaultRecipe() {
  return {
    name: "",
    mealCategories: [RecipeMealCategory.lunch],
    recipeTags: [] as RecipeTag[],
    regionalTags: [],
    mainFoodGroup: MainFoodGroup.vegetarian,
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    canBePreparedDayBefore: false,
    suitableForChildren: true,
    isSideDish: false,
    nutritionPerStandardPortion: { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarsG: 0 },
    steps: [""],
    ingredients: [] as Array<{ ingredientId: string; quantityPerStandardPortion: number; unit: Unit }>
  };
}
