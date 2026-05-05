"use client";

import { FormEvent, useState } from "react";

type PersonInput = {
  name: string;
  age: number | undefined;
  sex: "male" | "female";
  heightCm: number | undefined;
  weightKg: number | undefined;
};

type SavedPerson = {
  id: string;
  name: string;
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
};

type GeneratedMeal = {
  mealType: "lunch" | "dinner";
  recipes: string[];
  portions: {
    personId: string;
    personName: string;
    multiplier: number;
    estimatedCalories: number;
  }[];
};

const mealTypeLabel: Record<GeneratedMeal["mealType"], string> = {
  lunch: "Lunch",
  dinner: "Dinner"
};

const getPortionLabel = (multiplier: number): string => {
  if (multiplier < 0.85) {
    return "Small portion";
  }
  if (multiplier <= 1.15) {
    return "Medium portion";
  }
  return "Large portion";
};


type GroceryList = {
  groups: {
    category:
      | "vegetables"
      | "fruit"
      | "meat"
      | "fish"
      | "dairy"
      | "legumes"
      | "pasta_rice_cereals"
      | "pantry"
      | "condiments"
      | "other";
    items: {
      ingredientId: string;
      ingredientName: string;
      displayQuantity: string;
    }[];
  }[];
};

type SavedOnboarding = {
  household: {
    id: string;
    userId: string;
    name: string;
  };
  persons: SavedPerson[];
};

const defaultPerson: PersonInput = {
  name: "",
  age: 30,
  sex: "female",
  heightCm: 165,
  weightKg: 60
};


