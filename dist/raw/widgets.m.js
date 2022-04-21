import React, { useState, useEffect } from 'react';
import { IntlProvider, FormattedMessage, FormattedNumber, FormattedDate, useIntl } from 'react-intl';
import { unmountComponentAtNode, render } from 'react-dom';
import cx from 'classnames';
import Modal from 'react-modal';
import noScroll from 'no-scroll';
import { useMediaQuery } from 'react-responsive';
import { secondsToMilliseconds, isToday } from 'date-fns';

var ceil = Math.ceil;
var floor = Math.floor; // `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger

var toInteger = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire();
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var check = function (it) {
  return it && it.Math == Math && it;
}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


var global_1 = // eslint-disable-next-line no-undef
check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
function () {
  return this;
}() || Function('return this')();

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var descriptors = !fails(function () {
  return Object.defineProperty({}, 1, {
    get: function () {
      return 7;
    }
  })[1] != 7;
});

var isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

var EXISTS = isObject(document$1) && isObject(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

var ie8DomDefine = !descriptors && !fails(function () {
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () {
      return 7;
    }
  }).a != 7;
});

var anObject = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  }

  return it;
};

// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string

var toPrimitive = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty

var f = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (ie8DomDefine) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) {
    /* empty */
  }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};
var objectDefineProperty = {
  f: f
};

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var setGlobal = function (key, value) {
  try {
    createNonEnumerableProperty(global_1, key, value);
  } catch (error) {
    global_1[key] = value;
  }

  return value;
};

var SHARED = '__core-js_shared__';
var store = global_1[SHARED] || setGlobal(SHARED, {});
var sharedStore = store;

var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

if (typeof sharedStore.inspectSource != 'function') {
  sharedStore.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource = sharedStore.inspectSource;

var WeakMap = global_1.WeakMap;
var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

var hasOwnProperty = {}.hasOwnProperty;

var has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var shared = createCommonjsModule(function (module) {
  (module.exports = function (key, value) {
    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.8.1',
    mode:  'global',
    copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
  });
});

var id = 0;
var postfix = Math.random();

var uid = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

var keys = shared('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys = {};

var WeakMap$1 = global_1.WeakMap;
var set, get, has$1;

var enforce = function (it) {
  return has$1(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;

    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    }

    return state;
  };
};

if (nativeWeakMap) {
  var store$1 = sharedStore.state || (sharedStore.state = new WeakMap$1());
  var wmget = store$1.get;
  var wmhas = store$1.has;
  var wmset = store$1.set;

  set = function (it, metadata) {
    metadata.facade = it;
    wmset.call(store$1, it, metadata);
    return metadata;
  };

  get = function (it) {
    return wmget.call(store$1, it) || {};
  };

  has$1 = function (it) {
    return wmhas.call(store$1, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;

  set = function (it, metadata) {
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };

  get = function (it) {
    return has(it, STATE) ? it[STATE] : {};
  };

  has$1 = function (it) {
    return has(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has$1,
  enforce: enforce,
  getterFor: getterFor
};

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
  1: 2
}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

var f$1 = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;
var objectPropertyIsEnumerable = {
  f: f$1
};

var toString = {}.toString;

var classofRaw = function (it) {
  return toString.call(it).slice(8, -1);
};

var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

var f$2 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (ie8DomDefine) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) {
    /* empty */
  }
  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
};
var objectGetOwnPropertyDescriptor = {
  f: f$2
};

var redefine = createCommonjsModule(function (module) {
  var getInternalState = internalState.get;
  var enforceInternalState = internalState.enforce;
  var TEMPLATE = String(String).split('String');
  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;
    var state;

    if (typeof value == 'function') {
      if (typeof key == 'string' && !has(value, 'name')) {
        createNonEnumerableProperty(value, 'name', key);
      }

      state = enforceInternalState(value);

      if (!state.source) {
        state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
      }
    }

    if (O === global_1) {
      if (simple) O[key] = value;else setGlobal(key, value);
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }

    if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
  });
});

var path = global_1;

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
};

var min = Math.min; // `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength

var toLength = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min; // Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

var toAbsoluteIndex = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
};

var createMethod$1 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value; // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare

    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++]; // eslint-disable-next-line no-self-compare

      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
    } else for (; length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    }
    return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod$1(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod$1(false)
};

var indexOf = arrayIncludes.indexOf;

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;

  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }

  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys$1);
};

var objectGetOwnPropertyNames = {
  f: f$3
};

var f$4 = Object.getOwnPropertySymbols;
var objectGetOwnPropertySymbols = {
  f: f$4
};

var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = objectGetOwnPropertyNames.f(anObject(it));
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var copyConstructorProperties = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = objectDefineProperty.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';
var isForced_1 = isForced;

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/

var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

  if (GLOBAL) {
    target = global_1;
  } else if (STATIC) {
    target = global_1[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global_1[TARGET] || {}).prototype;
  }

  if (target) for (key in source) {
    sourceProperty = source[key];

    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];

    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    } // add a flag to not completely full polyfills


    if (options.sham || targetProperty && targetProperty.sham) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    } // extend global


    redefine(target, key, sourceProperty, options);
  }
};

// https://tc39.github.io/ecma262/#sec-toobject

var toObject = function (argument) {
  return Object(requireObjectCoercible(argument));
};

var correctPrototypeGetter = !fails(function () {
  function F() {
    /* empty */
  }

  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype; // `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof

var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];

  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  }

  return O instanceof Object ? ObjectPrototype : null;
};

var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});

var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
&& !Symbol.sham // eslint-disable-next-line no-undef
&& typeof Symbol.iterator == 'symbol';

var WellKnownSymbolsStore = shared('wks');
var Symbol$1 = global_1.Symbol;
var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

var wellKnownSymbol = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  }

  return WellKnownSymbolsStore[name];
};

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () {
  return this;
}; // `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object


var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys(); // Safari 8 has buggy iterators w/o `next`

  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

if ( !has(IteratorPrototype, ITERATOR)) {
  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

// https://tc39.github.io/ecma262/#sec-object.keys

var objectKeys = Object.keys || function keys(O) {
  return objectKeysInternal(O, enumBugKeys);
};

// https://tc39.github.io/ecma262/#sec-object.defineproperties

var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;

  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);

  return O;
};

var html = getBuiltIn('document', 'documentElement');

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO$1 = sharedKey('IE_PROTO');

var EmptyConstructor = function () {
  /* empty */
};

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
}; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak

  return temp;
}; // Create object with fake `null` prototype: use iframe Object with cleared prototype


var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
}; // Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug


var activeXDocument;

var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) {
    /* ignore */
  }

  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;

  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];

  return NullProtoObject();
};

hiddenKeys[IE_PROTO$1] = true; // `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create

var objectCreate = Object.create || function create(O, Properties) {
  var result;

  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();

  return Properties === undefined ? result : objectDefineProperties(result, Properties);
};

var defineProperty = objectDefineProperty.f;
var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var setToStringTag = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, {
      configurable: true,
      value: TAG
    });
  }
};

var iterators = {};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

var returnThis$1 = function () {
  return this;
};

var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, {
    next: createPropertyDescriptor(1, next)
  });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
  iterators[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var aPossiblePrototype = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  }

  return it;
};

// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.

/* eslint-disable no-proto */

var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;

  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) {
    /* empty */
  }

  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$1 = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis$2 = function () {
  return this;
};

var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];

    switch (KIND) {
      case KEYS:
        return function keys() {
          return new IteratorConstructor(this, KIND);
        };

      case VALUES:
        return function values() {
          return new IteratorConstructor(this, KIND);
        };

      case ENTRIES:
        return function entries() {
          return new IteratorConstructor(this, KIND);
        };
    }

    return function () {
      return new IteratorConstructor(this);
    };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$1] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY; // fix native

  if (anyNativeIterator) {
    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));

    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
        if (objectSetPrototypeOf) {
          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
        } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
        }
      } // Set @@toStringTag to native iterators


      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  } // fix Array#{values, @@iterator}.name in V8 / FF


  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;

    defaultIterator = function values() {
      return nativeIterator.call(this);
    };
  } // define iterator


  if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
  }

  iterators[NAME] = defaultIterator; // export additional methods

  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else _export({
      target: NAME,
      proto: true,
      forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME
    }, methods);
  }

  return methods;
};

var charAt = stringMultibyte.charAt;
var STRING_ITERATOR = 'String Iterator';
var setInternalState = internalState.set;
var getInternalState = internalState.getterFor(STRING_ITERATOR); // `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator

defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  }); // `%StringIteratorPrototype%.next` method
  // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return {
    value: undefined,
    done: true
  };
  point = charAt(string, index);
  state.index += point.length;
  return {
    value: point,
    done: false
  };
});

var aFunction$1 = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  }

  return it;
};

var functionBindContext = function (fn, that, length) {
  aFunction$1(fn);
  if (that === undefined) return fn;

  switch (length) {
    case 0:
      return function () {
        return fn.call(that);
      };

    case 1:
      return function (a) {
        return fn.call(that, a);
      };

    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };

    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
  }

  return function ()
  /* ...args */
  {
    return fn.apply(that, arguments);
  };
};

