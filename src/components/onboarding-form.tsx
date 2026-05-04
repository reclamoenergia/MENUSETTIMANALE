"use client";

import { useState } from "react";

type PersonInput = { name: string; age: number; sex: "male" | "female"; heightCm: number; weightKg: number };

export function OnboardingForm() {
  const [householdName, setHouseholdName] = useState("");
  const [persons, setPersons] = useState<PersonInput[]>([{ name: "", age: 30, sex: "female", heightCm: 165, weightKg: 60 }]);

  return <div className="space-y-4 rounded border bg-white p-4">Simple onboarding structure ready. Implement UI wiring next.</div>;
}
