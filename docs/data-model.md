# Data Model

This document defines the main entities for the meal planning application.

The actual implementation may use Prisma models, but the concepts and fields below must be preserved.

## 1. User

Represents the account owner.

```ts
type User = {
  id: string
  email: string
  name?: string
  subscriptionPlan: "free" | "premium_monthly" | "premium_annual"
  subscriptionStatus: "active" | "inactive" | "trialing" | "canceled"
  createdAt: Date
  updatedAt: Date
}
````

## 2. Household

Represents the family or group managed by the user.

```ts
type Household = {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}
```

## 3. Person

Represents a member of the household.

```ts
type Person = {
  id: string
  householdId: string
  name: string
  age: number
  sex: "male" | "female"
  heightCm: number
  weightKg: number

  activityLevel: "sedentary" | "lightly_active" | "active" | "very_active"

  goal:
    | "maintenance"
    | "light_weight_loss"
    | "muscle_gain"
    | "sport_energy"

  excludedFoodIds: string[]
  preferredFoodIds: string[]

  defaultManagedMeals: MealType[]

  createdAt: Date
  updatedAt: Date
}
```

## 4. MealType

```ts
type MealType =
  | "breakfast"
  | "morning_snack"
  | "lunch"
  | "afternoon_snack"
  | "dinner"
  | "evening_snack"
```

## 5. WeeklySettings

Represents settings for one generated week.

```ts
type WeeklySettings = {
  id: string
  householdId: string
  weekStartDate: Date

  breakfastSnackMode: "simple_suggestions" | "recipes"

  allowFrozenFood: boolean

  lunchStructure: "single_dish_plus_side" | "first_second_plus_side"
  dinnerStructure: "single_dish_plus_side" | "first_second_plus_side"

  weeklyFoodGroupRules: WeeklyFoodGroupRules

  daySettings: DaySettings[]

  createdAt: Date
  updatedAt: Date
}
```

## 6. WeeklyFoodGroupRules

```ts
type WeeklyFoodGroupRules = {
  red_meat: { min: number; max: number }
  white_meat: { min: number; max: number }
  fish: { min: number; max: number }
  legumes: { min: number; max: number }
  eggs: { min: number; max: number }
  cheese: { min: number; max: number }
  vegetarian_meals: { min: number; max: number }
}
```

## 7. DaySettings

```ts
type DaySettings = {
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"

  lunchMaxPrepMinutes: number
  dinnerMaxPrepMinutes: number

  lunchRequiresDayBeforePreparation: boolean
  dinnerRequiresDayBeforePreparation: boolean

  mealPresence: MealPresence[]
}
```

## 8. MealPresence

Represents whether each person is present for a specific meal.

```ts
type MealPresence = {
  personId: string
  mealType: MealType
  isPresent: boolean
}
```

## 9. RecipeTag

Recipe tags and food style preferences.

```ts
type RecipeTag =
  | "mediterranean"
  | "vegetarian"
  | "protein_rich"
  | "budget_friendly"
  | "family_friendly"
  | "quick"
  | "pugliese"
  | "campana"
```

Regional tags are supported but not central in V1.

## 10. Ingredient

```ts
type Ingredient = {
  id: string
  name: string

  category:
    | "pasta_rice_cereals"
    | "meat"
    | "fish"
    | "eggs"
    | "dairy"
    | "legumes"
    | "vegetables"
    | "fruit"
    | "bread_bakery"
    | "pantry"
    | "frozen"
    | "condiments"
    | "other"

  storageType: "pantry" | "fridge" | "freezer"

  shelfLifeDays: number

  recommendedPurchaseLeadDays: number

  isSeasonal: boolean

  seasonWeeks: number[]

  hasFrozenOption: boolean

  createdAt: Date
  updatedAt: Date
}
```

Example:

```json
{
  "id": "zucchine",
  "name": "Zucchine",
  "category": "vegetables",
  "storageType": "fridge",
  "shelfLifeDays": 4,
  "recommendedPurchaseLeadDays": 2,
  "isSeasonal": true,
  "seasonWeeks": [18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38],
  "hasFrozenOption": true
}
```

Example:

```json
{
  "id": "pasta",
  "name": "Pasta",
  "category": "pasta_rice_cereals",
  "storageType": "pantry",
  "shelfLifeDays": 365,
  "recommendedPurchaseLeadDays": 7,
  "isSeasonal": false,
  "seasonWeeks": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],
  "hasFrozenOption": false
}
```

## 11. Recipe

```ts
type Recipe = {
  id: string
  name: string

  mealCategories: RecipeMealCategory[]

  recipeTags: RecipeTag[]

  regionalTags: string[]

  mainFoodGroup:
    | "red_meat"
    | "white_meat"
    | "fish"
    | "legumes"
    | "eggs"
    | "cheese"
    | "vegetarian"
    | "cereals"
    | "vegetables"
    | "fruit"
    | "snack"

  prepTimeMinutes: number
  cookTimeMinutes: number

  canBePreparedDayBefore: boolean

  suitableForChildren: boolean

  isSideDish: boolean

  ingredients: RecipeIngredient[]

  nutritionPerStandardPortion: NutritionValues

  steps: string[]

  createdAt: Date
  updatedAt: Date
}
```

## 12. RecipeMealCategory

```ts
type RecipeMealCategory =
  | "breakfast"
  | "morning_snack"
  | "first_course"
  | "second_course"
  | "single_dish"
  | "side_dish"
  | "afternoon_snack"
  | "dinner"
  | "evening_snack"
