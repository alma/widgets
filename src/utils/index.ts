import {integer} from "../types";

export function priceToCents(price: number): integer {
  return Math.round(price * 100);
}

export function priceFromCents(cents: integer): number {
  return Number((cents / 100).toFixed(2));
}
