import { AdminWarning } from "@/components/admin/admin-warning";
import { RecipeEditor, defaultRecipe } from "@/components/admin/recipe-editor";
import { prisma } from "@/lib/prisma";

export default async function NewRecipePage() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: "asc" } });
  return <section className="space-y-4"><AdminWarning /><h1 className="text-xl font-semibold">New recipe</h1><RecipeEditor recipe={defaultRecipe()} ingredients={ingredients} isNew /></section>;
}
