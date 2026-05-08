"use client";

import { IngredientCategory, MainFoodGroup, RecipeMealCategory, RecipeTag, Unit } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type IngredientOption = { id: string; name: string; category: IngredientCategory };

type RecipePayload = any;

export function RecipeEditor({ recipe, ingredients, isNew }: { recipe: RecipePayload; ingredients: IngredientOption[]; isNew: boolean }) {
  const [form, setForm] = useState(recipe);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  const save = async () => {
    setStatus("Saving...");
    const url = isNew ? "/api/admin/recipes" : `/api/admin/recipes/${recipe.id}`;
    const method = isNew ? "POST" : "PUT";
    const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) return setStatus(data.error ?? "Error");
    setStatus("Saved successfully");
    if (isNew) router.push(`/admin/recipes/${data.id}`);
    router.refresh();
  };

  return <div className="space-y-3">{/* compact form */}
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"> <input className="rounded border px-2 py-1" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Name"/>
      <select className="rounded border px-2 py-1" value={form.mainFoodGroup} onChange={(e)=>setForm({...form,mainFoodGroup:e.target.value})}>{Object.values(MainFoodGroup).map(v=><option key={v}>{v}</option>)}</select>
      <input type="number" className="rounded border px-2 py-1" value={form.prepTimeMinutes} onChange={(e)=>setForm({...form,prepTimeMinutes:Number(e.target.value)})} placeholder="Prep minutes"/>
    </div>
    <textarea className="w-full rounded border px-2 py-1" value={form.steps.join("\n")} onChange={(e)=>setForm({...form,steps:e.target.value.split("\n").filter(Boolean)})} placeholder="One step per line" />
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{["kcal","proteinG","carbsG","fatG","sugarsG"].map((k)=><input key={k} type="number" className="rounded border px-2 py-1" value={form.nutritionPerStandardPortion[k] ?? 0} onChange={(e)=>setForm({...form,nutritionPerStandardPortion:{...form.nutritionPerStandardPortion,[k]:Number(e.target.value)}})} placeholder={k} />)}</div>
    <div className="space-y-2 rounded border p-2">
      <div className="font-medium">Ingredients</div>
      {form.ingredients.map((row: any, idx: number) => <div className="grid grid-cols-12 gap-2" key={idx}>
        <select className="col-span-6 rounded border px-2 py-1" value={row.ingredientId} onChange={(e)=>{const next=[...form.ingredients];next[idx].ingredientId=e.target.value;setForm({...form,ingredients:next});}}>
          {ingredients.map((i)=><option key={i.id} value={i.id}>{i.name} — {i.category}</option>)}
        </select>
        <input type="number" className="col-span-2 rounded border px-2 py-1" value={row.quantityPerStandardPortion} onChange={(e)=>{const next=[...form.ingredients];next[idx].quantityPerStandardPortion=Number(e.target.value);setForm({...form,ingredients:next});}} />
        <select className="col-span-2 rounded border px-2 py-1" value={row.unit} onChange={(e)=>{const next=[...form.ingredients];next[idx].unit=e.target.value;setForm({...form,ingredients:next});}}>{Object.values(Unit).map(v=><option key={v}>{v}</option>)}</select>
        <button className="col-span-2 rounded bg-red-100" onClick={()=>setForm({...form,ingredients:form.ingredients.filter((_:unknown,i:number)=>i!==idx)})}>Remove</button>
      </div>)}
      <button className="rounded bg-slate-200 px-2 py-1" onClick={()=>setForm({...form,ingredients:[...form.ingredients,{ingredientId:ingredients[0]?.id ?? "",quantityPerStandardPortion:1,unit:Unit.g}]})}>Add ingredient</button>
    </div>
    <div className="sticky bottom-0 flex items-center gap-2 border-t bg-white py-2"><button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={save}>Save</button><span className="text-sm">{status}</span></div>
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
