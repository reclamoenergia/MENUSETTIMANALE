import {
  IngredientCategory,
  MainFoodGroup,
  PrismaClient,
  RecipeMealCategory,
  RecipeTag,
  StorageType
} from "@prisma/client";

const prisma = new PrismaClient();

const allWeeks = Array.from({ length: 52 }, (_, i) => i + 1);

type SeedIngredient = {
  id: string;
  name: string;
  category: IngredientCategory;
  storageType: StorageType;
  shelfLifeDays: number;
  recommendedPurchaseLeadDays: number;
  isSeasonal: boolean;
  seasonWeeks: number[];
  hasFrozenOption: boolean;
};

const ingredients: SeedIngredient[] = [
  { id: "pasta", name: "Pasta", category: "pasta_rice_cereals", storageType: "pantry", shelfLifeDays: 365, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "riso", name: "Riso", category: "pasta_rice_cereals", storageType: "pantry", shelfLifeDays: 365, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "zucchine", name: "Zucchine", category: "vegetables", storageType: "fridge", shelfLifeDays: 4, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38], hasFrozenOption: true },
  { id: "pomodoro", name: "Pomodoro", category: "vegetables", storageType: "fridge", shelfLifeDays: 5, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40], hasFrozenOption: true },
  { id: "insalata", name: "Insalata", category: "vegetables", storageType: "fridge", shelfLifeDays: 4, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42], hasFrozenOption: false },
  { id: "patate", name: "Patate", category: "vegetables", storageType: "pantry", shelfLifeDays: 30, recommendedPurchaseLeadDays: 5, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "frutta_stagione", name: "Frutta di stagione", category: "fruit", storageType: "fridge", shelfLifeDays: 6, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "ceci", name: "Ceci", category: "legumes", storageType: "pantry", shelfLifeDays: 365, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "lenticchie", name: "Lenticchie", category: "legumes", storageType: "pantry", shelfLifeDays: 365, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "pollo", name: "Pollo", category: "meat", storageType: "fridge", shelfLifeDays: 2, recommendedPurchaseLeadDays: 1, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: true },
  { id: "uova", name: "Uova", category: "eggs", storageType: "fridge", shelfLifeDays: 20, recommendedPurchaseLeadDays: 5, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "mozzarella", name: "Mozzarella", category: "dairy", storageType: "fridge", shelfLifeDays: 5, recommendedPurchaseLeadDays: 2, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "pane", name: "Pane", category: "bread_bakery", storageType: "pantry", shelfLifeDays: 3, recommendedPurchaseLeadDays: 1, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: true },
  { id: "merluzzo", name: "Merluzzo", category: "fish", storageType: "freezer", shelfLifeDays: 180, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: true },
  { id: "yogurt", name: "Yogurt", category: "dairy", storageType: "fridge", shelfLifeDays: 14, recommendedPurchaseLeadDays: 3, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false }
];

type SeedRecipe = {
  name: string;
  mealCategories: RecipeMealCategory[];
  mainFoodGroup: MainFoodGroup;
  recipeTags?: RecipeTag[];
  isSideDish?: boolean;
};

const recipes: SeedRecipe[] = [
  { name: "Pasta al pomodoro semplice", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cereals" },
  { name: "Pasta con zucchine", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "vegetarian" },
  { name: "Pasta e lenticchie", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Pasta e ceci", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Pasta con ricotta e pomodoro", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Riso con piselli", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cereals" },
  { name: "Risotto zucchine e parmigiano", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Cous cous con verdure", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "vegetarian" },
  { name: "Pasta integrale con tonno e pomodoro", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Minestra di verdure con pasta", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "vegetables" },

  { name: "Insalata di riso con verdure e uova", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "eggs" },
  { name: "Riso basmati con pollo e zucchine", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Bowl con ceci, riso e verdure", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Frittata con patate e insalata", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "eggs" },
  { name: "Piadina con pollo, lattuga e pomodoro", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Piatto unico con mozzarella, pane e verdure", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Pasta fredda con tonno e pomodorini", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Cous cous con ceci e verdure", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Pollo con patate e verdure", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Uova strapazzate con pane e verdure", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "eggs" },

  { name: "Petto di pollo alla piastra", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Tacchino al limone", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Merluzzo al forno", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Orata al forno", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Tonno al naturale con insalata", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Uova sode", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "eggs" },
  { name: "Frittata semplice", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "eggs" },
  { name: "Hamburger di legumi", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Polpette di tacchino al forno", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Mozzarella con pomodoro", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "cheese" },

  { name: "Zucchine grigliate", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Carote crude a julienne", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Insalata verde con pomodoro", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Finocchi crudi", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Spinaci lessi", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Bietole saltate", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Broccoli al vapore", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Melanzane grigliate", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Peperoni al forno", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Patate lesse", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },

  { name: "Yogurt bianco con frutta di stagione", mealCategories: ["breakfast", "morning_snack"], mainFoodGroup: "fruit" },
  { name: "Latte con cereali", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Pane integrale con marmellata", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Pancake semplici", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Porridge con banana", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Ricotta con miele e frutta", mealCategories: ["breakfast", "morning_snack"], mainFoodGroup: "cheese" },
  { name: "Toast semplice con formaggio fresco", mealCategories: ["breakfast"], mainFoodGroup: "cheese" },

  { name: "Frutta fresca di stagione", mealCategories: ["morning_snack", "afternoon_snack", "evening_snack"], mainFoodGroup: "fruit" },
  { name: "Yogurt con frutta secca", mealCategories: ["morning_snack", "afternoon_snack", "evening_snack"], mainFoodGroup: "snack" },
  { name: "Pane e formaggio fresco", mealCategories: ["morning_snack", "afternoon_snack", "evening_snack"], mainFoodGroup: "snack" }
];

async function main() {
  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { id: ingredient.id },
      update: ingredient,
      create: ingredient
    });
  }

  for (const recipe of recipes) {
    await prisma.recipe.upsert({
      where: { name: recipe.name },
      update: {
        mealCategories: recipe.mealCategories,
        mainFoodGroup: recipe.mainFoodGroup,
        isSideDish: recipe.isSideDish ?? false
      },
      create: {
        name: recipe.name,
        mealCategories: recipe.mealCategories,
        recipeTags: recipe.recipeTags ?? ["family_friendly", "quick"],
        regionalTags: [],
        mainFoodGroup: recipe.mainFoodGroup,
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        canBePreparedDayBefore: true,
        suitableForChildren: true,
        isSideDish: recipe.isSideDish ?? false,
        nutritionPerStandardPortion: { kcal: 400, proteinG: 20, carbsG: 40, fatG: 12, sugarsG: 6 },
        steps: ["Prepare ingredients", "Cook", "Serve"]
      }
    });
  }
}

main().finally(() => prisma.$disconnect());
