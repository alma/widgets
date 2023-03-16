import React, { useState } from 'react'
import { Story } from '@storybook/react'
import { linkTo } from '@storybook/addon-links'
export default {
  title: 'Documentation/General',
}

export const General: Story = () => {
  const [copyFeedback, setCopyFeedback] = useState(false)
  const copy = (snippet: string) => {
    if (copyFeedback) return
    void navigator.clipboard
      .write([new ClipboardItem({ 'text/plain': new Blob([snippet], { type: 'text/plain' }) })])
      .then(() => {
        setCopyFeedback(true)
        setTimeout(() => setCopyFeedback(false), 1000)
      })
  }

  const cssSnippet = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@alma/widgets@3.x/dist/widgets.min.css" />`
  const jsSnippet = `<script src="https://cdn.jsdelivr.net/npm/@alma/widgets@3.x/dist/widgets.umd.js"></script>`
  const containerSnippet = `<div id="alma-widget"></div>`
  const initializeSnippet = `
  <script>
    ;(function () {
      var widgets = Alma.Widgets.initialize('<YOUR MERCHANT ID>', Alma.ApiMode.LIVE)
      widgets.add(Alma.Widgets.PaymentPlans, {
        container: '#alma-widget',
        purchaseAmount: 45000,
      })
    })()
  </script>
`
  return (
    <div className="container">
      <h1 id="alma-widgets">Alma Widgets</h1>
      <h2 id="changelog">Changelog</h2>
      <p>
        View all <a href="https://github.com/alma/widgets/releases">Changelog</a>
      </p>
      <h2 id="setup">Setup</h2>
      <h3>Add the widget to your page</h3>
      <h5>CSS</h5>
      <pre>
        <code>{cssSnippet}</code>
        <button className="copyButton" onClick={() => copy(cssSnippet)}>
          Copy Snippet
        </button>
      </pre>
      <h5>JS</h5>
      <pre>
        <code>{jsSnippet}</code>
        <button className="copyButton" onClick={() => copy(jsSnippet)}>
          Copy Snippet
        </button>
      </pre>
      <h3 id="create-the-container">Create the container</h3>
      <pre>
        <code>{containerSnippet}</code>
        <button className="copyButton" onClick={() => copy(containerSnippet)}>
          Copy Snippet
        </button>
      </pre>
      <h3 id="initialize-the-widget">Initialize the widget</h3>
      <pre>
        <code>{initializeSnippet}</code>
        <button className="copyButton" onClick={() => copy(initializeSnippet)}>
          Copy Snippet
        </button>
      </pre>
      <h2 id="going-further">Going further</h2>
      <p>
        Read the full{' '}
        <button
          className="link"
          role="link"
          onClick={linkTo('documentation-fulldocumentation--full-documentation')}
        >
          documentation
        </button>
      </p>
    </div>
  )
}
