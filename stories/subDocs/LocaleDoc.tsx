import React, { VoidFunctionComponent } from 'react'

export const LocaleDoc: VoidFunctionComponent = () => (
  <div>
    <h2 id="locale-options">Locale Options</h2>
    The locales supported by the widgets are :
    <ul>
      <li>
        <span className="code-string">en</span> - Generic English - This is the locale set by
        default.
      </li>
      <li>
        <span className="code-string">fr</span> - Generic French
      </li>
      <li>
        <span className="code-string">fr-FR</span> - French from France
      </li>
      <li>
        <span className="code-string">de</span> - Generic German
      </li>
      <li>
        <span className="code-string">de-DE</span> - German from Germany
      </li>
      <li>
        <span className="code-string">it</span> - Generic Italian
      </li>
      <li>
        <span className="code-string">it-IT</span> - Italian from Italy
      </li>
      <li>
        <span className="code-string">es</span> - Generic Spanish
      </li>
      <li>
        <span className="code-string">es-ES</span> - Spanish from Spain
      </li>
      <li>
        <span className="code-string">pt</span> - Generic Portuguese
      </li>
      <li>
        <span className="code-string">pt-PT</span> - Portuguese from Portugal
      </li>
      <li>
        <span className="code-string">nl</span> - Generic Dutch
      </li>
      <li>
        <span className="code-string">nl-NL</span> Dutch from The Netherlands
      </li>
      <li>
        <span className="code-string">nl-BE</span> Dutch from Belgium
      </li>
    </ul>
    <div>
      If the specific locale for the country you target is available, we suggest to use it instead
      of the generic locale.
    </div>
    <div>
      The locale is used in the Widgets to display all wordings in the correct language but also to
      format numbers, dates, currencies into the standard format.
    </div>
    <div>
      For example, for a pricing, the locale <span className="code-string">pt</span> will format as{' '}
      <span className="code-string">€ 100,00</span> while the locale{' '}
      <span className="code-string">pt-PT</span> will format as{' '}
      <span className="code-string">100,00 €</span>.
    </div>
  </div>
)
