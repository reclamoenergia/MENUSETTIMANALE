import { Unit } from "@prisma/client";

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function formatPortionQuantity(quantity: number, unit: Unit): string {
  if (unit === "piece") {
    return `${Math.ceil(quantity)} piece`;
  }

  if (unit === "g") {
    return `${roundToStep(quantity, 10)} g`;
  }

  if (unit === "ml") {
    return `${roundToStep(quantity, 10)} ml`;
  }

  return `${Math.round(quantity)} ${unit}`;
}
