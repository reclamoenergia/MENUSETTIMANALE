import { prisma } from "@/lib/prisma";
import { ingredientPayloadSchema } from "@/lib/admin-utils";
import { NextResponse } from "next/server";

// TODO: Protect admin routes before production
export async function GET() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(ingredients);
}

export async function POST(request: Request) {
  const parsed = ingredientPayloadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const ingredient = await prisma.ingredient.create({ data: { ...parsed.data, id: parsed.data.id ?? crypto.randomUUID() } });
  return NextResponse.json(ingredient, { status: 201 });
}
