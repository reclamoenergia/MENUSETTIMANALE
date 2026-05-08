import { AdminWarning } from "@/components/admin/admin-warning";
import { IngredientEditor, defaultIngredient } from "@/components/admin/ingredient-editor";

export default function NewIngredientPage() {
  return <section className="space-y-4"><AdminWarning /><h1 className="text-xl font-semibold">New ingredient</h1><IngredientEditor ingredient={defaultIngredient} isNew /></section>;
}
