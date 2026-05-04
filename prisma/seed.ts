import { PrismaClient, IngredientCategory, StorageType, MainFoodGroup, RecipeMealCategory } from "@prisma/client";

const prisma = new PrismaClient();

const ingredients = [
  ["pasta", "Pasta", "pasta_rice_cereals", "pantry", 365, false],
  ["riso", "Riso", "pasta_rice_cereals", "pantry", 365, false],
  ["zucchine", "Zucchine", "vegetables", "fridge", 4, true],
  ["pomodoro", "Pomodoro", "vegetables", "fridge", 5, true],
  ["ceci", "Ceci", "legumes", "pantry", 365, false],
  ["lenticchie", "Lenticchie", "legumes", "pantry", 365, false],
  ["pollo", "Pollo", "meat", "fridge", 2, false],
  ["uova", "Uova", "eggs", "fridge", 20, false],
  ["mozzarella", "Mozzarella", "dairy", "fridge", 5, false],
  ["pane", "Pane", "bread_bakery", "pantry", 3, false],
  ["insalata", "Insalata", "vegetables", "fridge", 4, true],
  ["patate", "Patate", "vegetables", "pantry", 30, false],
  ["merluzzo", "Merluzzo", "fish", "freezer", 180, false],
  ["yogurt", "Yogurt", "dairy", "fridge", 14, false],
  ["frutta_stagione", "Frutta di stagione", "fruit", "fridge", 6, true]
] as const;

const recipeNames = ["Pasta al pomodoro semplice","Pasta con zucchine","Pasta e lenticchie","Pasta e ceci","Pasta con ricotta e pomodoro","Riso con piselli","Risotto zucchine e parmigiano","Cous cous con verdure","Pasta integrale con tonno e pomodoro","Minestra di verdure con pasta","Insalata di riso con verdure e uova","Riso basmati con pollo e zucchine","Bowl con ceci, riso e verdure","Frittata con patate e insalata","Piadina con pollo, lattuga e pomodoro","Piatto unico con mozzarella, pane e verdure","Pasta fredda con tonno e pomodorini","Cous cous con ceci e verdure","Pollo con patate e verdure","Uova strapazzate con pane e verdure","Petto di pollo alla piastra","Tacchino al limone","Merluzzo al forno","Orata al forno","Tonno al naturale con insalata","Uova sode","Frittata semplice","Hamburger di legumi","Polpette di tacchino al forno","Mozzarella con pomodoro","Zucchine grigliate","Carote crude a julienne","Insalata verde con pomodoro","Finocchi crudi","Spinaci lessi","Bietole saltate","Broccoli al vapore","Melanzane grigliate","Peperoni al forno","Patate lesse","Yogurt bianco con frutta di stagione","Latte con cereali","Pane integrale con marmellata","Pancake semplici","Porridge con banana","Ricotta con miele e frutta","Toast semplice con formaggio fresco","Frutta fresca di stagione","Yogurt con frutta secca","Pane e formaggio fresco"];

async function main() {
  for (const [id, name, category, storageType, shelfLifeDays, isSeasonal] of ingredients) {
    await prisma.ingredient.upsert({
      where: { id },
      update: {},
      create: { id, name, category: category as IngredientCategory, storageType: storageType as StorageType, shelfLifeDays, recommendedPurchaseLeadDays: 2, isSeasonal, seasonWeeks: Array.from({ length: 52 }, (_, i) => i + 1), hasFrozenOption: storageType !== "pantry" }
    });
  }

  for (const name of recipeNames) {
    await prisma.recipe.upsert({
      where: { name },
      update: {},
      create: {
        name,
        mealCategories: [name.includes("Snack") || name.includes("Yogurt") || name.includes("Frutta") ? RecipeMealCategory.afternoon_snack : RecipeMealCategory.dinner],
        recipeTags: ["family_friendly", "quick"],
        regionalTags: [],
        mainFoodGroup: MainFoodGroup.vegetarian,
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        canBePreparedDayBefore: true,
        suitableForChildren: true,
        isSideDish: recipeNames.indexOf(name) + 1 >= 31 && recipeNames.indexOf(name) + 1 <= 40,
        nutritionPerStandardPortion: { kcal: 400, proteinG: 20, carbsG: 40, fatG: 12, sugarsG: 6 },
        steps: ["Prepare ingredients", "Cook", "Serve"]
      }
    });
  }
}

main().finally(() => prisma.$disconnect());
