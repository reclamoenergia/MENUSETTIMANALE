"use client";

import { useRouter } from "next/navigation";

export function DeleteRecipeButton({ id }: { id: string }) {
  const router = useRouter();
  return <button className="rounded bg-red-100 px-2 py-1 text-red-700" onClick={async () => { if (!confirm("Delete recipe?")) return; await fetch(`/api/admin/recipes/${id}`, { method: "DELETE" }); router.refresh(); }}>Delete</button>;
}
