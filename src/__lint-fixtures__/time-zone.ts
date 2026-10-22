// expect: no-restricted-syntax "No timeZone option"
export const dueDate = new Intl.DateTimeFormat('fr', { timeZone: 'Europe/Paris' })
