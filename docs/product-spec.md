# Product Specification

## 1. Product purpose

The product is a SaaS web application that helps families organize their weekly meals.

The goal is to simplify family food planning by generating:

- a weekly meal plan;
- a grocery list;
- recipe sheets;
- different portions for each family member;
- daily and weekly nutritional summaries.

The system is not intended to provide medical or professional nutrition advice.

## 2. Product positioning

The application is an organizational family assistant.

It helps users answer questions such as:

- What should we eat this week?
- What do I need to buy?
- What can I buy in advance?
- What should I buy close to the day of use?
- How much should each family member eat?
- Are we roughly aligned with calorie and macro targets?

## 3. Mandatory disclaimer

The application must display the following disclaimer during onboarding and in printable reports:

> This application provides only indicative organizational support for family meal planning.  
> It does not provide medical, clinical, or nutritional advice.  
> It does not replace a doctor, nutritionist, dietitian, or other healthcare professional.  
> The system does not manage diseases, allergies, intolerances, or clinical conditions.  
> Nutritional values and portion suggestions are estimates and must be used with common sense.

The user must explicitly accept the disclaimer during onboarding.

## 4. Core user flow

### Step 1 — Account creation

The user creates an account and chooses a plan:

- free;
- premium monthly;
- premium annual.

### Step 2 — Household setup

The user creates one household and adds family members.

For each person, the user enters:

- name or nickname;
- age;
- sex;
- height;
- weight;
- activity level;
- goal;
- excluded foods;
- preferred foods;
- meals usually managed by the system.

### Step 3 — General food preferences

The user configures household-level preferences, including:

- preferred recipe styles;
- accepted or excluded food categories;
- weekly minimum and maximum frequency for food groups;
- whether frozen food is allowed.

Examples:

- red meat: minimum 0, maximum 1 per week;
- white meat: minimum 1, maximum 3 per week;
- fish: minimum 1, maximum 3 per week;
- legumes: minimum 1, maximum 4 per week;
- eggs: minimum 0, maximum 2 per week;
- cheese-based meals: minimum 0, maximum 2 per week;
- vegetarian meals: minimum 1, maximum 5 per week.

### Step 4 — Weekly configuration

For each day of the week, the user can configure:

- maximum preparation time for lunch;
- maximum preparation time for dinner;
- whether the day requires meals prepared the day before;
- which people are present at each meal.

Example:

- Wednesday dinner:
  - max preparation time: 0 minutes;
  - only recipes that can be prepared the day before;
  - one child absent.

### Step 5 — Breakfast and snack mode

The user chooses whether breakfast and snacks should be:

- simple suggestions;
- real recipes.

Examples of simple suggestions:

- yogurt with seasonal fruit;
- milk with cereals;
- bread with jam;
- fruit and nuts;
- yogurt with nuts;
- bread and fresh cheese.

### Step 6 — Meal structure

For lunch and dinner, the user chooses:

- one-dish meal plus side dish;
- first course plus second course plus side dish.

A side dish is always required.

The side dish must be specific and quantified.

Wrong:

- vegetables.

Correct:

- grilled zucchini, 180 g for adult, 120 g for child.

### Step 7 — Calorie and macro estimation

The system estimates:

- daily calories for each person;
- protein target;
- carbohydrate target;
- fat target.

The user can review and manually adjust the calorie distribution between meals.

The system must explain that estimates are based on standard formulas and are not medical recommendations.

### Step 8 — Menu generation

The system generates a weekly menu from Monday to Sunday.

For each managed meal, it provides:

- meal content;
- recipes;
- side dish;
- portions for each person;
- possible small additions for specific people.

The system must generate one shared family menu.

Individual adaptations can only be:

- different quantities;
- small additions.

No separate replacement meals in V1.

### Step 9 — User review and regeneration

For each meal, the user can regenerate the proposal.

Regeneration options:

- change meal;
- make faster;
- make simpler;
- make more protein-rich;
- remove a specific ingredient.

### Step 10 — Confirmation

After reviewing the menu, the user confirms the weekly planning.

### Step 11 — Outputs

After confirmation, the system generates:

- weekly menu;
- grocery list;
- daily nutritional dashboard;
- weekly nutritional dashboard;
- recipe booklet;
- printable PDFs.

## 5. Grocery list

The grocery list must be generated from recipe ingredients.

It must be divided by:

- long shelf-life ingredients;
- fresh ingredients to buy close to use;
- day of purchase;
- category.

Ingredient data must include shelf life and recommended purchase timing.

No cost estimate is required in V1.

## 6. Nutritional dashboard

For each person, the system must show daily and weekly dashboards for:

- calories;
- proteins;
- carbohydrates;
- fats.

The dashboard should compare:

- target value;
- planned value.

Suggested display:

- gauge;
- progress bar;
- color status:
  - green: close to target;
  - yellow: acceptable deviation;
  - red: outside target range.

## 7. Recipe database

The recipe database is created by the administrator.

The initial database should include around 50 simple family recipes.

Recipes must be:

- realistic;
- simple;
- scalable;
- suitable for everyday family use;
- easy to standardize.

Each recipe must include:

- name;
- meal category;
- food group;
- recipe tags;
- regional tags;
- preparation time;
- cooking time;
- whether it can be prepared the day before;
- whether it is suitable for children;
- ingredients;
- nutritional values;
- cooking steps.

## 8. Ingredients database

Each ingredient must include:

- name;
- category;
- storage type;
- shelf life;
- recommended purchase lead time;
- seasonality by week number;
- whether frozen version exists or is allowed.

Fruit and vegetables must be proposed only when in season.

If frozen food is allowed, frozen vegetables or fish may be used where appropriate.

## 9. Seasonality

Seasonality is managed by week number, from 1 to 52.

For non-seasonal ingredients, the ingredient is available all year.

For fruit and vegetables, the system must check the current week or the planned week.

## 10. Weekly variety

The system must avoid repetition within the same week.

It should avoid:

- same recipe repeated;
- same main ingredient repeated too often;
- same side dish too close together;
- exceeding max weekly food group frequencies.

## 11. Children handling

Children are handled through:

- lower estimated calorie needs;
- reduced portions;
- child-suitable recipe flag;
- optional maximum portion caps.

In V1, children do not receive separate meals.

They receive the same family meal with reduced portions.

## 12. Free and premium plans

### Free plan

The free plan should allow the user to understand the product but not receive complete output.

Possible limits:

- limited preview of weekly menu;
- no complete grocery list;
- no printable PDFs;
- no saved history;
- limited number of generations.

### Premium plan

Premium users receive:

- full weekly menu;
- full grocery list;
- recipe booklet;
- nutritional dashboard;
- printable PDFs;
- saved weekly history.

## 13. V1 exclusions

The following features are excluded from V1:

- user-created recipes;
- cost estimation;
- batch cooking recipes covering multiple meals;
- clinical diet management;
- allergies and medical conditions;
- full meal substitutions per person;
- supermarket integration.
