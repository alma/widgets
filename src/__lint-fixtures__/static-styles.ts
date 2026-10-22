// expect: no-restricted-syntax "No static styles"
export class WithStyles {
  static styles = []
}

export class WithStylesGetter {
  static get styles() {
    return []
  }
}
