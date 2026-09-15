// Generic product-card shell around the widget preview — title, quantity select, unit price, the
// widget's own mount slot, and a decorative "add to cart" button. Mirrors examples/basic.html's
// product block (the same one every merchant integration snippet is built from), so purchase
// amount changes the way it would on a real product page (unit price × quantity) instead of via a
// plain amount field. Fully generic: never depends on the feature under test — copied verbatim
// like dom.ts/mockFetch.ts.
import { el } from './dom'

export const DEFAULT_QUANTITIES = [1, 2, 3, 10]

export type ProductPreviewOptions = {
  productName: string
  unitPriceCents: number
  quantity: number
  quantities?: number[]
  onQuantityChange: (quantity: number) => void
  widgetMount: HTMLElement
}

export type ProductPreviewHandle = {
  element: HTMLElement
  // The unit price shown here can change independently of this component (edited via
  // ConfigPanel.ts) — call this whenever it does, the same way ResponseEditor.ts's own
  // `.refresh()` exists for values that change from outside it (gotcha 17).
  refresh: (unitPriceCents: number, quantity: number) => void
}

export function buildProductPreview(options: ProductPreviewOptions): ProductPreviewHandle {
  const { productName, quantities = DEFAULT_QUANTITIES, onQuantityChange, widgetMount } = options

  const priceHeading = el('h3', {}, [''])

  const quantitySelect = el(
    'select',
    {
      onchange: (event: Event) => {
        onQuantityChange(Number((event.target as HTMLSelectElement).value))
      },
    },
    quantities.map((value) => el('option', { value: String(value) }, [String(value)])),
  )

  const refresh = (unitPriceCents: number, quantity: number): void => {
    priceHeading.textContent = `${(unitPriceCents / 100).toFixed(2)} €`
    for (const option of Array.from(quantitySelect.options)) {
      option.selected = Number(option.value) === quantity
    }
  }

  const element = el('div', { className: 'product' }, [
    el('h1', {}, [productName]),
    quantitySelect,
    priceHeading,
    el('div', { className: 'pg-widget-slot' }, [widgetMount]),
    el('div', { className: 'add-to-cart' }, [el('button', { type: 'button' }, ['Ajouter au panier'])]),
  ])

  refresh(options.unitPriceCents, options.quantity)

  return { element, refresh }
}
