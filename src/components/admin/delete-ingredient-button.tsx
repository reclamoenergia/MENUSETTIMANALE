"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteIngredientButton({ id }: { id: string }) {
  const [error, setError] = useState("");
  const router = useRouter();
  return <div><button className="rounded bg-red-100 px-2 py-1 text-red-700" onClick={async()=>{setError(""); if(!confirm("Delete ingredient?")) return; const res=await fetch(`/api/admin/ingredients/${id}`,{method:"DELETE"}); if(!res.ok){const data=await res.json(); setError(data.error??"Delete failed"); return;} router.refresh();}}>Delete</button>{error && <p className="text-xs text-red-600">{error}</p>}</div>;
}