var iteratorClose = function (iterator) {
  var returnMethod = iterator['return'];

  if (returnMethod !== undefined) {
    return anObject(returnMethod.call(iterator)).value;
  }
};

var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    iteratorClose(iterator);
    throw error;
  }
};

var ITERATOR$2 = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype; // check on default Array iterator

var isArrayIteratorMethod = function (it) {
  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR$2] === it);
};

var createProperty = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
};

var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
var test = {};
test[TO_STRING_TAG$1] = 'z';
var toStringTagSupport = String(test) === '[object z]';

var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag'); // ES3 wrong here

var CORRECT_ARGUMENTS = classofRaw(function () {
  return arguments;
}()) == 'Arguments'; // fallback for IE11 Script Access Denied error

var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) {
    /* empty */
  }
}; // getting tag from ES6+ `Object.prototype.toString`


var classof = toStringTagSupport ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
  : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag // builtinTag case
  : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
  : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};

var ITERATOR$3 = wellKnownSymbol('iterator');

var getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$3] || it['@@iterator'] || iterators[classof(it)];
};

// https://tc39.github.io/ecma262/#sec-array.from


var arrayFrom = function from(arrayLike
/* , mapfn = undefined, thisArg = undefined */
) {
  var O = toObject(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2); // if the target is not iterable or it's an array with the default iterator - use a simple case

  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    result = new C();

    for (; !(step = next.call(iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = toLength(O.length);
    result = new C(length);

    for (; length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }

  result.length = index;
  return result;
};

var ITERATOR$4 = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return {
        done: !!called++
      };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };

  iteratorWithReturn[ITERATOR$4] = function () {
    return this;
  }; // eslint-disable-next-line no-throw-literal


  Array.from(iteratorWithReturn, function () {
    throw 2;
  });
} catch (error) {
  /* empty */
}

var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;

  try {
    var object = {};

    object[ITERATOR$4] = function () {
      return {
        next: function () {
          return {
            done: ITERATION_SUPPORT = true
          };
        }
      };
    };

    exec(object);
  } catch (error) {
    /* empty */
  }

  return ITERATION_SUPPORT;
};

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  Array.from(iterable);
}); // `Array.from` method
// https://tc39.github.io/ecma262/#sec-array.from

_export({
  target: 'Array',
  stat: true,
  forced: INCORRECT_ITERATION
}, {
  from: arrayFrom
});

var widgetTypes;

(function (widgetTypes) {
  widgetTypes["PaymentPlans"] = "PaymentPlans";
  widgetTypes["Modal"] = "Modal";
})(widgetTypes || (widgetTypes = {}));

var apiStatus;

(function (apiStatus) {
  apiStatus["PENDING"] = "pending";
  apiStatus["SUCCESS"] = "success";
  apiStatus["FAILED"] = "failed";
})(apiStatus || (apiStatus = {}));

var Locale;

(function (Locale) {
  Locale["en"] = "en";
  Locale["fr"] = "fr";
  Locale["de"] = "de";
  Locale["it"] = "it";
  Locale["es"] = "es";
  Locale["nl"] = "nl";
  Locale["nl-NL"] = "nl-NL";
  Locale["nl-BE"] = "nl-BE";
})(Locale || (Locale = {}));

function priceToCents(price) {
  return Math.round(price * 100);
}
function priceFromCents(cents) {
  return Number((cents / 100).toFixed(2));
}
function formatCents(cents) {
  return String(priceFromCents(cents)).replace('.', ',');
}

/* eslint-disable */

(function (ElementProto) {
  if (typeof ElementProto.matches !== 'function') {
    ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector || function matches(selector) {
      var element = this;
      var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
      var index = 0;

      while (elements[index] && elements[index] !== element) {
        ++index;
      }

      return Boolean(elements[index]);
    };
  }

  if (typeof ElementProto.closest !== 'function') {
    ElementProto.closest = function closest(selector) {
      var element = this;

      while (element && element.nodeType === 1) {
        if (element.matches(selector)) {
          return element;
        }

        element = element.parentNode;
      }

      return null;
    };
  }
})(window.Element.prototype);
/*
 * Element.prototype.classList polyfill
 */
// 1. String.prototype.trim polyfill


if (!''.trim) String.prototype.trim = function () {
  return this.replace(/^[\s﻿]+|[\s﻿]+$/g, '');
};

