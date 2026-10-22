// expect: no-restricted-imports "The bundle has no React"
import { render } from 'react-dom'
import { createRoot } from 'react-dom/client'

export const renderers = [render, createRoot]
