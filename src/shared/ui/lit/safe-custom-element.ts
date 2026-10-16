import { BUILD_VERSION } from '@/shared/config/build-version.const'
import { warnOnce } from '@/shared/lib/errors'

// Symbol.for() shares the key across bundles. Never change it in 4.x.
export const ELEMENT_VERSION: unique symbol = Symbol.for('@alma/widgets:version')

type VersionedElement = CustomElementConstructor & { [ELEMENT_VERSION]?: string }

// The first bundle loaded wins, and another version warns instead of throwing. The registered
// class may come from another bundle, so never use `new` or instanceof on it.
export const safeCustomElement =
  (tagName: string) =>
  (elementClass: CustomElementConstructor): void => {
    const existing: VersionedElement | undefined = customElements.get(tagName)
    if (existing === undefined) {
      Object.defineProperty(elementClass, ELEMENT_VERSION, { value: BUILD_VERSION })
      customElements.define(tagName, elementClass)
      return
    }
    const existingVersion = existing[ELEMENT_VERSION]
    if (existingVersion !== BUILD_VERSION) {
      const existingDefinition =
        existingVersion === undefined ? 'without a version' : `with version ${existingVersion}`
      warnOnce(
        `<${tagName}> is already defined ${existingDefinition}. This bundle, version ${BUILD_VERSION}, uses that definition.`,
      )
    }
  }
