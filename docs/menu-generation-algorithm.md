# Menu Generation Algorithm

## 1. Goal

Generate a weekly family menu that:

- uses one shared menu for the household;
- provides different portions for each person;
- allows only small individual additions;
- respects calorie targets;
- balances macronutrients;
- respects food exclusions;
- respects weekly food group frequency rules;
- respects preparation time limits;
- respects day-before preparation constraints;
- respects ingredient seasonality;
- avoids repetition;
- generates a grocery list.

## 2. Inputs

The algorithm receives:

- household;
- people;
- weekly settings;
- recipe database;
- ingredient database;
- current/planned week number;
- user preferences;
- presence of each person at each meal.

## 3. Calorie estimation

Use a standard formula such as Mifflin-St Jeor.

For males:

```text
BMR = 10 × weightKg + 6.25 × heightCm - 5 × age + 5
```

For females:

```text
BMR = 10 × weightKg + 6.25 × heightCm - 5 × age - 161
```

Then multiply by activity factor:

```text
sedentary: 1.2
lightly_active: 1.375
active: 1.55
very_active: 1.725
```

Then adjust by goal:

```text
maintenance: no adjustment
light_weight_loss: -10%
muscle_gain: +10%
sport_energy: +5%
```

The UI must explain that this is an estimate.

## 4. Macronutrient targets

The system should estimate macro targets according to goal.

Suggested starting rules:

### Maintenance

- protein: 18–22% kcal
- carbohydrates: 45–55% kcal
- fats: 25–35% kcal

### Light weight loss

- protein: 22–28% kcal
- carbohydrates: 35–45% kcal
- fats: 25–35% kcal

### Muscle gain

- protein: 25–30% kcal
- carbohydrates: 40–50% kcal
- fats: 20–30% kcal

### Sport energy

- protein: 20–25% kcal
- carbohydrates: 50–60% kcal
- fats: 20–30% kcal

These values are indicative and not medical.

## 5. Meal calorie distribution

Default distribution:

```text
breakfast: 20%
morning_snack: 10%
lunch: 35%
afternoon_snack: 10%
dinner: 25%
evening_snack: optional
```

The user may manually adjust meal distribution.

If a person is absent from a meal, that meal is not generated for that person.

## 6. Recipe filtering

For each meal, filter recipes using hard constraints first.

### Hard constraints

A recipe is excluded if:

- it contains an excluded food;
- it exceeds max preparation time for that day and meal;
- it cannot be prepared the day before when that constraint is active;
- it uses out-of-season fruit or vegetables;
- it uses frozen food when frozen food is not allowed;
- it does not match the required meal category;
- it violates the chosen meal structure.

### Soft constraints

After hard filtering, score recipes higher when:

- they match preferred recipe tags;
- they contain preferred foods;
- they improve weekly variety;
- they help meet weekly food group minimums;
- they help reach macro targets;
- they are suitable for children when children are present.

## 7. Meal structure

For lunch and dinner, the system supports:

### Single dish plus side

Example:

- pasta e lenticchie;
- grilled zucchini side dish.

### First course plus second course plus side

Example:

- pasta al pomodoro;
- grilled chicken;
- carrots or salad side dish.

A side dish is always required.

Side dishes must be explicit and quantified.

## 8. Side dish generation

Side dishes are simple recipes.

They must include:

- vegetable type;
- preparation method;
- quantity per standard portion;
- seasonality;
- condiment suggestion.

Example:

```text
Zucchine grigliate
Adult standard portion: 180 g
Child portion: scaled according to calorie target
Condiment: 1 tsp olive oil, salt optional
```

The algorithm must not output generic labels like “vegetables”.

## 9. Weekly variety rules

Within the same week, avoid:

- repeated recipes;
- repeated side dishes on nearby days;
- excessive repetition of the same main food group;
- exceeding maximum weekly food group rules;
- repeating the same main ingredient in consecutive meals.

Simple V1 balancing heuristics:

- rotate preferred main groups across lunch/dinner (legumes, fish, eggs, cheese, vegetarian, white meat, cereals);
- penalize cereals when recently used, so pasta/rice do not dominate the week;
- never place more than one cereals-based recipe in a single meal composition.

The algorithm should also try to satisfy minimum weekly frequencies.

Example:

```text
fish min 1 max 3
legumes min 1 max 4
red meat min 0 max 1
```


## 9A. Food-group planning layer (before recipe selection)

Before selecting any recipe, the system builds a lunch/dinner food-group plan for the selected period length.

Rules:

