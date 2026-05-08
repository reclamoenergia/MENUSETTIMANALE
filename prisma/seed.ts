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
  { id: "banana", name: "Banana", category: "fruit", storageType: "pantry", shelfLifeDays: 5, recommendedPurchaseLeadDays: 2, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "apple", name: "Apple", category: "fruit", storageType: "fridge", shelfLifeDays: 10, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [1,2,3,4,5,6,7,8,9,10,40,41,42,43,44,45,46,47,48,49,50,51,52], hasFrozenOption: false },
  { id: "pear", name: "Pear", category: "fruit", storageType: "fridge", shelfLifeDays: 8, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [1,2,3,4,5,6,7,8,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52], hasFrozenOption: false },
  { id: "peach", name: "Peach", category: "fruit", storageType: "fridge", shelfLifeDays: 5, recommendedPurchaseLeadDays: 1, isSeasonal: true, seasonWeeks: [23,24,25,26,27,28,29,30,31,32,33,34,35], hasFrozenOption: false },
  { id: "apricot", name: "Apricot", category: "fruit", storageType: "fridge", shelfLifeDays: 4, recommendedPurchaseLeadDays: 1, isSeasonal: true, seasonWeeks: [20,21,22,23,24,25,26,27,28], hasFrozenOption: false },
  { id: "orange", name: "Orange", category: "fruit", storageType: "fridge", shelfLifeDays: 12, recommendedPurchaseLeadDays: 3, isSeasonal: true, seasonWeeks: [1,2,3,4,5,6,7,8,9,10,11,12,45,46,47,48,49,50,51,52], hasFrozenOption: false },
  { id: "mandarin", name: "Mandarin", category: "fruit", storageType: "fridge", shelfLifeDays: 10, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [1,2,3,4,5,6,7,8,9,10,11,12,44,45,46,47,48,49,50,51,52], hasFrozenOption: false },
  { id: "grapes", name: "Grapes", category: "fruit", storageType: "fridge", shelfLifeDays: 7, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [31,32,33,34,35,36,37,38,39,40,41], hasFrozenOption: false },
  { id: "strawberries", name: "Strawberries", category: "fruit", storageType: "fridge", shelfLifeDays: 4, recommendedPurchaseLeadDays: 1, isSeasonal: true, seasonWeeks: [14,15,16,17,18,19,20,21,22,23,24,25], hasFrozenOption: false },
  { id: "kiwi", name: "Kiwi", category: "fruit", storageType: "fridge", shelfLifeDays: 10, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [1,2,3,4,5,6,7,8,9,10,11,12,45,46,47,48,49,50,51,52], hasFrozenOption: false },
  { id: "melon", name: "Melon", category: "fruit", storageType: "fridge", shelfLifeDays: 6, recommendedPurchaseLeadDays: 1, isSeasonal: true, seasonWeeks: [22,23,24,25,26,27,28,29,30,31,32,33,34,35], hasFrozenOption: false },
  { id: "watermelon", name: "Watermelon", category: "fruit", storageType: "fridge", shelfLifeDays: 5, recommendedPurchaseLeadDays: 1, isSeasonal: true, seasonWeeks: [24,25,26,27,28,29,30,31,32,33,34,35], hasFrozenOption: false },
  { id: "ceci", name: "Ceci", category: "legumes", storageType: "pantry", shelfLifeDays: 365, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "lenticchie", name: "Lenticchie", category: "legumes", storageType: "pantry", shelfLifeDays: 365, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "pollo", name: "Pollo", category: "meat", storageType: "fridge", shelfLifeDays: 2, recommendedPurchaseLeadDays: 1, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: true },
  { id: "uova", name: "Uova", category: "eggs", storageType: "fridge", shelfLifeDays: 20, recommendedPurchaseLeadDays: 5, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "mozzarella", name: "Mozzarella", category: "dairy", storageType: "fridge", shelfLifeDays: 5, recommendedPurchaseLeadDays: 2, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "pane", name: "Pane", category: "bread_bakery", storageType: "pantry", shelfLifeDays: 3, recommendedPurchaseLeadDays: 1, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: true },
  { id: "merluzzo", name: "Merluzzo", category: "fish", storageType: "freezer", shelfLifeDays: 180, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: true },
  { id: "yogurt", name: "Yogurt", category: "dairy", storageType: "fridge", shelfLifeDays: 14, recommendedPurchaseLeadDays: 3, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "carote", name: "Carote", category: "vegetables", storageType: "fridge", shelfLifeDays: 7, recommendedPurchaseLeadDays: 3, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: true },
  { id: "spinaci", name: "Spinaci", category: "vegetables", storageType: "fridge", shelfLifeDays: 4, recommendedPurchaseLeadDays: 2, isSeasonal: true, seasonWeeks: [1,2,3,4,5,6,7,8,9,10,11,12,40,41,42,43,44,45,46,47,48,49,50,51,52], hasFrozenOption: true },
  { id: "tonno", name: "Tonno", category: "fish", storageType: "pantry", shelfLifeDays: 365, recommendedPurchaseLeadDays: 7, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false },
  { id: "ricotta", name: "Ricotta", category: "dairy", storageType: "fridge", shelfLifeDays: 5, recommendedPurchaseLeadDays: 2, isSeasonal: false, seasonWeeks: allWeeks, hasFrozenOption: false }
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
  { name: "Riso al pomodoro e basilico", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cereals" },
  { name: "Orzo con zucchine e carote", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cereals" },
  { name: "Farro con piselli", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cereals" },
  { name: "Zuppa di legumi misti", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Crema di zucca con crostini", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "vegetables" },
  { name: "Passato di verdure con riso", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "vegetables" },
  { name: "Gnocchi al pomodoro", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cereals" },
  { name: "Polenta morbida con formaggio", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Minestra d'orzo e lenticchie", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Riso con zucca e parmigiano", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Vellutata di carote e patate", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "vegetables" },
  { name: "Cous cous con pollo e verdure", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Riso integrale con ceci e pomodoro", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Pasta e fagioli semplice", mealCategories: ["first_course", "lunch", "dinner"], mainFoodGroup: "legumes" },

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
  { name: "Bowl di farro con tonno e mais", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Insalata di patate, fagiolini e uova", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "eggs" },
  { name: "Riso con salmone e zucchine", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Polpette di ceci con insalata e pane", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Focaccia farcita con mozzarella e pomodoro", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Piatto unico con hummus, carote e pane", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Wrap con tacchino e verdure grigliate", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Insalata di orzo con verdure e feta", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Piatto unico con uova al tegamino, patate e spinaci", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "eggs" },
  { name: "Riso basmati con lenticchie e verdure", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Insalata di quinoa con pollo e cetriolo", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Piatto unico con ricotta, pane e pomodorini", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Salmone al forno con riso e zucchine", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Insalata tiepida di ceci, patate e carote", mealCategories: ["single_dish", "lunch", "dinner"], mainFoodGroup: "legumes" },

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
  { name: "Straccetti di pollo con limone", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Cosce di pollo al forno", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Bocconcini di tacchino al rosmarino", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "white_meat" },
  { name: "Salmone al cartoccio", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Filetti di platessa al forno", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Sgombro al forno con erbe", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "fish" },
  { name: "Uova al tegamino", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "eggs" },
  { name: "Omelette al formaggio", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "eggs" },
  { name: "Ceci al pomodoro", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Lenticchie in umido", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Burger di ceci e carote", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "legumes" },
  { name: "Ricotta con erbette", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Primo sale con zucchine grigliate", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "cheese" },
  { name: "Tofu alla piastra con salsa di yogurt", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "vegetarian" },
  { name: "Frittata di zucchine", mealCategories: ["second_course", "lunch", "dinner"], mainFoodGroup: "eggs" },

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
  { name: "Patate al forno", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Fagiolini al vapore", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Piselli in padella", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Cavolfiore lesso", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Zucca al forno", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Insalata di carote e mais", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Pomodori in insalata", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Verdure miste al forno", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Cime di rapa saltate", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Zucchine trifolate", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Cavolo cappuccio in padella", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Barbabietole in insalata", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Ratatouille semplice", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Patate e carote al vapore", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Insalata di cetrioli", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Carote cotte al vapore", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },
  { name: "Peperoni in padella", mealCategories: ["side_dish", "lunch", "dinner"], mainFoodGroup: "vegetables", isSideDish: true },

  { name: "Yogurt bianco con frutta di stagione", mealCategories: ["breakfast", "morning_snack"], mainFoodGroup: "fruit" },
  { name: "Latte con cereali", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Pane integrale con marmellata", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Pancake semplici", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Porridge con banana", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Ricotta con miele e frutta", mealCategories: ["breakfast", "morning_snack"], mainFoodGroup: "cheese" },
  { name: "Toast semplice con formaggio fresco", mealCategories: ["breakfast"], mainFoodGroup: "cheese" },
  { name: "Pane e olio con frutta", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Yogurt con avena e mela", mealCategories: ["breakfast"], mainFoodGroup: "cheese" },
  { name: "Uovo strapazzato e pane tostato", mealCategories: ["breakfast"], mainFoodGroup: "eggs" },
  { name: "Frullato banana e yogurt", mealCategories: ["breakfast"], mainFoodGroup: "fruit" },
  { name: "Budino di chia e latte", mealCategories: ["breakfast"], mainFoodGroup: "cheese" },
  { name: "Toast con ricotta e marmellata", mealCategories: ["breakfast"], mainFoodGroup: "cheese" },
  { name: "Muesli con yogurt", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Crepes semplici con frutta", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Pane tostato con burro di arachidi", mealCategories: ["breakfast"], mainFoodGroup: "cereals" },
  { name: "Latte e biscotti semplici", mealCategories: ["breakfast"], mainFoodGroup: "cheese" },
  { name: "Yogurt con pera e cannella", mealCategories: ["breakfast"], mainFoodGroup: "fruit" },
  { name: "Pane con ricotta e cacao", mealCategories: ["breakfast"], mainFoodGroup: "cheese" },

  { name: "Frutta fresca di stagione", mealCategories: ["morning_snack", "afternoon_snack", "evening_snack"], mainFoodGroup: "fruit" },
  { name: "Yogurt con frutta secca", mealCategories: ["morning_snack", "afternoon_snack", "evening_snack"], mainFoodGroup: "snack" },
  { name: "Pane e formaggio fresco", mealCategories: ["morning_snack", "afternoon_snack", "evening_snack"], mainFoodGroup: "snack" },
  { name: "Yogurt bianco", mealCategories: ["afternoon_snack"], mainFoodGroup: "cheese" },
  { name: "Pane e hummus", mealCategories: ["afternoon_snack"], mainFoodGroup: "legumes" },
  { name: "Mela a fette e yogurt", mealCategories: ["afternoon_snack"], mainFoodGroup: "fruit" },
  { name: "Toast piccolo con ricotta", mealCategories: ["afternoon_snack"], mainFoodGroup: "cheese" },
  { name: "Crackers integrali e formaggio", mealCategories: ["afternoon_snack"], mainFoodGroup: "cereals" },
  { name: "Banana e mandorle", mealCategories: ["afternoon_snack"], mainFoodGroup: "fruit" },
  { name: "Pera e cubetti di parmigiano", mealCategories: ["afternoon_snack"], mainFoodGroup: "fruit" },
  { name: "Coppetta di frutta mista", mealCategories: ["afternoon_snack"], mainFoodGroup: "fruit" },
  { name: "Yogurt e cereali croccanti", mealCategories: ["afternoon_snack"], mainFoodGroup: "cereals" },
  { name: "Pane tostato con pomodoro", mealCategories: ["afternoon_snack"], mainFoodGroup: "vegetarian" },
  { name: "Piccolo smoothie fragola e banana", mealCategories: ["afternoon_snack"], mainFoodGroup: "fruit" },
  { name: "Muffin integrale semplice", mealCategories: ["afternoon_snack"], mainFoodGroup: "cereals" },
  { name: "Ricotta con frutta fresca", mealCategories: ["afternoon_snack"], mainFoodGroup: "cheese" },
  { name: "Yogurt con purea di frutta", mealCategories: ["afternoon_snack"], mainFoodGroup: "cheese" },
  { name: "Pane e crema di ceci", mealCategories: ["afternoon_snack"], mainFoodGroup: "legumes" },
  { name: "Spicchi di arancia", mealCategories: ["afternoon_snack"], mainFoodGroup: "fruit" },
  { name: "Carote crude con salsa yogurt", mealCategories: ["afternoon_snack"], mainFoodGroup: "vegetables" }
];

async function main() {
  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { id: ingredient.id },
      update: ingredient,
      create: ingredient
    });
  }

  const createdRecipes: { id: string; name: string; mainFoodGroup: MainFoodGroup; isSideDish: boolean; mealCategories: RecipeMealCategory[] }[] = [];
  for (const recipe of recipes) {
    const saved = await prisma.recipe.upsert({
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
    createdRecipes.push({ id: saved.id, name: recipe.name, mainFoodGroup: recipe.mainFoodGroup, isSideDish: recipe.isSideDish ?? false, mealCategories: recipe.mealCategories });
  }

  await prisma.recipeIngredient.deleteMany({});

  type SeedRecipeIngredient = { ingredientId: string; quantity: number; unit: "g" | "ml" | "piece" };

  const buildRecipeIngredientsFromName = (recipeName: string, mainFoodGroup: MainFoodGroup): SeedRecipeIngredient[] => {
    const name = recipeName.toLowerCase();
    const selected: SeedRecipeIngredient[] = [];
    const add = (ingredientId: string, quantity: number, unit: "g" | "ml" | "piece") => {
      if (!selected.some((item) => item.ingredientId === ingredientId)) selected.push({ ingredientId, quantity, unit });
    };

    if (name.includes("pasta")) add("pasta", 90, "g");
    if (name.includes("riso")) add("riso", 90, "g");
    if (name.includes("cous cous")) add("riso", 90, "g");
    if (name.includes("orzo") || name.includes("farro") || name.includes("quinoa") || name.includes("muesli") || name.includes("cereali") || name.includes("porridge")) add("riso", 80, "g");
    if (name.includes("pane") || name.includes("toast") || name.includes("focaccia") || name.includes("piadina") || name.includes("wrap") || name.includes("crostini") || name.includes("crackers")) add("pane", 60, "g");

    if (name.includes("uovo") || name.includes("uova") || name.includes("frittata") || name.includes("omelette")) add("uova", 2, "piece");
    if (name.includes("pollo") || name.includes("tacchino")) add("pollo", 170, "g");
    if (name.includes("merluzzo") || name.includes("orata") || name.includes("salmone") || name.includes("platessa") || name.includes("sgombro") || name.includes("tonno")) add(name.includes("tonno") ? "tonno" : "merluzzo", 160, "g");
    if (name.includes("ceci") || name.includes("hummus")) add("ceci", 120, "g");
    if (name.includes("lenticchie") || name.includes("legumi") || name.includes("fagioli")) add("lenticchie", 120, "g");

    if (name.includes("yogurt")) add("yogurt", 125, "g");
    if (name.includes("ricotta")) add("ricotta", 90, "g");
    if (name.includes("mozzarella") || name.includes("formaggio") || name.includes("feta") || name.includes("parmigiano") || name.includes("primo sale")) add("mozzarella", 90, "g");

    if (name.includes("pomodoro") || name.includes("pomodorini")) add("pomodoro", 120, "g");
    if (name.includes("zucchine")) add("zucchine", 130, "g");
    if (name.includes("carote")) add("carote", 110, "g");
    if (name.includes("spinaci") || name.includes("erbette") || name.includes("verdure") || name.includes("insalata") || name.includes("lattuga") || name.includes("cetriolo") || name.includes("bietole") || name.includes("broccoli") || name.includes("melanzane") || name.includes("peperoni") || name.includes("cavolfiore") || name.includes("rapa") || name.includes("cavolo")) add("insalata", 90, "g");
    if (name.includes("patate") || name.includes("gnocchi")) add("patate", 140, "g");

    if (name.includes("frutta") || name.includes("mela") || name.includes("pera") || name.includes("banana") || name.includes("arancia") || name.includes("fragola")) add(name.includes("pera") ? "pear" : name.includes("banana") ? "banana" : "apple", 1, "piece");
    if (name.includes("miele")) add("apple", 1, "piece");

    if (selected.length === 0) {
      if (mainFoodGroup === "eggs") add("uova", 2, "piece");
      else if (mainFoodGroup === "fish") add("merluzzo", 160, "g");
      else if (mainFoodGroup === "white_meat") add("pollo", 170, "g");
      else if (mainFoodGroup === "legumes") add("ceci", 120, "g");
      else if (mainFoodGroup === "cheese") add("ricotta", 90, "g");
      else if (mainFoodGroup === "fruit") add("apple", 1, "piece");
      else add("zucchine", 120, "g");
    }

    return selected;
  };

  const suspiciousRules: Array<{ test: RegExp; forbidden: string[]; reason: string }> = [
    { test: /yogurt/, forbidden: ["patate", "insalata"], reason: "yogurt recipe with potato/salad" },
    { test: /(breakfast|colazione|yogurt|toast|pane|latte|muesli|porridge|pancake|crepes|uovo strapazzato)/, forbidden: ["patate", "insalata"], reason: "breakfast-like recipe with potato/salad" },
    { test: /(frutta|banana|mela|pera|arancia|fragola)/, forbidden: ["pane"], reason: "fruit snack with bread" }
  ];

  for (const recipe of createdRecipes) {
    const selected = buildRecipeIngredientsFromName(recipe.name, recipe.mainFoodGroup);

    await prisma.recipeIngredient.createMany({
      data: selected.map((item) => ({
        recipeId: recipe.id,
        ingredientId: item.ingredientId,
        quantityPerStandardPortion: item.quantity,
        unit: item.unit
      })),
      skipDuplicates: true
    });

    const lowerName = recipe.name.toLowerCase();
    for (const rule of suspiciousRules) {
      if (!rule.test.test(lowerName)) continue;
      const invalid = selected.filter((item) => rule.forbidden.includes(item.ingredientId)).map((item) => item.ingredientId);
      if (invalid.length > 0) {
        console.warn(`[seed:recipe-ingredient-validation] ${recipe.name}: ${rule.reason} (${invalid.join(", ")})`);
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
