import { IngredientCategory, PrismaClient } from "@prisma/client";
import { ingredients } from "./seed-data/ingredients";
import { recipes } from "./seed-data/recipes";

const prisma = new PrismaClient();

function validateSeedData(): void {
  const ingredientIds = new Set(ingredients.map((i) => i.id));

  for (const recipe of recipes) {
    if (recipe.ingredients.length === 0) {
      throw new Error(`Recipe ${recipe.id} (${recipe.name}) has no ingredients.`);
    }

    if (!recipe.nutritionPerStandardPortion) {
      throw new Error(`Recipe ${recipe.id} (${recipe.name}) has no nutrition data.`);
    }

    const seen = new Set<string>();
    for (const ri of recipe.ingredients) {
      if (!ingredientIds.has(ri.ingredientId)) {
        throw new Error(`Recipe ${recipe.id} (${recipe.name}) references missing ingredient ${ri.ingredientId}.`);
      }
      if (seen.has(ri.ingredientId)) {
        throw new Error(`Recipe ${recipe.id} (${recipe.name}) contains duplicate ingredient ${ri.ingredientId}.`);
      }
      seen.add(ri.ingredientId);
    }

    const lowName = recipe.name.toLowerCase();
    for (const ri of recipe.ingredients) {
      const token = ri.ingredientId.split("_")[0];
      if (["pasta", "riso", "pollo", "tonno", "uova", "yogurt"].includes(token) && !lowName.includes(token)) {
        console.warn(`[seed:warning] Possible mismatch: ${recipe.name} includes ${ri.ingredientId}`);
      }
    }
  }

  for (const ingredient of ingredients) {
    if (["fruit", "vegetables"].includes(ingredient.category as IngredientCategory) && ingredient.seasonWeeks.length === 0) {
      throw new Error(`Ingredient ${ingredient.id} (${ingredient.name}) is fruit/vegetable and has no season weeks.`);
    }
  }
}

async function main() {
  validateSeedData();

  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({ where: { id: ingredient.id }, update: ingredient, create: ingredient });
  }

  for (const recipe of recipes) {
    await prisma.$transaction(async (tx) => {
      const byId = await tx.recipe.findUnique({ where: { id: recipe.id }, select: { id: true } });
      const byName = await tx.recipe.findUnique({ where: { name: recipe.name }, select: { id: true } });

      if (!byId && byName && byName.id !== recipe.id) {
        const targetIdAlreadyUsed = await tx.recipe.findUnique({ where: { id: recipe.id }, select: { id: true } });

        if (!targetIdAlreadyUsed) {
          await tx.recipe.update({
            where: { id: byName.id },
            data: { id: recipe.id }
          });
        } else {
          await tx.recipeIngredient.deleteMany({ where: { recipeId: byName.id } });
          await tx.recipe.delete({ where: { id: byName.id } });
        }
      }

      const upserted = await tx.recipe.upsert({
        where: { id: recipe.id },
        update: {
          name: recipe.name,
          mealCategories: recipe.mealCategories,
          recipeTags: recipe.recipeTags,
          regionalTags: recipe.regionalTags,
          mainFoodGroup: recipe.mainFoodGroup,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          canBePreparedDayBefore: recipe.canBePreparedDayBefore,
          suitableForChildren: recipe.suitableForChildren,
          isSideDish: recipe.isSideDish,
          nutritionPerStandardPortion: recipe.nutritionPerStandardPortion,
          steps: recipe.steps
        },
        create: {
          id: recipe.id,
          name: recipe.name,
          mealCategories: recipe.mealCategories,
          recipeTags: recipe.recipeTags,
          regionalTags: recipe.regionalTags,
          mainFoodGroup: recipe.mainFoodGroup,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          canBePreparedDayBefore: recipe.canBePreparedDayBefore,
          suitableForChildren: recipe.suitableForChildren,
          isSideDish: recipe.isSideDish,
          nutritionPerStandardPortion: recipe.nutritionPerStandardPortion,
          steps: recipe.steps
        }
      });

      await tx.recipeIngredient.deleteMany({ where: { recipeId: upserted.id } });
      await tx.recipeIngredient.createMany({
        data: recipe.ingredients.map((ri) => ({
          recipeId: upserted.id,
          ingredientId: ri.ingredientId,
          quantityPerStandardPortion: ri.quantity,
          unit: ri.unit
        }))
      });

    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
