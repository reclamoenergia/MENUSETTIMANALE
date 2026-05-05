"use client";

import { FormEvent, useState } from "react";

type PersonInput = {
  name: string;
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
};

const defaultPerson: PersonInput = {
  name: "",
  age: 30,
  sex: "female",
  heightCm: 165,
  weightKg: 60
};

export function OnboardingForm() {
  const [householdName, setHouseholdName] = useState("");
  const [persons, setPersons] = useState<PersonInput[]>([defaultPerson]);
  const [submitted, setSubmitted] = useState(false);

  const updatePerson = <K extends keyof PersonInput>(index: number, field: K, value: PersonInput[K]) => {
    setPersons((current) =>
      current.map((person, personIndex) => (personIndex === index ? { ...person, [field]: value } : person))
    );
  };

  const addPerson = () => {
    setPersons((current) => [...current, defaultPerson]);
  };

  const removePerson = (index: number) => {
    setPersons((current) => current.filter((_, personIndex) => personIndex !== index));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

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
                onChange={(event) => updatePerson(index, "age", Number(event.target.value))}
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
                onChange={(event) => updatePerson(index, "heightCm", Number(event.target.value))}
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
                onChange={(event) => updatePerson(index, "weightKg", Number(event.target.value))}
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

      <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white" type="submit">
        Continue
      </button>

      {submitted ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Onboarding saved locally. Next step: connect this form to API routes.
        </p>
      ) : null}
    </form>
  );
}