(function (window) {

  if (!window.DOMException) (DOMException = function DOMException(reason) {
    this.message = reason;
  }).prototype = new Error();

  var wsRE = /[\11\12\14\15\40]/,
      wsIndex = 0,
      checkIfValidClassListEntry = function checkIfValidClassListEntry(O, V) {
    if (V === '') throw new DOMException("Failed to execute '" + O + "' on 'DOMTokenList': The token provided must not be empty.");
    if ((wsIndex = V.search(wsRE)) !== -1) throw new DOMException("Failed to execute '" + O + "' on 'DOMTokenList': " + "The token provided ('" + V[wsIndex] + "') contains HTML space characters, which are not valid in tokens.");
  }; // 2. Implement the barebones DOMTokenList livelyness polyfill


  if (typeof DOMTokenList !== 'function') (function (window) {
    var document = window.document,
        Object = window.Object,
        hasOwnProp = Object.prototype.hasOwnProperty;
    var defineProperty = Object.defineProperty,
        allowTokenListConstruction = 0,
        skipPropChange = 0;

    var DOMTokenList = function DOMTokenList() {
      if (!allowTokenListConstruction) throw TypeError('Illegal constructor'); // internally let it through
    };

    DOMTokenList.prototype.toString = DOMTokenList.prototype.toLocaleString = function () {
      return this.value;
    };

    DOMTokenList.prototype.add = function () {
      a: for (var v = 0, argLen = arguments.length, val = '', ele = this[' uCL'], proto = ele[' uCLp']; v !== argLen; ++v) {
        val = arguments[v] + '', checkIfValidClassListEntry('add', val);

        for (var i = 0, Len = proto.length, resStr = val; i !== Len; ++i) {
          if (this[i] === val) continue a;else resStr += ' ' + this[i];
        }

        this[Len] = val, proto.length += 1, proto.value = resStr;
      }
      skipPropChange = 1, ele.className = proto.value, skipPropChange = 0;
    };

    DOMTokenList.prototype.remove = function () {
      for (var v = 0, argLen = arguments.length, val = '', ele = this[' uCL'], proto = ele[' uCLp']; v !== argLen; ++v) {
        val = arguments[v] + '', checkIfValidClassListEntry('remove', val);

        for (var i = 0, Len = proto.length, resStr = '', is = 0; i !== Len; ++i) {
          if (is) {
            this[i - 1] = this[i];
          } else {
            if (this[i] !== val) {
              resStr += this[i] + ' ';
            } else {
              is = 1;
            }
          }
        }

        if (!is) continue;
        delete this[Len], proto.length -= 1, proto.value = resStr;
      }
      skipPropChange = 1, ele.className = proto.value, skipPropChange = 0;
    };

    window.DOMTokenList = DOMTokenList;

    function whenPropChanges() {
      var evt = window.event,
          prop = evt.propertyName;

      if (!skipPropChange && (prop === 'className' || prop === 'classList' && !defineProperty)) {
        var target = evt.srcElement,
            protoObjProto = target[' uCLp'],
            strval = '' + target[prop];
        var tokens = strval.trim().split(wsRE),
            resTokenList = target[prop === 'classList' ? ' uCL' : 'classList'];
        var oldLen = protoObjProto.length;

        a: for (var cI = 0, cLen = protoObjProto.length = tokens.length, sub = 0; cI !== cLen; ++cI) {
          for (var innerI = 0; innerI !== cI; ++innerI) {
            if (tokens[innerI] === tokens[cI]) {
              sub++;
              continue a;
            }
          }

          resTokenList[cI - sub] = tokens[cI];
        }

        for (var i = cLen - sub; i < oldLen; ++i) {
          delete resTokenList[i];
        } //remove trailing indexs


        if (prop !== 'classList') return;
        skipPropChange = 1, target.classList = resTokenList, target.className = strval;
        skipPropChange = 0, resTokenList.length = tokens.length - sub;
      }
    }

    function polyfillClassList(ele) {
      if (!ele || !('innerHTML' in ele)) throw TypeError('Illegal invocation');
      ele.detachEvent('onpropertychange', whenPropChanges); // prevent duplicate handler infinite loop

      allowTokenListConstruction = 1;

      try {
        var protoObj = function protoObj() {};

        protoObj.prototype = new DOMTokenList();
      } finally {
        allowTokenListConstruction = 0;
      }

      var protoObjProto = protoObj.prototype,
          resTokenList = new protoObj();

      a: for (var toks = ele.className.trim().split(wsRE), cI = 0, cLen = toks.length, sub = 0; cI !== cLen; ++cI) {
        for (var innerI = 0; innerI !== cI; ++innerI) {
          if (toks[innerI] === toks[cI]) {
            sub++;
            continue a;
          }
        }

        this[cI - sub] = toks[cI];
      }
      protoObjProto.length = cLen - sub, protoObjProto.value = ele.className, protoObjProto[' uCL'] = ele;

      if (defineProperty) {
        defineProperty(ele, 'classList', {
          // IE8 & IE9 allow defineProperty on the DOM
          enumerable: 1,
          get: function get() {
            return resTokenList;
          },
          configurable: 0,
          set: function set(newVal) {
            skipPropChange = 1, ele.className = protoObjProto.value = newVal += '', skipPropChange = 0;
            var toks = newVal.trim().split(wsRE),
                oldLen = protoObjProto.length;

            a: for (var cI = 0, cLen = protoObjProto.length = toks.length, sub = 0; cI !== cLen; ++cI) {
              for (var innerI = 0; innerI !== cI; ++innerI) {
                if (toks[innerI] === toks[cI]) {
                  sub++;
                  continue a;
                }
              }

              resTokenList[cI - sub] = toks[cI];
            }

            for (var i = cLen - sub; i < oldLen; ++i) {
              delete resTokenList[i];
            } //remove trailing indexs

          }
        });
        defineProperty(ele, ' uCLp', {
          // for accessing the hidden prototype
          enumerable: 0,
          configurable: 0,
          writeable: 0,
          value: protoObj.prototype
        });
        defineProperty(protoObjProto, ' uCL', {
          enumerable: 0,
          configurable: 0,
          writeable: 0,
          value: ele
        });
      } else {
        ele.classList = resTokenList, ele[' uCL'] = resTokenList, ele[' uCLp'] = protoObj.prototype;
      }

      ele.attachEvent('onpropertychange', whenPropChanges);
    }

    try {
      // Much faster & cleaner version for IE8 & IE9:
      // Should work in IE8 because Element.prototype instanceof Node is true according to the specs
      window.Object.defineProperty(window.Element.prototype, 'classList', {
        enumerable: 1,
        get: function get(val) {
          if (!hasOwnProp.call(this, 'classList')) polyfillClassList(this);
          return this.classList;
        },
        configurable: 0,
        set: function set(val) {
          this.className = val;
        }
      });
    } catch (e) {
      // Less performant fallback for older browsers (IE 6-8):
      window[' uCL'] = polyfillClassList; // the below code ensures polyfillClassList is applied to all current and future elements in the doc.

      document.documentElement.firstChild.appendChild(document.createElement('style')).styleSheet.cssText = '_*{x-uCLp:expression(!this.hasOwnProperty("classList")&&window[" uCL"](this))}' + //  IE6
      '[class]{x-uCLp/**/:expression(!this.hasOwnProperty("classList")&&window[" uCL"](this))}'; //IE7-8
    }
  })(window) // 3. Patch in unsupported methods in DOMTokenList
  ;

  (function (DOMTokenListProto, testClass) {
    if (!DOMTokenListProto.item) DOMTokenListProto.item = function (i) {
      function NullCheck(n) {
        return n === void 0 ? null : n;
      }

      return NullCheck(this[i]);
    };
    if (!DOMTokenListProto.toggle || testClass.toggle('a', 0) !== false) DOMTokenListProto.toggle = function (val) {
      if (arguments.length > 1) return this[arguments[1] ? 'add' : 'remove'](val), !!arguments[1];
      var oldValue = this.value;
      return this.remove(oldValue), oldValue === this.value && (this.add(val), true);
      /*|| false*/
    };
    if (!DOMTokenListProto.replace || typeof testClass.replace('a', 'b') !== 'boolean') DOMTokenListProto.replace = function (oldToken, newToken) {
      checkIfValidClassListEntry('replace', oldToken), checkIfValidClassListEntry('replace', newToken);
      var oldValue = this.value;
      return this.remove(oldToken), this.value !== oldValue && (this.add(newToken), true);
    };
    if (!DOMTokenListProto.contains) DOMTokenListProto.contains = function (value) {
      for (var i = 0, Len = this.length; i !== Len; ++i) {
        if (this[i] === value) return true;
      }

      return false;
    };
    if (!DOMTokenListProto.forEach) DOMTokenListProto.forEach = function (f) {
      if (arguments.length === 1) for (var i = 0, Len = this.length; i !== Len; ++i) {
        f(this[i], i, this);
      } else for (var i = 0, Len = this.length, tArg = arguments[1]; i !== Len; ++i) {
        f.call(tArg, this[i], i, this);
      }
    };
    if (!DOMTokenListProto.entries) DOMTokenListProto.entries = function () {
      var nextIndex = 0,
          that = this;
      return {
        next: function next() {
          return nextIndex < that.length ? {
            value: [nextIndex, that[nextIndex]],
            done: false
          } : {
            done: true
          };
        }
      };
    };
    if (!DOMTokenListProto.values) DOMTokenListProto.values = function () {
      var nextIndex = 0,
          that = this;
      return {
        next: function next() {
          return nextIndex < that.length ? {
            value: that[nextIndex],
            done: false
          } : {
            done: true
          };
        }
      };
    };
    if (!DOMTokenListProto.keys) DOMTokenListProto.keys = function () {
      var nextIndex = 0,
          that = this;
      return {
        next: function next() {
          return nextIndex < that.length ? {
            value: nextIndex,
            done: false
          } : {
            done: true
          };
        }
      };
    };
  })(window.DOMTokenList.prototype, window.document.createElement('div').classList);
})(window);

var messagesDE = {
	"eligibility-modal.bullet-1": "Wählen Sie an der Kasse <strong>Alma</strong> .",
	"eligibility-modal.bullet-2": "Füllen Sie die <strong>angeforderten</strong> Informationen aus.",
	"eligibility-modal.bullet-3": "Die Bestätigung Ihrer Zahlung <strong>sofort</strong> !",
	"eligibility-modal.cost": "Davon Kosten",
	"eligibility-modal.credit-commitment": "Ein Kredit verpflichtet Sie und muss zurückgezahlt werden. Prüfen Sie Ihre Rückzahlungsfähigkeit, bevor Sie sich verpflichten.",
	"eligibility-modal.credit-cost": "Davon Kreditkosten",
	"eligibility-modal.credit-cost-amount": "{creditCost} (APR {TAEG})",
	"eligibility-modal.no-eligibility": "Ups, die Simulation scheint nicht funktioniert zu haben.",
	"eligibility-modal.title": "<highlighted>Bezahlen Sie in Raten</highlighted> oder später per Kreditkarte mit Alma.",
	"eligibility-modal.total": "Insgesamt",
	"installments.today": "Heutzutage",
	"payment-plan-strings.day-abbreviation": "J{numberOfDeferredDays}",
	"payment-plan-strings.default-message": "Bezahlen Sie in Raten mit Alma",
	"payment-plan-strings.deferred": "{totalAmount} zu zahlen am {dueDate}",
	"payment-plan-strings.ineligible-greater-than-max": "Bis zu {maxAmount}",
	"payment-plan-strings.ineligible-lower-than-min": "Ab {minAmount}",
	"payment-plan-strings.multiple-installments": "{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} dann {numberOfRemainingInstallments} x {othersInstallmentAmount}} other {{firstInstallmentAmount} dann {numberOfRemainingInstallments} x {othersInstallmentAmount}}}",
	"payment-plan-strings.multiple-installments-same-amount": "{installmentsCount} x {totalAmount}",
	"payment-plan-strings.no-fee": "(gebührenfrei)"
};

var messagesEN = {
	"eligibility-modal.bullet-1": "Choose <strong>Alma</strong> at checkout.",
	"eligibility-modal.bullet-2": "Fill in the <strong>information</strong> requested.",
	"eligibility-modal.bullet-3": "Validation of your payment <strong>instantaneous</strong>!",
	"eligibility-modal.cost": "Of which costs",
	"eligibility-modal.credit-commitment": "A loan commits you and must be repaid. Check your ability to repay before committing yourself.",
	"eligibility-modal.credit-cost": "Of which cost of credit",
	"eligibility-modal.credit-cost-amount": "{creditCost} (APR {TAEG})",
	"eligibility-modal.no-eligibility": "Oops, looks like the simulation didn't work.",
	"eligibility-modal.title": "<highlighted>Pay in installments</highlighted> or later by credit card with Alma.",
	"eligibility-modal.total": "Total",
	"installments.today": "Today",
	"payment-plan-strings.day-abbreviation": "T{numberOfDeferredDays}",
	"payment-plan-strings.default-message": "Pay in installments with Alma",
	"payment-plan-strings.deferred": "{totalAmount} to be paid on {dueDate}",
	"payment-plan-strings.ineligible-greater-than-max": "Until {maxAmount}",
	"payment-plan-strings.ineligible-lower-than-min": "From {minAmount}",
	"payment-plan-strings.multiple-installments": "{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} then {numberOfRemainingInstallments} x {othersInstallmentAmount}} other {{firstInstallmentAmount} then {numberOfRemainingInstallments} x {othersInstallmentAmount}}}",
	"payment-plan-strings.multiple-installments-same-amount": "{installmentsCount} x {totalAmount}",
	"payment-plan-strings.no-fee": "(free of charge)"
};

