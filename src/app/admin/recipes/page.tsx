import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MainFoodGroup, RecipeMealCategory } from "@prisma/client";
import { AdminWarning } from "@/components/admin/admin-warning";
import { DeleteRecipeButton } from "@/components/admin/delete-recipe-button";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const search = params.search ?? "";
  const mainFoodGroup = params.mainFoodGroup as MainFoodGroup | undefined;
  const mealCategory = params.mealCategory as RecipeMealCategory | undefined;

  const recipes = await prisma.recipe.findMany({
    where: {
      name: { contains: search, mode: "insensitive" },
      ...(mainFoodGroup ? { mainFoodGroup } : {}),
      ...(mealCategory ? { mealCategories: { has: mealCategory } } : {})
    },
    include: { ingredients: true },
    orderBy: { name: "asc" }
  });

  return (
    <section className="space-y-4">
      <AdminWarning />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recipes</h1>
        <Link className="rounded bg-slate-900 px-3 py-2 text-sm text-white" href="/admin/recipes/new">Add recipe</Link>
      </div>
      <form className="grid grid-cols-1 gap-2 rounded border bg-white p-3 sm:grid-cols-4">
        <input name="search" defaultValue={search} placeholder="Search recipe name" className="rounded border px-2 py-1" />
        <select name="mainFoodGroup" defaultValue={mainFoodGroup ?? ""} className="rounded border px-2 py-1">
          <option value="">All groups</option>
          {Object.values(MainFoodGroup).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select name="mealCategory" defaultValue={mealCategory ?? ""} className="rounded border px-2 py-1">
          <option value="">All meal categories</option>
          {Object.values(RecipeMealCategory).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <button className="rounded bg-slate-200 px-2 py-1">Filter</button>
      </form>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead><tr className="border-b bg-slate-50 text-left"><th className="p-2">Name</th><th>Meal categories</th><th>Main group</th><th>Prep</th><th>Cook</th><th># Ingredients</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.id} className="border-b">
                <td className="p-2">{recipe.name}</td><td>{recipe.mealCategories.join(", ")}</td><td>{recipe.mainFoodGroup}</td><td>{recipe.prepTimeMinutes}m</td><td>{recipe.cookTimeMinutes}m</td><td>{recipe.ingredients.length}</td>
                <td className="p-2"><div className="flex gap-2"><Link href={`/admin/recipes/${recipe.id}`} className="rounded bg-slate-200 px-2 py-1">Edit</Link><DeleteRecipeButton id={recipe.id} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
