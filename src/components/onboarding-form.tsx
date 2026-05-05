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

const DEFAULT_USER_ID = "demo-user";

export function OnboardingForm() {
  const [householdName, setHouseholdName] = useState("");
  const [persons, setPersons] = useState<PersonInput[]>([defaultPerson]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedOnboarding, setSavedOnboarding] = useState<SavedOnboarding | null>(null);

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
          userId: DEFAULT_USER_ID,
          name: householdName
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error while saving onboarding";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
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
      </section>
    );
  }

  return (
    <form className="space-y-6 rounded-lg border border-slate-200 bg-white p-6" onSubmit={onSubmit}>
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
