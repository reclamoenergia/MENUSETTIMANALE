import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Family Weekly Meal Planner</h1>
      <p className="text-slate-700">MVP foundation for household setup, people management, and weekly settings.</p>
      <Link className="inline-block rounded bg-slate-900 px-4 py-2 text-white" href="/onboarding">
        Start onboarding
      </Link>
    </section>
  );
}
