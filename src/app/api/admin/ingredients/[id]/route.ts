import { prisma } from "@/lib/prisma";
import { ingredientPayloadSchema } from "@/lib/admin-utils";
import { NextResponse } from "next/server";

// TODO: Protect admin routes before production
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id: (await params).id } });
  if (!ingredient) return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
  return NextResponse.json(ingredient);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = ingredientPayloadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id: _id, ...payload } = parsed.data;
  const ingredient = await prisma.ingredient.update({ where: { id: (await params).id }, data: payload });
  return NextResponse.json(ingredient);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const linkedCount = await prisma.recipeIngredient.count({ where: { ingredientId: (await params).id } });
  if (linkedCount > 0) {
    return NextResponse.json({ error: "Cannot delete ingredient linked to recipes." }, { status: 409 });
  }
  await prisma.ingredient.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
}