var messagesES = {
	"eligibility-modal.bullet-1": "Elige <strong>Alma</strong> como método de pago.",
	"eligibility-modal.bullet-2": "Completa la <strong>información</strong> solicitada.",
	"eligibility-modal.bullet-3": "¡Validación <strong>inmediata</strong> de tu pago!",
	"eligibility-modal.cost": "Gastos (incl. en el total)",
	"eligibility-modal.credit-commitment": "Un préstamo te compromete y debe ser devuelto. Comprueba tu capacidad financiera antes de comprometerte.",
	"eligibility-modal.credit-cost": "Coste de crédito (incl. en el total)",
	"eligibility-modal.credit-cost-amount": "{creditCost} (TAE {TAEG})",
	"eligibility-modal.no-eligibility": "Uy, parece que la simulación no ha funcionado.",
	"eligibility-modal.title": "<highlighted>Paga a plazos</highlighted> o más adelante con tu tarjeta, a través de Alma.",
	"eligibility-modal.total": "Total",
	"installments.today": "Hoy",
	"payment-plan-strings.day-abbreviation": "D{numberOfDeferredDays}",
	"payment-plan-strings.default-message": "Pagar a plazos con Alma",
	"payment-plan-strings.deferred": "{totalAmount} a pagar el {dueDate}",
	"payment-plan-strings.ineligible-greater-than-max": "Hasta {maxAmount}",
	"payment-plan-strings.ineligible-lower-than-min": "Desde {minAmount}",
	"payment-plan-strings.multiple-installments": "{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} hoy, después {numberOfRemainingInstallments} mensualidad de {othersInstallmentAmount}} other {{firstInstallmentAmount} hoy, después {numberOfRemainingInstallments} de {othersInstallmentAmount} mensualidades }}",
	"payment-plan-strings.multiple-installments-same-amount": "{installmentsCount} plazos de {totalAmount}",
	"payment-plan-strings.no-fee": "(sin intereses)"
};

var messagesFR = {
	"eligibility-modal.bullet-1": "Choisissez <strong>Alma</strong> au moment du paiement.",
	"eligibility-modal.bullet-2": "Renseignez les <strong>informations</strong> demandées.",
	"eligibility-modal.bullet-3": "La validation de votre paiement <strong>instantanée</strong> !",
	"eligibility-modal.cost": "Dont frais",
	"eligibility-modal.credit-commitment": "Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.",
	"eligibility-modal.credit-cost": "Dont coût du crédit",
	"eligibility-modal.credit-cost-amount": "{creditCost} (TAEG {TAEG})",
	"eligibility-modal.no-eligibility": "Oups, il semblerait que la simulation n'aie pas fonctionné.",
	"eligibility-modal.title": "<highlighted>Payez en plusieurs fois</highlighted> ou plus tard par carte bancaire avec Alma.",
	"eligibility-modal.total": "Total",
	"installments.today": "Aujourd'hui",
	"payment-plan-strings.day-abbreviation": "J{numberOfDeferredDays}",
	"payment-plan-strings.default-message": "Payez en plusieurs fois avec Alma",
	"payment-plan-strings.deferred": "{totalAmount} à payer le {dueDate}",
	"payment-plan-strings.ineligible-greater-than-max": "Jusqu'à {maxAmount}",
	"payment-plan-strings.ineligible-lower-than-min": "À partir de {minAmount}",
	"payment-plan-strings.multiple-installments": "{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}} other {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}}}",
	"payment-plan-strings.multiple-installments-same-amount": "{installmentsCount} x {totalAmount}",
	"payment-plan-strings.no-fee": "(sans frais)"
};

var messagesIT = {
	"eligibility-modal.bullet-1": "Scegli <strong>Alma</strong> alla cassa.",
	"eligibility-modal.bullet-2": "Compila le informazioni <strong></strong> richieste.",
	"eligibility-modal.bullet-3": "Convalida del tuo pagamento <strong>istantanea</strong>!",
	"eligibility-modal.cost": "Di cui commissioni",
	"eligibility-modal.credit-commitment": "Un pagamento rateale ti impegna e deve essere ripagato. Verifica la tua capacità di rimborso prima di impegnarti.",
	"eligibility-modal.credit-cost": "Di cui commissioni",
	"eligibility-modal.credit-cost-amount": "{creditCost} (TAEG {TAEG})",
	"eligibility-modal.no-eligibility": "Ops, sembra che la simulazione non abbia funzionato.",
	"eligibility-modal.title": "<highlighted>Paga a rate</highlighted> e posticipa il pagamento con Alma, senza interessi.",
	"eligibility-modal.total": "Totale",
	"installments.today": "Oggi",
	"payment-plan-strings.day-abbreviation": "G{numberOfDeferredDays}",
	"payment-plan-strings.default-message": "Paga a rate con Alma",
	"payment-plan-strings.deferred": "{totalAmount} da pagare il {dueDate}",
	"payment-plan-strings.ineligible-greater-than-max": "Disponibile fino a {maxAmount}",
	"payment-plan-strings.ineligible-lower-than-min": "Pagamento rateale disponibile a partire da {minAmount}",
	"payment-plan-strings.multiple-installments": "{numberOfRemainingInstallments, plural, one {Oggi paghi {firstInstallmentAmount} poi {numberOfRemainingInstallments} rata mensile di {othersInstallmentAmount}} other {Oggi paghi {firstInstallmentAmount} poi {numberOfRemainingInstallments} rate mensili di {othersInstallmentAmount}}}",
	"payment-plan-strings.multiple-installments-same-amount": "In {installmentsCount} rate mensili di {totalAmount}",
	"payment-plan-strings.no-fee": "(senza interessi)"
};

var messagesNL = {
	"eligibility-modal.bullet-1": "Kies <strong>Alma</strong> bij het afrekenen.",
	"eligibility-modal.bullet-2": "Vul de <strong>gevraagde informatie</strong> in.",
	"eligibility-modal.bullet-3": "Validatie van uw betaling <strong>onmiddellijk</strong>!",
	"eligibility-modal.cost": "Waarvan kosten",
	"eligibility-modal.credit-commitment": "Een lening bindt je en moet worden terugbetaald. Ga na of u kunt terugbetalen voordat u zich vastlegt.",
	"eligibility-modal.credit-cost": "Waarvan kosten van krediet",
	"eligibility-modal.credit-cost-amount": "{creditCost} (APR {TAEG})",
	"eligibility-modal.no-eligibility": "Oeps, het lijkt erop dat de simulatie niet werkte.",
	"eligibility-modal.title": "<highlighted>Betaal in termijnen</highlighted> of later per credit card met Alma.",
	"eligibility-modal.total": "Totaal",
	"installments.today": "Tegenwoordig",
	"payment-plan-strings.day-abbreviation": "J{numberOfDeferredDays}",
	"payment-plan-strings.default-message": "Betaal in termijnen met Alma",
	"payment-plan-strings.deferred": "{totalAmount} te betalen op {dueDate}",
	"payment-plan-strings.ineligible-greater-than-max": "Tot {maxAmount}",
	"payment-plan-strings.ineligible-lower-than-min": "Van {minAmount}",
	"payment-plan-strings.multiple-installments": "{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} dan {numberOfRemainingInstallments} x {othersInstallmentAmount}} other {{firstInstallmentAmount} dan {numberOfRemainingInstallments} x {othersInstallmentAmount}}}",
	"payment-plan-strings.multiple-installments-same-amount": "{installmentsCount} x {totalAmount}",
	"payment-plan-strings.no-fee": "(gratis)"
};

var getTranslationsByLocale = function getTranslationsByLocale(locale) {
  switch (locale) {
    case Locale.fr:
      return messagesFR;

    case Locale.en:
      return messagesEN;

    case Locale.es:
      return messagesES;

    case Locale.it:
      return messagesIT;

    case Locale.de:
      return messagesDE;

    case Locale.nl:
    case Locale['nl-BE']:
    case Locale['nl-NL']:
      return messagesNL;

    default:
      return messagesEN;
  }
};

