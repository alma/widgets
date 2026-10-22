// expect: no-restricted-syntax "No attachShadow"
export const root = document.createElement('div').attachShadow({ mode: 'open' })