```

## 13. RecipeIngredient

```ts
type RecipeIngredient = {
  ingredientId: string
  quantityPerStandardPortion: number
  unit: "g" | "ml" | "piece" | "tbsp" | "tsp"
}
```

## 14. NutritionValues

```ts
type NutritionValues = {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  sugarsG: number
}
```

## 15. GeneratedMenu

```ts
type GeneratedMenu = {
  id: string
  householdId: string
  weeklySettingsId: string
  weekStartDate: Date

  status: "draft" | "confirmed"

  days: GeneratedMenuDay[]

  createdAt: Date
  updatedAt: Date
}
```

## 16. GeneratedMenuDay

```ts
type GeneratedMenuDay = {
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"

  meals: GeneratedMeal[]
}
```

## 17. GeneratedMeal

```ts
type GeneratedMeal = {
  mealType: MealType

  recipes: string[]

  sideDishRecipeId?: string

  personPortions: PersonMealPortion[]

  notes?: string
}
```

## 18. PersonMealPortion

```ts
type PersonMealPortion = {
  personId: string

  recipePortionMultipliers: {
    recipeId: string
    multiplier: number
  }[]

  additions: SmallAddition[]

  estimatedNutrition: NutritionValues
}
```

## 19. SmallAddition

```ts
type SmallAddition = {
  ingredientId: string
  quantity: number
  unit: "g" | "ml" | "piece"
  reason:
    | "increase_calories"
    | "increase_protein"
    | "complete_meal"
}
```

Examples:

* 1 egg;
* 1 yogurt;
* 40 g bread;
* 1 seasonal fruit.

## 20. GroceryList

```ts
type GroceryList = {
  id: string
  generatedMenuId: string

  initialPurchaseItems: GroceryListItem[]

  dailyPurchaseItems: DailyGroceryList[]

  createdAt: Date
  updatedAt: Date
}
```

## 21. GroceryListItem

```ts
type GroceryListItem = {
  ingredientId: string
  name: string
  totalQuantity: number
  unit: string
  category: string
  storageType: "pantry" | "fridge" | "freezer"
}
```

## 22. DailyGroceryList

```ts
type DailyGroceryList = {
  dayOfWeek: string
  items: GroceryListItem[]
}
```

## 23. Initial seed recipes

The initial database should include around 50 simple recipes.

### First courses

1. Pasta al pomodoro semplice
2. Pasta con zucchine
3. Pasta e lenticchie
4. Pasta e ceci
5. Pasta con ricotta e pomodoro
6. Riso con piselli
7. Risotto zucchine e parmigiano
8. Cous cous con verdure
9. Pasta integrale con tonno e pomodoro
10. Minestra di verdure con pasta

### Single dishes

11. Insalata di riso con verdure e uova
12. Riso basmati con pollo e zucchine
13. Bowl con ceci, riso e verdure
14. Frittata con patate e insalata
15. Piadina con pollo, lattuga e pomodoro
16. Piatto unico con mozzarella, pane e verdure
17. Pasta fredda con tonno e pomodorini
18. Cous cous con ceci e verdure
19. Pollo con patate e verdure
20. Uova strapazzate con pane e verdure

### Second courses

21. Petto di pollo alla piastra
22. Tacchino al limone
23. Merluzzo al forno
24. Orata al forno
25. Tonno al naturale con insalata
26. Uova sode
27. Frittata semplice
28. Hamburger di legumi
29. Polpette di tacchino al forno
30. Mozzarella con pomodoro

### Side dishes

31. Zucchine grigliate
32. Carote crude a julienne
33. Insalata verde con pomodoro
34. Finocchi crudi
35. Spinaci lessi
36. Bietole saltate
37. Broccoli al vapore
38. Melanzane grigliate
39. Peperoni al forno
40. Patate lesse

### Breakfasts

41. Yogurt bianco con frutta di stagione
42. Latte con cereali
43. Pane integrale con marmellata
44. Pancake semplici
45. Porridge con banana
46. Ricotta con miele e frutta
47. Toast semplice con formaggio fresco

### Snacks

48. Frutta fresca di stagione
49. Yogurt con frutta secca
50. Pane e formaggio fresco

```
```
