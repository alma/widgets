import '@/main.css'
import { installMockFetch } from './mockFetch'
import { mountApp } from './App'

// Must run before mountApp() (and the widgets it mounts) ever calls fetch: the widget's first
// eligibility request has to hit the mock, not the real sandbox API. In vanilla DOM there's no
// effect-ordering hazard to worry about here (unlike a React version) — just call these in this
// plain order.
installMockFetch()

const container = document.getElementById('root')
if (container) {
  mountApp(container)
}
