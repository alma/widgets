// expect: no-restricted-imports "Bind CSS-module classes with classMap"
import cx from 'classnames'

export const className = cx('planButton', { active: true })