var Provider = function Provider(_ref) {
  var children = _ref.children,
      locale = _ref.locale;
  return /*#__PURE__*/React.createElement(IntlProvider, {
    messages: getTranslationsByLocale(locale),
    locale: locale,
    defaultLocale: "en"
  }, children);
};

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var fetchFromApi = function fetchFromApi(url, data, headers) {
  if (url === void 0) {
    url = '';
  }

  try {
    return Promise.resolve(fetch(url, {
      method: 'POST',
      headers: _extends({
        'Content-Type': 'application/json'
      }, headers),
      body: JSON.stringify(data)
    })).then(function (response) {
      return response.json();
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var filterELigibility = function filterELigibility(eligibilities, configPlans) {
  // Remove p1x
  var filteredEligibilityPlans = eligibilities.filter(function (plan) {
    return !(plan.installments_count === 1 && plan.deferred_days === 0 && plan.deferred_months === 0);
  }); // If no configPlans was provided, return eligibility response

  if (!configPlans) {
    return filteredEligibilityPlans;
  } // Else check if the plan is eligible regarding the related configPlan


  return filteredEligibilityPlans.map(function (plan) {
    var eligibilityDeferredDays = (plan.deferred_months ? plan.deferred_months : 0) * 30 + (plan.deferred_days ? plan.deferred_days : 0); // find the related configPlan

    var relatedConfigPlan = configPlans.find(function (configPlan) {
      var configPlanDeferredDays = (configPlan.deferredMonths ? configPlan.deferredMonths : 0) * 30 + (configPlan.deferredDays ? configPlan.deferredDays : 0);
      return plan.installments_count === configPlan.installmentsCount && eligibilityDeferredDays === configPlanDeferredDays;
    });
    return _extends({}, plan, {
      eligible: relatedConfigPlan ? plan.purchase_amount >= (relatedConfigPlan == null ? void 0 : relatedConfigPlan.minAmount) && plan.purchase_amount <= (relatedConfigPlan == null ? void 0 : relatedConfigPlan.maxAmount) : false,
      minAmount: relatedConfigPlan == null ? void 0 : relatedConfigPlan.minAmount,
      maxAmount: relatedConfigPlan == null ? void 0 : relatedConfigPlan.maxAmount
    });
  });
};

var useFetchEligibility = function useFetchEligibility(purchaseAmount, _ref, plans) {
  var domain = _ref.domain,
      merchantId = _ref.merchantId;

  var _useState = useState([]),
      eligibility = _useState[0],
      setEligibility = _useState[1];

  var _useState2 = useState(apiStatus.PENDING),
      status = _useState2[0],
      setStatus = _useState2[1];

  var configInstallments = plans == null ? void 0 : plans.map(function (plan) {
    return {
      installments_count: plan.installmentsCount,
      deferred_days: plan == null ? void 0 : plan.deferredDays,
      deferred_months: plan == null ? void 0 : plan.deferredMonths
    };
  });
  useEffect(function () {
    if (status === apiStatus.PENDING) {
      fetchFromApi(domain + '/v2/payments/eligibility', {
        purchase_amount: purchaseAmount,
        queries: configInstallments
      }, {
        Authorization: "Alma-Merchant-Auth " + merchantId
      }).then(function (res) {
        setEligibility(res);
        setStatus(apiStatus.SUCCESS);
      })["catch"](function () {
        setStatus(apiStatus.FAILED);
      });
    }
  }, [status]);
  return [filterELigibility(eligibility, plans), status];
};

var s = {"loadingIndicator":"_31lrj","letter":"_2p94X","loading-indicator-letter":"_229P7","bar":"_1k0PM","loading-indicator-bar":"_2cX7o"};

var LoadingIndicator = function LoadingIndicator(_ref) {
  var className = _ref.className;
  return /*#__PURE__*/React.createElement("div", {
    className: cx(s.loadingIndicator, className),
    "data-testid": "loader"
  }, /*#__PURE__*/React.createElement("div", {
    className: s.letter
  }, "a"), /*#__PURE__*/React.createElement("div", {
    className: s.bar
  }));
};

var s$1 = {"modal":"_D8SjB","content":"_ocM9x","contentScrollable":"_1GP2F","overlay":"_1yxCb","header":"_12LLh","closeButton":"_3YRro"};

function CrossIcon(_ref) {
  var _ref$color = _ref.color,
      color = _ref$color === void 0 ? '#fff' : _ref$color,
      className = _ref.className;
  return /*#__PURE__*/React.createElement("svg", {
    className: className,
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12.5964 11.404L9.41445 8.22205L12.5964 5.04007C12.7732 4.86329 12.7732 4.50974 12.5964 4.33296L11.8893 3.62585C11.6904 3.42698 11.359 3.44908 11.1822 3.62585L8.00023 6.80783L4.81825 3.62585C4.61938 3.42698 4.28792 3.44908 4.11114 3.62585L3.40404 4.33296C3.20516 4.53183 3.20516 4.84119 3.40404 5.04007L6.58602 8.22205L3.40404 11.404C3.20516 11.6029 3.20517 11.9123 3.40404 12.1111L4.11115 12.8182C4.28792 12.995 4.61938 13.0171 4.81825 12.8182L8.00023 9.63626L11.1822 12.8182C11.359 12.995 11.6904 13.0171 11.8893 12.8182L12.5964 12.1111C12.7732 11.9344 12.7732 11.5808 12.5964 11.404Z",
    fill: color
  }));
}

var ControlledModal = function ControlledModal(_ref) {
  var _cx;

  var children = _ref.children,
      isOpen = _ref.isOpen,
      onClose = _ref.onClose,
      className = _ref.className,
      contentClassName = _ref.contentClassName,
      _ref$scrollable = _ref.scrollable,
      scrollable = _ref$scrollable === void 0 ? false : _ref$scrollable,
      props = _objectWithoutPropertiesLoose(_ref, ["children", "isOpen", "onClose", "className", "contentClassName", "scrollable"]);

  Modal.setAppElement('body');
  return /*#__PURE__*/React.createElement(Modal, Object.assign({
    className: cx(s$1.modal, className),
    overlayClassName: s$1.overlay,
    onAfterOpen: function onAfterOpen() {
      noScroll.on();
    },
    onAfterClose: function onAfterClose() {
      noScroll.off();
    },
    onRequestClose: onClose,
    isOpen: isOpen,
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEsc: true
  }, props), /*#__PURE__*/React.createElement("div", {
    className: s$1.header
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: s$1.closeButton,
    "data-testid": "modal-close-button"
  }, /*#__PURE__*/React.createElement(CrossIcon, null))), /*#__PURE__*/React.createElement("div", {
    className: cx(s$1.content, contentClassName, (_cx = {}, _cx[s$1.contentScrollable] = scrollable, _cx))
  }, children));
};

var paymentPlanShorthandName = function paymentPlanShorthandName(payment) {
  var deferred_days = payment.deferred_days,
      deferred_months = payment.deferred_months,
      installmentsCount = payment.installments_count;
  var deferredDaysCount = deferred_days + deferred_months * 30;

  if (installmentsCount === 1) {
    return /*#__PURE__*/React.createElement(FormattedMessage, {
      id: "payment-plan-strings.day-abbreviation",
      defaultMessage: "J{numberOfDeferredDays}",
      values: {
        numberOfDeferredDays: deferredDaysCount > 0 ? "+" + deferredDaysCount : ''
      }
    });
  } else {
    return installmentsCount + "x";
  }
};
var paymentPlanInfoText = function paymentPlanInfoText(payment) {
  var deferred_days = payment.deferred_days,
      deferred_months = payment.deferred_months,
      installmentsCount = payment.installments_count,
      eligible = payment.eligible,
      purchaseAmount = payment.purchase_amount,
      _payment$minAmount = payment.minAmount,
      minAmount = _payment$minAmount === void 0 ? 0 : _payment$minAmount,
      _payment$maxAmount = payment.maxAmount,
      maxAmount = _payment$maxAmount === void 0 ? 0 : _payment$maxAmount;
  var deferredDaysCount = deferred_days + deferred_months * 30;

  var withNoFee = function withNoFee() {
    if (payment.payment_plan.every(function (plan) {
      return plan.customer_fee === 0 && plan.customer_interest === 0;
    })) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, ' ', /*#__PURE__*/React.createElement(FormattedMessage, {
        id: "payment-plan-strings.no-fee",
        defaultMessage: '(sans frais)'
      }));
    }
  };

  if (!eligible) {
    return purchaseAmount > maxAmount ? /*#__PURE__*/React.createElement(FormattedMessage, {
      id: "payment-plan-strings.ineligible-greater-than-max",
      defaultMessage: "Jusqu'\xE0 {maxAmount}",
      values: {
        maxAmount: /*#__PURE__*/React.createElement(FormattedNumber, {
          value: priceFromCents(maxAmount),
          style: "currency",
          currency: "EUR"
        })
      }
    }) : /*#__PURE__*/React.createElement(FormattedMessage, {
      id: "payment-plan-strings.ineligible-lower-than-min",
      defaultMessage: "\xC0 partir de {minAmount}",
      values: {
        minAmount: /*#__PURE__*/React.createElement(FormattedNumber, {
          value: priceFromCents(minAmount),
          style: "currency",
          currency: "EUR"
        })
      }
    });
  } else if (deferredDaysCount !== 0 && installmentsCount === 1) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FormattedMessage, {
      id: "payment-plan-strings.deferred",
      defaultMessage: "{totalAmount} \xE0 payer le {dueDate}",
      values: {
        totalAmount: /*#__PURE__*/React.createElement(FormattedNumber, {
          value: priceFromCents(payment.payment_plan[0].total_amount),
          style: "currency",
          currency: "EUR"
        }),
        dueDate: /*#__PURE__*/React.createElement(FormattedDate, {
          value: secondsToMilliseconds(payment.payment_plan[0].due_date),
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      }
    }), withNoFee());
  } else if (installmentsCount > 0) {
    var areInstallmentsOfSameAmount = payment.payment_plan.every(function (installment, index) {
      return index === 0 || installment.total_amount === payment.payment_plan[0].total_amount;
    });

    if (areInstallmentsOfSameAmount) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FormattedMessage, {
        id: "payment-plan-strings.multiple-installments-same-amount",
        defaultMessage: "{installmentsCount} x {totalAmount}",
        values: {
          totalAmount: /*#__PURE__*/React.createElement(FormattedNumber, {
            value: priceFromCents(payment.payment_plan[0].total_amount),
            style: "currency",
            currency: "EUR"
          }),
          installmentsCount: installmentsCount
        }
      }), withNoFee());
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FormattedMessage, {
      id: "payment-plan-strings.multiple-installments",
      defaultMessage: "{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}} other {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}}}",
      values: {
        firstInstallmentAmount: /*#__PURE__*/React.createElement(FormattedNumber, {
          value: priceFromCents(payment.payment_plan[0].total_amount),
          style: "currency",
          currency: "EUR"
        }),
        numberOfRemainingInstallments: installmentsCount - 1,
        othersInstallmentAmount: /*#__PURE__*/React.createElement(FormattedNumber, {
          value: priceFromCents(payment.payment_plan[1].total_amount),
          style: "currency",
          currency: "EUR"
        })
      }
    }), withNoFee());
  }

  return /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "payment-plan-strings.default-message",
    defaultMessage: "Payez en plusieurs fois avec Alma"
  });
};

