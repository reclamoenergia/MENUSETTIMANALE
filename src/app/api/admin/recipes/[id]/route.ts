import { prisma } from "@/lib/prisma";
import { recipePayloadSchema } from "@/lib/admin-utils";
import { NextResponse } from "next/server";

// TODO: Protect admin routes before production
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: (await params).id },
    include: { ingredients: { include: { ingredient: true } } }
  });
  if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = recipePayloadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const uniqueIngredients = new Map(parsed.data.ingredients.map((row) => [row.ingredientId, row]));
  if (uniqueIngredients.size !== parsed.data.ingredients.length) {
    return NextResponse.json({ error: "Duplicate ingredients are not allowed." }, { status: 400 });
  }

  const recipe = await prisma.recipe.update({
    where: { id: (await params).id },
    data: {
      ...parsed.data,
      ingredients: {
        deleteMany: {},
        create: parsed.data.ingredients
      }
    },
    include: { ingredients: true }
  });

  return NextResponse.json(recipe);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await prisma.recipe.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
}
