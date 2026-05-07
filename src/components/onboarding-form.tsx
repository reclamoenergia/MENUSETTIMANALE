"use client";

import { FormEvent, useMemo, useState } from "react";
import { MainFoodGroup } from "@prisma/client";

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
  excludedFoodIds: string[];
  preferredFoodIds: string[];
};

type GeneratedMeal = {
  mealType: "breakfast" | "lunch" | "afternoon_snack" | "dinner" | "morning_snack";
  recipes: string[];
  warning?: string;
  portions: {
    personId: string;
    personName: string;
    multiplier: number;
    estimatedCalories: number;
  }[];
};

const mealTypeLabel: Record<GeneratedMeal["mealType"], string> = {
  breakfast: "Breakfast",
  morning_snack: "Morning snack",
  lunch: "Lunch",
  afternoon_snack: "Afternoon snack",
  dinner: "Dinner"
};

const foodOptions = [
  { id: "tomato", label: "Tomato" },
  { id: "zucchini", label: "Zucchini" },
  { id: "egg", label: "Egg" },
  { id: "chicken", label: "Chicken" },
  { id: "beef", label: "Beef" },
  { id: "salmon", label: "Salmon" },
  { id: "tuna", label: "Tuna" },
  { id: "lentils", label: "Lentils" },
  { id: "chickpeas", label: "Chickpeas" },
  { id: "rice", label: "Rice" },
  { id: "pasta", label: "Pasta" },
  { id: "yogurt", label: "Yogurt" },
  { id: "cheese", label: "Cheese" }
] as const;

const weeklyDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const mealRows = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"] as const;
const foodGroups: MainFoodGroup[] = ["cereals", "legumes", "fish", "white_meat", "red_meat", "eggs", "cheese", "vegetarian"];

const defaultPerson: PersonInput = { name: "", age: 30, sex: "female", heightCm: 165, weightKg: 60 };

function defaultBalancePlan() {
  return dayKeys.flatMap((dayKey, index) => {
    const dinnerDefaults: MainFoodGroup[] = ["red_meat", "white_meat", "white_meat", "fish", "white_meat", "fish", "legumes"];
    const lunchDefaults: MainFoodGroup[] = ["cereals", "legumes", "vegetarian", "eggs", "cheese", "cereals", "vegetarian"];
    return [
      { dayKey, mealType: "lunch" as const, mainFoodGroup: lunchDefaults[index] },
      { dayKey, mealType: "dinner" as const, mainFoodGroup: dinnerDefaults[index] }
    ];
  });
}

export function OnboardingForm() {
  const [email, setEmail] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [persons, setPersons] = useState<PersonInput[]>([defaultPerson]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedOnboarding, setSavedOnboarding] = useState<{ household: { id: string; name: string }; persons: SavedPerson[] } | null>(null);
  const [generatedMenu, setGeneratedMenu] = useState<{ day: string; meals: GeneratedMeal[] }[] | null>(null);
  const [groceryList, setGroceryList] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [selectedForbiddenFoods, setSelectedForbiddenFoods] = useState<string[]>([]);
  const [selectedPreferredFoods, setSelectedPreferredFoods] = useState<string[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [sportDaysMap, setSportDaysMap] = useState<Record<string, boolean>>({});
  const [balancePlan, setBalancePlan] = useState(defaultBalancePlan());

  const updatePerson = <K extends keyof PersonInput>(index: number, field: K, value: PersonInput[K]) => {
    setPersons((current) => current.map((person, personIndex) => (personIndex === index ? { ...person, [field]: value } : person)));
  };

  const parseNumericInput = (value: string): number | undefined => (value === "" ? undefined : Number(value));

  const addPerson = () => setPersons((current) => [...current, defaultPerson]);
  const removePerson = (index: number) => setPersons((current) => current.filter((_, personIndex) => personIndex !== index));

  const toggleFood = (current: string[], setFn: (next: string[]) => void, id: string) => {
    setFn(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  };

  const keyFor = (mealOrSport: string, day: string, personId: string) => `${mealOrSport}:${day}:${personId}`;

  const setPresence = (mealType: string, day: string, personId: string, checked: boolean) => {
    setPresenceMap((prev) => ({ ...prev, [keyFor(mealType, day, personId)]: checked }));
  };

  const setSportDay = (day: string, personId: string, checked: boolean) => {
    setSportDaysMap((prev) => ({ ...prev, [keyFor("sport", day, personId)]: checked }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const householdResponse = await fetch("/api/households", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: householdName, email }) });
      if (!householdResponse.ok) throw new Error("Unable to create household");
      const household = await householdResponse.json();
      const createdPersons: SavedPerson[] = [];
      for (const person of persons) {
        const personResponse = await fetch("/api/persons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            householdId: household.id,
            ...person,
            activityLevel: "lightly_active",
            goal: "maintenance",
            excludedFoodIds: [],
            preferredFoodIds: [],
            defaultManagedMeals: ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"]
          })
        });
        if (!personResponse.ok) throw new Error(`Unable to create person: ${person.name}`);
        createdPersons.push(await personResponse.json());
      }
      setSavedOnboarding({ household, persons: createdPersons });
      setStep(1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unexpected error while saving onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dinnerCerealsWarning = useMemo(() => balancePlan.some((slot) => slot.mealType === "dinner" && slot.mainFoodGroup === "cereals"), [balancePlan]);

  const generateMenu = async () => {
    if (!savedOnboarding) return;
    const response = await fetch("/api/menu/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        householdId: savedOnboarding.household.id,
        breakfastSnackMode: "recipes",
        forbiddenFoodIds: selectedForbiddenFoods,
        preferredFoodIds: selectedPreferredFoods,
        presence: presenceMap,
        sportDays: sportDaysMap,
        weeklyBalanceSlots: balancePlan
      })
    });
    if (!response.ok) {
      setSubmitError("Unable to generate weekly menu");
      return;
    }
    const menu = await response.json();
    setGeneratedMenu(menu.meals);
    setGroceryList(menu.groceryList);
  };

  if (!savedOnboarding) {
    return <form onSubmit={onSubmit}><button type="submit">start</button></form>;
  }

  return <div>Configured people: {savedOnboarding.persons.length}. Step {step}.<button onClick={generateMenu}>Generate</button>{dinnerCerealsWarning ? <p>Dinner cereals selected by user choice.</p> : null}</div>;
}