var s$2 = {"buttons":"_1l2Oa","active":"_3rue7"};

var EligibilityPlansButtons = function EligibilityPlansButtons(_ref) {
  var eligibilityPlans = _ref.eligibilityPlans,
      currentPlanIndex = _ref.currentPlanIndex,
      setCurrentPlanIndex = _ref.setCurrentPlanIndex;
  return /*#__PURE__*/React.createElement("div", {
    className: s$2.buttons
  }, eligibilityPlans.map(function (eligibilityPlan, index) {
    var _cx;

    return /*#__PURE__*/React.createElement("button", {
      key: index,
      className: cx((_cx = {}, _cx[s$2.active] = index === currentPlanIndex, _cx)),
      onClick: function onClick() {
        return setCurrentPlanIndex(index);
      }
    }, paymentPlanShorthandName(eligibilityPlan));
  }));
};

var s$3 = {"schedule":"_MPKjS","scheduleLine":"_1A7Qv","total":"_14Ejo","creditCost":"_1ZIgu","creditMessage":"_1BUr8"};

var Schedule = function Schedule(_ref) {
  var currentPlan = _ref.currentPlan;
  var total = currentPlan && priceFromCents(currentPlan.purchase_amount + currentPlan.customer_total_cost_amount);
  var creditCost = currentPlan ? priceFromCents(currentPlan.customer_total_cost_amount) : 0;
  var TAEG = (currentPlan == null ? void 0 : currentPlan.annual_interest_rate) && currentPlan.annual_interest_rate / 10000;
  var customerFees = priceFromCents(currentPlan ? currentPlan.customer_total_cost_amount : 0);
  var isCredit = currentPlan && currentPlan.installments_count > 4;
  var intl = useIntl();
  return /*#__PURE__*/React.createElement("div", {
    className: s$3.schedule,
    "data-testid": "modal-installments-element"
  }, /*#__PURE__*/React.createElement("div", {
    className: cx(s$3.scheduleLine, s$3.total)
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.total",
    defaultMessage: "Total"
  })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(FormattedNumber, {
    value: total,
    style: "currency",
    currency: "EUR"
  }))), /*#__PURE__*/React.createElement("div", {
    className: cx(s$3.scheduleLine, s$3.creditCost)
  }, isCredit ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.credit-cost",
    defaultMessage: "Dont co\xFBt du cr\xE9dit"
  })) : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.cost",
    defaultMessage: "Dont frais"
  })), /*#__PURE__*/React.createElement("span", null, isCredit ? /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.credit-cost-amount",
    defaultMessage: "{creditCost} (TAEG {TAEG})",
    values: {
      creditCost: intl.formatNumber(creditCost, {
        style: 'currency',
        currency: 'EUR'
      }),
      TAEG: intl.formatNumber(TAEG != null ? TAEG : 0, {
        style: 'percent',
        maximumFractionDigits: 2
      })
    }
  }) : /*#__PURE__*/React.createElement(FormattedNumber, {
    value: customerFees,
    style: "currency",
    currency: "EUR"
  }))), ((currentPlan == null ? void 0 : currentPlan.payment_plan) || []).map(function (installment, index) {
    return /*#__PURE__*/React.createElement("div", {
      className: s$3.scheduleLine,
      key: index
    }, /*#__PURE__*/React.createElement("span", null, isToday(installment.due_date * 1000) ? /*#__PURE__*/React.createElement(FormattedMessage, {
      id: "installments.today",
      defaultMessage: "Aujourd'hui"
    }) : /*#__PURE__*/React.createElement(FormattedDate, {
      value: installment.due_date * 1000,
      day: "numeric",
      month: "long",
      year: "numeric"
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(FormattedNumber, {
      value: priceFromCents(installment.total_amount),
      style: "currency",
      currency: "EUR"
    })));
  }), isCredit && /*#__PURE__*/React.createElement("p", {
    className: s$3.creditMessage
  }, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.credit-commitment",
    defaultMessage: "Un cr\xE9dit vous engage et doit \xEAtre rembours\xE9. V\xE9rifiez vos capacit\xE9s de remboursement\n              avant de vous engager."
  })));
};

var s$4 = {"list":"_180ro","listItem":"_1HqCO","bullet":"_3B8wx"};

var Info = function Info() {
  return /*#__PURE__*/React.createElement("div", {
    className: s$4.list,
    "data-testid": "modal-info-element"
  }, /*#__PURE__*/React.createElement("div", {
    className: s$4.listItem
  }, /*#__PURE__*/React.createElement("div", {
    className: s$4.bullet
  }, "1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.bullet-1",
    defaultMessage: "Choisissez <strong>Alma</strong> au moment du paiement.",
    values: {
      strong: function strong() {
        return /*#__PURE__*/React.createElement("strong", null, [].slice.call(arguments));
      }
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: s$4.listItem
  }, /*#__PURE__*/React.createElement("div", {
    className: s$4.bullet
  }, "2"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.bullet-2",
    defaultMessage: "Renseignez les <strong>informations</strong> demand\xE9es.",
    values: {
      strong: function strong() {
        return /*#__PURE__*/React.createElement("strong", null, [].slice.call(arguments));
      }
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: s$4.listItem
  }, /*#__PURE__*/React.createElement("div", {
    className: s$4.bullet
  }, "3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.bullet-3",
    defaultMessage: "La validation de votre paiement <strong>instantan\xE9e</strong> !",
    values: {
      strong: function strong() {
        return /*#__PURE__*/React.createElement("strong", null, [].slice.call(arguments));
      }
    }
  }))));
};

function LogoIcon(_ref) {
  var _ref$color = _ref.color,
      color = _ref$color === void 0 ? '#00425D' : _ref$color,
      _ref$underlineColor = _ref.underlineColor,
      underlineColor = _ref$underlineColor === void 0 ? '#00425D' : _ref$underlineColor,
      className = _ref.className;
  return /*#__PURE__*/React.createElement("svg", {
    className: className,
    width: "35",
    height: "23",
    viewBox: "0 0 40 23",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6.38546 10.1313V10.029H4.92542C4.23835 10.029 3.72877 10.0972 3.39668 10.2337C3.07605 10.3587 2.91573 10.6374 2.91573 11.0695C2.91573 11.7177 3.37378 12.0418 4.28988 12.0418C5.05711 12.0418 5.59532 11.8826 5.9045 11.5642C6.22514 11.2344 6.38546 10.7568 6.38546 10.1313ZM3.72304 13.9182C2.64663 13.9182 1.85076 13.6567 1.33546 13.1335C0.820153 12.599 0.5625 11.911 0.5625 11.0695C0.5625 10.0574 0.894586 9.32958 1.55876 8.88606C2.22293 8.43118 3.23636 8.20374 4.59906 8.20374H6.38546V7.82846C6.38546 6.98693 5.84725 6.56616 4.77083 6.56616C3.80893 6.56616 3.27644 6.93007 3.17338 7.65788H0.768622C0.848781 6.78223 1.21522 6.04873 1.86794 5.45738C2.52066 4.86603 3.50547 4.57036 4.82236 4.57036C6.1278 4.57036 7.11261 4.86035 7.77678 5.44032C8.44095 6.0203 8.77304 6.83909 8.77304 7.89669V13.7135H6.60875V12.7241C6.09345 13.5202 5.13155 13.9182 3.72304 13.9182Z",
    fill: color
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.2554 11.6324V13.6965C14.0149 13.7306 13.763 13.7476 13.4996 13.7476C12.5492 13.7476 11.8736 13.5486 11.4728 13.1506C11.072 12.7412 10.8716 12.0873 10.8716 11.1889V0.919922H13.3107V11.0183C13.3107 11.2344 13.3508 11.3936 13.4309 11.496C13.5111 11.5983 13.6771 11.6495 13.929 11.6495C13.9863 11.6495 14.0493 11.6495 14.118 11.6495C14.1982 11.6381 14.244 11.6324 14.2554 11.6324Z",
    fill: color
  }), /*#__PURE__*/React.createElement("path", {
    d: "M23.8943 8.63019V13.7135H21.4552V8.40844C21.4552 7.23711 20.9742 6.65145 20.0123 6.65145C19.4512 6.65145 19.0161 6.82203 18.7069 7.16319C18.4092 7.50436 18.2603 7.9763 18.2603 8.57902V13.7135H15.8212V4.77506H18.0714V5.86678C18.5409 5.0025 19.4054 4.57036 20.6651 4.57036C21.856 4.57036 22.7263 4.99113 23.2759 5.83266C24.0432 4.99113 25.0394 4.57036 26.2647 4.57036C27.3182 4.57036 28.1255 4.89446 28.6867 5.54267C29.2478 6.19088 29.5283 7.05516 29.5283 8.13551V13.7135H27.0892V8.40844C27.0892 7.23711 26.6083 6.65145 25.6464 6.65145C25.0738 6.65145 24.6386 6.82772 24.3409 7.18025C24.0432 7.52141 23.8943 8.00473 23.8943 8.63019Z",
    fill: color
  }), /*#__PURE__*/React.createElement("path", {
    d: "M37.0321 10.1313V10.029H35.572C34.885 10.029 34.3754 10.0972 34.0433 10.2337C33.7227 10.3587 33.5623 10.6374 33.5623 11.0695C33.5623 11.7177 34.0204 12.0418 34.9365 12.0418C35.7037 12.0418 36.2419 11.8826 36.5511 11.5642C36.8717 11.2344 37.0321 10.7568 37.0321 10.1313ZM34.3696 13.9182C33.2932 13.9182 32.4974 13.6567 31.9821 13.1335C31.4668 12.599 31.2091 11.911 31.2091 11.0695C31.2091 10.0574 31.5412 9.32958 32.2054 8.88606C32.8695 8.43118 33.883 8.20374 35.2457 8.20374H37.0321V7.82846C37.0321 6.98693 36.4939 6.56616 35.4174 6.56616C34.4555 6.56616 33.923 6.93007 33.82 7.65788H31.4152C31.4954 6.78223 31.8618 6.04873 32.5145 5.45738C33.1673 4.86603 34.1521 4.57036 35.469 4.57036C36.7744 4.57036 37.7592 4.86035 38.4234 5.44032C39.0876 6.0203 39.4196 6.83909 39.4196 7.89669V13.7135H37.2554V12.7241C36.7401 13.5202 35.7781 13.9182 34.3696 13.9182Z",
    fill: color
  }), /*#__PURE__*/React.createElement("rect", {
    y: "20",
    width: "40",
    height: "3",
    fill: underlineColor
  }));
}

