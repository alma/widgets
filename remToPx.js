const getAtPath = require('lodash.get')

// https://stackoverflow.com/a/1175468/283481
function isObjectLiteral(obj) {
  if (typeof obj !== 'object' || obj === null)
    return false

  // get obj's Object constructor's prototype
  let ObjProto = obj
  while (Object.getPrototypeOf(ObjProto = Object.getPrototypeOf(ObjProto)) !== null) {
  }

  return Object.getPrototypeOf(obj) === ObjProto
}

class RemToPxConverter {
  constructor(twTheme, pxBase) {
    this._twTheme = twTheme
    this._pxBase = pxBase
  }

  _convertValue(value, preserveUnknowns = false, propPath = null) {
    if (isObjectLiteral(value)) {
      return this.convert(value, propPath)
    } else if (Array.isArray(value)) {
      return value.map((v) => this._convertValue(v, true))
    } else if (typeof value === 'string') {
      return value.replace(
        /(?<=^|\s|[()])([+-]?(?:(?:\.\d+)|(?:\d+(?:\.\d+)?))(?:[eE][+-]?\d+)?)rem(?=\)|\s|$)/g,
        (match, remValue) => `${parseFloat(remValue) * this._pxBase}px`,
      )
    } else if (typeof value === 'function' && propPath) {
      return (theme, utils) => ({
        ...this.convert(getAtPath(this._twTheme, propPath)(theme, utils), propPath),
      })
    } else if (preserveUnknowns) {
      return value
    }

    return null
  }

  convert(obj = this._twTheme, path = '') {
    const target = {}

    for (const propName in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, propName)) {
        continue
      }

      const currentPath = path === '' ? propName : `${path}.${propName}`
      const value = obj[propName]

      if (isObjectLiteral(value)) {
        target[propName] = this.convert(value, currentPath)
      } else {
        const converted = this._convertValue(value, false, currentPath)
        if (converted != null) {
          target[propName] = converted
        }
      }
    }

    return target
  }
}

function remToPx(twTheme, pxBase) {
  const converter = new RemToPxConverter(twTheme, pxBase)
  return converter.convert()
}

module.exports = (twTheme, pxBase = 16) => ({
  config: {
    theme: {
      ...remToPx(twTheme, pxBase),
    },
  },
})
