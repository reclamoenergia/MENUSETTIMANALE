import { AdminWarning } from "@/components/admin/admin-warning";
import { RecipeEditor } from "@/components/admin/recipe-editor";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const [recipe, ingredients] = await Promise.all([
    prisma.recipe.findUnique({ where: { id: (await params).id }, include: { ingredients: true } }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } })
  ]);
  if (!recipe) notFound();
  const normalized = { ...recipe, ingredients: recipe.ingredients.map((r) => ({ ingredientId: r.ingredientId, quantityPerStandardPortion: r.quantityPerStandardPortion, unit: r.unit })) };
  return <section className="space-y-4"><AdminWarning /><h1 className="text-xl font-semibold">Edit recipe</h1><RecipeEditor recipe={normalized} ingredients={ingredients} isNew={false} /></section>;
}