var s$5 = {"logo":"_3Oyv_"};

var Logo = function Logo() {
  return /*#__PURE__*/React.createElement("div", {
    className: s$5.logo
  }, /*#__PURE__*/React.createElement(LogoIcon, {
    underlineColor: "#FF414D"
  }));
};

var s$6 = {"title":"_3ERx-"};

var Title = function Title() {
  return /*#__PURE__*/React.createElement("div", {
    className: s$6.title,
    "data-testid": "modal-title-element"
  }, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.title",
    defaultMessage: "<highlighted>Payez en plusieurs fois</highlighted> ou plus tard par carte bancaire avec Alma.",
    values: {
      highlighted: function highlighted() {
        return /*#__PURE__*/React.createElement("span", null, [].slice.call(arguments));
      }
    }
  }));
};

var s$7 = {"container":"_21g6u","block":"_3zaP5","left":"_2SBRC"};

var DesktopModal = function DesktopModal(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/React.createElement("div", {
    className: s$7.container,
    "data-testid": "modal-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: cx([s$7.block, s$7.left])
  }, /*#__PURE__*/React.createElement(Title, null), /*#__PURE__*/React.createElement(Info, null), /*#__PURE__*/React.createElement(Logo, null)), /*#__PURE__*/React.createElement("div", {
    className: s$7.block
  }, children));
};

var s$8 = {"noEligibility":"_17qNJ","loader":"_2oTJq"};

var s$9 = {"container":"_2G7Ch"};

var MobileModal = function MobileModal(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/React.createElement("div", {
    className: s$9.container,
    "data-testid": "modal-container"
  }, /*#__PURE__*/React.createElement(Title, null), children, /*#__PURE__*/React.createElement(Info, null), /*#__PURE__*/React.createElement(Logo, null));
};

var EligibilityModal = function EligibilityModal(_ref) {
  var initialPlanIndex = _ref.initialPlanIndex,
      onClose = _ref.onClose,
      eligibilityPlans = _ref.eligibilityPlans,
      status = _ref.status;

  var _useState = useState(initialPlanIndex || 0),
      currentPlanIndex = _useState[0],
      setCurrentPlanIndex = _useState[1];

  var isBigScreen = useMediaQuery({
    minWidth: 800
  });
  var ModalComponent = isBigScreen ? DesktopModal : MobileModal;
  var eligiblePlans = eligibilityPlans.filter(function (plan) {
    return plan.eligible;
  });
  var currentPlan = eligiblePlans[currentPlanIndex];
  var modalProps = {
    eligibilityPlans: eligiblePlans,
    currentPlanIndex: currentPlanIndex,
    setCurrentPlanIndex: setCurrentPlanIndex,
    currentPlan: currentPlan,
    status: status
  };
  return /*#__PURE__*/React.createElement(ControlledModal, {
    onClose: onClose,
    ariaHideApp: false,
    scrollable: true,
    isOpen: true
  }, /*#__PURE__*/React.createElement(ModalComponent, Object.assign({}, modalProps), status === apiStatus.PENDING && /*#__PURE__*/React.createElement("div", {
    className: s$8.loader
  }, /*#__PURE__*/React.createElement(LoadingIndicator, null)), status === apiStatus.SUCCESS && eligiblePlans.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: s$8.noEligibility
  }, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "eligibility-modal.no-eligibility",
    defaultMessage: "Oups, il semblerait que la simulation n'aie pas fonctionn\xE9."
  })), status === apiStatus.SUCCESS && eligiblePlans.length >= 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(EligibilityPlansButtons, {
    eligibilityPlans: eligiblePlans,
    currentPlanIndex: currentPlanIndex,
    setCurrentPlanIndex: setCurrentPlanIndex
  }), /*#__PURE__*/React.createElement(Schedule, {
    currentPlan: currentPlan
  }))));
};

/**
 * This component allows to display only the modal, without PaymentPlans.
 */

var ModalContainer = function ModalContainer(_ref) {
  var purchaseAmount = _ref.purchaseAmount,
      apiData = _ref.apiData,
      configPlans = _ref.configPlans,
      onClose = _ref.onClose;

  var _useFetchEligibility = useFetchEligibility(purchaseAmount, apiData, configPlans),
      eligibilityPlans = _useFetchEligibility[0],
      status = _useFetchEligibility[1];

  return /*#__PURE__*/React.createElement(EligibilityModal, {
    initialPlanIndex: 0,
    onClose: onClose,
    eligibilityPlans: eligibilityPlans,
    status: status
  });
};

var s$a = {"loadingIndicator":"_2SwwZ","line1":"_2qODo","line2":"_2YO01"};

var Loader = function Loader(_ref) {
  var className = _ref.className;
  return /*#__PURE__*/React.createElement("div", {
    className: cx(s$a.loadingIndicator, className),
    "data-testid": "loader"
  }, /*#__PURE__*/React.createElement("div", {
    className: s$a.line1
  }), /*#__PURE__*/React.createElement("div", {
    className: s$a.line2
  }));
};

var useButtonAnimation = function useButtonAnimation(iterateValues, transitionDelay) {
  var _useState = useState(0),
      current = _useState[0],
      setCurrent = _useState[1];

  var _useState2 = useState(true),
      update = _useState2[0],
      setUpdate = _useState2[1];

  useEffect(function () {
    var isMounted = true;

    if (iterateValues.length !== 0) {
      if (!iterateValues.includes(current) && update) setCurrent(iterateValues[0]);
      setTimeout(function () {
        if (update && isMounted) {
          setCurrent(iterateValues[iterateValues.includes(current) ? (iterateValues.indexOf(current) + 1) % iterateValues.length : 0]);
        }
      }, transitionDelay);
    }

    return function () {
      isMounted = false;
    };
  }, [iterateValues, current]);
  return {
    current: current,
    onHover: function onHover(current) {
      setCurrent(current);
      setUpdate(false);
    },
    onLeave: function onLeave() {
      setUpdate(true);
    }
  };
};

/**
 * It returns the **index** of the **first eligible plan** that matches the default installments count
 *
 * @param {number | number[]} suggestedPaymentPlan
 * @param {EligibilityPlan[]} eligibilityPlans
 * @returns number (index of the first eligible plan that matches the default installments count)
 */
var getIndexOfActivePlan = function getIndexOfActivePlan(_ref) {
  var suggestedPaymentPlan = _ref.suggestedPaymentPlan,
      eligibilityPlans = _ref.eligibilityPlans;
  var suggestedPaymentPlanArray = Array.isArray(suggestedPaymentPlan) ? suggestedPaymentPlan : [suggestedPaymentPlan];

  var _loop = function _loop(index) {
    var installmentsCount = suggestedPaymentPlanArray[index];
    var planFound = eligibilityPlans.findIndex(function (plan) {
      return plan.installments_count === installmentsCount && plan.eligible;
    });

    if (planFound !== -1) {
      return {
        v: planFound
      };
    }
  };

  for (var index in suggestedPaymentPlanArray) {
    var _ret = _loop(index);

    if (typeof _ret === "object") return _ret.v;
  }

  return 0;
};

var s$b = {"widgetButton":"_TSkFv","logo":"_LJ4nZ","primaryContainer":"_bMClc","paymentPlans":"_17c_S","plan":"_2Kqjn","active":"_3dG_J","notEligible":"_3O1bg","info":"_25GrF","loader":"_30j1O","error":"_R0YlN","errorText":"_2kGhu","errorButton":"_73d_Y","pending":"_1ZDMS","clickable":"_UksZa","unClickable":"_1lr-q"};

