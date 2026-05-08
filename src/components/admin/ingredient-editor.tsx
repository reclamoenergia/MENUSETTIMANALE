"use client";

import { IngredientCategory, StorageType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function IngredientEditor({ ingredient, isNew }: { ingredient: any; isNew: boolean }) {
  const [form, setForm] = useState(ingredient);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  const save = async () => {
    const seasonWeeks = (form.seasonWeeksInput as string).split(",").map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n));
    if (seasonWeeks.some((n) => n < 1 || n > 52)) return setStatus("Season weeks must be 1-52.");
    const payload = { ...form, seasonWeeks: form.isSeasonal ? seasonWeeks : [] };
    const url = isNew ? "/api/admin/ingredients" : `/api/admin/ingredients/${form.id}`;
    const response = await fetch(url, { method: isNew ? "POST" : "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) return setStatus(data.error ?? "Error");
    setStatus("Saved successfully");
    if (isNew) router.push(`/admin/ingredients/${data.id}`);
    router.refresh();
  };
  return <div className="space-y-2">
    <input className="w-full rounded border px-2 py-1" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Name" />
    <div className="grid grid-cols-2 gap-2">
      <select className="rounded border px-2 py-1" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{Object.values(IngredientCategory).map(v=><option key={v}>{v}</option>)}</select>
      <select className="rounded border px-2 py-1" value={form.storageType} onChange={(e)=>setForm({...form,storageType:e.target.value})}>{Object.values(StorageType).map(v=><option key={v}>{v}</option>)}</select>
      <input type="number" className="rounded border px-2 py-1" value={form.shelfLifeDays} onChange={(e)=>setForm({...form,shelfLifeDays:Number(e.target.value)})} placeholder="Shelf life days" />
      <input type="number" className="rounded border px-2 py-1" value={form.recommendedPurchaseLeadDays} onChange={(e)=>setForm({...form,recommendedPurchaseLeadDays:Number(e.target.value)})} placeholder="Purchase lead days" />
    </div>
    <label className="flex gap-2"><input type="checkbox" checked={form.isSeasonal} onChange={(e)=>setForm({...form,isSeasonal:e.target.checked})}/> isSeasonal</label>
    <input className="w-full rounded border px-2 py-1" value={form.seasonWeeksInput} onChange={(e)=>setForm({...form,seasonWeeksInput:e.target.value})} placeholder="Season weeks e.g. 1,2,3" />
    <label className="flex gap-2"><input type="checkbox" checked={form.hasFrozenOption} onChange={(e)=>setForm({...form,hasFrozenOption:e.target.checked})}/> hasFrozenOption</label>
    <div className="sticky bottom-0 border-t bg-white py-2"><button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={save}>Save</button> <span className="text-sm">{status}</span></div>
  </div>;
}

export const defaultIngredient = { id: undefined, name: "", category: IngredientCategory.other, storageType: StorageType.pantry, shelfLifeDays: 0, recommendedPurchaseLeadDays: 0, isSeasonal: false, seasonWeeks: [], seasonWeeksInput: "", hasFrozenOption: false };
