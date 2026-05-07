import { MainFoodGroup } from "@prisma/client";

export type FoodGroupRule = { min?: number; max?: number };
export type WeeklyFoodGroupRules = Partial<Record<MainFoodGroup, FoodGroupRule>>;

const dinnerDefault: MainFoodGroup[] = ["red_meat", "white_meat", "white_meat", "white_meat", "fish", "fish", "legumes"];
const lunchRotation: MainFoodGroup[] = ["vegetarian", "cereals", "eggs", "cereals", "cheese", "cereals", "legumes"];

export function buildBalancePlan(params: { planningDays: number; weeklyFoodGroupRules?: WeeklyFoodGroupRules; userSlotMap: Map<string, MainFoodGroup> }) {
  const plan: { lunch: MainFoodGroup; dinner: MainFoodGroup }[] = [];
  const counts: Partial<Record<MainFoodGroup, number>> = {};
  for (let d = 0; d < params.planningDays; d += 1) {
    const dayKey = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][d % 7];
    const lunch = params.userSlotMap.get(`${dayKey}:lunch`) ?? lunchRotation[d % lunchRotation.length];
    let dinner = params.userSlotMap.get(`${dayKey}:dinner`) ?? dinnerDefault[d % dinnerDefault.length];
    if (dinner === lunch) dinner = dinner === "fish" ? "white_meat" : "fish";
    counts[lunch] = (counts[lunch] ?? 0) + 1;
    counts[dinner] = (counts[dinner] ?? 0) + 1;
    plan.push({ lunch, dinner });
  }
  return plan;
}