export function OnboardingForm() {
  const [email, setEmail] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [persons, setPersons] = useState<PersonInput[]>([defaultPerson]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedOnboarding, setSavedOnboarding] = useState<SavedOnboarding | null>(null);
  const [generatedMenu, setGeneratedMenu] = useState<{ day: string; meals: GeneratedMeal[] }[] | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);

  const updatePerson = <K extends keyof PersonInput>(index: number, field: K, value: PersonInput[K]) => {
    setPersons((current) =>
      current.map((person, personIndex) => (personIndex === index ? { ...person, [field]: value } : person))
    );
  };

  const parseNumericInput = (value: string): number | undefined => {
    if (value === "") {
      return undefined;
    }

    return Number(value);
  };

  const addPerson = () => {
    setPersons((current) => [...current, defaultPerson]);
  };

  const removePerson = (index: number) => {
    setPersons((current) => current.filter((_, personIndex) => personIndex !== index));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const householdResponse = await fetch("/api/households", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: householdName,
          email
        })
      });

      if (!householdResponse.ok) {
        throw new Error("Unable to create household");
      }

      const household = (await householdResponse.json()) as SavedOnboarding["household"];

      const createdPersons: SavedPerson[] = [];

      for (const person of persons) {
        const personResponse = await fetch("/api/persons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            householdId: household.id,
            name: person.name,
            age: person.age,
            sex: person.sex,
            heightCm: person.heightCm,
            weightKg: person.weightKg,
            activityLevel: "lightly_active",
            goal: "maintenance",
            excludedFoodIds: [],
            preferredFoodIds: [],
            defaultManagedMeals: ["breakfast", "lunch", "dinner"]
          })
        });

        if (!personResponse.ok) {
          throw new Error(`Unable to create person: ${person.name}`);
        }

        createdPersons.push((await personResponse.json()) as SavedPerson);
      }

      setSavedOnboarding({ household, persons: createdPersons });
      setGeneratedMenu(null);
      setGroceryList(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error while saving onboarding";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const generateMenu = async () => {
    if (!savedOnboarding) return;
    setSubmitError(null);

    const response = await fetch("/api/menu/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ householdId: savedOnboarding.household.id })
    });

    if (!response.ok) {
      setSubmitError("Unable to generate weekly menu");
      return;
    }

    const menu = (await response.json()) as { meals: { day: string; meals: GeneratedMeal[] }[]; groceryList: GroceryList };
    setGeneratedMenu(menu.meals);
    setGroceryList(menu.groceryList);
  };

  if (savedOnboarding) {
    return (
      <section className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-900">Onboarding completed</h2>
        <p className="text-sm text-emerald-800">
          Household <strong>{savedOnboarding.household.name}</strong> was saved with {savedOnboarding.persons.length} people.
        </p>
        <ul className="space-y-2 text-sm text-emerald-900">
          {savedOnboarding.persons.map((person) => (
            <li className="rounded-md border border-emerald-200 bg-white px-3 py-2" key={person.id}>
              {person.name} — {person.age} years, {person.sex}, {person.heightCm} cm, {person.weightKg} kg
            </li>
          ))}
        </ul>
        <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={generateMenu} type="button">
          Generate weekly menu
        </button>
        {generatedMenu && (
          <div className="space-y-3">
            {generatedMenu.map((day) => (
              <div className="rounded border border-emerald-200 bg-white p-3" key={day.day}>
                <h3 className="font-semibold text-emerald-900">{day.day}</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {day.meals.map((meal) => (
                    <section className="rounded-md border border-emerald-100 bg-emerald-50/40 p-3 text-sm" key={meal.mealType}>
                      <h4 className="font-semibold text-emerald-900">{mealTypeLabel[meal.mealType]}</h4>
                      <p className="mt-1 text-emerald-900">{meal.recipes.join(" + ")}</p>
                      <ul className="mt-3 space-y-2">
                        {meal.portions.map((portion) => (
                          <li
                            className="rounded-md border border-emerald-200 bg-white px-3 py-2"
                            key={`${meal.mealType}-${portion.personId}`}
                          >
                            <p className="font-medium text-emerald-900">{portion.personName}</p>
                            <p className="text-emerald-800">{getPortionLabel(portion.multiplier)}</p>
                            <p className="text-xs text-emerald-700/80">{portion.estimatedCalories} kcal estimate</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!groceryList && (
          <section className="rounded border border-emerald-200 bg-white p-3">
            <p className="text-sm text-emerald-900">Generate a weekly menu to see your grocery list</p>
          </section>
        )}

        {groceryList && (
          <section className="space-y-3 rounded border border-emerald-200 bg-white p-3">
            <h3 className="font-semibold text-emerald-900">Grocery List</h3>
            <div className="space-y-3">
              {groceryList.groups.map((group) => (
                <div className="rounded-md border border-emerald-100 p-3" key={group.category}>
                  <h4 className="text-sm font-semibold capitalize text-emerald-900">{group.category.replaceAll("_", " ")}:</h4>
                  <ul className="mt-2 space-y-2">
                    {group.items.map((item) => (
                      <li className="text-sm text-emerald-900" key={`${group.category}-${item.ingredientId}`}>
                        - {item.ingredientName} — {item.displayQuantity}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    );
  }

  return (
    <form className="space-y-6 rounded-lg border border-slate-200 bg-white p-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="householdName">
          Household name
        </label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          id="householdName"
          name="householdName"
          onChange={(event) => setHouseholdName(event.target.value)}
          placeholder="Rossi Family"
          required
          type="text"
          value={householdName}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">People</h2>
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={addPerson} type="button">
            Add person
          </button>
        </div>

        {persons.map((person, index) => (
          <fieldset className="grid gap-3 rounded-md border border-slate-200 p-4 md:grid-cols-2" key={`person-${index}`}>
            <legend className="px-1 text-sm font-medium text-slate-700">Person {index + 1}</legend>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Name</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                onChange={(event) => updatePerson(index, "name", event.target.value)}
                required
                type="text"
                value={person.name}
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Age</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                min={0}
                onChange={(event) => updatePerson(index, "age", parseNumericInput(event.target.value))}
                required
                type="number"
                value={person.age}
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Sex</span>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                onChange={(event) => updatePerson(index, "sex", event.target.value as PersonInput["sex"])}
                value={person.sex}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Height (cm)</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                min={1}
                onChange={(event) => updatePerson(index, "heightCm", parseNumericInput(event.target.value))}
                required
                type="number"
                value={person.heightCm}
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700">
              <span>Weight (kg)</span>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                min={1}
                onChange={(event) => updatePerson(index, "weightKg", parseNumericInput(event.target.value))}
                required
                type="number"
                value={person.weightKg}
              />
            </label>

            {persons.length > 1 ? (
              <div className="flex items-end">
                <button
                  className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700"
                  onClick={() => removePerson(index)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </fieldset>
        ))}
      </div>

      <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-70" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving..." : "Continue"}
      </button>

      {submitError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{submitError}</p> : null}
    </form>
  );
}
