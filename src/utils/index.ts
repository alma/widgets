import {DOMContent, integer} from "../types";

export function priceToCents(price: number): integer {
  return Math.round(price * 100);
}

export function priceFromCents(cents: integer): number {
  return Number((cents / 100).toFixed(2));
}

export function setDOMContent(container: Element, content: DOMContent | Element[]) {
  if (typeof content === "string") {
    container.innerHTML = content;
  } else {
    container.innerHTML = "";

    if (!Array.isArray(content)) {
      content = [content];
    }

    for (let el of content) {
      container.appendChild(el);
    }
  }
}
