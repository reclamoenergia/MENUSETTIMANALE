import { AdminWarning } from "@/components/admin/admin-warning";
import { IngredientEditor } from "@/components/admin/ingredient-editor";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditIngredientPage({ params }: { params: Promise<{ id: string }> }) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id: (await params).id } });
  if (!ingredient) notFound();
  return <section className="space-y-4"><AdminWarning /><h1 className="text-xl font-semibold">Edit ingredient</h1><IngredientEditor ingredient={{ ...ingredient, seasonWeeksInput: ingredient.seasonWeeks.join(",") }} isNew={false} /></section>;
}