- support variable planning length (not only 7 days);
- assign one target `mainFoodGroup` to each lunch and dinner slot;
- use `weeklyFoodGroupRules` min/max as balancing preferences;
- avoid assigning the same `mainFoodGroup` in consecutive slots;
- limit cereals-heavy slots (pasta/rice) across the period.

This layer outputs only food-group targets and does not select recipes.

## 10. Portion calculation

The selected family meal is common.

For each person present at the meal:

1. Determine that person’s target calories for the meal.
2. Estimate calories of one standard portion.
3. Calculate a portion multiplier.
4. Apply reasonable lower and upper bounds.
5. Assign a simple portion label from multiplier (Small, Medium, Large).
6. Recalculate nutrition coherently with multiplier.
7. Add small additions only if needed.

Example:

```text
Standard recipe portion: 500 kcal
Person meal target: 650 kcal
Multiplier: 1.3
```

## 11. Children handling

Children use the same menu as adults.

The system handles children through:

- lower calorie targets;
- lower portion multipliers;
- suitable-for-children recipe preference;
- optional maximum portion caps.

Suggested simple rule:

- if age < 12, prefer recipes marked suitableForChildren;
- apply a child calorie dampening factor before activity/goal adjustments;
- avoid very large multipliers;
- if the required amount is too high, use a small addition instead of increasing the main dish excessively.

## 12. Small additions

Allowed additions:

- egg;
- yogurt;
- bread;
- seasonal fruit;
- dried fruit;
- milk;
- cheese in small quantity.

Small additions may be used to:

- increase calories;
- increase protein;
- complete breakfast or snack;
- better align macros.

No full recipe substitution is allowed in V1.

## 13. Breakfast and snacks

The user chooses one of two modes:

### Simple suggestions

Examples:

- yogurt with seasonal fruit;
- milk with cereals;
- bread with jam;
- fruit and nuts;
- yogurt with dried fruit;
- bread and fresh cheese.

### Recipes

Examples:

- pancakes;
- porridge;
- toast;
- yogurt bowl.

The system should still calculate estimated nutrients.

## 14. Day-before preparation constraint

For each lunch or dinner, the user can set:

```text
requiresDayBeforePreparation = true
```

When active, the system must only select recipes where:

```text
canBePreparedDayBefore = true
```

Example:

Wednesday dinner:
- user cannot cook;
- select only recipes that can be prepared Tuesday.

## 15. Frozen food rule

The weekly settings include:

```text
allowFrozenFood = true | false
```

If false, recipes requiring frozen ingredients are excluded.

If true, frozen options may be used when available.

## 16. Seasonality rule

Each ingredient has `seasonWeeks`.

For fruit and vegetables:

- current/planned week must be included in `seasonWeeks`;
- otherwise ingredient cannot be used.

If frozen food is allowed and the ingredient has a frozen option, the recipe may still be allowed where appropriate.

## 17. Nutritional validation

After generating the weekly menu, calculate for each person:

### Daily

- calories planned vs target;
- protein planned vs target;
- carbohydrates planned vs target;
- fats planned vs target.

### Weekly

- calories planned vs target;
- protein planned vs target;
- carbohydrates planned vs target;
- fats planned vs target.

Dashboard status:

```text
green: within acceptable range
yellow: moderate deviation
red: significant deviation
```

Suggested tolerance:

```text
green: ±10%
yellow: ±20%
red: more than ±20%
```

## 18. Grocery list generation

After menu confirmation:

1. Collect all recipe ingredients.
2. Apply person portion multipliers.
3. Add small additions.
4. Aggregate quantities by ingredient.
5. Convert units where possible.
6. Split items by storage and purchase timing.

## 19. Grocery list categories

The grocery list should be divided into:

### Initial purchase

Ingredients that can be bought in advance:

- pasta;
- rice;
- legumes;
- oil;
- flour;
- canned goods;
- long shelf-life products.

### Daily purchase

Fresh items organized by recommended purchase day:

- fish;
- fresh meat;
- fresh vegetables;
- fresh fruit;
- dairy products;
- bread.

No cost estimate in V1.

## 20. Regeneration

Each meal can be regenerated.

Options:

- regenerate meal;
- make faster;
- make simpler;
- make more protein-rich;
- remove ingredient.

The regeneration must preserve hard constraints.

## 21. Output

The final confirmed menu must generate:

- weekly calendar;
- meal details;
- person portions;
- nutritional dashboard;
- grocery list;
- recipe booklet;
- printable PDFs.

## 22. MVP simplification

The first implementation does not need a perfect optimizer.

A practical V1 algorithm may:

1. filter recipes;
2. score recipes;
3. select best candidates;
4. adjust portions;
5. validate;
6. retry if constraints fail.

The code should be structured so that a better optimization engine can be added later.
