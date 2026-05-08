import Link from "next/link";
import { AdminWarning } from "@/components/admin/admin-warning";

export default function AdminHomePage() {
  return (
    <section className="space-y-4">
      <AdminWarning />
      <h1 className="text-2xl font-semibold">Admin panel</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link className="rounded border bg-white p-4 hover:bg-slate-50" href="/admin/recipes">Recipes</Link>
        <Link className="rounded border bg-white p-4 hover:bg-slate-50" href="/admin/ingredients">Ingredients</Link>
      </div>
    </section>
  );
}
