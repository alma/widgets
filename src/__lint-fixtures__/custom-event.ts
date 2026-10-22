// expect: no-restricted-syntax "No CustomEvent"
export const event = new CustomEvent('alma-close', { detail: { reason: 'escape' } })
