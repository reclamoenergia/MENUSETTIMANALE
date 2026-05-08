import { prisma } from "@/lib/prisma";
import { recipePayloadSchema } from "@/lib/admin-utils";
import { NextResponse } from "next/server";

// TODO: Protect admin routes before production
export async function GET() {
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: { include: { ingredient: true } } },
    orderBy: { name: "asc" }
  });
  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const parsed = recipePayloadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const uniqueIngredients = new Map(parsed.data.ingredients.map((row) => [row.ingredientId, row]));
  if (uniqueIngredients.size !== parsed.data.ingredients.length) {
    return NextResponse.json({ error: "Duplicate ingredients are not allowed." }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      ...parsed.data,
      ingredients: {
        create: parsed.data.ingredients
      }
    },
    include: { ingredients: true }
  });

  return NextResponse.json(recipe, { status: 201 });
}
