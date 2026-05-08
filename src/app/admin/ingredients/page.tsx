import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IngredientCategory, StorageType } from "@prisma/client";
import { AdminWarning } from "@/components/admin/admin-warning";
import { DeleteIngredientButton } from "@/components/admin/delete-ingredient-button";

export default async function IngredientsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const search = params.search ?? "";
  const category = params.category as IngredientCategory | undefined;
  const storageType = params.storageType as StorageType | undefined;
  const ingredients = await prisma.ingredient.findMany({ where: { name: { contains: search, mode: "insensitive" }, ...(category ? { category } : {}), ...(storageType ? { storageType } : {}) }, orderBy: { name: "asc" } });
  return <section className="space-y-4"><AdminWarning /><div className="flex items-center justify-between"><h1 className="text-xl font-semibold">Ingredients</h1><Link href="/admin/ingredients/new" className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add ingredient</Link></div>
  <form className="grid grid-cols-1 gap-2 rounded border bg-white p-3 sm:grid-cols-4"><input name="search" defaultValue={search} placeholder="Search name" className="rounded border px-2 py-1"/><select name="category" defaultValue={category ?? ""} className="rounded border px-2 py-1"><option value="">All categories</option>{Object.values(IngredientCategory).map(v=><option key={v}>{v}</option>)}</select><select name="storageType" defaultValue={storageType ?? ""} className="rounded border px-2 py-1"><option value="">All storage</option>{Object.values(StorageType).map(v=><option key={v}>{v}</option>)}</select><button className="rounded bg-slate-200 px-2 py-1">Filter</button></form>
  <div className="overflow-x-auto rounded border bg-white"><table className="min-w-full text-sm"><thead><tr className="bg-slate-50 text-left"><th className="p-2">Name</th><th>Category</th><th>Storage</th><th>Shelf life</th><th>Lead days</th><th>Seasonal</th><th>Season weeks</th><th>Frozen</th><th className="p-2">Actions</th></tr></thead><tbody>{ingredients.map(i=><tr key={i.id} className="border-t"><td className="p-2">{i.name}</td><td>{i.category}</td><td>{i.storageType}</td><td>{i.shelfLifeDays}</td><td>{i.recommendedPurchaseLeadDays}</td><td>{String(i.isSeasonal)}</td><td>{i.seasonWeeks.join(",")}</td><td>{String(i.hasFrozenOption)}</td><td className="p-2"><div className="flex gap-2"><Link href={`/admin/ingredients/${i.id}`} className="rounded bg-slate-200 px-2 py-1">Edit</Link><DeleteIngredientButton id={i.id} /></div></td></tr>)}</tbody></table></div></section>;
}
