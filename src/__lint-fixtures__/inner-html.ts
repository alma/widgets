// expect: no-restricted-syntax "No innerHTML assignment"
const container = document.createElement('div')
container.innerHTML = '<p>Pay in 3 installments</p>'
container.innerHTML += '<p>No fees</p>'