var VERY_LONG_TIME_IN_MS = 1000 * 3600 * 24 * 365;
var DEFAULT_TRANSITION_TIME = 5500;

var PaymentPlanWidget = function PaymentPlanWidget(_ref) {
  var _cx, _cx3;

  var purchaseAmount = _ref.purchaseAmount,
      apiData = _ref.apiData,
      configPlans = _ref.configPlans,
      transitionDelay = _ref.transitionDelay,
      hideIfNotEligible = _ref.hideIfNotEligible,
      suggestedPaymentPlan = _ref.suggestedPaymentPlan;

  var _useFetchEligibility = useFetchEligibility(purchaseAmount, apiData, configPlans),
      eligibilityPlans = _useFetchEligibility[0],
      status = _useFetchEligibility[1];

  var eligiblePlans = eligibilityPlans.filter(function (plan) {
    return plan.eligible;
  });
  var activePlanIndex = getIndexOfActivePlan({
    eligibilityPlans: eligibilityPlans,
    suggestedPaymentPlan: suggestedPaymentPlan != null ? suggestedPaymentPlan : 0
  });
  var isSuggestedPaymentPlanSpecified = suggestedPaymentPlan !== undefined; // 👈  The merchant decided to focus a tab and remove animated transition.

  var isTransitionSpecified = transitionDelay !== undefined; // 👈  The merchant has specified a transition time

  var _useState = useState(false),
      isOpen = _useState[0],
      setIsOpen = _useState[1];

  var openModal = function openModal() {
    return setIsOpen(true);
  };

  var closeModal = function closeModal() {
    return setIsOpen(false);
  };

  var eligiblePlanKeys = eligibilityPlans.reduce(function (acc, plan, index) {
    return plan.eligible ? [].concat(acc, [index]) : acc;
  }, []);
  /**
   * If merchand specify a suggestedPaymentPlan and no transition, we set a very long transition delay.
   * Otherwise, we set the transition delay specified by the merchant.
   * If none of those properties are specified, we set a default transition delay.
   * @returns
   */

  var realTransitionTime = function realTransitionTime() {
    if (isTransitionSpecified) {
      return transitionDelay != null ? transitionDelay : DEFAULT_TRANSITION_TIME;
    }

    if (isSuggestedPaymentPlanSpecified) {
      return VERY_LONG_TIME_IN_MS;
    }

    return DEFAULT_TRANSITION_TIME;
  };

  var _useButtonAnimation = useButtonAnimation(eligiblePlanKeys, realTransitionTime()),
      current = _useButtonAnimation.current,
      onHover = _useButtonAnimation.onHover,
      onLeave = _useButtonAnimation.onLeave;

  useEffect(function () {
    // When API has given a response AND the marchand set an active plan by default.
    if (status === apiStatus.SUCCESS && isSuggestedPaymentPlanSpecified) {
      onHover(activePlanIndex); // We select the first active plan possible

      onLeave(); // We need to call onLeave to reset the animation
    }
  }, [status]);
  /**
   * It takes a plan index and returns the index of that plan within the eligible plans
   *
   * @param {number} planIndex - The index of the plan that the user has selected.
   * @returns The index of the planKey in the eligiblePlanKeys array.
   */

  var getIndexWithinEligiblePlans = function getIndexWithinEligiblePlans(planIndex) {
    var index = eligiblePlanKeys.findIndex(function (planKey) {
      return planKey === planIndex;
    });
    return index === -1 ? 0 : index;
  };

  if (status === apiStatus.PENDING) {
    return /*#__PURE__*/React.createElement("div", {
      className: cx(s$b.widgetButton, s$b.pending)
    }, /*#__PURE__*/React.createElement(Loader, null));
  }

  if (hideIfNotEligible && eligiblePlans.length === 0 || eligibilityPlans.length === 0 || status === apiStatus.FAILED) {
    return null;
  }

  var handleOpenModal = function handleOpenModal(e) {
    e.preventDefault();

    if (eligiblePlans.length > 0) {
      openModal();
    }
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: handleOpenModal,
    className: cx(s$b.widgetButton, (_cx = {}, _cx[s$b.clickable] = eligiblePlans.length > 0, _cx[s$b.unClickable] = eligiblePlans.length === 0, _cx)),
    "data-testid": "widget-button"
  }, /*#__PURE__*/React.createElement("div", {
    className: s$b.primaryContainer
  }, /*#__PURE__*/React.createElement(LogoIcon, {
    className: s$b.logo
  }), /*#__PURE__*/React.createElement("div", {
    className: s$b.paymentPlans
  }, eligibilityPlans.map(function (eligibilityPlan, key) {
    var _cx2;

    return /*#__PURE__*/React.createElement("div", {
      key: key,
      onMouseEnter: function onMouseEnter() {
        return onHover(key);
      },
      onMouseOut: onLeave,
      className: cx(s$b.plan, (_cx2 = {}, _cx2[s$b.active] = current === key, _cx2[s$b.notEligible] = !eligibilityPlan.eligible, _cx2))
    }, paymentPlanShorthandName(eligibilityPlan));
  }))), /*#__PURE__*/React.createElement("div", {
    className: cx(s$b.info, (_cx3 = {}, _cx3[s$b.notEligible] = eligibilityPlans[current] && !eligibilityPlans[current].eligible, _cx3))
  }, eligibilityPlans.length !== 0 && paymentPlanInfoText(eligibilityPlans[current]))), isOpen && /*#__PURE__*/React.createElement(EligibilityModal, {
    initialPlanIndex: getIndexWithinEligiblePlans(current),
    onClose: closeModal,
    eligibilityPlans: eligiblePlans,
    status: status
  }));
};

var WidgetsController = /*#__PURE__*/function () {
  function WidgetsController(apiData) {
    this.apiData = apiData;
  }

  var _proto = WidgetsController.prototype;

  _proto.add = function add(widget, options) {
    var _this = this;

    var containerDiv = document.querySelector(options.container);

    if (containerDiv) {
      unmountComponentAtNode(containerDiv);
    }

    if (widget === widgetTypes.PaymentPlans) {
      var container = options.container,
          purchaseAmount = options.purchaseAmount,
          plans = options.plans,
          transitionDelay = options.transitionDelay,
          hideIfNotEligible = options.hideIfNotEligible,
          suggestedPaymentPlan = options.suggestedPaymentPlan,
          _options$locale = options.locale,
          locale = _options$locale === void 0 ? Locale.en : _options$locale;

      if (containerDiv) {
        render( /*#__PURE__*/React.createElement(Provider, {
          locale: locale
        }, /*#__PURE__*/React.createElement(PaymentPlanWidget, {
          purchaseAmount: purchaseAmount,
          apiData: this.apiData,
          configPlans: plans,
          transitionDelay: transitionDelay,
          hideIfNotEligible: hideIfNotEligible,
          suggestedPaymentPlan: suggestedPaymentPlan
        })), document.querySelector(container));
      }
    }

    if (widget === widgetTypes.Modal) {
      var _container = options.container,
          clickableSelector = options.clickableSelector,
          _purchaseAmount = options.purchaseAmount,
          _plans = options.plans,
          _options$locale2 = options.locale,
          _locale = _options$locale2 === void 0 ? Locale.en : _options$locale2;

      var close = function close() {
        return containerDiv && unmountComponentAtNode(containerDiv);
      };

      var renderModal = function renderModal() {
        render( /*#__PURE__*/React.createElement(Provider, {
          locale: _locale
        }, /*#__PURE__*/React.createElement(ModalContainer, {
          purchaseAmount: _purchaseAmount,
          apiData: _this.apiData,
          configPlans: _plans,
          onClose: close
        })), document.querySelector(_container));
      }; // if clickableSelector is provided, add an onClick event handler to open the Modal.


      if (clickableSelector) {
        var _document$querySelect;

        (_document$querySelect = document.querySelector(clickableSelector)) == null ? void 0 : _document$querySelect.addEventListener('click', renderModal, false);
      }

      return {
        open: renderModal,
        close: close
      };
    }
  };

  return WidgetsController;
}();

var ApiMode;

(function (ApiMode) {
  ApiMode["LIVE"] = "https://api.getalma.eu";
  ApiMode["TEST"] = "https://api.sandbox.getalma.eu";
})(ApiMode || (ApiMode = {}));

var Widgets;

(function (Widgets) {
  function initialize(merchantId, mode) {
    return new WidgetsController({
      domain: mode,
      merchantId: merchantId
    });
  }

  Widgets.initialize = initialize;
  Widgets.PaymentPlans = widgetTypes.PaymentPlans;
  Widgets.Modal = widgetTypes.Modal;
})(Widgets || (Widgets = {})); // eslint-disable-next-line @typescript-eslint/no-namespace


var Utils;

(function (Utils) {
  Utils.priceToCents = priceToCents;
  Utils.priceFromCents = priceFromCents;
  Utils.formatCents = formatCents;
})(Utils || (Utils = {}));

export { ApiMode, Utils, Widgets };
//# sourceMappingURL=widgets.m.js.map
