function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
const GLOBALS_WHITE_LISTED = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt";
const isGloballyWhitelisted = /* @__PURE__ */ makeMap(GLOBALS_WHITE_LISTED);
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function normalizeStyle(value) {
  if (isArray$2(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString$1(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString$1(value)) {
    return value;
  } else if (isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:(.+)/;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString$1(value)) {
    res = value;
  } else if (isArray$2(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
function normalizeProps(props) {
  if (!props)
    return null;
  let { class: klass, style } = props;
  if (klass && !isString$1(klass)) {
    props.class = normalizeClass(klass);
  }
  if (style) {
    props.style = normalizeStyle(style);
  }
  return props;
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length)
    return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseEqual(a, b) {
  if (a === b)
    return true;
  let aValidType = isDate$1(a);
  let bValidType = isDate$1(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray$2(a);
  bValidType = isArray$2(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject$1(a);
  bValidType = isObject$1(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const toDisplayString = (val) => {
  return isString$1(val) ? val : val == null ? "" : isArray$2(val) || isObject$1(val) && (val.toString === objectToString || !isFunction$1(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2]) => {
        entries[`${key} =>`] = val2;
        return entries;
      }, {})
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()]
    };
  } else if (isObject$1(val) && !isArray$2(val) && !isPlainObject$2(val)) {
    return String(val);
  }
  return val;
};
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend$2 = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray$2 = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate$1 = (val) => toTypeString(val) === "[object Date]";
const isFunction$1 = (val) => typeof val === "function";
const isString$1 = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return isObject$1(val) && isFunction$1(val.then) && isFunction$1(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject$2 = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString$1(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const toNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    this.active = true;
    this.effects = [];
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
    }
  }
  run(fn) {
    if (this.active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  on() {
    activeEffectScope = this;
  }
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this.active) {
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
      this.active = false;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function recordEffectScope(effect2, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect2);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
function onScopeDispose(fn) {
  if (activeEffectScope) {
    activeEffectScope.cleanups.push(fn);
  }
}
const createDep = (effects) => {
  const dep = new Set(effects);
  dep.w = 0;
  dep.n = 0;
  return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].w |= trackOpBit;
    }
  }
};
const finalizeDepMarkers = (effect2) => {
  const { deps } = effect2;
  if (deps.length) {
    let ptr = 0;
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];
      if (wasTracked(dep) && !newTracked(dep)) {
        dep.delete(effect2);
      } else {
        deps[ptr++] = dep;
      }
      dep.w &= ~trackOpBit;
      dep.n &= ~trackOpBit;
    }
    deps.length = ptr;
  }
};
const targetMap = /* @__PURE__ */ new WeakMap();
let effectTrackDepth = 0;
let trackOpBit = 1;
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
class ReactiveEffect {
  constructor(fn, scheduler = null, scope) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this.parent = void 0;
    recordEffectScope(this, scope);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let parent = activeEffect;
    let lastShouldTrack = shouldTrack;
    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      shouldTrack = true;
      trackOpBit = 1 << ++effectTrackDepth;
      if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this);
      } else {
        cleanupEffect(this);
      }
      return this.fn();
    } finally {
      if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this);
      }
      trackOpBit = 1 << --effectTrackDepth;
      activeEffect = this.parent;
      shouldTrack = lastShouldTrack;
      this.parent = void 0;
      if (this.deferStop) {
        this.stop();
      }
    }
  }
  stop() {
    if (activeEffect === this) {
      this.deferStop = true;
    } else if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
function cleanupEffect(effect2) {
  const { deps } = effect2;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    deps.length = 0;
  }
}
function effect(fn, options) {
  if (fn.effect) {
    fn = fn.effect.fn;
  }
  const _effect = new ReactiveEffect(fn);
  if (options) {
    extend$2(_effect, options);
    if (options.scope)
      recordEffectScope(_effect, options.scope);
  }
  if (!options || !options.lazy) {
    _effect.run();
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
function stop(runner) {
  runner.effect.stop();
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep());
    }
    trackEffects(dep);
  }
}
function trackEffects(dep, debuggerEventExtraInfo) {
  let shouldTrack2 = false;
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit;
      shouldTrack2 = !wasTracked(dep);
    }
  } else {
    shouldTrack2 = !dep.has(activeEffect);
  }
  if (shouldTrack2) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray$2(target)) {
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || key2 >= newValue) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray$2(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray$2(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  if (deps.length === 1) {
    if (deps[0]) {
      {
        triggerEffects(deps[0]);
      }
    }
  } else {
    const effects = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    {
      triggerEffects(createDep(effects));
    }
  }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
  const effects = isArray$2(dep) ? dep : [...dep];
  for (const effect2 of effects) {
    if (effect2.computed) {
      triggerEffect(effect2);
    }
  }
  for (const effect2 of effects) {
    if (!effect2.computed) {
      triggerEffect(effect2);
    }
  }
}
function triggerEffect(effect2, debuggerEventExtraInfo) {
  if (effect2 !== activeEffect || effect2.allowRecurse) {
    if (effect2.scheduler) {
      effect2.scheduler();
    } else {
      effect2.run();
    }
  }
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
const get = /* @__PURE__ */ createGetter();
const shallowGet = /* @__PURE__ */ createGetter(false, true);
const readonlyGet = /* @__PURE__ */ createGetter(true);
const shallowReadonlyGet = /* @__PURE__ */ createGetter(true, true);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      const res = toRaw(this)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function createGetter(isReadonly2 = false, shallow = false) {
  return function get2(target, key, receiver) {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return shallow;
    } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
      return target;
    }
    const targetIsArray = isArray$2(target);
    if (!isReadonly2 && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$1(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  };
}
const set = /* @__PURE__ */ createSetter();
const shallowSet = /* @__PURE__ */ createSetter(true);
function createSetter(shallow = false) {
  return function set2(target, key, value, receiver) {
    let oldValue = target[key];
    if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
      return false;
    }
    if (!shallow) {
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray$2(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArray$2(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  };
}
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  target[key];
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function has(target, key) {
  const result = Reflect.has(target, key);
  if (!isSymbol(key) || !builtInSymbols.has(key)) {
    track(target, "has", key);
  }
  return result;
}
function ownKeys(target) {
  track(target, "iterate", isArray$2(target) ? "length" : ITERATE_KEY);
  return Reflect.ownKeys(target);
}
const mutableHandlers = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
};
const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    return true;
  },
  deleteProperty(target, key) {
    return true;
  }
};
const shallowReactiveHandlers = /* @__PURE__ */ extend$2({}, mutableHandlers, {
  get: shallowGet,
  set: shallowSet
});
const shallowReadonlyHandlers = /* @__PURE__ */ extend$2({}, readonlyHandlers, {
  get: shallowReadonlyGet
});
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get$1(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (key !== rawKey) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has$1(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (key !== rawKey) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  const oldValue = get2.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  get2 ? get2.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach2(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
    return {
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get$1(this, key);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get$1(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$1(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  def(value, "__v_skip", true);
  return value;
}
const toReactive = (value) => isObject$1(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$1(value) ? readonly(value) : value;
function trackRefValue(ref2) {
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    {
      trackEffects(ref2.dep || (ref2.dep = createDep()));
    }
  }
}
function triggerRefValue(ref2, newVal) {
  ref2 = toRaw(ref2);
  if (ref2.dep) {
    {
      triggerEffects(ref2.dep);
    }
  }
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function shallowRef(value) {
  return createRef(value, true);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this);
    }
  }
}
function triggerRef(ref2) {
  triggerRefValue(ref2);
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class CustomRefImpl {
  constructor(factory) {
    this.dep = void 0;
    this.__v_isRef = true;
    const { get: get2, set: set2 } = factory(() => trackRefValue(this), () => triggerRefValue(this));
    this._get = get2;
    this._set = set2;
  }
  get value() {
    return this._get();
  }
  set value(newVal) {
    this._set(newVal);
  }
}
function customRef(factory) {
  return new CustomRefImpl(factory);
}
function toRefs(object) {
  const ret = isArray$2(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
class ObjectRefImpl {
  constructor(_object, _key, _defaultValue) {
    this._object = _object;
    this._key = _key;
    this._defaultValue = _defaultValue;
    this.__v_isRef = true;
  }
  get value() {
    const val = this._object[this._key];
    return val === void 0 ? this._defaultValue : val;
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}
function toRef(object, key, defaultValue) {
  const val = object[key];
  return isRef(val) ? val : new ObjectRefImpl(object, key, defaultValue);
}
var _a;
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this[_a] = false;
    this._dirty = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    trackRefValue(self2);
    if (self2._dirty || !self2._cacheable) {
      self2._dirty = false;
      self2._value = self2.effect.run();
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
}
_a = "__v_isReadonly";
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction$1(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
const stack = [];
function warn(msg, ...args) {
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(appWarnHandler, instance, 11, [
      msg + args.join(""),
      instance && instance.proxy,
      trace.map(({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`).join("\n"),
      trace
    ]);
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open2 = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
  const close = `>` + postfix;
  return vnode.props ? [open2, ...formatProps(vnode.props), close] : [open2 + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString$1(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction$1(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  let res;
  try {
    res = args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
  return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction$1(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  const values = [];
  for (let i = 0; i < fn.length; i++) {
    values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
  }
  return values;
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = type;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      callWithErrorHandling(appErrorHandler, null, 10, [err, exposedInstance, errorInfo]);
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    console.error(err);
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJobId = getId(queue[middle]);
    middleJobId < id ? start = middle + 1 : end = middle;
  }
  return start;
}
function queueJob(job) {
  if (!queue.length || !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function invalidateJob(job) {
  const i = queue.indexOf(job);
  if (i > flushIndex) {
    queue.splice(i, 1);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray$2(cb)) {
    if (!activePostFlushCbs || !activePostFlushCbs.includes(cb, cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex)) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(seen, i = isFlushing ? flushIndex + 1 : 0) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.pre) {
      queue.splice(i, 1);
      i--;
      cb();
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)];
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a, b) => {
  const diff = getId(a) - getId(b);
  if (diff === 0) {
    if (a.pre && !b.pre)
      return -1;
    if (b.pre && !a.pre)
      return 1;
  }
  return diff;
};
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  queue.sort(comparator);
  const check = NOOP;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && job.active !== false) {
        if (false)
          ;
        callWithErrorHandling(job, null, 14);
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs();
    isFlushing = false;
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
let devtools;
let buffer = [];
function setDevtoolsHook(hook, target) {
  var _a2, _b;
  devtools = hook;
  if (devtools) {
    devtools.enabled = true;
    buffer.forEach(({ event, args }) => devtools.emit(event, ...args));
    buffer = [];
  } else if (typeof window !== "undefined" && window.HTMLElement && !((_b = (_a2 = window.navigator) === null || _a2 === void 0 ? void 0 : _a2.userAgent) === null || _b === void 0 ? void 0 : _b.includes("jsdom"))) {
    const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
    replay.push((newHook) => {
      setDevtoolsHook(newHook, target);
    });
    setTimeout(() => {
      if (!devtools) {
        target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
        buffer = [];
      }
    }, 3e3);
  } else {
    buffer = [];
  }
}
function emit$1(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim: trim2 } = props[modifiersKey] || EMPTY_OBJ;
    if (trim2) {
      args = rawArgs.map((a) => a.trim());
    }
    if (number) {
      args = rawArgs.map(toNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(handler, instance, 6, args);
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(onceHandler, instance, 6, args);
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend$2(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray$2(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend$2(normalized, raw);
  }
  if (isObject$1(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function pushScopeId(id) {
  currentScopeId = id;
}
function popScopeId() {
  currentScopeId = null;
}
const withScopeId = (_id) => withCtx;
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx)
    return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render: render2, renderCache, data, setupState, ctx, inheritAttrs } = instance;
  let result;
  let fallthroughAttrs;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      result = normalizeVNode(render2.call(proxyToUse, proxyToUse, renderCache, props, setupState, data, ctx));
      fallthroughAttrs = attrs;
    } else {
      const render3 = Component;
      if (false)
        ;
      result = normalizeVNode(render3.length > 1 ? render3(props, false ? {
        get attrs() {
          markAttrsAccessed();
          return attrs;
        },
        slots,
        emit
      } : { attrs, slots, emit }) : render3(props, null));
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
        }
        root = cloneVNode(root, fallthroughAttrs);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    root.transition = vnode.transition;
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
function filterSingleRoot(children) {
  let singleRoot;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isVNode(child)) {
      if (child.type !== Comment || child.children === "v-if") {
        if (singleRoot) {
          return;
        } else {
          singleRoot = child;
        }
      }
    } else {
      return;
    }
  }
  return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent && parent.subTree === vnode) {
    (vnode = parent.vnode).el = el;
    parent = parent.parent;
  }
}
const isSuspense = (type) => type.__isSuspense;
const SuspenseImpl = {
  name: "Suspense",
  __isSuspense: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals) {
    if (n1 == null) {
      mountSuspense(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals);
    } else {
      patchSuspense(n1, n2, container, anchor, parentComponent, isSVG, slotScopeIds, optimized, rendererInternals);
    }
  },
  hydrate: hydrateSuspense,
  create: createSuspenseBoundary,
  normalize: normalizeSuspenseChildren
};
const Suspense = SuspenseImpl;
function triggerEvent(vnode, name) {
  const eventListener = vnode.props && vnode.props[name];
  if (isFunction$1(eventListener)) {
    eventListener();
  }
}
function mountSuspense(vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals) {
  const { p: patch, o: { createElement } } = rendererInternals;
  const hiddenContainer = createElement("div");
  const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, container, hiddenContainer, anchor, isSVG, slotScopeIds, optimized, rendererInternals);
  patch(null, suspense.pendingBranch = vnode.ssContent, hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds);
  if (suspense.deps > 0) {
    triggerEvent(vnode, "onPending");
    triggerEvent(vnode, "onFallback");
    patch(
      null,
      vnode.ssFallback,
      container,
      anchor,
      parentComponent,
      null,
      isSVG,
      slotScopeIds
    );
    setActiveBranch(suspense, vnode.ssFallback);
  } else {
    suspense.resolve();
  }
}
function patchSuspense(n1, n2, container, anchor, parentComponent, isSVG, slotScopeIds, optimized, { p: patch, um: unmount, o: { createElement } }) {
  const suspense = n2.suspense = n1.suspense;
  suspense.vnode = n2;
  n2.el = n1.el;
  const newBranch = n2.ssContent;
  const newFallback = n2.ssFallback;
  const { activeBranch, pendingBranch, isInFallback, isHydrating } = suspense;
  if (pendingBranch) {
    suspense.pendingBranch = newBranch;
    if (isSameVNodeType(newBranch, pendingBranch)) {
      patch(pendingBranch, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
      if (suspense.deps <= 0) {
        suspense.resolve();
      } else if (isInFallback) {
        patch(
          activeBranch,
          newFallback,
          container,
          anchor,
          parentComponent,
          null,
          isSVG,
          slotScopeIds,
          optimized
        );
        setActiveBranch(suspense, newFallback);
      }
    } else {
      suspense.pendingId++;
      if (isHydrating) {
        suspense.isHydrating = false;
        suspense.activeBranch = pendingBranch;
      } else {
        unmount(pendingBranch, parentComponent, suspense);
      }
      suspense.deps = 0;
      suspense.effects.length = 0;
      suspense.hiddenContainer = createElement("div");
      if (isInFallback) {
        patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
        if (suspense.deps <= 0) {
          suspense.resolve();
        } else {
          patch(
            activeBranch,
            newFallback,
            container,
            anchor,
            parentComponent,
            null,
            isSVG,
            slotScopeIds,
            optimized
          );
          setActiveBranch(suspense, newFallback);
        }
      } else if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
        patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, isSVG, slotScopeIds, optimized);
        suspense.resolve(true);
      } else {
        patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
        if (suspense.deps <= 0) {
          suspense.resolve();
        }
      }
    }
  } else {
    if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
      patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, isSVG, slotScopeIds, optimized);
      setActiveBranch(suspense, newBranch);
    } else {
      triggerEvent(n2, "onPending");
      suspense.pendingBranch = newBranch;
      suspense.pendingId++;
      patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
      if (suspense.deps <= 0) {
        suspense.resolve();
      } else {
        const { timeout, pendingId } = suspense;
        if (timeout > 0) {
          setTimeout(() => {
            if (suspense.pendingId === pendingId) {
              suspense.fallback(newFallback);
            }
          }, timeout);
        } else if (timeout === 0) {
          suspense.fallback(newFallback);
        }
      }
    }
  }
}
function createSuspenseBoundary(vnode, parent, parentComponent, container, hiddenContainer, anchor, isSVG, slotScopeIds, optimized, rendererInternals, isHydrating = false) {
  const { p: patch, m: move, um: unmount, n: next, o: { parentNode, remove: remove2 } } = rendererInternals;
  const timeout = toNumber(vnode.props && vnode.props.timeout);
  const suspense = {
    vnode,
    parent,
    parentComponent,
    isSVG,
    container,
    hiddenContainer,
    anchor,
    deps: 0,
    pendingId: 0,
    timeout: typeof timeout === "number" ? timeout : -1,
    activeBranch: null,
    pendingBranch: null,
    isInFallback: true,
    isHydrating,
    isUnmounted: false,
    effects: [],
    resolve(resume = false) {
      const { vnode: vnode2, activeBranch, pendingBranch, pendingId, effects, parentComponent: parentComponent2, container: container2 } = suspense;
      if (suspense.isHydrating) {
        suspense.isHydrating = false;
      } else if (!resume) {
        const delayEnter = activeBranch && pendingBranch.transition && pendingBranch.transition.mode === "out-in";
        if (delayEnter) {
          activeBranch.transition.afterLeave = () => {
            if (pendingId === suspense.pendingId) {
              move(pendingBranch, container2, anchor2, 0);
            }
          };
        }
        let { anchor: anchor2 } = suspense;
        if (activeBranch) {
          anchor2 = next(activeBranch);
          unmount(activeBranch, parentComponent2, suspense, true);
        }
        if (!delayEnter) {
          move(pendingBranch, container2, anchor2, 0);
        }
      }
      setActiveBranch(suspense, pendingBranch);
      suspense.pendingBranch = null;
      suspense.isInFallback = false;
      let parent2 = suspense.parent;
      let hasUnresolvedAncestor = false;
      while (parent2) {
        if (parent2.pendingBranch) {
          parent2.effects.push(...effects);
          hasUnresolvedAncestor = true;
          break;
        }
        parent2 = parent2.parent;
      }
      if (!hasUnresolvedAncestor) {
        queuePostFlushCb(effects);
      }
      suspense.effects = [];
      triggerEvent(vnode2, "onResolve");
    },
    fallback(fallbackVNode) {
      if (!suspense.pendingBranch) {
        return;
      }
      const { vnode: vnode2, activeBranch, parentComponent: parentComponent2, container: container2, isSVG: isSVG2 } = suspense;
      triggerEvent(vnode2, "onFallback");
      const anchor2 = next(activeBranch);
      const mountFallback = () => {
        if (!suspense.isInFallback) {
          return;
        }
        patch(
          null,
          fallbackVNode,
          container2,
          anchor2,
          parentComponent2,
          null,
          isSVG2,
          slotScopeIds,
          optimized
        );
        setActiveBranch(suspense, fallbackVNode);
      };
      const delayEnter = fallbackVNode.transition && fallbackVNode.transition.mode === "out-in";
      if (delayEnter) {
        activeBranch.transition.afterLeave = mountFallback;
      }
      suspense.isInFallback = true;
      unmount(
        activeBranch,
        parentComponent2,
        null,
        true
      );
      if (!delayEnter) {
        mountFallback();
      }
    },
    move(container2, anchor2, type) {
      suspense.activeBranch && move(suspense.activeBranch, container2, anchor2, type);
      suspense.container = container2;
    },
    next() {
      return suspense.activeBranch && next(suspense.activeBranch);
    },
    registerDep(instance, setupRenderEffect) {
      const isInPendingSuspense = !!suspense.pendingBranch;
      if (isInPendingSuspense) {
        suspense.deps++;
      }
      const hydratedEl = instance.vnode.el;
      instance.asyncDep.catch((err) => {
        handleError(err, instance, 0);
      }).then((asyncSetupResult) => {
        if (instance.isUnmounted || suspense.isUnmounted || suspense.pendingId !== instance.suspenseId) {
          return;
        }
        instance.asyncResolved = true;
        const { vnode: vnode2 } = instance;
        handleSetupResult(instance, asyncSetupResult, false);
        if (hydratedEl) {
          vnode2.el = hydratedEl;
        }
        const placeholder = !hydratedEl && instance.subTree.el;
        setupRenderEffect(
          instance,
          vnode2,
          parentNode(hydratedEl || instance.subTree.el),
          hydratedEl ? null : next(instance.subTree),
          suspense,
          isSVG,
          optimized
        );
        if (placeholder) {
          remove2(placeholder);
        }
        updateHOCHostEl(instance, vnode2.el);
        if (isInPendingSuspense && --suspense.deps === 0) {
          suspense.resolve();
        }
      });
    },
    unmount(parentSuspense, doRemove) {
      suspense.isUnmounted = true;
      if (suspense.activeBranch) {
        unmount(suspense.activeBranch, parentComponent, parentSuspense, doRemove);
      }
      if (suspense.pendingBranch) {
        unmount(suspense.pendingBranch, parentComponent, parentSuspense, doRemove);
      }
    }
  };
  return suspense;
}
function hydrateSuspense(node, vnode, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals, hydrateNode) {
  const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, node.parentNode, document.createElement("div"), null, isSVG, slotScopeIds, optimized, rendererInternals, true);
  const result = hydrateNode(node, suspense.pendingBranch = vnode.ssContent, parentComponent, suspense, slotScopeIds, optimized);
  if (suspense.deps === 0) {
    suspense.resolve();
  }
  return result;
}
function normalizeSuspenseChildren(vnode) {
  const { shapeFlag, children } = vnode;
  const isSlotChildren = shapeFlag & 32;
  vnode.ssContent = normalizeSuspenseSlot(isSlotChildren ? children.default : children);
  vnode.ssFallback = isSlotChildren ? normalizeSuspenseSlot(children.fallback) : createVNode(Comment);
}
function normalizeSuspenseSlot(s) {
  let block;
  if (isFunction$1(s)) {
    const trackBlock = isBlockTreeEnabled && s._c;
    if (trackBlock) {
      s._d = false;
      openBlock();
    }
    s = s();
    if (trackBlock) {
      s._d = true;
      block = currentBlock;
      closeBlock();
    }
  }
  if (isArray$2(s)) {
    const singleChild = filterSingleRoot(s);
    s = singleChild;
  }
  s = normalizeVNode(s);
  if (block && !s.dynamicChildren) {
    s.dynamicChildren = block.filter((c) => c !== s);
  }
  return s;
}
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$2(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
function setActiveBranch(suspense, branch) {
  suspense.activeBranch = branch;
  const { vnode, parentComponent } = suspense;
  const el = vnode.el = branch.el;
  if (parentComponent && parentComponent.subTree === vnode) {
    parentComponent.vnode.el = el;
    updateHOCHostEl(parentComponent, el);
  }
}
function provide(key, value) {
  if (!currentInstance)
    ;
  else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance) {
    const provides = instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction$1(defaultValue) ? defaultValue.call(instance.proxy) : defaultValue;
    } else
      ;
  }
}
function watchEffect(effect2, options) {
  return doWatch(effect2, null, options);
}
function watchPostEffect(effect2, options) {
  return doWatch(effect2, null, { flush: "post" });
}
function watchSyncEffect(effect2, options) {
  return doWatch(effect2, null, { flush: "sync" });
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
  const instance = currentInstance;
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isArray$2(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () => source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return traverse(s);
      } else if (isFunction$1(s)) {
        return callWithErrorHandling(s, instance, 2);
      } else
        ;
    });
  } else if (isFunction$1(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (instance && instance.isUnmounted) {
          return;
        }
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(source, instance, 3, [onCleanup]);
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn) => {
    cleanup = effect2.onStop = () => {
      callWithErrorHandling(fn, instance, 4);
    };
  };
  if (isInSSRComponentSetup) {
    onCleanup = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onCleanup
      ]);
    }
    return NOOP;
  }
  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect2.active) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect2.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
  } else {
    job.pre = true;
    if (instance)
      job.id = instance.uid;
    scheduler = () => queueJob(job);
  }
  const effect2 = new ReactiveEffect(getter, scheduler);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(effect2.run.bind(effect2), instance && instance.suspense);
  } else {
    effect2.run();
  }
  return () => {
    effect2.stop();
    if (instance && instance.scope) {
      remove(instance.scope.effects, effect2);
    }
  };
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString$1(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction$1(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const cur = currentInstance;
  setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  if (cur) {
    setCurrentInstance(cur);
  } else {
    unsetCurrentInstance();
  }
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
function traverse(value, seen) {
  if (!isObject$1(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray$2(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, seen);
    });
  } else if (isPlainObject$2(value)) {
    for (const key in value) {
      traverse(value[key], seen);
    }
  }
  return value;
}
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: {
    mode: String,
    appear: Boolean,
    persisted: Boolean,
    onBeforeEnter: TransitionHookValidator,
    onEnter: TransitionHookValidator,
    onAfterEnter: TransitionHookValidator,
    onEnterCancelled: TransitionHookValidator,
    onBeforeLeave: TransitionHookValidator,
    onLeave: TransitionHookValidator,
    onAfterLeave: TransitionHookValidator,
    onLeaveCancelled: TransitionHookValidator,
    onBeforeAppear: TransitionHookValidator,
    onAppear: TransitionHookValidator,
    onAfterAppear: TransitionHookValidator,
    onAppearCancelled: TransitionHookValidator
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevTransitionKey;
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      if (!children || !children.length) {
        return;
      }
      let child = children[0];
      if (children.length > 1) {
        for (const c of children) {
          if (c.type !== Comment) {
            child = c;
            break;
          }
        }
      }
      const rawProps = toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getKeepAliveChild(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
      setTransitionHooks(innerChild, enterHooks);
      const oldChild = instance.subTree;
      const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
      let transitionKeyChanged = false;
      const { getTransitionKey } = innerChild.type;
      if (getTransitionKey) {
        const key = getTransitionKey();
        if (prevTransitionKey === void 0) {
          prevTransitionKey = key;
        } else if (key !== prevTransitionKey) {
          prevTransitionKey = key;
          transitionKeyChanged = true;
        }
      }
      if (oldInnerChild && oldInnerChild.type !== Comment && (!isSameVNodeType(innerChild, oldInnerChild) || transitionKeyChanged)) {
        const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in") {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            instance.update();
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el._leaveCb = () => {
              earlyRemove();
              el._leaveCb = void 0;
              delete enterHooks.delayedLeave;
            };
            enterHooks.delayedLeave = delayedLeave;
          };
        }
      }
      return child;
    };
  }
};
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance) {
  const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(hook, instance, 9, args);
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook2(hook, args);
    if (isArray$2(hook)) {
      if (hook.every((hook2) => hook2.length <= 1))
        done();
    } else if (hook.length <= 1) {
      done();
    }
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el._leaveCb) {
        el._leaveCb(true);
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el._leaveCb) {
        leavingVNode.el._leaveCb();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called2 = false;
      const done = el._enterCb = (cancelled) => {
        if (called2)
          return;
        called2 = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el._enterCb = void 0;
      };
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el._enterCb) {
        el._enterCb(true);
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called2 = false;
      const done = el._leaveCb = (cancelled) => {
        if (called2)
          return;
        called2 = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el._leaveCb = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      return resolveTransitionHooks(vnode2, props, state, instance);
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getKeepAliveChild(vnode) {
  return isKeepAlive(vnode) ? vnode.children ? vnode.children[0] : void 0 : vnode;
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
    if (child.type === Fragment) {
      if (child.patchFlag & 128)
        keyedFragmentCount++;
      ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
function defineComponent(options) {
  return isFunction$1(options) ? { setup: options, name: options.name } : options;
}
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
function defineAsyncComponent(source) {
  if (isFunction$1(source)) {
    source = { loader: source };
  }
  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    timeout,
    suspensible = true,
    onError: userOnError
  } = source;
  let pendingRequest = null;
  let resolvedComp;
  let retries = 0;
  const retry = () => {
    retries++;
    pendingRequest = null;
    return load();
  };
  const load = () => {
    let thisRequest;
    return pendingRequest || (thisRequest = pendingRequest = loader().catch((err) => {
      err = err instanceof Error ? err : new Error(String(err));
      if (userOnError) {
        return new Promise((resolve2, reject) => {
          const userRetry = () => resolve2(retry());
          const userFail = () => reject(err);
          userOnError(err, userRetry, userFail, retries + 1);
        });
      } else {
        throw err;
      }
    }).then((comp) => {
      if (thisRequest !== pendingRequest && pendingRequest) {
        return pendingRequest;
      }
      if (comp && (comp.__esModule || comp[Symbol.toStringTag] === "Module")) {
        comp = comp.default;
      }
      resolvedComp = comp;
      return comp;
    }));
  };
  return defineComponent({
    name: "AsyncComponentWrapper",
    __asyncLoader: load,
    get __asyncResolved() {
      return resolvedComp;
    },
    setup() {
      const instance = currentInstance;
      if (resolvedComp) {
        return () => createInnerComp(resolvedComp, instance);
      }
      const onError = (err) => {
        pendingRequest = null;
        handleError(err, instance, 13, !errorComponent);
      };
      if (suspensible && instance.suspense || isInSSRComponentSetup) {
        return load().then((comp) => {
          return () => createInnerComp(comp, instance);
        }).catch((err) => {
          onError(err);
          return () => errorComponent ? createVNode(errorComponent, {
            error: err
          }) : null;
        });
      }
      const loaded = ref(false);
      const error = ref();
      const delayed = ref(!!delay);
      if (delay) {
        setTimeout(() => {
          delayed.value = false;
        }, delay);
      }
      if (timeout != null) {
        setTimeout(() => {
          if (!loaded.value && !error.value) {
            const err = new Error(`Async component timed out after ${timeout}ms.`);
            onError(err);
            error.value = err;
          }
        }, timeout);
      }
      load().then(() => {
        loaded.value = true;
        if (instance.parent && isKeepAlive(instance.parent.vnode)) {
          queueJob(instance.parent.update);
        }
      }).catch((err) => {
        onError(err);
        error.value = err;
      });
      return () => {
        if (loaded.value && resolvedComp) {
          return createInnerComp(resolvedComp, instance);
        } else if (error.value && errorComponent) {
          return createVNode(errorComponent, {
            error: error.value
          });
        } else if (loadingComponent && !delayed.value) {
          return createVNode(loadingComponent);
        }
      };
    }
  });
}
function createInnerComp(comp, { vnode: { ref: ref2, props, children, shapeFlag }, parent }) {
  const vnode = createVNode(comp, props, children);
  vnode.ref = ref2;
  return vnode;
}
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
const KeepAliveImpl = {
  name: `KeepAlive`,
  __isKeepAlive: true,
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number]
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const sharedContext = instance.ctx;
    if (!sharedContext.renderer) {
      return () => {
        const children = slots.default && slots.default();
        return children && children.length === 1 ? children[0] : children;
      };
    }
    const cache = /* @__PURE__ */ new Map();
    const keys = /* @__PURE__ */ new Set();
    let current = null;
    const parentSuspense = instance.suspense;
    const { renderer: { p: patch, m: move, um: _unmount, o: { createElement } } } = sharedContext;
    const storageContainer = createElement("div");
    sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
      const instance2 = vnode.component;
      move(vnode, container, anchor, 0, parentSuspense);
      patch(instance2.vnode, vnode, container, anchor, instance2, parentSuspense, isSVG, vnode.slotScopeIds, optimized);
      queuePostRenderEffect(() => {
        instance2.isDeactivated = false;
        if (instance2.a) {
          invokeArrayFns(instance2.a);
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance2.parent, vnode);
        }
      }, parentSuspense);
    };
    sharedContext.deactivate = (vnode) => {
      const instance2 = vnode.component;
      move(vnode, storageContainer, null, 1, parentSuspense);
      queuePostRenderEffect(() => {
        if (instance2.da) {
          invokeArrayFns(instance2.da);
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
        if (vnodeHook) {
          invokeVNodeHook(vnodeHook, instance2.parent, vnode);
        }
        instance2.isDeactivated = true;
      }, parentSuspense);
    };
    function unmount(vnode) {
      resetShapeFlag(vnode);
      _unmount(vnode, instance, parentSuspense, true);
    }
    function pruneCache(filter2) {
      cache.forEach((vnode, key) => {
        const name = getComponentName(vnode.type);
        if (name && (!filter2 || !filter2(name))) {
          pruneCacheEntry(key);
        }
      });
    }
    function pruneCacheEntry(key) {
      const cached = cache.get(key);
      if (!current || cached.type !== current.type) {
        unmount(cached);
      } else if (current) {
        resetShapeFlag(current);
      }
      cache.delete(key);
      keys.delete(key);
    }
    watch(
      () => [props.include, props.exclude],
      ([include, exclude]) => {
        include && pruneCache((name) => matches(include, name));
        exclude && pruneCache((name) => !matches(exclude, name));
      },
      { flush: "post", deep: true }
    );
    let pendingCacheKey = null;
    const cacheSubtree = () => {
      if (pendingCacheKey != null) {
        cache.set(pendingCacheKey, getInnerChild(instance.subTree));
      }
    };
    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);
    onBeforeUnmount(() => {
      cache.forEach((cached) => {
        const { subTree, suspense } = instance;
        const vnode = getInnerChild(subTree);
        if (cached.type === vnode.type) {
          resetShapeFlag(vnode);
          const da = vnode.component.da;
          da && queuePostRenderEffect(da, suspense);
          return;
        }
        unmount(cached);
      });
    });
    return () => {
      pendingCacheKey = null;
      if (!slots.default) {
        return null;
      }
      const children = slots.default();
      const rawVNode = children[0];
      if (children.length > 1) {
        current = null;
        return children;
      } else if (!isVNode(rawVNode) || !(rawVNode.shapeFlag & 4) && !(rawVNode.shapeFlag & 128)) {
        current = null;
        return rawVNode;
      }
      let vnode = getInnerChild(rawVNode);
      const comp = vnode.type;
      const name = getComponentName(isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : comp);
      const { include, exclude, max } = props;
      if (include && (!name || !matches(include, name)) || exclude && name && matches(exclude, name)) {
        current = vnode;
        return rawVNode;
      }
      const key = vnode.key == null ? comp : vnode.key;
      const cachedVNode = cache.get(key);
      if (vnode.el) {
        vnode = cloneVNode(vnode);
        if (rawVNode.shapeFlag & 128) {
          rawVNode.ssContent = vnode;
        }
      }
      pendingCacheKey = key;
      if (cachedVNode) {
        vnode.el = cachedVNode.el;
        vnode.component = cachedVNode.component;
        if (vnode.transition) {
          setTransitionHooks(vnode, vnode.transition);
        }
        vnode.shapeFlag |= 512;
        keys.delete(key);
        keys.add(key);
      } else {
        keys.add(key);
        if (max && keys.size > parseInt(max, 10)) {
          pruneCacheEntry(keys.values().next().value);
        }
      }
      vnode.shapeFlag |= 256;
      current = vnode;
      return isSuspense(rawVNode.type) ? rawVNode : vnode;
    };
  }
};
const KeepAlive = KeepAliveImpl;
function matches(pattern, name) {
  if (isArray$2(pattern)) {
    return pattern.some((p2) => matches(p2, name));
  } else if (isString$1(pattern)) {
    return pattern.split(",").includes(name);
  } else if (pattern.test) {
    return pattern.test(name);
  }
  return false;
}
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(type, hook, keepAliveRoot, true);
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function resetShapeFlag(vnode) {
  let shapeFlag = vnode.shapeFlag;
  if (shapeFlag & 256) {
    shapeFlag -= 256;
  }
  if (shapeFlag & 512) {
    shapeFlag -= 512;
  }
  vnode.shapeFlag = shapeFlag;
}
function getInnerChild(vnode) {
  return vnode.shapeFlag & 128 ? vnode.ssContent : vnode;
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      unsetCurrentInstance();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, (...args) => hook(...args), target);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
function withDirectives(vnode, directives) {
  const internalInstance = currentRenderingInstance;
  if (internalInstance === null) {
    return vnode;
  }
  const instance = getExposeProxy(internalInstance) || internalInstance.proxy;
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (isFunction$1(dir)) {
      dir = {
        mounted: dir,
        updated: dir
      };
    }
    if (dir.deep) {
      traverse(value);
    }
    bindings.push({
      dir,
      instance,
      value,
      oldValue: void 0,
      arg,
      modifiers
    });
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
const COMPONENTS = "components";
const DIRECTIVES = "directives";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = Symbol();
function resolveDynamicComponent(component) {
  if (isString$1(component)) {
    return resolveAsset(COMPONENTS, component, false) || component;
  } else {
    return component || NULL_DYNAMIC_COMPONENT;
  }
}
function resolveDirective(name) {
  return resolveAsset(DIRECTIVES, name);
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    if (type === COMPONENTS) {
      const selfName = getComponentName(Component, false);
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = resolve$1(instance[type] || Component[type], name) || resolve$1(instance.appContext[type], name);
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve$1(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache && cache[index];
  if (isArray$2(source) || isString$1(source)) {
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(source[i], i, void 0, cached && cached[i]);
    }
  } else if (typeof source === "number") {
    ret = new Array(source);
    for (let i = 0; i < source; i++) {
      ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
    }
  } else if (isObject$1(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i, cached && cached[i]);
      }
    }
  } else {
    ret = [];
  }
  if (cache) {
    cache[index] = ret;
  }
  return ret;
}
function createSlots(slots, dynamicSlots) {
  for (let i = 0; i < dynamicSlots.length; i++) {
    const slot = dynamicSlots[i];
    if (isArray$2(slot)) {
      for (let j = 0; j < slot.length; j++) {
        slots[slot[j].name] = slot[j].fn;
      }
    } else if (slot) {
      slots[slot.name] = slot.key ? (...args) => {
        const res = slot.fn(...args);
        if (res)
          res.key = slot.key;
        return res;
      } : slot.fn;
    }
  }
  return slots;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
  if (currentRenderingInstance.isCE || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.isCE) {
    return createVNode("slot", name === "default" ? null : { name }, fallback && fallback());
  }
  let slot = slots[name];
  if (slot && slot._c) {
    slot._d = false;
  }
  openBlock();
  const validSlotContent = slot && ensureValidVNode(slot(props));
  const rendered = createBlock(Fragment, {
    key: props.key || validSlotContent && validSlotContent.key || `_${name}`
  }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
  if (!noSlotted && rendered.scopeId) {
    rendered.slotScopeIds = [rendered.scopeId + "-s"];
  }
  if (slot && slot._c) {
    slot._d = true;
  }
  return rendered;
}
function ensureValidVNode(vnodes) {
  return vnodes.some((child) => {
    if (!isVNode(child))
      return true;
    if (child.type === Comment)
      return false;
    if (child.type === Fragment && !ensureValidVNode(child.children))
      return false;
    return true;
  }) ? vnodes : null;
}
function toHandlers(obj, preserveCaseIfNecessary) {
  const ret = {};
  for (const key in obj) {
    ret[preserveCaseIfNecessary && /[A-Z]/.test(key) ? `on:${key}` : toHandlerKey(key)] = obj[key];
  }
  return ret;
}
const getPublicInstance = (i) => {
  if (!i)
    return null;
  if (isStatefulComponent(i))
    return getExposeProxy(i) || i.proxy;
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = /* @__PURE__ */ extend$2(/* @__PURE__ */ Object.create(null), {
  $: (i) => i,
  $el: (i) => i.vnode.el,
  $data: (i) => i.data,
  $props: (i) => i.props,
  $attrs: (i) => i.attrs,
  $slots: (i) => i.slots,
  $refs: (i) => i.refs,
  $parent: (i) => getPublicInstance(i.parent),
  $root: (i) => getPublicInstance(i.root),
  $emit: (i) => i.emit,
  $options: (i) => resolveMergedOptions(i),
  $forceUpdate: (i) => i.f || (i.f = () => queueJob(i.update)),
  $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
  $watch: (i) => instanceWatch.bind(i)
});
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    let normalizedProps;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if ((normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) {
      {
        return globalProperties[key];
      }
    } else
      ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || setupState !== EMPTY_OBJ && hasOwn(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
const RuntimeCompiledPublicInstanceProxyHandlers = /* @__PURE__ */ extend$2({}, PublicInstanceProxyHandlers, {
  get(target, key) {
    if (key === Symbol.unscopables) {
      return;
    }
    return PublicInstanceProxyHandlers.get(target, key, target);
  },
  has(_, key) {
    const has2 = key[0] !== "_" && !isGloballyWhitelisted(key);
    return has2;
  }
});
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render: render2,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    expose,
    inheritAttrs,
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction$1(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject$1(data))
      ;
    else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get2 = isFunction$1(opt) ? opt.bind(publicThis, publicThis) : isFunction$1(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set2 = !isFunction$1(opt) && isFunction$1(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get: get2,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction$1(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray$2(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$2(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render2 && instance.render === NOOP) {
    instance.render = render2;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP, unwrapRef = false) {
  if (isArray$2(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$1(opt)) {
      if ("default" in opt) {
        injected = inject(opt.from || key, opt.default, true);
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      if (unwrapRef) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => injected.value,
          set: (v) => injected.value = v
        });
      } else {
        ctx[key] = injected;
      }
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(isArray$2(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString$1(raw)) {
    const handler = ctx[raw];
    if (isFunction$1(handler)) {
      watch(getter, handler);
    }
  } else if (isFunction$1(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject$1(raw)) {
    if (isArray$2(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction$1(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction$1(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else
    ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach((m) => mergeOptions$1(resolved, m, optionMergeStrategies, true));
    }
    mergeOptions$1(resolved, base, optionMergeStrategies);
  }
  if (isObject$1(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions$1(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions$1(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach((m) => mergeOptions$1(to, m, strats, true));
  }
  for (const key in from) {
    if (asMixin && key === "expose")
      ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeObjectOptions,
  emits: mergeObjectOptions,
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  watch: mergeWatchOptions,
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend$2(isFunction$1(to) ? to.call(this, this) : to, isFunction$1(from) ? from.call(this, this) : from);
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$2(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend$2(extend$2(/* @__PURE__ */ Object.create(null), to), from) : from;
}
function mergeWatchOptions(to, from) {
  if (!to)
    return from;
  if (!from)
    return to;
  const merged = extend$2(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  def(attrs, InternalObjectKey, 1);
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const { props, attrs, vnode: { patchFlag } } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance, "set", "$attrs");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && isFunction$1(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(null, props);
          unsetCurrentInstance();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[0]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[1] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend$2(normalized, props);
      if (keys)
        needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$1(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$2(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$2(opt) || isFunction$1(opt) ? { type: opt } : opt;
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[0] = booleanIndex > -1;
          prop[1] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$1(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$") {
    return true;
  }
  return false;
}
function getType(ctor) {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ctor === null ? "null" : "";
}
function isSameType(a, b) {
  return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
  if (isArray$2(expectedTypes)) {
    return expectedTypes.findIndex((t) => isSameType(t, type));
  } else if (isFunction$1(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  return -1;
}
const isInternalKey = (key) => key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value) => isArray$2(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot$1 = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false)
      ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key))
      continue;
    const value = rawSlots[key];
    if (isFunction$1(value)) {
      slots[key] = normalizeSlot$1(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      instance.slots = toRaw(children);
      def(children, "_", type);
    } else {
      normalizeObjectSlots(children, instance.slots = {});
    }
  } else {
    instance.slots = {};
    if (children) {
      normalizeVNodeSlots(instance, children);
    }
  }
  def(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        extend$2(slots, children);
        if (!optimized && type === 1) {
          delete slots._;
        }
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
        delete slots[key];
      }
    }
  }
};
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid = 0;
function createAppAPI(render2, hydrate2) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction$1(rootComponent)) {
      rootComponent = Object.assign({}, rootComponent);
    }
    if (rootProps != null && !isObject$1(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new Set();
    let isMounted = false;
    const app = context.app = {
      _uid: uid++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin))
          ;
        else if (plugin && isFunction$1(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction$1(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else
          ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, isSVG) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (isHydrate && hydrate2) {
            hydrate2(vnode, rootContainer);
          } else {
            render2(vnode, rootContainer, isSVG);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getExposeProxy(vnode.component) || vnode.component.proxy;
        }
      },
      unmount() {
        if (isMounted) {
          render2(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      }
    };
    return app;
  };
}
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$2(rawRef)) {
    rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray$2(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getExposeProxy(vnode.component) || vnode.component.proxy : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref2 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  if (oldRef != null && oldRef !== ref2) {
    if (isString$1(oldRef)) {
      refs[oldRef] = null;
      if (hasOwn(setupState, oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      oldRef.value = null;
    }
  }
  if (isFunction$1(ref2)) {
    callWithErrorHandling(ref2, owner, 12, [value, refs]);
  } else {
    const _isString = isString$1(ref2);
    const _isRef = isRef(ref2);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? hasOwn(setupState, ref2) ? setupState[ref2] : refs[ref2] : ref2.value;
          if (isUnmount) {
            isArray$2(existing) && remove(existing, refValue);
          } else {
            if (!isArray$2(existing)) {
              if (_isString) {
                refs[ref2] = [refValue];
                if (hasOwn(setupState, ref2)) {
                  setupState[ref2] = refs[ref2];
                }
              } else {
                ref2.value = [refValue];
                if (rawRef.k)
                  refs[rawRef.k] = ref2.value;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref2] = value;
          if (hasOwn(setupState, ref2)) {
            setupState[ref2] = value;
          }
        } else if (_isRef) {
          ref2.value = value;
          if (rawRef.k)
            refs[rawRef.k] = value;
        } else
          ;
      };
      if (value) {
        doSet.id = -1;
        queuePostRenderEffect(doSet, parentSuspense);
      } else {
        doSet();
      }
    }
  }
}
let hasMismatch = false;
const isSVGContainer = (container) => /svg/.test(container.namespaceURI) && container.tagName !== "foreignObject";
const isComment = (node) => node.nodeType === 8;
function createHydrationFunctions(rendererInternals) {
  const { mt: mountComponent, p: patch, o: { patchProp: patchProp2, createText, nextSibling, parentNode, remove: remove2, insert, createComment } } = rendererInternals;
  const hydrate2 = (vnode, container) => {
    if (!container.hasChildNodes()) {
      patch(null, vnode, container);
      flushPostFlushCbs();
      container._vnode = vnode;
      return;
    }
    hasMismatch = false;
    hydrateNode(container.firstChild, vnode, null, null, null);
    flushPostFlushCbs();
    container._vnode = vnode;
    if (hasMismatch && true) {
      console.error(`Hydration completed but contains mismatches.`);
    }
  };
  const hydrateNode = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized = false) => {
    const isFragmentStart = isComment(node) && node.data === "[";
    const onMismatch = () => handleMismatch(node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragmentStart);
    const { type, ref: ref2, shapeFlag, patchFlag } = vnode;
    let domType = node.nodeType;
    vnode.el = node;
    if (patchFlag === -2) {
      optimized = false;
      vnode.dynamicChildren = null;
    }
    let nextNode = null;
    switch (type) {
      case Text:
        if (domType !== 3) {
          if (vnode.children === "") {
            insert(vnode.el = createText(""), parentNode(node), node);
            nextNode = node;
          } else {
            nextNode = onMismatch();
          }
        } else {
          if (node.data !== vnode.children) {
            hasMismatch = true;
            node.data = vnode.children;
          }
          nextNode = nextSibling(node);
        }
        break;
      case Comment:
        if (domType !== 8 || isFragmentStart) {
          nextNode = onMismatch();
        } else {
          nextNode = nextSibling(node);
        }
        break;
      case Static:
        if (isFragmentStart) {
          node = nextSibling(node);
          domType = node.nodeType;
        }
        if (domType === 1 || domType === 3) {
          nextNode = node;
          const needToAdoptContent = !vnode.children.length;
          for (let i = 0; i < vnode.staticCount; i++) {
            if (needToAdoptContent)
              vnode.children += nextNode.nodeType === 1 ? nextNode.outerHTML : nextNode.data;
            if (i === vnode.staticCount - 1) {
              vnode.anchor = nextNode;
            }
            nextNode = nextSibling(nextNode);
          }
          return isFragmentStart ? nextSibling(nextNode) : nextNode;
        } else {
          onMismatch();
        }
        break;
      case Fragment:
        if (!isFragmentStart) {
          nextNode = onMismatch();
        } else {
          nextNode = hydrateFragment(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
        }
        break;
      default:
        if (shapeFlag & 1) {
          if (domType !== 1 || vnode.type.toLowerCase() !== node.tagName.toLowerCase()) {
            nextNode = onMismatch();
          } else {
            nextNode = hydrateElement(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
          }
        } else if (shapeFlag & 6) {
          vnode.slotScopeIds = slotScopeIds;
          const container = parentNode(node);
          mountComponent(vnode, container, null, parentComponent, parentSuspense, isSVGContainer(container), optimized);
          nextNode = isFragmentStart ? locateClosingAsyncAnchor(node) : nextSibling(node);
          if (nextNode && isComment(nextNode) && nextNode.data === "teleport end") {
            nextNode = nextSibling(nextNode);
          }
          if (isAsyncWrapper(vnode)) {
            let subTree;
            if (isFragmentStart) {
              subTree = createVNode(Fragment);
              subTree.anchor = nextNode ? nextNode.previousSibling : container.lastChild;
            } else {
              subTree = node.nodeType === 3 ? createTextVNode("") : createVNode("div");
            }
            subTree.el = node;
            vnode.component.subTree = subTree;
          }
        } else if (shapeFlag & 64) {
          if (domType !== 8) {
            nextNode = onMismatch();
          } else {
            nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, rendererInternals, hydrateChildren);
          }
        } else if (shapeFlag & 128) {
          nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, isSVGContainer(parentNode(node)), slotScopeIds, optimized, rendererInternals, hydrateNode);
        } else
          ;
    }
    if (ref2 != null) {
      setRef(ref2, null, parentSuspense, vnode);
    }
    return nextNode;
  };
  const hydrateElement = (el, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    optimized = optimized || !!vnode.dynamicChildren;
    const { type, props, patchFlag, shapeFlag, dirs } = vnode;
    const forcePatchValue = type === "input" && dirs || type === "option";
    if (forcePatchValue || patchFlag !== -1) {
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      if (props) {
        if (forcePatchValue || !optimized || patchFlag & (16 | 32)) {
          for (const key in props) {
            if (forcePatchValue && key.endsWith("value") || isOn(key) && !isReservedProp(key)) {
              patchProp2(el, key, null, props[key], false, void 0, parentComponent);
            }
          }
        } else if (props.onClick) {
          patchProp2(el, "onClick", null, props.onClick, false, void 0, parentComponent);
        }
      }
      let vnodeHooks;
      if (vnodeHooks = props && props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHooks, parentComponent, vnode);
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
      }
      if ((vnodeHooks = props && props.onVnodeMounted) || dirs) {
        queueEffectWithSuspense(() => {
          vnodeHooks && invokeVNodeHook(vnodeHooks, parentComponent, vnode);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        }, parentSuspense);
      }
      if (shapeFlag & 16 && !(props && (props.innerHTML || props.textContent))) {
        let next = hydrateChildren(el.firstChild, vnode, el, parentComponent, parentSuspense, slotScopeIds, optimized);
        while (next) {
          hasMismatch = true;
          const cur = next;
          next = next.nextSibling;
          remove2(cur);
        }
      } else if (shapeFlag & 8) {
        if (el.textContent !== vnode.children) {
          hasMismatch = true;
          el.textContent = vnode.children;
        }
      }
    }
    return el.nextSibling;
  };
  const hydrateChildren = (node, parentVNode, container, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    optimized = optimized || !!parentVNode.dynamicChildren;
    const children = parentVNode.children;
    const l = children.length;
    for (let i = 0; i < l; i++) {
      const vnode = optimized ? children[i] : children[i] = normalizeVNode(children[i]);
      if (node) {
        node = hydrateNode(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
      } else if (vnode.type === Text && !vnode.children) {
        continue;
      } else {
        hasMismatch = true;
        patch(null, vnode, container, null, parentComponent, parentSuspense, isSVGContainer(container), slotScopeIds);
      }
    }
    return node;
  };
  const hydrateFragment = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    const { slotScopeIds: fragmentSlotScopeIds } = vnode;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    const container = parentNode(node);
    const next = hydrateChildren(nextSibling(node), vnode, container, parentComponent, parentSuspense, slotScopeIds, optimized);
    if (next && isComment(next) && next.data === "]") {
      return nextSibling(vnode.anchor = next);
    } else {
      hasMismatch = true;
      insert(vnode.anchor = createComment(`]`), container, next);
      return next;
    }
  };
  const handleMismatch = (node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragment) => {
    hasMismatch = true;
    vnode.el = null;
    if (isFragment) {
      const end = locateClosingAsyncAnchor(node);
      while (true) {
        const next2 = nextSibling(node);
        if (next2 && next2 !== end) {
          remove2(next2);
        } else {
          break;
        }
      }
    }
    const next = nextSibling(node);
    const container = parentNode(node);
    remove2(node);
    patch(null, vnode, container, next, parentComponent, parentSuspense, isSVGContainer(container), slotScopeIds);
    return next;
  };
  const locateClosingAsyncAnchor = (node) => {
    let match = 0;
    while (node) {
      node = nextSibling(node);
      if (node && isComment(node)) {
        if (node.data === "[")
          match++;
        if (node.data === "]") {
          if (match === 0) {
            return nextSibling(node);
          } else {
            match--;
          }
        }
      }
    }
    return node;
  };
  return [hydrate2, hydrateNode];
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function createHydrationRenderer(options) {
  return baseCreateRenderer(options, createHydrationFunctions);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref2, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, isSVG);
        }
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        break;
      default:
        if (shapeFlag & 1) {
          processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 6) {
          processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 64) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else if (shapeFlag & 128) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else
          ;
    }
    if (ref2 != null && parentComponent) {
      setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, isSVG) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG, n2.el, n2.anchor);
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    isSVG = isSVG || n2.type === "svg";
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { type, props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== "foreignObject", slotScopeIds, optimized);
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree) {
        const parentVNode = parentComponent.vnode;
        setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    const areChildrenSVG = isSVG && n2.type !== "foreignObject";
    if (dynamicChildren) {
      patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
    } else if (!optimized) {
      patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, isSVG);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, isSVG);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : fallbackContainer;
      patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
    }
  };
  const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key))
          continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren) {
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
        if (n2.key != null || parentComponent && n2 === parentComponent.subTree) {
          traverseStaticChildren(n1, n2, true);
        }
      } else {
        patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
      } else {
        mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
    const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
      }
      return;
    }
    setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        invalidateJob(instance.update);
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = () => {
            instance.subTree = renderComponentRoot(instance);
            hydrateNode(el, instance.subTree, instance, parentSuspense, null);
          };
          if (isAsyncWrapperVNode) {
            initialVNode.type.__asyncLoader().then(
              () => !instance.isUnmounted && hydrateSubTree()
            );
          } else {
            hydrateSubTree();
          }
        } else {
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          hostParentNode(prevTree.el),
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          isSVG
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
        }
      }
    };
    const effect2 = instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => queueJob(update),
      instance.scope
    );
    const update = instance.update = () => effect2.run();
    update.id = instance.uid;
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs();
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
    if (oldLength > newLength) {
      unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
    } else {
      mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++)
        newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove3 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove3();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove3, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const { type, props, ref: ref2, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
    if (ref2 != null) {
      setRef(ref2, null, parentSuspense, vnode, true);
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
      } else if (dynamicChildren && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, update, subTree, um } = instance;
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (update) {
      update.active = false;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
      parentSuspense.deps--;
      if (parentSuspense.deps === 0) {
        parentSuspense.resolve();
      }
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    return hostNextSibling(vnode.anchor || vnode.el);
  };
  const render2 = (vnode, container, isSVG) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(container._vnode || null, vnode, container, null, null, null, isSVG);
    }
    flushPreFlushCbs();
    flushPostFlushCbs();
    container._vnode = vnode;
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate2;
  let hydrateNode;
  if (createHydrationFns) {
    [hydrate2, hydrateNode] = createHydrationFns(internals);
  }
  return {
    render: render2,
    hydrate: hydrate2,
    createApp: createAppAPI(render2, hydrate2)
  };
}
function toggleRecurse({ effect: effect2, update }, allowed) {
  effect2.allowRecurse = update.allowRecurse = allowed;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$2(ch1) && isArray$2(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow)
          traverseStaticChildren(c1, c2);
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
const isTeleport = (type) => type.__isTeleport;
const isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
const isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
const resolveTarget = (props, select) => {
  const targetSelector = props && props.to;
  if (isString$1(targetSelector)) {
    if (!select) {
      return null;
    } else {
      const target = select(targetSelector);
      return target;
    }
  } else {
    return targetSelector;
  }
};
const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals) {
    const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment } } = internals;
    const disabled = isTeleportDisabled(n2.props);
    let { shapeFlag, children, dynamicChildren } = n2;
    if (n1 == null) {
      const placeholder = n2.el = createText("");
      const mainAnchor = n2.anchor = createText("");
      insert(placeholder, container, anchor);
      insert(mainAnchor, container, anchor);
      const target = n2.target = resolveTarget(n2.props, querySelector);
      const targetAnchor = n2.targetAnchor = createText("");
      if (target) {
        insert(targetAnchor, target);
        isSVG = isSVG || isTargetSVG(target);
      }
      const mount = (container2, anchor2) => {
        if (shapeFlag & 16) {
          mountChildren(children, container2, anchor2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
      };
      if (disabled) {
        mount(container, mainAnchor);
      } else if (target) {
        mount(target, targetAnchor);
      }
    } else {
      n2.el = n1.el;
      const mainAnchor = n2.anchor = n1.anchor;
      const target = n2.target = n1.target;
      const targetAnchor = n2.targetAnchor = n1.targetAnchor;
      const wasDisabled = isTeleportDisabled(n1.props);
      const currentContainer = wasDisabled ? container : target;
      const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
      isSVG = isSVG || isTargetSVG(target);
      if (dynamicChildren) {
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, isSVG, slotScopeIds);
        traverseStaticChildren(n1, n2, true);
      } else if (!optimized) {
        patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, false);
      }
      if (disabled) {
        if (!wasDisabled) {
          moveTeleport(n2, container, mainAnchor, internals, 1);
        }
      } else {
        if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
          const nextTarget = n2.target = resolveTarget(n2.props, querySelector);
          if (nextTarget) {
            moveTeleport(n2, nextTarget, null, internals, 0);
          }
        } else if (wasDisabled) {
          moveTeleport(n2, target, targetAnchor, internals, 1);
        }
      }
    }
  },
  remove(vnode, parentComponent, parentSuspense, optimized, { um: unmount, o: { remove: hostRemove } }, doRemove) {
    const { shapeFlag, children, anchor, targetAnchor, target, props } = vnode;
    if (target) {
      hostRemove(targetAnchor);
    }
    if (doRemove || !isTeleportDisabled(props)) {
      hostRemove(anchor);
      if (shapeFlag & 16) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          unmount(child, parentComponent, parentSuspense, true, !!child.dynamicChildren);
        }
      }
    }
  },
  move: moveTeleport,
  hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
  if (moveType === 0) {
    insert(vnode.targetAnchor, container, parentAnchor);
  }
  const { el, anchor, shapeFlag, children, props } = vnode;
  const isReorder = moveType === 2;
  if (isReorder) {
    insert(el, container, parentAnchor);
  }
  if (!isReorder || isTeleportDisabled(props)) {
    if (shapeFlag & 16) {
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, parentAnchor, 2);
      }
    }
  }
  if (isReorder) {
    insert(anchor, container, parentAnchor);
  }
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector } }, hydrateChildren) {
  const target = vnode.target = resolveTarget(vnode.props, querySelector);
  if (target) {
    const targetNode = target._lpa || target.firstChild;
    if (vnode.shapeFlag & 16) {
      if (isTeleportDisabled(vnode.props)) {
        vnode.anchor = hydrateChildren(nextSibling(node), vnode, parentNode(node), parentComponent, parentSuspense, slotScopeIds, optimized);
        vnode.targetAnchor = targetNode;
      } else {
        vnode.anchor = nextSibling(node);
        let targetAnchor = targetNode;
        while (targetAnchor) {
          targetAnchor = nextSibling(targetAnchor);
          if (targetAnchor && targetAnchor.nodeType === 8 && targetAnchor.data === "teleport anchor") {
            vnode.targetAnchor = targetAnchor;
            target._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
            break;
          }
        }
        hydrateChildren(targetNode, vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
      }
    }
  }
  return vnode.anchor && nextSibling(vnode.anchor);
}
const Teleport = TeleportImpl;
const Fragment = Symbol(void 0);
const Text = Symbol(void 0);
const Comment = Symbol(void 0);
const Static = Symbol(void 0);
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
  isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
function transformVNodeArgs(transformer) {
}
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref: ref2, ref_key, ref_for }) => {
  return ref2 != null ? isString$1(ref2) || isRef(ref2) || isFunction$1(ref2) ? { i: currentRenderingInstance, r: ref2, k: ref_key, f: !!ref_for } : ref2 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString$1(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(type, props, true);
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag |= -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString$1(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject$1(style)) {
      if (isProxy(style) && !isArray$2(style)) {
        style = extend$2({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString$1(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$1(type) ? 4 : isFunction$1(type) ? 2 : 0;
  return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || InternalObjectKey in props ? extend$2({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
  const { props, ref: ref2, patchFlag, children } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? mergeRef && ref2 ? isArray$2(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref2,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition: vnode.transition,
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor
  };
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
  const vnode = createVNode(Static, null, content);
  vnode.staticCount = numberOfNodes;
  return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$2(child)) {
    return createVNode(
      Fragment,
      null,
      child.slice()
    );
  } else if (typeof child === "object") {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$2(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !(InternalObjectKey in children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction$1(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$2(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid$1 = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid$1++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    scope: new EffectScope(true),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    components: null,
    directives: null,
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    emit: null,
    emitted: null,
    propsDefaults: EMPTY_OBJ,
    inheritAttrs: type.inheritAttrs,
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit$1.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
const setCurrentInstance = (instance) => {
  currentInstance = instance;
  instance.scope.on();
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  currentInstance = null;
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isInSSRComponentSetup = isSSR;
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isInSSRComponentSetup = false;
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
  const { setup } = Component;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
    resetTracking();
    unsetCurrentInstance();
    if (isPromise(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, isSSR);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction$1(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject$1(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else
    ;
  finishComponentSetup(instance, isSSR);
}
let compile$1;
let installWithProxy;
function registerRuntimeCompiler(_compile) {
  compile$1 = _compile;
  installWithProxy = (i) => {
    if (i.render._rc) {
      i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers);
    }
  };
}
const isRuntimeOnly = () => !compile$1;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile$1 && !Component.render) {
      const template = Component.template || resolveMergedOptions(instance).template;
      if (template) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend$2(extend$2({
          isCustomElement,
          delimiters
        }, compilerOptions), componentCompilerOptions);
        Component.render = compile$1(template, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
    if (installWithProxy) {
      installWithProxy(instance);
    }
  }
  {
    setCurrentInstance(instance);
    pauseTracking();
    applyOptions(instance);
    resetTracking();
    unsetCurrentInstance();
  }
}
function createAttrsProxy(instance) {
  return new Proxy(instance.attrs, {
    get(target, key) {
      track(instance, "get", "$attrs");
      return target[key];
    }
  });
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  let attrs;
  {
    return {
      get attrs() {
        return attrs || (attrs = createAttrsProxy(instance));
      },
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      }
    }));
  }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction$1(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components || instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction$1(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
function defineProps() {
  return null;
}
function defineEmits() {
  return null;
}
function defineExpose(exposed) {
}
function withDefaults(props, defaults2) {
  return null;
}
function useSlots() {
  return getContext().slots;
}
function useAttrs() {
  return getContext().attrs;
}
function getContext() {
  const i = getCurrentInstance();
  return i.setupContext || (i.setupContext = createSetupContext(i));
}
function mergeDefaults(raw, defaults2) {
  const props = isArray$2(raw) ? raw.reduce((normalized, p2) => (normalized[p2] = {}, normalized), {}) : raw;
  for (const key in defaults2) {
    const opt = props[key];
    if (opt) {
      if (isArray$2(opt) || isFunction$1(opt)) {
        props[key] = { type: opt, default: defaults2[key] };
      } else {
        opt.default = defaults2[key];
      }
    } else if (opt === null) {
      props[key] = { default: defaults2[key] };
    } else
      ;
  }
  return props;
}
function createPropsRestProxy(props, excludedKeys) {
  const ret = {};
  for (const key in props) {
    if (!excludedKeys.includes(key)) {
      Object.defineProperty(ret, key, {
        enumerable: true,
        get: () => props[key]
      });
    }
  }
  return ret;
}
function withAsyncContext(getAwaitable) {
  const ctx = getCurrentInstance();
  let awaitable = getAwaitable();
  unsetCurrentInstance();
  if (isPromise(awaitable)) {
    awaitable = awaitable.catch((e) => {
      setCurrentInstance(ctx);
      throw e;
    });
  }
  return [awaitable, () => setCurrentInstance(ctx)];
}
function h(type, propsOrChildren, children) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject$1(propsOrChildren) && !isArray$2(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
const ssrContextKey = Symbol(``);
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    if (!ctx) {
      warn(`Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build.`);
    }
    return ctx;
  }
};
function initCustomFormatter() {
  {
    return;
  }
}
function withMemo(memo, render2, cache, index) {
  const cached = cache[index];
  if (cached && isMemoSame(cached, memo)) {
    return cached;
  }
  const ret = render2();
  ret.memo = memo.slice();
  return cache[index] = ret;
}
function isMemoSame(cached, memo) {
  const prev = cached.memo;
  if (prev.length != memo.length) {
    return false;
  }
  for (let i = 0; i < prev.length; i++) {
    if (hasChanged(prev[i], memo[i])) {
      return false;
    }
  }
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(cached);
  }
  return true;
}
const version = "3.2.41";
const _ssrUtils = {
  createComponentInstance,
  setupComponent,
  renderComponentRoot,
  setCurrentRenderingInstance,
  isVNode,
  normalizeVNode
};
const ssrUtils = _ssrUtils;
const resolveFilter = null;
const compatUtils = null;
const svgNS = "http://www.w3.org/2000/svg";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, isSVG, is, props) => {
    const el = isSVG ? doc.createElementNS(svgNS, tag) : doc.createElement(tag, is ? { is } : void 0);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  insertStaticContent(content, parent, anchor, isSVG, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling))
          break;
      }
    } else {
      templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content;
      const template = templateContainer.content;
      if (isSVG) {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      before ? before.nextSibling : parent.firstChild,
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
function patchClass(el, value, isSVG) {
  const transitionClasses = el._vtc;
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString$1(next);
  if (next && !isCssString) {
    for (const key in next) {
      setStyle(style, key, next[key]);
    }
    if (prev && !isString$1(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, "");
        }
      }
    }
  } else {
    const currentDisplay = style.display;
    if (isCssString) {
      if (prev !== next) {
        style.cssText = next;
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
    if ("_vod" in el) {
      style.display = currentDisplay;
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray$2(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null)
      val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean2 = isSpecialBooleanAttr(key);
    if (value == null || isBoolean2 && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean2 ? "" : value);
    }
  }
}
function patchDOMProp(el, key, value, prevChildren, parentComponent, parentSuspense, unmountChildren) {
  if (key === "innerHTML" || key === "textContent") {
    if (prevChildren) {
      unmountChildren(prevChildren, parentComponent, parentSuspense);
    }
    el[key] = value == null ? "" : value;
    return;
  }
  if (key === "value" && el.tagName !== "PROGRESS" && !el.tagName.includes("-")) {
    el._value = value;
    const newValue = value == null ? "" : value;
    if (el.value !== newValue || el.tagName === "OPTION") {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el._vei || (el._vei = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(nextValue, instance);
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5, [e]);
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray$2(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map((fn) => (e2) => !e2._stopped && fn && fn(e2));
  } else {
    return value;
  }
}
const nativeOnRE = /^on[a-z]/;
const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && nativeOnRE.test(key) && isFunction$1(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (nativeOnRE.test(key) && isString$1(value)) {
    return false;
  }
  return key in el;
}
function defineCustomElement(options, hydrate2) {
  const Comp = defineComponent(options);
  class VueCustomElement extends VueElement {
    constructor(initialProps) {
      super(Comp, initialProps, hydrate2);
    }
  }
  VueCustomElement.def = Comp;
  return VueCustomElement;
}
const defineSSRCustomElement = (options) => {
  return defineCustomElement(options, hydrate);
};
const BaseClass = typeof HTMLElement !== "undefined" ? HTMLElement : class {
};
class VueElement extends BaseClass {
  constructor(_def, _props = {}, hydrate2) {
    super();
    this._def = _def;
    this._props = _props;
    this._instance = null;
    this._connected = false;
    this._resolved = false;
    this._numberProps = null;
    if (this.shadowRoot && hydrate2) {
      hydrate2(this._createVNode(), this.shadowRoot);
    } else {
      this.attachShadow({ mode: "open" });
    }
  }
  connectedCallback() {
    this._connected = true;
    if (!this._instance) {
      this._resolveDef();
    }
  }
  disconnectedCallback() {
    this._connected = false;
    nextTick(() => {
      if (!this._connected) {
        render(null, this.shadowRoot);
        this._instance = null;
      }
    });
  }
  _resolveDef() {
    if (this._resolved) {
      return;
    }
    this._resolved = true;
    for (let i = 0; i < this.attributes.length; i++) {
      this._setAttr(this.attributes[i].name);
    }
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        this._setAttr(m.attributeName);
      }
    }).observe(this, { attributes: true });
    const resolve2 = (def2) => {
      const { props, styles } = def2;
      const hasOptions = !isArray$2(props);
      const rawKeys = props ? hasOptions ? Object.keys(props) : props : [];
      let numberProps;
      if (hasOptions) {
        for (const key in this._props) {
          const opt = props[key];
          if (opt === Number || opt && opt.type === Number) {
            this._props[key] = toNumber(this._props[key]);
            (numberProps || (numberProps = /* @__PURE__ */ Object.create(null)))[key] = true;
          }
        }
      }
      this._numberProps = numberProps;
      for (const key of Object.keys(this)) {
        if (key[0] !== "_") {
          this._setProp(key, this[key], true, false);
        }
      }
      for (const key of rawKeys.map(camelize)) {
        Object.defineProperty(this, key, {
          get() {
            return this._getProp(key);
          },
          set(val) {
            this._setProp(key, val);
          }
        });
      }
      this._applyStyles(styles);
      this._update();
    };
    const asyncDef = this._def.__asyncLoader;
    if (asyncDef) {
      asyncDef().then(resolve2);
    } else {
      resolve2(this._def);
    }
  }
  _setAttr(key) {
    let value = this.getAttribute(key);
    if (this._numberProps && this._numberProps[key]) {
      value = toNumber(value);
    }
    this._setProp(camelize(key), value, false);
  }
  _getProp(key) {
    return this._props[key];
  }
  _setProp(key, val, shouldReflect = true, shouldUpdate = true) {
    if (val !== this._props[key]) {
      this._props[key] = val;
      if (shouldUpdate && this._instance) {
        this._update();
      }
      if (shouldReflect) {
        if (val === true) {
          this.setAttribute(hyphenate(key), "");
        } else if (typeof val === "string" || typeof val === "number") {
          this.setAttribute(hyphenate(key), val + "");
        } else if (!val) {
          this.removeAttribute(hyphenate(key));
        }
      }
    }
  }
  _update() {
    render(this._createVNode(), this.shadowRoot);
  }
  _createVNode() {
    const vnode = createVNode(this._def, extend$2({}, this._props));
    if (!this._instance) {
      vnode.ce = (instance) => {
        this._instance = instance;
        instance.isCE = true;
        instance.emit = (event, ...args) => {
          this.dispatchEvent(new CustomEvent(event, {
            detail: args
          }));
        };
        let parent = this;
        while (parent = parent && (parent.parentNode || parent.host)) {
          if (parent instanceof VueElement) {
            instance.parent = parent._instance;
            break;
          }
        }
      };
    }
    return vnode;
  }
  _applyStyles(styles) {
    if (styles) {
      styles.forEach((css) => {
        const s = document.createElement("style");
        s.textContent = css;
        this.shadowRoot.appendChild(s);
      });
    }
  }
}
function useCssModule(name = "$style") {
  {
    const instance = getCurrentInstance();
    if (!instance) {
      return EMPTY_OBJ;
    }
    const modules = instance.type.__cssModules;
    if (!modules) {
      return EMPTY_OBJ;
    }
    const mod = modules[name];
    if (!mod) {
      return EMPTY_OBJ;
    }
    return mod;
  }
}
function useCssVars(getter) {
  const instance = getCurrentInstance();
  if (!instance) {
    return;
  }
  const setVars = () => setVarsOnVNode(instance.subTree, getter(instance.proxy));
  watchPostEffect(setVars);
  onMounted(() => {
    const ob = new MutationObserver(setVars);
    ob.observe(instance.subTree.el.parentNode, { childList: true });
    onUnmounted(() => ob.disconnect());
  });
}
function setVarsOnVNode(vnode, vars) {
  if (vnode.shapeFlag & 128) {
    const suspense = vnode.suspense;
    vnode = suspense.activeBranch;
    if (suspense.pendingBranch && !suspense.isHydrating) {
      suspense.effects.push(() => {
        setVarsOnVNode(suspense.activeBranch, vars);
      });
    }
  }
  while (vnode.component) {
    vnode = vnode.component.subTree;
  }
  if (vnode.shapeFlag & 1 && vnode.el) {
    setVarsOnNode(vnode.el, vars);
  } else if (vnode.type === Fragment) {
    vnode.children.forEach((c) => setVarsOnVNode(c, vars));
  } else if (vnode.type === Static) {
    let { el, anchor } = vnode;
    while (el) {
      setVarsOnNode(el, vars);
      if (el === anchor)
        break;
      el = el.nextSibling;
    }
  }
}
function setVarsOnNode(el, vars) {
  if (el.nodeType === 1) {
    const style = el.style;
    for (const key in vars) {
      style.setProperty(`--${key}`, vars[key]);
    }
  }
}
const TRANSITION = "transition";
const ANIMATION = "animation";
const Transition = (props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots);
Transition.displayName = "Transition";
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
const TransitionPropsValidators = Transition.props = /* @__PURE__ */ extend$2({}, BaseTransition.props, DOMTransitionPropsValidators);
const callHook = (hook, args = []) => {
  if (isArray$2(hook)) {
    hook.forEach((h2) => h2(...args));
  } else if (hook) {
    hook(...args);
  }
};
const hasExplicitCallback = (hook) => {
  return hook ? isArray$2(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps;
  }
  const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
  const finishEnter = (el, isAppear, done) => {
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve2 = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve2]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve2);
        }
      });
    };
  };
  return extend$2(baseProps, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve2 = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      forceReflow();
      addTransitionClass(el, leaveActiveClass);
      nextFrame(() => {
        if (!el._isLeaving) {
          return;
        }
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve2);
        }
      });
      callHook(onLeave, [el, resolve2]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject$1(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n = NumberOf(duration);
    return [n, n];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
  (el._vtc || (el._vtc = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const { _vtc } = el;
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el._vtc = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve2();
    }
  };
  if (explicitTimeout) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve2();
  }
  const endEvent = type + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e) => {
    if (e.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(TRANSITION + "Delay");
  const transitionDurations = getStyleProperties(TRANSITION + "Duration");
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(ANIMATION + "Delay");
  const animationDurations = getStyleProperties(ANIMATION + "Duration");
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(transform|all)(,|$)/.test(styles[TRANSITION + "Property"]);
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow() {
  return document.body.offsetHeight;
}
const positionMap = /* @__PURE__ */ new WeakMap();
const newPositionMap = /* @__PURE__ */ new WeakMap();
const TransitionGroupImpl = {
  name: "TransitionGroup",
  props: /* @__PURE__ */ extend$2({}, TransitionPropsValidators, {
    tag: String,
    moveClass: String
  }),
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevChildren;
    let children;
    onUpdated(() => {
      if (!prevChildren.length) {
        return;
      }
      const moveClass = props.moveClass || `${props.name || "v"}-move`;
      if (!hasCSSTransform(prevChildren[0].el, instance.vnode.el, moveClass)) {
        return;
      }
      prevChildren.forEach(callPendingCbs);
      prevChildren.forEach(recordPosition);
      const movedChildren = prevChildren.filter(applyTranslation);
      forceReflow();
      movedChildren.forEach((c) => {
        const el = c.el;
        const style = el.style;
        addTransitionClass(el, moveClass);
        style.transform = style.webkitTransform = style.transitionDuration = "";
        const cb = el._moveCb = (e) => {
          if (e && e.target !== el) {
            return;
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener("transitionend", cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        };
        el.addEventListener("transitionend", cb);
      });
    });
    return () => {
      const rawProps = toRaw(props);
      const cssTransitionProps = resolveTransitionProps(rawProps);
      let tag = rawProps.tag || Fragment;
      prevChildren = children;
      children = slots.default ? getTransitionRawChildren(slots.default()) : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.key != null) {
          setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
        }
      }
      if (prevChildren) {
        for (let i = 0; i < prevChildren.length; i++) {
          const child = prevChildren[i];
          setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
          positionMap.set(child, child.el.getBoundingClientRect());
        }
      }
      return createVNode(tag, null, children);
    };
  }
};
const TransitionGroup = TransitionGroupImpl;
function callPendingCbs(c) {
  const el = c.el;
  if (el._moveCb) {
    el._moveCb();
  }
  if (el._enterCb) {
    el._enterCb();
  }
}
function recordPosition(c) {
  newPositionMap.set(c, c.el.getBoundingClientRect());
}
function applyTranslation(c) {
  const oldPos = positionMap.get(c);
  const newPos = newPositionMap.get(c);
  const dx = oldPos.left - newPos.left;
  const dy = oldPos.top - newPos.top;
  if (dx || dy) {
    const s = c.el.style;
    s.transform = s.webkitTransform = `translate(${dx}px,${dy}px)`;
    s.transitionDuration = "0s";
    return c;
  }
}
function hasCSSTransform(el, root, moveClass) {
  const clone = el.cloneNode();
  if (el._vtc) {
    el._vtc.forEach((cls) => {
      cls.split(/\s+/).forEach((c) => c && clone.classList.remove(c));
    });
  }
  moveClass.split(/\s+/).forEach((c) => c && clone.classList.add(c));
  clone.style.display = "none";
  const container = root.nodeType === 1 ? root : root.parentNode;
  container.appendChild(clone);
  const { hasTransform } = getTransitionInfo(clone);
  container.removeChild(clone);
  return hasTransform;
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray$2(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const vModelText = {
  created(el, { modifiers: { lazy, trim: trim2, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing)
        return;
      let domValue = el.value;
      if (trim2) {
        domValue = domValue.trim();
      }
      if (castToNumber) {
        domValue = toNumber(domValue);
      }
      el._assign(domValue);
    });
    if (trim2) {
      addEventListener(el, "change", () => {
        el.value = el.value.trim();
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, modifiers: { lazy, trim: trim2, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    if (el.composing)
      return;
    if (document.activeElement === el && el.type !== "range") {
      if (lazy) {
        return;
      }
      if (trim2 && el.value.trim() === value) {
        return;
      }
      if ((number || el.type === "number") && toNumber(el.value) === value) {
        return;
      }
    }
    const newValue = value == null ? "" : value;
    if (el.value !== newValue) {
      el.value = newValue;
    }
  }
};
const vModelCheckbox = {
  deep: true,
  created(el, _, vnode) {
    el._assign = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue(el);
      const checked = el.checked;
      const assign2 = el._assign;
      if (isArray$2(modelValue)) {
        const index = looseIndexOf(modelValue, elementValue);
        const found = index !== -1;
        if (checked && !found) {
          assign2(modelValue.concat(elementValue));
        } else if (!checked && found) {
          const filtered = [...modelValue];
          filtered.splice(index, 1);
          assign2(filtered);
        }
      } else if (isSet(modelValue)) {
        const cloned = new Set(modelValue);
        if (checked) {
          cloned.add(elementValue);
        } else {
          cloned.delete(elementValue);
        }
        assign2(cloned);
      } else {
        assign2(getCheckboxValue(el, checked));
      }
    });
  },
  mounted: setChecked,
  beforeUpdate(el, binding, vnode) {
    el._assign = getModelAssigner(vnode);
    setChecked(el, binding, vnode);
  }
};
function setChecked(el, { value, oldValue }, vnode) {
  el._modelValue = value;
  if (isArray$2(value)) {
    el.checked = looseIndexOf(value, vnode.props.value) > -1;
  } else if (isSet(value)) {
    el.checked = value.has(vnode.props.value);
  } else if (value !== oldValue) {
    el.checked = looseEqual(value, getCheckboxValue(el, true));
  }
}
const vModelRadio = {
  created(el, { value }, vnode) {
    el.checked = looseEqual(value, vnode.props.value);
    el._assign = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      el._assign(getValue(el));
    });
  },
  beforeUpdate(el, { value, oldValue }, vnode) {
    el._assign = getModelAssigner(vnode);
    if (value !== oldValue) {
      el.checked = looseEqual(value, vnode.props.value);
    }
  }
};
const vModelSelect = {
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    const isSetModel = isSet(value);
    addEventListener(el, "change", () => {
      const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map((o) => number ? toNumber(getValue(o)) : getValue(o));
      el._assign(el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]);
    });
    el._assign = getModelAssigner(vnode);
  },
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, _binding, vnode) {
    el._assign = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    setSelected(el, value);
  }
};
function setSelected(el, value) {
  const isMultiple = el.multiple;
  if (isMultiple && !isArray$2(value) && !isSet(value)) {
    return;
  }
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i];
    const optionValue = getValue(option);
    if (isMultiple) {
      if (isArray$2(value)) {
        option.selected = looseIndexOf(value, optionValue) > -1;
      } else {
        option.selected = value.has(optionValue);
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i)
          el.selectedIndex = i;
        return;
      }
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) {
    el.selectedIndex = -1;
  }
}
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  return key in el ? el[key] : checked;
}
const vModelDynamic = {
  created(el, binding, vnode) {
    callModelHook(el, binding, vnode, null, "created");
  },
  mounted(el, binding, vnode) {
    callModelHook(el, binding, vnode, null, "mounted");
  },
  beforeUpdate(el, binding, vnode, prevVNode) {
    callModelHook(el, binding, vnode, prevVNode, "beforeUpdate");
  },
  updated(el, binding, vnode, prevVNode) {
    callModelHook(el, binding, vnode, prevVNode, "updated");
  }
};
function resolveDynamicModel(tagName, type) {
  switch (tagName) {
    case "SELECT":
      return vModelSelect;
    case "TEXTAREA":
      return vModelText;
    default:
      switch (type) {
        case "checkbox":
          return vModelCheckbox;
        case "radio":
          return vModelRadio;
        default:
          return vModelText;
      }
  }
}
function callModelHook(el, binding, vnode, prevVNode, hook) {
  const modelToUse = resolveDynamicModel(el.tagName, vnode.props && vnode.props.type);
  const fn = modelToUse[hook];
  fn && fn(el, binding, vnode, prevVNode);
}
function initVModelForSSR() {
  vModelText.getSSRProps = ({ value }) => ({ value });
  vModelRadio.getSSRProps = ({ value }, vnode) => {
    if (vnode.props && looseEqual(vnode.props.value, value)) {
      return { checked: true };
    }
  };
  vModelCheckbox.getSSRProps = ({ value }, vnode) => {
    if (isArray$2(value)) {
      if (vnode.props && looseIndexOf(value, vnode.props.value) > -1) {
        return { checked: true };
      }
    } else if (isSet(value)) {
      if (vnode.props && value.has(vnode.props.value)) {
        return { checked: true };
      }
    } else if (value) {
      return { checked: true };
    }
  };
  vModelDynamic.getSSRProps = (binding, vnode) => {
    if (typeof vnode.type !== "string") {
      return;
    }
    const modelToUse = resolveDynamicModel(
      vnode.type.toUpperCase(),
      vnode.props && vnode.props.type
    );
    if (modelToUse.getSSRProps) {
      return modelToUse.getSSRProps(binding, vnode);
    }
  };
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
const withModifiers = (fn, modifiers) => {
  return (event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers))
        return;
    }
    return fn(event, ...args);
  };
};
const keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
const withKeys = (fn, modifiers) => {
  return (event) => {
    if (!("key" in event)) {
      return;
    }
    const eventKey = hyphenate(event.key);
    if (modifiers.some((k) => k === eventKey || keyNames[k] === eventKey)) {
      return fn(event);
    }
  };
};
const vShow = {
  beforeMount(el, { value }, { transition }) {
    el._vod = el.style.display === "none" ? "" : el.style.display;
    if (transition && value) {
      transition.beforeEnter(el);
    } else {
      setDisplay(el, value);
    }
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el);
    }
  },
  updated(el, { value, oldValue }, { transition }) {
    if (!value === !oldValue)
      return;
    if (transition) {
      if (value) {
        transition.beforeEnter(el);
        setDisplay(el, true);
        transition.enter(el);
      } else {
        transition.leave(el, () => {
          setDisplay(el, false);
        });
      }
    } else {
      setDisplay(el, value);
    }
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value);
  }
};
function setDisplay(el, value) {
  el.style.display = value ? el._vod : "none";
}
function initVShowForSSR() {
  vShow.getSSRProps = ({ value }) => {
    if (!value) {
      return { style: { display: "none" } };
    }
  };
}
const rendererOptions = /* @__PURE__ */ extend$2({ patchProp }, nodeOps);
let renderer;
let enabledHydration = false;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
function ensureHydrationRenderer() {
  renderer = enabledHydration ? renderer : createHydrationRenderer(rendererOptions);
  enabledHydration = true;
  return renderer;
}
const render = (...args) => {
  ensureRenderer().render(...args);
};
const hydrate = (...args) => {
  ensureHydrationRenderer().hydrate(...args);
};
const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container)
      return;
    const component = app._component;
    if (!isFunction$1(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    container.innerHTML = "";
    const proxy = mount(container, false, container instanceof SVGElement);
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
};
const createSSRApp = (...args) => {
  const app = ensureHydrationRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (container) {
      return mount(container, true, container instanceof SVGElement);
    }
  };
  return app;
};
function normalizeContainer(container) {
  if (isString$1(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
let ssrDirectiveInitialized = false;
const initDirectivesForSSR = () => {
  if (!ssrDirectiveInitialized) {
    ssrDirectiveInitialized = true;
    initVModelForSSR();
    initVShowForSSR();
  }
};
const compile = () => {
};
const vue_runtime_esmBundler = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  compile,
  EffectScope,
  ReactiveEffect,
  customRef,
  effect,
  effectScope,
  getCurrentScope,
  isProxy,
  isReactive,
  isReadonly,
  isRef,
  isShallow,
  markRaw,
  onScopeDispose,
  proxyRefs,
  reactive,
  readonly,
  ref,
  shallowReactive,
  shallowReadonly,
  shallowRef,
  stop,
  toRaw,
  toRef,
  toRefs,
  triggerRef,
  unref,
  camelize,
  capitalize,
  normalizeClass,
  normalizeProps,
  normalizeStyle,
  toDisplayString,
  toHandlerKey,
  BaseTransition,
  Comment,
  Fragment,
  KeepAlive,
  Static,
  Suspense,
  Teleport,
  Text,
  callWithAsyncErrorHandling,
  callWithErrorHandling,
  cloneVNode,
  compatUtils,
  computed,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createElementVNode: createBaseVNode,
  createHydrationRenderer,
  createPropsRestProxy,
  createRenderer,
  createSlots,
  createStaticVNode,
  createTextVNode,
  createVNode,
  defineAsyncComponent,
  defineComponent,
  defineEmits,
  defineExpose,
  defineProps,
  get devtools() {
    return devtools;
  },
  getCurrentInstance,
  getTransitionRawChildren,
  guardReactiveProps,
  h,
  handleError,
  initCustomFormatter,
  inject,
  isMemoSame,
  isRuntimeOnly,
  isVNode,
  mergeDefaults,
  mergeProps,
  nextTick,
  onActivated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onDeactivated,
  onErrorCaptured,
  onMounted,
  onRenderTracked,
  onRenderTriggered,
  onServerPrefetch,
  onUnmounted,
  onUpdated,
  openBlock,
  popScopeId,
  provide,
  pushScopeId,
  queuePostFlushCb,
  registerRuntimeCompiler,
  renderList,
  renderSlot,
  resolveComponent,
  resolveDirective,
  resolveDynamicComponent,
  resolveFilter,
  resolveTransitionHooks,
  setBlockTracking,
  setDevtoolsHook,
  setTransitionHooks,
  ssrContextKey,
  ssrUtils,
  toHandlers,
  transformVNodeArgs,
  useAttrs,
  useSSRContext,
  useSlots,
  useTransitionState,
  version,
  warn,
  watch,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  withAsyncContext,
  withCtx,
  withDefaults,
  withDirectives,
  withMemo,
  withScopeId,
  Transition,
  TransitionGroup,
  VueElement,
  createApp,
  createSSRApp,
  defineCustomElement,
  defineSSRCustomElement,
  hydrate,
  initDirectivesForSSR,
  render,
  useCssModule,
  useCssVars,
  vModelCheckbox,
  vModelDynamic,
  vModelRadio,
  vModelSelect,
  vModelText,
  vShow,
  withKeys,
  withModifiers
}, Symbol.toStringTag, { value: "Module" }));
const _export_sfc$1 = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$7 = {};
function _sfc_render$3(_ctx, _cache) {
  const _component_router_view = resolveComponent("router-view");
  return openBlock(), createElementBlock("div", null, [
    createVNode(_component_router_view)
  ]);
}
const RunningApp = /* @__PURE__ */ _export_sfc$1(_sfc_main$7, [["render", _sfc_render$3]]);
const main = "";
var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$6 = {
  data() {
    return {
      innerValue: 1
    };
  },
  props: {
    modelValue: {
      type: Number
    },
    pageCount: {
      type: Number,
      required: true
    },
    initialPage: {
      type: Number,
      default: 1
    },
    forcePage: {
      type: Number
    },
    clickHandler: {
      type: Function,
      default: () => {
      }
    },
    pageRange: {
      type: Number,
      default: 3
    },
    marginPages: {
      type: Number,
      default: 1
    },
    prevText: {
      type: String,
      default: "Prev"
    },
    nextText: {
      type: String,
      default: "Next"
    },
    breakViewText: {
      type: String,
      default: "\u2026"
    },
    containerClass: {
      type: String,
      default: "pagination"
    },
    pageClass: {
      type: String,
      default: "page-item"
    },
    pageLinkClass: {
      type: String,
      default: "page-link"
    },
    prevClass: {
      type: String,
      default: "page-item"
    },
    prevLinkClass: {
      type: String,
      default: "page-link"
    },
    nextClass: {
      type: String,
      default: "page-item"
    },
    nextLinkClass: {
      type: String,
      default: "page-link"
    },
    breakViewClass: {
      type: String
    },
    breakViewLinkClass: {
      type: String
    },
    activeClass: {
      type: String,
      default: "active"
    },
    disabledClass: {
      type: String,
      default: "disabled"
    },
    noLiSurround: {
      type: Boolean,
      default: false
    },
    firstLastButton: {
      type: Boolean,
      default: false
    },
    firstButtonText: {
      type: String,
      default: "First"
    },
    lastButtonText: {
      type: String,
      default: "Last"
    },
    hidePrevNext: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    selected: {
      get: function() {
        return this.modelValue || this.innerValue;
      },
      set: function(newValue) {
        this.innerValue = newValue;
      }
    },
    pages: function() {
      let items = {};
      if (this.pageCount <= this.pageRange) {
        for (let index = 0; index < this.pageCount; index++) {
          let page = {
            index,
            content: index + 1,
            selected: index === this.selected - 1
          };
          items[index] = page;
        }
      } else {
        const halfPageRange = Math.floor(this.pageRange / 2);
        let setPageItem = (index) => {
          let page = {
            index,
            content: index + 1,
            selected: index === this.selected - 1
          };
          items[index] = page;
        };
        let setBreakView = (index) => {
          let breakView = {
            disabled: true,
            breakView: true
          };
          items[index] = breakView;
        };
        for (let i = 0; i < this.marginPages; i++) {
          setPageItem(i);
        }
        let selectedRangeLow = 0;
        if (this.selected - halfPageRange > 0) {
          selectedRangeLow = this.selected - 1 - halfPageRange;
        }
        let selectedRangeHigh = selectedRangeLow + this.pageRange - 1;
        if (selectedRangeHigh >= this.pageCount) {
          selectedRangeHigh = this.pageCount - 1;
          selectedRangeLow = selectedRangeHigh - this.pageRange + 1;
        }
        for (let i = selectedRangeLow; i <= selectedRangeHigh && i <= this.pageCount - 1; i++) {
          setPageItem(i);
        }
        if (selectedRangeLow > this.marginPages) {
          setBreakView(selectedRangeLow - 1);
        }
        if (selectedRangeHigh + 1 < this.pageCount - this.marginPages) {
          setBreakView(selectedRangeHigh + 1);
        }
        for (let i = this.pageCount - 1; i >= this.pageCount - this.marginPages; i--) {
          setPageItem(i);
        }
      }
      return items;
    }
  },
  methods: {
    handlePageSelected(selected) {
      if (this.selected === selected)
        return;
      this.innerValue = selected;
      this.$emit("update:modelValue", selected);
      this.clickHandler(selected);
    },
    prevPage() {
      if (this.selected <= 1)
        return;
      this.handlePageSelected(this.selected - 1);
    },
    nextPage() {
      if (this.selected >= this.pageCount)
        return;
      this.handlePageSelected(this.selected + 1);
    },
    firstPageSelected() {
      return this.selected === 1;
    },
    lastPageSelected() {
      return this.selected === this.pageCount || this.pageCount === 0;
    },
    selectFirstPage() {
      if (this.selected <= 1)
        return;
      this.handlePageSelected(1);
    },
    selectLastPage() {
      if (this.selected >= this.pageCount)
        return;
      this.handlePageSelected(this.pageCount);
    }
  },
  beforeMount() {
    this.innerValue = this.initialPage;
  },
  beforeUpdate() {
    if (this.forcePage === void 0)
      return;
    if (this.forcePage !== this.selected) {
      this.selected = this.forcePage;
    }
  }
};
const _hoisted_1$6 = ["tabindex", "innerHTML"];
const _hoisted_2$6 = ["tabindex", "innerHTML"];
const _hoisted_3$5 = ["onClick", "onKeyup"];
const _hoisted_4$6 = ["tabindex", "innerHTML"];
const _hoisted_5$5 = ["tabindex", "innerHTML"];
const _hoisted_6$5 = ["innerHTML"];
const _hoisted_7$5 = ["innerHTML"];
const _hoisted_8$4 = ["onClick", "onKeyup"];
const _hoisted_9$4 = ["innerHTML"];
const _hoisted_10$3 = ["innerHTML"];
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return !$props.noLiSurround ? (openBlock(), createElementBlock("ul", {
    key: 0,
    class: normalizeClass($props.containerClass)
  }, [
    $props.firstLastButton ? (openBlock(), createElementBlock("li", {
      key: 0,
      class: normalizeClass([$props.pageClass, $options.firstPageSelected() ? $props.disabledClass : ""])
    }, [
      createBaseVNode("a", {
        onClick: _cache[0] || (_cache[0] = ($event) => $options.selectFirstPage()),
        onKeyup: _cache[1] || (_cache[1] = withKeys(($event) => $options.selectFirstPage(), ["enter"])),
        class: normalizeClass($props.pageLinkClass),
        tabindex: $options.firstPageSelected() ? -1 : 0,
        innerHTML: $props.firstButtonText
      }, null, 42, _hoisted_1$6)
    ], 2)) : createCommentVNode("", true),
    !($options.firstPageSelected() && $props.hidePrevNext) ? (openBlock(), createElementBlock("li", {
      key: 1,
      class: normalizeClass([$props.prevClass, $options.firstPageSelected() ? $props.disabledClass : ""])
    }, [
      createBaseVNode("a", {
        onClick: _cache[2] || (_cache[2] = ($event) => $options.prevPage()),
        onKeyup: _cache[3] || (_cache[3] = withKeys(($event) => $options.prevPage(), ["enter"])),
        class: normalizeClass($props.prevLinkClass),
        tabindex: $options.firstPageSelected() ? -1 : 0,
        innerHTML: $props.prevText
      }, null, 42, _hoisted_2$6)
    ], 2)) : createCommentVNode("", true),
    (openBlock(true), createElementBlock(Fragment, null, renderList($options.pages, (page) => {
      return openBlock(), createElementBlock("li", {
        key: page.index,
        class: normalizeClass([$props.pageClass, page.selected ? $props.activeClass : "", page.disabled ? $props.disabledClass : "", page.breakView ? $props.breakViewClass : ""])
      }, [
        page.breakView ? (openBlock(), createElementBlock("a", {
          key: 0,
          class: normalizeClass([$props.pageLinkClass, $props.breakViewLinkClass]),
          tabindex: "0"
        }, [
          renderSlot(_ctx.$slots, "breakViewContent", {}, () => [
            createTextVNode(toDisplayString($props.breakViewText), 1)
          ])
        ], 2)) : page.disabled ? (openBlock(), createElementBlock("a", {
          key: 1,
          class: normalizeClass($props.pageLinkClass),
          tabindex: "0"
        }, toDisplayString(page.content), 3)) : (openBlock(), createElementBlock("a", {
          key: 2,
          onClick: ($event) => $options.handlePageSelected(page.index + 1),
          onKeyup: withKeys(($event) => $options.handlePageSelected(page.index + 1), ["enter"]),
          class: normalizeClass($props.pageLinkClass),
          tabindex: "0"
        }, toDisplayString(page.content), 43, _hoisted_3$5))
      ], 2);
    }), 128)),
    !($options.lastPageSelected() && $props.hidePrevNext) ? (openBlock(), createElementBlock("li", {
      key: 2,
      class: normalizeClass([$props.nextClass, $options.lastPageSelected() ? $props.disabledClass : ""])
    }, [
      createBaseVNode("a", {
        onClick: _cache[4] || (_cache[4] = ($event) => $options.nextPage()),
        onKeyup: _cache[5] || (_cache[5] = withKeys(($event) => $options.nextPage(), ["enter"])),
        class: normalizeClass($props.nextLinkClass),
        tabindex: $options.lastPageSelected() ? -1 : 0,
        innerHTML: $props.nextText
      }, null, 42, _hoisted_4$6)
    ], 2)) : createCommentVNode("", true),
    $props.firstLastButton ? (openBlock(), createElementBlock("li", {
      key: 3,
      class: normalizeClass([$props.pageClass, $options.lastPageSelected() ? $props.disabledClass : ""])
    }, [
      createBaseVNode("a", {
        onClick: _cache[6] || (_cache[6] = ($event) => $options.selectLastPage()),
        onKeyup: _cache[7] || (_cache[7] = withKeys(($event) => $options.selectLastPage(), ["enter"])),
        class: normalizeClass($props.pageLinkClass),
        tabindex: $options.lastPageSelected() ? -1 : 0,
        innerHTML: $props.lastButtonText
      }, null, 42, _hoisted_5$5)
    ], 2)) : createCommentVNode("", true)
  ], 2)) : (openBlock(), createElementBlock("div", {
    key: 1,
    class: normalizeClass($props.containerClass)
  }, [
    $props.firstLastButton ? (openBlock(), createElementBlock("a", {
      key: 0,
      onClick: _cache[8] || (_cache[8] = ($event) => $options.selectFirstPage()),
      onKeyup: _cache[9] || (_cache[9] = withKeys(($event) => $options.selectFirstPage(), ["enter"])),
      class: normalizeClass([$props.pageLinkClass, $options.firstPageSelected() ? $props.disabledClass : ""]),
      tabindex: "0",
      innerHTML: $props.firstButtonText
    }, null, 42, _hoisted_6$5)) : createCommentVNode("", true),
    !($options.firstPageSelected() && $props.hidePrevNext) ? (openBlock(), createElementBlock("a", {
      key: 1,
      onClick: _cache[10] || (_cache[10] = ($event) => $options.prevPage()),
      onKeyup: _cache[11] || (_cache[11] = withKeys(($event) => $options.prevPage(), ["enter"])),
      class: normalizeClass([$props.prevLinkClass, $options.firstPageSelected() ? $props.disabledClass : ""]),
      tabindex: "0",
      innerHTML: $props.prevText
    }, null, 42, _hoisted_7$5)) : createCommentVNode("", true),
    (openBlock(true), createElementBlock(Fragment, null, renderList($options.pages, (page) => {
      return openBlock(), createElementBlock(Fragment, null, [
        page.breakView ? (openBlock(), createElementBlock("a", {
          key: page.index,
          class: normalizeClass([$props.pageLinkClass, $props.breakViewLinkClass, page.disabled ? $props.disabledClass : ""]),
          tabindex: "0"
        }, [
          renderSlot(_ctx.$slots, "breakViewContent", {}, () => [
            createTextVNode(toDisplayString($props.breakViewText), 1)
          ])
        ], 2)) : page.disabled ? (openBlock(), createElementBlock("a", {
          key: page.index,
          class: normalizeClass([$props.pageLinkClass, page.selected ? $props.activeClass : "", $props.disabledClass]),
          tabindex: "0"
        }, toDisplayString(page.content), 3)) : (openBlock(), createElementBlock("a", {
          key: page.index,
          onClick: ($event) => $options.handlePageSelected(page.index + 1),
          onKeyup: withKeys(($event) => $options.handlePageSelected(page.index + 1), ["enter"]),
          class: normalizeClass([$props.pageLinkClass, page.selected ? $props.activeClass : ""]),
          tabindex: "0"
        }, toDisplayString(page.content), 43, _hoisted_8$4))
      ], 64);
    }), 256)),
    !($options.lastPageSelected() && $props.hidePrevNext) ? (openBlock(), createElementBlock("a", {
      key: 2,
      onClick: _cache[12] || (_cache[12] = ($event) => $options.nextPage()),
      onKeyup: _cache[13] || (_cache[13] = withKeys(($event) => $options.nextPage(), ["enter"])),
      class: normalizeClass([$props.nextLinkClass, $options.lastPageSelected() ? $props.disabledClass : ""]),
      tabindex: "0",
      innerHTML: $props.nextText
    }, null, 42, _hoisted_9$4)) : createCommentVNode("", true),
    $props.firstLastButton ? (openBlock(), createElementBlock("a", {
      key: 3,
      onClick: _cache[14] || (_cache[14] = ($event) => $options.selectLastPage()),
      onKeyup: _cache[15] || (_cache[15] = withKeys(($event) => $options.selectLastPage(), ["enter"])),
      class: normalizeClass([$props.pageLinkClass, $options.lastPageSelected() ? $props.disabledClass : ""]),
      tabindex: "0",
      innerHTML: $props.lastButtonText
    }, null, 42, _hoisted_10$3)) : createCommentVNode("", true)
  ], 2));
}
var Paginate = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$2]]);
/*!
  * vue-router v4.1.6
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */
const isBrowser = typeof window !== "undefined";
function isESModule(obj) {
  return obj.__esModule || obj[Symbol.toStringTag] === "Module";
}
const assign = Object.assign;
function applyToParams(fn, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = isArray$1(value) ? value.map(fn) : fn(value);
  }
  return newParams;
}
const noop$1 = () => {
};
const isArray$1 = Array.isArray;
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
function parseURL(parseQuery2, location2, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const hashPos = location2.indexOf("#");
  let searchPos = location2.indexOf("?");
  if (hashPos < searchPos && hashPos >= 0) {
    searchPos = -1;
  }
  if (searchPos > -1) {
    path = location2.slice(0, searchPos);
    searchString = location2.slice(searchPos + 1, hashPos > -1 ? hashPos : location2.length);
    query = parseQuery2(searchString);
  }
  if (hashPos > -1) {
    path = path || location2.slice(0, hashPos);
    hash = location2.slice(hashPos, location2.length);
  }
  path = resolveRelativePath(path != null ? path : location2, currentLocation);
  return {
    fullPath: path + (searchString && "?") + searchString + hash,
    path,
    query,
    hash
  };
}
function stringifyURL(stringifyQuery2, location2) {
  const query = location2.query ? stringifyQuery2(location2.query) : "";
  return location2.path + (query && "?") + query + (location2.hash || "");
}
function stripBase(pathname, base) {
  if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
    return pathname;
  return pathname.slice(base.length) || "/";
}
function isSameRouteLocation(stringifyQuery2, a, b) {
  const aLastIndex = a.matched.length - 1;
  const bLastIndex = b.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery2(a.query) === stringifyQuery2(b.query) && a.hash === b.hash;
}
function isSameRouteRecord(a, b) {
  return (a.aliasOf || a) === (b.aliasOf || b);
}
function isSameRouteLocationParams(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length)
    return false;
  for (const key in a) {
    if (!isSameRouteLocationParamsValue(a[key], b[key]))
      return false;
  }
  return true;
}
function isSameRouteLocationParamsValue(a, b) {
  return isArray$1(a) ? isEquivalentArray(a, b) : isArray$1(b) ? isEquivalentArray(b, a) : a === b;
}
function isEquivalentArray(a, b) {
  return isArray$1(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
}
function resolveRelativePath(to, from) {
  if (to.startsWith("/"))
    return to;
  if (!to)
    return from;
  const fromSegments = from.split("/");
  const toSegments = to.split("/");
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (segment === ".")
      continue;
    if (segment === "..") {
      if (position > 1)
        position--;
    } else
      break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition - (toPosition === toSegments.length ? 1 : 0)).join("/");
}
var NavigationType;
(function(NavigationType2) {
  NavigationType2["pop"] = "pop";
  NavigationType2["push"] = "push";
})(NavigationType || (NavigationType = {}));
var NavigationDirection;
(function(NavigationDirection2) {
  NavigationDirection2["back"] = "back";
  NavigationDirection2["forward"] = "forward";
  NavigationDirection2["unknown"] = "";
})(NavigationDirection || (NavigationDirection = {}));
function normalizeBase(base) {
  if (!base) {
    if (isBrowser) {
      const baseEl = document.querySelector("base");
      base = baseEl && baseEl.getAttribute("href") || "/";
      base = base.replace(/^\w+:\/\/[^\/]+/, "");
    } else {
      base = "/";
    }
  }
  if (base[0] !== "/" && base[0] !== "#")
    base = "/" + base;
  return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location2) {
  return base.replace(BEFORE_HASH_RE, "#") + location2;
}
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
const computeScrollPosition = () => ({
  left: window.pageXOffset,
  top: window.pageYOffset
});
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    const positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else {
    scrollToOptions = position;
  }
  if ("scrollBehavior" in document.documentElement.style)
    window.scrollTo(scrollToOptions);
  else {
    window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.pageXOffset, scrollToOptions.top != null ? scrollToOptions.top : window.pageYOffset);
  }
}
function getScrollKey(path, delta) {
  const position = history.state ? history.state.position - delta : -1;
  return position + path;
}
const scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
let createBaseLocation = () => location.protocol + "//" + location.host;
function createCurrentLocation(base, location2) {
  const { pathname, search, hash } = location2;
  const hashPos = base.indexOf("#");
  if (hashPos > -1) {
    let slicePos = hash.includes(base.slice(hashPos)) ? base.slice(hashPos).length : 1;
    let pathFromHash = hash.slice(slicePos);
    if (pathFromHash[0] !== "/")
      pathFromHash = "/" + pathFromHash;
    return stripBase(pathFromHash, "");
  }
  const path = stripBase(pathname, base);
  return path + search + hash;
}
function useHistoryListeners(base, historyState, currentLocation, replace) {
  let listeners = [];
  let teardowns = [];
  let pauseState = null;
  const popStateHandler = ({ state }) => {
    const to = createCurrentLocation(base, location);
    const from = currentLocation.value;
    const fromState = historyState.value;
    let delta = 0;
    if (state) {
      currentLocation.value = to;
      historyState.value = state;
      if (pauseState && pauseState === from) {
        pauseState = null;
        return;
      }
      delta = fromState ? state.position - fromState.position : 0;
    } else {
      replace(to);
    }
    listeners.forEach((listener) => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta ? delta > 0 ? NavigationDirection.forward : NavigationDirection.back : NavigationDirection.unknown
      });
    });
  };
  function pauseListeners() {
    pauseState = currentLocation.value;
  }
  function listen(callback) {
    listeners.push(callback);
    const teardown = () => {
      const index = listeners.indexOf(callback);
      if (index > -1)
        listeners.splice(index, 1);
    };
    teardowns.push(teardown);
    return teardown;
  }
  function beforeUnloadListener() {
    const { history: history2 } = window;
    if (!history2.state)
      return;
    history2.replaceState(assign({}, history2.state, { scroll: computeScrollPosition() }), "");
  }
  function destroy() {
    for (const teardown of teardowns)
      teardown();
    teardowns = [];
    window.removeEventListener("popstate", popStateHandler);
    window.removeEventListener("beforeunload", beforeUnloadListener);
  }
  window.addEventListener("popstate", popStateHandler);
  window.addEventListener("beforeunload", beforeUnloadListener);
  return {
    pauseListeners,
    listen,
    destroy
  };
}
function buildState(back, current, forward, replaced = false, computeScroll = false) {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length,
    scroll: computeScroll ? computeScrollPosition() : null
  };
}
function useHistoryStateNavigation(base) {
  const { history: history2, location: location2 } = window;
  const currentLocation = {
    value: createCurrentLocation(base, location2)
  };
  const historyState = { value: history2.state };
  if (!historyState.value) {
    changeLocation(currentLocation.value, {
      back: null,
      current: currentLocation.value,
      forward: null,
      position: history2.length - 1,
      replaced: true,
      scroll: null
    }, true);
  }
  function changeLocation(to, state, replace2) {
    const hashIndex = base.indexOf("#");
    const url = hashIndex > -1 ? (location2.host && document.querySelector("base") ? base : base.slice(hashIndex)) + to : createBaseLocation() + base + to;
    try {
      history2[replace2 ? "replaceState" : "pushState"](state, "", url);
      historyState.value = state;
    } catch (err) {
      {
        console.error(err);
      }
      location2[replace2 ? "replace" : "assign"](url);
    }
  }
  function replace(to, data) {
    const state = assign({}, history2.state, buildState(
      historyState.value.back,
      to,
      historyState.value.forward,
      true
    ), data, { position: historyState.value.position });
    changeLocation(to, state, true);
    currentLocation.value = to;
  }
  function push(to, data) {
    const currentState = assign(
      {},
      historyState.value,
      history2.state,
      {
        forward: to,
        scroll: computeScrollPosition()
      }
    );
    changeLocation(currentState.current, currentState, true);
    const state = assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data);
    changeLocation(to, state, false);
    currentLocation.value = to;
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  };
}
function createWebHistory(base) {
  base = normalizeBase(base);
  const historyNavigation = useHistoryStateNavigation(base);
  const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
  function go(delta, triggerListeners = true) {
    if (!triggerListeners)
      historyListeners.pauseListeners();
    history.go(delta);
  }
  const routerHistory = assign({
    location: "",
    base,
    go,
    createHref: createHref.bind(null, base)
  }, historyNavigation, historyListeners);
  Object.defineProperty(routerHistory, "location", {
    enumerable: true,
    get: () => historyNavigation.location.value
  });
  Object.defineProperty(routerHistory, "state", {
    enumerable: true,
    get: () => historyNavigation.state.value
  });
  return routerHistory;
}
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
const START_LOCATION_NORMALIZED = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
const NavigationFailureSymbol = Symbol("");
var NavigationFailureType;
(function(NavigationFailureType2) {
  NavigationFailureType2[NavigationFailureType2["aborted"] = 4] = "aborted";
  NavigationFailureType2[NavigationFailureType2["cancelled"] = 8] = "cancelled";
  NavigationFailureType2[NavigationFailureType2["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));
function createRouterError(type, params) {
  {
    return assign(new Error(), {
      type,
      [NavigationFailureSymbol]: true
    }, params);
  }
}
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  const score = [];
  let pattern = options.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [90];
    if (options.strict && !segment.length)
      pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = 40 + (options.sensitive ? 0.25 : 0);
      if (token.type === 0) {
        if (!tokenIndex)
          pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += 40;
      } else if (token.type === 1) {
        const { value, repeatable, optional, regexp } = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re2 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re2 !== BASE_PARAM_PATTERN) {
          subSegmentScore += 10;
          try {
            new RegExp(`(${re2})`);
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re2}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re2})(?:/(?:${re2}))*)` : `(${re2})`;
        if (!tokenIndex)
          subPattern = optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional)
          subPattern += "?";
        pattern += subPattern;
        subSegmentScore += 20;
        if (optional)
          subSegmentScore += -8;
        if (repeatable)
          subSegmentScore += -20;
        if (re2 === ".*")
          subSegmentScore += -50;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options.strict && options.end) {
    const i = score.length - 1;
    score[i][score[i].length - 1] += 0.7000000000000001;
  }
  if (!options.strict)
    pattern += "/?";
  if (options.end)
    pattern += "$";
  else if (options.strict)
    pattern += "(?:/|$)";
  const re = new RegExp(pattern, options.sensitive ? "" : "i");
  function parse(path) {
    const match = path.match(re);
    const params = {};
    if (!match)
      return null;
    for (let i = 1; i < match.length; i++) {
      const value = match[i] || "";
      const key = keys[i - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/"))
        path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) {
        if (token.type === 0) {
          path += token.value;
        } else if (token.type === 1) {
          const { value, repeatable, optional } = token;
          const param = value in params ? params[value] : "";
          if (isArray$1(param) && !repeatable) {
            throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
          }
          const text = isArray$1(param) ? param.join("/") : param;
          if (!text) {
            if (optional) {
              if (segment.length < 2) {
                if (path.endsWith("/"))
                  path = path.slice(0, -1);
                else
                  avoidDuplicatedSlash = true;
              }
            } else
              throw new Error(`Missing required param "${value}"`);
          }
          path += text;
        }
      }
    }
    return path || "/";
  }
  return {
    re,
    score,
    keys,
    parse,
    stringify
  };
}
function compareScoreArray(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    const diff = b[i] - a[i];
    if (diff)
      return diff;
    i++;
  }
  if (a.length < b.length) {
    return a.length === 1 && a[0] === 40 + 40 ? -1 : 1;
  } else if (a.length > b.length) {
    return b.length === 1 && b[0] === 40 + 40 ? 1 : -1;
  }
  return 0;
}
function comparePathParserScore(a, b) {
  let i = 0;
  const aScore = a.score;
  const bScore = b.score;
  while (i < aScore.length && i < bScore.length) {
    const comp = compareScoreArray(aScore[i], bScore[i]);
    if (comp)
      return comp;
    i++;
  }
  if (Math.abs(bScore.length - aScore.length) === 1) {
    if (isLastScoreNegative(aScore))
      return 1;
    if (isLastScoreNegative(bScore))
      return -1;
  }
  return bScore.length - aScore.length;
}
function isLastScoreNegative(score) {
  const last = score[score.length - 1];
  return score.length > 0 && last[last.length - 1] < 0;
}
const ROOT_TOKEN = {
  type: 0,
  value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path)
    return [[]];
  if (path === "/")
    return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) {
    throw new Error(`Invalid path "${path}"`);
  }
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer2}": ${message}`);
  }
  let state = 0;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment)
      tokens.push(segment);
    segment = [];
  }
  let i = 0;
  let char;
  let buffer2 = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer2)
      return;
    if (state === 0) {
      segment.push({
        type: 0,
        value: buffer2
      });
    } else if (state === 1 || state === 2 || state === 3) {
      if (segment.length > 1 && (char === "*" || char === "+"))
        crash(`A repeatable param (${buffer2}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: 1,
        value: buffer2,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else {
      crash("Invalid state to consume buffer");
    }
    buffer2 = "";
  }
  function addCharToBuffer() {
    buffer2 += char;
  }
  while (i < path.length) {
    char = path[i++];
    if (char === "\\" && state !== 2) {
      previousState = state;
      state = 4;
      continue;
    }
    switch (state) {
      case 0:
        if (char === "/") {
          if (buffer2) {
            consumeBuffer();
          }
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = 1;
        } else {
          addCharToBuffer();
        }
        break;
      case 4:
        addCharToBuffer();
        state = previousState;
        break;
      case 1:
        if (char === "(") {
          state = 2;
        } else if (VALID_PARAM_RE.test(char)) {
          addCharToBuffer();
        } else {
          consumeBuffer();
          state = 0;
          if (char !== "*" && char !== "?" && char !== "+")
            i--;
        }
        break;
      case 2:
        if (char === ")") {
          if (customRe[customRe.length - 1] == "\\")
            customRe = customRe.slice(0, -1) + char;
          else
            state = 3;
        } else {
          customRe += char;
        }
        break;
      case 3:
        consumeBuffer();
        state = 0;
        if (char !== "*" && char !== "?" && char !== "+")
          i--;
        customRe = "";
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === 2)
    crash(`Unfinished custom RegExp for param "${buffer2}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
function createRouteRecordMatcher(record, parent, options) {
  const parser = tokensToParser(tokenizePath(record.path), options);
  const matcher = assign(parser, {
    record,
    parent,
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf)
      parent.children.push(matcher);
  }
  return matcher;
}
function createRouterMatcher(routes2, globalOptions) {
  const matchers = [];
  const matcherMap = /* @__PURE__ */ new Map();
  globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  function addRoute(record, parent, originalRecord) {
    const isRootAdd = !originalRecord;
    const mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options = mergeOptions(globalOptions, record);
    const normalizedRecords = [
      mainNormalizedRecord
    ];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) {
        normalizedRecords.push(assign({}, mainNormalizedRecord, {
          components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
          path: alias,
          aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
        }));
      }
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;
      if (parent && path[0] !== "/") {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher)
          originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher))
          removeRoute(record.name);
      }
      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children;
        for (let i = 0; i < children.length; i++) {
          addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
        }
      }
      originalRecord = originalRecord || matcher;
      if (matcher.record.components && Object.keys(matcher.record.components).length || matcher.record.name || matcher.record.redirect) {
        insertMatcher(matcher);
      }
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop$1;
  }
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name)
          matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  function getRoutes() {
    return matchers;
  }
  function insertMatcher(matcher) {
    let i = 0;
    while (i < matchers.length && comparePathParserScore(matcher, matchers[i]) >= 0 && (matcher.record.path !== matchers[i].record.path || !isRecordChildOf(matcher, matchers[i])))
      i++;
    matchers.splice(i, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher))
      matcherMap.set(matcher.record.name, matcher);
  }
  function resolve2(location2, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location2 && location2.name) {
      matcher = matcherMap.get(location2.name);
      if (!matcher)
        throw createRouterError(1, {
          location: location2
        });
      name = matcher.record.name;
      params = assign(
        paramsFromLocation(
          currentLocation.params,
          matcher.keys.filter((k) => !k.optional).map((k) => k.name)
        ),
        location2.params && paramsFromLocation(location2.params, matcher.keys.map((k) => k.name))
      );
      path = matcher.stringify(params);
    } else if ("path" in location2) {
      path = location2.path;
      matcher = matchers.find((m) => m.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
      if (!matcher)
        throw createRouterError(1, {
          location: location2,
          currentLocation
        });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location2.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  routes2.forEach((route) => addRoute(route));
  return { addRoute, resolve: resolve2, removeRoute, getRoutes, getRecordMatcher };
}
function paramsFromLocation(params, keys) {
  const newParams = {};
  for (const key of keys) {
    if (key in params)
      newParams[key] = params[key];
  }
  return newParams;
}
function normalizeRouteRecord(record) {
  return {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: void 0,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: /* @__PURE__ */ new Set(),
    updateGuards: /* @__PURE__ */ new Set(),
    enterCallbacks: {},
    components: "components" in record ? record.components || null : record.component && { default: record.component }
  };
}
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) {
    propsObject.default = props;
  } else {
    for (const name in record.components)
      propsObject[name] = typeof props === "boolean" ? props : props[name];
  }
  return propsObject;
}
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf)
      return true;
    record = record.parent;
  }
  return false;
}
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
function mergeOptions(defaults2, partialOptions) {
  const options = {};
  for (const key in defaults2) {
    options[key] = key in partialOptions ? partialOptions[key] : defaults2[key];
  }
  return options;
}
function isRecordChildOf(record, parent) {
  return parent.children.some((child) => child === record || isRecordChildOf(record, child));
}
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
function encodeParam(text) {
  return text == null ? "" : encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
  }
  return "" + text;
}
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?")
    return query;
  const hasLeadingIM = search[0] === "?";
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split("&");
  for (let i = 0; i < searchParams.length; ++i) {
    const searchParam = searchParams[i].replace(PLUS_RE, " ");
    const eqPos = searchParam.indexOf("=");
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!isArray$1(currentValue)) {
        currentValue = query[key] = [currentValue];
      }
      currentValue.push(value);
    } else {
      query[key] = value;
    }
  }
  return query;
}
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0) {
        search += (search.length ? "&" : "") + key;
      }
      continue;
    }
    const values = isArray$1(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)];
    values.forEach((value2) => {
      if (value2 !== void 0) {
        search += (search.length ? "&" : "") + key;
        if (value2 != null)
          search += "=" + value2;
      }
    });
  }
  return search;
}
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (const key in query) {
    const value = query[key];
    if (value !== void 0) {
      normalizedQuery[key] = isArray$1(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
    }
  }
  return normalizedQuery;
}
const matchedRouteKey = Symbol("");
const viewDepthKey = Symbol("");
const routerKey = Symbol("");
const routeLocationKey = Symbol("");
const routerViewLocationKey = Symbol("");
function useCallbacks() {
  let handlers = [];
  function add2(handler) {
    handlers.push(handler);
    return () => {
      const i = handlers.indexOf(handler);
      if (i > -1)
        handlers.splice(i, 1);
    };
  }
  function reset() {
    handlers = [];
  }
  return {
    add: add2,
    list: () => handlers,
    reset
  };
}
function guardToPromiseFn(guard, to, from, record, name) {
  const enterCallbackArray = record && (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve2, reject) => {
    const next = (valid) => {
      if (valid === false) {
        reject(createRouterError(4, {
          from,
          to
        }));
      } else if (valid instanceof Error) {
        reject(valid);
      } else if (isRouteLocation(valid)) {
        reject(createRouterError(2, {
          from: to,
          to: valid
        }));
      } else {
        if (enterCallbackArray && record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function") {
          enterCallbackArray.push(valid);
        }
        resolve2();
      }
    };
    const guardReturn = guard.call(record && record.instances[name], to, from, next);
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3)
      guardCall = guardCall.then(next);
    guardCall.catch((err) => reject(err));
  });
}
function extractComponentsGuards(matched, guardType, to, from) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      if (guardType !== "beforeRouteEnter" && !record.instances[name])
        continue;
      if (isRouteComponent(rawComponent)) {
        const options = rawComponent.__vccOpts || rawComponent;
        const guard = options[guardType];
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
      } else {
        let componentPromise = rawComponent();
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved)
            return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.components[name] = resolvedComponent;
          const options = resolvedComponent.__vccOpts || resolvedComponent;
          const guard = options[guardType];
          return guard && guardToPromiseFn(guard, to, from, record, name)();
        }));
      }
    }
  }
  return guards;
}
function isRouteComponent(component) {
  return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
function useLink(props) {
  const router2 = inject(routerKey);
  const currentRoute = inject(routeLocationKey);
  const route = computed(() => router2.resolve(unref(props.to)));
  const activeRecordIndex = computed(() => {
    const { matched } = route.value;
    const { length } = matched;
    const routeMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length)
      return -1;
    const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index > -1)
      return index;
    const parentRecordPath = getOriginalPath(matched[length - 2]);
    return length > 1 && getOriginalPath(routeMatched) === parentRecordPath && currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index;
  });
  const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e = {}) {
    if (guardEvent(e)) {
      return router2[unref(props.replace) ? "replace" : "push"](
        unref(props.to)
      ).catch(noop$1);
    }
    return Promise.resolve();
  }
  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
const RouterLinkImpl = /* @__PURE__ */ defineComponent({
  name: "RouterLink",
  compatConfig: { MODE: 3 },
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    }
  },
  useLink,
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const { options } = inject(routerKey);
    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && slots.default(link);
      return props.custom ? children : h("a", {
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        href: link.href,
        onClick: link.navigate,
        class: elClass.value
      }, children);
    };
  }
});
const RouterLink = RouterLinkImpl;
function guardEvent(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
    return;
  if (e.defaultPrevented)
    return;
  if (e.button !== void 0 && e.button !== 0)
    return;
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target))
      return;
  }
  if (e.preventDefault)
    e.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue)
        return false;
    } else {
      if (!isArray$1(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value !== outerValue[i]))
        return false;
    }
  }
  return true;
}
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
const RouterViewImpl = /* @__PURE__ */ defineComponent({
  name: "RouterView",
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  compatConfig: { MODE: 3 },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.value;
      let matchedRoute;
      while ((matchedRoute = matched[initialDepth]) && !matchedRoute.components) {
        initialDepth++;
      }
      return initialDepth;
    });
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);
    provide(viewDepthKey, computed(() => depth.value + 1));
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);
    const viewRef = ref();
    watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
      if (to) {
        to.instances[name] = instance;
        if (from && from !== to && instance && instance === oldInstance) {
          if (!to.leaveGuards.size) {
            to.leaveGuards = from.leaveGuards;
          }
          if (!to.updateGuards.size) {
            to.updateGuards = from.updateGuards;
          }
        }
      }
      if (instance && to && (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
        (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
      }
    }, { flush: "post" });
    return () => {
      const route = routeToDisplay.value;
      const currentName = props.name;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[currentName];
      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route });
      }
      const routePropsOption = matchedRoute.props[currentName];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null;
        }
      };
      const component = h(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return normalizeSlot(slots.default, { Component: component, route }) || component;
    };
  }
});
function normalizeSlot(slot, data) {
  if (!slot)
    return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
const RouterView = RouterViewImpl;
function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  const parseQuery$1 = options.parseQuery || parseQuery;
  const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
  const routerHistory = options.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && options.scrollBehavior && "scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = applyToParams.bind(null, decode);
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else {
      record = parentOrRoute;
    }
    return matcher.addRoute(record, parent);
  }
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher);
    }
  }
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  function resolve2(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      const matchedRoute2 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
      const href2 = routerHistory.createHref(locationNormalized.fullPath);
      return assign(locationNormalized, matchedRoute2, {
        params: decodeParams(matchedRoute2.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href2
      });
    }
    let matcherLocation;
    if ("path" in rawLocation) {
      matcherLocation = assign({}, rawLocation, {
        path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path
      });
    } else {
      const targetParams = assign({}, rawLocation.params);
      for (const key in targetParams) {
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }
      matcherLocation = assign({}, rawLocation, {
        params: encodeParams(rawLocation.params)
      });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    const href = routerHistory.createHref(fullPath);
    return assign({
      fullPath,
      hash,
      query: stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  function locationAsObject(to) {
    return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
  }
  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) {
      return createRouterError(8, {
        from,
        to
      });
    }
  }
  function push(to) {
    return pushWithRedirect(to);
  }
  function replace(to) {
    return push(assign(locationAsObject(to), { replace: true }));
  }
  function handleRedirectRecord(to) {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation = typeof redirect === "function" ? redirect(to) : redirect;
      if (typeof newTargetLocation === "string") {
        newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : { path: newTargetLocation };
        newTargetLocation.params = {};
      }
      return assign({
        query: to.query,
        hash: to.hash,
        params: "path" in newTargetLocation ? {} : to.params
      }, newTargetLocation);
    }
  }
  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = pendingLocation = resolve2(to);
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace2 = to.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation);
    if (shouldRedirect)
      return pushWithRedirect(
        assign(locationAsObject(shouldRedirect), {
          state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
          force,
          replace: replace2
        }),
        redirectedFrom || targetLocation
      );
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(16, { to: toLocation, from });
      handleScroll(
        from,
        from,
        true,
        false
      );
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? isNavigationFailure(error, 2) ? error : markAsReady(error) : triggerError(error, toLocation, from)).then((failure2) => {
      if (failure2) {
        if (isNavigationFailure(failure2, 2)) {
          return pushWithRedirect(
            assign({
              replace: replace2
            }, locationAsObject(failure2.to), {
              state: typeof failure2.to === "object" ? assign({}, data, failure2.to.state) : data,
              force
            }),
            redirectedFrom || toLocation
          );
        }
      } else {
        failure2 = finalizeNavigation(toLocation, from, true, replace2, data);
      }
      triggerAfterEach(toLocation, from, failure2);
      return failure2;
    });
  }
  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  function navigate(to, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
    for (const record of leavingRecords) {
      record.leaveGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to, from));
      });
    }
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
      for (const record of updatingRecords) {
        record.updateGuards.forEach((guard) => {
          guards.push(guardToPromiseFn(guard, to, from));
        });
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of to.matched) {
        if (record.beforeEnter && !from.matched.includes(record)) {
          if (isArray$1(record.beforeEnter)) {
            for (const beforeEnter of record.beforeEnter)
              guards.push(guardToPromiseFn(beforeEnter, to, from));
          } else {
            guards.push(guardToPromiseFn(record.beforeEnter, to, from));
          }
        }
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(err, 8) ? err : Promise.reject(err));
  }
  function triggerAfterEach(to, from, failure) {
    for (const guard of afterGuards.list())
      guard(to, from, failure);
  }
  function finalizeNavigation(toLocation, from, isPush, replace2, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error)
      return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) {
      if (replace2 || isFirstNavigation)
        routerHistory.replace(toLocation.fullPath, assign({
          scroll: isFirstNavigation && state && state.scroll
        }, data));
      else
        routerHistory.push(toLocation.fullPath, data);
    }
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  let removeHistoryListener;
  function setupListeners() {
    if (removeHistoryListener)
      return;
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      if (!router2.listening)
        return;
      const toLocation = resolve2(to);
      const shouldRedirect = handleRedirectRecord(toLocation);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop$1);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) {
        saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      }
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(error, 4 | 8)) {
          return error;
        }
        if (isNavigationFailure(error, 2)) {
          pushWithRedirect(
            error.to,
            toLocation
          ).then((failure) => {
            if (isNavigationFailure(failure, 4 | 16) && !info.delta && info.type === NavigationType.pop) {
              routerHistory.go(-1, false);
            }
          }).catch(noop$1);
          return Promise.reject();
        }
        if (info.delta) {
          routerHistory.go(-info.delta, false);
        }
        return triggerError(error, toLocation, from);
      }).then((failure) => {
        failure = failure || finalizeNavigation(
          toLocation,
          from,
          false
        );
        if (failure) {
          if (info.delta && !isNavigationFailure(failure, 8)) {
            routerHistory.go(-info.delta, false);
          } else if (info.type === NavigationType.pop && isNavigationFailure(failure, 4 | 16)) {
            routerHistory.go(-1, false);
          }
        }
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop$1);
    });
  }
  let readyHandlers = useCallbacks();
  let errorHandlers = useCallbacks();
  let ready;
  function triggerError(error, to, from) {
    markAsReady(error);
    const list = errorHandlers.list();
    if (list.length) {
      list.forEach((handler) => handler(error, to, from));
    } else {
      console.error(error);
    }
    return Promise.reject(error);
  }
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
      return Promise.resolve();
    return new Promise((resolve3, reject) => {
      readyHandlers.add([resolve3, reject]);
    });
  }
  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers.list().forEach(([resolve3, reject]) => err ? reject(err) : resolve3());
      readyHandlers.reset();
    }
    return err;
  }
  function handleScroll(to, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options;
    if (!isBrowser || !scrollBehavior)
      return Promise.resolve();
    const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to, from));
  }
  const go = (delta) => routerHistory.go(delta);
  let started;
  const installedApps = /* @__PURE__ */ new Set();
  const router2 = {
    currentRoute,
    listening: true,
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve: resolve2,
    options,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorHandlers.add,
    isReady,
    install(app) {
      const router3 = this;
      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView);
      app.config.globalProperties.$router = router3;
      Object.defineProperty(app.config.globalProperties, "$route", {
        enumerable: true,
        get: () => unref(currentRoute)
      });
      if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
        });
      }
      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) {
        reactiveRoute[key] = computed(() => currentRoute.value[key]);
      }
      app.provide(routerKey, router3);
      app.provide(routeLocationKey, reactive(reactiveRoute));
      app.provide(routerViewLocationKey, currentRoute);
      const unmountApp = app.unmount;
      installedApps.add(app);
      app.unmount = function() {
        installedApps.delete(app);
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          removeHistoryListener && removeHistoryListener();
          removeHistoryListener = null;
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp();
      };
    }
  };
  return router2;
}
function runGuardQueue(guards) {
  return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
}
function extractChangingRecords(to, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len = Math.max(from.matched.length, to.matched.length);
  for (let i = 0; i < len; i++) {
    const recordFrom = from.matched[i];
    if (recordFrom) {
      if (to.matched.find((record) => isSameRouteRecord(record, recordFrom)))
        updatingRecords.push(recordFrom);
      else
        leavingRecords.push(recordFrom);
    }
    const recordTo = to.matched[i];
    if (recordTo) {
      if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) {
        enteringRecords.push(recordTo);
      }
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords];
}
function useRouter() {
  return inject(routerKey);
}
function useRoute() {
  return inject(routeLocationKey);
}
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const kindOf = ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString = typeOfTest("string");
const isFunction = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject$1 = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction(val.pipe);
const isFormData = (thing) => {
  const pattern = "[object FormData]";
  return thing && (typeof FormData === "function" && thing instanceof FormData || toString.call(thing) === pattern || isFunction(thing.toString) && thing.toString() === pattern);
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function merge() {
  const result = {};
  const assignValue = (val, key) => {
    if (isPlainObject$1(result[key]) && isPlainObject$1(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject$1(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend$1 = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null)
    return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing)
    return null;
  if (isArray(thing))
    return thing;
  let i = thing.length;
  if (!isNumber(i))
    return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[Symbol.iterator];
  const iterator = generator.call(obj);
  let result;
  while ((result = iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches2;
  const arr = [];
  while ((matches2 = regExp.exec(str)) !== null) {
    arr.push(matches2);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[_-\s]([a-z\d])(\w*)/g,
    function replacer2(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    if (reducer(descriptor, name, obj) !== false) {
      reducedDescriptors[name] = descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    const value = obj[name];
    if (!isFunction(value))
      return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  value = +value;
  return Number.isFinite(value) ? value : defaultValue;
};
const utils = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject: isPlainObject$1,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend: extend$1,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber
};
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  response && (this.response = response);
}
utils.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
const prototype$1 = AxiosError.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  AxiosError.call(axiosError, error.message, code, config, request, response);
  axiosError.cause = error;
  axiosError.name = error.name;
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
  var f = n.default;
  if (typeof f == "function") {
    var a = function() {
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var browser = typeof self == "object" ? self.FormData : window.FormData;
function isVisitable(thing) {
  return utils.isPlainObject(thing) || utils.isArray(thing);
}
function removeBrackets(key) {
  return utils.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path)
    return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function isSpecCompliant(thing) {
  return thing && utils.isFunction(thing.append) && thing[Symbol.toStringTag] === "FormData" && thing[Symbol.iterator];
}
function toFormData(obj, formData, options) {
  if (!utils.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (browser || FormData)();
  options = utils.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && isSpecCompliant(formData);
  if (!utils.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null)
      return "";
    if (utils.isDate(value)) {
      return value.toISOString();
    }
    if (!useBlob && utils.isBlob(value)) {
      throw new AxiosError("Blob is not supported. Use a Buffer instead.");
    }
    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils.isArray(value) && isFlatArray(value) || (utils.isFileList(value) || utils.endsWith(key, "[]") && (arr = utils.toArray(value)))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils.isUndefined(el) || el === null) && formData.append(
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack2 = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils.isUndefined(value))
      return;
    if (stack2.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack2.push(value);
    utils.forEach(value, function each(el, key) {
      const result = !(utils.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack2.pop();
  }
  if (!utils.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer2(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h2) {
      if (h2 !== null) {
        fn(h2);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
const FormData$1 = FormData;
const isStandardBrowserEnv = (() => {
  let product;
  if (typeof navigator !== "undefined" && ((product = navigator.product) === "ReactNative" || product === "NativeScript" || product === "NS")) {
    return false;
  }
  return typeof window !== "undefined" && typeof document !== "undefined";
})();
const platform = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob
  },
  isStandardBrowserEnv,
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
function toURLEncodedForm(data, options) {
  return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    }
  }, options));
}
function parsePropPath(name) {
  return utils.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
    const obj = {};
    utils.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function settle(resolve2, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve2(response);
  } else {
    reject(new AxiosError(
      "Request failed with status code " + response.status,
      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
const cookies = platform.isStandardBrowserEnv ? function standardBrowserEnv() {
  return {
    write: function write(name, value, expires, path, domain, secure) {
      const cookie = [];
      cookie.push(name + "=" + encodeURIComponent(value));
      if (utils.isNumber(expires)) {
        cookie.push("expires=" + new Date(expires).toGMTString());
      }
      if (utils.isString(path)) {
        cookie.push("path=" + path);
      }
      if (utils.isString(domain)) {
        cookie.push("domain=" + domain);
      }
      if (secure === true) {
        cookie.push("secure");
      }
      document.cookie = cookie.join("; ");
    },
    read: function read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove: function remove2(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  };
}() : function nonStandardBrowserEnv() {
  return {
    write: function write() {
    },
    read: function read() {
      return null;
    },
    remove: function remove2() {
    }
  };
}();
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
const isURLSameOrigin = platform.isStandardBrowserEnv ? function standardBrowserEnv2() {
  const msie = /(msie|trident)/i.test(navigator.userAgent);
  const urlParsingNode = document.createElement("a");
  let originURL;
  function resolveURL(url) {
    let href = url;
    if (msie) {
      urlParsingNode.setAttribute("href", href);
      href = urlParsingNode.href;
    }
    urlParsingNode.setAttribute("href", href);
    return {
      href: urlParsingNode.href,
      protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
      host: urlParsingNode.host,
      search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
      hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
      hostname: urlParsingNode.hostname,
      port: urlParsingNode.port,
      pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
    };
  }
  originURL = resolveURL(window.location.href);
  return function isURLSameOrigin2(requestURL) {
    const parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
    return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
  };
}() : function nonStandardBrowserEnv2() {
  return function isURLSameOrigin2() {
    return true;
  };
}();
function CanceledError(message, config, request) {
  AxiosError.call(this, message == null ? "canceled" : message, AxiosError.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils.inherits(CanceledError, AxiosError, {
  __CANCEL__: true
});
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
const ignoreDuplicateOf = utils.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
const $defaults = Symbol("defaults");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
function matchHeaderValue(context, value, header, filter2) {
  if (utils.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (!utils.isString(value))
    return;
  if (utils.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
function findKey(obj, key) {
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
function AxiosHeaders(headers, defaults2) {
  headers && this.set(headers);
  this[$defaults] = defaults2 || null;
}
Object.assign(AxiosHeaders.prototype, {
  set: function(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = findKey(self2, lHeader);
      if (key && _rewrite !== true && (self2[key] === false || _rewrite === false)) {
        return;
      }
      self2[key || _header] = normalizeValue(_value);
    }
    if (utils.isPlainObject(header)) {
      utils.forEach(header, (_value, _header) => {
        setHeader(_value, _header, valueOrRewrite);
      });
    } else {
      setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  },
  get: function(header, parser) {
    header = normalizeHeader(header);
    if (!header)
      return void 0;
    const key = findKey(this, header);
    if (key) {
      const value = this[key];
      if (!parser) {
        return value;
      }
      if (parser === true) {
        return parseTokens(value);
      }
      if (utils.isFunction(parser)) {
        return parser.call(this, value, key);
      }
      if (utils.isRegExp(parser)) {
        return parser.exec(value);
      }
      throw new TypeError("parser must be boolean|regexp|function");
    }
  },
  has: function(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = findKey(this, header);
      return !!(key && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  },
  delete: function(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  },
  clear: function() {
    return Object.keys(this).forEach(this.delete.bind(this));
  },
  normalize: function(format) {
    const self2 = this;
    const headers = {};
    utils.forEach(this, (value, header) => {
      const key = findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  },
  toJSON: function(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils.forEach(
      Object.assign({}, this[$defaults] || null, this),
      (value, header) => {
        if (value == null || value === false)
          return;
        obj[header] = asStrings && utils.isArray(value) ? value.join(", ") : value;
      }
    );
    return obj;
  }
});
Object.assign(AxiosHeaders, {
  from: function(thing) {
    if (utils.isString(thing)) {
      return new this(parseHeaders(thing));
    }
    return thing instanceof this ? thing : new this(thing);
  },
  accessor: function(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
});
AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent"]);
utils.freezeMethods(AxiosHeaders.prototype);
utils.freezeMethods(AxiosHeaders);
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function progressEventReducer(listener, isDownloadStream) {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return (e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0
    };
    data[isDownloadStream ? "download" : "upload"] = true;
    listener(data);
  };
}
function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve2, reject) {
    let requestData = config.data;
    const requestHeaders = AxiosHeaders.from(config.headers).normalize();
    const responseType = config.responseType;
    let onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }
      if (config.signal) {
        config.signal.removeEventListener("abort", onCanceled);
      }
    }
    if (utils.isFormData(requestData) && platform.isStandardBrowserEnv) {
      requestHeaders.setContentType(false);
    }
    let request = new XMLHttpRequest();
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
      requestHeaders.set("Authorization", "Basic " + btoa(username + ":" + password));
    }
    const fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
    request.timeout = config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve2(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError("Request aborted", AxiosError.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError2() {
      reject(new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, request));
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new AxiosError(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    if (platform.isStandardBrowserEnv) {
      const xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName && cookies.read(config.xsrfCookieName);
      if (xsrfValue) {
        requestHeaders.set(config.xsrfHeaderName, xsrfValue);
      }
    }
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = config.responseType;
    }
    if (typeof config.onDownloadProgress === "function") {
      request.addEventListener("progress", progressEventReducer(config.onDownloadProgress, true));
    }
    if (typeof config.onUploadProgress === "function" && request.upload) {
      request.upload.addEventListener("progress", progressEventReducer(config.onUploadProgress));
    }
    if (config.cancelToken || config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(fullPath);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError("Unsupported protocol " + protocol + ":", AxiosError.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
}
const adapters = {
  http: xhrAdapter,
  xhr: xhrAdapter
};
const adapters$1 = {
  getAdapter: (nameOrAdapter) => {
    if (utils.isString(nameOrAdapter)) {
      const adapter = adapters[nameOrAdapter];
      if (!nameOrAdapter) {
        throw Error(
          utils.hasOwnProp(nameOrAdapter) ? `Adapter '${nameOrAdapter}' is not available in the build` : `Can not resolve adapter '${nameOrAdapter}'`
        );
      }
      return adapter;
    }
    if (!utils.isFunction(nameOrAdapter)) {
      throw new TypeError("adapter is not a function");
    }
    return nameOrAdapter;
  },
  adapters
};
const DEFAULT_CONTENT_TYPE = {
  "Content-Type": "application/x-www-form-urlencoded"
};
function getDefaultAdapter() {
  let adapter;
  if (typeof XMLHttpRequest !== "undefined") {
    adapter = adapters$1.getAdapter("xhr");
  } else if (typeof process !== "undefined" && utils.kindOf(process) === "process") {
    adapter = adapters$1.getAdapter("http");
  }
  return adapter;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults$9 = {
  transitional: transitionalDefaults,
  adapter: getDefaultAdapter(),
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils.isObject(data);
    if (isObjectPayload && utils.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils.isFormData(data);
    if (isFormData2) {
      if (!hasJSONContentType) {
        return data;
      }
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults$9.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (data && utils.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*"
    }
  }
};
utils.forEach(["delete", "get", "head"], function forEachMethodNoData(method) {
  defaults$9.headers[method] = {};
});
utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  defaults$9.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});
function transformData(fns, response) {
  const config = this || defaults$9;
  const context = response || config;
  const headers = AxiosHeaders.from(context.headers);
  let data = context.data;
  utils.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError();
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  const adapter = config.adapter || defaults$9.adapter;
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(void 0, config1[prop]);
    }
  }
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(void 0, config2[prop]);
    }
  }
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(void 0, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(void 0, config1[prop]);
    }
  }
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(void 0, config1[prop]);
    }
  }
  const mergeMap = {
    "url": valueFromConfig2,
    "method": valueFromConfig2,
    "data": valueFromConfig2,
    "baseURL": defaultToConfig2,
    "transformRequest": defaultToConfig2,
    "transformResponse": defaultToConfig2,
    "paramsSerializer": defaultToConfig2,
    "timeout": defaultToConfig2,
    "timeoutMessage": defaultToConfig2,
    "withCredentials": defaultToConfig2,
    "adapter": defaultToConfig2,
    "responseType": defaultToConfig2,
    "xsrfCookieName": defaultToConfig2,
    "xsrfHeaderName": defaultToConfig2,
    "onUploadProgress": defaultToConfig2,
    "onDownloadProgress": defaultToConfig2,
    "decompress": defaultToConfig2,
    "maxContentLength": defaultToConfig2,
    "maxBodyLength": defaultToConfig2,
    "beforeRedirect": defaultToConfig2,
    "transport": defaultToConfig2,
    "httpAgent": defaultToConfig2,
    "httpsAgent": defaultToConfig2,
    "cancelToken": defaultToConfig2,
    "socketPath": defaultToConfig2,
    "responseEncoding": defaultToConfig2,
    "validateStatus": mergeDirectKeys
  };
  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(prop);
    utils.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
const VERSION = "1.1.3";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators$1[type] = function validator2(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version2, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError(
        formatMessage(opt, " has been removed" + (version2 ? " in " + version2 : "")),
        AxiosError.ERR_DEPRECATED
      );
    }
    if (version2 && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version2 + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError("option " + opt + " must be " + result, AxiosError.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError("Unknown option " + opt, AxiosError.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig(this.defaults, config);
    const { transitional: transitional2, paramsSerializer } = config;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer !== void 0) {
      validator.assertOptions(paramsSerializer, {
        encode: validators.function,
        serialize: validators.function
      }, true);
    }
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    const defaultHeaders = config.headers && utils.merge(
      config.headers.common,
      config.headers[config.method]
    );
    defaultHeaders && utils.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );
    config.headers = new AxiosHeaders(config.headers, defaultHeaders);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift.apply(chain, requestInterceptorChain);
      chain.push.apply(chain, responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i = 0;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
}
utils.forEach(["delete", "get", "head", "options"], function forEachMethodNoData2(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils.forEach(["post", "put", "patch"], function forEachMethodWithData2(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios.prototype[method] = generateHTTPMethod();
  Axios.prototype[method + "Form"] = generateHTTPMethod(true);
});
class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve2) {
      resolvePromise = resolve2;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners)
        return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve2) => {
        token.subscribe(resolve2);
        _resolve = resolve2;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError(message, config, request);
      resolvePromise(token.reason);
    });
  }
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
}
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError(payload) {
  return utils.isObject(payload) && payload.isAxiosError === true;
}
function createInstance(defaultConfig) {
  const context = new Axios(defaultConfig);
  const instance = bind(Axios.prototype.request, context);
  utils.extend(instance, Axios.prototype, context, { allOwnKeys: true });
  utils.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults$9);
axios.Axios = Axios;
axios.CanceledError = CanceledError;
axios.CancelToken = CancelToken;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData;
axios.AxiosError = AxiosError;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.formToJSON = (thing) => {
  return formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);
};
function getGlobalConfig() {
  const startingPage = 1;
  const pageSize = 40;
  const baseUrl = "https://timanh.com/v1/images/search-images";
  const campaignsUrl = "https://timanh.com/v1/campaign/find";
  const searchImageUrl = "https://timanh.com/v1/images/search-face";
  return { startingPage, pageSize, baseUrl, campaignsUrl, searchImageUrl };
}
const globalConfig = getGlobalConfig();
async function searchData(searchCriteria) {
  const searchType = searchCriteria.searchType;
  const raceId = searchCriteria.raceid;
  if (searchType == 1 || searchType == 2) {
    return searchByBIP(raceId, searchCriteria.searchValue, searchCriteria.pageNumber, searchCriteria.pageSize);
  } else {
    return searchByImage(raceId, searchCriteria.pageNumber, searchCriteria.pageSize, searchCriteria.asset, searchCriteria.previousFaceIds);
  }
}
async function searchByBIP(raceId, bib, pageNumber, pageSize) {
  var url = globalConfig.baseUrl.concat("?campaignId=" + raceId).concat("&page=" + pageNumber).concat("&size=" + pageSize);
  if (bib && bib !== "*") {
    url = url.concat("&bib=" + bib);
  }
  return await axios.get(url, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET"
    }
  });
}
async function searchByImage(raceId, pageNumber, pageSize, file, previousFaceIds) {
  const url = globalConfig.searchImageUrl;
  let formData = new FormData();
  formData.append("campaignId", raceId);
  formData.append("page", pageNumber);
  formData.append("size", pageSize);
  formData.append("image", file);
  formData.append("faceMatchThreshold", 80);
  formData.append("maxFaces", 50);
  if (previousFaceIds) {
    formData.append("previousFaceIds", previousFaceIds);
  }
  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  };
  return await axios.post(url, formData, config);
}
async function getCampaigns(url) {
  return await axios.get(url, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET"
    }
  });
}
const _hoisted_1$5 = {
  class: "container-fluid",
  id: "#search-box"
};
const _hoisted_2$5 = { class: "row" };
const _hoisted_3$4 = { class: "col-md-7" };
const _hoisted_4$5 = { class: "row" };
const _hoisted_5$4 = {
  class: "col-md-5",
  style: { "margin-bottom": "5px" }
};
const _hoisted_6$4 = ["value"];
const _hoisted_7$4 = {
  class: "col-md-7",
  style: { "margin-bottom": "5px" }
};
const _hoisted_8$3 = ["disabled"];
const _hoisted_9$3 = { class: "col-md-2" };
const _hoisted_10$2 = {
  key: 0,
  class: "col-md-2"
};
const _sfc_main$5 = {
  __name: "SearchBox",
  props: ["searchType", "searchValue", "allowType", "enableDownload"],
  setup(__props) {
    const props = __props;
    const searchType = ref(props.searchType);
    const searchValue = ref(props.searchValue);
    const file = ref(null);
    const searchingTypes = ref([{ "text": "T\u1EA5t c\u1EA3 \u1EA3nh", "value": 1 }, { "text": "T\xECm ki\u1EBFm theo bib", "value": 2 }]);
    async function onSearchTypeChange(event) {
      var searchType2 = event.currentTarget.value;
      if (searchType2 == "1") {
        searchValue.value = "*";
        file.value = null;
      } else if (searchType2 == "2") {
        searchValue.value = "";
        file.value = null;
      } else if (searchType2 == "3") {
        searchValue.value = "";
      }
    }
    function storeFile(event) {
      file.value = event.target.files[0];
    }
    watch(
      () => props.allowType,
      (newVal) => {
        if (newVal == 3) {
          searchingTypes.value.push({ "text": "T\xECm ki\u1EBFm theo \u1EA3nh", "value": 3 });
        }
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createBaseVNode("div", _hoisted_2$5, [
          createBaseVNode("div", _hoisted_3$4, [
            createBaseVNode("div", _hoisted_4$5, [
              createBaseVNode("div", _hoisted_5$4, [
                withDirectives(createBaseVNode("select", {
                  class: "form-control",
                  id: "search-type",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchType.value = $event),
                  onChange: onSearchTypeChange
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(searchingTypes.value, (option) => {
                    return openBlock(), createElementBlock("option", {
                      value: option.value,
                      key: option.value
                    }, toDisplayString(option.text), 9, _hoisted_6$4);
                  }), 128))
                ], 544), [
                  [vModelSelect, searchType.value]
                ])
              ]),
              createBaseVNode("div", _hoisted_7$4, [
                searchType.value != 3 ? withDirectives((openBlock(), createElementBlock("input", {
                  key: 0,
                  class: "form-control",
                  id: "txtBib",
                  disabled: searchType.value == 1,
                  type: "text",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => searchValue.value = $event)
                }, null, 8, _hoisted_8$3)), [
                  [vModelText, searchValue.value]
                ]) : createCommentVNode("", true),
                searchType.value == 3 ? (openBlock(), createElementBlock("input", {
                  key: 1,
                  class: "form-control",
                  onChange: storeFile,
                  type: "file",
                  id: "formFile"
                }, null, 32)) : createCommentVNode("", true)
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_9$3, [
            createBaseVNode("button", {
              class: "form-control",
              id: "btnSearch",
              onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("searchImages", searchType.value, searchValue.value, file.value))
            }, "T\xECm \u1EA3nh")
          ]),
          props.enableDownload ? (openBlock(), createElementBlock("div", _hoisted_10$2, [
            createBaseVNode("a", {
              class: "btn btn-info form-control",
              onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("downloadImages"))
            }, "T\u1EA3i \u1EA3nh v\u1EC1")
          ])) : createCommentVNode("", true)
        ])
      ]);
    };
  }
};
const isPlainObject = (obj) => {
  return typeof obj === "object" && obj !== null && obj.constructor === Object && Object.prototype.toString.call(obj) === "[object Object]";
};
const extend = (...args) => {
  let deep = false;
  if (typeof args[0] == "boolean") {
    deep = args.shift();
  }
  let result = args[0];
  if (!result || typeof result !== "object") {
    throw new Error("extendee must be an object");
  }
  const extenders = args.slice(1);
  const len = extenders.length;
  for (let i = 0; i < len; i++) {
    const extender = extenders[i];
    for (let key in extender) {
      if (extender.hasOwnProperty(key)) {
        const value = extender[key];
        if (deep && (Array.isArray(value) || isPlainObject(value))) {
          const base = Array.isArray(value) ? [] : {};
          result[key] = extend(true, result.hasOwnProperty(key) ? result[key] : base, value);
        } else {
          result[key] = value;
        }
      }
    }
  }
  return result;
};
const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
let preventScrollSupported = null;
const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  "select:not([disabled]):not([aria-hidden])",
  "textarea:not([disabled]):not([aria-hidden])",
  "button:not([disabled]):not([aria-hidden])",
  "iframe",
  "object",
  "embed",
  "video",
  "audio",
  "[contenteditable]",
  '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])'
];
const setFocusOn = (node) => {
  if (!node || !canUseDOM) {
    return;
  }
  if (preventScrollSupported === null) {
    document.createElement("div").focus({
      get preventScroll() {
        preventScrollSupported = true;
        return false;
      }
    });
  }
  try {
    if (node.setActive) {
      node.setActive();
    } else if (preventScrollSupported) {
      node.focus({ preventScroll: true });
    } else {
      const scrollTop = window.pageXOffset || document.body.scrollTop;
      const scrollLeft = window.pageYOffset || document.body.scrollLeft;
      node.focus();
      document.body.scrollTo({
        top: scrollTop,
        left: scrollLeft,
        behavior: "auto"
      });
    }
  } catch (e) {
  }
};
const resolve = function(path, obj) {
  return path.split(".").reduce(function(prev, curr) {
    return prev && prev[curr];
  }, obj);
};
class Base {
  constructor(options = {}) {
    this.options = extend(true, {}, options);
    this.plugins = [];
    this.events = {};
    for (const type of ["on", "once"]) {
      for (const args of Object.entries(this.options[type] || {})) {
        this[type](...args);
      }
    }
  }
  option(key, fallback, ...rest) {
    key = String(key);
    let value = resolve(key, this.options);
    if (typeof value === "function") {
      value = value.call(this, this, ...rest);
    }
    return value === void 0 ? fallback : value;
  }
  localize(str, params = []) {
    str = String(str).replace(/\{\{(\w+).?(\w+)?\}\}/g, (match, key, subkey) => {
      let rez = "";
      if (subkey) {
        rez = this.option(`${key[0] + key.toLowerCase().substring(1)}.l10n.${subkey}`);
      } else if (key) {
        rez = this.option(`l10n.${key}`);
      }
      if (!rez) {
        rez = match;
      }
      for (let index = 0; index < params.length; index++) {
        rez = rez.split(params[index][0]).join(params[index][1]);
      }
      return rez;
    });
    str = str.replace(/\{\{(.*)\}\}/, (match, key) => {
      return key;
    });
    return str;
  }
  on(name, callback) {
    if (isPlainObject(name)) {
      for (const args of Object.entries(name)) {
        this.on(...args);
      }
      return this;
    }
    String(name).split(" ").forEach((item) => {
      const listeners = this.events[item] = this.events[item] || [];
      if (listeners.indexOf(callback) == -1) {
        listeners.push(callback);
      }
    });
    return this;
  }
  once(name, callback) {
    if (isPlainObject(name)) {
      for (const args of Object.entries(name)) {
        this.once(...args);
      }
      return this;
    }
    String(name).split(" ").forEach((item) => {
      const listener = (...details) => {
        this.off(item, listener);
        callback.call(this, this, ...details);
      };
      listener._ = callback;
      this.on(item, listener);
    });
    return this;
  }
  off(name, callback) {
    if (isPlainObject(name)) {
      for (const args of Object.entries(name)) {
        this.off(...args);
      }
      return;
    }
    name.split(" ").forEach((item) => {
      const listeners = this.events[item];
      if (!listeners || !listeners.length) {
        return this;
      }
      let index = -1;
      for (let i = 0, len = listeners.length; i < len; i++) {
        const listener = listeners[i];
        if (listener && (listener === callback || listener._ === callback)) {
          index = i;
          break;
        }
      }
      if (index != -1) {
        listeners.splice(index, 1);
      }
    });
    return this;
  }
  trigger(name, ...details) {
    for (const listener of [...this.events[name] || []].slice()) {
      if (listener && listener.call(this, this, ...details) === false) {
        return false;
      }
    }
    for (const listener of [...this.events["*"] || []].slice()) {
      if (listener && listener.call(this, name, this, ...details) === false) {
        return false;
      }
    }
    return true;
  }
  attachPlugins(plugins) {
    const newPlugins = {};
    for (const [key, Plugin] of Object.entries(plugins || {})) {
      if (this.options[key] !== false && !this.plugins[key]) {
        this.options[key] = extend({}, Plugin.defaults || {}, this.options[key]);
        newPlugins[key] = new Plugin(this);
      }
    }
    for (const [key, plugin] of Object.entries(newPlugins)) {
      plugin.attach(this);
    }
    this.plugins = Object.assign({}, this.plugins, newPlugins);
    return this;
  }
  detachPlugins() {
    for (const key in this.plugins) {
      let plugin;
      if ((plugin = this.plugins[key]) && typeof plugin.detach === "function") {
        plugin.detach(this);
      }
    }
    this.plugins = {};
    return this;
  }
}
const round = (value, precision = 1e4) => {
  value = parseFloat(value) || 0;
  return Math.round((value + Number.EPSILON) * precision) / precision;
};
const hasScrollbars = function(node) {
  const overflowY = getComputedStyle(node)["overflow-y"], overflowX = getComputedStyle(node)["overflow-x"], vertical = (overflowY === "scroll" || overflowY === "auto") && Math.abs(node.scrollHeight - node.clientHeight) > 1, horizontal = (overflowX === "scroll" || overflowX === "auto") && Math.abs(node.scrollWidth - node.clientWidth) > 1;
  return vertical || horizontal;
};
const isScrollable = function(node) {
  if (!node || !(typeof node === "object" && node instanceof Element) || node === document.body) {
    return false;
  }
  if (node.__Panzoom) {
    return false;
  }
  if (hasScrollbars(node)) {
    return node;
  }
  return isScrollable(node.parentNode);
};
const ResizeObserver = typeof window !== "undefined" && window.ResizeObserver || class {
  constructor(callback) {
    this.observables = [];
    this.boundCheck = this.check.bind(this);
    this.boundCheck();
    this.callback = callback;
  }
  observe(el) {
    if (this.observables.some((observable) => observable.el === el)) {
      return;
    }
    const newObservable = {
      el,
      size: {
        height: el.clientHeight,
        width: el.clientWidth
      }
    };
    this.observables.push(newObservable);
  }
  unobserve(el) {
    this.observables = this.observables.filter((obj) => obj.el !== el);
  }
  disconnect() {
    this.observables = [];
  }
  check() {
    const changedEntries = this.observables.filter((obj) => {
      const currentHeight = obj.el.clientHeight;
      const currentWidth = obj.el.clientWidth;
      if (obj.size.height !== currentHeight || obj.size.width !== currentWidth) {
        obj.size.height = currentHeight;
        obj.size.width = currentWidth;
        return true;
      }
    }).map((obj) => obj.el);
    if (changedEntries.length > 0) {
      this.callback(changedEntries);
    }
    window.requestAnimationFrame(this.boundCheck);
  }
};
class Pointer {
  constructor(nativePointer) {
    this.id = self.Touch && nativePointer instanceof Touch ? nativePointer.identifier : -1;
    this.pageX = nativePointer.pageX;
    this.pageY = nativePointer.pageY;
    this.clientX = nativePointer.clientX;
    this.clientY = nativePointer.clientY;
  }
}
const getDistance = (a, b) => {
  if (!b) {
    return 0;
  }
  return Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);
};
const getMidpoint = (a, b) => {
  if (!b) {
    return a;
  }
  return {
    clientX: (a.clientX + b.clientX) / 2,
    clientY: (a.clientY + b.clientY) / 2
  };
};
const isTouchEvent = (event) => "changedTouches" in event;
class PointerTracker {
  constructor(_element, { start = () => true, move = () => {
  }, end = () => {
  } } = {}) {
    this._element = _element;
    this.startPointers = [];
    this.currentPointers = [];
    this._pointerStart = (event) => {
      if (event.buttons > 0 && event.button !== 0) {
        return;
      }
      const pointer = new Pointer(event);
      if (this.currentPointers.some((p2) => p2.id === pointer.id)) {
        return;
      }
      if (!this._triggerPointerStart(pointer, event)) {
        return;
      }
      window.addEventListener("mousemove", this._move);
      window.addEventListener("mouseup", this._pointerEnd);
    };
    this._touchStart = (event) => {
      for (const touch of Array.from(event.changedTouches || [])) {
        this._triggerPointerStart(new Pointer(touch), event);
      }
    };
    this._move = (event) => {
      const previousPointers = this.currentPointers.slice();
      const changedPointers = isTouchEvent(event) ? Array.from(event.changedTouches).map((t) => new Pointer(t)) : [new Pointer(event)];
      for (const pointer of changedPointers) {
        const index = this.currentPointers.findIndex((p2) => p2.id === pointer.id);
        if (index < 0) {
          continue;
        }
        this.currentPointers[index] = pointer;
      }
      this._moveCallback(previousPointers, this.currentPointers.slice(), event);
    };
    this._triggerPointerEnd = (pointer, event) => {
      const index = this.currentPointers.findIndex((p2) => p2.id === pointer.id);
      if (index < 0) {
        return false;
      }
      this.currentPointers.splice(index, 1);
      this.startPointers.splice(index, 1);
      this._endCallback(pointer, event);
      return true;
    };
    this._pointerEnd = (event) => {
      if (event.buttons > 0 && event.button !== 0) {
        return;
      }
      if (!this._triggerPointerEnd(new Pointer(event), event)) {
        return;
      }
      window.removeEventListener("mousemove", this._move, { passive: false });
      window.removeEventListener("mouseup", this._pointerEnd, { passive: false });
    };
    this._touchEnd = (event) => {
      for (const touch of Array.from(event.changedTouches || [])) {
        this._triggerPointerEnd(new Pointer(touch), event);
      }
    };
    this._startCallback = start;
    this._moveCallback = move;
    this._endCallback = end;
    this._element.addEventListener("mousedown", this._pointerStart, { passive: false });
    this._element.addEventListener("touchstart", this._touchStart, { passive: false });
    this._element.addEventListener("touchmove", this._move, { passive: false });
    this._element.addEventListener("touchend", this._touchEnd);
    this._element.addEventListener("touchcancel", this._touchEnd);
  }
  stop() {
    this._element.removeEventListener("mousedown", this._pointerStart, { passive: false });
    this._element.removeEventListener("touchstart", this._touchStart, { passive: false });
    this._element.removeEventListener("touchmove", this._move, { passive: false });
    this._element.removeEventListener("touchend", this._touchEnd);
    this._element.removeEventListener("touchcancel", this._touchEnd);
    window.removeEventListener("mousemove", this._move);
    window.removeEventListener("mouseup", this._pointerEnd);
  }
  _triggerPointerStart(pointer, event) {
    if (!this._startCallback(pointer, event)) {
      return false;
    }
    this.currentPointers.push(pointer);
    this.startPointers.push(pointer);
    return true;
  }
}
const getTextNodeFromPoint = (element, x, y) => {
  const nodes = element.childNodes;
  const range = document.createRange();
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.nodeType !== Node.TEXT_NODE) {
      continue;
    }
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom) {
      return node;
    }
  }
  return false;
};
const getFullWidth = (elem) => {
  return Math.max(
    parseFloat(elem.naturalWidth || 0),
    parseFloat(elem.width && elem.width.baseVal && elem.width.baseVal.value || 0),
    parseFloat(elem.offsetWidth || 0),
    parseFloat(elem.scrollWidth || 0)
  );
};
const getFullHeight = (elem) => {
  return Math.max(
    parseFloat(elem.naturalHeight || 0),
    parseFloat(elem.height && elem.height.baseVal && elem.height.baseVal.value || 0),
    parseFloat(elem.offsetHeight || 0),
    parseFloat(elem.scrollHeight || 0)
  );
};
const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / srcWidth || 0, maxHeight / srcHeight);
  return { width: srcWidth * ratio || 0, height: srcHeight * ratio || 0 };
};
const Plugins$2 = {};
const defaults$8 = {
  touch: true,
  zoom: true,
  pinchToZoom: true,
  panOnlyZoomed: false,
  lockAxis: false,
  friction: 0.64,
  decelFriction: 0.88,
  zoomFriction: 0.74,
  bounceForce: 0.2,
  baseScale: 1,
  minScale: 1,
  maxScale: 2,
  step: 0.5,
  textSelection: false,
  click: "toggleZoom",
  wheel: "zoom",
  wheelFactor: 42,
  wheelLimit: 5,
  draggableClass: "is-draggable",
  draggingClass: "is-dragging",
  ratio: 1
};
class Panzoom extends Base {
  constructor($container, options = {}) {
    super(extend(true, {}, defaults$8, options));
    this.state = "init";
    this.$container = $container;
    for (const methodName of ["onLoad", "onWheel", "onClick"]) {
      this[methodName] = this[methodName].bind(this);
    }
    this.initLayout();
    this.resetValues();
    this.attachPlugins(Panzoom.Plugins);
    this.trigger("init");
    this.updateMetrics();
    this.attachEvents();
    this.trigger("ready");
    if (this.option("centerOnStart") === false) {
      this.state = "ready";
    } else {
      this.panTo({
        friction: 0
      });
    }
    $container.__Panzoom = this;
  }
  initLayout() {
    const $container = this.$container;
    if (!($container instanceof HTMLElement)) {
      throw new Error("Panzoom: Container not found");
    }
    const $content = this.option("content") || $container.querySelector(".panzoom__content");
    if (!$content) {
      throw new Error("Panzoom: Content not found");
    }
    this.$content = $content;
    let $viewport = this.option("viewport") || $container.querySelector(".panzoom__viewport");
    if (!$viewport && this.option("wrapInner") !== false) {
      $viewport = document.createElement("div");
      $viewport.classList.add("panzoom__viewport");
      $viewport.append(...$container.childNodes);
      $container.appendChild($viewport);
    }
    this.$viewport = $viewport || $content.parentNode;
  }
  resetValues() {
    this.updateRate = this.option("updateRate", /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 250 : 24);
    this.container = {
      width: 0,
      height: 0
    };
    this.viewport = {
      width: 0,
      height: 0
    };
    this.content = {
      origWidth: 0,
      origHeight: 0,
      width: 0,
      height: 0,
      x: this.option("x", 0),
      y: this.option("y", 0),
      scale: this.option("baseScale")
    };
    this.transform = {
      x: 0,
      y: 0,
      scale: 1
    };
    this.resetDragPosition();
  }
  onLoad(event) {
    this.updateMetrics();
    this.panTo({ scale: this.option("baseScale"), friction: 0 });
    this.trigger("load", event);
  }
  onClick(event) {
    if (event.defaultPrevented) {
      return;
    }
    if (document.activeElement && document.activeElement.closest("[contenteditable]")) {
      return;
    }
    if (this.option("textSelection") && window.getSelection().toString().length && !(event.target && event.target.hasAttribute("data-fancybox-close"))) {
      event.stopPropagation();
      return;
    }
    const rect = this.$content.getClientRects()[0];
    if (this.state !== "ready") {
      if (this.dragPosition.midPoint || Math.abs(rect.top - this.dragStart.rect.top) > 1 || Math.abs(rect.left - this.dragStart.rect.left) > 1) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
    if (this.trigger("click", event) === false) {
      return;
    }
    if (this.option("zoom") && this.option("click") === "toggleZoom") {
      event.preventDefault();
      event.stopPropagation();
      this.zoomWithClick(event);
    }
  }
  onWheel(event) {
    if (this.trigger("wheel", event) === false) {
      return;
    }
    if (this.option("zoom") && this.option("wheel")) {
      this.zoomWithWheel(event);
    }
  }
  zoomWithWheel(event) {
    if (this.changedDelta === void 0) {
      this.changedDelta = 0;
    }
    const delta = Math.max(-1, Math.min(1, -event.deltaY || -event.deltaX || event.wheelDelta || -event.detail));
    const scale = this.content.scale;
    let newScale = scale * (100 + delta * this.option("wheelFactor")) / 100;
    if (delta < 0 && Math.abs(scale - this.option("minScale")) < 0.01 || delta > 0 && Math.abs(scale - this.option("maxScale")) < 0.01) {
      this.changedDelta += Math.abs(delta);
      newScale = scale;
    } else {
      this.changedDelta = 0;
      newScale = Math.max(Math.min(newScale, this.option("maxScale")), this.option("minScale"));
    }
    if (this.changedDelta > this.option("wheelLimit")) {
      return;
    }
    event.preventDefault();
    if (newScale === scale) {
      return;
    }
    const rect = this.$content.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.zoomTo(newScale, { x, y });
  }
  zoomWithClick(event) {
    const rect = this.$content.getClientRects()[0];
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.toggleZoom({ x, y });
  }
  attachEvents() {
    this.$content.addEventListener("load", this.onLoad);
    this.$container.addEventListener("wheel", this.onWheel, { passive: false });
    this.$container.addEventListener("click", this.onClick, { passive: false });
    this.initObserver();
    const pointerTracker = new PointerTracker(this.$container, {
      start: (pointer, event) => {
        if (!this.option("touch")) {
          return false;
        }
        if (this.velocity.scale < 0) {
          return false;
        }
        const target = event.composedPath()[0];
        if (!pointerTracker.currentPointers.length) {
          const ignoreClickedElement = ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(target.nodeName) !== -1;
          if (ignoreClickedElement) {
            return false;
          }
          if (this.option("textSelection") && getTextNodeFromPoint(target, pointer.clientX, pointer.clientY)) {
            return false;
          }
        }
        if (isScrollable(target)) {
          return false;
        }
        if (this.trigger("touchStart", event) === false) {
          return false;
        }
        if (event.type === "mousedown") {
          event.preventDefault();
        }
        this.state = "pointerdown";
        this.resetDragPosition();
        this.dragPosition.midPoint = null;
        this.dragPosition.time = Date.now();
        return true;
      },
      move: (previousPointers, currentPointers, event) => {
        if (this.state !== "pointerdown") {
          return;
        }
        if (this.trigger("touchMove", event) === false) {
          event.preventDefault();
          return;
        }
        if (currentPointers.length < 2 && this.option("panOnlyZoomed") === true && this.content.width <= this.viewport.width && this.content.height <= this.viewport.height && this.transform.scale <= this.option("baseScale")) {
          return;
        }
        if (currentPointers.length > 1 && (!this.option("zoom") || this.option("pinchToZoom") === false)) {
          return;
        }
        const prevMidpoint = getMidpoint(previousPointers[0], previousPointers[1]);
        const newMidpoint = getMidpoint(currentPointers[0], currentPointers[1]);
        const panX = newMidpoint.clientX - prevMidpoint.clientX;
        const panY = newMidpoint.clientY - prevMidpoint.clientY;
        const prevDistance = getDistance(previousPointers[0], previousPointers[1]);
        const newDistance = getDistance(currentPointers[0], currentPointers[1]);
        const scaleDiff = prevDistance && newDistance ? newDistance / prevDistance : 1;
        this.dragOffset.x += panX;
        this.dragOffset.y += panY;
        this.dragOffset.scale *= scaleDiff;
        this.dragOffset.time = Date.now() - this.dragPosition.time;
        const axisToLock = this.dragStart.scale === 1 && this.option("lockAxis");
        if (axisToLock && !this.lockAxis) {
          if (Math.abs(this.dragOffset.x) < 6 && Math.abs(this.dragOffset.y) < 6) {
            event.preventDefault();
            return;
          }
          const angle = Math.abs(Math.atan2(this.dragOffset.y, this.dragOffset.x) * 180 / Math.PI);
          this.lockAxis = angle > 45 && angle < 135 ? "y" : "x";
        }
        if (axisToLock !== "xy" && this.lockAxis === "y") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (this.lockAxis) {
          this.dragOffset[this.lockAxis === "x" ? "y" : "x"] = 0;
        }
        this.$container.classList.add(this.option("draggingClass"));
        if (!(this.transform.scale === this.option("baseScale") && this.lockAxis === "y")) {
          this.dragPosition.x = this.dragStart.x + this.dragOffset.x;
        }
        if (!(this.transform.scale === this.option("baseScale") && this.lockAxis === "x")) {
          this.dragPosition.y = this.dragStart.y + this.dragOffset.y;
        }
        this.dragPosition.scale = this.dragStart.scale * this.dragOffset.scale;
        if (currentPointers.length > 1) {
          const startPoint = getMidpoint(pointerTracker.startPointers[0], pointerTracker.startPointers[1]);
          const xPos = startPoint.clientX - this.dragStart.rect.x;
          const yPos = startPoint.clientY - this.dragStart.rect.y;
          const { deltaX, deltaY } = this.getZoomDelta(this.content.scale * this.dragOffset.scale, xPos, yPos);
          this.dragPosition.x -= deltaX;
          this.dragPosition.y -= deltaY;
          this.dragPosition.midPoint = newMidpoint;
        } else {
          this.setDragResistance();
        }
        this.transform = {
          x: this.dragPosition.x,
          y: this.dragPosition.y,
          scale: this.dragPosition.scale
        };
        this.startAnimation();
      },
      end: (pointer, event) => {
        if (this.state !== "pointerdown") {
          return;
        }
        this._dragOffset = { ...this.dragOffset };
        if (pointerTracker.currentPointers.length) {
          this.resetDragPosition();
          return;
        }
        this.state = "decel";
        this.friction = this.option("decelFriction");
        this.recalculateTransform();
        this.$container.classList.remove(this.option("draggingClass"));
        if (this.trigger("touchEnd", event) === false) {
          return;
        }
        if (this.state !== "decel") {
          return;
        }
        const minScale = this.option("minScale");
        if (this.transform.scale < minScale) {
          this.zoomTo(minScale, { friction: 0.64 });
          return;
        }
        const maxScale = this.option("maxScale");
        if (this.transform.scale - maxScale > 0.01) {
          const last = this.dragPosition.midPoint || pointer;
          const rect = this.$content.getClientRects()[0];
          this.zoomTo(maxScale, {
            friction: 0.64,
            x: last.clientX - rect.left,
            y: last.clientY - rect.top
          });
          return;
        }
      }
    });
    this.pointerTracker = pointerTracker;
  }
  initObserver() {
    if (this.resizeObserver) {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => {
      if (this.updateTimer) {
        return;
      }
      this.updateTimer = setTimeout(() => {
        const rect = this.$container.getBoundingClientRect();
        if (!(rect.width && rect.height)) {
          this.updateTimer = null;
          return;
        }
        if (Math.abs(rect.width - this.container.width) > 1 || Math.abs(rect.height - this.container.height) > 1) {
          if (this.isAnimating()) {
            this.endAnimation(true);
          }
          this.updateMetrics();
          this.panTo({
            x: this.content.x,
            y: this.content.y,
            scale: this.option("baseScale"),
            friction: 0
          });
        }
        this.updateTimer = null;
      }, this.updateRate);
    });
    this.resizeObserver.observe(this.$container);
  }
  resetDragPosition() {
    this.lockAxis = null;
    this.friction = this.option("friction");
    this.velocity = {
      x: 0,
      y: 0,
      scale: 0
    };
    const { x, y, scale } = this.content;
    this.dragStart = {
      rect: this.$content.getBoundingClientRect(),
      x,
      y,
      scale
    };
    this.dragPosition = {
      ...this.dragPosition,
      x,
      y,
      scale
    };
    this.dragOffset = {
      x: 0,
      y: 0,
      scale: 1,
      time: 0
    };
  }
  updateMetrics(silently) {
    if (silently !== true) {
      this.trigger("beforeUpdate");
    }
    const $container = this.$container;
    const $content = this.$content;
    const $viewport = this.$viewport;
    const contentIsImage = $content instanceof HTMLImageElement;
    const contentIsZoomable = this.option("zoom");
    const shouldResizeParent = this.option("resizeParent", contentIsZoomable);
    let width = this.option("width");
    let height = this.option("height");
    let origWidth = width || getFullWidth($content);
    let origHeight = height || getFullHeight($content);
    Object.assign($content.style, {
      width: width ? `${width}px` : "",
      height: height ? `${height}px` : "",
      maxWidth: "",
      maxHeight: ""
    });
    if (shouldResizeParent) {
      Object.assign($viewport.style, { width: "", height: "" });
    }
    const ratio = this.option("ratio");
    origWidth = round(origWidth * ratio);
    origHeight = round(origHeight * ratio);
    width = origWidth;
    height = origHeight;
    const contentRect = $content.getBoundingClientRect();
    const viewportRect = $viewport.getBoundingClientRect();
    const containerRect = $viewport == $container ? viewportRect : $container.getBoundingClientRect();
    let viewportWidth = Math.max($viewport.offsetWidth, round(viewportRect.width));
    let viewportHeight = Math.max($viewport.offsetHeight, round(viewportRect.height));
    let viewportStyles = window.getComputedStyle($viewport);
    viewportWidth -= parseFloat(viewportStyles.paddingLeft) + parseFloat(viewportStyles.paddingRight);
    viewportHeight -= parseFloat(viewportStyles.paddingTop) + parseFloat(viewportStyles.paddingBottom);
    this.viewport.width = viewportWidth;
    this.viewport.height = viewportHeight;
    if (contentIsZoomable) {
      if (Math.abs(origWidth - contentRect.width) > 0.1 || Math.abs(origHeight - contentRect.height) > 0.1) {
        const rez = calculateAspectRatioFit(
          origWidth,
          origHeight,
          Math.min(origWidth, contentRect.width),
          Math.min(origHeight, contentRect.height)
        );
        width = round(rez.width);
        height = round(rez.height);
      }
      Object.assign($content.style, {
        width: `${width}px`,
        height: `${height}px`,
        transform: ""
      });
    }
    if (shouldResizeParent) {
      Object.assign($viewport.style, { width: `${width}px`, height: `${height}px` });
      this.viewport = { ...this.viewport, width, height };
    }
    if (contentIsImage && contentIsZoomable && typeof this.options.maxScale !== "function") {
      const maxScale = this.option("maxScale");
      this.options.maxScale = function() {
        return this.content.origWidth > 0 && this.content.fitWidth > 0 ? this.content.origWidth / this.content.fitWidth : maxScale;
      };
    }
    this.content = {
      ...this.content,
      origWidth,
      origHeight,
      fitWidth: width,
      fitHeight: height,
      width,
      height,
      scale: 1,
      isZoomable: contentIsZoomable
    };
    this.container = { width: containerRect.width, height: containerRect.height };
    if (silently !== true) {
      this.trigger("afterUpdate");
    }
  }
  zoomIn(step) {
    this.zoomTo(this.content.scale + (step || this.option("step")));
  }
  zoomOut(step) {
    this.zoomTo(this.content.scale - (step || this.option("step")));
  }
  toggleZoom(props = {}) {
    const maxScale = this.option("maxScale");
    const baseScale = this.option("baseScale");
    const scale = this.content.scale > baseScale + (maxScale - baseScale) * 0.5 ? baseScale : maxScale;
    this.zoomTo(scale, props);
  }
  zoomTo(scale = this.option("baseScale"), { x = null, y = null } = {}) {
    scale = Math.max(Math.min(scale, this.option("maxScale")), this.option("minScale"));
    const currentScale = round(this.content.scale / (this.content.width / this.content.fitWidth), 1e7);
    if (x === null) {
      x = this.content.width * currentScale * 0.5;
    }
    if (y === null) {
      y = this.content.height * currentScale * 0.5;
    }
    const { deltaX, deltaY } = this.getZoomDelta(scale, x, y);
    x = this.content.x - deltaX;
    y = this.content.y - deltaY;
    this.panTo({ x, y, scale, friction: this.option("zoomFriction") });
  }
  getZoomDelta(scale, x = 0, y = 0) {
    const currentWidth = this.content.fitWidth * this.content.scale;
    const currentHeight = this.content.fitHeight * this.content.scale;
    const percentXInCurrentBox = x > 0 && currentWidth ? x / currentWidth : 0;
    const percentYInCurrentBox = y > 0 && currentHeight ? y / currentHeight : 0;
    const nextWidth = this.content.fitWidth * scale;
    const nextHeight = this.content.fitHeight * scale;
    const deltaX = (nextWidth - currentWidth) * percentXInCurrentBox;
    const deltaY = (nextHeight - currentHeight) * percentYInCurrentBox;
    return { deltaX, deltaY };
  }
  panTo({
    x = this.content.x,
    y = this.content.y,
    scale,
    friction = this.option("friction"),
    ignoreBounds = false
  } = {}) {
    scale = scale || this.content.scale || 1;
    if (!ignoreBounds) {
      const { boundX, boundY } = this.getBounds(scale);
      if (boundX) {
        x = Math.max(Math.min(x, boundX.to), boundX.from);
      }
      if (boundY) {
        y = Math.max(Math.min(y, boundY.to), boundY.from);
      }
    }
    this.friction = friction;
    this.transform = {
      ...this.transform,
      x,
      y,
      scale
    };
    if (friction) {
      this.state = "panning";
      this.velocity = {
        x: (1 / this.friction - 1) * (x - this.content.x),
        y: (1 / this.friction - 1) * (y - this.content.y),
        scale: (1 / this.friction - 1) * (scale - this.content.scale)
      };
      this.startAnimation();
    } else {
      this.endAnimation();
    }
  }
  startAnimation() {
    if (!this.rAF) {
      this.trigger("startAnimation");
    } else {
      cancelAnimationFrame(this.rAF);
    }
    this.rAF = requestAnimationFrame(() => this.animate());
  }
  animate() {
    this.setEdgeForce();
    this.setDragForce();
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.scale *= this.friction;
    this.content.x += this.velocity.x;
    this.content.y += this.velocity.y;
    this.content.scale += this.velocity.scale;
    if (this.isAnimating()) {
      this.setTransform();
    } else if (this.state !== "pointerdown") {
      this.endAnimation();
      return;
    }
    this.rAF = requestAnimationFrame(() => this.animate());
  }
  getBounds(scale) {
    let boundX = this.boundX;
    let boundY = this.boundY;
    if (boundX !== void 0 && boundY !== void 0) {
      return { boundX, boundY };
    }
    boundX = { from: 0, to: 0 };
    boundY = { from: 0, to: 0 };
    scale = scale || this.transform.scale;
    const width = this.content.fitWidth * scale;
    const height = this.content.fitHeight * scale;
    const viewportWidth = this.viewport.width;
    const viewportHeight = this.viewport.height;
    if (width < viewportWidth) {
      const deltaX = round((viewportWidth - width) * 0.5);
      boundX.from = deltaX;
      boundX.to = deltaX;
    } else {
      boundX.from = round(viewportWidth - width);
    }
    if (height < viewportHeight) {
      const deltaY = (viewportHeight - height) * 0.5;
      boundY.from = deltaY;
      boundY.to = deltaY;
    } else {
      boundY.from = round(viewportHeight - height);
    }
    return { boundX, boundY };
  }
  setEdgeForce() {
    if (this.state !== "decel") {
      return;
    }
    const bounceForce = this.option("bounceForce");
    const { boundX, boundY } = this.getBounds(Math.max(this.transform.scale, this.content.scale));
    let pastLeft, pastRight, pastTop, pastBottom;
    if (boundX) {
      pastLeft = this.content.x < boundX.from;
      pastRight = this.content.x > boundX.to;
    }
    if (boundY) {
      pastTop = this.content.y < boundY.from;
      pastBottom = this.content.y > boundY.to;
    }
    if (pastLeft || pastRight) {
      const bound = pastLeft ? boundX.from : boundX.to;
      const distance = bound - this.content.x;
      let force = distance * bounceForce;
      const restX = this.content.x + (this.velocity.x + force) / this.friction;
      if (restX >= boundX.from && restX <= boundX.to) {
        force += this.velocity.x;
      }
      this.velocity.x = force;
      this.recalculateTransform();
    }
    if (pastTop || pastBottom) {
      const bound = pastTop ? boundY.from : boundY.to;
      const distance = bound - this.content.y;
      let force = distance * bounceForce;
      const restY = this.content.y + (force + this.velocity.y) / this.friction;
      if (restY >= boundY.from && restY <= boundY.to) {
        force += this.velocity.y;
      }
      this.velocity.y = force;
      this.recalculateTransform();
    }
  }
  setDragResistance() {
    if (this.state !== "pointerdown") {
      return;
    }
    const { boundX, boundY } = this.getBounds(this.dragPosition.scale);
    let pastLeft, pastRight, pastTop, pastBottom;
    if (boundX) {
      pastLeft = this.dragPosition.x < boundX.from;
      pastRight = this.dragPosition.x > boundX.to;
    }
    if (boundY) {
      pastTop = this.dragPosition.y < boundY.from;
      pastBottom = this.dragPosition.y > boundY.to;
    }
    if ((pastLeft || pastRight) && !(pastLeft && pastRight)) {
      const bound = pastLeft ? boundX.from : boundX.to;
      const distance = bound - this.dragPosition.x;
      this.dragPosition.x = bound - distance * 0.3;
    }
    if ((pastTop || pastBottom) && !(pastTop && pastBottom)) {
      const bound = pastTop ? boundY.from : boundY.to;
      const distance = bound - this.dragPosition.y;
      this.dragPosition.y = bound - distance * 0.3;
    }
  }
  setDragForce() {
    if (this.state === "pointerdown") {
      this.velocity.x = this.dragPosition.x - this.content.x;
      this.velocity.y = this.dragPosition.y - this.content.y;
      this.velocity.scale = this.dragPosition.scale - this.content.scale;
    }
  }
  recalculateTransform() {
    this.transform.x = this.content.x + this.velocity.x / (1 / this.friction - 1);
    this.transform.y = this.content.y + this.velocity.y / (1 / this.friction - 1);
    this.transform.scale = this.content.scale + this.velocity.scale / (1 / this.friction - 1);
  }
  isAnimating() {
    return !!(this.friction && (Math.abs(this.velocity.x) > 0.05 || Math.abs(this.velocity.y) > 0.05 || Math.abs(this.velocity.scale) > 0.05));
  }
  setTransform(final) {
    let x, y, scale;
    if (final) {
      x = round(this.transform.x);
      y = round(this.transform.y);
      scale = this.transform.scale;
      this.content = { ...this.content, x, y, scale };
    } else {
      x = round(this.content.x);
      y = round(this.content.y);
      scale = this.content.scale / (this.content.width / this.content.fitWidth);
      this.content = { ...this.content, x, y };
    }
    this.trigger("beforeTransform");
    x = round(this.content.x);
    y = round(this.content.y);
    if (final && this.option("zoom")) {
      let width;
      let height;
      width = round(this.content.fitWidth * scale);
      height = round(this.content.fitHeight * scale);
      this.content.width = width;
      this.content.height = height;
      this.transform = { ...this.transform, width, height, scale };
      Object.assign(this.$content.style, {
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "none",
        maxHeight: "none",
        transform: `translate3d(${x}px, ${y}px, 0) scale(1)`
      });
    } else {
      this.$content.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }
    this.trigger("afterTransform");
  }
  endAnimation(silently) {
    cancelAnimationFrame(this.rAF);
    this.rAF = null;
    this.velocity = {
      x: 0,
      y: 0,
      scale: 0
    };
    this.setTransform(true);
    this.state = "ready";
    this.handleCursor();
    if (silently !== true) {
      this.trigger("endAnimation");
    }
  }
  handleCursor() {
    const draggableClass = this.option("draggableClass");
    if (!draggableClass || !this.option("touch")) {
      return;
    }
    if (this.option("panOnlyZoomed") == true && this.content.width <= this.viewport.width && this.content.height <= this.viewport.height && this.transform.scale <= this.option("baseScale")) {
      this.$container.classList.remove(draggableClass);
    } else {
      this.$container.classList.add(draggableClass);
    }
  }
  detachEvents() {
    this.$content.removeEventListener("load", this.onLoad);
    this.$container.removeEventListener("wheel", this.onWheel, { passive: false });
    this.$container.removeEventListener("click", this.onClick, { passive: false });
    if (this.pointerTracker) {
      this.pointerTracker.stop();
      this.pointerTracker = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
  destroy() {
    if (this.state === "destroy") {
      return;
    }
    this.state = "destroy";
    clearTimeout(this.updateTimer);
    this.updateTimer = null;
    cancelAnimationFrame(this.rAF);
    this.rAF = null;
    this.detachEvents();
    this.detachPlugins();
    this.resetDragPosition();
  }
}
Panzoom.version = "__VERSION__";
Panzoom.Plugins = Plugins$2;
const throttle = (func, limit) => {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < limit) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};
const defaults$7 = {
  prevTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>',
  nextTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',
  classNames: {
    main: "carousel__nav",
    button: "carousel__button",
    next: "is-next",
    prev: "is-prev"
  }
};
class Navigation {
  constructor(carousel) {
    this.$container = null;
    this.$prev = null;
    this.$next = null;
    this.carousel = carousel;
    this.onRefresh = this.onRefresh.bind(this);
  }
  option(name) {
    return this.carousel.option(`Navigation.${name}`);
  }
  createButton(type) {
    const $btn = document.createElement("button");
    $btn.setAttribute("title", this.carousel.localize(`{{${type.toUpperCase()}}}`));
    const classNames = this.option("classNames.button") + " " + this.option(`classNames.${type}`);
    $btn.classList.add(...classNames.split(" "));
    $btn.setAttribute("tabindex", "0");
    $btn.innerHTML = this.carousel.localize(this.option(`${type}Tpl`));
    $btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.carousel[`slide${type === "next" ? "Next" : "Prev"}`]();
    });
    return $btn;
  }
  build() {
    if (!this.$container) {
      this.$container = document.createElement("div");
      this.$container.classList.add(...this.option("classNames.main").split(" "));
      this.carousel.$container.appendChild(this.$container);
    }
    if (!this.$next) {
      this.$next = this.createButton("next");
      this.$container.appendChild(this.$next);
    }
    if (!this.$prev) {
      this.$prev = this.createButton("prev");
      this.$container.appendChild(this.$prev);
    }
  }
  onRefresh() {
    const pageCount = this.carousel.pages.length;
    if (pageCount <= 1 || pageCount > 1 && this.carousel.elemDimWidth < this.carousel.wrapDimWidth && !Number.isInteger(this.carousel.option("slidesPerPage"))) {
      this.cleanup();
      return;
    }
    this.build();
    this.$prev.removeAttribute("disabled");
    this.$next.removeAttribute("disabled");
    if (this.carousel.option("infiniteX", this.carousel.option("infinite"))) {
      return;
    }
    if (this.carousel.page <= 0) {
      this.$prev.setAttribute("disabled", "");
    }
    if (this.carousel.page >= pageCount - 1) {
      this.$next.setAttribute("disabled", "");
    }
  }
  cleanup() {
    if (this.$prev) {
      this.$prev.remove();
    }
    this.$prev = null;
    if (this.$next) {
      this.$next.remove();
    }
    this.$next = null;
    if (this.$container) {
      this.$container.remove();
    }
    this.$container = null;
  }
  attach() {
    this.carousel.on("refresh change", this.onRefresh);
  }
  detach() {
    this.carousel.off("refresh change", this.onRefresh);
    this.cleanup();
  }
}
Navigation.defaults = defaults$7;
class Dots {
  constructor(carousel) {
    this.carousel = carousel;
    this.$list = null;
    this.events = {
      change: this.onChange.bind(this),
      refresh: this.onRefresh.bind(this)
    };
  }
  buildList() {
    if (this.carousel.pages.length < this.carousel.option("Dots.minSlideCount")) {
      return;
    }
    const $list = document.createElement("ol");
    $list.classList.add("carousel__dots");
    $list.addEventListener("click", (e) => {
      if (!("page" in e.target.dataset)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const page = parseInt(e.target.dataset.page, 10);
      const carousel = this.carousel;
      if (page === carousel.page) {
        return;
      }
      if (carousel.pages.length < 3 && carousel.option("infinite")) {
        carousel[page == 0 ? "slidePrev" : "slideNext"]();
      } else {
        carousel.slideTo(page);
      }
    });
    this.$list = $list;
    this.carousel.$container.appendChild($list);
    this.carousel.$container.classList.add("has-dots");
    return $list;
  }
  removeList() {
    if (this.$list) {
      this.$list.parentNode.removeChild(this.$list);
      this.$list = null;
    }
    this.carousel.$container.classList.remove("has-dots");
  }
  rebuildDots() {
    let $list = this.$list;
    const listExists = !!$list;
    const pagesCount = this.carousel.pages.length;
    if (pagesCount < 2) {
      if (listExists) {
        this.removeList();
      }
      return;
    }
    if (!listExists) {
      $list = this.buildList();
    }
    const dotCount = this.$list.children.length;
    if (dotCount > pagesCount) {
      for (let i = pagesCount; i < dotCount; i++) {
        this.$list.removeChild(this.$list.lastChild);
      }
      return;
    }
    for (let index = dotCount; index < pagesCount; index++) {
      const $dot = document.createElement("li");
      $dot.classList.add("carousel__dot");
      $dot.dataset.page = index;
      $dot.setAttribute("role", "button");
      $dot.setAttribute("tabindex", "0");
      $dot.setAttribute("title", this.carousel.localize("{{GOTO}}", [["%d", index + 1]]));
      $dot.addEventListener("keydown", (event) => {
        const code = event.code;
        let $el;
        if (code === "Enter" || code === "NumpadEnter") {
          $el = $dot;
        } else if (code === "ArrowRight") {
          $el = $dot.nextSibling;
        } else if (code === "ArrowLeft") {
          $el = $dot.previousSibling;
        }
        $el && $el.click();
      });
      this.$list.appendChild($dot);
    }
    this.setActiveDot();
  }
  setActiveDot() {
    if (!this.$list) {
      return;
    }
    this.$list.childNodes.forEach(($dot) => {
      $dot.classList.remove("is-selected");
    });
    const $activeDot = this.$list.childNodes[this.carousel.page];
    if ($activeDot) {
      $activeDot.classList.add("is-selected");
    }
  }
  onChange() {
    this.setActiveDot();
  }
  onRefresh() {
    this.rebuildDots();
  }
  attach() {
    this.carousel.on(this.events);
  }
  detach() {
    this.removeList();
    this.carousel.off(this.events);
    this.carousel = null;
  }
}
const defaults$6 = {
  friction: 0.92
};
class Sync {
  constructor(carousel) {
    this.carousel = carousel;
    this.selectedIndex = null;
    this.friction = 0;
    this.onNavReady = this.onNavReady.bind(this);
    this.onNavClick = this.onNavClick.bind(this);
    this.onNavCreateSlide = this.onNavCreateSlide.bind(this);
    this.onTargetChange = this.onTargetChange.bind(this);
  }
  addAsTargetFor(nav) {
    this.target = this.carousel;
    this.nav = nav;
    this.attachEvents();
  }
  addAsNavFor(target) {
    this.target = target;
    this.nav = this.carousel;
    this.attachEvents();
  }
  attachEvents() {
    this.nav.options.initialSlide = this.target.options.initialPage;
    this.nav.on("ready", this.onNavReady);
    this.nav.on("createSlide", this.onNavCreateSlide);
    this.nav.on("Panzoom.click", this.onNavClick);
    this.target.on("change", this.onTargetChange);
    this.target.on("Panzoom.afterUpdate", this.onTargetChange);
  }
  onNavReady() {
    this.onTargetChange(true);
  }
  onNavClick(carousel, panzoom, event) {
    const clickedNavSlide = event.target.closest(".carousel__slide");
    if (!clickedNavSlide) {
      return;
    }
    event.stopPropagation();
    const selectedNavIndex = parseInt(clickedNavSlide.dataset.index, 10);
    const selectedSyncPage = this.target.findPageForSlide(selectedNavIndex);
    if (this.target.page !== selectedSyncPage) {
      this.target.slideTo(selectedSyncPage, { friction: this.friction });
    }
    this.markSelectedSlide(selectedNavIndex);
  }
  onNavCreateSlide(carousel, slide) {
    if (slide.index === this.selectedIndex) {
      this.markSelectedSlide(slide.index);
    }
  }
  onTargetChange() {
    const targetIndex = this.target.pages[this.target.page].indexes[0];
    const selectedNavPage = this.nav.findPageForSlide(targetIndex);
    this.nav.slideTo(selectedNavPage);
    this.markSelectedSlide(targetIndex);
  }
  markSelectedSlide(selectedIndex) {
    this.selectedIndex = selectedIndex;
    [...this.nav.slides].filter((slide2) => slide2.$el && slide2.$el.classList.remove("is-nav-selected"));
    const slide = this.nav.slides[selectedIndex];
    if (slide && slide.$el)
      slide.$el.classList.add("is-nav-selected");
  }
  attach(carousel) {
    const sync = carousel.options.Sync;
    if (!sync.target && !sync.nav) {
      return;
    }
    if (sync.target) {
      this.addAsNavFor(sync.target);
    } else if (sync.nav) {
      this.addAsTargetFor(sync.nav);
    }
    this.friction = sync.friction;
  }
  detach() {
    if (this.nav) {
      this.nav.off("ready", this.onNavReady);
      this.nav.off("Panzoom.click", this.onNavClick);
      this.nav.off("createSlide", this.onNavCreateSlide);
    }
    if (this.target) {
      this.target.off("Panzoom.afterUpdate", this.onTargetChange);
      this.target.off("change", this.onTargetChange);
    }
  }
}
Sync.defaults = defaults$6;
const Plugins$1 = { Navigation, Dots, Sync };
const en$1 = {
  NEXT: "Next slide",
  PREV: "Previous slide",
  GOTO: "Go to slide #%d"
};
const defaults$5 = {
  slides: [],
  preload: 0,
  slidesPerPage: "auto",
  initialPage: null,
  initialSlide: null,
  friction: 0.92,
  center: true,
  infinite: true,
  fill: true,
  dragFree: false,
  prefix: "",
  classNames: {
    viewport: "carousel__viewport",
    track: "carousel__track",
    slide: "carousel__slide",
    slideSelected: "is-selected"
  },
  l10n: en$1
};
class Carousel extends Base {
  constructor($container, options = {}) {
    options = extend(true, {}, defaults$5, options);
    super(options);
    this.state = "init";
    this.$container = $container;
    if (!(this.$container instanceof HTMLElement)) {
      throw new Error("No root element provided");
    }
    this.slideNext = throttle(this.slideNext.bind(this), 250);
    this.slidePrev = throttle(this.slidePrev.bind(this), 250);
    this.init();
    $container.__Carousel = this;
  }
  init() {
    this.pages = [];
    this.page = this.pageIndex = null;
    this.prevPage = this.prevPageIndex = null;
    this.attachPlugins(Carousel.Plugins);
    this.trigger("init");
    this.initLayout();
    this.initSlides();
    this.updateMetrics();
    if (this.$track && this.pages.length) {
      this.$track.style.transform = `translate3d(${this.pages[this.page].left * -1}px, 0px, 0) scale(1)`;
    }
    this.manageSlideVisiblity();
    this.initPanzoom();
    this.state = "ready";
    this.trigger("ready");
  }
  initLayout() {
    const prefix = this.option("prefix");
    const classNames = this.option("classNames");
    this.$viewport = this.option("viewport") || this.$container.querySelector(`.${prefix}${classNames.viewport}`);
    if (!this.$viewport) {
      this.$viewport = document.createElement("div");
      this.$viewport.classList.add(...(prefix + classNames.viewport).split(" "));
      this.$viewport.append(...this.$container.childNodes);
      this.$container.appendChild(this.$viewport);
    }
    this.$track = this.option("track") || this.$container.querySelector(`.${prefix}${classNames.track}`);
    if (!this.$track) {
      this.$track = document.createElement("div");
      this.$track.classList.add(...(prefix + classNames.track).split(" "));
      this.$track.append(...this.$viewport.childNodes);
      this.$viewport.appendChild(this.$track);
    }
  }
  initSlides() {
    this.slides = [];
    const elems = this.$viewport.querySelectorAll(`.${this.option("prefix")}${this.option("classNames.slide")}`);
    elems.forEach((el) => {
      const slide = {
        $el: el,
        isDom: true
      };
      this.slides.push(slide);
      this.trigger("createSlide", slide, this.slides.length);
    });
    if (Array.isArray(this.options.slides)) {
      this.slides = extend(true, [...this.slides], this.options.slides);
    }
  }
  updateMetrics() {
    let contentWidth = 0;
    let indexes = [];
    let lastSlideWidth;
    this.slides.forEach((slide, index) => {
      const $el = slide.$el;
      const slideWidth = slide.isDom || !lastSlideWidth ? this.getSlideMetrics($el) : lastSlideWidth;
      slide.index = index;
      slide.width = slideWidth;
      slide.left = contentWidth;
      lastSlideWidth = slideWidth;
      contentWidth += slideWidth;
      indexes.push(index);
    });
    let viewportWidth = Math.max(this.$track.offsetWidth, round(this.$track.getBoundingClientRect().width));
    let viewportStyles = getComputedStyle(this.$track);
    viewportWidth = viewportWidth - (parseFloat(viewportStyles.paddingLeft) + parseFloat(viewportStyles.paddingRight));
    this.contentWidth = contentWidth;
    this.viewportWidth = viewportWidth;
    const pages = [];
    const slidesPerPage = this.option("slidesPerPage");
    if (Number.isInteger(slidesPerPage) && contentWidth > viewportWidth) {
      for (let i = 0; i < this.slides.length; i += slidesPerPage) {
        pages.push({
          indexes: indexes.slice(i, i + slidesPerPage),
          slides: this.slides.slice(i, i + slidesPerPage)
        });
      }
    } else {
      let currentPage = 0;
      let currentWidth = 0;
      for (let i = 0; i < this.slides.length; i += 1) {
        let slide = this.slides[i];
        if (!pages.length || currentWidth + slide.width > viewportWidth) {
          pages.push({
            indexes: [],
            slides: []
          });
          currentPage = pages.length - 1;
          currentWidth = 0;
        }
        currentWidth += slide.width;
        pages[currentPage].indexes.push(i);
        pages[currentPage].slides.push(slide);
      }
    }
    const shouldCenter = this.option("center");
    const shouldFill = this.option("fill");
    pages.forEach((page2, index) => {
      page2.index = index;
      page2.width = page2.slides.reduce((sum, slide) => sum + slide.width, 0);
      page2.left = page2.slides[0].left;
      if (shouldCenter) {
        page2.left += (viewportWidth - page2.width) * 0.5 * -1;
      }
      if (shouldFill && !this.option("infiniteX", this.option("infinite")) && contentWidth > viewportWidth) {
        page2.left = Math.max(page2.left, 0);
        page2.left = Math.min(page2.left, contentWidth - viewportWidth);
      }
    });
    const rez = [];
    let prevPage;
    pages.forEach((page2) => {
      const page3 = { ...page2 };
      if (prevPage && page3.left === prevPage.left) {
        prevPage.width += page3.width;
        prevPage.slides = [...prevPage.slides, ...page3.slides];
        prevPage.indexes = [...prevPage.indexes, ...page3.indexes];
      } else {
        page3.index = rez.length;
        prevPage = page3;
        rez.push(page3);
      }
    });
    this.pages = rez;
    let page = this.page;
    if (page === null) {
      const initialSlide = this.option("initialSlide");
      if (initialSlide !== null) {
        page = this.findPageForSlide(initialSlide);
      } else {
        page = parseInt(this.option("initialPage", 0), 10) || 0;
      }
      if (!rez[page]) {
        page = rez.length && page > rez.length ? rez[rez.length - 1].index : 0;
      }
      this.page = page;
      this.pageIndex = page;
    }
    this.updatePanzoom();
    this.trigger("refresh");
  }
  getSlideMetrics(node) {
    if (!node) {
      const firstSlide = this.slides[0];
      node = document.createElement("div");
      node.dataset.isTestEl = 1;
      node.style.visibility = "hidden";
      node.classList.add(...(this.option("prefix") + this.option("classNames.slide")).split(" "));
      if (firstSlide.customClass) {
        node.classList.add(...firstSlide.customClass.split(" "));
      }
      this.$track.prepend(node);
    }
    let width = Math.max(node.offsetWidth, round(node.getBoundingClientRect().width));
    const style = node.currentStyle || window.getComputedStyle(node);
    width = width + (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0);
    if (node.dataset.isTestEl) {
      node.remove();
    }
    return width;
  }
  findPageForSlide(index) {
    index = parseInt(index, 10) || 0;
    const page = this.pages.find((page2) => {
      return page2.indexes.indexOf(index) > -1;
    });
    return page ? page.index : null;
  }
  slideNext() {
    this.slideTo(this.pageIndex + 1);
  }
  slidePrev() {
    this.slideTo(this.pageIndex - 1);
  }
  slideTo(page, params = {}) {
    const { x = this.setPage(page, true) * -1, y = 0, friction = this.option("friction") } = params;
    if (this.Panzoom.content.x === x && !this.Panzoom.velocity.x && friction) {
      return;
    }
    this.Panzoom.panTo({
      x,
      y,
      friction,
      ignoreBounds: true
    });
    if (this.state === "ready" && this.Panzoom.state === "ready") {
      this.trigger("settle");
    }
  }
  initPanzoom() {
    if (this.Panzoom) {
      this.Panzoom.destroy();
    }
    const options = extend(
      true,
      {},
      {
        content: this.$track,
        wrapInner: false,
        resizeParent: false,
        zoom: false,
        click: false,
        lockAxis: "x",
        x: this.pages.length ? this.pages[this.page].left * -1 : 0,
        centerOnStart: false,
        textSelection: () => this.option("textSelection", false),
        panOnlyZoomed: function() {
          return this.content.width <= this.viewport.width;
        }
      },
      this.option("Panzoom")
    );
    this.Panzoom = new Panzoom(this.$container, options);
    this.Panzoom.on({
      "*": (name, ...details) => this.trigger(`Panzoom.${name}`, ...details),
      afterUpdate: () => {
        this.updatePage();
      },
      beforeTransform: this.onBeforeTransform.bind(this),
      touchEnd: this.onTouchEnd.bind(this),
      endAnimation: () => {
        this.trigger("settle");
      }
    });
    this.updateMetrics();
    this.manageSlideVisiblity();
  }
  updatePanzoom() {
    if (!this.Panzoom) {
      return;
    }
    this.Panzoom.content = {
      ...this.Panzoom.content,
      fitWidth: this.contentWidth,
      origWidth: this.contentWidth,
      width: this.contentWidth
    };
    if (this.pages.length > 1 && this.option("infiniteX", this.option("infinite"))) {
      this.Panzoom.boundX = null;
    } else if (this.pages.length) {
      this.Panzoom.boundX = {
        from: this.pages[this.pages.length - 1].left * -1,
        to: this.pages[0].left * -1
      };
    }
    if (this.option("infiniteY", this.option("infinite"))) {
      this.Panzoom.boundY = null;
    } else {
      this.Panzoom.boundY = {
        from: 0,
        to: 0
      };
    }
    this.Panzoom.handleCursor();
  }
  manageSlideVisiblity() {
    const contentWidth = this.contentWidth;
    const viewportWidth = this.viewportWidth;
    let currentX = this.Panzoom ? this.Panzoom.content.x * -1 : this.pages.length ? this.pages[this.page].left : 0;
    const preload = this.option("preload");
    const infinite = this.option("infiniteX", this.option("infinite"));
    const paddingLeft = parseFloat(getComputedStyle(this.$viewport, null).getPropertyValue("padding-left"));
    const paddingRight = parseFloat(getComputedStyle(this.$viewport, null).getPropertyValue("padding-right"));
    this.slides.forEach((slide) => {
      let leftBoundary, rightBoundary;
      let hasDiff = 0;
      leftBoundary = currentX - paddingLeft;
      rightBoundary = currentX + viewportWidth + paddingRight;
      leftBoundary -= preload * (viewportWidth + paddingLeft + paddingRight);
      rightBoundary += preload * (viewportWidth + paddingLeft + paddingRight);
      const insideCurrentInterval = slide.left + slide.width > leftBoundary && slide.left < rightBoundary;
      leftBoundary = currentX + contentWidth - paddingLeft;
      rightBoundary = currentX + contentWidth + viewportWidth + paddingRight;
      leftBoundary -= preload * (viewportWidth + paddingLeft + paddingRight);
      const insidePrevInterval = infinite && slide.left + slide.width > leftBoundary && slide.left < rightBoundary;
      leftBoundary = currentX - contentWidth - paddingLeft;
      rightBoundary = currentX - contentWidth + viewportWidth + paddingRight;
      leftBoundary -= preload * (viewportWidth + paddingLeft + paddingRight);
      const insideNextInterval = infinite && slide.left + slide.width > leftBoundary && slide.left < rightBoundary;
      if (insidePrevInterval || insideCurrentInterval || insideNextInterval) {
        this.createSlideEl(slide);
        if (insideCurrentInterval) {
          hasDiff = 0;
        }
        if (insidePrevInterval) {
          hasDiff = -1;
        }
        if (insideNextInterval) {
          hasDiff = 1;
        }
        if (slide.left + slide.width > currentX && slide.left <= currentX + viewportWidth + paddingRight) {
          hasDiff = 0;
        }
      } else {
        this.removeSlideEl(slide);
      }
      slide.hasDiff = hasDiff;
    });
    let nextIndex = 0;
    let nextPos = 0;
    this.slides.forEach((slide, index) => {
      let updatedX = 0;
      if (slide.$el) {
        if (index !== nextIndex || slide.hasDiff) {
          updatedX = nextPos + slide.hasDiff * contentWidth;
        } else {
          nextPos = 0;
        }
        slide.$el.style.left = Math.abs(updatedX) > 0.1 ? `${nextPos + slide.hasDiff * contentWidth}px` : "";
        nextIndex++;
      } else {
        nextPos += slide.width;
      }
    });
    this.markSelectedSlides();
  }
  createSlideEl(slide) {
    if (!slide) {
      return;
    }
    if (slide.$el) {
      let curentIndex = slide.$el.dataset.index;
      if (!curentIndex || parseInt(curentIndex, 10) !== slide.index) {
        slide.$el.dataset.index = slide.index;
        slide.$el.querySelectorAll("[data-lazy-srcset]").forEach((node) => {
          node.srcset = node.dataset.lazySrcset;
        });
        slide.$el.querySelectorAll("[data-lazy-src]").forEach((node) => {
          let lazySrc2 = node.dataset.lazySrc;
          if (node instanceof HTMLImageElement) {
            node.src = lazySrc2;
          } else {
            node.style.backgroundImage = `url('${lazySrc2}')`;
          }
        });
        let lazySrc;
        if (lazySrc = slide.$el.dataset.lazySrc) {
          slide.$el.style.backgroundImage = `url('${lazySrc}')`;
        }
        slide.state = "ready";
      }
      return;
    }
    const div = document.createElement("div");
    div.dataset.index = slide.index;
    div.classList.add(...(this.option("prefix") + this.option("classNames.slide")).split(" "));
    if (slide.customClass) {
      div.classList.add(...slide.customClass.split(" "));
    }
    if (slide.html) {
      div.innerHTML = slide.html;
    }
    const allElelements = [];
    this.slides.forEach((slide2, index) => {
      if (slide2.$el) {
        allElelements.push(index);
      }
    });
    const goal = slide.index;
    let refSlide = null;
    if (allElelements.length) {
      let refIndex = allElelements.reduce(
        (prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
      );
      refSlide = this.slides[refIndex];
    }
    this.$track.insertBefore(
      div,
      refSlide && refSlide.$el ? refSlide.index < slide.index ? refSlide.$el.nextSibling : refSlide.$el : null
    );
    slide.$el = div;
    this.trigger("createSlide", slide, goal);
    return slide;
  }
  removeSlideEl(slide) {
    if (slide.$el && !slide.isDom) {
      this.trigger("removeSlide", slide);
      slide.$el.remove();
      slide.$el = null;
    }
  }
  markSelectedSlides() {
    const selectedClass = this.option("classNames.slideSelected");
    const attr = "aria-hidden";
    this.slides.forEach((slide, index) => {
      const $el = slide.$el;
      if (!$el) {
        return;
      }
      const page = this.pages[this.page];
      if (page && page.indexes && page.indexes.indexOf(index) > -1) {
        if (selectedClass && !$el.classList.contains(selectedClass)) {
          $el.classList.add(selectedClass);
          this.trigger("selectSlide", slide);
        }
        $el.removeAttribute(attr);
      } else {
        if (selectedClass && $el.classList.contains(selectedClass)) {
          $el.classList.remove(selectedClass);
          this.trigger("unselectSlide", slide);
        }
        $el.setAttribute(attr, true);
      }
    });
  }
  updatePage() {
    this.updateMetrics();
    this.slideTo(this.page, { friction: 0 });
  }
  onBeforeTransform() {
    if (this.option("infiniteX", this.option("infinite"))) {
      this.manageInfiniteTrack();
    }
    this.manageSlideVisiblity();
  }
  manageInfiniteTrack() {
    const contentWidth = this.contentWidth;
    const viewportWidth = this.viewportWidth;
    if (!this.option("infiniteX", this.option("infinite")) || this.pages.length < 2 || contentWidth < viewportWidth) {
      return;
    }
    const panzoom = this.Panzoom;
    let isFlipped = false;
    if (panzoom.content.x < (contentWidth - viewportWidth) * -1) {
      panzoom.content.x += contentWidth;
      this.pageIndex = this.pageIndex - this.pages.length;
      isFlipped = true;
    }
    if (panzoom.content.x > viewportWidth) {
      panzoom.content.x -= contentWidth;
      this.pageIndex = this.pageIndex + this.pages.length;
      isFlipped = true;
    }
    if (isFlipped && panzoom.state === "pointerdown") {
      panzoom.resetDragPosition();
    }
    return isFlipped;
  }
  onTouchEnd(panzoom, event) {
    const dragFree = this.option("dragFree");
    if (!dragFree && this.pages.length > 1 && panzoom.dragOffset.time < 350 && Math.abs(panzoom.dragOffset.y) < 1 && Math.abs(panzoom.dragOffset.x) > 5) {
      this[panzoom.dragOffset.x < 0 ? "slideNext" : "slidePrev"]();
      return;
    }
    if (dragFree) {
      const [, nextPageIndex] = this.getPageFromPosition(panzoom.transform.x * -1);
      this.setPage(nextPageIndex);
    } else {
      this.slideToClosest();
    }
  }
  slideToClosest(params = {}) {
    let [, nextPageIndex] = this.getPageFromPosition(this.Panzoom.content.x * -1);
    this.slideTo(nextPageIndex, params);
  }
  getPageFromPosition(xPos) {
    const pageCount = this.pages.length;
    const center = this.option("center");
    if (center) {
      xPos += this.viewportWidth * 0.5;
    }
    const interval = Math.floor(xPos / this.contentWidth);
    xPos -= interval * this.contentWidth;
    let slide = this.slides.find((slide2) => slide2.left <= xPos && slide2.left + slide2.width > xPos);
    if (slide) {
      let pageIndex = this.findPageForSlide(slide.index);
      return [pageIndex, pageIndex + interval * pageCount];
    }
    return [0, 0];
  }
  setPage(page, toClosest) {
    let nextPosition = 0;
    let pageIndex = parseInt(page, 10) || 0;
    const prevPage = this.page, prevPageIndex = this.pageIndex, pageCount = this.pages.length;
    const contentWidth = this.contentWidth;
    const viewportWidth = this.viewportWidth;
    page = (pageIndex % pageCount + pageCount) % pageCount;
    if (this.option("infiniteX", this.option("infinite")) && contentWidth > viewportWidth) {
      const nextInterval = Math.floor(pageIndex / pageCount) || 0, elemDimWidth = contentWidth;
      nextPosition = this.pages[page].left + nextInterval * elemDimWidth;
      if (toClosest === true && pageCount > 2) {
        let currPosition = this.Panzoom.content.x * -1;
        const decreasedPosition = nextPosition - elemDimWidth, increasedPosition = nextPosition + elemDimWidth, diff1 = Math.abs(currPosition - nextPosition), diff2 = Math.abs(currPosition - decreasedPosition), diff3 = Math.abs(currPosition - increasedPosition);
        if (diff3 < diff1 && diff3 <= diff2) {
          nextPosition = increasedPosition;
          pageIndex += pageCount;
        } else if (diff2 < diff1 && diff2 < diff3) {
          nextPosition = decreasedPosition;
          pageIndex -= pageCount;
        }
      }
    } else {
      page = pageIndex = Math.max(0, Math.min(pageIndex, pageCount - 1));
      nextPosition = this.pages.length ? this.pages[page].left : 0;
    }
    this.page = page;
    this.pageIndex = pageIndex;
    if (prevPage !== null && page !== prevPage) {
      this.prevPage = prevPage;
      this.prevPageIndex = prevPageIndex;
      this.trigger("change", page, prevPage);
    }
    return nextPosition;
  }
  destroy() {
    this.state = "destroy";
    this.slides.forEach((slide) => {
      this.removeSlideEl(slide);
    });
    this.slides = [];
    this.Panzoom.destroy();
    this.detachPlugins();
  }
}
Carousel.version = "__VERSION__";
Carousel.Plugins = Plugins$1;
class ScrollLock {
  constructor(fancybox) {
    this.fancybox = fancybox;
    this.viewport = null;
    this.pendingUpdate = null;
    for (const methodName of ["onReady", "onResize", "onTouchstart", "onTouchmove"]) {
      this[methodName] = this[methodName].bind(this);
    }
  }
  onReady() {
    const viewport = window.visualViewport;
    if (viewport) {
      this.viewport = viewport;
      this.startY = 0;
      viewport.addEventListener("resize", this.onResize);
      this.updateViewport();
    }
    window.addEventListener("touchstart", this.onTouchstart, { passive: false });
    window.addEventListener("touchmove", this.onTouchmove, { passive: false });
    window.addEventListener("wheel", this.onWheel, { passive: false });
  }
  onResize() {
    this.updateViewport();
  }
  updateViewport() {
    const fancybox = this.fancybox, viewport = this.viewport, scale = viewport.scale || 1, $container = fancybox.$container;
    if (!$container) {
      return;
    }
    let width = "", height = "", transform = "";
    if (scale - 1 > 0.1) {
      width = `${viewport.width * scale}px`;
      height = `${viewport.height * scale}px`;
      transform = `translate3d(${viewport.offsetLeft}px, ${viewport.offsetTop}px, 0) scale(${1 / scale})`;
    }
    $container.style.width = width;
    $container.style.height = height;
    $container.style.transform = transform;
  }
  onTouchstart(event) {
    this.startY = event.touches ? event.touches[0].screenY : event.screenY;
  }
  onTouchmove(event) {
    const startY = this.startY;
    const zoom = window.innerWidth / window.document.documentElement.clientWidth;
    if (!event.cancelable) {
      return;
    }
    if (event.touches.length > 1 || zoom !== 1) {
      return;
    }
    const el = isScrollable(event.composedPath()[0]);
    if (!el) {
      event.preventDefault();
      return;
    }
    const style = window.getComputedStyle(el);
    const height = parseInt(style.getPropertyValue("height"), 10);
    const curY = event.touches ? event.touches[0].screenY : event.screenY;
    const isAtTop = startY <= curY && el.scrollTop === 0;
    const isAtBottom = startY >= curY && el.scrollHeight - el.scrollTop === height;
    if (isAtTop || isAtBottom) {
      event.preventDefault();
    }
  }
  onWheel(event) {
    if (!isScrollable(event.composedPath()[0])) {
      event.preventDefault();
    }
  }
  cleanup() {
    if (this.pendingUpdate) {
      cancelAnimationFrame(this.pendingUpdate);
      this.pendingUpdate = null;
    }
    const viewport = this.viewport;
    if (viewport) {
      viewport.removeEventListener("resize", this.onResize);
      this.viewport = null;
    }
    window.removeEventListener("touchstart", this.onTouchstart, false);
    window.removeEventListener("touchmove", this.onTouchmove, false);
    window.removeEventListener("wheel", this.onWheel, { passive: false });
  }
  attach() {
    this.fancybox.on("initLayout", this.onReady);
  }
  detach() {
    this.fancybox.off("initLayout", this.onReady);
    this.cleanup();
  }
}
const defaults$4 = {
  minSlideCount: 2,
  minScreenHeight: 500,
  autoStart: true,
  key: "t",
  Carousel: {},
  tpl: `<div class="fancybox__thumb" style="background-image:url('{{src}}')"></div>`
};
class Thumbs {
  constructor(fancybox) {
    this.fancybox = fancybox;
    this.$container = null;
    this.state = "init";
    for (const methodName of ["onPrepare", "onClosing", "onKeydown"]) {
      this[methodName] = this[methodName].bind(this);
    }
    this.events = {
      prepare: this.onPrepare,
      closing: this.onClosing,
      keydown: this.onKeydown
    };
  }
  onPrepare() {
    const slides = this.getSlides();
    if (slides.length < this.fancybox.option("Thumbs.minSlideCount")) {
      this.state = "disabled";
      return;
    }
    if (this.fancybox.option("Thumbs.autoStart") === true && this.fancybox.Carousel.Panzoom.content.height >= this.fancybox.option("Thumbs.minScreenHeight")) {
      this.build();
    }
  }
  onClosing() {
    if (this.Carousel) {
      this.Carousel.Panzoom.detachEvents();
    }
  }
  onKeydown(fancybox, key) {
    if (key === fancybox.option("Thumbs.key")) {
      this.toggle();
    }
  }
  build() {
    if (this.$container) {
      return;
    }
    const $container = document.createElement("div");
    $container.classList.add("fancybox__thumbs");
    this.fancybox.$carousel.parentNode.insertBefore($container, this.fancybox.$carousel.nextSibling);
    this.Carousel = new Carousel(
      $container,
      extend(
        true,
        {
          Dots: false,
          Navigation: false,
          Sync: {
            friction: 0
          },
          infinite: false,
          center: true,
          fill: true,
          dragFree: true,
          slidesPerPage: 1,
          preload: 1
        },
        this.fancybox.option("Thumbs.Carousel"),
        {
          Sync: {
            target: this.fancybox.Carousel
          },
          slides: this.getSlides()
        }
      )
    );
    this.Carousel.Panzoom.on("wheel", (panzoom, event) => {
      event.preventDefault();
      this.fancybox[event.deltaY < 0 ? "prev" : "next"]();
    });
    this.$container = $container;
    this.state = "visible";
  }
  getSlides() {
    const slides = [];
    for (const slide of this.fancybox.items) {
      const thumb = slide.thumb;
      if (thumb) {
        slides.push({
          html: this.fancybox.option("Thumbs.tpl").replace(/\{\{src\}\}/gi, thumb),
          customClass: `has-thumb has-${slide.type || "image"}`
        });
      }
    }
    return slides;
  }
  toggle() {
    if (this.state === "visible") {
      this.hide();
    } else if (this.state === "hidden") {
      this.show();
    } else {
      this.build();
    }
  }
  show() {
    if (this.state === "hidden") {
      this.$container.style.display = "";
      this.Carousel.Panzoom.attachEvents();
      this.state = "visible";
    }
  }
  hide() {
    if (this.state === "visible") {
      this.Carousel.Panzoom.detachEvents();
      this.$container.style.display = "none";
      this.state = "hidden";
    }
  }
  cleanup() {
    if (this.Carousel) {
      this.Carousel.destroy();
      this.Carousel = null;
    }
    if (this.$container) {
      this.$container.remove();
      this.$container = null;
    }
    this.state = "init";
  }
  attach() {
    this.fancybox.on(this.events);
  }
  detach() {
    this.fancybox.off(this.events);
    this.cleanup();
  }
}
Thumbs.defaults = defaults$4;
const buildURLQuery = (src, obj) => {
  const url = new URL(src);
  const params = new URLSearchParams(url.search);
  let rez = new URLSearchParams();
  for (const [key, value] of [...params, ...Object.entries(obj)]) {
    if (key === "t") {
      rez.set("start", parseInt(value));
    } else {
      rez.set(key, value);
    }
  }
  rez = rez.toString();
  let matches2 = src.match(/#t=((.*)?\d+s)/);
  if (matches2) {
    rez += `#t=${matches2[1]}`;
  }
  return rez;
};
const defaults$3 = {
  video: {
    autoplay: true,
    ratio: 16 / 9
  },
  youtube: {
    autohide: 1,
    fs: 1,
    rel: 0,
    hd: 1,
    wmode: "transparent",
    enablejsapi: 1,
    html5: 1
  },
  vimeo: {
    hd: 1,
    show_title: 1,
    show_byline: 1,
    show_portrait: 0,
    fullscreen: 1
  },
  html5video: {
    tpl: `<video class="fancybox__html5video" playsinline controls controlsList="nodownload" poster="{{poster}}">
  <source src="{{src}}" type="{{format}}" />Sorry, your browser doesn't support embedded videos.</video>`,
    format: ""
  }
};
class Html {
  constructor(fancybox) {
    this.fancybox = fancybox;
    for (const methodName of [
      "onInit",
      "onReady",
      "onCreateSlide",
      "onRemoveSlide",
      "onSelectSlide",
      "onUnselectSlide",
      "onRefresh",
      "onMessage"
    ]) {
      this[methodName] = this[methodName].bind(this);
    }
    this.events = {
      init: this.onInit,
      ready: this.onReady,
      "Carousel.createSlide": this.onCreateSlide,
      "Carousel.removeSlide": this.onRemoveSlide,
      "Carousel.selectSlide": this.onSelectSlide,
      "Carousel.unselectSlide": this.onUnselectSlide,
      "Carousel.refresh": this.onRefresh
    };
  }
  onInit() {
    for (const slide of this.fancybox.items) {
      this.processType(slide);
    }
  }
  processType(slide) {
    if (slide.html) {
      slide.src = slide.html;
      slide.type = "html";
      delete slide.html;
      return;
    }
    const src = slide.src || "";
    let type = slide.type || this.fancybox.options.type, rez = null;
    if (src && typeof src !== "string") {
      return;
    }
    if (rez = src.match(
      /(?:youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(?:watch\?(?:.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(?:.*)|[\w-]{11}|\?listType=(?:.*)&list=(?:.*))(?:.*)/i
    )) {
      const params = buildURLQuery(src, this.fancybox.option("Html.youtube"));
      const videoId = encodeURIComponent(rez[1]);
      slide.videoId = videoId;
      slide.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
      slide.thumb = slide.thumb || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
      slide.vendor = "youtube";
      type = "video";
    } else if (rez = src.match(/^.+vimeo.com\/(?:\/)?([\d]+)(.*)?/)) {
      const params = buildURLQuery(src, this.fancybox.option("Html.vimeo"));
      const videoId = encodeURIComponent(rez[1]);
      slide.videoId = videoId;
      slide.src = `https://player.vimeo.com/video/${videoId}?${params}`;
      slide.vendor = "vimeo";
      type = "video";
    } else if (rez = src.match(
      /(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:(?:(?:maps\/(?:place\/(?:.*)\/)?\@(.*),(\d+.?\d+?)z))|(?:\?ll=))(.*)?/i
    )) {
      slide.src = `//maps.google.${rez[1]}/?ll=${(rez[2] ? rez[2] + "&z=" + Math.floor(rez[3]) + (rez[4] ? rez[4].replace(/^\//, "&") : "") : rez[4] + "").replace(/\?/, "&")}&output=${rez[4] && rez[4].indexOf("layer=c") > 0 ? "svembed" : "embed"}`;
      type = "map";
    } else if (rez = src.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:maps\/search\/)(.*)/i)) {
      slide.src = `//maps.google.${rez[1]}/maps?q=${rez[2].replace("query=", "q=").replace("api=1", "")}&output=embed`;
      type = "map";
    }
    if (!type) {
      if (src.charAt(0) === "#") {
        type = "inline";
      } else if (rez = src.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i)) {
        type = "html5video";
        slide.format = slide.format || "video/" + (rez[1] === "ogv" ? "ogg" : rez[1]);
      } else if (src.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i)) {
        type = "image";
      } else if (src.match(/\.(pdf)((\?|#).*)?$/i)) {
        type = "pdf";
      }
    }
    slide.type = type || this.fancybox.option("defaultType", "image");
    if (type === "html5video" || type === "video") {
      slide.video = extend({}, this.fancybox.option("Html.video"), slide.video);
      if (slide._width && slide._height) {
        slide.ratio = parseFloat(slide._width) / parseFloat(slide._height);
      } else {
        slide.ratio = slide.ratio || slide.video.ratio || defaults$3.video.ratio;
      }
    }
  }
  onReady() {
    this.fancybox.Carousel.slides.forEach((slide) => {
      if (slide.$el) {
        this.setContent(slide);
        if (slide.index === this.fancybox.getSlide().index) {
          this.playVideo(slide);
        }
      }
    });
  }
  onCreateSlide(fancybox, carousel, slide) {
    if (this.fancybox.state !== "ready") {
      return;
    }
    this.setContent(slide);
  }
  loadInlineContent(slide) {
    let $content;
    if (slide.src instanceof HTMLElement) {
      $content = slide.src;
    } else if (typeof slide.src === "string") {
      const tmp = slide.src.split("#", 2);
      const id = tmp.length === 2 && tmp[0] === "" ? tmp[1] : tmp[0];
      $content = document.getElementById(id);
    }
    if ($content) {
      if (slide.type === "clone" || $content.$placeHolder) {
        $content = $content.cloneNode(true);
        let attrId = $content.getAttribute("id");
        attrId = attrId ? `${attrId}--clone` : `clone-${this.fancybox.id}-${slide.index}`;
        $content.setAttribute("id", attrId);
      } else {
        const $placeHolder = document.createElement("div");
        $placeHolder.classList.add("fancybox-placeholder");
        $content.parentNode.insertBefore($placeHolder, $content);
        $content.$placeHolder = $placeHolder;
      }
      this.fancybox.setContent(slide, $content);
    } else {
      this.fancybox.setError(slide, "{{ELEMENT_NOT_FOUND}}");
    }
  }
  loadAjaxContent(slide) {
    const fancybox = this.fancybox;
    const xhr = new XMLHttpRequest();
    fancybox.showLoading(slide);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (fancybox.state === "ready") {
          fancybox.hideLoading(slide);
          if (xhr.status === 200) {
            fancybox.setContent(slide, xhr.responseText);
          } else {
            fancybox.setError(slide, xhr.status === 404 ? "{{AJAX_NOT_FOUND}}" : "{{AJAX_FORBIDDEN}}");
          }
        }
      }
    };
    const data = slide.ajax || null;
    xhr.open(data ? "POST" : "GET", slide.src);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send(data);
    slide.xhr = xhr;
  }
  loadIframeContent(slide) {
    const fancybox = this.fancybox;
    const $iframe = document.createElement("iframe");
    $iframe.className = "fancybox__iframe";
    $iframe.setAttribute("id", `fancybox__iframe_${fancybox.id}_${slide.index}`);
    $iframe.setAttribute("allow", "autoplay; fullscreen");
    $iframe.setAttribute("scrolling", "auto");
    slide.$iframe = $iframe;
    if (slide.type !== "iframe" || slide.preload === false) {
      $iframe.setAttribute("src", slide.src);
      this.fancybox.setContent(slide, $iframe);
      this.resizeIframe(slide);
      return;
    }
    fancybox.showLoading(slide);
    const $content = document.createElement("div");
    $content.style.visibility = "hidden";
    this.fancybox.setContent(slide, $content);
    $content.appendChild($iframe);
    $iframe.onerror = () => {
      fancybox.setError(slide, "{{IFRAME_ERROR}}");
    };
    $iframe.onload = () => {
      fancybox.hideLoading(slide);
      let isFirstLoad = false;
      if (!$iframe.isReady) {
        $iframe.isReady = true;
        isFirstLoad = true;
      }
      if (!$iframe.src.length) {
        return;
      }
      $iframe.parentNode.style.visibility = "";
      this.resizeIframe(slide);
      if (isFirstLoad) {
        fancybox.revealContent(slide);
      }
    };
    $iframe.setAttribute("src", slide.src);
  }
  setAspectRatio(slide) {
    const $content = slide.$content;
    const ratio = slide.ratio;
    if (!$content) {
      return;
    }
    let width = slide._width;
    let height = slide._height;
    if (ratio || width && height) {
      Object.assign($content.style, {
        width: width && height ? "100%" : "",
        height: width && height ? "100%" : "",
        maxWidth: "",
        maxHeight: ""
      });
      let maxWidth = $content.offsetWidth;
      let maxHeight = $content.offsetHeight;
      width = width || maxWidth;
      height = height || maxHeight;
      if (width > maxWidth || height > maxHeight) {
        let maxRatio = Math.min(maxWidth / width, maxHeight / height);
        width = width * maxRatio;
        height = height * maxRatio;
      }
      if (Math.abs(width / height - ratio) > 0.01) {
        if (ratio < width / height) {
          width = height * ratio;
        } else {
          height = width / ratio;
        }
      }
      Object.assign($content.style, {
        width: `${width}px`,
        height: `${height}px`
      });
    }
  }
  resizeIframe(slide) {
    const $iframe = slide.$iframe;
    if (!$iframe) {
      return;
    }
    let width_ = slide._width || 0;
    let height_ = slide._height || 0;
    if (width_ && height_) {
      slide.autoSize = false;
    }
    const $parent = $iframe.parentNode;
    const parentStyle = $parent && $parent.style;
    if (slide.preload !== false && slide.autoSize !== false && parentStyle) {
      try {
        const compStyles = window.getComputedStyle($parent), paddingX = parseFloat(compStyles.paddingLeft) + parseFloat(compStyles.paddingRight), paddingY = parseFloat(compStyles.paddingTop) + parseFloat(compStyles.paddingBottom);
        const document2 = $iframe.contentWindow.document, $html = document2.getElementsByTagName("html")[0], $body = document2.body;
        parentStyle.width = "";
        $body.style.overflow = "hidden";
        width_ = width_ || $html.scrollWidth + paddingX;
        parentStyle.width = `${width_}px`;
        $body.style.overflow = "";
        parentStyle.flex = "0 0 auto";
        parentStyle.height = `${$body.scrollHeight}px`;
        height_ = $html.scrollHeight + paddingY;
      } catch (error) {
      }
    }
    if (width_ || height_) {
      const newStyle = {
        flex: "0 1 auto"
      };
      if (width_) {
        newStyle.width = `${width_}px`;
      }
      if (height_) {
        newStyle.height = `${height_}px`;
      }
      Object.assign(parentStyle, newStyle);
    }
  }
  onRefresh(fancybox, carousel) {
    carousel.slides.forEach((slide) => {
      if (!slide.$el) {
        return;
      }
      if (slide.$iframe) {
        this.resizeIframe(slide);
      }
      if (slide.ratio) {
        this.setAspectRatio(slide);
      }
    });
  }
  setContent(slide) {
    if (!slide || slide.isDom) {
      return;
    }
    switch (slide.type) {
      case "html":
        this.fancybox.setContent(slide, slide.src);
        break;
      case "html5video":
        this.fancybox.setContent(
          slide,
          this.fancybox.option("Html.html5video.tpl").replace(/\{\{src\}\}/gi, slide.src).replace("{{format}}", slide.format || slide.html5video && slide.html5video.format || "").replace("{{poster}}", slide.poster || slide.thumb || "")
        );
        break;
      case "inline":
      case "clone":
        this.loadInlineContent(slide);
        break;
      case "ajax":
        this.loadAjaxContent(slide);
        break;
      case "pdf":
      case "video":
      case "map":
        slide.preload = false;
      case "iframe":
        this.loadIframeContent(slide);
        break;
    }
    if (slide.ratio) {
      this.setAspectRatio(slide);
    }
  }
  onSelectSlide(fancybox, carousel, slide) {
    if (fancybox.state === "ready") {
      this.playVideo(slide);
    }
  }
  playVideo(slide) {
    if (slide.type === "html5video" && slide.video.autoplay) {
      try {
        const $video = slide.$el.querySelector("video");
        if ($video) {
          const promise = $video.play();
          if (promise !== void 0) {
            promise.then(() => {
            }).catch((error) => {
              $video.muted = true;
              $video.play();
            });
          }
        }
      } catch (err) {
      }
    }
    if (slide.type !== "video" || !(slide.$iframe && slide.$iframe.contentWindow)) {
      return;
    }
    const poller = () => {
      if (slide.state === "done" && slide.$iframe && slide.$iframe.contentWindow) {
        let command;
        if (slide.$iframe.isReady) {
          if (slide.video && slide.video.autoplay) {
            if (slide.vendor == "youtube") {
              command = {
                event: "command",
                func: "playVideo"
              };
            } else {
              command = {
                method: "play",
                value: "true"
              };
            }
          }
          if (command) {
            slide.$iframe.contentWindow.postMessage(JSON.stringify(command), "*");
          }
          return;
        }
        if (slide.vendor === "youtube") {
          command = {
            event: "listening",
            id: slide.$iframe.getAttribute("id")
          };
          slide.$iframe.contentWindow.postMessage(JSON.stringify(command), "*");
        }
      }
      slide.poller = setTimeout(poller, 250);
    };
    poller();
  }
  onUnselectSlide(fancybox, carousel, slide) {
    if (slide.type === "html5video") {
      try {
        slide.$el.querySelector("video").pause();
      } catch (error) {
      }
      return;
    }
    let command = false;
    if (slide.vendor == "vimeo") {
      command = {
        method: "pause",
        value: "true"
      };
    } else if (slide.vendor === "youtube") {
      command = {
        event: "command",
        func: "pauseVideo"
      };
    }
    if (command && slide.$iframe && slide.$iframe.contentWindow) {
      slide.$iframe.contentWindow.postMessage(JSON.stringify(command), "*");
    }
    clearTimeout(slide.poller);
  }
  onRemoveSlide(fancybox, carousel, slide) {
    if (slide.xhr) {
      slide.xhr.abort();
      slide.xhr = null;
    }
    if (slide.$iframe) {
      slide.$iframe.onload = slide.$iframe.onerror = null;
      slide.$iframe.src = "//about:blank";
      slide.$iframe = null;
    }
    const $content = slide.$content;
    if (slide.type === "inline" && $content) {
      $content.classList.remove("fancybox__content");
      if ($content.style.display !== "none") {
        $content.style.display = "none";
      }
    }
    if (slide.$closeButton) {
      slide.$closeButton.remove();
      slide.$closeButton = null;
    }
    const $placeHolder = $content && $content.$placeHolder;
    if ($placeHolder) {
      $placeHolder.parentNode.insertBefore($content, $placeHolder);
      $placeHolder.remove();
      $content.$placeHolder = null;
    }
  }
  onMessage(e) {
    try {
      let data = JSON.parse(e.data);
      if (e.origin === "https://player.vimeo.com") {
        if (data.event === "ready") {
          for (let $iframe of document.getElementsByClassName("fancybox__iframe")) {
            if ($iframe.contentWindow === e.source) {
              $iframe.isReady = 1;
            }
          }
        }
      } else if (e.origin === "https://www.youtube-nocookie.com") {
        if (data.event === "onReady") {
          document.getElementById(data.id).isReady = 1;
        }
      }
    } catch (ex) {
    }
  }
  attach() {
    this.fancybox.on(this.events);
    window.addEventListener("message", this.onMessage, false);
  }
  detach() {
    this.fancybox.off(this.events);
    window.removeEventListener("message", this.onMessage, false);
  }
}
Html.defaults = defaults$3;
const defaults$2 = {
  canZoomInClass: "can-zoom_in",
  canZoomOutClass: "can-zoom_out",
  zoom: true,
  zoomOpacity: "auto",
  zoomFriction: 0.82,
  ignoreCoveredThumbnail: false,
  touch: true,
  click: "toggleZoom",
  doubleClick: null,
  wheel: "zoom",
  fit: "contain",
  wrap: false,
  Panzoom: {
    ratio: 1
  }
};
class Image {
  constructor(fancybox) {
    this.fancybox = fancybox;
    for (const methodName of [
      "onReady",
      "onClosing",
      "onDone",
      "onPageChange",
      "onCreateSlide",
      "onRemoveSlide",
      "onImageStatusChange"
    ]) {
      this[methodName] = this[methodName].bind(this);
    }
    this.events = {
      ready: this.onReady,
      closing: this.onClosing,
      done: this.onDone,
      "Carousel.change": this.onPageChange,
      "Carousel.createSlide": this.onCreateSlide,
      "Carousel.removeSlide": this.onRemoveSlide
    };
  }
  onReady() {
    this.fancybox.Carousel.slides.forEach((slide) => {
      if (slide.$el) {
        this.setContent(slide);
      }
    });
  }
  onDone(fancybox, slide) {
    this.handleCursor(slide);
  }
  onClosing(fancybox) {
    clearTimeout(this.clickTimer);
    this.clickTimer = null;
    fancybox.Carousel.slides.forEach((slide) => {
      if (slide.$image) {
        slide.state = "destroy";
      }
      if (slide.Panzoom) {
        slide.Panzoom.detachEvents();
      }
    });
    if (this.fancybox.state === "closing" && this.canZoom(fancybox.getSlide())) {
      this.zoomOut();
    }
  }
  onCreateSlide(fancybox, carousel, slide) {
    if (this.fancybox.state !== "ready") {
      return;
    }
    this.setContent(slide);
  }
  onRemoveSlide(fancybox, carousel, slide) {
    if (slide.$image) {
      slide.$el.classList.remove(fancybox.option("Image.canZoomInClass"));
      slide.$image.remove();
      slide.$image = null;
    }
    if (slide.Panzoom) {
      slide.Panzoom.destroy();
      slide.Panzoom = null;
    }
    if (slide.$el && slide.$el.dataset) {
      delete slide.$el.dataset.imageFit;
    }
  }
  setContent(slide) {
    if (slide.isDom || slide.html || slide.type && slide.type !== "image") {
      return;
    }
    if (slide.$image) {
      return;
    }
    slide.type = "image";
    slide.state = "loading";
    const $content = document.createElement("div");
    $content.style.visibility = "hidden";
    const $image = document.createElement("img");
    $image.addEventListener("load", (event) => {
      event.stopImmediatePropagation();
      this.onImageStatusChange(slide);
    });
    $image.addEventListener("error", () => {
      this.onImageStatusChange(slide);
    });
    $image.src = slide.src;
    $image.alt = "";
    $image.draggable = false;
    $image.classList.add("fancybox__image");
    if (slide.srcset) {
      $image.setAttribute("srcset", slide.srcset);
    }
    if (slide.sizes) {
      $image.setAttribute("sizes", slide.sizes);
    }
    slide.$image = $image;
    const shouldWrap = this.fancybox.option("Image.wrap");
    if (shouldWrap) {
      const $wrap = document.createElement("div");
      $wrap.classList.add(typeof shouldWrap === "string" ? shouldWrap : "fancybox__image-wrap");
      $wrap.appendChild($image);
      $content.appendChild($wrap);
      slide.$wrap = $wrap;
    } else {
      $content.appendChild($image);
    }
    slide.$el.dataset.imageFit = this.fancybox.option("Image.fit");
    this.fancybox.setContent(slide, $content);
    if ($image.complete || $image.error) {
      this.onImageStatusChange(slide);
    } else {
      this.fancybox.showLoading(slide);
    }
  }
  onImageStatusChange(slide) {
    const $image = slide.$image;
    if (!$image || slide.state !== "loading") {
      return;
    }
    if (!($image.complete && $image.naturalWidth && $image.naturalHeight)) {
      this.fancybox.setError(slide, "{{IMAGE_ERROR}}");
      return;
    }
    this.fancybox.hideLoading(slide);
    if (this.fancybox.option("Image.fit") === "contain") {
      this.initSlidePanzoom(slide);
    }
    slide.$el.addEventListener("wheel", (event) => this.onWheel(slide, event), { passive: false });
    slide.$content.addEventListener("click", (event) => this.onClick(slide, event), { passive: false });
    this.revealContent(slide);
  }
  initSlidePanzoom(slide) {
    if (slide.Panzoom) {
      return;
    }
    slide.Panzoom = new Panzoom(
      slide.$el,
      extend(true, this.fancybox.option("Image.Panzoom", {}), {
        viewport: slide.$wrap,
        content: slide.$image,
        width: slide._width,
        height: slide._height,
        wrapInner: false,
        textSelection: true,
        touch: this.fancybox.option("Image.touch"),
        panOnlyZoomed: true,
        click: false,
        wheel: false
      })
    );
    slide.Panzoom.on("startAnimation", () => {
      this.fancybox.trigger("Image.startAnimation", slide);
    });
    slide.Panzoom.on("endAnimation", () => {
      if (slide.state === "zoomIn") {
        this.fancybox.done(slide);
      }
      this.handleCursor(slide);
      this.fancybox.trigger("Image.endAnimation", slide);
    });
    slide.Panzoom.on("afterUpdate", () => {
      this.handleCursor(slide);
      this.fancybox.trigger("Image.afterUpdate", slide);
    });
  }
  revealContent(slide) {
    if (this.fancybox.Carousel.prevPage === null && slide.index === this.fancybox.options.startIndex && this.canZoom(slide)) {
      this.zoomIn();
    } else {
      this.fancybox.revealContent(slide);
    }
  }
  getZoomInfo(slide) {
    const $thumb = slide.$thumb, thumbRect = $thumb.getBoundingClientRect(), thumbWidth = thumbRect.width, thumbHeight = thumbRect.height, contentRect = slide.$content.getBoundingClientRect(), contentWidth = contentRect.width, contentHeight = contentRect.height, shiftedTop = contentRect.top - thumbRect.top, shiftedLeft = contentRect.left - thumbRect.left;
    let opacity = this.fancybox.option("Image.zoomOpacity");
    if (opacity === "auto") {
      opacity = Math.abs(thumbWidth / thumbHeight - contentWidth / contentHeight) > 0.1;
    }
    return {
      top: shiftedTop,
      left: shiftedLeft,
      scale: contentWidth && thumbWidth ? thumbWidth / contentWidth : 1,
      opacity
    };
  }
  canZoom(slide) {
    const fancybox = this.fancybox, $container = fancybox.$container;
    if (window.visualViewport && window.visualViewport.scale !== 1) {
      return false;
    }
    if (slide.Panzoom && !slide.Panzoom.content.width) {
      return false;
    }
    if (!fancybox.option("Image.zoom") || fancybox.option("Image.fit") !== "contain") {
      return false;
    }
    const $thumb = slide.$thumb;
    if (!$thumb || slide.state === "loading") {
      return false;
    }
    $container.classList.add("fancybox__no-click");
    const rect = $thumb.getBoundingClientRect();
    let rez;
    if (this.fancybox.option("Image.ignoreCoveredThumbnail")) {
      const visibleTopLeft = document.elementFromPoint(rect.left + 1, rect.top + 1) === $thumb;
      const visibleBottomRight = document.elementFromPoint(rect.right - 1, rect.bottom - 1) === $thumb;
      rez = visibleTopLeft && visibleBottomRight;
    } else {
      rez = document.elementFromPoint(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5) === $thumb;
    }
    $container.classList.remove("fancybox__no-click");
    return rez;
  }
  zoomIn() {
    const fancybox = this.fancybox, slide = fancybox.getSlide(), Panzoom2 = slide.Panzoom;
    const { top, left, scale, opacity } = this.getZoomInfo(slide);
    fancybox.trigger("reveal", slide);
    Panzoom2.panTo({
      x: left * -1,
      y: top * -1,
      scale,
      friction: 0,
      ignoreBounds: true
    });
    slide.$content.style.visibility = "";
    slide.state = "zoomIn";
    if (opacity === true) {
      Panzoom2.on("afterTransform", (panzoom) => {
        if (slide.state === "zoomIn" || slide.state === "zoomOut") {
          panzoom.$content.style.opacity = Math.min(1, 1 - (1 - panzoom.content.scale) / (1 - scale));
        }
      });
    }
    Panzoom2.panTo({
      x: 0,
      y: 0,
      scale: 1,
      friction: this.fancybox.option("Image.zoomFriction")
    });
  }
  zoomOut() {
    const fancybox = this.fancybox, slide = fancybox.getSlide(), Panzoom2 = slide.Panzoom;
    if (!Panzoom2) {
      return;
    }
    slide.state = "zoomOut";
    fancybox.state = "customClosing";
    if (slide.$caption) {
      slide.$caption.style.visibility = "hidden";
    }
    let friction = this.fancybox.option("Image.zoomFriction");
    const animatePosition = (event) => {
      const { top, left, scale, opacity } = this.getZoomInfo(slide);
      if (!event && !opacity) {
        friction *= 0.82;
      }
      Panzoom2.panTo({
        x: left * -1,
        y: top * -1,
        scale,
        friction,
        ignoreBounds: true
      });
      friction *= 0.98;
    };
    window.addEventListener("scroll", animatePosition);
    Panzoom2.once("endAnimation", () => {
      window.removeEventListener("scroll", animatePosition);
      fancybox.destroy();
    });
    animatePosition();
  }
  handleCursor(slide) {
    if (slide.type !== "image" || !slide.$el) {
      return;
    }
    const panzoom = slide.Panzoom;
    const clickAction = this.fancybox.option("Image.click", false, slide);
    const touchIsEnabled = this.fancybox.option("Image.touch");
    const classList = slide.$el.classList;
    const zoomInClass = this.fancybox.option("Image.canZoomInClass");
    const zoomOutClass = this.fancybox.option("Image.canZoomOutClass");
    classList.remove(zoomOutClass);
    classList.remove(zoomInClass);
    if (panzoom && clickAction === "toggleZoom") {
      const canZoomIn = panzoom && panzoom.content.scale === 1 && panzoom.option("maxScale") - panzoom.content.scale > 0.01;
      if (canZoomIn) {
        classList.add(zoomInClass);
      } else if (panzoom.content.scale > 1 && !touchIsEnabled) {
        classList.add(zoomOutClass);
      }
    } else if (clickAction === "close") {
      classList.add(zoomOutClass);
    }
  }
  onWheel(slide, event) {
    if (this.fancybox.state !== "ready") {
      return;
    }
    if (this.fancybox.trigger("Image.wheel", event) === false) {
      return;
    }
    switch (this.fancybox.option("Image.wheel")) {
      case "zoom":
        if (slide.state === "done") {
          slide.Panzoom && slide.Panzoom.zoomWithWheel(event);
        }
        break;
      case "close":
        this.fancybox.close();
        break;
      case "slide":
        this.fancybox[event.deltaY < 0 ? "prev" : "next"]();
        break;
    }
  }
  onClick(slide, event) {
    if (this.fancybox.state !== "ready") {
      return;
    }
    const panzoom = slide.Panzoom;
    if (panzoom && (panzoom.dragPosition.midPoint || panzoom.dragOffset.x !== 0 || panzoom.dragOffset.y !== 0 || panzoom.dragOffset.scale !== 1)) {
      return;
    }
    if (this.fancybox.Carousel.Panzoom.lockAxis) {
      return false;
    }
    const process2 = (action) => {
      switch (action) {
        case "toggleZoom":
          event.stopPropagation();
          slide.Panzoom && slide.Panzoom.zoomWithClick(event);
          break;
        case "close":
          this.fancybox.close();
          break;
        case "next":
          event.stopPropagation();
          this.fancybox.next();
          break;
      }
    };
    const clickAction = this.fancybox.option("Image.click");
    const dblclickAction = this.fancybox.option("Image.doubleClick");
    if (dblclickAction) {
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
        process2(dblclickAction);
      } else {
        this.clickTimer = setTimeout(() => {
          this.clickTimer = null;
          process2(clickAction);
        }, 300);
      }
    } else {
      process2(clickAction);
    }
  }
  onPageChange(fancybox, carousel) {
    const currSlide = fancybox.getSlide();
    carousel.slides.forEach((slide) => {
      if (!slide.Panzoom || slide.state !== "done") {
        return;
      }
      if (slide.index !== currSlide.index) {
        slide.Panzoom.panTo({
          x: 0,
          y: 0,
          scale: 1,
          friction: 0.8
        });
      }
    });
  }
  attach() {
    this.fancybox.on(this.events);
  }
  detach() {
    this.fancybox.off(this.events);
  }
}
Image.defaults = defaults$2;
class Hash {
  constructor(fancybox) {
    this.fancybox = fancybox;
    for (const methodName of ["onChange", "onClosing"]) {
      this[methodName] = this[methodName].bind(this);
    }
    this.events = {
      initCarousel: this.onChange,
      "Carousel.change": this.onChange,
      closing: this.onClosing
    };
    this.hasCreatedHistory = false;
    this.origHash = "";
    this.timer = null;
  }
  onChange(fancybox) {
    const carousel = fancybox.Carousel;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    const firstRun = carousel.prevPage === null;
    const currentSlide = fancybox.getSlide();
    const currentHash = new URL(document.URL).hash;
    let newHash = false;
    if (currentSlide.slug) {
      newHash = "#" + currentSlide.slug;
    } else {
      const dataset = currentSlide.$trigger && currentSlide.$trigger.dataset;
      const slug = fancybox.option("slug") || dataset && dataset.fancybox;
      if (slug && slug.length && slug !== "true") {
        newHash = "#" + slug + (carousel.slides.length > 1 ? "-" + (currentSlide.index + 1) : "");
      }
    }
    if (firstRun) {
      this.origHash = currentHash !== newHash ? currentHash : "";
    }
    if (newHash && currentHash !== newHash) {
      this.timer = setTimeout(() => {
        try {
          window.history[firstRun ? "pushState" : "replaceState"](
            {},
            document.title,
            window.location.pathname + window.location.search + newHash
          );
          if (firstRun) {
            this.hasCreatedHistory = true;
          }
        } catch (e) {
        }
      }, 300);
    }
  }
  onClosing() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.hasSilentClose === true) {
      return;
    }
    try {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search + (this.origHash || "")
      );
      return;
    } catch (e) {
    }
  }
  attach(fancybox) {
    fancybox.on(this.events);
  }
  detach(fancybox) {
    fancybox.off(this.events);
  }
  static startFromUrl() {
    const Fancybox2 = Hash.Fancybox;
    if (!Fancybox2 || Fancybox2.getInstance() || Fancybox2.defaults.Hash === false) {
      return;
    }
    const { hash, slug, index } = Hash.getParsedURL();
    if (!slug) {
      return;
    }
    let selectedElem = document.querySelector(`[data-slug="${hash}"]`);
    if (selectedElem) {
      selectedElem.dispatchEvent(new CustomEvent("click", { bubbles: true, cancelable: true }));
    }
    if (Fancybox2.getInstance()) {
      return;
    }
    const groupElems = document.querySelectorAll(`[data-fancybox="${slug}"]`);
    if (!groupElems.length) {
      return;
    }
    if (index === null && groupElems.length === 1) {
      selectedElem = groupElems[0];
    } else if (index) {
      selectedElem = groupElems[index - 1];
    }
    if (selectedElem) {
      selectedElem.dispatchEvent(new CustomEvent("click", { bubbles: true, cancelable: true }));
    }
  }
  static onHashChange() {
    const { slug, index } = Hash.getParsedURL();
    const Fancybox2 = Hash.Fancybox;
    const instance = Fancybox2 && Fancybox2.getInstance();
    if (instance && instance.plugins.Hash) {
      if (slug) {
        const carousel = instance.Carousel;
        if (slug === instance.option("slug")) {
          return carousel.slideTo(index - 1);
        }
        for (let slide2 of carousel.slides) {
          if (slide2.slug && slide2.slug === slug) {
            return carousel.slideTo(slide2.index);
          }
        }
        const slide = instance.getSlide();
        const dataset = slide.$trigger && slide.$trigger.dataset;
        if (dataset && dataset.fancybox === slug) {
          return carousel.slideTo(index - 1);
        }
      }
      instance.plugins.Hash.hasSilentClose = true;
      instance.close();
    }
    Hash.startFromUrl();
  }
  static create(Fancybox2) {
    Hash.Fancybox = Fancybox2;
    function proceed() {
      window.addEventListener("hashchange", Hash.onHashChange, false);
      Hash.startFromUrl();
    }
    if (canUseDOM) {
      window.requestAnimationFrame(() => {
        if (/complete|interactive|loaded/.test(document.readyState)) {
          proceed();
        } else {
          document.addEventListener("DOMContentLoaded", proceed);
        }
      });
    }
  }
  static destroy() {
    window.removeEventListener("hashchange", Hash.onHashChange, false);
  }
  static getParsedURL() {
    const hash = window.location.hash.substr(1), tmp = hash.split("-"), index = tmp.length > 1 && /^\+?\d+$/.test(tmp[tmp.length - 1]) ? parseInt(tmp.pop(-1), 10) || null : null, slug = tmp.join("-");
    return {
      hash,
      slug,
      index
    };
  }
}
const Fullscreen = {
  pageXOffset: 0,
  pageYOffset: 0,
  element() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
  },
  activate(element) {
    Fullscreen.pageXOffset = window.pageXOffset;
    Fullscreen.pageYOffset = window.pageYOffset;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  },
  deactivate() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
};
class Slideshow {
  constructor(fancybox) {
    this.fancybox = fancybox;
    this.active = false;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }
  isActive() {
    return this.active;
  }
  setTimer() {
    if (!this.active || this.timer) {
      return;
    }
    const delay = this.fancybox.option("slideshow.delay", 3e3);
    this.timer = setTimeout(() => {
      this.timer = null;
      if (!this.fancybox.option("infinite") && this.fancybox.getSlide().index === this.fancybox.Carousel.slides.length - 1) {
        this.fancybox.jumpTo(0, { friction: 0 });
      } else {
        this.fancybox.next();
      }
    }, delay);
    let $progress = this.$progress;
    if (!$progress) {
      $progress = document.createElement("div");
      $progress.classList.add("fancybox__progress");
      this.fancybox.$carousel.parentNode.insertBefore($progress, this.fancybox.$carousel);
      this.$progress = $progress;
      $progress.offsetHeight;
    }
    $progress.style.transitionDuration = `${delay}ms`;
    $progress.style.transform = "scaleX(1)";
  }
  clearTimer() {
    clearTimeout(this.timer);
    this.timer = null;
    if (this.$progress) {
      this.$progress.style.transitionDuration = "";
      this.$progress.style.transform = "";
      this.$progress.offsetHeight;
    }
  }
  activate() {
    if (this.active) {
      return;
    }
    this.active = true;
    this.fancybox.$container.classList.add("has-slideshow");
    if (this.fancybox.getSlide().state === "done") {
      this.setTimer();
    }
    document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
  }
  handleVisibilityChange() {
    this.deactivate();
  }
  deactivate() {
    this.active = false;
    this.clearTimer();
    this.fancybox.$container.classList.remove("has-slideshow");
    document.removeEventListener("visibilitychange", this.handleVisibilityChange, false);
  }
  toggle() {
    if (this.active) {
      this.deactivate();
    } else if (this.fancybox.Carousel.slides.length > 1) {
      this.activate();
    }
  }
}
const defaults$1 = {
  display: [
    "counter",
    "zoom",
    "slideshow",
    "fullscreen",
    "thumbs",
    "close"
  ],
  autoEnable: true,
  items: {
    counter: {
      position: "left",
      type: "div",
      class: "fancybox__counter",
      html: '<span data-fancybox-index=""></span>&nbsp;/&nbsp;<span data-fancybox-count=""></span>',
      attr: { tabindex: -1 }
    },
    prev: {
      type: "button",
      class: "fancybox__button--prev",
      label: "PREV",
      html: '<svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8"/></svg>',
      attr: { "data-fancybox-prev": "" }
    },
    next: {
      type: "button",
      class: "fancybox__button--next",
      label: "NEXT",
      html: '<svg viewBox="0 0 24 24"><path d="M8 4l8 8-8 8"/></svg>',
      attr: { "data-fancybox-next": "" }
    },
    fullscreen: {
      type: "button",
      class: "fancybox__button--fullscreen",
      label: "TOGGLE_FULLSCREEN",
      html: `<svg viewBox="0 0 24 24">
                <g><path d="M3 8 V3h5"></path><path d="M21 8V3h-5"></path><path d="M8 21H3v-5"></path><path d="M16 21h5v-5"></path></g>
                <g><path d="M7 2v5H2M17 2v5h5M2 17h5v5M22 17h-5v5"/></g>
            </svg>`,
      click: function(event) {
        event.preventDefault();
        if (Fullscreen.element()) {
          Fullscreen.deactivate();
        } else {
          Fullscreen.activate(this.fancybox.$container);
        }
      }
    },
    slideshow: {
      type: "button",
      class: "fancybox__button--slideshow",
      label: "TOGGLE_SLIDESHOW",
      html: `<svg viewBox="0 0 24 24">
                <g><path d="M6 4v16"/><path d="M20 12L6 20"/><path d="M20 12L6 4"/></g>
                <g><path d="M7 4v15M17 4v15"/></g>
            </svg>`,
      click: function(event) {
        event.preventDefault();
        this.Slideshow.toggle();
      }
    },
    zoom: {
      type: "button",
      class: "fancybox__button--zoom",
      label: "TOGGLE_ZOOM",
      html: '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"></circle><path d="M16 16 L21 21"></svg>',
      click: function(event) {
        event.preventDefault();
        const panzoom = this.fancybox.getSlide().Panzoom;
        if (panzoom) {
          panzoom.toggleZoom();
        }
      }
    },
    download: {
      type: "link",
      label: "DOWNLOAD",
      class: "fancybox__button--download",
      html: '<svg viewBox="0 0 24 24"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.62 2.48A2 2 0 004.56 21h14.88a2 2 0 001.94-1.51L22 17"/></svg>',
      click: function(event) {
        event.stopPropagation();
      }
    },
    thumbs: {
      type: "button",
      label: "TOGGLE_THUMBS",
      class: "fancybox__button--thumbs",
      html: '<svg viewBox="0 0 24 24"><circle cx="4" cy="4" r="1" /><circle cx="12" cy="4" r="1" transform="rotate(90 12 4)"/><circle cx="20" cy="4" r="1" transform="rotate(90 20 4)"/><circle cx="4" cy="12" r="1" transform="rotate(90 4 12)"/><circle cx="12" cy="12" r="1" transform="rotate(90 12 12)"/><circle cx="20" cy="12" r="1" transform="rotate(90 20 12)"/><circle cx="4" cy="20" r="1" transform="rotate(90 4 20)"/><circle cx="12" cy="20" r="1" transform="rotate(90 12 20)"/><circle cx="20" cy="20" r="1" transform="rotate(90 20 20)"/></svg>',
      click: function(event) {
        event.stopPropagation();
        const thumbs = this.fancybox.plugins.Thumbs;
        if (thumbs) {
          thumbs.toggle();
        }
      }
    },
    close: {
      type: "button",
      label: "CLOSE",
      class: "fancybox__button--close",
      html: '<svg viewBox="0 0 24 24"><path d="M20 20L4 4m16 0L4 20"></path></svg>',
      attr: { "data-fancybox-close": "", tabindex: 0 }
    }
  }
};
class Toolbar {
  constructor(fancybox) {
    this.fancybox = fancybox;
    this.$container = null;
    this.state = "init";
    for (const methodName of [
      "onInit",
      "onPrepare",
      "onDone",
      "onKeydown",
      "onClosing",
      "onChange",
      "onSettle",
      "onRefresh"
    ]) {
      this[methodName] = this[methodName].bind(this);
    }
    this.events = {
      init: this.onInit,
      prepare: this.onPrepare,
      done: this.onDone,
      keydown: this.onKeydown,
      closing: this.onClosing,
      "Carousel.change": this.onChange,
      "Carousel.settle": this.onSettle,
      "Carousel.Panzoom.touchStart": () => this.onRefresh(),
      "Image.startAnimation": (fancybox2, slide) => this.onRefresh(slide),
      "Image.afterUpdate": (fancybox2, slide) => this.onRefresh(slide)
    };
  }
  onInit() {
    if (this.fancybox.option("Toolbar.autoEnable")) {
      let hasImage = false;
      for (const item of this.fancybox.items) {
        if (item.type === "image") {
          hasImage = true;
          break;
        }
      }
      if (!hasImage) {
        this.state = "disabled";
        return;
      }
    }
    for (const key of this.fancybox.option("Toolbar.display")) {
      const id = isPlainObject(key) ? key.id : key;
      if (id === "close") {
        this.fancybox.options.closeButton = false;
        break;
      }
    }
  }
  onPrepare() {
    const fancybox = this.fancybox;
    if (this.state !== "init") {
      return;
    }
    this.build();
    this.update();
    this.Slideshow = new Slideshow(fancybox);
    if (!fancybox.Carousel.prevPage) {
      if (fancybox.option("slideshow.autoStart")) {
        this.Slideshow.activate();
      }
      if (fancybox.option("fullscreen.autoStart") && !Fullscreen.element()) {
        try {
          Fullscreen.activate(fancybox.$container);
        } catch (error) {
        }
      }
    }
  }
  onFsChange() {
    window.scrollTo(Fullscreen.pageXOffset, Fullscreen.pageYOffset);
  }
  onSettle() {
    const fancybox = this.fancybox;
    const slideshow = this.Slideshow;
    if (slideshow && slideshow.isActive()) {
      if (fancybox.getSlide().index === fancybox.Carousel.slides.length - 1 && !fancybox.option("infinite")) {
        slideshow.deactivate();
      } else if (fancybox.getSlide().state === "done") {
        slideshow.setTimer();
      }
    }
  }
  onChange() {
    this.update();
    if (this.Slideshow && this.Slideshow.isActive()) {
      this.Slideshow.clearTimer();
    }
  }
  onDone(fancybox, slide) {
    const slideshow = this.Slideshow;
    if (slide.index === fancybox.getSlide().index) {
      this.update();
      if (slideshow && slideshow.isActive()) {
        if (!fancybox.option("infinite") && slide.index === fancybox.Carousel.slides.length - 1) {
          slideshow.deactivate();
        } else {
          slideshow.setTimer();
        }
      }
    }
  }
  onRefresh(slide) {
    if (!slide || slide.index === this.fancybox.getSlide().index) {
      this.update();
      if (this.Slideshow && this.Slideshow.isActive() && (!slide || slide.state === "done")) {
        this.Slideshow.deactivate();
      }
    }
  }
  onKeydown(fancybox, key, event) {
    if (key === " " && this.Slideshow) {
      this.Slideshow.toggle();
      event.preventDefault();
    }
  }
  onClosing() {
    if (this.Slideshow) {
      this.Slideshow.deactivate();
    }
    document.removeEventListener("fullscreenchange", this.onFsChange);
  }
  createElement(obj) {
    let $el;
    if (obj.type === "div") {
      $el = document.createElement("div");
    } else {
      $el = document.createElement(obj.type === "link" ? "a" : "button");
      $el.classList.add("carousel__button");
    }
    $el.innerHTML = obj.html;
    $el.setAttribute("tabindex", obj.tabindex || 0);
    if (obj.class) {
      $el.classList.add(...obj.class.split(" "));
    }
    for (const prop in obj.attr) {
      $el.setAttribute(prop, obj.attr[prop]);
    }
    if (obj.label) {
      $el.setAttribute("title", this.fancybox.localize(`{{${obj.label}}}`));
    }
    if (obj.click) {
      $el.addEventListener("click", obj.click.bind(this));
    }
    if (obj.id === "prev") {
      $el.setAttribute("data-fancybox-prev", "");
    }
    if (obj.id === "next") {
      $el.setAttribute("data-fancybox-next", "");
    }
    const $svg = $el.querySelector("svg");
    if ($svg) {
      $svg.setAttribute("role", "img");
      $svg.setAttribute("tabindex", "-1");
      $svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    return $el;
  }
  build() {
    this.cleanup();
    const all_items = this.fancybox.option("Toolbar.items");
    const all_groups = [
      {
        position: "left",
        items: []
      },
      {
        position: "center",
        items: []
      },
      {
        position: "right",
        items: []
      }
    ];
    const thumbs = this.fancybox.plugins.Thumbs;
    for (const key of this.fancybox.option("Toolbar.display")) {
      let id, item;
      if (isPlainObject(key)) {
        id = key.id;
        item = extend({}, all_items[id], key);
      } else {
        id = key;
        item = all_items[id];
      }
      if (["counter", "next", "prev", "slideshow"].includes(id) && this.fancybox.items.length < 2) {
        continue;
      }
      if (id === "fullscreen") {
        if (!document.fullscreenEnabled || window.fullScreen) {
          continue;
        }
        document.addEventListener("fullscreenchange", this.onFsChange);
      }
      if (id === "thumbs" && (!thumbs || thumbs.state === "disabled")) {
        continue;
      }
      if (!item) {
        continue;
      }
      let position = item.position || "right";
      let group = all_groups.find((obj) => obj.position === position);
      if (group) {
        group.items.push(item);
      }
    }
    const $container = document.createElement("div");
    $container.classList.add("fancybox__toolbar");
    for (const group of all_groups) {
      if (group.items.length) {
        const $wrap = document.createElement("div");
        $wrap.classList.add("fancybox__toolbar__items");
        $wrap.classList.add(`fancybox__toolbar__items--${group.position}`);
        for (const obj of group.items) {
          $wrap.appendChild(this.createElement(obj));
        }
        $container.appendChild($wrap);
      }
    }
    this.fancybox.$carousel.parentNode.insertBefore($container, this.fancybox.$carousel);
    this.$container = $container;
  }
  update() {
    const slide = this.fancybox.getSlide();
    const idx = slide.index;
    const cnt = this.fancybox.items.length;
    const src = slide.downloadSrc || (slide.type === "image" && !slide.error ? slide.src : null);
    for (const $el of this.fancybox.$container.querySelectorAll("a.fancybox__button--download")) {
      if (src) {
        $el.removeAttribute("disabled");
        $el.removeAttribute("tabindex");
        $el.setAttribute("href", src);
        $el.setAttribute("download", src);
        $el.setAttribute("target", "_blank");
      } else {
        $el.setAttribute("disabled", "");
        $el.setAttribute("tabindex", -1);
        $el.removeAttribute("href");
        $el.removeAttribute("download");
      }
    }
    const panzoom = slide.Panzoom;
    const canZoom = panzoom && panzoom.option("maxScale") > panzoom.option("baseScale");
    for (const $el of this.fancybox.$container.querySelectorAll(".fancybox__button--zoom")) {
      if (canZoom) {
        $el.removeAttribute("disabled");
      } else {
        $el.setAttribute("disabled", "");
      }
    }
    for (const $el of this.fancybox.$container.querySelectorAll("[data-fancybox-index]")) {
      $el.innerHTML = slide.index + 1;
    }
    for (const $el of this.fancybox.$container.querySelectorAll("[data-fancybox-count]")) {
      $el.innerHTML = cnt;
    }
    if (!this.fancybox.option("infinite")) {
      for (const $el of this.fancybox.$container.querySelectorAll("[data-fancybox-prev]")) {
        if (idx === 0) {
          $el.setAttribute("disabled", "");
        } else {
          $el.removeAttribute("disabled");
        }
      }
      for (const $el of this.fancybox.$container.querySelectorAll("[data-fancybox-next]")) {
        if (idx === cnt - 1) {
          $el.setAttribute("disabled", "");
        } else {
          $el.removeAttribute("disabled");
        }
      }
    }
  }
  cleanup() {
    if (this.Slideshow && this.Slideshow.isActive()) {
      this.Slideshow.clearTimer();
    }
    if (this.$container) {
      this.$container.remove();
    }
    this.$container = null;
  }
  attach() {
    this.fancybox.on(this.events);
  }
  detach() {
    this.fancybox.off(this.events);
    this.cleanup();
  }
}
Toolbar.defaults = defaults$1;
const Plugins = {
  ScrollLock,
  Thumbs,
  Html,
  Toolbar,
  Image,
  Hash
};
const en = {
  CLOSE: "Close",
  NEXT: "Next",
  PREV: "Previous",
  MODAL: "You can close this modal content with the ESC key",
  ERROR: "Something Went Wrong, Please Try Again Later",
  IMAGE_ERROR: "Image Not Found",
  ELEMENT_NOT_FOUND: "HTML Element Not Found",
  AJAX_NOT_FOUND: "Error Loading AJAX : Not Found",
  AJAX_FORBIDDEN: "Error Loading AJAX : Forbidden",
  IFRAME_ERROR: "Error Loading Page",
  TOGGLE_ZOOM: "Toggle zoom level",
  TOGGLE_THUMBS: "Toggle thumbnails",
  TOGGLE_SLIDESHOW: "Toggle slideshow",
  TOGGLE_FULLSCREEN: "Toggle full-screen mode",
  DOWNLOAD: "Download"
};
const defaults = {
  startIndex: 0,
  preload: 1,
  infinite: true,
  showClass: "fancybox-zoomInUp",
  hideClass: "fancybox-fadeOut",
  animated: true,
  hideScrollbar: true,
  parentEl: null,
  mainClass: null,
  autoFocus: true,
  trapFocus: true,
  placeFocusBack: true,
  click: "close",
  closeButton: "inside",
  dragToClose: true,
  keyboard: {
    Escape: "close",
    Delete: "close",
    Backspace: "close",
    PageUp: "next",
    PageDown: "prev",
    ArrowUp: "next",
    ArrowDown: "prev",
    ArrowRight: "next",
    ArrowLeft: "prev"
  },
  template: {
    closeButton: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg>',
    spinner: '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="25 25 50 50" tabindex="-1"><circle cx="50" cy="50" r="20"/></svg>',
    main: null
  },
  l10n: en
};
const instances = /* @__PURE__ */ new Map();
let called = 0;
class Fancybox extends Base {
  constructor(items, options = {}) {
    items = items.map((item) => {
      if (item.width)
        item._width = item.width;
      if (item.height)
        item._height = item.height;
      return item;
    });
    super(extend(true, {}, defaults, options));
    this.bindHandlers();
    this.state = "init";
    this.setItems(items);
    this.attachPlugins(Fancybox.Plugins);
    this.trigger("init");
    if (this.option("hideScrollbar") === true) {
      this.hideScrollbar();
    }
    this.initLayout();
    this.initCarousel();
    this.attachEvents();
    instances.set(this.id, this);
    this.trigger("prepare");
    this.state = "ready";
    this.trigger("ready");
    this.$container.setAttribute("aria-hidden", "false");
    if (this.option("trapFocus")) {
      this.focus();
    }
  }
  option(name, ...rest) {
    const slide = this.getSlide();
    let value = slide ? slide[name] : void 0;
    if (value !== void 0) {
      if (typeof value === "function") {
        value = value.call(this, this, ...rest);
      }
      return value;
    }
    return super.option(name, ...rest);
  }
  bindHandlers() {
    for (const methodName of [
      "onMousedown",
      "onKeydown",
      "onClick",
      "onFocus",
      "onCreateSlide",
      "onSettle",
      "onTouchMove",
      "onTouchEnd",
      "onTransform"
    ]) {
      this[methodName] = this[methodName].bind(this);
    }
  }
  attachEvents() {
    document.addEventListener("mousedown", this.onMousedown);
    document.addEventListener("keydown", this.onKeydown, true);
    if (this.option("trapFocus")) {
      document.addEventListener("focus", this.onFocus, true);
    }
    this.$container.addEventListener("click", this.onClick);
  }
  detachEvents() {
    document.removeEventListener("mousedown", this.onMousedown);
    document.removeEventListener("keydown", this.onKeydown, true);
    document.removeEventListener("focus", this.onFocus, true);
    this.$container.removeEventListener("click", this.onClick);
  }
  initLayout() {
    this.$root = this.option("parentEl") || document.body;
    let mainTemplate = this.option("template.main");
    if (mainTemplate) {
      this.$root.insertAdjacentHTML("beforeend", this.localize(mainTemplate));
      this.$container = this.$root.querySelector(".fancybox__container");
    }
    if (!this.$container) {
      this.$container = document.createElement("div");
      this.$root.appendChild(this.$container);
    }
    this.$container.onscroll = () => {
      this.$container.scrollLeft = 0;
      return false;
    };
    Object.entries({
      class: "fancybox__container",
      role: "dialog",
      tabIndex: "-1",
      "aria-modal": "true",
      "aria-hidden": "true",
      "aria-label": this.localize("{{MODAL}}")
    }).forEach((args) => this.$container.setAttribute(...args));
    if (this.option("animated")) {
      this.$container.classList.add("is-animated");
    }
    this.$backdrop = this.$container.querySelector(".fancybox__backdrop");
    if (!this.$backdrop) {
      this.$backdrop = document.createElement("div");
      this.$backdrop.classList.add("fancybox__backdrop");
      this.$container.appendChild(this.$backdrop);
    }
    this.$carousel = this.$container.querySelector(".fancybox__carousel");
    if (!this.$carousel) {
      this.$carousel = document.createElement("div");
      this.$carousel.classList.add("fancybox__carousel");
      this.$container.appendChild(this.$carousel);
    }
    this.$container.Fancybox = this;
    this.id = this.$container.getAttribute("id");
    if (!this.id) {
      this.id = this.options.id || ++called;
      this.$container.setAttribute("id", "fancybox-" + this.id);
    }
    const mainClass = this.option("mainClass");
    if (mainClass) {
      this.$container.classList.add(...mainClass.split(" "));
    }
    document.documentElement.classList.add("with-fancybox");
    this.trigger("initLayout");
    return this;
  }
  setItems(items) {
    const slides = [];
    for (const slide of items) {
      const $trigger = slide.$trigger;
      if ($trigger) {
        const dataset = $trigger.dataset || {};
        slide.src = dataset.src || $trigger.getAttribute("href") || slide.src;
        slide.type = dataset.type || slide.type;
        if (!slide.src && $trigger instanceof HTMLImageElement) {
          slide.src = $trigger.currentSrc || slide.$trigger.src;
        }
      }
      let $thumb = slide.$thumb;
      if (!$thumb) {
        let origTarget = slide.$trigger && slide.$trigger.origTarget;
        if (origTarget) {
          if (origTarget instanceof HTMLImageElement) {
            $thumb = origTarget;
          } else {
            $thumb = origTarget.querySelector("img:not([aria-hidden])");
          }
        }
        if (!$thumb && slide.$trigger) {
          $thumb = slide.$trigger instanceof HTMLImageElement ? slide.$trigger : slide.$trigger.querySelector("img:not([aria-hidden])");
        }
      }
      slide.$thumb = $thumb || null;
      let thumb = slide.thumb;
      if (!thumb && $thumb) {
        thumb = $thumb.currentSrc || $thumb.src;
        if (!thumb && $thumb.dataset) {
          thumb = $thumb.dataset.lazySrc || $thumb.dataset.src;
        }
      }
      if (!thumb && slide.type === "image") {
        thumb = slide.src;
      }
      slide.thumb = thumb || null;
      slide.caption = slide.caption || "";
      slides.push(slide);
    }
    this.items = slides;
  }
  initCarousel() {
    this.Carousel = new Carousel(
      this.$carousel,
      extend(
        true,
        {},
        {
          prefix: "",
          classNames: {
            viewport: "fancybox__viewport",
            track: "fancybox__track",
            slide: "fancybox__slide"
          },
          textSelection: true,
          preload: this.option("preload"),
          friction: 0.88,
          slides: this.items,
          initialPage: this.options.startIndex,
          slidesPerPage: 1,
          infiniteX: this.option("infinite"),
          infiniteY: true,
          l10n: this.option("l10n"),
          Dots: false,
          Navigation: {
            classNames: {
              main: "fancybox__nav",
              button: "carousel__button",
              next: "is-next",
              prev: "is-prev"
            }
          },
          Panzoom: {
            textSelection: true,
            panOnlyZoomed: () => {
              return this.Carousel && this.Carousel.pages && this.Carousel.pages.length < 2 && !this.option("dragToClose");
            },
            lockAxis: () => {
              if (this.Carousel) {
                let rez = "x";
                if (this.option("dragToClose")) {
                  rez += "y";
                }
                return rez;
              }
            }
          },
          on: {
            "*": (name, ...details) => this.trigger(`Carousel.${name}`, ...details),
            init: (carousel) => this.Carousel = carousel,
            createSlide: this.onCreateSlide,
            settle: this.onSettle
          }
        },
        this.option("Carousel")
      )
    );
    if (this.option("dragToClose")) {
      this.Carousel.Panzoom.on({
        touchMove: this.onTouchMove,
        afterTransform: this.onTransform,
        touchEnd: this.onTouchEnd
      });
    }
    this.trigger("initCarousel");
    return this;
  }
  onCreateSlide(carousel, slide) {
    let caption = slide.caption || "";
    if (typeof this.options.caption === "function") {
      caption = this.options.caption.call(this, this, this.Carousel, slide);
    }
    if (typeof caption === "string" && caption.length) {
      const $caption = document.createElement("div");
      const id = `fancybox__caption_${this.id}_${slide.index}`;
      $caption.className = "fancybox__caption";
      $caption.innerHTML = caption;
      $caption.setAttribute("id", id);
      slide.$caption = slide.$el.appendChild($caption);
      slide.$el.classList.add("has-caption");
      slide.$el.setAttribute("aria-labelledby", id);
    }
  }
  onSettle() {
    if (this.option("autoFocus")) {
      this.focus();
    }
  }
  onFocus(event) {
    if (!this.isTopmost()) {
      return;
    }
    this.focus(event);
  }
  onClick(event) {
    if (event.defaultPrevented) {
      return;
    }
    let eventTarget = event.composedPath()[0];
    if (eventTarget.matches("[data-fancybox-close]")) {
      event.preventDefault();
      Fancybox.close(false, event);
      return;
    }
    if (eventTarget.matches("[data-fancybox-next]")) {
      event.preventDefault();
      Fancybox.next();
      return;
    }
    if (eventTarget.matches("[data-fancybox-prev]")) {
      event.preventDefault();
      Fancybox.prev();
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement) {
      if (activeElement.closest("[contenteditable]")) {
        return;
      }
      if (!eventTarget.matches(FOCUSABLE_ELEMENTS)) {
        activeElement.blur();
      }
    }
    if (eventTarget.closest(".fancybox__content")) {
      return;
    }
    if (getSelection().toString().length) {
      return;
    }
    if (this.trigger("click", event) === false) {
      return;
    }
    const action = this.option("click");
    switch (action) {
      case "close":
        this.close();
        break;
      case "next":
        this.next();
        break;
    }
  }
  onTouchMove() {
    const panzoom = this.getSlide().Panzoom;
    return panzoom && panzoom.content.scale !== 1 ? false : true;
  }
  onTouchEnd(panzoom) {
    const distanceY = panzoom.dragOffset.y;
    if (Math.abs(distanceY) >= 150 || Math.abs(distanceY) >= 35 && panzoom.dragOffset.time < 350) {
      if (this.option("hideClass")) {
        this.getSlide().hideClass = `fancybox-throwOut${panzoom.content.y < 0 ? "Up" : "Down"}`;
      }
      this.close();
    } else if (panzoom.lockAxis === "y") {
      panzoom.panTo({ y: 0 });
    }
  }
  onTransform(panzoom) {
    const $backdrop = this.$backdrop;
    if ($backdrop) {
      const yPos = Math.abs(panzoom.content.y);
      const opacity = yPos < 1 ? "" : Math.max(0.33, Math.min(1, 1 - yPos / panzoom.content.fitHeight * 1.5));
      this.$container.style.setProperty("--fancybox-ts", opacity ? "0s" : "");
      this.$container.style.setProperty("--fancybox-opacity", opacity);
    }
  }
  onMousedown() {
    if (this.state === "ready") {
      document.body.classList.add("is-using-mouse");
    }
  }
  onKeydown(event) {
    if (!this.isTopmost()) {
      return;
    }
    document.body.classList.remove("is-using-mouse");
    const key = event.key;
    const keyboard = this.option("keyboard");
    if (!keyboard || event.ctrlKey || event.altKey || event.shiftKey) {
      return;
    }
    const target = event.composedPath()[0];
    const classList = document.activeElement && document.activeElement.classList;
    const isUIElement = classList && classList.contains("carousel__button");
    if (key !== "Escape" && !isUIElement) {
      let ignoreElements = event.target.isContentEditable || ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(target.nodeName) !== -1;
      if (ignoreElements) {
        return;
      }
    }
    if (this.trigger("keydown", key, event) === false) {
      return;
    }
    const action = keyboard[key];
    if (typeof this[action] === "function") {
      this[action]();
    }
  }
  getSlide() {
    const carousel = this.Carousel;
    if (!carousel)
      return null;
    const page = carousel.page === null ? carousel.option("initialPage") : carousel.page;
    const pages = carousel.pages || [];
    if (pages.length && pages[page]) {
      return pages[page].slides[0];
    }
    return null;
  }
  focus(event) {
    if (Fancybox.ignoreFocusChange) {
      return;
    }
    if (["init", "closing", "customClosing", "destroy"].indexOf(this.state) > -1) {
      return;
    }
    const $container = this.$container;
    const currentSlide = this.getSlide();
    const $currentSlide = currentSlide.state === "done" ? currentSlide.$el : null;
    if ($currentSlide && $currentSlide.contains(document.activeElement)) {
      return;
    }
    if (event) {
      event.preventDefault();
    }
    Fancybox.ignoreFocusChange = true;
    const allFocusableElems = Array.from($container.querySelectorAll(FOCUSABLE_ELEMENTS));
    let enabledElems = [];
    let $firstEl;
    for (let node of allFocusableElems) {
      const isNodeVisible = node.offsetParent;
      const isNodeInsideCurrentSlide = $currentSlide && $currentSlide.contains(node);
      const isNodeOutsideCarousel = !this.Carousel.$viewport.contains(node);
      if (isNodeVisible && (isNodeInsideCurrentSlide || isNodeOutsideCarousel)) {
        enabledElems.push(node);
        if (node.dataset.origTabindex !== void 0) {
          node.tabIndex = node.dataset.origTabindex;
          node.removeAttribute("data-orig-tabindex");
        }
        if (node.hasAttribute("autoFocus") || !$firstEl && isNodeInsideCurrentSlide && !node.classList.contains("carousel__button")) {
          $firstEl = node;
        }
      } else {
        node.dataset.origTabindex = node.dataset.origTabindex === void 0 ? node.getAttribute("tabindex") : node.dataset.origTabindex;
        node.tabIndex = -1;
      }
    }
    if (!event) {
      if (this.option("autoFocus") && $firstEl) {
        setFocusOn($firstEl);
      } else if (enabledElems.indexOf(document.activeElement) < 0) {
        setFocusOn($container);
      }
    } else {
      if (enabledElems.indexOf(event.target) > -1) {
        this.lastFocus = event.target;
      } else {
        if (this.lastFocus === $container) {
          setFocusOn(enabledElems[enabledElems.length - 1]);
        } else {
          setFocusOn($container);
        }
      }
    }
    this.lastFocus = document.activeElement;
    Fancybox.ignoreFocusChange = false;
  }
  hideScrollbar() {
    if (!canUseDOM) {
      return;
    }
    const scrollbarWidth = window.innerWidth - document.documentElement.getBoundingClientRect().width;
    const id = "fancybox-style-noscroll";
    let $style = document.getElementById(id);
    if ($style) {
      return;
    }
    if (scrollbarWidth > 0) {
      $style = document.createElement("style");
      $style.id = id;
      $style.type = "text/css";
      $style.innerHTML = `.compensate-for-scrollbar {padding-right: ${scrollbarWidth}px;}`;
      document.getElementsByTagName("head")[0].appendChild($style);
      document.body.classList.add("compensate-for-scrollbar");
    }
  }
  revealScrollbar() {
    document.body.classList.remove("compensate-for-scrollbar");
    const el = document.getElementById("fancybox-style-noscroll");
    if (el) {
      el.remove();
    }
  }
  clearContent(slide) {
    this.Carousel.trigger("removeSlide", slide);
    if (slide.$content) {
      slide.$content.remove();
      slide.$content = null;
    }
    if (slide.$closeButton) {
      slide.$closeButton.remove();
      slide.$closeButton = null;
    }
    if (slide._className) {
      slide.$el.classList.remove(slide._className);
    }
  }
  setContent(slide, html, opts = {}) {
    let $content;
    const $el = slide.$el;
    if (html instanceof HTMLElement) {
      if (["img", "iframe", "video", "audio"].indexOf(html.nodeName.toLowerCase()) > -1) {
        $content = document.createElement("div");
        $content.appendChild(html);
      } else {
        $content = html;
      }
    } else {
      const $fragment = document.createRange().createContextualFragment(html);
      $content = document.createElement("div");
      $content.appendChild($fragment);
    }
    if (slide.filter && !slide.error) {
      $content = $content.querySelector(slide.filter);
    }
    if (!($content instanceof Element)) {
      this.setError(slide, "{{ELEMENT_NOT_FOUND}}");
      return;
    }
    slide._className = `has-${opts.suffix || slide.type || "unknown"}`;
    $el.classList.add(slide._className);
    $content.classList.add("fancybox__content");
    if ($content.style.display === "none" || getComputedStyle($content).getPropertyValue("display") === "none") {
      $content.style.display = slide.display || this.option("defaultDisplay") || "flex";
    }
    if (slide.id) {
      $content.setAttribute("id", slide.id);
    }
    slide.$content = $content;
    $el.prepend($content);
    this.manageCloseButton(slide);
    if (slide.state !== "loading") {
      this.revealContent(slide);
    }
    return $content;
  }
  manageCloseButton(slide) {
    const position = slide.closeButton === void 0 ? this.option("closeButton") : slide.closeButton;
    if (!position || position === "top" && this.$closeButton) {
      return;
    }
    const $btn = document.createElement("button");
    $btn.classList.add("carousel__button", "is-close");
    $btn.setAttribute("title", this.options.l10n.CLOSE);
    $btn.innerHTML = this.option("template.closeButton");
    $btn.addEventListener("click", (e) => this.close(e));
    if (position === "inside") {
      if (slide.$closeButton) {
        slide.$closeButton.remove();
      }
      slide.$closeButton = slide.$content.appendChild($btn);
    } else {
      this.$closeButton = this.$container.insertBefore($btn, this.$container.firstChild);
    }
  }
  revealContent(slide) {
    this.trigger("reveal", slide);
    slide.$content.style.visibility = "";
    let showClass = false;
    if (!(slide.error || slide.state === "loading" || this.Carousel.prevPage !== null || slide.index !== this.options.startIndex)) {
      showClass = slide.showClass === void 0 ? this.option("showClass") : slide.showClass;
    }
    if (!showClass) {
      this.done(slide);
      return;
    }
    slide.state = "animating";
    this.animateCSS(slide.$content, showClass, () => {
      this.done(slide);
    });
  }
  animateCSS($element, className, callback) {
    if ($element) {
      $element.dispatchEvent(new CustomEvent("animationend", { bubbles: true, cancelable: true }));
    }
    if (!$element || !className) {
      if (typeof callback === "function") {
        callback();
      }
      return;
    }
    const handleAnimationEnd = function(event) {
      if (event.currentTarget === this) {
        $element.removeEventListener("animationend", handleAnimationEnd);
        if (callback) {
          callback();
        }
        $element.classList.remove(className);
      }
    };
    $element.addEventListener("animationend", handleAnimationEnd);
    $element.classList.add(className);
  }
  done(slide) {
    slide.state = "done";
    this.trigger("done", slide);
    const currentSlide = this.getSlide();
    if (currentSlide && slide.index === currentSlide.index && this.option("autoFocus")) {
      this.focus();
    }
  }
  setError(slide, message) {
    slide.error = message;
    this.hideLoading(slide);
    this.clearContent(slide);
    const div = document.createElement("div");
    div.classList.add("fancybox-error");
    div.innerHTML = this.localize(message || "<p>{{ERROR}}</p>");
    this.setContent(slide, div, { suffix: "error" });
  }
  showLoading(slide) {
    slide.state = "loading";
    slide.$el.classList.add("is-loading");
    let $spinner = slide.$el.querySelector(".fancybox__spinner");
    if ($spinner) {
      return;
    }
    $spinner = document.createElement("div");
    $spinner.classList.add("fancybox__spinner");
    $spinner.innerHTML = this.option("template.spinner");
    $spinner.addEventListener("click", () => {
      if (!this.Carousel.Panzoom.velocity)
        this.close();
    });
    slide.$el.prepend($spinner);
  }
  hideLoading(slide) {
    const $spinner = slide.$el && slide.$el.querySelector(".fancybox__spinner");
    if ($spinner) {
      $spinner.remove();
      slide.$el.classList.remove("is-loading");
    }
    if (slide.state === "loading") {
      this.trigger("load", slide);
      slide.state = "ready";
    }
  }
  next() {
    const carousel = this.Carousel;
    if (carousel && carousel.pages.length > 1) {
      carousel.slideNext();
    }
  }
  prev() {
    const carousel = this.Carousel;
    if (carousel && carousel.pages.length > 1) {
      carousel.slidePrev();
    }
  }
  jumpTo(...args) {
    if (this.Carousel)
      this.Carousel.slideTo(...args);
  }
  isClosing() {
    return ["closing", "customClosing", "destroy"].includes(this.state);
  }
  isTopmost() {
    return Fancybox.getInstance().id == this.id;
  }
  close(event) {
    if (event)
      event.preventDefault();
    if (this.isClosing()) {
      return;
    }
    if (this.trigger("shouldClose", event) === false) {
      return;
    }
    this.state = "closing";
    this.Carousel.Panzoom.destroy();
    this.detachEvents();
    this.trigger("closing", event);
    if (this.state === "destroy") {
      return;
    }
    this.$container.setAttribute("aria-hidden", "true");
    this.$container.classList.add("is-closing");
    const currentSlide = this.getSlide();
    this.Carousel.slides.forEach((slide) => {
      if (slide.$content && slide.index !== currentSlide.index) {
        this.Carousel.trigger("removeSlide", slide);
      }
    });
    if (this.state === "closing") {
      const hideClass = currentSlide.hideClass === void 0 ? this.option("hideClass") : currentSlide.hideClass;
      this.animateCSS(
        currentSlide.$content,
        hideClass,
        () => {
          this.destroy();
        },
        true
      );
    }
  }
  destroy() {
    if (this.state === "destroy") {
      return;
    }
    this.state = "destroy";
    this.trigger("destroy");
    const $trigger = this.option("placeFocusBack") ? this.option("triggerTarget", this.getSlide().$trigger) : null;
    this.Carousel.destroy();
    this.detachPlugins();
    this.Carousel = null;
    this.options = {};
    this.events = {};
    this.$container.remove();
    this.$container = this.$backdrop = this.$carousel = null;
    if ($trigger) {
      setFocusOn($trigger);
    }
    instances.delete(this.id);
    const nextInstance = Fancybox.getInstance();
    if (nextInstance) {
      nextInstance.focus();
      return;
    }
    document.documentElement.classList.remove("with-fancybox");
    document.body.classList.remove("is-using-mouse");
    this.revealScrollbar();
  }
  static show(items, options = {}) {
    return new Fancybox(items, options);
  }
  static fromEvent(event, options = {}) {
    if (event.defaultPrevented) {
      return;
    }
    if (event.button && event.button !== 0) {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    const origTarget = event.composedPath()[0];
    let eventTarget = origTarget;
    let triggerGroupName;
    if (eventTarget.matches("[data-fancybox-trigger]") || (eventTarget = eventTarget.closest("[data-fancybox-trigger]"))) {
      options.triggerTarget = eventTarget;
      triggerGroupName = eventTarget && eventTarget.dataset && eventTarget.dataset.fancyboxTrigger;
    }
    if (triggerGroupName) {
      const triggerItems = document.querySelectorAll(`[data-fancybox="${triggerGroupName}"]`);
      const triggerIndex = parseInt(eventTarget.dataset.fancyboxIndex, 10) || 0;
      eventTarget = triggerItems.length ? triggerItems[triggerIndex] : eventTarget;
    }
    let matchingOpener;
    let target;
    Array.from(Fancybox.openers.keys()).reverse().some((opener) => {
      target = eventTarget || origTarget;
      let found = false;
      try {
        if (target instanceof Element && (typeof opener === "string" || opener instanceof String)) {
          found = target.matches(opener) || (target = target.closest(opener));
        }
      } catch (error) {
      }
      if (found) {
        event.preventDefault();
        matchingOpener = opener;
        return true;
      }
      return false;
    });
    let rez = false;
    if (matchingOpener) {
      options.event = event;
      options.target = target;
      target.origTarget = origTarget;
      rez = Fancybox.fromOpener(matchingOpener, options);
      const nextInstance = Fancybox.getInstance();
      if (nextInstance && nextInstance.state === "ready" && event.detail) {
        document.body.classList.add("is-using-mouse");
      }
    }
    return rez;
  }
  static fromOpener(opener, options = {}) {
    const mapCallback = function(el) {
      const falseValues = ["false", "0", "no", "null", "undefined"];
      const trueValues = ["true", "1", "yes"];
      const dataset = Object.assign({}, el.dataset);
      const options2 = {};
      for (let [key, value] of Object.entries(dataset)) {
        if (key === "fancybox") {
          continue;
        }
        if (key === "width" || key === "height") {
          options2[`_${key}`] = value;
        } else if (typeof value === "string" || value instanceof String) {
          if (falseValues.indexOf(value) > -1) {
            options2[key] = false;
          } else if (trueValues.indexOf(options2[key]) > -1) {
            options2[key] = true;
          } else {
            try {
              options2[key] = JSON.parse(value);
            } catch (e) {
              options2[key] = value;
            }
          }
        } else {
          options2[key] = value;
        }
      }
      if (el instanceof Element) {
        options2.$trigger = el;
      }
      return options2;
    };
    let items = [], index = options.startIndex || 0, target = options.target || null;
    options = extend({}, options, Fancybox.openers.get(opener));
    const groupAll = options.groupAll === void 0 ? false : options.groupAll;
    const groupAttr = options.groupAttr === void 0 ? "data-fancybox" : options.groupAttr;
    const groupValue = groupAttr && target ? target.getAttribute(`${groupAttr}`) : "";
    if (!target || groupValue || groupAll) {
      const $root = options.root || (target ? target.getRootNode() : document.body);
      items = [].slice.call($root.querySelectorAll(opener));
    }
    if (target && !groupAll) {
      if (groupValue) {
        items = items.filter((el) => el.getAttribute(`${groupAttr}`) === groupValue);
      } else {
        items = [target];
      }
    }
    if (!items.length) {
      return false;
    }
    const currentInstance2 = Fancybox.getInstance();
    if (currentInstance2 && items.indexOf(currentInstance2.options.$trigger) > -1) {
      return false;
    }
    index = target ? items.indexOf(target) : index;
    items = items.map(mapCallback);
    return new Fancybox(
      items,
      extend({}, options, {
        startIndex: index,
        $trigger: target
      })
    );
  }
  static bind(selector, options = {}) {
    function attachClickEvent() {
      document.body.addEventListener("click", Fancybox.fromEvent, false);
    }
    if (!canUseDOM) {
      return;
    }
    if (!Fancybox.openers.size) {
      if (/complete|interactive|loaded/.test(document.readyState)) {
        attachClickEvent();
      } else {
        document.addEventListener("DOMContentLoaded", attachClickEvent);
      }
    }
    Fancybox.openers.set(selector, options);
  }
  static unbind(selector) {
    Fancybox.openers.delete(selector);
    if (!Fancybox.openers.size) {
      Fancybox.destroy();
    }
  }
  static destroy() {
    let fb;
    while (fb = Fancybox.getInstance()) {
      fb.destroy();
    }
    Fancybox.openers = /* @__PURE__ */ new Map();
    document.body.removeEventListener("click", Fancybox.fromEvent, false);
  }
  static getInstance(id) {
    if (id) {
      return instances.get(id);
    }
    const instance = Array.from(instances.values()).reverse().find((instance2) => {
      if (!instance2.isClosing()) {
        return instance2;
      }
      return false;
    });
    return instance || null;
  }
  static close(all2 = true, args) {
    if (all2) {
      for (const instance of instances.values()) {
        instance.close(args);
      }
    } else {
      const instance = Fancybox.getInstance();
      if (instance) {
        instance.close(args);
      }
    }
  }
  static next() {
    const instance = Fancybox.getInstance();
    if (instance) {
      instance.next();
    }
  }
  static prev() {
    const instance = Fancybox.getInstance();
    if (instance) {
      instance.prev();
    }
  }
}
Fancybox.version = "__VERSION__";
Fancybox.defaults = defaults;
Fancybox.openers = /* @__PURE__ */ new Map();
Fancybox.Plugins = Plugins;
Fancybox.bind("[data-fancybox]");
for (const [key, Plugin] of Object.entries(Fancybox.Plugins || {})) {
  if (typeof Plugin.create === "function") {
    Plugin.create(Fancybox);
  }
}
const _hoisted_1$4 = {
  id: "main-box",
  class: "container-fluid"
};
const _hoisted_2$4 = {
  key: 0,
  class: "row",
  style: { "margin-top": "20px" }
};
const _hoisted_3$3 = { class: "col-sm-9 col-md-6 col-lg-4" };
const _hoisted_4$4 = /* @__PURE__ */ createBaseVNode("div", null, "\u1EA2nh b\u1EA1n \u0111\u1EA9y l\xEAn. H\xE3y ch\u1ECDn \u1EA3nh r\xF5 khu\xF4n m\u1EB7t b\u1EA1n \u0111\u1EC3 t\u0103ng \u0111\u1ED9 ch\xEDnh x\xE1c t\xECm ki\u1EBFm", -1);
const _hoisted_5$3 = ["href", "data-download-src"];
const _hoisted_6$3 = ["src"];
const _hoisted_7$3 = {
  class: "row",
  style: { "margin-top": "20px" }
};
const _hoisted_8$2 = {
  class: "col-md-9",
  style: { "margin-bottom": "1rem" },
  id: "statistic-box"
};
const _hoisted_9$2 = {
  class: "col-md-3",
  id: "paging-box"
};
const _hoisted_10$1 = /* @__PURE__ */ createBaseVNode("div", { class: "row" }, null, -1);
const _hoisted_11$1 = {
  class: "row",
  style: { "align-items": "center" },
  id: "image-box"
};
const _hoisted_12$1 = ["href", "data-download-src"];
const _hoisted_13 = ["src"];
const _sfc_main$4 = {
  __name: "AlbumBox",
  props: ["imageList", "pageCount", "totalImagesFound", "uploadedImage"],
  emits: ["loadPage"],
  setup(__props, { emit }) {
    const props = __props;
    const { startingPage, pageSize } = getGlobalConfig();
    const state = reactive({ items: [] });
    const itemsToBeDisplayed = ref([]);
    const currentPage = ref(startingPage);
    function isDataPageNotLoadedBefore(pageNumber) {
      const fromIndex = (pageNumber - 1) * pageSize;
      var firstItemInPage = state.items.find((item) => {
        return item.id == fromIndex;
      });
      return !firstItemInPage;
    }
    async function Paging(pageNumber) {
      currentPage.value = pageNumber;
      if (isDataPageNotLoadedBefore(pageNumber)) {
        emit("loadPage", pageNumber);
      } else {
        setItemsToBeDisplayed(currentPage);
      }
    }
    watch(
      () => props.imageList,
      (newVal) => {
        migrateImagesToState(newVal, state, currentPage);
        setItemsToBeDisplayed(currentPage);
      }
    );
    function migrateImagesToState(items, state2, currentPage2) {
      if (!items || items.length == 0) {
        state2.items = [];
        return;
      }
      var startIndex = (currentPage2.value - 1) * pageSize;
      items.forEach((element) => {
        state2.items.push({
          id: startIndex,
          "thumbnail": element.thumbnail,
          "imageUrl": element.imageUrl,
          "imageWithLogoUrl": element.imageWithLogoUrl
        });
        startIndex++;
      });
    }
    function setItemsToBeDisplayed(currentPage2) {
      const fromIndex = (currentPage2.value - 1) * pageSize;
      const endIndex = currentPage2.value * pageSize;
      itemsToBeDisplayed.value = state.items.filter((item) => {
        return item.id >= fromIndex && item.id < endIndex;
      });
    }
    Fancybox.bind('[data-fancybox="imggroup"]', {
      Toolbar: {
        display: [
          { id: "prev", position: "center" },
          { id: "counter", position: "center" },
          { id: "next", position: "center" },
          "zoom",
          "download",
          "slideshow",
          "fullscreen",
          "thumbs",
          "close"
        ]
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        props.uploadedImage ? (openBlock(), createElementBlock("div", _hoisted_2$4, [
          createBaseVNode("div", _hoisted_3$3, [
            _hoisted_4$4,
            createBaseVNode("a", {
              "data-fancybox": "imggroup",
              href: props.uploadedImage,
              "data-download-src": props.uploadedImage
            }, [
              createBaseVNode("img", {
                src: props.uploadedImage,
                class: "img-fluid img-thumbnail"
              }, null, 8, _hoisted_6$3)
            ], 8, _hoisted_5$3)
          ])
        ])) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_7$3, [
          createBaseVNode("div", _hoisted_8$2, [
            createTextVNode(" C\xF3 "),
            createBaseVNode("strong", null, toDisplayString(props.totalImagesFound), 1),
            createTextVNode(" \u1EA3nh \u0111\u01B0\u1EE3c t\xECm th\u1EA5y")
          ]),
          createBaseVNode("div", _hoisted_9$2, [
            createVNode(unref(Paginate), {
              "page-count": props.pageCount,
              "click-handler": Paging,
              "prev-text": "Prev",
              "next-text": "Next",
              "page-class": "page-item"
            }, null, 8, ["page-count"])
          ])
        ]),
        _hoisted_10$1,
        createBaseVNode("div", _hoisted_11$1, [
          createVNode(TransitionGroup, { name: "list" }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(itemsToBeDisplayed.value, (item) => {
                return openBlock(), createElementBlock("div", {
                  class: "col-sm-6 col-md-3 col-lg-2",
                  key: item.id
                }, [
                  createBaseVNode("a", {
                    "data-fancybox": "imggroup",
                    href: item.imageWithLogoUrl,
                    "data-download-src": item.imageWithLogoUrl
                  }, [
                    createBaseVNode("img", {
                      src: item.thumbnail,
                      class: "img-fluid img-thumbnail"
                    }, null, 8, _hoisted_13)
                  ], 8, _hoisted_12$1)
                ]);
              }), 128))
            ]),
            _: 1
          })
        ])
      ]);
    };
  }
};
const _imports_0 = "/assets/timanhlogo.0e3ef396.png";
const Menu_vue_vue_type_style_index_0_scoped_1856c98c_lang = "";
const _sfc_main$3 = {};
const _hoisted_1$3 = {
  class: "row",
  id: "#menu"
};
const _hoisted_2$3 = /* @__PURE__ */ createStaticVNode('<div class="col-lg-2 col-md-3 col-sm-4" data-v-1856c98c><a href="/" data-v-1856c98c><div id="logo" data-v-1856c98c><img width="40%" height="40%" src="' + _imports_0 + '" data-v-1856c98c></div></a></div><div class="col-lg-10 col-md-9 col-sm-8" id="main-menu" data-v-1856c98c><ul class="nav" data-v-1856c98c><li data-v-1856c98c><a class="nav-link" data-v-1856c98c> S\u1EF1 Ki\xEAn \u0110ang M\u1EDF </a></li><li data-v-1856c98c><a class="nav-link" data-v-1856c98c> Th\xF4ng Tin C\xE1c Gi\u1EA3i </a></li><li data-v-1856c98c><a class="nav-link" data-v-1856c98c> Gi\u1EDBi Thi\u1EC7u </a></li></ul></div>', 2);
const _hoisted_4$3 = [
  _hoisted_2$3
];
function _sfc_render$1(_ctx, _cache) {
  return openBlock(), createElementBlock("div", _hoisted_1$3, _hoisted_4$3);
}
const Menu = /* @__PURE__ */ _export_sfc$1(_sfc_main$3, [["render", _sfc_render$1], ["__scopeId", "data-v-1856c98c"]]);
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var jszip_min$1 = { exports: {} };
/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/
(function(module, exports) {
  !function(e) {
    module.exports = e();
  }(function() {
    return function s(a, o, h2) {
      function u(r, e2) {
        if (!o[r]) {
          if (!a[r]) {
            var t = "function" == typeof commonjsRequire && commonjsRequire;
            if (!e2 && t)
              return t(r, true);
            if (l)
              return l(r, true);
            var n = new Error("Cannot find module '" + r + "'");
            throw n.code = "MODULE_NOT_FOUND", n;
          }
          var i = o[r] = { exports: {} };
          a[r][0].call(i.exports, function(e3) {
            var t2 = a[r][1][e3];
            return u(t2 || e3);
          }, i, i.exports, s, a, o, h2);
        }
        return o[r].exports;
      }
      for (var l = "function" == typeof commonjsRequire && commonjsRequire, e = 0; e < h2.length; e++)
        u(h2[e]);
      return u;
    }({ 1: [function(e, t, r) {
      var d = e("./utils"), c = e("./support"), p2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      r.encode = function(e2) {
        for (var t2, r2, n, i, s, a, o, h2 = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; )
          f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h2.push(p2.charAt(i) + p2.charAt(s) + p2.charAt(a) + p2.charAt(o));
        return h2.join("");
      }, r.decode = function(e2) {
        var t2, r2, n, i, s, a, o = 0, h2 = 0, u = "data:";
        if (e2.substr(0, u.length) === u)
          throw new Error("Invalid base64 input, it looks like a data url.");
        var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
        if (e2.charAt(e2.length - 1) === p2.charAt(64) && f--, e2.charAt(e2.length - 2) === p2.charAt(64) && f--, f % 1 != 0)
          throw new Error("Invalid base64 input, bad content length.");
        for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; )
          t2 = p2.indexOf(e2.charAt(o++)) << 2 | (i = p2.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p2.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p2.indexOf(e2.charAt(o++))), l[h2++] = t2, 64 !== s && (l[h2++] = r2), 64 !== a && (l[h2++] = n);
        return l;
      };
    }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
      var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
      function o(e2, t2, r2, n2, i2) {
        this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
      }
      o.prototype = { getContentWorker: function() {
        var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
        return e2.on("end", function() {
          if (this.streamInfo.data_length !== t2.uncompressedSize)
            throw new Error("Bug : uncompressed data size mismatch");
        }), e2;
      }, getCompressedWorker: function() {
        return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
      } }, o.createWorkerFrom = function(e2, t2, r2) {
        return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
      }, t.exports = o;
    }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
      var n = e("./stream/GenericWorker");
      r.STORE = { magic: "\0\0", compressWorker: function() {
        return new n("STORE compression");
      }, uncompressWorker: function() {
        return new n("STORE decompression");
      } }, r.DEFLATE = e("./flate");
    }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
      var n = e("./utils");
      var o = function() {
        for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
          e2 = r2;
          for (var n2 = 0; n2 < 8; n2++)
            e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
          t2[r2] = e2;
        }
        return t2;
      }();
      t.exports = function(e2, t2) {
        return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? function(e3, t3, r2, n2) {
          var i = o, s = n2 + r2;
          e3 ^= -1;
          for (var a = n2; a < s; a++)
            e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
          return -1 ^ e3;
        }(0 | t2, e2, e2.length, 0) : function(e3, t3, r2, n2) {
          var i = o, s = n2 + r2;
          e3 ^= -1;
          for (var a = n2; a < s; a++)
            e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
          return -1 ^ e3;
        }(0 | t2, e2, e2.length, 0) : 0;
      };
    }, { "./utils": 32 }], 5: [function(e, t, r) {
      r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
    }, {}], 6: [function(e, t, r) {
      var n = null;
      n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
    }, { lie: 37 }], 7: [function(e, t, r) {
      var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
      function h2(e2, t2) {
        a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
      }
      r.magic = "\b\0", s.inherits(h2, a), h2.prototype.processChunk = function(e2) {
        this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
      }, h2.prototype.flush = function() {
        a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
      }, h2.prototype.cleanUp = function() {
        a.prototype.cleanUp.call(this), this._pako = null;
      }, h2.prototype._createPako = function() {
        this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
        var t2 = this;
        this._pako.onData = function(e2) {
          t2.push({ data: e2, meta: t2.meta });
        };
      }, r.compressWorker = function(e2) {
        return new h2("Deflate", e2);
      }, r.uncompressWorker = function() {
        return new h2("Inflate", {});
      };
    }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
      function A(e2, t2) {
        var r2, n2 = "";
        for (r2 = 0; r2 < t2; r2++)
          n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
        return n2;
      }
      function n(e2, t2, r2, n2, i2, s2) {
        var a, o, h2 = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h2.name)), c = I.transformTo("string", O.utf8encode(h2.name)), d = h2.comment, p2 = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h2.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h2.dir, k = h2.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
        t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
        var S = 0;
        t2 && (S |= 8), l || !_ && !g || (S |= 2048);
        var z = 0, C = 0;
        w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= function(e3, t3) {
          var r3 = e3;
          return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
        }(h2.unixPermissions, w)) : (C = 20, z |= function(e3) {
          return 63 & (e3 || 0);
        }(h2.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p2), 4) + m, b += "uc" + A(y.length, 2) + y);
        var E = "";
        return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p2.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p2 };
      }
      var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
      function s(e2, t2, r2, n2) {
        i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
      }
      I.inherits(s, i), s.prototype.push = function(e2) {
        var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
        this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
      }, s.prototype.openedSource = function(e2) {
        this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
        var t2 = this.streamFiles && !e2.file.dir;
        if (t2) {
          var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          this.push({ data: r2.fileRecord, meta: { percent: 0 } });
        } else
          this.accumulate = true;
      }, s.prototype.closedSource = function(e2) {
        this.accumulate = false;
        var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
        if (this.dirRecords.push(r2.dirRecord), t2)
          this.push({ data: function(e3) {
            return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
          }(e2), meta: { percent: 100 } });
        else
          for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; )
            this.push(this.contentBuffer.shift());
        this.currentFile = null;
      }, s.prototype.flush = function() {
        for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++)
          this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
        var r2 = this.bytesWritten - e2, n2 = function(e3, t3, r3, n3, i2) {
          var s2 = I.transformTo("string", i2(n3));
          return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
        }(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
        this.push({ data: n2, meta: { percent: 100 } });
      }, s.prototype.prepareNextSource = function() {
        this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
      }, s.prototype.registerPrevious = function(e2) {
        this._sources.push(e2);
        var t2 = this;
        return e2.on("data", function(e3) {
          t2.processChunk(e3);
        }), e2.on("end", function() {
          t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
        }), e2.on("error", function(e3) {
          t2.error(e3);
        }), this;
      }, s.prototype.resume = function() {
        return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
      }, s.prototype.error = function(e2) {
        var t2 = this._sources;
        if (!i.prototype.error.call(this, e2))
          return false;
        for (var r2 = 0; r2 < t2.length; r2++)
          try {
            t2[r2].error(e2);
          } catch (e3) {
          }
        return true;
      }, s.prototype.lock = function() {
        i.prototype.lock.call(this);
        for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++)
          e2[t2].lock();
      }, t.exports = s;
    }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
      var u = e("../compressions"), n = e("./ZipFileWorker");
      r.generateWorker = function(e2, a, t2) {
        var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h2 = 0;
        try {
          e2.forEach(function(e3, t3) {
            h2++;
            var r2 = function(e4, t4) {
              var r3 = e4 || t4, n3 = u[r3];
              if (!n3)
                throw new Error(r3 + " is not a valid compression method !");
              return n3;
            }(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
            t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
          }), o.entriesCount = h2;
        } catch (e3) {
          o.error(e3);
        }
        return o;
      };
    }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
      function n() {
        if (!(this instanceof n))
          return new n();
        if (arguments.length)
          throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
        this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
          var e2 = new n();
          for (var t2 in this)
            "function" != typeof this[t2] && (e2[t2] = this[t2]);
          return e2;
        };
      }
      (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
        return new n().loadAsync(e2, t2);
      }, n.external = e("./external"), t.exports = n;
    }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
      var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
      function f(n2) {
        return new i.Promise(function(e2, t2) {
          var r2 = n2.decompressed.getContentWorker().pipe(new a());
          r2.on("error", function(e3) {
            t2(e3);
          }).on("end", function() {
            r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
          }).resume();
        });
      }
      t.exports = function(e2, o) {
        var h2 = this;
        return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
          var t2 = new s(o);
          return t2.load(e3), t2;
        }).then(function(e3) {
          var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
          if (o.checkCRC32)
            for (var n2 = 0; n2 < r2.length; n2++)
              t2.push(f(r2[n2]));
          return i.Promise.all(t2);
        }).then(function(e3) {
          for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
            var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
            h2.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h2.file(a2).unsafeOriginalName = s2);
          }
          return t2.zipComment.length && (h2.comment = t2.zipComment), h2;
        });
      };
    }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
      var n = e("../utils"), i = e("../stream/GenericWorker");
      function s(e2, t2) {
        i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
      }
      n.inherits(s, i), s.prototype._bindStream = function(e2) {
        var t2 = this;
        (this._stream = e2).pause(), e2.on("data", function(e3) {
          t2.push({ data: e3, meta: { percent: 0 } });
        }).on("error", function(e3) {
          t2.isPaused ? this.generatedError = e3 : t2.error(e3);
        }).on("end", function() {
          t2.isPaused ? t2._upstreamEnded = true : t2.end();
        });
      }, s.prototype.pause = function() {
        return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
      }, s.prototype.resume = function() {
        return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
      }, t.exports = s;
    }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
      var i = e("readable-stream").Readable;
      function n(e2, t2, r2) {
        i.call(this, t2), this._helper = e2;
        var n2 = this;
        e2.on("data", function(e3, t3) {
          n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
        }).on("error", function(e3) {
          n2.emit("error", e3);
        }).on("end", function() {
          n2.push(null);
        });
      }
      e("../utils").inherits(n, i), n.prototype._read = function() {
        this._helper.resume();
      }, t.exports = n;
    }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
      t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
        if (Buffer.from && Buffer.from !== Uint8Array.from)
          return Buffer.from(e2, t2);
        if ("number" == typeof e2)
          throw new Error('The "data" argument must not be a number');
        return new Buffer(e2, t2);
      }, allocBuffer: function(e2) {
        if (Buffer.alloc)
          return Buffer.alloc(e2);
        var t2 = new Buffer(e2);
        return t2.fill(0), t2;
      }, isBuffer: function(e2) {
        return Buffer.isBuffer(e2);
      }, isStream: function(e2) {
        return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
      } };
    }, {}], 15: [function(e, t, r) {
      function s(e2, t2, r2) {
        var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
        s2.date = s2.date || new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
        var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
        r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
        var o2 = null;
        o2 = t2 instanceof c || t2 instanceof l ? t2 : p2.isNode && p2.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
        var h3 = new d(e2, o2, s2);
        this.files[e2] = h3;
      }
      var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p2 = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
        "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
        var t2 = e2.lastIndexOf("/");
        return 0 < t2 ? e2.substring(0, t2) : "";
      }, g = function(e2) {
        return "/" !== e2.slice(-1) && (e2 += "/"), e2;
      }, b = function(e2, t2) {
        return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
      };
      function h2(e2) {
        return "[object RegExp]" === Object.prototype.toString.call(e2);
      }
      var n = { load: function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      }, forEach: function(e2) {
        var t2, r2, n2;
        for (t2 in this.files)
          n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
      }, filter: function(r2) {
        var n2 = [];
        return this.forEach(function(e2, t2) {
          r2(e2, t2) && n2.push(t2);
        }), n2;
      }, file: function(e2, t2, r2) {
        if (1 !== arguments.length)
          return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
        if (h2(e2)) {
          var n2 = e2;
          return this.filter(function(e3, t3) {
            return !t3.dir && n2.test(e3);
          });
        }
        var i2 = this.files[this.root + e2];
        return i2 && !i2.dir ? i2 : null;
      }, folder: function(r2) {
        if (!r2)
          return this;
        if (h2(r2))
          return this.filter(function(e3, t3) {
            return t3.dir && r2.test(e3);
          });
        var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
        return n2.root = t2.name, n2;
      }, remove: function(r2) {
        r2 = this.root + r2;
        var e2 = this.files[r2];
        if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir)
          delete this.files[r2];
        else
          for (var t2 = this.filter(function(e3, t3) {
            return t3.name.slice(0, r2.length) === r2;
          }), n2 = 0; n2 < t2.length; n2++)
            delete this.files[t2[n2].name];
        return this;
      }, generate: function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      }, generateInternalStream: function(e2) {
        var t2, r2 = {};
        try {
          if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type)
            throw new Error("No output type specified.");
          u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
          var n2 = r2.comment || this.comment || "";
          t2 = o.generateWorker(this, r2, n2);
        } catch (e3) {
          (t2 = new l("error")).error(e3);
        }
        return new a(t2, r2.type || "string", r2.mimeType);
      }, generateAsync: function(e2, t2) {
        return this.generateInternalStream(e2).accumulate(t2);
      }, generateNodeStream: function(e2, t2) {
        return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
      } };
      t.exports = n;
    }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
      t.exports = e("stream");
    }, { stream: void 0 }], 17: [function(e, t, r) {
      var n = e("./DataReader");
      function i(e2) {
        n.call(this, e2);
        for (var t2 = 0; t2 < this.data.length; t2++)
          e2[t2] = 255 & e2[t2];
      }
      e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
        return this.data[this.zero + e2];
      }, i.prototype.lastIndexOfSignature = function(e2) {
        for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s)
          if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2)
            return s - this.zero;
        return -1;
      }, i.prototype.readAndCheckSignature = function(e2) {
        var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
        return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
      }, i.prototype.readData = function(e2) {
        if (this.checkOffset(e2), 0 === e2)
          return [];
        var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
        return this.index += e2, t2;
      }, t.exports = i;
    }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
      var n = e("../utils");
      function i(e2) {
        this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
      }
      i.prototype = { checkOffset: function(e2) {
        this.checkIndex(this.index + e2);
      }, checkIndex: function(e2) {
        if (this.length < this.zero + e2 || e2 < 0)
          throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
      }, setIndex: function(e2) {
        this.checkIndex(e2), this.index = e2;
      }, skip: function(e2) {
        this.setIndex(this.index + e2);
      }, byteAt: function() {
      }, readInt: function(e2) {
        var t2, r2 = 0;
        for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--)
          r2 = (r2 << 8) + this.byteAt(t2);
        return this.index += e2, r2;
      }, readString: function(e2) {
        return n.transformTo("string", this.readData(e2));
      }, readData: function() {
      }, lastIndexOfSignature: function() {
      }, readAndCheckSignature: function() {
      }, readDate: function() {
        var e2 = this.readInt(4);
        return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
      } }, t.exports = i;
    }, { "../utils": 32 }], 19: [function(e, t, r) {
      var n = e("./Uint8ArrayReader");
      function i(e2) {
        n.call(this, e2);
      }
      e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
        this.checkOffset(e2);
        var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
        return this.index += e2, t2;
      }, t.exports = i;
    }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
      var n = e("./DataReader");
      function i(e2) {
        n.call(this, e2);
      }
      e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
        return this.data.charCodeAt(this.zero + e2);
      }, i.prototype.lastIndexOfSignature = function(e2) {
        return this.data.lastIndexOf(e2) - this.zero;
      }, i.prototype.readAndCheckSignature = function(e2) {
        return e2 === this.readData(4);
      }, i.prototype.readData = function(e2) {
        this.checkOffset(e2);
        var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
        return this.index += e2, t2;
      }, t.exports = i;
    }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
      var n = e("./ArrayReader");
      function i(e2) {
        n.call(this, e2);
      }
      e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
        if (this.checkOffset(e2), 0 === e2)
          return new Uint8Array(0);
        var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
        return this.index += e2, t2;
      }, t.exports = i;
    }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
      var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h2 = e("./Uint8ArrayReader");
      t.exports = function(e2) {
        var t2 = n.getTypeOf(e2);
        return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h2(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
      };
    }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
      r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
    }, {}], 24: [function(e, t, r) {
      var n = e("./GenericWorker"), i = e("../utils");
      function s(e2) {
        n.call(this, "ConvertWorker to " + e2), this.destType = e2;
      }
      i.inherits(s, n), s.prototype.processChunk = function(e2) {
        this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
      }, t.exports = s;
    }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
      var n = e("./GenericWorker"), i = e("../crc32");
      function s() {
        n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
      }
      e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
        this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
      }, t.exports = s;
    }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
      var n = e("../utils"), i = e("./GenericWorker");
      function s(e2) {
        i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
      }
      n.inherits(s, i), s.prototype.processChunk = function(e2) {
        if (e2) {
          var t2 = this.streamInfo[this.propName] || 0;
          this.streamInfo[this.propName] = t2 + e2.data.length;
        }
        i.prototype.processChunk.call(this, e2);
      }, t.exports = s;
    }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
      var n = e("../utils"), i = e("./GenericWorker");
      function s(e2) {
        i.call(this, "DataWorker");
        var t2 = this;
        this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
          t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
        }, function(e3) {
          t2.error(e3);
        });
      }
      n.inherits(s, i), s.prototype.cleanUp = function() {
        i.prototype.cleanUp.call(this), this.data = null;
      }, s.prototype.resume = function() {
        return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
      }, s.prototype._tickAndRepeat = function() {
        this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
      }, s.prototype._tick = function() {
        if (this.isPaused || this.isFinished)
          return false;
        var e2 = null, t2 = Math.min(this.max, this.index + 16384);
        if (this.index >= this.max)
          return this.end();
        switch (this.type) {
          case "string":
            e2 = this.data.substring(this.index, t2);
            break;
          case "uint8array":
            e2 = this.data.subarray(this.index, t2);
            break;
          case "array":
          case "nodebuffer":
            e2 = this.data.slice(this.index, t2);
        }
        return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
      }, t.exports = s;
    }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
      function n(e2) {
        this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
      }
      n.prototype = { push: function(e2) {
        this.emit("data", e2);
      }, end: function() {
        if (this.isFinished)
          return false;
        this.flush();
        try {
          this.emit("end"), this.cleanUp(), this.isFinished = true;
        } catch (e2) {
          this.emit("error", e2);
        }
        return true;
      }, error: function(e2) {
        return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
      }, on: function(e2, t2) {
        return this._listeners[e2].push(t2), this;
      }, cleanUp: function() {
        this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
      }, emit: function(e2, t2) {
        if (this._listeners[e2])
          for (var r2 = 0; r2 < this._listeners[e2].length; r2++)
            this._listeners[e2][r2].call(this, t2);
      }, pipe: function(e2) {
        return e2.registerPrevious(this);
      }, registerPrevious: function(e2) {
        if (this.isLocked)
          throw new Error("The stream '" + this + "' has already been used.");
        this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
        var t2 = this;
        return e2.on("data", function(e3) {
          t2.processChunk(e3);
        }), e2.on("end", function() {
          t2.end();
        }), e2.on("error", function(e3) {
          t2.error(e3);
        }), this;
      }, pause: function() {
        return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
      }, resume: function() {
        if (!this.isPaused || this.isFinished)
          return false;
        var e2 = this.isPaused = false;
        return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
      }, flush: function() {
      }, processChunk: function(e2) {
        this.push(e2);
      }, withStreamInfo: function(e2, t2) {
        return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
      }, mergeStreamInfo: function() {
        for (var e2 in this.extraStreamInfo)
          Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
      }, lock: function() {
        if (this.isLocked)
          throw new Error("The stream '" + this + "' has already been used.");
        this.isLocked = true, this.previous && this.previous.lock();
      }, toString: function() {
        var e2 = "Worker " + this.name;
        return this.previous ? this.previous + " -> " + e2 : e2;
      } }, t.exports = n;
    }, {}], 29: [function(e, t, r) {
      var h2 = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
      if (n.nodestream)
        try {
          o = e("../nodejs/NodejsStreamOutputAdapter");
        } catch (e2) {
        }
      function l(e2, o2) {
        return new a.Promise(function(t2, r2) {
          var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
          e2.on("data", function(e3, t3) {
            n2.push(e3), o2 && o2(t3);
          }).on("error", function(e3) {
            n2 = [], r2(e3);
          }).on("end", function() {
            try {
              var e3 = function(e4, t3, r3) {
                switch (e4) {
                  case "blob":
                    return h2.newBlob(h2.transformTo("arraybuffer", t3), r3);
                  case "base64":
                    return u.encode(t3);
                  default:
                    return h2.transformTo(e4, t3);
                }
              }(s2, function(e4, t3) {
                var r3, n3 = 0, i3 = null, s3 = 0;
                for (r3 = 0; r3 < t3.length; r3++)
                  s3 += t3[r3].length;
                switch (e4) {
                  case "string":
                    return t3.join("");
                  case "array":
                    return Array.prototype.concat.apply([], t3);
                  case "uint8array":
                    for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++)
                      i3.set(t3[r3], n3), n3 += t3[r3].length;
                    return i3;
                  case "nodebuffer":
                    return Buffer.concat(t3);
                  default:
                    throw new Error("concat : unsupported type '" + e4 + "'");
                }
              }(i2, n2), a2);
              t2(e3);
            } catch (e4) {
              r2(e4);
            }
            n2 = [];
          }).resume();
        });
      }
      function f(e2, t2, r2) {
        var n2 = t2;
        switch (t2) {
          case "blob":
          case "arraybuffer":
            n2 = "uint8array";
            break;
          case "base64":
            n2 = "string";
        }
        try {
          this._internalType = n2, this._outputType = t2, this._mimeType = r2, h2.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
        } catch (e3) {
          this._worker = new s("error"), this._worker.error(e3);
        }
      }
      f.prototype = { accumulate: function(e2) {
        return l(this, e2);
      }, on: function(e2, t2) {
        var r2 = this;
        return "data" === e2 ? this._worker.on(e2, function(e3) {
          t2.call(r2, e3.data, e3.meta);
        }) : this._worker.on(e2, function() {
          h2.delay(t2, arguments, r2);
        }), this;
      }, resume: function() {
        return h2.delay(this._worker.resume, [], this._worker), this;
      }, pause: function() {
        return this._worker.pause(), this;
      }, toNodejsStream: function(e2) {
        if (h2.checkSupport("nodestream"), "nodebuffer" !== this._outputType)
          throw new Error(this._outputType + " is not supported by this method");
        return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
      } }, t.exports = f;
    }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
      if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer)
        r.blob = false;
      else {
        var n = new ArrayBuffer(0);
        try {
          r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
        } catch (e2) {
          try {
            var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
            i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
          } catch (e3) {
            r.blob = false;
          }
        }
      }
      try {
        r.nodestream = !!e("readable-stream").Readable;
      } catch (e2) {
        r.nodestream = false;
      }
    }, { "readable-stream": 16 }], 31: [function(e, t, s) {
      for (var o = e("./utils"), h2 = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++)
        u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
      u[254] = u[254] = 1;
      function a() {
        n.call(this, "utf-8 decode"), this.leftOver = null;
      }
      function l() {
        n.call(this, "utf-8 encode");
      }
      s.utf8encode = function(e2) {
        return h2.nodebuffer ? r.newBufferFrom(e2, "utf-8") : function(e3) {
          var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
          for (i2 = 0; i2 < a2; i2++)
            55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
          for (t2 = h2.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++)
            55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
          return t2;
        }(e2);
      }, s.utf8decode = function(e2) {
        return h2.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : function(e3) {
          var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
          for (t2 = r2 = 0; t2 < s2; )
            if ((n2 = e3[t2++]) < 128)
              a2[r2++] = n2;
            else if (4 < (i2 = u[n2]))
              a2[r2++] = 65533, t2 += i2 - 1;
            else {
              for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; )
                n2 = n2 << 6 | 63 & e3[t2++], i2--;
              1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
            }
          return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
        }(e2 = o.transformTo(h2.uint8array ? "uint8array" : "array", e2));
      }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
        var t2 = o.transformTo(h2.uint8array ? "uint8array" : "array", e2.data);
        if (this.leftOver && this.leftOver.length) {
          if (h2.uint8array) {
            var r2 = t2;
            (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
          } else
            t2 = this.leftOver.concat(t2);
          this.leftOver = null;
        }
        var n2 = function(e3, t3) {
          var r3;
          for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); )
            r3--;
          return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
        }(t2), i2 = t2;
        n2 !== t2.length && (h2.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
      }, a.prototype.flush = function() {
        this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
      }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
        this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
      }, s.Utf8EncodeWorker = l;
    }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
      var o = e("./support"), h2 = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
      function n(e2) {
        return e2;
      }
      function l(e2, t2) {
        for (var r2 = 0; r2 < e2.length; ++r2)
          t2[r2] = 255 & e2.charCodeAt(r2);
        return t2;
      }
      e("setimmediate"), a.newBlob = function(t2, r2) {
        a.checkSupport("blob");
        try {
          return new Blob([t2], { type: r2 });
        } catch (e2) {
          try {
            var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
            return n2.append(t2), n2.getBlob(r2);
          } catch (e3) {
            throw new Error("Bug : can't construct the Blob.");
          }
        }
      };
      var i = { stringifyByChunk: function(e2, t2, r2) {
        var n2 = [], i2 = 0, s2 = e2.length;
        if (s2 <= r2)
          return String.fromCharCode.apply(null, e2);
        for (; i2 < s2; )
          "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
        return n2.join("");
      }, stringifyByChar: function(e2) {
        for (var t2 = "", r2 = 0; r2 < e2.length; r2++)
          t2 += String.fromCharCode(e2[r2]);
        return t2;
      }, applyCanBeUsed: { uint8array: function() {
        try {
          return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
        } catch (e2) {
          return false;
        }
      }(), nodebuffer: function() {
        try {
          return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
        } catch (e2) {
          return false;
        }
      }() } };
      function s(e2) {
        var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
        if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2)
          for (; 1 < t2; )
            try {
              return i.stringifyByChunk(e2, r2, t2);
            } catch (e3) {
              t2 = Math.floor(t2 / 2);
            }
        return i.stringifyByChar(e2);
      }
      function f(e2, t2) {
        for (var r2 = 0; r2 < e2.length; r2++)
          t2[r2] = e2[r2];
        return t2;
      }
      a.applyFromCharCode = s;
      var c = {};
      c.string = { string: n, array: function(e2) {
        return l(e2, new Array(e2.length));
      }, arraybuffer: function(e2) {
        return c.string.uint8array(e2).buffer;
      }, uint8array: function(e2) {
        return l(e2, new Uint8Array(e2.length));
      }, nodebuffer: function(e2) {
        return l(e2, r.allocBuffer(e2.length));
      } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
        return new Uint8Array(e2).buffer;
      }, uint8array: function(e2) {
        return new Uint8Array(e2);
      }, nodebuffer: function(e2) {
        return r.newBufferFrom(e2);
      } }, c.arraybuffer = { string: function(e2) {
        return s(new Uint8Array(e2));
      }, array: function(e2) {
        return f(new Uint8Array(e2), new Array(e2.byteLength));
      }, arraybuffer: n, uint8array: function(e2) {
        return new Uint8Array(e2);
      }, nodebuffer: function(e2) {
        return r.newBufferFrom(new Uint8Array(e2));
      } }, c.uint8array = { string: s, array: function(e2) {
        return f(e2, new Array(e2.length));
      }, arraybuffer: function(e2) {
        return e2.buffer;
      }, uint8array: n, nodebuffer: function(e2) {
        return r.newBufferFrom(e2);
      } }, c.nodebuffer = { string: s, array: function(e2) {
        return f(e2, new Array(e2.length));
      }, arraybuffer: function(e2) {
        return c.nodebuffer.uint8array(e2).buffer;
      }, uint8array: function(e2) {
        return f(e2, new Uint8Array(e2.length));
      }, nodebuffer: n }, a.transformTo = function(e2, t2) {
        if (t2 = t2 || "", !e2)
          return t2;
        a.checkSupport(e2);
        var r2 = a.getTypeOf(t2);
        return c[r2][e2](t2);
      }, a.resolve = function(e2) {
        for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
          var i2 = t2[n2];
          "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
        }
        return r2.join("/");
      }, a.getTypeOf = function(e2) {
        return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
      }, a.checkSupport = function(e2) {
        if (!o[e2.toLowerCase()])
          throw new Error(e2 + " is not supported by this platform");
      }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
        var t2, r2, n2 = "";
        for (r2 = 0; r2 < (e2 || "").length; r2++)
          n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
        return n2;
      }, a.delay = function(e2, t2, r2) {
        setImmediate(function() {
          e2.apply(r2 || null, t2 || []);
        });
      }, a.inherits = function(e2, t2) {
        function r2() {
        }
        r2.prototype = t2.prototype, e2.prototype = new r2();
      }, a.extend = function() {
        var e2, t2, r2 = {};
        for (e2 = 0; e2 < arguments.length; e2++)
          for (t2 in arguments[e2])
            Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
        return r2;
      }, a.prepareContent = function(r2, e2, n2, i2, s2) {
        return u.Promise.resolve(e2).then(function(n3) {
          return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
            var e3 = new FileReader();
            e3.onload = function(e4) {
              t2(e4.target.result);
            }, e3.onerror = function(e4) {
              r3(e4.target.error);
            }, e3.readAsArrayBuffer(n3);
          }) : n3;
        }).then(function(e3) {
          var t2 = a.getTypeOf(e3);
          return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h2.decode(e3) : n2 && true !== i2 && (e3 = function(e4) {
            return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
          }(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
        });
      };
    }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
      var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
      function h2(e2) {
        this.files = [], this.loadOptions = e2;
      }
      h2.prototype = { checkSignature: function(e2) {
        if (!this.reader.readAndCheckSignature(e2)) {
          this.reader.index -= 4;
          var t2 = this.reader.readString(4);
          throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
        }
      }, isSignature: function(e2, t2) {
        var r2 = this.reader.index;
        this.reader.setIndex(e2);
        var n2 = this.reader.readString(4) === t2;
        return this.reader.setIndex(r2), n2;
      }, readBlockEndOfCentral: function() {
        this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
        var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
        this.zipComment = this.loadOptions.decodeFileName(r2);
      }, readBlockZip64EndOfCentral: function() {
        this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
        for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; )
          e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
      }, readBlockZip64EndOfCentralLocator: function() {
        if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount)
          throw new Error("Multi-volumes zip are not supported");
      }, readLocalFiles: function() {
        var e2, t2;
        for (e2 = 0; e2 < this.files.length; e2++)
          t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
      }, readCentralDir: function() {
        var e2;
        for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); )
          (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
        if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length)
          throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
      }, readEndOfCentral: function() {
        var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
        if (e2 < 0)
          throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
        this.reader.setIndex(e2);
        var t2 = e2;
        if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
          if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0)
            throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
          if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0))
            throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
          this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
        }
        var r2 = this.centralDirOffset + this.centralDirSize;
        this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
        var n2 = t2 - r2;
        if (0 < n2)
          this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
        else if (n2 < 0)
          throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
      }, prepareReader: function(e2) {
        this.reader = n(e2);
      }, load: function(e2) {
        this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
      } }, t.exports = h2;
    }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
      var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h2 = e("./compressions"), u = e("./support");
      function l(e2, t2) {
        this.options = e2, this.loadOptions = t2;
      }
      l.prototype = { isEncrypted: function() {
        return 1 == (1 & this.bitFlag);
      }, useUTF8: function() {
        return 2048 == (2048 & this.bitFlag);
      }, readLocalPart: function(e2) {
        var t2, r2;
        if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize)
          throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
        if (null === (t2 = function(e3) {
          for (var t3 in h2)
            if (Object.prototype.hasOwnProperty.call(h2, t3) && h2[t3].magic === e3)
              return h2[t3];
          return null;
        }(this.compressionMethod)))
          throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
        this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
      }, readCentralPart: function(e2) {
        this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
        var t2 = e2.readInt(2);
        if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted())
          throw new Error("Encrypted zip are not supported");
        e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
      }, processAttributes: function() {
        this.unixPermissions = null, this.dosPermissions = null;
        var e2 = this.versionMadeBy >> 8;
        this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
      }, parseZIP64ExtraField: function() {
        if (this.extraFields[1]) {
          var e2 = n(this.extraFields[1].value);
          this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
        }
      }, readExtraFields: function(e2) {
        var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
        for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; )
          t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
        e2.setIndex(i2);
      }, handleUTF8: function() {
        var e2 = u.uint8array ? "uint8array" : "array";
        if (this.useUTF8())
          this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
        else {
          var t2 = this.findExtraFieldUnicodePath();
          if (null !== t2)
            this.fileNameStr = t2;
          else {
            var r2 = s.transformTo(e2, this.fileName);
            this.fileNameStr = this.loadOptions.decodeFileName(r2);
          }
          var n2 = this.findExtraFieldUnicodeComment();
          if (null !== n2)
            this.fileCommentStr = n2;
          else {
            var i2 = s.transformTo(e2, this.fileComment);
            this.fileCommentStr = this.loadOptions.decodeFileName(i2);
          }
        }
      }, findExtraFieldUnicodePath: function() {
        var e2 = this.extraFields[28789];
        if (e2) {
          var t2 = n(e2.value);
          return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
        }
        return null;
      }, findExtraFieldUnicodeComment: function() {
        var e2 = this.extraFields[25461];
        if (e2) {
          var t2 = n(e2.value);
          return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
        }
        return null;
      } }, t.exports = l;
    }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
      function n(e2, t2, r2) {
        this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
      }
      var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h2 = e("./stream/GenericWorker");
      n.prototype = { internalStream: function(e2) {
        var t2 = null, r2 = "string";
        try {
          if (!e2)
            throw new Error("No output type specified.");
          var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
          "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
          var i2 = !this._dataBinary;
          i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
        } catch (e3) {
          (t2 = new h2("error")).error(e3);
        }
        return new s(t2, r2, "");
      }, async: function(e2, t2) {
        return this.internalStream(e2).accumulate(t2);
      }, nodeStream: function(e2, t2) {
        return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
      }, _compressWorker: function(e2, t2) {
        if (this._data instanceof o && this._data.compression.magic === e2.magic)
          return this._data.getCompressedWorker();
        var r2 = this._decompressWorker();
        return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
      }, _decompressWorker: function() {
        return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h2 ? this._data : new i(this._data);
      } };
      for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
        throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
      }, f = 0; f < u.length; f++)
        n.prototype[u[f]] = l;
      t.exports = n;
    }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
      (function(t2) {
        var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
        if (e2) {
          var i = 0, s = new e2(u), a = t2.document.createTextNode("");
          s.observe(a, { characterData: true }), r = function() {
            a.data = i = ++i % 2;
          };
        } else if (t2.setImmediate || void 0 === t2.MessageChannel)
          r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
            var e3 = t2.document.createElement("script");
            e3.onreadystatechange = function() {
              u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
            }, t2.document.documentElement.appendChild(e3);
          } : function() {
            setTimeout(u, 0);
          };
        else {
          var o = new t2.MessageChannel();
          o.port1.onmessage = u, r = function() {
            o.port2.postMessage(0);
          };
        }
        var h2 = [];
        function u() {
          var e3, t3;
          n = true;
          for (var r2 = h2.length; r2; ) {
            for (t3 = h2, h2 = [], e3 = -1; ++e3 < r2; )
              t3[e3]();
            r2 = h2.length;
          }
          n = false;
        }
        l.exports = function(e3) {
          1 !== h2.push(e3) || n || r();
        };
      }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
    }, {}], 37: [function(e, t, r) {
      var i = e("immediate");
      function u() {
      }
      var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
      function o(e2) {
        if ("function" != typeof e2)
          throw new TypeError("resolver must be a function");
        this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
      }
      function h2(e2, t2, r2) {
        this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
      }
      function f(t2, r2, n2) {
        i(function() {
          var e2;
          try {
            e2 = r2(n2);
          } catch (e3) {
            return l.reject(t2, e3);
          }
          e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
        });
      }
      function c(e2) {
        var t2 = e2 && e2.then;
        if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2)
          return function() {
            t2.apply(e2, arguments);
          };
      }
      function d(t2, e2) {
        var r2 = false;
        function n2(e3) {
          r2 || (r2 = true, l.reject(t2, e3));
        }
        function i2(e3) {
          r2 || (r2 = true, l.resolve(t2, e3));
        }
        var s2 = p2(function() {
          e2(i2, n2);
        });
        "error" === s2.status && n2(s2.value);
      }
      function p2(e2, t2) {
        var r2 = {};
        try {
          r2.value = e2(t2), r2.status = "success";
        } catch (e3) {
          r2.status = "error", r2.value = e3;
        }
        return r2;
      }
      (t.exports = o).prototype.finally = function(t2) {
        if ("function" != typeof t2)
          return this;
        var r2 = this.constructor;
        return this.then(function(e2) {
          return r2.resolve(t2()).then(function() {
            return e2;
          });
        }, function(e2) {
          return r2.resolve(t2()).then(function() {
            throw e2;
          });
        });
      }, o.prototype.catch = function(e2) {
        return this.then(null, e2);
      }, o.prototype.then = function(e2, t2) {
        if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s)
          return this;
        var r2 = new this.constructor(u);
        this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h2(r2, e2, t2));
        return r2;
      }, h2.prototype.callFulfilled = function(e2) {
        l.resolve(this.promise, e2);
      }, h2.prototype.otherCallFulfilled = function(e2) {
        f(this.promise, this.onFulfilled, e2);
      }, h2.prototype.callRejected = function(e2) {
        l.reject(this.promise, e2);
      }, h2.prototype.otherCallRejected = function(e2) {
        f(this.promise, this.onRejected, e2);
      }, l.resolve = function(e2, t2) {
        var r2 = p2(c, t2);
        if ("error" === r2.status)
          return l.reject(e2, r2.value);
        var n2 = r2.value;
        if (n2)
          d(e2, n2);
        else {
          e2.state = a, e2.outcome = t2;
          for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; )
            e2.queue[i2].callFulfilled(t2);
        }
        return e2;
      }, l.reject = function(e2, t2) {
        e2.state = s, e2.outcome = t2;
        for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; )
          e2.queue[r2].callRejected(t2);
        return e2;
      }, o.resolve = function(e2) {
        if (e2 instanceof this)
          return e2;
        return l.resolve(new this(u), e2);
      }, o.reject = function(e2) {
        var t2 = new this(u);
        return l.reject(t2, e2);
      }, o.all = function(e2) {
        var r2 = this;
        if ("[object Array]" !== Object.prototype.toString.call(e2))
          return this.reject(new TypeError("must be an array"));
        var n2 = e2.length, i2 = false;
        if (!n2)
          return this.resolve([]);
        var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
        for (; ++t2 < n2; )
          h3(e2[t2], t2);
        return o2;
        function h3(e3, t3) {
          r2.resolve(e3).then(function(e4) {
            s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
          }, function(e4) {
            i2 || (i2 = true, l.reject(o2, e4));
          });
        }
      }, o.race = function(e2) {
        var t2 = this;
        if ("[object Array]" !== Object.prototype.toString.call(e2))
          return this.reject(new TypeError("must be an array"));
        var r2 = e2.length, n2 = false;
        if (!r2)
          return this.resolve([]);
        var i2 = -1, s2 = new this(u);
        for (; ++i2 < r2; )
          a2 = e2[i2], t2.resolve(a2).then(function(e3) {
            n2 || (n2 = true, l.resolve(s2, e3));
          }, function(e3) {
            n2 || (n2 = true, l.reject(s2, e3));
          });
        var a2;
        return s2;
      };
    }, { immediate: 36 }], 38: [function(e, t, r) {
      var n = {};
      (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
    }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
      var a = e("./zlib/deflate"), o = e("./utils/common"), h2 = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
      function p2(e2) {
        if (!(this instanceof p2))
          return new p2(e2);
        this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
        var t2 = this.options;
        t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
        var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
        if (r2 !== l)
          throw new Error(i[r2]);
        if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
          var n2;
          if (n2 = "string" == typeof t2.dictionary ? h2.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l)
            throw new Error(i[r2]);
          this._dict_set = true;
        }
      }
      function n(e2, t2) {
        var r2 = new p2(t2);
        if (r2.push(e2, true), r2.err)
          throw r2.msg || i[r2.err];
        return r2.result;
      }
      p2.prototype.push = function(e2, t2) {
        var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
        if (this.ended)
          return false;
        n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h2.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
        do {
          if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l)
            return this.onEnd(r2), !(this.ended = true);
          0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h2.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
        } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
        return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
      }, p2.prototype.onData = function(e2) {
        this.chunks.push(e2);
      }, p2.prototype.onEnd = function(e2) {
        e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
      }, r.Deflate = p2, r.deflate = n, r.deflateRaw = function(e2, t2) {
        return (t2 = t2 || {}).raw = true, n(e2, t2);
      }, r.gzip = function(e2, t2) {
        return (t2 = t2 || {}).gzip = true, n(e2, t2);
      };
    }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
      var c = e("./zlib/inflate"), d = e("./utils/common"), p2 = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
      function a(e2) {
        if (!(this instanceof a))
          return new a(e2);
        this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
        var t2 = this.options;
        t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
        var r2 = c.inflateInit2(this.strm, t2.windowBits);
        if (r2 !== m.Z_OK)
          throw new Error(n[r2]);
        this.header = new s(), c.inflateGetHeader(this.strm, this.header);
      }
      function o(e2, t2) {
        var r2 = new a(t2);
        if (r2.push(e2, true), r2.err)
          throw r2.msg || n[r2.err];
        return r2.result;
      }
      a.prototype.push = function(e2, t2) {
        var r2, n2, i2, s2, a2, o2, h2 = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
        if (this.ended)
          return false;
        n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h2.input = p2.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h2.input = new Uint8Array(e2) : h2.input = e2, h2.next_in = 0, h2.avail_in = h2.input.length;
        do {
          if (0 === h2.avail_out && (h2.output = new d.Buf8(u), h2.next_out = 0, h2.avail_out = u), (r2 = c.inflate(h2, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p2.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK)
            return this.onEnd(r2), !(this.ended = true);
          h2.next_out && (0 !== h2.avail_out && r2 !== m.Z_STREAM_END && (0 !== h2.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p2.utf8border(h2.output, h2.next_out), s2 = h2.next_out - i2, a2 = p2.buf2string(h2.output, i2), h2.next_out = s2, h2.avail_out = u - s2, s2 && d.arraySet(h2.output, h2.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h2.output, h2.next_out)))), 0 === h2.avail_in && 0 === h2.avail_out && (f = true);
        } while ((0 < h2.avail_in || 0 === h2.avail_out) && r2 !== m.Z_STREAM_END);
        return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h2.avail_out = 0));
      }, a.prototype.onData = function(e2) {
        this.chunks.push(e2);
      }, a.prototype.onEnd = function(e2) {
        e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
      }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
        return (t2 = t2 || {}).raw = true, o(e2, t2);
      }, r.ungzip = o;
    }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
      var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
      r.assign = function(e2) {
        for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
          var r2 = t2.shift();
          if (r2) {
            if ("object" != typeof r2)
              throw new TypeError(r2 + "must be non-object");
            for (var n2 in r2)
              r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
          }
        }
        return e2;
      }, r.shrinkBuf = function(e2, t2) {
        return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
      };
      var i = { arraySet: function(e2, t2, r2, n2, i2) {
        if (t2.subarray && e2.subarray)
          e2.set(t2.subarray(r2, r2 + n2), i2);
        else
          for (var s2 = 0; s2 < n2; s2++)
            e2[i2 + s2] = t2[r2 + s2];
      }, flattenChunks: function(e2) {
        var t2, r2, n2, i2, s2, a;
        for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++)
          n2 += e2[t2].length;
        for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++)
          s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
        return a;
      } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
        for (var s2 = 0; s2 < n2; s2++)
          e2[i2 + s2] = t2[r2 + s2];
      }, flattenChunks: function(e2) {
        return [].concat.apply([], e2);
      } };
      r.setTyped = function(e2) {
        e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
      }, r.setTyped(n);
    }, {}], 42: [function(e, t, r) {
      var h2 = e("./common"), i = true, s = true;
      try {
        String.fromCharCode.apply(null, [0]);
      } catch (e2) {
        i = false;
      }
      try {
        String.fromCharCode.apply(null, new Uint8Array(1));
      } catch (e2) {
        s = false;
      }
      for (var u = new h2.Buf8(256), n = 0; n < 256; n++)
        u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
      function l(e2, t2) {
        if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i))
          return String.fromCharCode.apply(null, h2.shrinkBuf(e2, t2));
        for (var r2 = "", n2 = 0; n2 < t2; n2++)
          r2 += String.fromCharCode(e2[n2]);
        return r2;
      }
      u[254] = u[254] = 1, r.string2buf = function(e2) {
        var t2, r2, n2, i2, s2, a = e2.length, o = 0;
        for (i2 = 0; i2 < a; i2++)
          55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
        for (t2 = new h2.Buf8(o), i2 = s2 = 0; s2 < o; i2++)
          55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
        return t2;
      }, r.buf2binstring = function(e2) {
        return l(e2, e2.length);
      }, r.binstring2buf = function(e2) {
        for (var t2 = new h2.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++)
          t2[r2] = e2.charCodeAt(r2);
        return t2;
      }, r.buf2string = function(e2, t2) {
        var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
        for (r2 = n2 = 0; r2 < a; )
          if ((i2 = e2[r2++]) < 128)
            o[n2++] = i2;
          else if (4 < (s2 = u[i2]))
            o[n2++] = 65533, r2 += s2 - 1;
          else {
            for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; )
              i2 = i2 << 6 | 63 & e2[r2++], s2--;
            1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
          }
        return l(o, n2);
      }, r.utf8border = function(e2, t2) {
        var r2;
        for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); )
          r2--;
        return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
      };
    }, { "./common": 41 }], 43: [function(e, t, r) {
      t.exports = function(e2, t2, r2, n) {
        for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
          for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; )
            ;
          i %= 65521, s %= 65521;
        }
        return i | s << 16 | 0;
      };
    }, {}], 44: [function(e, t, r) {
      t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
    }, {}], 45: [function(e, t, r) {
      var o = function() {
        for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
          e2 = r2;
          for (var n = 0; n < 8; n++)
            e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
          t2[r2] = e2;
        }
        return t2;
      }();
      t.exports = function(e2, t2, r2, n) {
        var i = o, s = n + r2;
        e2 ^= -1;
        for (var a = n; a < s; a++)
          e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
        return -1 ^ e2;
      };
    }, {}], 46: [function(e, t, r) {
      var h2, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p2 = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
      function R(e2, t2) {
        return e2.msg = n[t2], t2;
      }
      function T(e2) {
        return (e2 << 1) - (4 < e2 ? 9 : 0);
      }
      function D(e2) {
        for (var t2 = e2.length; 0 <= --t2; )
          e2[t2] = 0;
      }
      function F(e2) {
        var t2 = e2.state, r2 = t2.pending;
        r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
      }
      function N(e2, t2) {
        u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
      }
      function U(e2, t2) {
        e2.pending_buf[e2.pending++] = t2;
      }
      function P(e2, t2) {
        e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
      }
      function L(e2, t2) {
        var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h3 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p3 = u2[s2 + a2];
        e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
        do {
          if (u2[(r2 = t2) + a2] === p3 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
            s2 += 2, r2++;
            do {
            } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
            if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
              if (e2.match_start = t2, o2 <= (a2 = n2))
                break;
              d2 = u2[s2 + a2 - 1], p3 = u2[s2 + a2];
            }
          }
        } while ((t2 = f2[t2 & l2]) > h3 && 0 != --i2);
        return a2 <= e2.lookahead ? a2 : e2.lookahead;
      }
      function j(e2) {
        var t2, r2, n2, i2, s2, a2, o2, h3, u2, l2, f2 = e2.w_size;
        do {
          if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
            for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; )
              ;
            for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; )
              ;
            i2 += f2;
          }
          if (0 === e2.strm.avail_in)
            break;
          if (a2 = e2.strm, o2 = e2.window, h3 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h3), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h3) : 2 === a2.state.wrap && (a2.adler = p2(a2.adler, o2, l2, h3)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x)
            for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); )
              ;
        } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
      }
      function Z(e2, t2) {
        for (var r2, n2; ; ) {
          if (e2.lookahead < z) {
            if (j(e2), e2.lookahead < z && t2 === l)
              return A;
            if (0 === e2.lookahead)
              break;
          }
          if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x)
            if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
              for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; )
                ;
              e2.strstart++;
            } else
              e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
          else
            n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
          if (n2 && (N(e2, false), 0 === e2.strm.avail_out))
            return A;
        }
        return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
      }
      function W(e2, t2) {
        for (var r2, n2, i2; ; ) {
          if (e2.lookahead < z) {
            if (j(e2), e2.lookahead < z && t2 === l)
              return A;
            if (0 === e2.lookahead)
              break;
          }
          if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
            for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; )
              ;
            if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out))
              return A;
          } else if (e2.match_available) {
            if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out)
              return A;
          } else
            e2.match_available = 1, e2.strstart++, e2.lookahead--;
        }
        return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
      }
      function M(e2, t2, r2, n2, i2) {
        this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
      }
      function H() {
        this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
      }
      function G(e2) {
        var t2;
        return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
      }
      function K(e2) {
        var t2 = G(e2);
        return t2 === m && function(e3) {
          e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h2[e3.level].max_lazy, e3.good_match = h2[e3.level].good_length, e3.nice_match = h2[e3.level].nice_length, e3.max_chain_length = h2[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
        }(e2.state), t2;
      }
      function Y(e2, t2, r2, n2, i2, s2) {
        if (!e2)
          return _;
        var a2 = 1;
        if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2)
          return R(e2, _);
        8 === n2 && (n2 = 9);
        var o2 = new H();
        return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
      }
      h2 = [new M(0, 0, 0, 0, function(e2, t2) {
        var r2 = 65535;
        for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
          if (e2.lookahead <= 1) {
            if (j(e2), 0 === e2.lookahead && t2 === l)
              return A;
            if (0 === e2.lookahead)
              break;
          }
          e2.strstart += e2.lookahead, e2.lookahead = 0;
          var n2 = e2.block_start + r2;
          if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out))
            return A;
          if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out))
            return A;
        }
        return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
      }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
        return Y(e2, t2, v, 15, 8, 0);
      }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
        return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
      }, r.deflate = function(e2, t2) {
        var r2, n2, i2, s2;
        if (!e2 || !e2.state || 5 < t2 || t2 < 0)
          return e2 ? R(e2, _) : _;
        if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f)
          return R(e2, 0 === e2.avail_out ? -5 : _);
        if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C)
          if (2 === n2.wrap)
            e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p2(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
          else {
            var a2 = v + (n2.w_bits - 8 << 4) << 8;
            a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
          }
        if (69 === n2.status)
          if (n2.gzhead.extra) {
            for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p2(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); )
              U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p2(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
          } else
            n2.status = 73;
        if (73 === n2.status)
          if (n2.gzhead.name) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p2(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p2(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
          } else
            n2.status = 91;
        if (91 === n2.status)
          if (n2.gzhead.comment) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p2(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p2(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
          } else
            n2.status = 103;
        if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
          if (F(e2), 0 === e2.avail_out)
            return n2.last_flush = -1, m;
        } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f)
          return R(e2, -5);
        if (666 === n2.status && 0 !== e2.avail_in)
          return R(e2, -5);
        if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
          var o2 = 2 === n2.strategy ? function(e3, t3) {
            for (var r3; ; ) {
              if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                if (t3 === l)
                  return A;
                break;
              }
              if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out))
                return A;
            }
            return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
          }(n2, t2) : 3 === n2.strategy ? function(e3, t3) {
            for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
              if (e3.lookahead <= S) {
                if (j(e3), e3.lookahead <= S && t3 === l)
                  return A;
                if (0 === e3.lookahead)
                  break;
              }
              if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                s3 = e3.strstart + S;
                do {
                } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
              }
              if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out))
                return A;
            }
            return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
          }(n2, t2) : h2[n2.level].func(n2, t2);
          if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O)
            return 0 === e2.avail_out && (n2.last_flush = -1), m;
          if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out))
            return n2.last_flush = -1, m;
        }
        return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
      }, r.deflateEnd = function(e2) {
        var t2;
        return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
      }, r.deflateSetDictionary = function(e2, t2) {
        var r2, n2, i2, s2, a2, o2, h3, u2, l2 = t2.length;
        if (!e2 || !e2.state)
          return _;
        if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead)
          return _;
        for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h3 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
          for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; )
            ;
          r2.strstart = n2, r2.lookahead = x - 1, j(r2);
        }
        return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h3, e2.avail_in = a2, r2.wrap = s2, m;
      }, r.deflateInfo = "pako deflate (from Nodeca project)";
    }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
      t.exports = function() {
        this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
      };
    }, {}], 48: [function(e, t, r) {
      t.exports = function(e2, t2) {
        var r2, n, i, s, a, o, h2, u, l, f, c, d, p2, m, _, g, b, v, y, w, k, x, S, z, C;
        r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h2 = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p2 = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
        e:
          do {
            p2 < 15 && (d += z[n++] << p2, p2 += 8, d += z[n++] << p2, p2 += 8), v = m[d & g];
            t:
              for (; ; ) {
                if (d >>>= y = v >>> 24, p2 -= y, 0 === (y = v >>> 16 & 255))
                  C[s++] = 65535 & v;
                else {
                  if (!(16 & y)) {
                    if (0 == (64 & y)) {
                      v = m[(65535 & v) + (d & (1 << y) - 1)];
                      continue t;
                    }
                    if (32 & y) {
                      r2.mode = 12;
                      break e;
                    }
                    e2.msg = "invalid literal/length code", r2.mode = 30;
                    break e;
                  }
                  w = 65535 & v, (y &= 15) && (p2 < y && (d += z[n++] << p2, p2 += 8), w += d & (1 << y) - 1, d >>>= y, p2 -= y), p2 < 15 && (d += z[n++] << p2, p2 += 8, d += z[n++] << p2, p2 += 8), v = _[d & b];
                  r:
                    for (; ; ) {
                      if (d >>>= y = v >>> 24, p2 -= y, !(16 & (y = v >>> 16 & 255))) {
                        if (0 == (64 & y)) {
                          v = _[(65535 & v) + (d & (1 << y) - 1)];
                          continue r;
                        }
                        e2.msg = "invalid distance code", r2.mode = 30;
                        break e;
                      }
                      if (k = 65535 & v, p2 < (y &= 15) && (d += z[n++] << p2, (p2 += 8) < y && (d += z[n++] << p2, p2 += 8)), h2 < (k += d & (1 << y) - 1)) {
                        e2.msg = "invalid distance too far back", r2.mode = 30;
                        break e;
                      }
                      if (d >>>= y, p2 -= y, (y = s - a) < k) {
                        if (l < (y = k - y) && r2.sane) {
                          e2.msg = "invalid distance too far back", r2.mode = 30;
                          break e;
                        }
                        if (S = c, (x = 0) === f) {
                          if (x += u - y, y < w) {
                            for (w -= y; C[s++] = c[x++], --y; )
                              ;
                            x = s - k, S = C;
                          }
                        } else if (f < y) {
                          if (x += u + f - y, (y -= f) < w) {
                            for (w -= y; C[s++] = c[x++], --y; )
                              ;
                            if (x = 0, f < w) {
                              for (w -= y = f; C[s++] = c[x++], --y; )
                                ;
                              x = s - k, S = C;
                            }
                          }
                        } else if (x += f - y, y < w) {
                          for (w -= y; C[s++] = c[x++], --y; )
                            ;
                          x = s - k, S = C;
                        }
                        for (; 2 < w; )
                          C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                        w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                      } else {
                        for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); )
                          ;
                        w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                      }
                      break;
                    }
                }
                break;
              }
          } while (n < i && s < o);
        n -= w = p2 >> 3, d &= (1 << (p2 -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p2;
      };
    }, {}], 49: [function(e, t, r) {
      var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
      function L(e2) {
        return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
      }
      function s() {
        this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
      }
      function a(e2) {
        var t2;
        return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
      }
      function o(e2) {
        var t2;
        return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
      }
      function h2(e2, t2) {
        var r2, n2;
        return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
      }
      function u(e2, t2) {
        var r2, n2;
        return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h2(e2, t2)) !== N && (e2.state = null), r2) : U;
      }
      var l, f, c = true;
      function j(e2) {
        if (c) {
          var t2;
          for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; )
            e2.lens[t2++] = 8;
          for (; t2 < 256; )
            e2.lens[t2++] = 9;
          for (; t2 < 280; )
            e2.lens[t2++] = 7;
          for (; t2 < 288; )
            e2.lens[t2++] = 8;
          for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; )
            e2.lens[t2++] = 5;
          T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
        }
        e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
      }
      function Z(e2, t2, r2, n2) {
        var i2, s2 = e2.state;
        return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
      }
      r.inflateReset = o, r.inflateReset2 = h2, r.inflateResetKeep = a, r.inflateInit = function(e2) {
        return u(e2, 15);
      }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
        var r2, n2, i2, s2, a2, o2, h3, u2, l2, f2, c2, d, p2, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in)
          return U;
        12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h3 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h3, x = N;
        e:
          for (; ; )
            switch (r2.mode) {
              case P:
                if (0 === r2.wrap) {
                  r2.mode = 13;
                  break;
                }
                for (; l2 < 16; ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (2 & r2.wrap && 35615 === u2) {
                  E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                  break;
                }
                if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                  e2.msg = "incorrect header check", r2.mode = 30;
                  break;
                }
                if (8 != (15 & u2)) {
                  e2.msg = "unknown compression method", r2.mode = 30;
                  break;
                }
                if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits)
                  r2.wbits = k;
                else if (k > r2.wbits) {
                  e2.msg = "invalid window size", r2.mode = 30;
                  break;
                }
                r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
                break;
              case 2:
                for (; l2 < 16; ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (r2.flags = u2, 8 != (255 & r2.flags)) {
                  e2.msg = "unknown compression method", r2.mode = 30;
                  break;
                }
                if (57344 & r2.flags) {
                  e2.msg = "unknown header flags set", r2.mode = 30;
                  break;
                }
                r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
              case 3:
                for (; l2 < 32; ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
              case 4:
                for (; l2 < 16; ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
              case 5:
                if (1024 & r2.flags) {
                  for (; l2 < 16; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
                } else
                  r2.head && (r2.head.extra = null);
                r2.mode = 6;
              case 6:
                if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length))
                  break e;
                r2.length = 0, r2.mode = 7;
              case 7:
                if (2048 & r2.flags) {
                  if (0 === o2)
                    break e;
                  for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; )
                    ;
                  if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k)
                    break e;
                } else
                  r2.head && (r2.head.name = null);
                r2.length = 0, r2.mode = 8;
              case 8:
                if (4096 & r2.flags) {
                  if (0 === o2)
                    break e;
                  for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; )
                    ;
                  if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k)
                    break e;
                } else
                  r2.head && (r2.head.comment = null);
                r2.mode = 9;
              case 9:
                if (512 & r2.flags) {
                  for (; l2 < 16; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (u2 !== (65535 & r2.check)) {
                    e2.msg = "header crc mismatch", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
                break;
              case 10:
                for (; l2 < 32; ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
              case 11:
                if (0 === r2.havedict)
                  return e2.next_out = a2, e2.avail_out = h3, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
                e2.adler = r2.check = 1, r2.mode = 12;
              case 12:
                if (5 === t2 || 6 === t2)
                  break e;
              case 13:
                if (r2.last) {
                  u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                  break;
                }
                for (; l2 < 3; ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                  case 0:
                    r2.mode = 14;
                    break;
                  case 1:
                    if (j(r2), r2.mode = 20, 6 !== t2)
                      break;
                    u2 >>>= 2, l2 -= 2;
                    break e;
                  case 2:
                    r2.mode = 17;
                    break;
                  case 3:
                    e2.msg = "invalid block type", r2.mode = 30;
                }
                u2 >>>= 2, l2 -= 2;
                break;
              case 14:
                for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                  e2.msg = "invalid stored block lengths", r2.mode = 30;
                  break;
                }
                if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2)
                  break e;
              case 15:
                r2.mode = 16;
              case 16:
                if (d = r2.length) {
                  if (o2 < d && (d = o2), h3 < d && (d = h3), 0 === d)
                    break e;
                  I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h3 -= d, a2 += d, r2.length -= d;
                  break;
                }
                r2.mode = 12;
                break;
              case 17:
                for (; l2 < 14; ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                  e2.msg = "too many length or distance symbols", r2.mode = 30;
                  break;
                }
                r2.have = 0, r2.mode = 18;
              case 18:
                for (; r2.have < r2.ncode; ) {
                  for (; l2 < 3; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
                }
                for (; r2.have < 19; )
                  r2.lens[A[r2.have++]] = 0;
                if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                  e2.msg = "invalid code lengths set", r2.mode = 30;
                  break;
                }
                r2.have = 0, r2.mode = 19;
              case 19:
                for (; r2.have < r2.nlen + r2.ndist; ) {
                  for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (b < 16)
                    u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                  else {
                    if (16 === b) {
                      for (z = _ + 2; l2 < z; ) {
                        if (0 === o2)
                          break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                        e2.msg = "invalid bit length repeat", r2.mode = 30;
                        break;
                      }
                      k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                    } else if (17 === b) {
                      for (z = _ + 3; l2 < z; ) {
                        if (0 === o2)
                          break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                    } else {
                      for (z = _ + 7; l2 < z; ) {
                        if (0 === o2)
                          break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                    }
                    if (r2.have + d > r2.nlen + r2.ndist) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    for (; d--; )
                      r2.lens[r2.have++] = k;
                  }
                }
                if (30 === r2.mode)
                  break;
                if (0 === r2.lens[256]) {
                  e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                  break;
                }
                if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                  e2.msg = "invalid literal/lengths set", r2.mode = 30;
                  break;
                }
                if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                  e2.msg = "invalid distances set", r2.mode = 30;
                  break;
                }
                if (r2.mode = 20, 6 === t2)
                  break e;
              case 20:
                r2.mode = 21;
              case 21:
                if (6 <= o2 && 258 <= h3) {
                  e2.next_out = a2, e2.avail_out = h3, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h3 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                  break;
                }
                for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (g && 0 == (240 & g)) {
                  for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  u2 >>>= v, l2 -= v, r2.back += v;
                }
                if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                  r2.mode = 26;
                  break;
                }
                if (32 & g) {
                  r2.back = -1, r2.mode = 12;
                  break;
                }
                if (64 & g) {
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break;
                }
                r2.extra = 15 & g, r2.mode = 22;
              case 22:
                if (r2.extra) {
                  for (z = r2.extra; l2 < z; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                }
                r2.was = r2.length, r2.mode = 23;
              case 23:
                for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2)
                    break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (0 == (240 & g)) {
                  for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  u2 >>>= v, l2 -= v, r2.back += v;
                }
                if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                  e2.msg = "invalid distance code", r2.mode = 30;
                  break;
                }
                r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
              case 24:
                if (r2.extra) {
                  for (z = r2.extra; l2 < z; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                }
                if (r2.offset > r2.dmax) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                r2.mode = 25;
              case 25:
                if (0 === h3)
                  break e;
                if (d = c2 - h3, r2.offset > d) {
                  if ((d = r2.offset - d) > r2.whave && r2.sane) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break;
                  }
                  p2 = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
                } else
                  m = i2, p2 = a2 - r2.offset, d = r2.length;
                for (h3 < d && (d = h3), h3 -= d, r2.length -= d; i2[a2++] = m[p2++], --d; )
                  ;
                0 === r2.length && (r2.mode = 21);
                break;
              case 26:
                if (0 === h3)
                  break e;
                i2[a2++] = r2.length, h3--, r2.mode = 21;
                break;
              case 27:
                if (r2.wrap) {
                  for (; l2 < 32; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 |= n2[s2++] << l2, l2 += 8;
                  }
                  if (c2 -= h3, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h3, (r2.flags ? u2 : L(u2)) !== r2.check) {
                    e2.msg = "incorrect data check", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.mode = 28;
              case 28:
                if (r2.wrap && r2.flags) {
                  for (; l2 < 32; ) {
                    if (0 === o2)
                      break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (u2 !== (4294967295 & r2.total)) {
                    e2.msg = "incorrect length check", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.mode = 29;
              case 29:
                x = 1;
                break e;
              case 30:
                x = -3;
                break e;
              case 31:
                return -4;
              case 32:
              default:
                return U;
            }
        return e2.next_out = a2, e2.avail_out = h3, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
      }, r.inflateEnd = function(e2) {
        if (!e2 || !e2.state)
          return U;
        var t2 = e2.state;
        return t2.window && (t2.window = null), e2.state = null, N;
      }, r.inflateGetHeader = function(e2, t2) {
        var r2;
        return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
      }, r.inflateSetDictionary = function(e2, t2) {
        var r2, n2 = t2.length;
        return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
      }, r.inflateInfo = "pako inflate (from Nodeca project)";
    }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
      var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
      t.exports = function(e2, t2, r2, n, i, s, a, o) {
        var h2, u, l, f, c, d, p2, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
        for (b = 0; b <= 15; b++)
          O[b] = 0;
        for (v = 0; v < n; v++)
          O[t2[r2 + v]]++;
        for (k = g, w = 15; 1 <= w && 0 === O[w]; w--)
          ;
        if (w < k && (k = w), 0 === w)
          return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
        for (y = 1; y < w && 0 === O[y]; y++)
          ;
        for (k < y && (k = y), b = z = 1; b <= 15; b++)
          if (z <<= 1, (z -= O[b]) < 0)
            return -1;
        if (0 < z && (0 === e2 || 1 !== w))
          return -1;
        for (B[1] = 0, b = 1; b < 15; b++)
          B[b + 1] = B[b] + O[b];
        for (v = 0; v < n; v++)
          0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
        if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C)
          return 1;
        for (; ; ) {
          for (p2 = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h2 = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h2)] = p2 << 24 | m << 16 | _ | 0, 0 !== u; )
            ;
          for (h2 = 1 << b - 1; E & h2; )
            h2 >>= 1;
          if (0 !== h2 ? (E &= h2 - 1, E += h2) : E = 0, v++, 0 == --O[b]) {
            if (b === w)
              break;
            b = t2[r2 + a[v]];
          }
          if (k < b && (E & f) !== l) {
            for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); )
              x++, z <<= 1;
            if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C)
              return 1;
            i[l = E & f] = k << 24 | x << 16 | c - s | 0;
          }
        }
        return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
      };
    }, { "../utils/common": 41 }], 51: [function(e, t, r) {
      t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
    }, {}], 52: [function(e, t, r) {
      var i = e("../utils/common"), o = 0, h2 = 1;
      function n(e2) {
        for (var t2 = e2.length; 0 <= --t2; )
          e2[t2] = 0;
      }
      var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p2 = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
      n(z);
      var C = new Array(2 * f);
      n(C);
      var E = new Array(512);
      n(E);
      var A = new Array(256);
      n(A);
      var I = new Array(a);
      n(I);
      var O, B, R, T = new Array(f);
      function D(e2, t2, r2, n2, i2) {
        this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
      }
      function F(e2, t2) {
        this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
      }
      function N(e2) {
        return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
      }
      function U(e2, t2) {
        e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
      }
      function P(e2, t2, r2) {
        e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
      }
      function L(e2, t2, r2) {
        P(e2, r2[2 * t2], r2[2 * t2 + 1]);
      }
      function j(e2, t2) {
        for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; )
          ;
        return r2 >>> 1;
      }
      function Z(e2, t2, r2) {
        var n2, i2, s2 = new Array(g + 1), a2 = 0;
        for (n2 = 1; n2 <= g; n2++)
          s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
        for (i2 = 0; i2 <= t2; i2++) {
          var o2 = e2[2 * i2 + 1];
          0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
        }
      }
      function W(e2) {
        var t2;
        for (t2 = 0; t2 < l; t2++)
          e2.dyn_ltree[2 * t2] = 0;
        for (t2 = 0; t2 < f; t2++)
          e2.dyn_dtree[2 * t2] = 0;
        for (t2 = 0; t2 < c; t2++)
          e2.bl_tree[2 * t2] = 0;
        e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
      }
      function M(e2) {
        8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
      }
      function H(e2, t2, r2, n2) {
        var i2 = 2 * t2, s2 = 2 * r2;
        return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
      }
      function G(e2, t2, r2) {
        for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); )
          e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
        e2.heap[r2] = n2;
      }
      function K(e2, t2, r2) {
        var n2, i2, s2, a2, o2 = 0;
        if (0 !== e2.last_lit)
          for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; )
            ;
        L(e2, m, t2);
      }
      function Y(e2, t2) {
        var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h3 = t2.stat_desc.elems, u2 = -1;
        for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h3; r2++)
          0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
        for (; e2.heap_len < 2; )
          s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
        for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--)
          G(e2, s2, r2);
        for (i2 = h3; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; )
          ;
        e2.heap[--e2.heap_max] = e2.heap[1], function(e3, t3) {
          var r3, n3, i3, s3, a3, o3, h4 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p3 = t3.stat_desc.max_length, m2 = 0;
          for (s3 = 0; s3 <= g; s3++)
            e3.bl_count[s3] = 0;
          for (h4[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++)
            p3 < (s3 = h4[2 * h4[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p3, m2++), h4[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h4[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
          if (0 !== m2) {
            do {
              for (s3 = p3 - 1; 0 === e3.bl_count[s3]; )
                s3--;
              e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p3]--, m2 -= 2;
            } while (0 < m2);
            for (s3 = p3; 0 !== s3; s3--)
              for (n3 = e3.bl_count[s3]; 0 !== n3; )
                u3 < (i3 = e3.heap[--r3]) || (h4[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h4[2 * i3 + 1]) * h4[2 * i3], h4[2 * i3 + 1] = s3), n3--);
          }
        }(e2, t2), Z(s2, u2, e2.bl_count);
      }
      function X(e2, t2, r2) {
        var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h3 = 7, u2 = 4;
        for (0 === a2 && (h3 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++)
          i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h3 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h3 = 138, 3) : i2 === a2 ? (h3 = 6, 3) : (h3 = 7, 4));
      }
      function V(e2, t2, r2) {
        var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h3 = 7, u2 = 4;
        for (0 === a2 && (h3 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++)
          if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h3 && i2 === a2)) {
            if (o2 < u2)
              for (; L(e2, i2, e2.bl_tree), 0 != --o2; )
                ;
            else
              0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
            s2 = i2, u2 = (o2 = 0) === a2 ? (h3 = 138, 3) : i2 === a2 ? (h3 = 6, 3) : (h3 = 7, 4);
          }
      }
      n(T);
      var q = false;
      function J(e2, t2, r2, n2) {
        P(e2, (s << 1) + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
          M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
        }(e2, t2, r2, true);
      }
      r._tr_init = function(e2) {
        q || (function() {
          var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
          for (n2 = r2 = 0; n2 < a - 1; n2++)
            for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++)
              A[r2++] = n2;
          for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++)
            for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++)
              E[i2++] = n2;
          for (i2 >>= 7; n2 < f; n2++)
            for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++)
              E[256 + i2++] = n2;
          for (t2 = 0; t2 <= g; t2++)
            s2[t2] = 0;
          for (e3 = 0; e3 <= 143; )
            z[2 * e3 + 1] = 8, e3++, s2[8]++;
          for (; e3 <= 255; )
            z[2 * e3 + 1] = 9, e3++, s2[9]++;
          for (; e3 <= 279; )
            z[2 * e3 + 1] = 7, e3++, s2[7]++;
          for (; e3 <= 287; )
            z[2 * e3 + 1] = 8, e3++, s2[8]++;
          for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++)
            C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
          O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p2);
        }(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
      }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
        var i2, s2, a2 = 0;
        0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = function(e3) {
          var t3, r3 = 4093624447;
          for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1)
            if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3])
              return o;
          if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26])
            return h2;
          for (t3 = 32; t3 < u; t3++)
            if (0 !== e3.dyn_ltree[2 * t3])
              return h2;
          return o;
        }(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = function(e3) {
          var t3;
          for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--)
            ;
          return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
        }(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
          var i3;
          for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++)
            P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
          V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
        }(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
      }, r._tr_tally = function(e2, t2, r2) {
        return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
      }, r._tr_align = function(e2) {
        P(e2, 2, 3), L(e2, m, z), function(e3) {
          16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
        }(e2);
      };
    }, { "../utils/common": 41 }], 53: [function(e, t, r) {
      t.exports = function() {
        this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
      };
    }, {}], 54: [function(e, t, r) {
      (function(e2) {
        !function(r2, n) {
          if (!r2.setImmediate) {
            var i, s, t2, a, o = 1, h2 = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
            e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
              process.nextTick(function() {
                c(e4);
              });
            } : function() {
              if (r2.postMessage && !r2.importScripts) {
                var e4 = true, t3 = r2.onmessage;
                return r2.onmessage = function() {
                  e4 = false;
                }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
              }
            }() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
              r2.postMessage(a + e4, "*");
            }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
              c(e4.data);
            }, function(e4) {
              t2.port2.postMessage(e4);
            }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
              var t3 = l.createElement("script");
              t3.onreadystatechange = function() {
                c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
              }, s.appendChild(t3);
            }) : function(e4) {
              setTimeout(c, 0, e4);
            }, e3.setImmediate = function(e4) {
              "function" != typeof e4 && (e4 = new Function("" + e4));
              for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++)
                t3[r3] = arguments[r3 + 1];
              var n2 = { callback: e4, args: t3 };
              return h2[o] = n2, i(o), o++;
            }, e3.clearImmediate = f;
          }
          function f(e4) {
            delete h2[e4];
          }
          function c(e4) {
            if (u)
              setTimeout(c, 0, e4);
            else {
              var t3 = h2[e4];
              if (t3) {
                u = true;
                try {
                  !function(e5) {
                    var t4 = e5.callback, r3 = e5.args;
                    switch (r3.length) {
                      case 0:
                        t4();
                        break;
                      case 1:
                        t4(r3[0]);
                        break;
                      case 2:
                        t4(r3[0], r3[1]);
                        break;
                      case 3:
                        t4(r3[0], r3[1], r3[2]);
                        break;
                      default:
                        t4.apply(n, r3);
                    }
                  }(t3);
                } finally {
                  f(e4), u = false;
                }
              }
            }
          }
          function d(e4) {
            e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
          }
        }("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
      }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
    }, {}] }, {}, [10])(10);
  });
})(jszip_min$1);
const jszip_min = jszip_min$1.exports;
const JSZip = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: jszip_min
}, [jszip_min$1.exports]);
var JSZipUtils = {};
JSZipUtils._getBinaryFromXHR = function(xhr) {
  return xhr.response || xhr.responseText;
};
function createStandardXHR() {
  try {
    return new window.XMLHttpRequest();
  } catch (e) {
  }
}
function createActiveXHR() {
  try {
    return new window.ActiveXObject("Microsoft.XMLHTTP");
  } catch (e) {
  }
}
var createXHR = typeof window !== "undefined" && window.ActiveXObject ? function() {
  return createStandardXHR() || createActiveXHR();
} : createStandardXHR;
JSZipUtils.getBinaryContent = function(path, options) {
  var promise, resolve2, reject;
  var callback;
  if (!options) {
    options = {};
  }
  if (typeof options === "function") {
    callback = options;
    options = {};
  } else if (typeof options.callback === "function") {
    callback = options.callback;
  }
  if (!callback && typeof Promise !== "undefined") {
    promise = new Promise(function(_resolve, _reject) {
      resolve2 = _resolve;
      reject = _reject;
    });
  } else {
    resolve2 = function(data) {
      callback(null, data);
    };
    reject = function(err) {
      callback(err, null);
    };
  }
  try {
    var xhr = createXHR();
    xhr.open("GET", path, true);
    if ("responseType" in xhr) {
      xhr.responseType = "arraybuffer";
    }
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.onreadystatechange = function(event) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          try {
            resolve2(JSZipUtils._getBinaryFromXHR(xhr));
          } catch (err) {
            reject(new Error(err));
          }
        } else {
          reject(new Error("Ajax error for " + path + " : " + this.status + " " + this.statusText));
        }
      }
    };
    if (options.progress) {
      xhr.onprogress = function(e) {
        options.progress({
          path,
          originalEvent: e,
          percent: e.loaded / e.total * 100,
          loaded: e.loaded,
          total: e.total
        });
      };
    }
    xhr.send();
  } catch (e) {
    reject(new Error(e), null);
  }
  return promise;
};
var lib = JSZipUtils;
var FileSaver_min = { exports: {} };
(function(module, exports) {
  (function(a, b) {
    b();
  })(commonjsGlobal, function() {
    function b(a2, b2) {
      return "undefined" == typeof b2 ? b2 = { autoBom: false } : "object" != typeof b2 && (console.warn("Deprecated: Expected third argument to be a object"), b2 = { autoBom: !b2 }), b2.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a2.type) ? new Blob(["\uFEFF", a2], { type: a2.type }) : a2;
    }
    function c(a2, b2, c2) {
      var d2 = new XMLHttpRequest();
      d2.open("GET", a2), d2.responseType = "blob", d2.onload = function() {
        g(d2.response, b2, c2);
      }, d2.onerror = function() {
        console.error("could not download file");
      }, d2.send();
    }
    function d(a2) {
      var b2 = new XMLHttpRequest();
      b2.open("HEAD", a2, false);
      try {
        b2.send();
      } catch (a3) {
      }
      return 200 <= b2.status && 299 >= b2.status;
    }
    function e(a2) {
      try {
        a2.dispatchEvent(new MouseEvent("click"));
      } catch (c2) {
        var b2 = document.createEvent("MouseEvents");
        b2.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null), a2.dispatchEvent(b2);
      }
    }
    var f = "object" == typeof window && window.window === window ? window : "object" == typeof self && self.self === self ? self : "object" == typeof commonjsGlobal && commonjsGlobal.global === commonjsGlobal ? commonjsGlobal : void 0, a = f.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent), g = f.saveAs || ("object" != typeof window || window !== f ? function() {
    } : "download" in HTMLAnchorElement.prototype && !a ? function(b2, g2, h2) {
      var i = f.URL || f.webkitURL, j = document.createElement("a");
      g2 = g2 || b2.name || "download", j.download = g2, j.rel = "noopener", "string" == typeof b2 ? (j.href = b2, j.origin === location.origin ? e(j) : d(j.href) ? c(b2, g2, h2) : e(j, j.target = "_blank")) : (j.href = i.createObjectURL(b2), setTimeout(function() {
        i.revokeObjectURL(j.href);
      }, 4e4), setTimeout(function() {
        e(j);
      }, 0));
    } : "msSaveOrOpenBlob" in navigator ? function(f2, g2, h2) {
      if (g2 = g2 || f2.name || "download", "string" != typeof f2)
        navigator.msSaveOrOpenBlob(b(f2, h2), g2);
      else if (d(f2))
        c(f2, g2, h2);
      else {
        var i = document.createElement("a");
        i.href = f2, i.target = "_blank", setTimeout(function() {
          e(i);
        });
      }
    } : function(b2, d2, e2, g2) {
      if (g2 = g2 || open("", "_blank"), g2 && (g2.document.title = g2.document.body.innerText = "downloading..."), "string" == typeof b2)
        return c(b2, d2, e2);
      var h2 = "application/octet-stream" === b2.type, i = /constructor/i.test(f.HTMLElement) || f.safari, j = /CriOS\/[\d]+/.test(navigator.userAgent);
      if ((j || h2 && i || a) && "undefined" != typeof FileReader) {
        var k = new FileReader();
        k.onloadend = function() {
          var a2 = k.result;
          a2 = j ? a2 : a2.replace(/^data:[^;]*;/, "data:attachment/file;"), g2 ? g2.location.href = a2 : location = a2, g2 = null;
        }, k.readAsDataURL(b2);
      } else {
        var l = f.URL || f.webkitURL, m = l.createObjectURL(b2);
        g2 ? g2.location = m : location.href = m, g2 = null, setTimeout(function() {
          l.revokeObjectURL(m);
        }, 4e4);
      }
    });
    f.saveAs = g.saveAs = g, module.exports = g;
  });
})(FileSaver_min);
const Modal_vue_vue_type_style_index_0_lang = "";
const _sfc_main$2 = {};
const _hoisted_1$2 = { class: "row" };
const _hoisted_2$2 = { class: "modal-mask" };
const _hoisted_3$2 = { class: "modal-wrapper" };
const _hoisted_4$2 = { class: "modal-container" };
const _hoisted_5$2 = { class: "modal-header" };
const _hoisted_6$2 = { class: "modal-body" };
const _hoisted_7$2 = { class: "modal-footer" };
function _sfc_render(_ctx, _cache) {
  return openBlock(), createElementBlock("div", _hoisted_1$2, [
    createVNode(Transition, { name: "modal" }, {
      default: withCtx(() => [
        createBaseVNode("div", _hoisted_2$2, [
          createBaseVNode("div", _hoisted_3$2, [
            createBaseVNode("div", _hoisted_4$2, [
              createBaseVNode("div", _hoisted_5$2, [
                renderSlot(_ctx.$slots, "header")
              ]),
              createBaseVNode("div", _hoisted_6$2, [
                renderSlot(_ctx.$slots, "body")
              ]),
              createBaseVNode("div", _hoisted_7$2, [
                renderSlot(_ctx.$slots, "footer")
              ])
            ])
          ])
        ])
      ]),
      _: 3
    })
  ]);
}
const Modal = /* @__PURE__ */ _export_sfc$1(_sfc_main$2, [["render", _sfc_render]]);
const RaceImages_vue_vue_type_style_index_0_scoped_fdf93645_lang = "";
const _withScopeId$1 = (n) => (pushScopeId("data-v-fdf93645"), n = n(), popScopeId(), n);
const _hoisted_1$1 = { id: "main-container" };
const _hoisted_2$1 = {
  id: "box-race-info",
  class: "container-fluid"
};
const _hoisted_3$1 = {
  class: "row raceinfo",
  id: "#race-info",
  style: { "margin-top": "25px" }
};
const _hoisted_4$1 = { class: "col-md-9" };
const _hoisted_5$1 = {
  style: { "font-weight": "bold", "color": "gray" },
  id: "campaign-name"
};
const _hoisted_6$1 = { class: "col-md-3" };
const _hoisted_7$1 = {
  key: 0,
  href: "/",
  style: { "color": "gray" }
};
const _hoisted_8$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("div", {
  class: "row",
  id: "#space"
}, [
  /* @__PURE__ */ createBaseVNode("hr"),
  /* @__PURE__ */ createBaseVNode("hr")
], -1));
const _hoisted_9$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createBaseVNode("h5", {
  class: "modal-title",
  style: { "font-size": "16px" },
  id: "exampleModalLabel"
}, "Qu\xE1 tr\xECnh t\u1EA3i \u0111ang b\u1EAFt \u0111\u1EA7u", -1));
const _sfc_main$1 = {
  __name: "RaceImages",
  setup(__props) {
    const reloadCount = ref(0);
    const route = useRoute();
    const router2 = useRouter();
    const raceid = route.params.raceid;
    const allowType = ref(1);
    const raceName = ref("");
    const configedHosts = ["timanh.com", "localhost", "127.0.0.1"];
    const uploadedImage = ref("");
    const enableDownload = ref(!route.query.bib ? false : true);
    const downloadProgress = ref(0);
    const showModal = ref(false);
    const isOurHost = configedHosts.filter((item) => {
      return window.location.href.indexOf(item) > 0;
    }).length > 0 && window.location === window.parent.location;
    const globalConfig2 = getGlobalConfig();
    const albumInfo = reactive({ imageList: [], pageCount: 0, totalImagesFound: 0 });
    const searchingInfo = initSearchingInfo();
    function initSearchingInfo() {
      var _a2;
      const bibValue = (_a2 = route.query.bib) != null ? _a2 : "*";
      const searchType = bibValue === "*" ? 1 : 2;
      return {
        searchValue: bibValue,
        searchType,
        asset: null,
        raceid,
        pageSize: globalConfig2.pageSize,
        pageNumber: globalConfig2.startingPage,
        previousFaceIds: null
      };
    }
    onMounted(async () => {
      await searchData(searchingInfo).then((response) => {
        raceName.value = response.data.campaignName;
        albumInfo.imageList = response.data.images;
        albumInfo.pageCount = Math.ceil(response.data.total / globalConfig2.pageSize);
        albumInfo.totalImagesFound = response.data.total;
        allowType.value = response.data.allowType;
      }).catch((error) => {
      }).finally(() => {
      });
    });
    async function submitSearchCriteria(searchType, searchValue, file) {
      searchingInfo.searchValue = searchValue;
      searchingInfo.searchType = searchType;
      searchingInfo.asset = file;
      searchingInfo.pageNumber = globalConfig2.startingPage;
      albumInfo.imageList = [];
      albumInfo.pageCount = 0;
      albumInfo.totalImagesFound = 0;
      reloadCount.value++;
      await searchData(searchingInfo).then((response) => {
        albumInfo.imageList = response.data.images;
        albumInfo.pageCount = Math.ceil(response.data.total / globalConfig2.pageSize);
        albumInfo.totalImagesFound = response.data.total;
        if (searchingInfo.searchType == 3) {
          searchingInfo.previousFaceIds = response.data.previousFaceIds;
          uploadedImage.value = URL.createObjectURL(file);
        } else {
          uploadedImage.value = "";
        }
        if (searchingInfo.searchType == 2 || searchingInfo.searchType == 3) {
          enableDownload.value = true;
        } else {
          enableDownload.value = false;
        }
      }).catch((error) => {
        albumInfo.imageList = [];
        albumInfo.pageCount = 0;
        albumInfo.totalImagesFound = 0;
      }).finally(() => {
        if (searchingInfo.searchType == 3) {
          return;
        }
        let query = {};
        if (searchingInfo.searchType == 2) {
          query.bib = searchValue;
        }
        router2.push({
          path: route.fullPath,
          params: route.params,
          query
        });
      });
    }
    async function loadPageData(pageNumber) {
      searchingInfo.pageNumber = pageNumber;
      await searchData(searchingInfo).then((response) => {
        albumInfo.imageList = response.data.images;
        if (searchingInfo.searchType == 3) {
          searchingInfo.previousFaceIds = response.data.previousFaceIds;
        }
      }).catch((error) => {
      }).finally(() => {
      });
    }
    async function downloadUserImages() {
      const pageNumber = searchingInfo.pageNumber;
      const pageSize = searchingInfo.pageSize;
      const pageSizeForDownload = 1e3;
      searchingInfo.pageSize = pageSizeForDownload;
      searchingInfo.pageNumber = globalConfig2.startingPage;
      showModal.value = true;
      await searchData(searchingInfo).then((response) => {
        const images = response.data.images;
        generateZIP(images);
      });
      searchingInfo.pageSize = pageSize;
      searchingInfo.pageNumber = pageNumber;
    }
    function generateZIP(imageList) {
      var zip = null;
      try {
        zip = new JSZip();
      } catch {
        zip = jszip_min();
      }
      var count = 0;
      var zipFilename = "timanh.zip";
      const numberofImages = imageList.length;
      imageList.forEach(function(imageItem, i) {
        var url = imageItem.imageWithLogoUrl;
        var extension = url.split(".").pop();
        var filename = "timanh_".concat(i + 1).concat(".").concat(extension);
        lib.getBinaryContent(url, function(err, data) {
          if (err) {
            throw err;
          }
          zip.file(filename, data, { binary: true });
          count++;
          if (downloadProgress.value <= 92) {
            downloadProgress.value = downloadProgress.value + Math.ceil(100 / numberofImages);
          }
          if (count == numberofImages) {
            zip.generateAsync({ type: "blob" }).then(function(content) {
              FileSaver_min.exports.saveAs(content, zipFilename);
              setTimeout(function() {
                showModal.value = false;
                downloadProgress.value = 0;
              }, 1e3);
            });
          }
        });
      });
    }
    return (_ctx, _cache) => {
      const _component_router_view = resolveComponent("router-view");
      const _component_ve_progress = resolveComponent("ve-progress");
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createVNode(_component_router_view),
        createBaseVNode("div", _hoisted_2$1, [
          unref(isOurHost) ? (openBlock(), createBlock(Menu, { key: 0 })) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_3$1, [
            createBaseVNode("div", _hoisted_4$1, [
              createBaseVNode("span", _hoisted_5$1, toDisplayString(raceName.value), 1)
            ]),
            createBaseVNode("div", _hoisted_6$1, [
              unref(isOurHost) ? (openBlock(), createElementBlock("a", _hoisted_7$1, " Home Page ")) : createCommentVNode("", true)
            ])
          ]),
          _hoisted_8$1
        ]),
        showModal.value ? (openBlock(), createBlock(Modal, {
          key: 0,
          onClose: _cache[0] || (_cache[0] = ($event) => showModal.value = false)
        }, {
          header: withCtx(() => [
            _hoisted_9$1
          ]),
          body: withCtx(() => [
            createVNode(_component_ve_progress, {
              style: { "margin-left": "8px" },
              progress: downloadProgress.value,
              slot: "body"
            }, null, 8, ["progress"])
          ]),
          _: 1
        })) : createCommentVNode("", true),
        createVNode(_sfc_main$5, mergeProps({ enableDownload: enableDownload.value }, unref(searchingInfo), {
          onSearchImages: submitSearchCriteria,
          allowType: allowType.value,
          onDownloadImages: downloadUserImages
        }), null, 16, ["enableDownload", "allowType"]),
        (openBlock(), createBlock(_sfc_main$4, mergeProps({
          key: reloadCount.value,
          uploadedImage: uploadedImage.value
        }, albumInfo, {
          onLoadPage: _cache[1] || (_cache[1] = (pageNumber) => loadPageData(pageNumber))
        }), null, 16, ["uploadedImage"]))
      ]);
    };
  }
};
const RaceImages = /* @__PURE__ */ _export_sfc$1(_sfc_main$1, [["__scopeId", "data-v-fdf93645"]]);
const HomePage_vue_vue_type_style_index_0_scoped_f5d31b01_lang = "";
const _withScopeId = (n) => (pushScopeId("data-v-f5d31b01"), n = n(), popScopeId(), n);
const _hoisted_1 = {
  class: "container-fluid",
  id: "main-container"
};
const _hoisted_2 = { class: "row" };
const _hoisted_3 = {
  id: "bib-search",
  class: "container-fluid"
};
const _hoisted_4 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("div", {
  class: "row",
  style: { "display": "block", "height": "100px" }
}, null, -1));
const _hoisted_5 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("div", {
  class: "row",
  style: { "margin-bottom": "25px" }
}, [
  /* @__PURE__ */ createBaseVNode("span", {
    class: "sologan",
    style: { "line-height": "60px", "color": "#FFF", "font-weight": "bold", "text-shadow": "-1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333" }
  }, "YOUR BEST MOMENTS")
], -1));
const _hoisted_6 = { class: "row search-form" };
const _hoisted_7 = { class: "col-sm-8" };
const _hoisted_8 = { class: "row" };
const _hoisted_9 = { class: "col-sm-6" };
const _hoisted_10 = ["value"];
const _hoisted_11 = { class: "col-sm-6" };
const _hoisted_12 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("a", { href: "" }, null, -1));
const _sfc_main = {
  __name: "HomePage",
  setup(__props) {
    const { campaignsUrl } = getGlobalConfig();
    const options = ref([]);
    const router2 = useRouter();
    useRoute();
    const campaigns = ref([]);
    const raceid = ref(1);
    const bib = ref(null);
    onMounted(async () => {
      getCampaigns(campaignsUrl).then((response) => {
        response.data.campaigns.forEach((item) => {
          options.value.push({ value: item.campaignId, text: item.campaignName });
          campaigns.value.push({ campaignId: item.campaignId, campaignName: item.campaignName, campaignAlias: item.alias });
        });
        raceid.value = options.value[0].value;
      }).catch((error) => {
        console.log(error);
      }).finally(() => {
      });
    });
    function moveToRaceDetails() {
      let query = {};
      if (bib.value) {
        query.bib = bib.value;
      }
      const camp = campaigns.value.find((c) => c.campaignId === raceid.value);
      router2.push({
        name: "racedetails",
        params: { raceid: raceid.value, racealias: camp.campaignAlias },
        query
      }).then((response) => {
      });
    }
    return (_ctx, _cache) => {
      const _component_router_view = resolveComponent("router-view");
      return openBlock(), createElementBlock("div", null, [
        createVNode(_component_router_view),
        createBaseVNode("div", _hoisted_1, [
          createVNode(Menu),
          createBaseVNode("div", _hoisted_2, [
            createBaseVNode("div", _hoisted_3, [
              _hoisted_4,
              _hoisted_5,
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode("div", _hoisted_7, [
                  createBaseVNode("div", _hoisted_8, [
                    createBaseVNode("div", _hoisted_9, [
                      withDirectives(createBaseVNode("select", {
                        class: "form-control",
                        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => raceid.value = $event),
                        id: "raceList"
                      }, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(options.value, (option) => {
                          return openBlock(), createElementBlock("option", {
                            value: option.value,
                            key: option.value
                          }, toDisplayString(option.text), 9, _hoisted_10);
                        }), 128))
                      ], 512), [
                        [vModelSelect, raceid.value]
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_11, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => bib.value = $event),
                        id: "bib",
                        type: "text",
                        class: "form-control",
                        name: "bib",
                        placeholder: "Nh\u1EADp s\u1ED1 BIB"
                      }, null, 512), [
                        [vModelText, bib.value]
                      ])
                    ])
                  ])
                ]),
                createBaseVNode("div", { class: "col-sm-4" }, [
                  createBaseVNode("button", {
                    id: "btnMove",
                    onClick: moveToRaceDetails,
                    class: "form-control",
                    style: { "background-color": "#17b835", "color": "#FFF" }
                  }, "T\xCCM \u1EA2NH "),
                  _hoisted_12
                ])
              ])
            ])
          ])
        ])
      ]);
    };
  }
};
const HomePage = /* @__PURE__ */ _export_sfc$1(_sfc_main, [["__scopeId", "data-v-f5d31b01"]]);
var veprogress_umd_min = { exports: {} };
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(vue_runtime_esmBundler);
(function(module, exports) {
  (function(t, e) {
    module.exports = e(require$$0);
  })("undefined" !== typeof self ? self : commonjsGlobal, function(t) {
    return function() {
      var e = { 7679: function(t2, e2) {
        var r2, n2, o2;
        (function(i, a) {
          n2 = [], r2 = a, o2 = "function" === typeof r2 ? r2.apply(e2, n2) : r2, void 0 === o2 || (t2.exports = o2);
        })("undefined" !== typeof self && self, function() {
          function t3() {
            var e3 = Object.getOwnPropertyDescriptor(document, "currentScript");
            if (!e3 && "currentScript" in document && document.currentScript)
              return document.currentScript;
            if (e3 && e3.get !== t3 && document.currentScript)
              return document.currentScript;
            try {
              throw new Error();
            } catch (d) {
              var r3, n3, o3, i = /.*at [^(]*\((.*):(.+):(.+)\)$/gi, a = /@([^@]*):(\d+):(\d+)\s*$/gi, s = i.exec(d.stack) || a.exec(d.stack), c = s && s[1] || false, u = s && s[2] || false, f = document.location.href.replace(document.location.hash, ""), l = document.getElementsByTagName("script");
              c === f && (r3 = document.documentElement.outerHTML, n3 = new RegExp("(?:[^\\n]+?\\n){0," + (u - 2) + "}[^<]*<script>([\\d\\D]*?)<\\/script>[\\d\\D]*", "i"), o3 = r3.replace(n3, "$1").trim());
              for (var p2 = 0; p2 < l.length; p2++) {
                if ("interactive" === l[p2].readyState)
                  return l[p2];
                if (l[p2].src === c)
                  return l[p2];
                if (c === f && l[p2].innerHTML && l[p2].innerHTML.trim() === o3)
                  return l[p2];
              }
              return null;
            }
          }
          return t3;
        });
      }, 9662: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(614), i = r2(6330), a = n2.TypeError;
        t2.exports = function(t3) {
          if (o2(t3))
            return t3;
          throw a(i(t3) + " is not a function");
        };
      }, 9483: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(4411), i = r2(6330), a = n2.TypeError;
        t2.exports = function(t3) {
          if (o2(t3))
            return t3;
          throw a(i(t3) + " is not a constructor");
        };
      }, 6077: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(614), i = n2.String, a = n2.TypeError;
        t2.exports = function(t3) {
          if ("object" == typeof t3 || o2(t3))
            return t3;
          throw a("Can't set " + i(t3) + " as a prototype");
        };
      }, 1223: function(t2, e2, r2) {
        var n2 = r2(5112), o2 = r2(30), i = r2(3070), a = n2("unscopables"), s = Array.prototype;
        void 0 == s[a] && i.f(s, a, { configurable: true, value: o2(null) }), t2.exports = function(t3) {
          s[a][t3] = true;
        };
      }, 1530: function(t2, e2, r2) {
        var n2 = r2(8710).charAt;
        t2.exports = function(t3, e3, r3) {
          return e3 + (r3 ? n2(t3, e3).length : 1);
        };
      }, 5787: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(7976), i = n2.TypeError;
        t2.exports = function(t3, e3) {
          if (o2(e3, t3))
            return t3;
          throw i("Incorrect invocation");
        };
      }, 9670: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(111), i = n2.String, a = n2.TypeError;
        t2.exports = function(t3) {
          if (o2(t3))
            return t3;
          throw a(i(t3) + " is not an object");
        };
      }, 1285: function(t2, e2, r2) {
        var n2 = r2(7908), o2 = r2(1400), i = r2(6244);
        t2.exports = function(t3) {
          var e3 = n2(this), r3 = i(e3), a = arguments.length, s = o2(a > 1 ? arguments[1] : void 0, r3), c = a > 2 ? arguments[2] : void 0, u = void 0 === c ? r3 : o2(c, r3);
          while (u > s)
            e3[s++] = t3;
          return e3;
        };
      }, 8533: function(t2, e2, r2) {
        var n2 = r2(2092).forEach, o2 = r2(9341), i = o2("forEach");
        t2.exports = i ? [].forEach : function(t3) {
          return n2(this, t3, arguments.length > 1 ? arguments[1] : void 0);
        };
      }, 8457: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(9974), i = r2(6916), a = r2(7908), s = r2(3411), c = r2(7659), u = r2(4411), f = r2(6244), l = r2(6135), p2 = r2(8554), d = r2(1246), h2 = n2.Array;
        t2.exports = function(t3) {
          var e3 = a(t3), r3 = u(this), n3 = arguments.length, v = n3 > 1 ? arguments[1] : void 0, m = void 0 !== v;
          m && (v = o2(v, n3 > 2 ? arguments[2] : void 0));
          var g, y, b, k, x, w, S = d(e3), _ = 0;
          if (!S || this == h2 && c(S))
            for (g = f(e3), y = r3 ? new this(g) : h2(g); g > _; _++)
              w = m ? v(e3[_], _) : e3[_], l(y, _, w);
          else
            for (k = p2(e3, S), x = k.next, y = r3 ? new this() : []; !(b = i(x, k)).done; _++)
              w = m ? s(k, v, [b.value, _], true) : b.value, l(y, _, w);
          return y.length = _, y;
        };
      }, 1318: function(t2, e2, r2) {
        var n2 = r2(5656), o2 = r2(1400), i = r2(6244), a = function(t3) {
          return function(e3, r3, a2) {
            var s, c = n2(e3), u = i(c), f = o2(a2, u);
            if (t3 && r3 != r3) {
              while (u > f)
                if (s = c[f++], s != s)
                  return true;
            } else
              for (; u > f; f++)
                if ((t3 || f in c) && c[f] === r3)
                  return t3 || f || 0;
            return !t3 && -1;
          };
        };
        t2.exports = { includes: a(true), indexOf: a(false) };
      }, 2092: function(t2, e2, r2) {
        var n2 = r2(9974), o2 = r2(1702), i = r2(8361), a = r2(7908), s = r2(6244), c = r2(5417), u = o2([].push), f = function(t3) {
          var e3 = 1 == t3, r3 = 2 == t3, o3 = 3 == t3, f2 = 4 == t3, l = 6 == t3, p2 = 7 == t3, d = 5 == t3 || l;
          return function(h2, v, m, g) {
            for (var y, b, k = a(h2), x = i(k), w = n2(v, m), S = s(x), _ = 0, E = g || c, O = e3 ? E(h2, S) : r3 || p2 ? E(h2, 0) : void 0; S > _; _++)
              if ((d || _ in x) && (y = x[_], b = w(y, _, k), t3))
                if (e3)
                  O[_] = b;
                else if (b)
                  switch (t3) {
                    case 3:
                      return true;
                    case 5:
                      return y;
                    case 6:
                      return _;
                    case 2:
                      u(O, y);
                  }
                else
                  switch (t3) {
                    case 4:
                      return false;
                    case 7:
                      u(O, y);
                  }
            return l ? -1 : o3 || f2 ? f2 : O;
          };
        };
        t2.exports = { forEach: f(0), map: f(1), filter: f(2), some: f(3), every: f(4), find: f(5), findIndex: f(6), filterReject: f(7) };
      }, 1194: function(t2, e2, r2) {
        var n2 = r2(7293), o2 = r2(5112), i = r2(7392), a = o2("species");
        t2.exports = function(t3) {
          return i >= 51 || !n2(function() {
            var e3 = [], r3 = e3.constructor = {};
            return r3[a] = function() {
              return { foo: 1 };
            }, 1 !== e3[t3](Boolean).foo;
          });
        };
      }, 9341: function(t2, e2, r2) {
        var n2 = r2(7293);
        t2.exports = function(t3, e3) {
          var r3 = [][t3];
          return !!r3 && n2(function() {
            r3.call(null, e3 || function() {
              return 1;
            }, 1);
          });
        };
      }, 1589: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(1400), i = r2(6244), a = r2(6135), s = n2.Array, c = Math.max;
        t2.exports = function(t3, e3, r3) {
          for (var n3 = i(t3), u = o2(e3, n3), f = o2(void 0 === r3 ? n3 : r3, n3), l = s(c(f - u, 0)), p2 = 0; u < f; u++, p2++)
            a(l, p2, t3[u]);
          return l.length = p2, l;
        };
      }, 206: function(t2, e2, r2) {
        var n2 = r2(1702);
        t2.exports = n2([].slice);
      }, 7475: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(3157), i = r2(4411), a = r2(111), s = r2(5112), c = s("species"), u = n2.Array;
        t2.exports = function(t3) {
          var e3;
          return o2(t3) && (e3 = t3.constructor, i(e3) && (e3 === u || o2(e3.prototype)) ? e3 = void 0 : a(e3) && (e3 = e3[c], null === e3 && (e3 = void 0))), void 0 === e3 ? u : e3;
        };
      }, 5417: function(t2, e2, r2) {
        var n2 = r2(7475);
        t2.exports = function(t3, e3) {
          return new (n2(t3))(0 === e3 ? 0 : e3);
        };
      }, 3411: function(t2, e2, r2) {
        var n2 = r2(9670), o2 = r2(9212);
        t2.exports = function(t3, e3, r3, i) {
          try {
            return i ? e3(n2(r3)[0], r3[1]) : e3(r3);
          } catch (a) {
            o2(t3, "throw", a);
          }
        };
      }, 7072: function(t2, e2, r2) {
        var n2 = r2(5112), o2 = n2("iterator"), i = false;
        try {
          var a = 0, s = { next: function() {
            return { done: !!a++ };
          }, return: function() {
            i = true;
          } };
          s[o2] = function() {
            return this;
          }, Array.from(s, function() {
            throw 2;
          });
        } catch (c) {
        }
        t2.exports = function(t3, e3) {
          if (!e3 && !i)
            return false;
          var r3 = false;
          try {
            var n3 = {};
            n3[o2] = function() {
              return { next: function() {
                return { done: r3 = true };
              } };
            }, t3(n3);
          } catch (c) {
          }
          return r3;
        };
      }, 4326: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = n2({}.toString), i = n2("".slice);
        t2.exports = function(t3) {
          return i(o2(t3), 8, -1);
        };
      }, 648: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(1694), i = r2(614), a = r2(4326), s = r2(5112), c = s("toStringTag"), u = n2.Object, f = "Arguments" == a(function() {
          return arguments;
        }()), l = function(t3, e3) {
          try {
            return t3[e3];
          } catch (r3) {
          }
        };
        t2.exports = o2 ? a : function(t3) {
          var e3, r3, n3;
          return void 0 === t3 ? "Undefined" : null === t3 ? "Null" : "string" == typeof (r3 = l(e3 = u(t3), c)) ? r3 : f ? a(e3) : "Object" == (n3 = a(e3)) && i(e3.callee) ? "Arguments" : n3;
        };
      }, 7741: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = n2("".replace), i = function(t3) {
          return String(Error(t3).stack);
        }("zxcasd"), a = /\n\s*at [^:]*:[^\n]*/, s = a.test(i);
        t2.exports = function(t3, e3) {
          if (s && "string" == typeof t3)
            while (e3--)
              t3 = o2(t3, a, "");
          return t3;
        };
      }, 9920: function(t2, e2, r2) {
        var n2 = r2(2597), o2 = r2(3887), i = r2(1236), a = r2(3070);
        t2.exports = function(t3, e3, r3) {
          for (var s = o2(e3), c = a.f, u = i.f, f = 0; f < s.length; f++) {
            var l = s[f];
            n2(t3, l) || r3 && n2(r3, l) || c(t3, l, u(e3, l));
          }
        };
      }, 4964: function(t2, e2, r2) {
        var n2 = r2(5112), o2 = n2("match");
        t2.exports = function(t3) {
          var e3 = /./;
          try {
            "/./"[t3](e3);
          } catch (r3) {
            try {
              return e3[o2] = false, "/./"[t3](e3);
            } catch (n3) {
            }
          }
          return false;
        };
      }, 8544: function(t2, e2, r2) {
        var n2 = r2(7293);
        t2.exports = !n2(function() {
          function t3() {
          }
          return t3.prototype.constructor = null, Object.getPrototypeOf(new t3()) !== t3.prototype;
        });
      }, 4994: function(t2, e2, r2) {
        var n2 = r2(3383).IteratorPrototype, o2 = r2(30), i = r2(9114), a = r2(8003), s = r2(7497), c = function() {
          return this;
        };
        t2.exports = function(t3, e3, r3, u) {
          var f = e3 + " Iterator";
          return t3.prototype = o2(n2, { next: i(+!u, r3) }), a(t3, f, false, true), s[f] = c, t3;
        };
      }, 8880: function(t2, e2, r2) {
        var n2 = r2(9781), o2 = r2(3070), i = r2(9114);
        t2.exports = n2 ? function(t3, e3, r3) {
          return o2.f(t3, e3, i(1, r3));
        } : function(t3, e3, r3) {
          return t3[e3] = r3, t3;
        };
      }, 9114: function(t2) {
        t2.exports = function(t3, e2) {
          return { enumerable: !(1 & t3), configurable: !(2 & t3), writable: !(4 & t3), value: e2 };
        };
      }, 6135: function(t2, e2, r2) {
        var n2 = r2(4948), o2 = r2(3070), i = r2(9114);
        t2.exports = function(t3, e3, r3) {
          var a = n2(e3);
          a in t3 ? o2.f(t3, a, i(0, r3)) : t3[a] = r3;
        };
      }, 654: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(6916), i = r2(1913), a = r2(6530), s = r2(614), c = r2(4994), u = r2(9518), f = r2(7674), l = r2(8003), p2 = r2(8880), d = r2(1320), h2 = r2(5112), v = r2(7497), m = r2(3383), g = a.PROPER, y = a.CONFIGURABLE, b = m.IteratorPrototype, k = m.BUGGY_SAFARI_ITERATORS, x = h2("iterator"), w = "keys", S = "values", _ = "entries", E = function() {
          return this;
        };
        t2.exports = function(t3, e3, r3, a2, h3, m2, O) {
          c(r3, e3, a2);
          var C, T, j, P = function(t4) {
            if (t4 === h3 && D)
              return D;
            if (!k && t4 in I)
              return I[t4];
            switch (t4) {
              case w:
                return function() {
                  return new r3(this, t4);
                };
              case S:
                return function() {
                  return new r3(this, t4);
                };
              case _:
                return function() {
                  return new r3(this, t4);
                };
            }
            return function() {
              return new r3(this);
            };
          }, F = e3 + " Iterator", N = false, I = t3.prototype, A = I[x] || I["@@iterator"] || h3 && I[h3], D = !k && A || P(h3), L = "Array" == e3 && I.entries || A;
          if (L && (C = u(L.call(new t3())), C !== Object.prototype && C.next && (i || u(C) === b || (f ? f(C, b) : s(C[x]) || d(C, x, E)), l(C, F, true, true), i && (v[F] = E))), g && h3 == S && A && A.name !== S && (!i && y ? p2(I, "name", S) : (N = true, D = function() {
            return o2(A, this);
          })), h3)
            if (T = { values: P(S), keys: m2 ? D : P(w), entries: P(_) }, O)
              for (j in T)
                (k || N || !(j in I)) && d(I, j, T[j]);
            else
              n2({ target: e3, proto: true, forced: k || N }, T);
          return i && !O || I[x] === D || d(I, x, D, { name: h3 }), v[e3] = D, T;
        };
      }, 7235: function(t2, e2, r2) {
        var n2 = r2(857), o2 = r2(2597), i = r2(6061), a = r2(3070).f;
        t2.exports = function(t3) {
          var e3 = n2.Symbol || (n2.Symbol = {});
          o2(e3, t3) || a(e3, t3, { value: i.f(t3) });
        };
      }, 9781: function(t2, e2, r2) {
        var n2 = r2(7293);
        t2.exports = !n2(function() {
          return 7 != Object.defineProperty({}, 1, { get: function() {
            return 7;
          } })[1];
        });
      }, 317: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(111), i = n2.document, a = o2(i) && o2(i.createElement);
        t2.exports = function(t3) {
          return a ? i.createElement(t3) : {};
        };
      }, 8324: function(t2) {
        t2.exports = { CSSRuleList: 0, CSSStyleDeclaration: 0, CSSValueList: 0, ClientRectList: 0, DOMRectList: 0, DOMStringList: 0, DOMTokenList: 1, DataTransferItemList: 0, FileList: 0, HTMLAllCollection: 0, HTMLCollection: 0, HTMLFormElement: 0, HTMLSelectElement: 0, MediaList: 0, MimeTypeArray: 0, NamedNodeMap: 0, NodeList: 1, PaintRequestList: 0, Plugin: 0, PluginArray: 0, SVGLengthList: 0, SVGNumberList: 0, SVGPathSegList: 0, SVGPointList: 0, SVGStringList: 0, SVGTransformList: 0, SourceBufferList: 0, StyleSheetList: 0, TextTrackCueList: 0, TextTrackList: 0, TouchList: 0 };
      }, 8509: function(t2, e2, r2) {
        var n2 = r2(317), o2 = n2("span").classList, i = o2 && o2.constructor && o2.constructor.prototype;
        t2.exports = i === Object.prototype ? void 0 : i;
      }, 7871: function(t2) {
        t2.exports = "object" == typeof window;
      }, 1528: function(t2, e2, r2) {
        var n2 = r2(8113), o2 = r2(7854);
        t2.exports = /ipad|iphone|ipod/i.test(n2) && void 0 !== o2.Pebble;
      }, 6833: function(t2, e2, r2) {
        var n2 = r2(8113);
        t2.exports = /(?:ipad|iphone|ipod).*applewebkit/i.test(n2);
      }, 5268: function(t2, e2, r2) {
        var n2 = r2(4326), o2 = r2(7854);
        t2.exports = "process" == n2(o2.process);
      }, 1036: function(t2, e2, r2) {
        var n2 = r2(8113);
        t2.exports = /web0s(?!.*chrome)/i.test(n2);
      }, 8113: function(t2, e2, r2) {
        var n2 = r2(5005);
        t2.exports = n2("navigator", "userAgent") || "";
      }, 7392: function(t2, e2, r2) {
        var n2, o2, i = r2(7854), a = r2(8113), s = i.process, c = i.Deno, u = s && s.versions || c && c.version, f = u && u.v8;
        f && (n2 = f.split("."), o2 = n2[0] > 0 && n2[0] < 4 ? 1 : +(n2[0] + n2[1])), !o2 && a && (n2 = a.match(/Edge\/(\d+)/), (!n2 || n2[1] >= 74) && (n2 = a.match(/Chrome\/(\d+)/), n2 && (o2 = +n2[1]))), t2.exports = o2;
      }, 748: function(t2) {
        t2.exports = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
      }, 2914: function(t2, e2, r2) {
        var n2 = r2(7293), o2 = r2(9114);
        t2.exports = !n2(function() {
          var t3 = Error("a");
          return !("stack" in t3) || (Object.defineProperty(t3, "stack", o2(1, 7)), 7 !== t3.stack);
        });
      }, 2109: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(1236).f, i = r2(8880), a = r2(1320), s = r2(3505), c = r2(9920), u = r2(4705);
        t2.exports = function(t3, e3) {
          var r3, f, l, p2, d, h2, v = t3.target, m = t3.global, g = t3.stat;
          if (f = m ? n2 : g ? n2[v] || s(v, {}) : (n2[v] || {}).prototype, f)
            for (l in e3) {
              if (d = e3[l], t3.noTargetGet ? (h2 = o2(f, l), p2 = h2 && h2.value) : p2 = f[l], r3 = u(m ? l : v + (g ? "." : "#") + l, t3.forced), !r3 && void 0 !== p2) {
                if (typeof d == typeof p2)
                  continue;
                c(d, p2);
              }
              (t3.sham || p2 && p2.sham) && i(d, "sham", true), a(f, l, d, t3);
            }
        };
      }, 7293: function(t2) {
        t2.exports = function(t3) {
          try {
            return !!t3();
          } catch (e2) {
            return true;
          }
        };
      }, 7007: function(t2, e2, r2) {
        r2(4916);
        var n2 = r2(1702), o2 = r2(1320), i = r2(2261), a = r2(7293), s = r2(5112), c = r2(8880), u = s("species"), f = RegExp.prototype;
        t2.exports = function(t3, e3, r3, l) {
          var p2 = s(t3), d = !a(function() {
            var e4 = {};
            return e4[p2] = function() {
              return 7;
            }, 7 != ""[t3](e4);
          }), h2 = d && !a(function() {
            var e4 = false, r4 = /a/;
            return "split" === t3 && (r4 = {}, r4.constructor = {}, r4.constructor[u] = function() {
              return r4;
            }, r4.flags = "", r4[p2] = /./[p2]), r4.exec = function() {
              return e4 = true, null;
            }, r4[p2](""), !e4;
          });
          if (!d || !h2 || r3) {
            var v = n2(/./[p2]), m = e3(p2, ""[t3], function(t4, e4, r4, o3, a2) {
              var s2 = n2(t4), c2 = e4.exec;
              return c2 === i || c2 === f.exec ? d && !a2 ? { done: true, value: v(e4, r4, o3) } : { done: true, value: s2(r4, e4, o3) } : { done: false };
            });
            o2(String.prototype, t3, m[0]), o2(f, p2, m[1]);
          }
          l && c(f[p2], "sham", true);
        };
      }, 2104: function(t2, e2, r2) {
        var n2 = r2(4374), o2 = Function.prototype, i = o2.apply, a = o2.call;
        t2.exports = "object" == typeof Reflect && Reflect.apply || (n2 ? a.bind(i) : function() {
          return a.apply(i, arguments);
        });
      }, 9974: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(9662), i = r2(4374), a = n2(n2.bind);
        t2.exports = function(t3, e3) {
          return o2(t3), void 0 === e3 ? t3 : i ? a(t3, e3) : function() {
            return t3.apply(e3, arguments);
          };
        };
      }, 4374: function(t2, e2, r2) {
        var n2 = r2(7293);
        t2.exports = !n2(function() {
          var t3 = function() {
          }.bind();
          return "function" != typeof t3 || t3.hasOwnProperty("prototype");
        });
      }, 6916: function(t2, e2, r2) {
        var n2 = r2(4374), o2 = Function.prototype.call;
        t2.exports = n2 ? o2.bind(o2) : function() {
          return o2.apply(o2, arguments);
        };
      }, 6530: function(t2, e2, r2) {
        var n2 = r2(9781), o2 = r2(2597), i = Function.prototype, a = n2 && Object.getOwnPropertyDescriptor, s = o2(i, "name"), c = s && "something" === function() {
        }.name, u = s && (!n2 || n2 && a(i, "name").configurable);
        t2.exports = { EXISTS: s, PROPER: c, CONFIGURABLE: u };
      }, 1702: function(t2, e2, r2) {
        var n2 = r2(4374), o2 = Function.prototype, i = o2.bind, a = o2.call, s = n2 && i.bind(a, a);
        t2.exports = n2 ? function(t3) {
          return t3 && s(t3);
        } : function(t3) {
          return t3 && function() {
            return a.apply(t3, arguments);
          };
        };
      }, 5005: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(614), i = function(t3) {
          return o2(t3) ? t3 : void 0;
        };
        t2.exports = function(t3, e3) {
          return arguments.length < 2 ? i(n2[t3]) : n2[t3] && n2[t3][e3];
        };
      }, 1246: function(t2, e2, r2) {
        var n2 = r2(648), o2 = r2(8173), i = r2(7497), a = r2(5112), s = a("iterator");
        t2.exports = function(t3) {
          if (void 0 != t3)
            return o2(t3, s) || o2(t3, "@@iterator") || i[n2(t3)];
        };
      }, 8554: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(6916), i = r2(9662), a = r2(9670), s = r2(6330), c = r2(1246), u = n2.TypeError;
        t2.exports = function(t3, e3) {
          var r3 = arguments.length < 2 ? c(t3) : e3;
          if (i(r3))
            return a(o2(r3, t3));
          throw u(s(t3) + " is not iterable");
        };
      }, 8173: function(t2, e2, r2) {
        var n2 = r2(9662);
        t2.exports = function(t3, e3) {
          var r3 = t3[e3];
          return null == r3 ? void 0 : n2(r3);
        };
      }, 647: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(7908), i = Math.floor, a = n2("".charAt), s = n2("".replace), c = n2("".slice), u = /\$([$&'`]|\d{1,2}|<[^>]*>)/g, f = /\$([$&'`]|\d{1,2})/g;
        t2.exports = function(t3, e3, r3, n3, l, p2) {
          var d = r3 + t3.length, h2 = n3.length, v = f;
          return void 0 !== l && (l = o2(l), v = u), s(p2, v, function(o3, s2) {
            var u2;
            switch (a(s2, 0)) {
              case "$":
                return "$";
              case "&":
                return t3;
              case "`":
                return c(e3, 0, r3);
              case "'":
                return c(e3, d);
              case "<":
                u2 = l[c(s2, 1, -1)];
                break;
              default:
                var f2 = +s2;
                if (0 === f2)
                  return o3;
                if (f2 > h2) {
                  var p3 = i(f2 / 10);
                  return 0 === p3 ? o3 : p3 <= h2 ? void 0 === n3[p3 - 1] ? a(s2, 1) : n3[p3 - 1] + a(s2, 1) : o3;
                }
                u2 = n3[f2 - 1];
            }
            return void 0 === u2 ? "" : u2;
          });
        };
      }, 7854: function(t2, e2, r2) {
        var n2 = function(t3) {
          return t3 && t3.Math == Math && t3;
        };
        t2.exports = n2("object" == typeof globalThis && globalThis) || n2("object" == typeof window && window) || n2("object" == typeof self && self) || n2("object" == typeof r2.g && r2.g) || function() {
          return this;
        }() || Function("return this")();
      }, 2597: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(7908), i = n2({}.hasOwnProperty);
        t2.exports = Object.hasOwn || function(t3, e3) {
          return i(o2(t3), e3);
        };
      }, 3501: function(t2) {
        t2.exports = {};
      }, 842: function(t2, e2, r2) {
        var n2 = r2(7854);
        t2.exports = function(t3, e3) {
          var r3 = n2.console;
          r3 && r3.error && (1 == arguments.length ? r3.error(t3) : r3.error(t3, e3));
        };
      }, 490: function(t2, e2, r2) {
        var n2 = r2(5005);
        t2.exports = n2("document", "documentElement");
      }, 4664: function(t2, e2, r2) {
        var n2 = r2(9781), o2 = r2(7293), i = r2(317);
        t2.exports = !n2 && !o2(function() {
          return 7 != Object.defineProperty(i("div"), "a", { get: function() {
            return 7;
          } }).a;
        });
      }, 8361: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(1702), i = r2(7293), a = r2(4326), s = n2.Object, c = o2("".split);
        t2.exports = i(function() {
          return !s("z").propertyIsEnumerable(0);
        }) ? function(t3) {
          return "String" == a(t3) ? c(t3, "") : s(t3);
        } : s;
      }, 9587: function(t2, e2, r2) {
        var n2 = r2(614), o2 = r2(111), i = r2(7674);
        t2.exports = function(t3, e3, r3) {
          var a, s;
          return i && n2(a = e3.constructor) && a !== r3 && o2(s = a.prototype) && s !== r3.prototype && i(t3, s), t3;
        };
      }, 2788: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(614), i = r2(5465), a = n2(Function.toString);
        o2(i.inspectSource) || (i.inspectSource = function(t3) {
          return a(t3);
        }), t2.exports = i.inspectSource;
      }, 8340: function(t2, e2, r2) {
        var n2 = r2(111), o2 = r2(8880);
        t2.exports = function(t3, e3) {
          n2(e3) && "cause" in e3 && o2(t3, "cause", e3.cause);
        };
      }, 9909: function(t2, e2, r2) {
        var n2, o2, i, a = r2(8536), s = r2(7854), c = r2(1702), u = r2(111), f = r2(8880), l = r2(2597), p2 = r2(5465), d = r2(6200), h2 = r2(3501), v = "Object already initialized", m = s.TypeError, g = s.WeakMap, y = function(t3) {
          return i(t3) ? o2(t3) : n2(t3, {});
        }, b = function(t3) {
          return function(e3) {
            var r3;
            if (!u(e3) || (r3 = o2(e3)).type !== t3)
              throw m("Incompatible receiver, " + t3 + " required");
            return r3;
          };
        };
        if (a || p2.state) {
          var k = p2.state || (p2.state = new g()), x = c(k.get), w = c(k.has), S = c(k.set);
          n2 = function(t3, e3) {
            if (w(k, t3))
              throw new m(v);
            return e3.facade = t3, S(k, t3, e3), e3;
          }, o2 = function(t3) {
            return x(k, t3) || {};
          }, i = function(t3) {
            return w(k, t3);
          };
        } else {
          var _ = d("state");
          h2[_] = true, n2 = function(t3, e3) {
            if (l(t3, _))
              throw new m(v);
            return e3.facade = t3, f(t3, _, e3), e3;
          }, o2 = function(t3) {
            return l(t3, _) ? t3[_] : {};
          }, i = function(t3) {
            return l(t3, _);
          };
        }
        t2.exports = { set: n2, get: o2, has: i, enforce: y, getterFor: b };
      }, 7659: function(t2, e2, r2) {
        var n2 = r2(5112), o2 = r2(7497), i = n2("iterator"), a = Array.prototype;
        t2.exports = function(t3) {
          return void 0 !== t3 && (o2.Array === t3 || a[i] === t3);
        };
      }, 3157: function(t2, e2, r2) {
        var n2 = r2(4326);
        t2.exports = Array.isArray || function(t3) {
          return "Array" == n2(t3);
        };
      }, 614: function(t2) {
        t2.exports = function(t3) {
          return "function" == typeof t3;
        };
      }, 4411: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(7293), i = r2(614), a = r2(648), s = r2(5005), c = r2(2788), u = function() {
        }, f = [], l = s("Reflect", "construct"), p2 = /^\s*(?:class|function)\b/, d = n2(p2.exec), h2 = !p2.exec(u), v = function(t3) {
          if (!i(t3))
            return false;
          try {
            return l(u, f, t3), true;
          } catch (e3) {
            return false;
          }
        }, m = function(t3) {
          if (!i(t3))
            return false;
          switch (a(t3)) {
            case "AsyncFunction":
            case "GeneratorFunction":
            case "AsyncGeneratorFunction":
              return false;
          }
          try {
            return h2 || !!d(p2, c(t3));
          } catch (e3) {
            return true;
          }
        };
        m.sham = true, t2.exports = !l || o2(function() {
          var t3;
          return v(v.call) || !v(Object) || !v(function() {
            t3 = true;
          }) || t3;
        }) ? m : v;
      }, 4705: function(t2, e2, r2) {
        var n2 = r2(7293), o2 = r2(614), i = /#|\.prototype\./, a = function(t3, e3) {
          var r3 = c[s(t3)];
          return r3 == f || r3 != u && (o2(e3) ? n2(e3) : !!e3);
        }, s = a.normalize = function(t3) {
          return String(t3).replace(i, ".").toLowerCase();
        }, c = a.data = {}, u = a.NATIVE = "N", f = a.POLYFILL = "P";
        t2.exports = a;
      }, 111: function(t2, e2, r2) {
        var n2 = r2(614);
        t2.exports = function(t3) {
          return "object" == typeof t3 ? null !== t3 : n2(t3);
        };
      }, 1913: function(t2) {
        t2.exports = false;
      }, 7850: function(t2, e2, r2) {
        var n2 = r2(111), o2 = r2(4326), i = r2(5112), a = i("match");
        t2.exports = function(t3) {
          var e3;
          return n2(t3) && (void 0 !== (e3 = t3[a]) ? !!e3 : "RegExp" == o2(t3));
        };
      }, 2190: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(5005), i = r2(614), a = r2(7976), s = r2(3307), c = n2.Object;
        t2.exports = s ? function(t3) {
          return "symbol" == typeof t3;
        } : function(t3) {
          var e3 = o2("Symbol");
          return i(e3) && a(e3.prototype, c(t3));
        };
      }, 408: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(9974), i = r2(6916), a = r2(9670), s = r2(6330), c = r2(7659), u = r2(6244), f = r2(7976), l = r2(8554), p2 = r2(1246), d = r2(9212), h2 = n2.TypeError, v = function(t3, e3) {
          this.stopped = t3, this.result = e3;
        }, m = v.prototype;
        t2.exports = function(t3, e3, r3) {
          var n3, g, y, b, k, x, w, S = r3 && r3.that, _ = !(!r3 || !r3.AS_ENTRIES), E = !(!r3 || !r3.IS_ITERATOR), O = !(!r3 || !r3.INTERRUPTED), C = o2(e3, S), T = function(t4) {
            return n3 && d(n3, "normal", t4), new v(true, t4);
          }, j = function(t4) {
            return _ ? (a(t4), O ? C(t4[0], t4[1], T) : C(t4[0], t4[1])) : O ? C(t4, T) : C(t4);
          };
          if (E)
            n3 = t3;
          else {
            if (g = p2(t3), !g)
              throw h2(s(t3) + " is not iterable");
            if (c(g)) {
              for (y = 0, b = u(t3); b > y; y++)
                if (k = j(t3[y]), k && f(m, k))
                  return k;
              return new v(false);
            }
            n3 = l(t3, g);
          }
          x = n3.next;
          while (!(w = i(x, n3)).done) {
            try {
              k = j(w.value);
            } catch (P) {
              d(n3, "throw", P);
            }
            if ("object" == typeof k && k && f(m, k))
              return k;
          }
          return new v(false);
        };
      }, 9212: function(t2, e2, r2) {
        var n2 = r2(6916), o2 = r2(9670), i = r2(8173);
        t2.exports = function(t3, e3, r3) {
          var a, s;
          o2(t3);
          try {
            if (a = i(t3, "return"), !a) {
              if ("throw" === e3)
                throw r3;
              return r3;
            }
            a = n2(a, t3);
          } catch (c) {
            s = true, a = c;
          }
          if ("throw" === e3)
            throw r3;
          if (s)
            throw a;
          return o2(a), r3;
        };
      }, 3383: function(t2, e2, r2) {
        var n2, o2, i, a = r2(7293), s = r2(614), c = r2(30), u = r2(9518), f = r2(1320), l = r2(5112), p2 = r2(1913), d = l("iterator"), h2 = false;
        [].keys && (i = [].keys(), "next" in i ? (o2 = u(u(i)), o2 !== Object.prototype && (n2 = o2)) : h2 = true);
        var v = void 0 == n2 || a(function() {
          var t3 = {};
          return n2[d].call(t3) !== t3;
        });
        v ? n2 = {} : p2 && (n2 = c(n2)), s(n2[d]) || f(n2, d, function() {
          return this;
        }), t2.exports = { IteratorPrototype: n2, BUGGY_SAFARI_ITERATORS: h2 };
      }, 7497: function(t2) {
        t2.exports = {};
      }, 6244: function(t2, e2, r2) {
        var n2 = r2(7466);
        t2.exports = function(t3) {
          return n2(t3.length);
        };
      }, 5948: function(t2, e2, r2) {
        var n2, o2, i, a, s, c, u, f, l = r2(7854), p2 = r2(9974), d = r2(1236).f, h2 = r2(261).set, v = r2(6833), m = r2(1528), g = r2(1036), y = r2(5268), b = l.MutationObserver || l.WebKitMutationObserver, k = l.document, x = l.process, w = l.Promise, S = d(l, "queueMicrotask"), _ = S && S.value;
        _ || (n2 = function() {
          var t3, e3;
          y && (t3 = x.domain) && t3.exit();
          while (o2) {
            e3 = o2.fn, o2 = o2.next;
            try {
              e3();
            } catch (r3) {
              throw o2 ? a() : i = void 0, r3;
            }
          }
          i = void 0, t3 && t3.enter();
        }, v || y || g || !b || !k ? !m && w && w.resolve ? (u = w.resolve(void 0), u.constructor = w, f = p2(u.then, u), a = function() {
          f(n2);
        }) : y ? a = function() {
          x.nextTick(n2);
        } : (h2 = p2(h2, l), a = function() {
          h2(n2);
        }) : (s = true, c = k.createTextNode(""), new b(n2).observe(c, { characterData: true }), a = function() {
          c.data = s = !s;
        })), t2.exports = _ || function(t3) {
          var e3 = { fn: t3, next: void 0 };
          i && (i.next = e3), o2 || (o2 = e3, a()), i = e3;
        };
      }, 3366: function(t2, e2, r2) {
        var n2 = r2(7854);
        t2.exports = n2.Promise;
      }, 133: function(t2, e2, r2) {
        var n2 = r2(7392), o2 = r2(7293);
        t2.exports = !!Object.getOwnPropertySymbols && !o2(function() {
          var t3 = Symbol();
          return !String(t3) || !(Object(t3) instanceof Symbol) || !Symbol.sham && n2 && n2 < 41;
        });
      }, 8536: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(614), i = r2(2788), a = n2.WeakMap;
        t2.exports = o2(a) && /native code/.test(i(a));
      }, 8523: function(t2, e2, r2) {
        var n2 = r2(9662), o2 = function(t3) {
          var e3, r3;
          this.promise = new t3(function(t4, n3) {
            if (void 0 !== e3 || void 0 !== r3)
              throw TypeError("Bad Promise constructor");
            e3 = t4, r3 = n3;
          }), this.resolve = n2(e3), this.reject = n2(r3);
        };
        t2.exports.f = function(t3) {
          return new o2(t3);
        };
      }, 6277: function(t2, e2, r2) {
        var n2 = r2(1340);
        t2.exports = function(t3, e3) {
          return void 0 === t3 ? arguments.length < 2 ? "" : e3 : n2(t3);
        };
      }, 3929: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(7850), i = n2.TypeError;
        t2.exports = function(t3) {
          if (o2(t3))
            throw i("The method doesn't accept regular expressions");
          return t3;
        };
      }, 30: function(t2, e2, r2) {
        var n2, o2 = r2(9670), i = r2(6048), a = r2(748), s = r2(3501), c = r2(490), u = r2(317), f = r2(6200), l = ">", p2 = "<", d = "prototype", h2 = "script", v = f("IE_PROTO"), m = function() {
        }, g = function(t3) {
          return p2 + h2 + l + t3 + p2 + "/" + h2 + l;
        }, y = function(t3) {
          t3.write(g("")), t3.close();
          var e3 = t3.parentWindow.Object;
          return t3 = null, e3;
        }, b = function() {
          var t3, e3 = u("iframe"), r3 = "java" + h2 + ":";
          return e3.style.display = "none", c.appendChild(e3), e3.src = String(r3), t3 = e3.contentWindow.document, t3.open(), t3.write(g("document.F=Object")), t3.close(), t3.F;
        }, k = function() {
          try {
            n2 = new ActiveXObject("htmlfile");
          } catch (e3) {
          }
          k = "undefined" != typeof document ? document.domain && n2 ? y(n2) : b() : y(n2);
          var t3 = a.length;
          while (t3--)
            delete k[d][a[t3]];
          return k();
        };
        s[v] = true, t2.exports = Object.create || function(t3, e3) {
          var r3;
          return null !== t3 ? (m[d] = o2(t3), r3 = new m(), m[d] = null, r3[v] = t3) : r3 = k(), void 0 === e3 ? r3 : i.f(r3, e3);
        };
      }, 6048: function(t2, e2, r2) {
        var n2 = r2(9781), o2 = r2(3353), i = r2(3070), a = r2(9670), s = r2(5656), c = r2(1956);
        e2.f = n2 && !o2 ? Object.defineProperties : function(t3, e3) {
          a(t3);
          var r3, n3 = s(e3), o3 = c(e3), u = o3.length, f = 0;
          while (u > f)
            i.f(t3, r3 = o3[f++], n3[r3]);
          return t3;
        };
      }, 3070: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(9781), i = r2(4664), a = r2(3353), s = r2(9670), c = r2(4948), u = n2.TypeError, f = Object.defineProperty, l = Object.getOwnPropertyDescriptor, p2 = "enumerable", d = "configurable", h2 = "writable";
        e2.f = o2 ? a ? function(t3, e3, r3) {
          if (s(t3), e3 = c(e3), s(r3), "function" === typeof t3 && "prototype" === e3 && "value" in r3 && h2 in r3 && !r3[h2]) {
            var n3 = l(t3, e3);
            n3 && n3[h2] && (t3[e3] = r3.value, r3 = { configurable: d in r3 ? r3[d] : n3[d], enumerable: p2 in r3 ? r3[p2] : n3[p2], writable: false });
          }
          return f(t3, e3, r3);
        } : f : function(t3, e3, r3) {
          if (s(t3), e3 = c(e3), s(r3), i)
            try {
              return f(t3, e3, r3);
            } catch (n3) {
            }
          if ("get" in r3 || "set" in r3)
            throw u("Accessors not supported");
          return "value" in r3 && (t3[e3] = r3.value), t3;
        };
      }, 1236: function(t2, e2, r2) {
        var n2 = r2(9781), o2 = r2(6916), i = r2(5296), a = r2(9114), s = r2(5656), c = r2(4948), u = r2(2597), f = r2(4664), l = Object.getOwnPropertyDescriptor;
        e2.f = n2 ? l : function(t3, e3) {
          if (t3 = s(t3), e3 = c(e3), f)
            try {
              return l(t3, e3);
            } catch (r3) {
            }
          if (u(t3, e3))
            return a(!o2(i.f, t3, e3), t3[e3]);
        };
      }, 1156: function(t2, e2, r2) {
        var n2 = r2(4326), o2 = r2(5656), i = r2(8006).f, a = r2(1589), s = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [], c = function(t3) {
          try {
            return i(t3);
          } catch (e3) {
            return a(s);
          }
        };
        t2.exports.f = function(t3) {
          return s && "Window" == n2(t3) ? c(t3) : i(o2(t3));
        };
      }, 8006: function(t2, e2, r2) {
        var n2 = r2(6324), o2 = r2(748), i = o2.concat("length", "prototype");
        e2.f = Object.getOwnPropertyNames || function(t3) {
          return n2(t3, i);
        };
      }, 5181: function(t2, e2) {
        e2.f = Object.getOwnPropertySymbols;
      }, 9518: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(2597), i = r2(614), a = r2(7908), s = r2(6200), c = r2(8544), u = s("IE_PROTO"), f = n2.Object, l = f.prototype;
        t2.exports = c ? f.getPrototypeOf : function(t3) {
          var e3 = a(t3);
          if (o2(e3, u))
            return e3[u];
          var r3 = e3.constructor;
          return i(r3) && e3 instanceof r3 ? r3.prototype : e3 instanceof f ? l : null;
        };
      }, 7976: function(t2, e2, r2) {
        var n2 = r2(1702);
        t2.exports = n2({}.isPrototypeOf);
      }, 6324: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(2597), i = r2(5656), a = r2(1318).indexOf, s = r2(3501), c = n2([].push);
        t2.exports = function(t3, e3) {
          var r3, n3 = i(t3), u = 0, f = [];
          for (r3 in n3)
            !o2(s, r3) && o2(n3, r3) && c(f, r3);
          while (e3.length > u)
            o2(n3, r3 = e3[u++]) && (~a(f, r3) || c(f, r3));
          return f;
        };
      }, 1956: function(t2, e2, r2) {
        var n2 = r2(6324), o2 = r2(748);
        t2.exports = Object.keys || function(t3) {
          return n2(t3, o2);
        };
      }, 5296: function(t2, e2) {
        var r2 = {}.propertyIsEnumerable, n2 = Object.getOwnPropertyDescriptor, o2 = n2 && !r2.call({ 1: 2 }, 1);
        e2.f = o2 ? function(t3) {
          var e3 = n2(this, t3);
          return !!e3 && e3.enumerable;
        } : r2;
      }, 7674: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(9670), i = r2(6077);
        t2.exports = Object.setPrototypeOf || ("__proto__" in {} ? function() {
          var t3, e3 = false, r3 = {};
          try {
            t3 = n2(Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set), t3(r3, []), e3 = r3 instanceof Array;
          } catch (a) {
          }
          return function(r4, n3) {
            return o2(r4), i(n3), e3 ? t3(r4, n3) : r4.__proto__ = n3, r4;
          };
        }() : void 0);
      }, 288: function(t2, e2, r2) {
        var n2 = r2(1694), o2 = r2(648);
        t2.exports = n2 ? {}.toString : function() {
          return "[object " + o2(this) + "]";
        };
      }, 2140: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(6916), i = r2(614), a = r2(111), s = n2.TypeError;
        t2.exports = function(t3, e3) {
          var r3, n3;
          if ("string" === e3 && i(r3 = t3.toString) && !a(n3 = o2(r3, t3)))
            return n3;
          if (i(r3 = t3.valueOf) && !a(n3 = o2(r3, t3)))
            return n3;
          if ("string" !== e3 && i(r3 = t3.toString) && !a(n3 = o2(r3, t3)))
            return n3;
          throw s("Can't convert object to primitive value");
        };
      }, 3887: function(t2, e2, r2) {
        var n2 = r2(5005), o2 = r2(1702), i = r2(8006), a = r2(5181), s = r2(9670), c = o2([].concat);
        t2.exports = n2("Reflect", "ownKeys") || function(t3) {
          var e3 = i.f(s(t3)), r3 = a.f;
          return r3 ? c(e3, r3(t3)) : e3;
        };
      }, 857: function(t2, e2, r2) {
        var n2 = r2(7854);
        t2.exports = n2;
      }, 2534: function(t2) {
        t2.exports = function(t3) {
          try {
            return { error: false, value: t3() };
          } catch (e2) {
            return { error: true, value: e2 };
          }
        };
      }, 9478: function(t2, e2, r2) {
        var n2 = r2(9670), o2 = r2(111), i = r2(8523);
        t2.exports = function(t3, e3) {
          if (n2(t3), o2(e3) && e3.constructor === t3)
            return e3;
          var r3 = i.f(t3), a = r3.resolve;
          return a(e3), r3.promise;
        };
      }, 8572: function(t2) {
        var e2 = function() {
          this.head = null, this.tail = null;
        };
        e2.prototype = { add: function(t3) {
          var e3 = { item: t3, next: null };
          this.head ? this.tail.next = e3 : this.head = e3, this.tail = e3;
        }, get: function() {
          var t3 = this.head;
          if (t3)
            return this.head = t3.next, this.tail === t3 && (this.tail = null), t3.item;
        } }, t2.exports = e2;
      }, 2248: function(t2, e2, r2) {
        var n2 = r2(1320);
        t2.exports = function(t3, e3, r3) {
          for (var o2 in e3)
            n2(t3, o2, e3[o2], r3);
          return t3;
        };
      }, 1320: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(614), i = r2(2597), a = r2(8880), s = r2(3505), c = r2(2788), u = r2(9909), f = r2(6530).CONFIGURABLE, l = u.get, p2 = u.enforce, d = String(String).split("String");
        (t2.exports = function(t3, e3, r3, c2) {
          var u2, l2 = !!c2 && !!c2.unsafe, h2 = !!c2 && !!c2.enumerable, v = !!c2 && !!c2.noTargetGet, m = c2 && void 0 !== c2.name ? c2.name : e3;
          o2(r3) && ("Symbol(" === String(m).slice(0, 7) && (m = "[" + String(m).replace(/^Symbol\(([^)]*)\)/, "$1") + "]"), (!i(r3, "name") || f && r3.name !== m) && a(r3, "name", m), u2 = p2(r3), u2.source || (u2.source = d.join("string" == typeof m ? m : ""))), t3 !== n2 ? (l2 ? !v && t3[e3] && (h2 = true) : delete t3[e3], h2 ? t3[e3] = r3 : a(t3, e3, r3)) : h2 ? t3[e3] = r3 : s(e3, r3);
        })(Function.prototype, "toString", function() {
          return o2(this) && l(this).source || c(this);
        });
      }, 7651: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(6916), i = r2(9670), a = r2(614), s = r2(4326), c = r2(2261), u = n2.TypeError;
        t2.exports = function(t3, e3) {
          var r3 = t3.exec;
          if (a(r3)) {
            var n3 = o2(r3, t3, e3);
            return null !== n3 && i(n3), n3;
          }
          if ("RegExp" === s(t3))
            return o2(c, t3, e3);
          throw u("RegExp#exec called on incompatible receiver");
        };
      }, 2261: function(t2, e2, r2) {
        var n2 = r2(6916), o2 = r2(1702), i = r2(1340), a = r2(7066), s = r2(2999), c = r2(2309), u = r2(30), f = r2(9909).get, l = r2(9441), p2 = r2(7168), d = c("native-string-replace", String.prototype.replace), h2 = RegExp.prototype.exec, v = h2, m = o2("".charAt), g = o2("".indexOf), y = o2("".replace), b = o2("".slice), k = function() {
          var t3 = /a/, e3 = /b*/g;
          return n2(h2, t3, "a"), n2(h2, e3, "a"), 0 !== t3.lastIndex || 0 !== e3.lastIndex;
        }(), x = s.BROKEN_CARET, w = void 0 !== /()??/.exec("")[1], S = k || w || x || l || p2;
        S && (v = function(t3) {
          var e3, r3, o3, s2, c2, l2, p3, S2 = this, _ = f(S2), E = i(t3), O = _.raw;
          if (O)
            return O.lastIndex = S2.lastIndex, e3 = n2(v, O, E), S2.lastIndex = O.lastIndex, e3;
          var C = _.groups, T = x && S2.sticky, j = n2(a, S2), P = S2.source, F = 0, N = E;
          if (T && (j = y(j, "y", ""), -1 === g(j, "g") && (j += "g"), N = b(E, S2.lastIndex), S2.lastIndex > 0 && (!S2.multiline || S2.multiline && "\n" !== m(E, S2.lastIndex - 1)) && (P = "(?: " + P + ")", N = " " + N, F++), r3 = new RegExp("^(?:" + P + ")", j)), w && (r3 = new RegExp("^" + P + "$(?!\\s)", j)), k && (o3 = S2.lastIndex), s2 = n2(h2, T ? r3 : S2, N), T ? s2 ? (s2.input = b(s2.input, F), s2[0] = b(s2[0], F), s2.index = S2.lastIndex, S2.lastIndex += s2[0].length) : S2.lastIndex = 0 : k && s2 && (S2.lastIndex = S2.global ? s2.index + s2[0].length : o3), w && s2 && s2.length > 1 && n2(d, s2[0], r3, function() {
            for (c2 = 1; c2 < arguments.length - 2; c2++)
              void 0 === arguments[c2] && (s2[c2] = void 0);
          }), s2 && C)
            for (s2.groups = l2 = u(null), c2 = 0; c2 < C.length; c2++)
              p3 = C[c2], l2[p3[0]] = s2[p3[1]];
          return s2;
        }), t2.exports = v;
      }, 7066: function(t2, e2, r2) {
        var n2 = r2(9670);
        t2.exports = function() {
          var t3 = n2(this), e3 = "";
          return t3.global && (e3 += "g"), t3.ignoreCase && (e3 += "i"), t3.multiline && (e3 += "m"), t3.dotAll && (e3 += "s"), t3.unicode && (e3 += "u"), t3.sticky && (e3 += "y"), e3;
        };
      }, 2999: function(t2, e2, r2) {
        var n2 = r2(7293), o2 = r2(7854), i = o2.RegExp, a = n2(function() {
          var t3 = i("a", "y");
          return t3.lastIndex = 2, null != t3.exec("abcd");
        }), s = a || n2(function() {
          return !i("a", "y").sticky;
        }), c = a || n2(function() {
          var t3 = i("^r", "gy");
          return t3.lastIndex = 2, null != t3.exec("str");
        });
        t2.exports = { BROKEN_CARET: c, MISSED_STICKY: s, UNSUPPORTED_Y: a };
      }, 9441: function(t2, e2, r2) {
        var n2 = r2(7293), o2 = r2(7854), i = o2.RegExp;
        t2.exports = n2(function() {
          var t3 = i(".", "s");
          return !(t3.dotAll && t3.exec("\n") && "s" === t3.flags);
        });
      }, 7168: function(t2, e2, r2) {
        var n2 = r2(7293), o2 = r2(7854), i = o2.RegExp;
        t2.exports = n2(function() {
          var t3 = i("(?<a>b)", "g");
          return "b" !== t3.exec("b").groups.a || "bc" !== "b".replace(t3, "$<a>c");
        });
      }, 4488: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = n2.TypeError;
        t2.exports = function(t3) {
          if (void 0 == t3)
            throw o2("Can't call method on " + t3);
          return t3;
        };
      }, 3505: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = Object.defineProperty;
        t2.exports = function(t3, e3) {
          try {
            o2(n2, t3, { value: e3, configurable: true, writable: true });
          } catch (r3) {
            n2[t3] = e3;
          }
          return e3;
        };
      }, 6340: function(t2, e2, r2) {
        var n2 = r2(5005), o2 = r2(3070), i = r2(5112), a = r2(9781), s = i("species");
        t2.exports = function(t3) {
          var e3 = n2(t3), r3 = o2.f;
          a && e3 && !e3[s] && r3(e3, s, { configurable: true, get: function() {
            return this;
          } });
        };
      }, 8003: function(t2, e2, r2) {
        var n2 = r2(3070).f, o2 = r2(2597), i = r2(5112), a = i("toStringTag");
        t2.exports = function(t3, e3, r3) {
          t3 && !r3 && (t3 = t3.prototype), t3 && !o2(t3, a) && n2(t3, a, { configurable: true, value: e3 });
        };
      }, 6200: function(t2, e2, r2) {
        var n2 = r2(2309), o2 = r2(9711), i = n2("keys");
        t2.exports = function(t3) {
          return i[t3] || (i[t3] = o2(t3));
        };
      }, 5465: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(3505), i = "__core-js_shared__", a = n2[i] || o2(i, {});
        t2.exports = a;
      }, 2309: function(t2, e2, r2) {
        var n2 = r2(1913), o2 = r2(5465);
        (t2.exports = function(t3, e3) {
          return o2[t3] || (o2[t3] = void 0 !== e3 ? e3 : {});
        })("versions", []).push({ version: "3.21.1", mode: n2 ? "pure" : "global", copyright: "\xA9 2014-2022 Denis Pushkarev (zloirock.ru)", license: "https://github.com/zloirock/core-js/blob/v3.21.1/LICENSE", source: "https://github.com/zloirock/core-js" });
      }, 6707: function(t2, e2, r2) {
        var n2 = r2(9670), o2 = r2(9483), i = r2(5112), a = i("species");
        t2.exports = function(t3, e3) {
          var r3, i2 = n2(t3).constructor;
          return void 0 === i2 || void 0 == (r3 = n2(i2)[a]) ? e3 : o2(r3);
        };
      }, 8710: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(9303), i = r2(1340), a = r2(4488), s = n2("".charAt), c = n2("".charCodeAt), u = n2("".slice), f = function(t3) {
          return function(e3, r3) {
            var n3, f2, l = i(a(e3)), p2 = o2(r3), d = l.length;
            return p2 < 0 || p2 >= d ? t3 ? "" : void 0 : (n3 = c(l, p2), n3 < 55296 || n3 > 56319 || p2 + 1 === d || (f2 = c(l, p2 + 1)) < 56320 || f2 > 57343 ? t3 ? s(l, p2) : n3 : t3 ? u(l, p2, p2 + 2) : f2 - 56320 + (n3 - 55296 << 10) + 65536);
          };
        };
        t2.exports = { codeAt: f(false), charAt: f(true) };
      }, 8415: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(9303), i = r2(1340), a = r2(4488), s = n2.RangeError;
        t2.exports = function(t3) {
          var e3 = i(a(this)), r3 = "", n3 = o2(t3);
          if (n3 < 0 || n3 == 1 / 0)
            throw s("Wrong number of repetitions");
          for (; n3 > 0; (n3 >>>= 1) && (e3 += e3))
            1 & n3 && (r3 += e3);
          return r3;
        };
      }, 6091: function(t2, e2, r2) {
        var n2 = r2(6530).PROPER, o2 = r2(7293), i = r2(1361), a = "\u200B\x85\u180E";
        t2.exports = function(t3) {
          return o2(function() {
            return !!i[t3]() || a[t3]() !== a || n2 && i[t3].name !== t3;
          });
        };
      }, 3111: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(4488), i = r2(1340), a = r2(1361), s = n2("".replace), c = "[" + a + "]", u = RegExp("^" + c + c + "*"), f = RegExp(c + c + "*$"), l = function(t3) {
          return function(e3) {
            var r3 = i(o2(e3));
            return 1 & t3 && (r3 = s(r3, u, "")), 2 & t3 && (r3 = s(r3, f, "")), r3;
          };
        };
        t2.exports = { start: l(1), end: l(2), trim: l(3) };
      }, 261: function(t2, e2, r2) {
        var n2, o2, i, a, s = r2(7854), c = r2(2104), u = r2(9974), f = r2(614), l = r2(2597), p2 = r2(7293), d = r2(490), h2 = r2(206), v = r2(317), m = r2(8053), g = r2(6833), y = r2(5268), b = s.setImmediate, k = s.clearImmediate, x = s.process, w = s.Dispatch, S = s.Function, _ = s.MessageChannel, E = s.String, O = 0, C = {}, T = "onreadystatechange";
        try {
          n2 = s.location;
        } catch (I) {
        }
        var j = function(t3) {
          if (l(C, t3)) {
            var e3 = C[t3];
            delete C[t3], e3();
          }
        }, P = function(t3) {
          return function() {
            j(t3);
          };
        }, F = function(t3) {
          j(t3.data);
        }, N = function(t3) {
          s.postMessage(E(t3), n2.protocol + "//" + n2.host);
        };
        b && k || (b = function(t3) {
          m(arguments.length, 1);
          var e3 = f(t3) ? t3 : S(t3), r3 = h2(arguments, 1);
          return C[++O] = function() {
            c(e3, void 0, r3);
          }, o2(O), O;
        }, k = function(t3) {
          delete C[t3];
        }, y ? o2 = function(t3) {
          x.nextTick(P(t3));
        } : w && w.now ? o2 = function(t3) {
          w.now(P(t3));
        } : _ && !g ? (i = new _(), a = i.port2, i.port1.onmessage = F, o2 = u(a.postMessage, a)) : s.addEventListener && f(s.postMessage) && !s.importScripts && n2 && "file:" !== n2.protocol && !p2(N) ? (o2 = N, s.addEventListener("message", F, false)) : o2 = T in v("script") ? function(t3) {
          d.appendChild(v("script"))[T] = function() {
            d.removeChild(this), j(t3);
          };
        } : function(t3) {
          setTimeout(P(t3), 0);
        }), t2.exports = { set: b, clear: k };
      }, 863: function(t2, e2, r2) {
        var n2 = r2(1702);
        t2.exports = n2(1 .valueOf);
      }, 1400: function(t2, e2, r2) {
        var n2 = r2(9303), o2 = Math.max, i = Math.min;
        t2.exports = function(t3, e3) {
          var r3 = n2(t3);
          return r3 < 0 ? o2(r3 + e3, 0) : i(r3, e3);
        };
      }, 5656: function(t2, e2, r2) {
        var n2 = r2(8361), o2 = r2(4488);
        t2.exports = function(t3) {
          return n2(o2(t3));
        };
      }, 9303: function(t2) {
        var e2 = Math.ceil, r2 = Math.floor;
        t2.exports = function(t3) {
          var n2 = +t3;
          return n2 !== n2 || 0 === n2 ? 0 : (n2 > 0 ? r2 : e2)(n2);
        };
      }, 7466: function(t2, e2, r2) {
        var n2 = r2(9303), o2 = Math.min;
        t2.exports = function(t3) {
          return t3 > 0 ? o2(n2(t3), 9007199254740991) : 0;
        };
      }, 7908: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(4488), i = n2.Object;
        t2.exports = function(t3) {
          return i(o2(t3));
        };
      }, 7593: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(6916), i = r2(111), a = r2(2190), s = r2(8173), c = r2(2140), u = r2(5112), f = n2.TypeError, l = u("toPrimitive");
        t2.exports = function(t3, e3) {
          if (!i(t3) || a(t3))
            return t3;
          var r3, n3 = s(t3, l);
          if (n3) {
            if (void 0 === e3 && (e3 = "default"), r3 = o2(n3, t3, e3), !i(r3) || a(r3))
              return r3;
            throw f("Can't convert object to primitive value");
          }
          return void 0 === e3 && (e3 = "number"), c(t3, e3);
        };
      }, 4948: function(t2, e2, r2) {
        var n2 = r2(7593), o2 = r2(2190);
        t2.exports = function(t3) {
          var e3 = n2(t3, "string");
          return o2(e3) ? e3 : e3 + "";
        };
      }, 1694: function(t2, e2, r2) {
        var n2 = r2(5112), o2 = n2("toStringTag"), i = {};
        i[o2] = "z", t2.exports = "[object z]" === String(i);
      }, 1340: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(648), i = n2.String;
        t2.exports = function(t3) {
          if ("Symbol" === o2(t3))
            throw TypeError("Cannot convert a Symbol value to a string");
          return i(t3);
        };
      }, 6330: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = n2.String;
        t2.exports = function(t3) {
          try {
            return o2(t3);
          } catch (e3) {
            return "Object";
          }
        };
      }, 9711: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = 0, i = Math.random(), a = n2(1 .toString);
        t2.exports = function(t3) {
          return "Symbol(" + (void 0 === t3 ? "" : t3) + ")_" + a(++o2 + i, 36);
        };
      }, 3307: function(t2, e2, r2) {
        var n2 = r2(133);
        t2.exports = n2 && !Symbol.sham && "symbol" == typeof Symbol.iterator;
      }, 3353: function(t2, e2, r2) {
        var n2 = r2(9781), o2 = r2(7293);
        t2.exports = n2 && o2(function() {
          return 42 != Object.defineProperty(function() {
          }, "prototype", { value: 42, writable: false }).prototype;
        });
      }, 8053: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = n2.TypeError;
        t2.exports = function(t3, e3) {
          if (t3 < e3)
            throw o2("Not enough arguments");
          return t3;
        };
      }, 6061: function(t2, e2, r2) {
        var n2 = r2(5112);
        e2.f = n2;
      }, 5112: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(2309), i = r2(2597), a = r2(9711), s = r2(133), c = r2(3307), u = o2("wks"), f = n2.Symbol, l = f && f["for"], p2 = c ? f : f && f.withoutSetter || a;
        t2.exports = function(t3) {
          if (!i(u, t3) || !s && "string" != typeof u[t3]) {
            var e3 = "Symbol." + t3;
            s && i(f, t3) ? u[t3] = f[t3] : u[t3] = c && l ? l(e3) : p2(e3);
          }
          return u[t3];
        };
      }, 1361: function(t2) {
        t2.exports = "	\n\v\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
      }, 9191: function(t2, e2, r2) {
        var n2 = r2(5005), o2 = r2(2597), i = r2(8880), a = r2(7976), s = r2(7674), c = r2(9920), u = r2(9587), f = r2(6277), l = r2(8340), p2 = r2(7741), d = r2(2914), h2 = r2(1913);
        t2.exports = function(t3, e3, r3, v) {
          var m = v ? 2 : 1, g = t3.split("."), y = g[g.length - 1], b = n2.apply(null, g);
          if (b) {
            var k = b.prototype;
            if (!h2 && o2(k, "cause") && delete k.cause, !r3)
              return b;
            var x = n2("Error"), w = e3(function(t4, e4) {
              var r4 = f(v ? e4 : t4, void 0), n3 = v ? new b(t4) : new b();
              return void 0 !== r4 && i(n3, "message", r4), d && i(n3, "stack", p2(n3.stack, 2)), this && a(k, this) && u(n3, this, w), arguments.length > m && l(n3, arguments[m]), n3;
            });
            if (w.prototype = k, "Error" !== y && (s ? s(w, x) : c(w, x, { name: true })), c(w, b), !h2)
              try {
                k.name !== y && i(k, "name", y), k.constructor = w;
              } catch (S) {
              }
            return w;
          }
        };
      }, 2222: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(7854), i = r2(7293), a = r2(3157), s = r2(111), c = r2(7908), u = r2(6244), f = r2(6135), l = r2(5417), p2 = r2(1194), d = r2(5112), h2 = r2(7392), v = d("isConcatSpreadable"), m = 9007199254740991, g = "Maximum allowed index exceeded", y = o2.TypeError, b = h2 >= 51 || !i(function() {
          var t3 = [];
          return t3[v] = false, t3.concat()[0] !== t3;
        }), k = p2("concat"), x = function(t3) {
          if (!s(t3))
            return false;
          var e3 = t3[v];
          return void 0 !== e3 ? !!e3 : a(t3);
        }, w = !b || !k;
        n2({ target: "Array", proto: true, forced: w }, { concat: function(t3) {
          var e3, r3, n3, o3, i2, a2 = c(this), s2 = l(a2, 0), p3 = 0;
          for (e3 = -1, n3 = arguments.length; e3 < n3; e3++)
            if (i2 = -1 === e3 ? a2 : arguments[e3], x(i2)) {
              if (o3 = u(i2), p3 + o3 > m)
                throw y(g);
              for (r3 = 0; r3 < o3; r3++, p3++)
                r3 in i2 && f(s2, p3, i2[r3]);
            } else {
              if (p3 >= m)
                throw y(g);
              f(s2, p3++, i2);
            }
          return s2.length = p3, s2;
        } });
      }, 3290: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(1285), i = r2(1223);
        n2({ target: "Array", proto: true }, { fill: o2 }), i("fill");
      }, 7327: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(2092).filter, i = r2(1194), a = i("filter");
        n2({ target: "Array", proto: true, forced: !a }, { filter: function(t3) {
          return o2(this, t3, arguments.length > 1 ? arguments[1] : void 0);
        } });
      }, 1038: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(8457), i = r2(7072), a = !i(function(t3) {
          Array.from(t3);
        });
        n2({ target: "Array", stat: true, forced: a }, { from: o2 });
      }, 6699: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(1318).includes, i = r2(1223);
        n2({ target: "Array", proto: true }, { includes: function(t3) {
          return o2(this, t3, arguments.length > 1 ? arguments[1] : void 0);
        } }), i("includes");
      }, 6992: function(t2, e2, r2) {
        var n2 = r2(5656), o2 = r2(1223), i = r2(7497), a = r2(9909), s = r2(3070).f, c = r2(654), u = r2(1913), f = r2(9781), l = "Array Iterator", p2 = a.set, d = a.getterFor(l);
        t2.exports = c(Array, "Array", function(t3, e3) {
          p2(this, { type: l, target: n2(t3), index: 0, kind: e3 });
        }, function() {
          var t3 = d(this), e3 = t3.target, r3 = t3.kind, n3 = t3.index++;
          return !e3 || n3 >= e3.length ? (t3.target = void 0, { value: void 0, done: true }) : "keys" == r3 ? { value: n3, done: false } : "values" == r3 ? { value: e3[n3], done: false } : { value: [n3, e3[n3]], done: false };
        }, "values");
        var h2 = i.Arguments = i.Array;
        if (o2("keys"), o2("values"), o2("entries"), !u && f && "values" !== h2.name)
          try {
            s(h2, "name", { value: "values" });
          } catch (v) {
          }
      }, 9600: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(1702), i = r2(8361), a = r2(5656), s = r2(9341), c = o2([].join), u = i != Object, f = s("join", ",");
        n2({ target: "Array", proto: true, forced: u || !f }, { join: function(t3) {
          return c(a(this), void 0 === t3 ? "," : t3);
        } });
      }, 1249: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(2092).map, i = r2(1194), a = i("map");
        n2({ target: "Array", proto: true, forced: !a }, { map: function(t3) {
          return o2(this, t3, arguments.length > 1 ? arguments[1] : void 0);
        } });
      }, 7042: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(7854), i = r2(3157), a = r2(4411), s = r2(111), c = r2(1400), u = r2(6244), f = r2(5656), l = r2(6135), p2 = r2(5112), d = r2(1194), h2 = r2(206), v = d("slice"), m = p2("species"), g = o2.Array, y = Math.max;
        n2({ target: "Array", proto: true, forced: !v }, { slice: function(t3, e3) {
          var r3, n3, o3, p3 = f(this), d2 = u(p3), v2 = c(t3, d2), b = c(void 0 === e3 ? d2 : e3, d2);
          if (i(p3) && (r3 = p3.constructor, a(r3) && (r3 === g || i(r3.prototype)) ? r3 = void 0 : s(r3) && (r3 = r3[m], null === r3 && (r3 = void 0)), r3 === g || void 0 === r3))
            return h2(p3, v2, b);
          for (n3 = new (void 0 === r3 ? g : r3)(y(b - v2, 0)), o3 = 0; v2 < b; v2++, o3++)
            v2 in p3 && l(n3, o3, p3[v2]);
          return n3.length = o3, n3;
        } });
      }, 1703: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(7854), i = r2(2104), a = r2(9191), s = "WebAssembly", c = o2[s], u = 7 !== Error("e", { cause: 7 }).cause, f = function(t3, e3) {
          var r3 = {};
          r3[t3] = a(t3, e3, u), n2({ global: true, forced: u }, r3);
        }, l = function(t3, e3) {
          if (c && c[t3]) {
            var r3 = {};
            r3[t3] = a(s + "." + t3, e3, u), n2({ target: s, stat: true, forced: u }, r3);
          }
        };
        f("Error", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), f("EvalError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), f("RangeError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), f("ReferenceError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), f("SyntaxError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), f("TypeError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), f("URIError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), l("CompileError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), l("LinkError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        }), l("RuntimeError", function(t3) {
          return function(e3) {
            return i(t3, this, arguments);
          };
        });
      }, 8309: function(t2, e2, r2) {
        var n2 = r2(9781), o2 = r2(6530).EXISTS, i = r2(1702), a = r2(3070).f, s = Function.prototype, c = i(s.toString), u = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/, f = i(u.exec), l = "name";
        n2 && !o2 && a(s, l, { configurable: true, get: function() {
          try {
            return f(u, c(this))[1];
          } catch (t3) {
            return "";
          }
        } });
      }, 9653: function(t2, e2, r2) {
        var n2 = r2(9781), o2 = r2(7854), i = r2(1702), a = r2(4705), s = r2(1320), c = r2(2597), u = r2(9587), f = r2(7976), l = r2(2190), p2 = r2(7593), d = r2(7293), h2 = r2(8006).f, v = r2(1236).f, m = r2(3070).f, g = r2(863), y = r2(3111).trim, b = "Number", k = o2[b], x = k.prototype, w = o2.TypeError, S = i("".slice), _ = i("".charCodeAt), E = function(t3) {
          var e3 = p2(t3, "number");
          return "bigint" == typeof e3 ? e3 : O(e3);
        }, O = function(t3) {
          var e3, r3, n3, o3, i2, a2, s2, c2, u2 = p2(t3, "number");
          if (l(u2))
            throw w("Cannot convert a Symbol value to a number");
          if ("string" == typeof u2 && u2.length > 2) {
            if (u2 = y(u2), e3 = _(u2, 0), 43 === e3 || 45 === e3) {
              if (r3 = _(u2, 2), 88 === r3 || 120 === r3)
                return NaN;
            } else if (48 === e3) {
              switch (_(u2, 1)) {
                case 66:
                case 98:
                  n3 = 2, o3 = 49;
                  break;
                case 79:
                case 111:
                  n3 = 8, o3 = 55;
                  break;
                default:
                  return +u2;
              }
              for (i2 = S(u2, 2), a2 = i2.length, s2 = 0; s2 < a2; s2++)
                if (c2 = _(i2, s2), c2 < 48 || c2 > o3)
                  return NaN;
              return parseInt(i2, n3);
            }
          }
          return +u2;
        };
        if (a(b, !k(" 0o1") || !k("0b1") || k("+0x1"))) {
          for (var C, T = function(t3) {
            var e3 = arguments.length < 1 ? 0 : k(E(t3)), r3 = this;
            return f(x, r3) && d(function() {
              g(r3);
            }) ? u(Object(e3), r3, T) : e3;
          }, j = n2 ? h2(k) : "MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,fromString,range".split(","), P = 0; j.length > P; P++)
            c(k, C = j[P]) && !c(T, C) && m(T, C, v(k, C));
          T.prototype = x, x.constructor = T, s(o2, b, T);
        }
      }, 4048: function(t2, e2, r2) {
        var n2 = r2(2109);
        n2({ target: "Number", stat: true }, { isNaN: function(t3) {
          return t3 != t3;
        } });
      }, 6977: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(7854), i = r2(1702), a = r2(9303), s = r2(863), c = r2(8415), u = r2(7293), f = o2.RangeError, l = o2.String, p2 = Math.floor, d = i(c), h2 = i("".slice), v = i(1 .toFixed), m = function(t3, e3, r3) {
          return 0 === e3 ? r3 : e3 % 2 === 1 ? m(t3, e3 - 1, r3 * t3) : m(t3 * t3, e3 / 2, r3);
        }, g = function(t3) {
          var e3 = 0, r3 = t3;
          while (r3 >= 4096)
            e3 += 12, r3 /= 4096;
          while (r3 >= 2)
            e3 += 1, r3 /= 2;
          return e3;
        }, y = function(t3, e3, r3) {
          var n3 = -1, o3 = r3;
          while (++n3 < 6)
            o3 += e3 * t3[n3], t3[n3] = o3 % 1e7, o3 = p2(o3 / 1e7);
        }, b = function(t3, e3) {
          var r3 = 6, n3 = 0;
          while (--r3 >= 0)
            n3 += t3[r3], t3[r3] = p2(n3 / e3), n3 = n3 % e3 * 1e7;
        }, k = function(t3) {
          var e3 = 6, r3 = "";
          while (--e3 >= 0)
            if ("" !== r3 || 0 === e3 || 0 !== t3[e3]) {
              var n3 = l(t3[e3]);
              r3 = "" === r3 ? n3 : r3 + d("0", 7 - n3.length) + n3;
            }
          return r3;
        }, x = u(function() {
          return "0.000" !== v(8e-5, 3) || "1" !== v(0.9, 0) || "1.25" !== v(1.255, 2) || "1000000000000000128" !== v(1000000000000000100, 0);
        }) || !u(function() {
          v({});
        });
        n2({ target: "Number", proto: true, forced: x }, { toFixed: function(t3) {
          var e3, r3, n3, o3, i2 = s(this), c2 = a(t3), u2 = [0, 0, 0, 0, 0, 0], p3 = "", v2 = "0";
          if (c2 < 0 || c2 > 20)
            throw f("Incorrect fraction digits");
          if (i2 != i2)
            return "NaN";
          if (i2 <= -1e21 || i2 >= 1e21)
            return l(i2);
          if (i2 < 0 && (p3 = "-", i2 = -i2), i2 > 1e-21)
            if (e3 = g(i2 * m(2, 69, 1)) - 69, r3 = e3 < 0 ? i2 * m(2, -e3, 1) : i2 / m(2, e3, 1), r3 *= 4503599627370496, e3 = 52 - e3, e3 > 0) {
              y(u2, 0, r3), n3 = c2;
              while (n3 >= 7)
                y(u2, 1e7, 0), n3 -= 7;
              y(u2, m(10, n3, 1), 0), n3 = e3 - 1;
              while (n3 >= 23)
                b(u2, 1 << 23), n3 -= 23;
              b(u2, 1 << n3), y(u2, 1, 1), b(u2, 2), v2 = k(u2);
            } else
              y(u2, 0, r3), y(u2, 1 << -e3, 0), v2 = k(u2) + d("0", c2);
          return c2 > 0 ? (o3 = v2.length, v2 = p3 + (o3 <= c2 ? "0." + d("0", c2 - o3) + v2 : h2(v2, 0, o3 - c2) + "." + h2(v2, o3 - c2))) : v2 = p3 + v2, v2;
        } });
      }, 5003: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(7293), i = r2(5656), a = r2(1236).f, s = r2(9781), c = o2(function() {
          a(1);
        }), u = !s || c;
        n2({ target: "Object", stat: true, forced: u, sham: !s }, { getOwnPropertyDescriptor: function(t3, e3) {
          return a(i(t3), e3);
        } });
      }, 9337: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(9781), i = r2(3887), a = r2(5656), s = r2(1236), c = r2(6135);
        n2({ target: "Object", stat: true, sham: !o2 }, { getOwnPropertyDescriptors: function(t3) {
          var e3, r3, n3 = a(t3), o3 = s.f, u = i(n3), f = {}, l = 0;
          while (u.length > l)
            r3 = o3(n3, e3 = u[l++]), void 0 !== r3 && c(f, e3, r3);
          return f;
        } });
      }, 7941: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(7908), i = r2(1956), a = r2(7293), s = a(function() {
          i(1);
        });
        n2({ target: "Object", stat: true, forced: s }, { keys: function(t3) {
          return i(o2(t3));
        } });
      }, 1539: function(t2, e2, r2) {
        var n2 = r2(1694), o2 = r2(1320), i = r2(288);
        n2 || o2(Object.prototype, "toString", i, { unsafe: true });
      }, 8674: function(t2, e2, r2) {
        var n2, o2, i, a, s = r2(2109), c = r2(1913), u = r2(7854), f = r2(5005), l = r2(6916), p2 = r2(3366), d = r2(1320), h2 = r2(2248), v = r2(7674), m = r2(8003), g = r2(6340), y = r2(9662), b = r2(614), k = r2(111), x = r2(5787), w = r2(2788), S = r2(408), _ = r2(7072), E = r2(6707), O = r2(261).set, C = r2(5948), T = r2(9478), j = r2(842), P = r2(8523), F = r2(2534), N = r2(8572), I = r2(9909), A = r2(4705), D = r2(5112), L = r2(7871), M = r2(5268), R = r2(7392), z = D("species"), B = "Promise", V = I.getterFor(B), G = I.set, q = I.getterFor(B), $ = p2 && p2.prototype, H = p2, U = $, Z = u.TypeError, W = u.document, Y = u.process, X = P.f, K = X, J = !!(W && W.createEvent && u.dispatchEvent), Q = b(u.PromiseRejectionEvent), tt = "unhandledrejection", et = "rejectionhandled", rt = 0, nt = 1, ot = 2, it = 1, at = 2, st = false, ct = A(B, function() {
          var t3 = w(H), e3 = t3 !== String(H);
          if (!e3 && 66 === R)
            return true;
          if (c && !U["finally"])
            return true;
          if (R >= 51 && /native code/.test(t3))
            return false;
          var r3 = new H(function(t4) {
            t4(1);
          }), n3 = function(t4) {
            t4(function() {
            }, function() {
            });
          }, o3 = r3.constructor = {};
          return o3[z] = n3, st = r3.then(function() {
          }) instanceof n3, !st || !e3 && L && !Q;
        }), ut = ct || !_(function(t3) {
          H.all(t3)["catch"](function() {
          });
        }), ft = function(t3) {
          var e3;
          return !(!k(t3) || !b(e3 = t3.then)) && e3;
        }, lt = function(t3, e3) {
          var r3, n3, o3, i2 = e3.value, a2 = e3.state == nt, s2 = a2 ? t3.ok : t3.fail, c2 = t3.resolve, u2 = t3.reject, f2 = t3.domain;
          try {
            s2 ? (a2 || (e3.rejection === at && mt(e3), e3.rejection = it), true === s2 ? r3 = i2 : (f2 && f2.enter(), r3 = s2(i2), f2 && (f2.exit(), o3 = true)), r3 === t3.promise ? u2(Z("Promise-chain cycle")) : (n3 = ft(r3)) ? l(n3, r3, c2, u2) : c2(r3)) : u2(i2);
          } catch (p3) {
            f2 && !o3 && f2.exit(), u2(p3);
          }
        }, pt = function(t3, e3) {
          t3.notified || (t3.notified = true, C(function() {
            var r3, n3 = t3.reactions;
            while (r3 = n3.get())
              lt(r3, t3);
            t3.notified = false, e3 && !t3.rejection && ht(t3);
          }));
        }, dt = function(t3, e3, r3) {
          var n3, o3;
          J ? (n3 = W.createEvent("Event"), n3.promise = e3, n3.reason = r3, n3.initEvent(t3, false, true), u.dispatchEvent(n3)) : n3 = { promise: e3, reason: r3 }, !Q && (o3 = u["on" + t3]) ? o3(n3) : t3 === tt && j("Unhandled promise rejection", r3);
        }, ht = function(t3) {
          l(O, u, function() {
            var e3, r3 = t3.facade, n3 = t3.value, o3 = vt(t3);
            if (o3 && (e3 = F(function() {
              M ? Y.emit("unhandledRejection", n3, r3) : dt(tt, r3, n3);
            }), t3.rejection = M || vt(t3) ? at : it, e3.error))
              throw e3.value;
          });
        }, vt = function(t3) {
          return t3.rejection !== it && !t3.parent;
        }, mt = function(t3) {
          l(O, u, function() {
            var e3 = t3.facade;
            M ? Y.emit("rejectionHandled", e3) : dt(et, e3, t3.value);
          });
        }, gt = function(t3, e3, r3) {
          return function(n3) {
            t3(e3, n3, r3);
          };
        }, yt = function(t3, e3, r3) {
          t3.done || (t3.done = true, r3 && (t3 = r3), t3.value = e3, t3.state = ot, pt(t3, true));
        }, bt = function(t3, e3, r3) {
          if (!t3.done) {
            t3.done = true, r3 && (t3 = r3);
            try {
              if (t3.facade === e3)
                throw Z("Promise can't be resolved itself");
              var n3 = ft(e3);
              n3 ? C(function() {
                var r4 = { done: false };
                try {
                  l(n3, e3, gt(bt, r4, t3), gt(yt, r4, t3));
                } catch (o3) {
                  yt(r4, o3, t3);
                }
              }) : (t3.value = e3, t3.state = nt, pt(t3, false));
            } catch (o3) {
              yt({ done: false }, o3, t3);
            }
          }
        };
        if (ct && (H = function(t3) {
          x(this, U), y(t3), l(n2, this);
          var e3 = V(this);
          try {
            t3(gt(bt, e3), gt(yt, e3));
          } catch (r3) {
            yt(e3, r3);
          }
        }, U = H.prototype, n2 = function(t3) {
          G(this, { type: B, done: false, notified: false, parent: false, reactions: new N(), rejection: false, state: rt, value: void 0 });
        }, n2.prototype = h2(U, { then: function(t3, e3) {
          var r3 = q(this), n3 = X(E(this, H));
          return r3.parent = true, n3.ok = !b(t3) || t3, n3.fail = b(e3) && e3, n3.domain = M ? Y.domain : void 0, r3.state == rt ? r3.reactions.add(n3) : C(function() {
            lt(n3, r3);
          }), n3.promise;
        }, catch: function(t3) {
          return this.then(void 0, t3);
        } }), o2 = function() {
          var t3 = new n2(), e3 = V(t3);
          this.promise = t3, this.resolve = gt(bt, e3), this.reject = gt(yt, e3);
        }, P.f = X = function(t3) {
          return t3 === H || t3 === i ? new o2(t3) : K(t3);
        }, !c && b(p2) && $ !== Object.prototype)) {
          a = $.then, st || (d($, "then", function(t3, e3) {
            var r3 = this;
            return new H(function(t4, e4) {
              l(a, r3, t4, e4);
            }).then(t3, e3);
          }, { unsafe: true }), d($, "catch", U["catch"], { unsafe: true }));
          try {
            delete $.constructor;
          } catch (kt) {
          }
          v && v($, U);
        }
        s({ global: true, wrap: true, forced: ct }, { Promise: H }), m(H, B, false, true), g(B), i = f(B), s({ target: B, stat: true, forced: ct }, { reject: function(t3) {
          var e3 = X(this);
          return l(e3.reject, void 0, t3), e3.promise;
        } }), s({ target: B, stat: true, forced: c || ct }, { resolve: function(t3) {
          return T(c && this === i ? H : this, t3);
        } }), s({ target: B, stat: true, forced: ut }, { all: function(t3) {
          var e3 = this, r3 = X(e3), n3 = r3.resolve, o3 = r3.reject, i2 = F(function() {
            var r4 = y(e3.resolve), i3 = [], a2 = 0, s2 = 1;
            S(t3, function(t4) {
              var c2 = a2++, u2 = false;
              s2++, l(r4, e3, t4).then(function(t5) {
                u2 || (u2 = true, i3[c2] = t5, --s2 || n3(i3));
              }, o3);
            }), --s2 || n3(i3);
          });
          return i2.error && o3(i2.value), r3.promise;
        }, race: function(t3) {
          var e3 = this, r3 = X(e3), n3 = r3.reject, o3 = F(function() {
            var o4 = y(e3.resolve);
            S(t3, function(t4) {
              l(o4, e3, t4).then(r3.resolve, n3);
            });
          });
          return o3.error && n3(o3.value), r3.promise;
        } });
      }, 4916: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(2261);
        n2({ target: "RegExp", proto: true, forced: /./.exec !== o2 }, { exec: o2 });
      }, 7601: function(t2, e2, r2) {
        r2(4916);
        var n2 = r2(2109), o2 = r2(7854), i = r2(6916), a = r2(1702), s = r2(614), c = r2(111), u = function() {
          var t3 = false, e3 = /[ac]/;
          return e3.exec = function() {
            return t3 = true, /./.exec.apply(this, arguments);
          }, true === e3.test("abc") && t3;
        }(), f = o2.Error, l = a(/./.test);
        n2({ target: "RegExp", proto: true, forced: !u }, { test: function(t3) {
          var e3 = this.exec;
          if (!s(e3))
            return l(this, t3);
          var r3 = i(e3, this, t3);
          if (null !== r3 && !c(r3))
            throw new f("RegExp exec method returned something other than an Object or null");
          return !!r3;
        } });
      }, 9714: function(t2, e2, r2) {
        var n2 = r2(1702), o2 = r2(6530).PROPER, i = r2(1320), a = r2(9670), s = r2(7976), c = r2(1340), u = r2(7293), f = r2(7066), l = "toString", p2 = RegExp.prototype, d = p2[l], h2 = n2(f), v = u(function() {
          return "/a/b" != d.call({ source: "a", flags: "b" });
        }), m = o2 && d.name != l;
        (v || m) && i(RegExp.prototype, l, function() {
          var t3 = a(this), e3 = c(t3.source), r3 = t3.flags, n3 = c(void 0 === r3 && s(p2, t3) && !("flags" in p2) ? h2(t3) : r3);
          return "/" + e3 + "/" + n3;
        }, { unsafe: true });
      }, 2023: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(1702), i = r2(3929), a = r2(4488), s = r2(1340), c = r2(4964), u = o2("".indexOf);
        n2({ target: "String", proto: true, forced: !c("includes") }, { includes: function(t3) {
          return !!~u(s(a(this)), s(i(t3)), arguments.length > 1 ? arguments[1] : void 0);
        } });
      }, 8783: function(t2, e2, r2) {
        var n2 = r2(8710).charAt, o2 = r2(1340), i = r2(9909), a = r2(654), s = "String Iterator", c = i.set, u = i.getterFor(s);
        a(String, "String", function(t3) {
          c(this, { type: s, string: o2(t3), index: 0 });
        }, function() {
          var t3, e3 = u(this), r3 = e3.string, o3 = e3.index;
          return o3 >= r3.length ? { value: void 0, done: true } : (t3 = n2(r3, o3), e3.index += t3.length, { value: t3, done: false });
        });
      }, 5306: function(t2, e2, r2) {
        var n2 = r2(2104), o2 = r2(6916), i = r2(1702), a = r2(7007), s = r2(7293), c = r2(9670), u = r2(614), f = r2(9303), l = r2(7466), p2 = r2(1340), d = r2(4488), h2 = r2(1530), v = r2(8173), m = r2(647), g = r2(7651), y = r2(5112), b = y("replace"), k = Math.max, x = Math.min, w = i([].concat), S = i([].push), _ = i("".indexOf), E = i("".slice), O = function(t3) {
          return void 0 === t3 ? t3 : String(t3);
        }, C = function() {
          return "$0" === "a".replace(/./, "$0");
        }(), T = function() {
          return !!/./[b] && "" === /./[b]("a", "$0");
        }(), j = !s(function() {
          var t3 = /./;
          return t3.exec = function() {
            var t4 = [];
            return t4.groups = { a: "7" }, t4;
          }, "7" !== "".replace(t3, "$<a>");
        });
        a("replace", function(t3, e3, r3) {
          var i2 = T ? "$" : "$0";
          return [function(t4, r4) {
            var n3 = d(this), i3 = void 0 == t4 ? void 0 : v(t4, b);
            return i3 ? o2(i3, t4, n3, r4) : o2(e3, p2(n3), t4, r4);
          }, function(t4, o3) {
            var a2 = c(this), s2 = p2(t4);
            if ("string" == typeof o3 && -1 === _(o3, i2) && -1 === _(o3, "$<")) {
              var d2 = r3(e3, a2, s2, o3);
              if (d2.done)
                return d2.value;
            }
            var v2 = u(o3);
            v2 || (o3 = p2(o3));
            var y2 = a2.global;
            if (y2) {
              var b2 = a2.unicode;
              a2.lastIndex = 0;
            }
            var C2 = [];
            while (1) {
              var T2 = g(a2, s2);
              if (null === T2)
                break;
              if (S(C2, T2), !y2)
                break;
              var j2 = p2(T2[0]);
              "" === j2 && (a2.lastIndex = h2(s2, l(a2.lastIndex), b2));
            }
            for (var P = "", F = 0, N = 0; N < C2.length; N++) {
              T2 = C2[N];
              for (var I = p2(T2[0]), A = k(x(f(T2.index), s2.length), 0), D = [], L = 1; L < T2.length; L++)
                S(D, O(T2[L]));
              var M = T2.groups;
              if (v2) {
                var R = w([I], D, A, s2);
                void 0 !== M && S(R, M);
                var z = p2(n2(o3, void 0, R));
              } else
                z = m(I, s2, A, D, M, o3);
              A >= F && (P += E(s2, F, A) + z, F = A + I.length);
            }
            return P + E(s2, F);
          }];
        }, !j || !C || T);
      }, 3123: function(t2, e2, r2) {
        var n2 = r2(2104), o2 = r2(6916), i = r2(1702), a = r2(7007), s = r2(7850), c = r2(9670), u = r2(4488), f = r2(6707), l = r2(1530), p2 = r2(7466), d = r2(1340), h2 = r2(8173), v = r2(1589), m = r2(7651), g = r2(2261), y = r2(2999), b = r2(7293), k = y.UNSUPPORTED_Y, x = 4294967295, w = Math.min, S = [].push, _ = i(/./.exec), E = i(S), O = i("".slice), C = !b(function() {
          var t3 = /(?:)/, e3 = t3.exec;
          t3.exec = function() {
            return e3.apply(this, arguments);
          };
          var r3 = "ab".split(t3);
          return 2 !== r3.length || "a" !== r3[0] || "b" !== r3[1];
        });
        a("split", function(t3, e3, r3) {
          var i2;
          return i2 = "c" == "abbc".split(/(b)*/)[1] || 4 != "test".split(/(?:)/, -1).length || 2 != "ab".split(/(?:ab)*/).length || 4 != ".".split(/(.?)(.?)/).length || ".".split(/()()/).length > 1 || "".split(/.?/).length ? function(t4, r4) {
            var i3 = d(u(this)), a2 = void 0 === r4 ? x : r4 >>> 0;
            if (0 === a2)
              return [];
            if (void 0 === t4)
              return [i3];
            if (!s(t4))
              return o2(e3, i3, t4, a2);
            var c2, f2, l2, p3 = [], h3 = (t4.ignoreCase ? "i" : "") + (t4.multiline ? "m" : "") + (t4.unicode ? "u" : "") + (t4.sticky ? "y" : ""), m2 = 0, y2 = new RegExp(t4.source, h3 + "g");
            while (c2 = o2(g, y2, i3)) {
              if (f2 = y2.lastIndex, f2 > m2 && (E(p3, O(i3, m2, c2.index)), c2.length > 1 && c2.index < i3.length && n2(S, p3, v(c2, 1)), l2 = c2[0].length, m2 = f2, p3.length >= a2))
                break;
              y2.lastIndex === c2.index && y2.lastIndex++;
            }
            return m2 === i3.length ? !l2 && _(y2, "") || E(p3, "") : E(p3, O(i3, m2)), p3.length > a2 ? v(p3, 0, a2) : p3;
          } : "0".split(void 0, 0).length ? function(t4, r4) {
            return void 0 === t4 && 0 === r4 ? [] : o2(e3, this, t4, r4);
          } : e3, [function(e4, r4) {
            var n3 = u(this), a2 = void 0 == e4 ? void 0 : h2(e4, t3);
            return a2 ? o2(a2, e4, n3, r4) : o2(i2, d(n3), e4, r4);
          }, function(t4, n3) {
            var o3 = c(this), a2 = d(t4), s2 = r3(i2, o3, a2, n3, i2 !== e3);
            if (s2.done)
              return s2.value;
            var u2 = f(o3, RegExp), h3 = o3.unicode, v2 = (o3.ignoreCase ? "i" : "") + (o3.multiline ? "m" : "") + (o3.unicode ? "u" : "") + (k ? "g" : "y"), g2 = new u2(k ? "^(?:" + o3.source + ")" : o3, v2), y2 = void 0 === n3 ? x : n3 >>> 0;
            if (0 === y2)
              return [];
            if (0 === a2.length)
              return null === m(g2, a2) ? [a2] : [];
            var b2 = 0, S2 = 0, _2 = [];
            while (S2 < a2.length) {
              g2.lastIndex = k ? 0 : S2;
              var C2, T = m(g2, k ? O(a2, S2) : a2);
              if (null === T || (C2 = w(p2(g2.lastIndex + (k ? S2 : 0)), a2.length)) === b2)
                S2 = l(a2, S2, h3);
              else {
                if (E(_2, O(a2, b2, S2)), _2.length === y2)
                  return _2;
                for (var j = 1; j <= T.length - 1; j++)
                  if (E(_2, T[j]), _2.length === y2)
                    return _2;
                S2 = b2 = C2;
              }
            }
            return E(_2, O(a2, b2)), _2;
          }];
        }, !C, k);
      }, 6755: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(1702), i = r2(1236).f, a = r2(7466), s = r2(1340), c = r2(3929), u = r2(4488), f = r2(4964), l = r2(1913), p2 = o2("".startsWith), d = o2("".slice), h2 = Math.min, v = f("startsWith"), m = !l && !v && !!function() {
          var t3 = i(String.prototype, "startsWith");
          return t3 && !t3.writable;
        }();
        n2({ target: "String", proto: true, forced: !m && !v }, { startsWith: function(t3) {
          var e3 = s(u(this));
          c(t3);
          var r3 = a(h2(arguments.length > 1 ? arguments[1] : void 0, e3.length)), n3 = s(t3);
          return p2 ? p2(e3, n3, r3) : d(e3, r3, r3 + n3.length) === n3;
        } });
      }, 3210: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(3111).trim, i = r2(6091);
        n2({ target: "String", proto: true, forced: i("trim") }, { trim: function() {
          return o2(this);
        } });
      }, 1817: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(9781), i = r2(7854), a = r2(1702), s = r2(2597), c = r2(614), u = r2(7976), f = r2(1340), l = r2(3070).f, p2 = r2(9920), d = i.Symbol, h2 = d && d.prototype;
        if (o2 && c(d) && (!("description" in h2) || void 0 !== d().description)) {
          var v = {}, m = function() {
            var t3 = arguments.length < 1 || void 0 === arguments[0] ? void 0 : f(arguments[0]), e3 = u(h2, this) ? new d(t3) : void 0 === t3 ? d() : d(t3);
            return "" === t3 && (v[e3] = true), e3;
          };
          p2(m, d), m.prototype = h2, h2.constructor = m;
          var g = "Symbol(test)" == String(d("test")), y = a(h2.toString), b = a(h2.valueOf), k = /^Symbol\((.*)\)[^)]+$/, x = a("".replace), w = a("".slice);
          l(h2, "description", { configurable: true, get: function() {
            var t3 = b(this), e3 = y(t3);
            if (s(v, t3))
              return "";
            var r3 = g ? w(e3, 7, -1) : x(e3, k, "$1");
            return "" === r3 ? void 0 : r3;
          } }), n2({ global: true, forced: true }, { Symbol: m });
        }
      }, 2165: function(t2, e2, r2) {
        var n2 = r2(7235);
        n2("iterator");
      }, 2526: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(7854), i = r2(5005), a = r2(2104), s = r2(6916), c = r2(1702), u = r2(1913), f = r2(9781), l = r2(133), p2 = r2(7293), d = r2(2597), h2 = r2(3157), v = r2(614), m = r2(111), g = r2(7976), y = r2(2190), b = r2(9670), k = r2(7908), x = r2(5656), w = r2(4948), S = r2(1340), _ = r2(9114), E = r2(30), O = r2(1956), C = r2(8006), T = r2(1156), j = r2(5181), P = r2(1236), F = r2(3070), N = r2(6048), I = r2(5296), A = r2(206), D = r2(1320), L = r2(2309), M = r2(6200), R = r2(3501), z = r2(9711), B = r2(5112), V = r2(6061), G = r2(7235), q = r2(8003), $ = r2(9909), H = r2(2092).forEach, U = M("hidden"), Z = "Symbol", W = "prototype", Y = B("toPrimitive"), X = $.set, K = $.getterFor(Z), J = Object[W], Q = o2.Symbol, tt = Q && Q[W], et = o2.TypeError, rt = o2.QObject, nt = i("JSON", "stringify"), ot = P.f, it = F.f, at = T.f, st = I.f, ct = c([].push), ut = L("symbols"), ft = L("op-symbols"), lt = L("string-to-symbol-registry"), pt = L("symbol-to-string-registry"), dt = L("wks"), ht = !rt || !rt[W] || !rt[W].findChild, vt = f && p2(function() {
          return 7 != E(it({}, "a", { get: function() {
            return it(this, "a", { value: 7 }).a;
          } })).a;
        }) ? function(t3, e3, r3) {
          var n3 = ot(J, e3);
          n3 && delete J[e3], it(t3, e3, r3), n3 && t3 !== J && it(J, e3, n3);
        } : it, mt = function(t3, e3) {
          var r3 = ut[t3] = E(tt);
          return X(r3, { type: Z, tag: t3, description: e3 }), f || (r3.description = e3), r3;
        }, gt = function(t3, e3, r3) {
          t3 === J && gt(ft, e3, r3), b(t3);
          var n3 = w(e3);
          return b(r3), d(ut, n3) ? (r3.enumerable ? (d(t3, U) && t3[U][n3] && (t3[U][n3] = false), r3 = E(r3, { enumerable: _(0, false) })) : (d(t3, U) || it(t3, U, _(1, {})), t3[U][n3] = true), vt(t3, n3, r3)) : it(t3, n3, r3);
        }, yt = function(t3, e3) {
          b(t3);
          var r3 = x(e3), n3 = O(r3).concat(St(r3));
          return H(n3, function(e4) {
            f && !s(kt, r3, e4) || gt(t3, e4, r3[e4]);
          }), t3;
        }, bt = function(t3, e3) {
          return void 0 === e3 ? E(t3) : yt(E(t3), e3);
        }, kt = function(t3) {
          var e3 = w(t3), r3 = s(st, this, e3);
          return !(this === J && d(ut, e3) && !d(ft, e3)) && (!(r3 || !d(this, e3) || !d(ut, e3) || d(this, U) && this[U][e3]) || r3);
        }, xt = function(t3, e3) {
          var r3 = x(t3), n3 = w(e3);
          if (r3 !== J || !d(ut, n3) || d(ft, n3)) {
            var o3 = ot(r3, n3);
            return !o3 || !d(ut, n3) || d(r3, U) && r3[U][n3] || (o3.enumerable = true), o3;
          }
        }, wt = function(t3) {
          var e3 = at(x(t3)), r3 = [];
          return H(e3, function(t4) {
            d(ut, t4) || d(R, t4) || ct(r3, t4);
          }), r3;
        }, St = function(t3) {
          var e3 = t3 === J, r3 = at(e3 ? ft : x(t3)), n3 = [];
          return H(r3, function(t4) {
            !d(ut, t4) || e3 && !d(J, t4) || ct(n3, ut[t4]);
          }), n3;
        };
        if (l || (Q = function() {
          if (g(tt, this))
            throw et("Symbol is not a constructor");
          var t3 = arguments.length && void 0 !== arguments[0] ? S(arguments[0]) : void 0, e3 = z(t3), r3 = function(t4) {
            this === J && s(r3, ft, t4), d(this, U) && d(this[U], e3) && (this[U][e3] = false), vt(this, e3, _(1, t4));
          };
          return f && ht && vt(J, e3, { configurable: true, set: r3 }), mt(e3, t3);
        }, tt = Q[W], D(tt, "toString", function() {
          return K(this).tag;
        }), D(Q, "withoutSetter", function(t3) {
          return mt(z(t3), t3);
        }), I.f = kt, F.f = gt, N.f = yt, P.f = xt, C.f = T.f = wt, j.f = St, V.f = function(t3) {
          return mt(B(t3), t3);
        }, f && (it(tt, "description", { configurable: true, get: function() {
          return K(this).description;
        } }), u || D(J, "propertyIsEnumerable", kt, { unsafe: true }))), n2({ global: true, wrap: true, forced: !l, sham: !l }, { Symbol: Q }), H(O(dt), function(t3) {
          G(t3);
        }), n2({ target: Z, stat: true, forced: !l }, { for: function(t3) {
          var e3 = S(t3);
          if (d(lt, e3))
            return lt[e3];
          var r3 = Q(e3);
          return lt[e3] = r3, pt[r3] = e3, r3;
        }, keyFor: function(t3) {
          if (!y(t3))
            throw et(t3 + " is not a symbol");
          if (d(pt, t3))
            return pt[t3];
        }, useSetter: function() {
          ht = true;
        }, useSimple: function() {
          ht = false;
        } }), n2({ target: "Object", stat: true, forced: !l, sham: !f }, { create: bt, defineProperty: gt, defineProperties: yt, getOwnPropertyDescriptor: xt }), n2({ target: "Object", stat: true, forced: !l }, { getOwnPropertyNames: wt, getOwnPropertySymbols: St }), n2({ target: "Object", stat: true, forced: p2(function() {
          j.f(1);
        }) }, { getOwnPropertySymbols: function(t3) {
          return j.f(k(t3));
        } }), nt) {
          var _t = !l || p2(function() {
            var t3 = Q();
            return "[null]" != nt([t3]) || "{}" != nt({ a: t3 }) || "{}" != nt(Object(t3));
          });
          n2({ target: "JSON", stat: true, forced: _t }, { stringify: function(t3, e3, r3) {
            var n3 = A(arguments), o3 = e3;
            if ((m(e3) || void 0 !== t3) && !y(t3))
              return h2(e3) || (e3 = function(t4, e4) {
                if (v(o3) && (e4 = s(o3, this, t4, e4)), !y(e4))
                  return e4;
              }), n3[1] = e3, a(nt, null, n3);
          } });
        }
        if (!tt[Y]) {
          var Et = tt.valueOf;
          D(tt, Y, function(t3) {
            return s(Et, this);
          });
        }
        q(Q, Z), R[U] = true;
      }, 4747: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(8324), i = r2(8509), a = r2(8533), s = r2(8880), c = function(t3) {
          if (t3 && t3.forEach !== a)
            try {
              s(t3, "forEach", a);
            } catch (e3) {
              t3.forEach = a;
            }
        };
        for (var u in o2)
          o2[u] && c(n2[u] && n2[u].prototype);
        c(i);
      }, 3948: function(t2, e2, r2) {
        var n2 = r2(7854), o2 = r2(8324), i = r2(8509), a = r2(6992), s = r2(8880), c = r2(5112), u = c("iterator"), f = c("toStringTag"), l = a.values, p2 = function(t3, e3) {
          if (t3) {
            if (t3[u] !== l)
              try {
                s(t3, u, l);
              } catch (n3) {
                t3[u] = l;
              }
            if (t3[f] || s(t3, f, e3), o2[e3]) {
              for (var r3 in a)
                if (t3[r3] !== a[r3])
                  try {
                    s(t3, r3, a[r3]);
                  } catch (n3) {
                    t3[r3] = a[r3];
                  }
            }
          }
        };
        for (var d in o2)
          p2(n2[d] && n2[d].prototype, d);
        p2(i, "DOMTokenList");
      }, 2564: function(t2, e2, r2) {
        var n2 = r2(2109), o2 = r2(7854), i = r2(2104), a = r2(614), s = r2(8113), c = r2(206), u = r2(8053), f = /MSIE .\./.test(s), l = o2.Function, p2 = function(t3) {
          return function(e3, r3) {
            var n3 = u(arguments.length, 1) > 2, o3 = a(e3) ? e3 : l(e3), s2 = n3 ? c(arguments, 2) : void 0;
            return t3(n3 ? function() {
              i(o3, this, s2);
            } : o3, r3);
          };
        };
        n2({ global: true, bind: true, forced: f }, { setTimeout: p2(o2.setTimeout), setInterval: p2(o2.setInterval) });
      }, 7834: function(t2, e2, r2) {
        r2.r(e2);
        var n2 = r2(8081), o2 = r2.n(n2), i = r2(3645), a = r2.n(i), s = a()(o2());
        s.push([t2.id, ".ep-circle[data-v-016e1ca5]{-webkit-transform-origin:50% 50%;transform-origin:50% 50%}", ""]), e2["default"] = s;
      }, 664: function(t2, e2, r2) {
        r2.r(e2);
        var n2 = r2(8081), o2 = r2.n(n2), i = r2(3645), a = r2.n(i), s = a()(o2());
        s.push([t2.id, ".ep-svg-container{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;position:absolute}.ep-svg-container.ep-reverse{-webkit-transform:scaleX(-1);transform:scaleX(-1)}g.ep-circle--container{-webkit-transition:inherit;-o-transition:inherit;transition:inherit;-webkit-transform-origin:50% 50%;transform-origin:50% 50%}@-webkit-keyframes ep-dot--init__loop{0%{-webkit-transform:rotate(var(--ep-dot-start));transform:rotate(var(--ep-dot-start))}33%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}66%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}to{-webkit-transform:rotate(var(--ep-dot-loop-end));transform:rotate(var(--ep-dot-loop-end))}}@keyframes ep-dot--init__loop{0%{-webkit-transform:rotate(var(--ep-dot-start));transform:rotate(var(--ep-dot-start))}33%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}66%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}to{-webkit-transform:rotate(var(--ep-dot-loop-end));transform:rotate(var(--ep-dot-loop-end))}}@-webkit-keyframes ep-dot--init__reverse{0%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}50%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}to{-webkit-transform:rotate(var(--ep-dot-end));transform:rotate(var(--ep-dot-end))}}@keyframes ep-dot--init__reverse{0%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}50%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}to{-webkit-transform:rotate(var(--ep-dot-end));transform:rotate(var(--ep-dot-end))}}@-webkit-keyframes ep-dot--init__bounce{0%{opacity:0}90%{opacity:0}to{opacity:1}}@keyframes ep-dot--init__bounce{0%{opacity:0}90%{opacity:0}to{opacity:1}}@-webkit-keyframes ep-dot--init__disabled{0%{opacity:0}90%{opacity:0}to{opacity:1}}@keyframes ep-dot--init__disabled{0%{opacity:0}90%{opacity:0}to{opacity:1}}.ep-circle--progress{-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}.ep-circle--progress.animation__default{-webkit-animation-name:ep-progress--init__default;animation-name:ep-progress--init__default}.ep-circle--progress.animation__rs{-webkit-animation-name:ep-progress--init__rs;animation-name:ep-progress--init__rs}.ep-circle--progress.animation__bounce{-webkit-animation-name:ep-progress--init__bounce;animation-name:ep-progress--init__bounce}.ep-circle--progress.animation__reverse{-webkit-animation-name:ep-progress--init__reverse;animation-name:ep-progress--init__reverse}.ep-circle--progress.animation__loop{-webkit-animation-name:ep-progress--init__loop;animation-name:ep-progress--init__loop}.ep-circle--loader.animation__loading{-webkit-animation-name:ep-progress--loading,ep-progress--loading__rotation;animation-name:ep-progress--loading,ep-progress--loading__rotation;-webkit-animation-iteration-count:infinite!important;animation-iteration-count:infinite!important;-webkit-animation-duration:2s,1s;animation-duration:2s,1s;-webkit-animation-timing-function:ease-in-out,linear;animation-timing-function:ease-in-out,linear}.ep-half-circle--loader.animation__loading{-webkit-animation-name:ep-half-progress--loading;animation-name:ep-half-progress--loading;-webkit-animation-iteration-count:infinite!important;animation-iteration-count:infinite!important;-webkit-animation-duration:2s;animation-duration:2s;-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}.ep-circle--empty.ep-circle--nodata,.ep-circle--empty__fill.ep-circle--nodata,.ep-half-circle--empty.ep-circle--nodata,.ep-half-circle--empty__fill.ep-circle--nodata{opacity:.5}.ep-circle--progress__dot-container{-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}.ep-circle--progress__dot-container.animation__rs{-webkit-animation-name:ep-dot--init__rs;animation-name:ep-dot--init__rs}.ep-circle--progress__dot-container.animation__bounce{-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards;-webkit-animation-name:ep-dot--init__disabled;animation-name:ep-dot--init__disabled}.ep-circle--progress__dot-container.animation__reverse{-webkit-animation-name:ep-dot--init__reverse;animation-name:ep-dot--init__reverse}.ep-circle--progress__dot-container.animation__loop{-webkit-animation-name:ep-dot--init__loop;animation-name:ep-dot--init__loop}.ep-circle--progress__dot-container.ep-half-circle-progress__dot.animation__bounce,.ep-circle--progress__dot-container.ep-half-circle-progress__dot.animation__loop{-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards;-webkit-animation-name:ep-dot--init__disabled;animation-name:ep-dot--init__disabled}@-webkit-keyframes ep-progress--init__default{0%{stroke-dashoffset:var(--ep-circumference)}to{stroke-dashoffset:var(--ep-stroke-offset)}}@keyframes ep-progress--init__default{0%{stroke-dashoffset:var(--ep-circumference)}to{stroke-dashoffset:var(--ep-stroke-offset)}}@-webkit-keyframes ep-progress--init__rs{0%{stroke-dashoffset:var(--ep-circumference)}50%{stroke-dashoffset:0}to{stroke-dashoffset:var(--ep-stroke-offset)}}@keyframes ep-progress--init__rs{0%{stroke-dashoffset:var(--ep-circumference)}50%{stroke-dashoffset:0}to{stroke-dashoffset:var(--ep-stroke-offset)}}@-webkit-keyframes ep-progress--init__bounce{0%{-webkit-animation-timing-function:linear;animation-timing-function:linear;stroke-dashoffset:var(--ep-circumference)}33%{stroke-dashoffset:var(--ep-bounce-out-stroke-offset)}66%{stroke-dashoffset:var(--ep-bounce-in-stroke-offset)}to{stroke-dashoffset:var(--ep-stroke-offset)}}@keyframes ep-progress--init__bounce{0%{-webkit-animation-timing-function:linear;animation-timing-function:linear;stroke-dashoffset:var(--ep-circumference)}33%{stroke-dashoffset:var(--ep-bounce-out-stroke-offset)}66%{stroke-dashoffset:var(--ep-bounce-in-stroke-offset)}to{stroke-dashoffset:var(--ep-stroke-offset)}}@-webkit-keyframes ep-progress--init__reverse{0%{stroke-dashoffset:var(--ep-circumference)}50%{stroke-dashoffset:var(--ep-double-circumference)}to{stroke-dashoffset:var(--ep-reverse-stroke-offset)}}@keyframes ep-progress--init__reverse{0%{stroke-dashoffset:var(--ep-circumference)}50%{stroke-dashoffset:var(--ep-double-circumference)}to{stroke-dashoffset:var(--ep-reverse-stroke-offset)}}@-webkit-keyframes ep-progress--init__loop{0%{stroke-dashoffset:var(--ep-circumference)}33%{stroke-dashoffset:0}66%{stroke-dashoffset:var(--ep-negative-circumference)}to{stroke-dashoffset:var(--ep-loop-stroke-offset)}}@keyframes ep-progress--init__loop{0%{stroke-dashoffset:var(--ep-circumference)}33%{stroke-dashoffset:0}66%{stroke-dashoffset:var(--ep-negative-circumference)}to{stroke-dashoffset:var(--ep-loop-stroke-offset)}}@-webkit-keyframes ep-progress--loading{0%{stroke-dashoffset:var(--ep-circumference)}50%{stroke-dashoffset:var(--ep-loading-stroke-offset)}to{stroke-dashoffset:var(--ep-circumference)}}@keyframes ep-progress--loading{0%{stroke-dashoffset:var(--ep-circumference)}50%{stroke-dashoffset:var(--ep-loading-stroke-offset)}to{stroke-dashoffset:var(--ep-circumference)}}@-webkit-keyframes ep-half-progress--loading{0%{opacity:.5;stroke-dashoffset:var(--ep-circumference)}50%{opacity:.8;stroke-dashoffset:0}to{opacity:.5;stroke-dashoffset:var(--ep-circumference)}}@keyframes ep-half-progress--loading{0%{opacity:.5;stroke-dashoffset:var(--ep-circumference)}50%{opacity:.8;stroke-dashoffset:0}to{opacity:.5;stroke-dashoffset:var(--ep-circumference)}}@-webkit-keyframes ep-progress--loading__rotation{to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@keyframes ep-progress--loading__rotation{to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@-webkit-keyframes ep-dot--init__rs{0%{-webkit-transform:rotate(var(--ep-dot-start));transform:rotate(var(--ep-dot-start))}50%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}to{-webkit-transform:rotate(var(--ep-dot-end));transform:rotate(var(--ep-dot-end))}}@keyframes ep-dot--init__rs{0%{-webkit-transform:rotate(var(--ep-dot-start));transform:rotate(var(--ep-dot-start))}50%{-webkit-transform:rotate(var(--ep-dot-360));transform:rotate(var(--ep-dot-360))}to{-webkit-transform:rotate(var(--ep-dot-end));transform:rotate(var(--ep-dot-end))}}", ""]), e2["default"] = s;
      }, 1115: function(t2, e2, r2) {
        r2.r(e2);
        var n2 = r2(8081), o2 = r2.n(n2), i = r2(3645), a = r2.n(i), s = a()(o2());
        s.push([t2.id, ".ep-circle--progress__dot-container[data-v-12292afe]{position:absolute;-webkit-transform-origin:center center;transform-origin:center center}.ep-circle--progress__dot-container.hidden[data-v-12292afe]{-webkit-transition-duration:0s;-o-transition-duration:0s;transition-duration:0s}.ep-circle--progress__dot-container>div[data-v-12292afe]{position:relative}.ep-circle--progress__dot[data-v-12292afe]{-webkit-transition-duration:.2s;-o-transition-duration:.2s;transition-duration:.2s;-webkit-box-sizing:border-box;box-sizing:border-box;position:absolute;margin:auto;right:0;left:0}.ep-circle--progress__dot.ep-hidden[data-v-12292afe]{-webkit-transform:scale(0);transform:scale(0)}", ""]), e2["default"] = s;
      }, 5125: function(t2, e2, r2) {
        r2.r(e2);
        var n2 = r2(8081), o2 = r2.n(n2), i = r2(3645), a = r2.n(i), s = a()(o2());
        s.push([t2.id, "g.ep-half-circle[data-v-58d6f8b2]{-webkit-transform-origin:50% 50%;transform-origin:50% 50%}", ""]), e2["default"] = s;
      }, 4560: function(t2, e2, r2) {
        r2.r(e2);
        var n2 = r2(8081), o2 = r2.n(n2), i = r2(3645), a = r2.n(i), s = a()(o2());
        s.push([t2.id, "g.ep-half-circle[data-v-0af4dce4]{-webkit-transform-origin:50% 50%;transform-origin:50% 50%}", ""]), e2["default"] = s;
      }, 6827: function(t2, e2, r2) {
        r2.r(e2);
        var n2 = r2(8081), o2 = r2.n(n2), i = r2(3645), a = r2.n(i), s = a()(o2());
        s.push([t2.id, ".fade-enter-active[data-v-873ef638],.fade-leave-active[data-v-873ef638]{-webkit-transition:opacity .3s;-o-transition:opacity .3s;transition:opacity .3s}.fade-enter[data-v-873ef638],.fade-leave-active[data-v-873ef638]{-webkit-transition:.3s;-o-transition:.3s;transition:.3s;opacity:0}", ""]), e2["default"] = s;
      }, 3493: function(t2, e2, r2) {
        r2.r(e2);
        var n2 = r2(8081), o2 = r2.n(n2), i = r2(3645), a = r2.n(i), s = a()(o2());
        s.push([t2.id, ".ep-container[data-v-a7ff9eba]{display:inline-block;overflow:hidden}.ep-content[data-v-a7ff9eba]{max-width:inherit;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;position:relative;height:100%;width:100%}.ep-content[data-v-a7ff9eba],.ep-legend--container[data-v-a7ff9eba]{-webkit-transition:inherit;-o-transition:inherit;transition:inherit}.ep-legend--container[data-v-a7ff9eba]{position:absolute;text-align:center}.ep-legend--value[data-v-a7ff9eba]{-webkit-transition:.3s;-o-transition:.3s;transition:.3s;text-align:center;opacity:1}.ep-hidden[data-v-a7ff9eba]{opacity:0}svg.ep-svg[data-v-a7ff9eba]{-webkit-transition:inherit;-o-transition:inherit;transition:inherit;-webkit-transform-origin:50% 50%;transform-origin:50% 50%}", ""]), e2["default"] = s;
      }, 3645: function(t2) {
        t2.exports = function(t3) {
          var e2 = [];
          return e2.toString = function() {
            return this.map(function(e3) {
              var r2 = "", n2 = "undefined" !== typeof e3[5];
              return e3[4] && (r2 += "@supports (".concat(e3[4], ") {")), e3[2] && (r2 += "@media ".concat(e3[2], " {")), n2 && (r2 += "@layer".concat(e3[5].length > 0 ? " ".concat(e3[5]) : "", " {")), r2 += t3(e3), n2 && (r2 += "}"), e3[2] && (r2 += "}"), e3[4] && (r2 += "}"), r2;
            }).join("");
          }, e2.i = function(t4, r2, n2, o2, i) {
            "string" === typeof t4 && (t4 = [[null, t4, void 0]]);
            var a = {};
            if (n2)
              for (var s = 0; s < this.length; s++) {
                var c = this[s][0];
                null != c && (a[c] = true);
              }
            for (var u = 0; u < t4.length; u++) {
              var f = [].concat(t4[u]);
              n2 && a[f[0]] || ("undefined" !== typeof i && ("undefined" === typeof f[5] || (f[1] = "@layer".concat(f[5].length > 0 ? " ".concat(f[5]) : "", " {").concat(f[1], "}")), f[5] = i), r2 && (f[2] ? (f[1] = "@media ".concat(f[2], " {").concat(f[1], "}"), f[2] = r2) : f[2] = r2), o2 && (f[4] ? (f[1] = "@supports (".concat(f[4], ") {").concat(f[1], "}"), f[4] = o2) : f[4] = "".concat(o2)), e2.push(f));
            }
          }, e2;
        };
      }, 8081: function(t2) {
        t2.exports = function(t3) {
          return t3[1];
        };
      }, 5666: function(t2) {
        var e2 = function(t3) {
          var e3, r2 = Object.prototype, n2 = r2.hasOwnProperty, o2 = "function" === typeof Symbol ? Symbol : {}, i = o2.iterator || "@@iterator", a = o2.asyncIterator || "@@asyncIterator", s = o2.toStringTag || "@@toStringTag";
          function c(t4, e4, r3) {
            return Object.defineProperty(t4, e4, { value: r3, enumerable: true, configurable: true, writable: true }), t4[e4];
          }
          try {
            c({}, "");
          } catch (N) {
            c = function(t4, e4, r3) {
              return t4[e4] = r3;
            };
          }
          function u(t4, e4, r3, n3) {
            var o3 = e4 && e4.prototype instanceof m ? e4 : m, i2 = Object.create(o3.prototype), a2 = new j(n3 || []);
            return i2._invoke = E(t4, r3, a2), i2;
          }
          function f(t4, e4, r3) {
            try {
              return { type: "normal", arg: t4.call(e4, r3) };
            } catch (N) {
              return { type: "throw", arg: N };
            }
          }
          t3.wrap = u;
          var l = "suspendedStart", p2 = "suspendedYield", d = "executing", h2 = "completed", v = {};
          function m() {
          }
          function g() {
          }
          function y() {
          }
          var b = {};
          c(b, i, function() {
            return this;
          });
          var k = Object.getPrototypeOf, x = k && k(k(P([])));
          x && x !== r2 && n2.call(x, i) && (b = x);
          var w = y.prototype = m.prototype = Object.create(b);
          function S(t4) {
            ["next", "throw", "return"].forEach(function(e4) {
              c(t4, e4, function(t5) {
                return this._invoke(e4, t5);
              });
            });
          }
          function _(t4, e4) {
            function r3(o4, i3, a2, s2) {
              var c2 = f(t4[o4], t4, i3);
              if ("throw" !== c2.type) {
                var u2 = c2.arg, l2 = u2.value;
                return l2 && "object" === typeof l2 && n2.call(l2, "__await") ? e4.resolve(l2.__await).then(function(t5) {
                  r3("next", t5, a2, s2);
                }, function(t5) {
                  r3("throw", t5, a2, s2);
                }) : e4.resolve(l2).then(function(t5) {
                  u2.value = t5, a2(u2);
                }, function(t5) {
                  return r3("throw", t5, a2, s2);
                });
              }
              s2(c2.arg);
            }
            var o3;
            function i2(t5, n3) {
              function i3() {
                return new e4(function(e5, o4) {
                  r3(t5, n3, e5, o4);
                });
              }
              return o3 = o3 ? o3.then(i3, i3) : i3();
            }
            this._invoke = i2;
          }
          function E(t4, e4, r3) {
            var n3 = l;
            return function(o3, i2) {
              if (n3 === d)
                throw new Error("Generator is already running");
              if (n3 === h2) {
                if ("throw" === o3)
                  throw i2;
                return F();
              }
              r3.method = o3, r3.arg = i2;
              while (1) {
                var a2 = r3.delegate;
                if (a2) {
                  var s2 = O(a2, r3);
                  if (s2) {
                    if (s2 === v)
                      continue;
                    return s2;
                  }
                }
                if ("next" === r3.method)
                  r3.sent = r3._sent = r3.arg;
                else if ("throw" === r3.method) {
                  if (n3 === l)
                    throw n3 = h2, r3.arg;
                  r3.dispatchException(r3.arg);
                } else
                  "return" === r3.method && r3.abrupt("return", r3.arg);
                n3 = d;
                var c2 = f(t4, e4, r3);
                if ("normal" === c2.type) {
                  if (n3 = r3.done ? h2 : p2, c2.arg === v)
                    continue;
                  return { value: c2.arg, done: r3.done };
                }
                "throw" === c2.type && (n3 = h2, r3.method = "throw", r3.arg = c2.arg);
              }
            };
          }
          function O(t4, r3) {
            var n3 = t4.iterator[r3.method];
            if (n3 === e3) {
              if (r3.delegate = null, "throw" === r3.method) {
                if (t4.iterator["return"] && (r3.method = "return", r3.arg = e3, O(t4, r3), "throw" === r3.method))
                  return v;
                r3.method = "throw", r3.arg = new TypeError("The iterator does not provide a 'throw' method");
              }
              return v;
            }
            var o3 = f(n3, t4.iterator, r3.arg);
            if ("throw" === o3.type)
              return r3.method = "throw", r3.arg = o3.arg, r3.delegate = null, v;
            var i2 = o3.arg;
            return i2 ? i2.done ? (r3[t4.resultName] = i2.value, r3.next = t4.nextLoc, "return" !== r3.method && (r3.method = "next", r3.arg = e3), r3.delegate = null, v) : i2 : (r3.method = "throw", r3.arg = new TypeError("iterator result is not an object"), r3.delegate = null, v);
          }
          function C(t4) {
            var e4 = { tryLoc: t4[0] };
            1 in t4 && (e4.catchLoc = t4[1]), 2 in t4 && (e4.finallyLoc = t4[2], e4.afterLoc = t4[3]), this.tryEntries.push(e4);
          }
          function T(t4) {
            var e4 = t4.completion || {};
            e4.type = "normal", delete e4.arg, t4.completion = e4;
          }
          function j(t4) {
            this.tryEntries = [{ tryLoc: "root" }], t4.forEach(C, this), this.reset(true);
          }
          function P(t4) {
            if (t4) {
              var r3 = t4[i];
              if (r3)
                return r3.call(t4);
              if ("function" === typeof t4.next)
                return t4;
              if (!isNaN(t4.length)) {
                var o3 = -1, a2 = function r4() {
                  while (++o3 < t4.length)
                    if (n2.call(t4, o3))
                      return r4.value = t4[o3], r4.done = false, r4;
                  return r4.value = e3, r4.done = true, r4;
                };
                return a2.next = a2;
              }
            }
            return { next: F };
          }
          function F() {
            return { value: e3, done: true };
          }
          return g.prototype = y, c(w, "constructor", y), c(y, "constructor", g), g.displayName = c(y, s, "GeneratorFunction"), t3.isGeneratorFunction = function(t4) {
            var e4 = "function" === typeof t4 && t4.constructor;
            return !!e4 && (e4 === g || "GeneratorFunction" === (e4.displayName || e4.name));
          }, t3.mark = function(t4) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(t4, y) : (t4.__proto__ = y, c(t4, s, "GeneratorFunction")), t4.prototype = Object.create(w), t4;
          }, t3.awrap = function(t4) {
            return { __await: t4 };
          }, S(_.prototype), c(_.prototype, a, function() {
            return this;
          }), t3.AsyncIterator = _, t3.async = function(e4, r3, n3, o3, i2) {
            void 0 === i2 && (i2 = Promise);
            var a2 = new _(u(e4, r3, n3, o3), i2);
            return t3.isGeneratorFunction(r3) ? a2 : a2.next().then(function(t4) {
              return t4.done ? t4.value : a2.next();
            });
          }, S(w), c(w, s, "Generator"), c(w, i, function() {
            return this;
          }), c(w, "toString", function() {
            return "[object Generator]";
          }), t3.keys = function(t4) {
            var e4 = [];
            for (var r3 in t4)
              e4.push(r3);
            return e4.reverse(), function r4() {
              while (e4.length) {
                var n3 = e4.pop();
                if (n3 in t4)
                  return r4.value = n3, r4.done = false, r4;
              }
              return r4.done = true, r4;
            };
          }, t3.values = P, j.prototype = { constructor: j, reset: function(t4) {
            if (this.prev = 0, this.next = 0, this.sent = this._sent = e3, this.done = false, this.delegate = null, this.method = "next", this.arg = e3, this.tryEntries.forEach(T), !t4)
              for (var r3 in this)
                "t" === r3.charAt(0) && n2.call(this, r3) && !isNaN(+r3.slice(1)) && (this[r3] = e3);
          }, stop: function() {
            this.done = true;
            var t4 = this.tryEntries[0], e4 = t4.completion;
            if ("throw" === e4.type)
              throw e4.arg;
            return this.rval;
          }, dispatchException: function(t4) {
            if (this.done)
              throw t4;
            var r3 = this;
            function o3(n3, o4) {
              return s2.type = "throw", s2.arg = t4, r3.next = n3, o4 && (r3.method = "next", r3.arg = e3), !!o4;
            }
            for (var i2 = this.tryEntries.length - 1; i2 >= 0; --i2) {
              var a2 = this.tryEntries[i2], s2 = a2.completion;
              if ("root" === a2.tryLoc)
                return o3("end");
              if (a2.tryLoc <= this.prev) {
                var c2 = n2.call(a2, "catchLoc"), u2 = n2.call(a2, "finallyLoc");
                if (c2 && u2) {
                  if (this.prev < a2.catchLoc)
                    return o3(a2.catchLoc, true);
                  if (this.prev < a2.finallyLoc)
                    return o3(a2.finallyLoc);
                } else if (c2) {
                  if (this.prev < a2.catchLoc)
                    return o3(a2.catchLoc, true);
                } else {
                  if (!u2)
                    throw new Error("try statement without catch or finally");
                  if (this.prev < a2.finallyLoc)
                    return o3(a2.finallyLoc);
                }
              }
            }
          }, abrupt: function(t4, e4) {
            for (var r3 = this.tryEntries.length - 1; r3 >= 0; --r3) {
              var o3 = this.tryEntries[r3];
              if (o3.tryLoc <= this.prev && n2.call(o3, "finallyLoc") && this.prev < o3.finallyLoc) {
                var i2 = o3;
                break;
              }
            }
            i2 && ("break" === t4 || "continue" === t4) && i2.tryLoc <= e4 && e4 <= i2.finallyLoc && (i2 = null);
            var a2 = i2 ? i2.completion : {};
            return a2.type = t4, a2.arg = e4, i2 ? (this.method = "next", this.next = i2.finallyLoc, v) : this.complete(a2);
          }, complete: function(t4, e4) {
            if ("throw" === t4.type)
              throw t4.arg;
            return "break" === t4.type || "continue" === t4.type ? this.next = t4.arg : "return" === t4.type ? (this.rval = this.arg = t4.arg, this.method = "return", this.next = "end") : "normal" === t4.type && e4 && (this.next = e4), v;
          }, finish: function(t4) {
            for (var e4 = this.tryEntries.length - 1; e4 >= 0; --e4) {
              var r3 = this.tryEntries[e4];
              if (r3.finallyLoc === t4)
                return this.complete(r3.completion, r3.afterLoc), T(r3), v;
            }
          }, catch: function(t4) {
            for (var e4 = this.tryEntries.length - 1; e4 >= 0; --e4) {
              var r3 = this.tryEntries[e4];
              if (r3.tryLoc === t4) {
                var n3 = r3.completion;
                if ("throw" === n3.type) {
                  var o3 = n3.arg;
                  T(r3);
                }
                return o3;
              }
            }
            throw new Error("illegal catch attempt");
          }, delegateYield: function(t4, r3, n3) {
            return this.delegate = { iterator: P(t4), resultName: r3, nextLoc: n3 }, "next" === this.method && (this.arg = e3), v;
          } }, t3;
        }(t2.exports);
        try {
          regeneratorRuntime = e2;
        } catch (r2) {
          "object" === typeof globalThis ? globalThis.regeneratorRuntime = e2 : Function("r", "regeneratorRuntime = r")(e2);
        }
      }, 3744: function(t2, e2) {
        e2.Z = (t3, e3) => {
          const r2 = t3.__vccOpts || t3;
          for (const [n2, o2] of e3)
            r2[n2] = o2;
          return r2;
        };
      }, 298: function(t2, e2, r2) {
        var n2 = r2(7834);
        n2.__esModule && (n2 = n2.default), "string" === typeof n2 && (n2 = [[t2.id, n2, ""]]), n2.locals && (t2.exports = n2.locals);
        var o2 = r2(4402).Z;
        o2("d8210468", n2, true, { sourceMap: false, shadowMode: false });
      }, 2371: function(t2, e2, r2) {
        var n2 = r2(664);
        n2.__esModule && (n2 = n2.default), "string" === typeof n2 && (n2 = [[t2.id, n2, ""]]), n2.locals && (t2.exports = n2.locals);
        var o2 = r2(4402).Z;
        o2("de752c5a", n2, true, { sourceMap: false, shadowMode: false });
      }, 5340: function(t2, e2, r2) {
        var n2 = r2(1115);
        n2.__esModule && (n2 = n2.default), "string" === typeof n2 && (n2 = [[t2.id, n2, ""]]), n2.locals && (t2.exports = n2.locals);
        var o2 = r2(4402).Z;
        o2("942c7a64", n2, true, { sourceMap: false, shadowMode: false });
      }, 9536: function(t2, e2, r2) {
        var n2 = r2(5125);
        n2.__esModule && (n2 = n2.default), "string" === typeof n2 && (n2 = [[t2.id, n2, ""]]), n2.locals && (t2.exports = n2.locals);
        var o2 = r2(4402).Z;
        o2("071cf7b1", n2, true, { sourceMap: false, shadowMode: false });
      }, 9904: function(t2, e2, r2) {
        var n2 = r2(4560);
        n2.__esModule && (n2 = n2.default), "string" === typeof n2 && (n2 = [[t2.id, n2, ""]]), n2.locals && (t2.exports = n2.locals);
        var o2 = r2(4402).Z;
        o2("210a0781", n2, true, { sourceMap: false, shadowMode: false });
      }, 4624: function(t2, e2, r2) {
        var n2 = r2(6827);
        n2.__esModule && (n2 = n2.default), "string" === typeof n2 && (n2 = [[t2.id, n2, ""]]), n2.locals && (t2.exports = n2.locals);
        var o2 = r2(4402).Z;
        o2("1b67af5d", n2, true, { sourceMap: false, shadowMode: false });
      }, 5221: function(t2, e2, r2) {
        var n2 = r2(3493);
        n2.__esModule && (n2 = n2.default), "string" === typeof n2 && (n2 = [[t2.id, n2, ""]]), n2.locals && (t2.exports = n2.locals);
        var o2 = r2(4402).Z;
        o2("3ddaf978", n2, true, { sourceMap: false, shadowMode: false });
      }, 4402: function(t2, e2, r2) {
        function n2(t3, e3) {
          for (var r3 = [], n3 = {}, o3 = 0; o3 < e3.length; o3++) {
            var i2 = e3[o3], a2 = i2[0], s2 = i2[1], c2 = i2[2], u2 = i2[3], f2 = { id: t3 + ":" + o3, css: s2, media: c2, sourceMap: u2 };
            n3[a2] ? n3[a2].parts.push(f2) : r3.push(n3[a2] = { id: a2, parts: [f2] });
          }
          return r3;
        }
        r2.d(e2, { Z: function() {
          return h2;
        } });
        var o2 = "undefined" !== typeof document;
        if ("undefined" !== typeof DEBUG && DEBUG && !o2)
          throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");
        var i = {}, a = o2 && (document.head || document.getElementsByTagName("head")[0]), s = null, c = 0, u = false, f = function() {
        }, l = null, p2 = "data-vue-ssr-id", d = "undefined" !== typeof navigator && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase());
        function h2(t3, e3, r3, o3) {
          u = r3, l = o3 || {};
          var a2 = n2(t3, e3);
          return v(a2), function(e4) {
            for (var r4 = [], o4 = 0; o4 < a2.length; o4++) {
              var s2 = a2[o4], c2 = i[s2.id];
              c2.refs--, r4.push(c2);
            }
            e4 ? (a2 = n2(t3, e4), v(a2)) : a2 = [];
            for (o4 = 0; o4 < r4.length; o4++) {
              c2 = r4[o4];
              if (0 === c2.refs) {
                for (var u2 = 0; u2 < c2.parts.length; u2++)
                  c2.parts[u2]();
                delete i[c2.id];
              }
            }
          };
        }
        function v(t3) {
          for (var e3 = 0; e3 < t3.length; e3++) {
            var r3 = t3[e3], n3 = i[r3.id];
            if (n3) {
              n3.refs++;
              for (var o3 = 0; o3 < n3.parts.length; o3++)
                n3.parts[o3](r3.parts[o3]);
              for (; o3 < r3.parts.length; o3++)
                n3.parts.push(g(r3.parts[o3]));
              n3.parts.length > r3.parts.length && (n3.parts.length = r3.parts.length);
            } else {
              var a2 = [];
              for (o3 = 0; o3 < r3.parts.length; o3++)
                a2.push(g(r3.parts[o3]));
              i[r3.id] = { id: r3.id, refs: 1, parts: a2 };
            }
          }
        }
        function m() {
          var t3 = document.createElement("style");
          return t3.type = "text/css", a.appendChild(t3), t3;
        }
        function g(t3) {
          var e3, r3, n3 = document.querySelector("style[" + p2 + '~="' + t3.id + '"]');
          if (n3) {
            if (u)
              return f;
            n3.parentNode.removeChild(n3);
          }
          if (d) {
            var o3 = c++;
            n3 = s || (s = m()), e3 = b.bind(null, n3, o3, false), r3 = b.bind(null, n3, o3, true);
          } else
            n3 = m(), e3 = k.bind(null, n3), r3 = function() {
              n3.parentNode.removeChild(n3);
            };
          return e3(t3), function(n4) {
            if (n4) {
              if (n4.css === t3.css && n4.media === t3.media && n4.sourceMap === t3.sourceMap)
                return;
              e3(t3 = n4);
            } else
              r3();
          };
        }
        var y = function() {
          var t3 = [];
          return function(e3, r3) {
            return t3[e3] = r3, t3.filter(Boolean).join("\n");
          };
        }();
        function b(t3, e3, r3, n3) {
          var o3 = r3 ? "" : n3.css;
          if (t3.styleSheet)
            t3.styleSheet.cssText = y(e3, o3);
          else {
            var i2 = document.createTextNode(o3), a2 = t3.childNodes;
            a2[e3] && t3.removeChild(a2[e3]), a2.length ? t3.insertBefore(i2, a2[e3]) : t3.appendChild(i2);
          }
        }
        function k(t3, e3) {
          var r3 = e3.css, n3 = e3.media, o3 = e3.sourceMap;
          if (n3 && t3.setAttribute("media", n3), l.ssrId && t3.setAttribute(p2, e3.id), o3 && (r3 += "\n/*# sourceURL=" + o3.sources[0] + " */", r3 += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(o3)))) + " */"), t3.styleSheet)
            t3.styleSheet.cssText = r3;
          else {
            while (t3.firstChild)
              t3.removeChild(t3.firstChild);
            t3.appendChild(document.createTextNode(r3));
          }
        }
      }, 7203: function(e2) {
        e2.exports = t;
      } }, r = {};
      function n(t2) {
        var o2 = r[t2];
        if (void 0 !== o2)
          return o2.exports;
        var i = r[t2] = { id: t2, exports: {} };
        return e[t2].call(i.exports, i, i.exports, n), i.exports;
      }
      !function() {
        n.n = function(t2) {
          var e2 = t2 && t2.__esModule ? function() {
            return t2["default"];
          } : function() {
            return t2;
          };
          return n.d(e2, { a: e2 }), e2;
        };
      }(), function() {
        n.d = function(t2, e2) {
          for (var r2 in e2)
            n.o(e2, r2) && !n.o(t2, r2) && Object.defineProperty(t2, r2, { enumerable: true, get: e2[r2] });
        };
      }(), function() {
        n.g = function() {
          if ("object" === typeof globalThis)
            return globalThis;
          try {
            return this || new Function("return this")();
          } catch (t2) {
            if ("object" === typeof window)
              return window;
          }
        }();
      }(), function() {
        n.o = function(t2, e2) {
          return Object.prototype.hasOwnProperty.call(t2, e2);
        };
      }(), function() {
        n.r = function(t2) {
          "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(t2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t2, "__esModule", { value: true });
        };
      }(), function() {
        n.p = "";
      }();
      var o = {};
      return function() {
        if (n.r(o), n.d(o, { VeProgress: function() {
          return he;
        }, default: function() {
          return ge;
        }, install: function() {
          return ve;
        } }), "undefined" !== typeof window) {
          var t2 = window.document.currentScript, e2 = n(7679);
          t2 = e2(), "currentScript" in document || Object.defineProperty(document, "currentScript", { get: e2 });
          var r2 = t2 && t2.src.match(/(.+\/)[^/]+\.js(\?.*)?$/);
          r2 && (n.p = r2[1]);
        }
        var i = n(7203), a = { class: "ep-content" }, s = { ref: "legend" }, c = ["innerHTML"], u = { key: 1 };
        function f(t3, e3, r3, n2, o2, f2) {
          var l2 = (0, i.resolveComponent)("circle-container"), p3 = (0, i.resolveComponent)("counter");
          return (0, i.openBlock)(), (0, i.createElementBlock)("div", { class: "ep-container", style: (0, i.normalizeStyle)({ width: "".concat(t3.size, "px"), height: "".concat(t3.size, "px") }) }, [(0, i.createElementVNode)("div", a, [((0, i.openBlock)(true), (0, i.createElementBlock)(i.Fragment, null, (0, i.renderList)(f2.normalizedCircles, function(t4, e4) {
            return (0, i.openBlock)(), (0, i.createBlock)(l2, { key: e4, options: t4 }, null, 8, ["options"]);
          }), 128)), (0, i.createElementVNode)("div", { class: "ep-legend--container", style: (0, i.normalizeStyle)({ maxWidth: "".concat(t3.size, "px") }) }, [f2.isMultiple ? (0, i.createCommentVNode)("", true) : ((0, i.openBlock)(), (0, i.createElementBlock)("div", { key: 0, class: (0, i.normalizeClass)(["ep-legend--value", [t3.legendClass, { "ep-hidden": f2.shouldHideLegendValue }]]), style: (0, i.normalizeStyle)([{ height: "".concat(t3.legendHeight, "px"), fontSize: t3.fontSize, color: t3.fontColor }, { transition: "0.3s" }]) }, [(0, i.createElementVNode)("div", s, [(0, i.createVNode)(p3, { value: f2.computedLegend, animation: f2.normalizedCircles[0].animation, loading: t3.loading }, { default: (0, i.withCtx)(function(e4) {
            var r4 = e4.counterTick;
            return [t3.legendFormatter ? ((0, i.openBlock)(), (0, i.createElementBlock)(i.Fragment, { key: 0 }, [f2.isHTML ? ((0, i.openBlock)(), (0, i.createElementBlock)("span", { key: 0, innerHTML: t3.legendFormatter(r4) }, null, 8, c)) : ((0, i.openBlock)(), (0, i.createElementBlock)("span", u, (0, i.toDisplayString)(t3.legendFormatter(r4)), 1))], 64)) : (0, i.renderSlot)(t3.$slots, "default", { key: 1, counterTick: r4 }, function() {
              return [(0, i.createElementVNode)("span", null, (0, i.toDisplayString)(r4.currentFormattedValue), 1)];
            }, true)];
          }), _: 3 }, 8, ["value", "animation", "loading"]), (0, i.renderSlot)(t3.$slots, "legend", {}, void 0, true)], 512)], 6)), (0, i.renderSlot)(t3.$slots, "legend-caption", {}, void 0, true)], 4)])], 4);
        }
        n(7941), n(2526), n(7327), n(1539), n(5003), n(4747), n(9337);
        function l(t3, e3, r3) {
          return e3 in t3 ? Object.defineProperty(t3, e3, { value: r3, enumerable: true, configurable: true, writable: true }) : t3[e3] = r3, t3;
        }
        function p2(t3, e3) {
          var r3 = Object.keys(t3);
          if (Object.getOwnPropertySymbols) {
            var n2 = Object.getOwnPropertySymbols(t3);
            e3 && (n2 = n2.filter(function(e4) {
              return Object.getOwnPropertyDescriptor(t3, e4).enumerable;
            })), r3.push.apply(r3, n2);
          }
          return r3;
        }
        function d(t3) {
          for (var e3 = 1; e3 < arguments.length; e3++) {
            var r3 = null != arguments[e3] ? arguments[e3] : {};
            e3 % 2 ? p2(Object(r3), true).forEach(function(e4) {
              l(t3, e4, r3[e4]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t3, Object.getOwnPropertyDescriptors(r3)) : p2(Object(r3)).forEach(function(e4) {
              Object.defineProperty(t3, e4, Object.getOwnPropertyDescriptor(r3, e4));
            });
          }
          return t3;
        }
        n(4916), n(7601), n(3210), n(9714), n(1249), n(2222), n(4048), n(9653);
        var h2 = function(t3) {
          return void 0 !== t3 && "" !== t3 && null !== t3 && !Number.isNaN(parseFloat(t3));
        }, v = function(t3) {
          return "string" === typeof t3 || t3 instanceof String;
        }, m = function(t3) {
          return !!h2(t3) && parseFloat(t3);
        }, g = { currentValue: 0, countProgress: 0, currentFormattedValue: "0", currentRawValue: 0, duration: 0, previousCountStepValue: 0, start: 0, end: 0, difference: 0, currentDifference: 0, oneStepDifference: 0, startTime: 0, elapsed: 0 };
        function y(t3) {
          if (Array.isArray(t3))
            return t3;
        }
        n(1817), n(2165), n(6992), n(8783), n(3948);
        function b(t3, e3) {
          var r3 = null == t3 ? null : "undefined" !== typeof Symbol && t3[Symbol.iterator] || t3["@@iterator"];
          if (null != r3) {
            var n2, o2, i2 = [], a2 = true, s2 = false;
            try {
              for (r3 = r3.call(t3); !(a2 = (n2 = r3.next()).done); a2 = true)
                if (i2.push(n2.value), e3 && i2.length === e3)
                  break;
            } catch (c2) {
              s2 = true, o2 = c2;
            } finally {
              try {
                a2 || null == r3["return"] || r3["return"]();
              } finally {
                if (s2)
                  throw o2;
              }
            }
            return i2;
          }
        }
        n(7042), n(8309), n(1038);
        function k(t3, e3) {
          (null == e3 || e3 > t3.length) && (e3 = t3.length);
          for (var r3 = 0, n2 = new Array(e3); r3 < e3; r3++)
            n2[r3] = t3[r3];
          return n2;
        }
        function x(t3, e3) {
          if (t3) {
            if ("string" === typeof t3)
              return k(t3, e3);
            var r3 = Object.prototype.toString.call(t3).slice(8, -1);
            return "Object" === r3 && t3.constructor && (r3 = t3.constructor.name), "Map" === r3 || "Set" === r3 ? Array.from(t3) : "Arguments" === r3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r3) ? k(t3, e3) : void 0;
          }
        }
        n(1703);
        function w() {
          throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        function S(t3, e3) {
          return y(t3) || b(t3, e3) || x(t3, e3) || w();
        }
        function _(t3) {
          return _ = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t4) {
            return typeof t4;
          } : function(t4) {
            return t4 && "function" == typeof Symbol && t4.constructor === Symbol && t4 !== Symbol.prototype ? "symbol" : typeof t4;
          }, _(t3);
        }
        n(6699), n(3123), n(5306), n(6755);
        var E = function() {
          var t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "transparent";
          return { type: [String, Object], required: false, default: t3, validator: function(t4) {
            return "string" === typeof t4 ? t4 : !("object" !== _(t4) || !t4.colors) && t4.colors.every(function(t5) {
              return t5.color && t5.offset;
            });
          } };
        }, O = function(t3) {
          return Object.keys(t3).every(function(e3) {
            return ["opacity", "duration"].includes(e3) ? h2(t3[e3]) && t3[e3] >= 0 : T[e3].validator(t3[e3]);
          });
        }, C = { type: String, required: false, default: "center", validator: function(t3) {
          var e3 = t3.toString().split(" "), r3 = S(e3, 2), n2 = r3[0], o2 = r3[1], i2 = !o2 || !Number.isNaN(parseFloat(o2));
          return ["center", "out", "in"].includes(n2) && i2;
        } }, T = { data: { type: Array, required: false, default: function() {
          return [];
        } }, progress: { type: Number, require: true, validator: function(t3) {
          return t3 >= -100 && t3 <= 100;
        } }, legend: { type: [Number, String], required: false, validator: function(t3) {
          return !Number.isNaN(parseFloat(t3.toString().replace(",", ".")));
        } }, size: { type: Number, required: false, default: 200, validator: function(t3) {
          return t3 >= 0;
        } }, thickness: { type: [Number, String], required: false, default: "5%", validator: function(t3) {
          return parseFloat(t3) >= 0;
        } }, emptyThickness: { type: [Number, String], required: false, default: "5%", validator: function(t3) {
          return parseFloat(t3) >= 0;
        } }, line: { type: String, required: false, default: "round", validator: function(t3) {
          return ["round", "butt", "square"].includes(t3);
        } }, lineMode: { type: String, required: false, default: "center", validator: function(t3) {
          var e3 = t3.split(" "), r3 = ["center", "out", "out-over", "in", "in-over", "top", "bottom"].includes(e3[0]), n2 = !e3[1] || !Number.isNaN(parseFloat(e3[1]));
          return r3 && n2;
        } }, linePosition: C, emptyLinePosition: C, color: E("#3f79ff"), emptyColor: E("#e6e9f0"), colorFill: E(), emptyColorFill: E(), fontSize: { type: String, required: false }, fontColor: { type: String, required: false }, animation: { type: String, required: false, default: "default 1000 400", validator: function(t3) {
          var e3 = t3.split(" "), r3 = ["default", "rs", "loop", "reverse", "bounce"].some(function(t4) {
            return t4 === e3[0];
          }), n2 = !e3[1] || parseFloat(e3[1]) >= 0, o2 = !e3[2] || parseFloat(e3[2]) >= 0;
          return r3 && n2 && o2;
        } }, hideLegend: { type: Boolean, required: false, default: false }, legendClass: { type: String, required: false }, angle: { type: [String, Number], required: false, default: -90 }, loading: { type: Boolean, required: false, default: false }, noData: { type: Boolean, required: false, default: false }, dash: { type: String, required: false, default: "", validator: function(t3) {
          if (t3.startsWith("strict")) {
            var e3 = t3.split(" ");
            return parseFloat(e3[1]) >= 0 && parseFloat(e3[2]) >= 0;
          }
          return true;
        } }, half: { type: Boolean, required: false, default: false }, gap: { type: Number, required: false, default: 0, validator: function(t3) {
          return !Number.isNaN(parseInt(t3, 10));
        } }, determinate: { type: Boolean, required: false, default: false }, dot: { type: [String, Number, Object], required: false, default: 0, validator: function(t3) {
          return "object" === _(t3) ? void 0 !== t3.size && !Number.isNaN(parseFloat(t3.size)) : !Number.isNaN(parseFloat(t3));
        } }, reverse: { type: Boolean, required: false, default: false }, legendFormatter: { type: Function, required: false }, loader: { type: Object, required: false, default: function() {
          return {};
        }, validator: function(t3) {
          var e3 = Object.keys(t3).every(function(t4) {
            return ["thickness", "color", "lineMode", "line", "opacity", "duration"].includes(t4);
          });
          return !!e3 && O(t3);
        } } }, j = T, P = ["height", "width"], F = { class: "ep-circle--container" };
        function N(t3, e3, r3, n2, o2, a2) {
          var s2 = (0, i.resolveComponent)("gradient"), c2 = (0, i.resolveComponent)("circle-dot");
          return (0, i.openBlock)(), (0, i.createElementBlock)("div", { class: (0, i.normalizeClass)(["ep-svg-container", { "ep-reverse": r3.options.reverse }]) }, [((0, i.openBlock)(), (0, i.createElementBlock)("svg", { class: "ep-svg", height: r3.options.size, width: r3.options.size, xmlns: "http://www.w3.org/2000/svg" }, [(0, i.createElementVNode)("g", F, [(0, i.createElementVNode)("defs", null, [a2.isColorGradient ? ((0, i.openBlock)(), (0, i.createBlock)(s2, { key: 0, color: r3.options.color, type: "progress", uid: a2.uid }, null, 8, ["color", "uid"])) : (0, i.createCommentVNode)("", true), a2.isColorFillGradient ? ((0, i.openBlock)(), (0, i.createBlock)(s2, { key: 1, color: r3.options.colorFill, type: "progress-fill", uid: a2.uid }, null, 8, ["color", "uid"])) : (0, i.createCommentVNode)("", true), a2.isEmptyColorGradient ? ((0, i.openBlock)(), (0, i.createBlock)(s2, { key: 2, color: r3.options.emptyColor, type: "empty", uid: a2.uid }, null, 8, ["color", "uid"])) : (0, i.createCommentVNode)("", true), a2.isEmptyColorFillGradient ? ((0, i.openBlock)(), (0, i.createBlock)(s2, { key: 3, color: r3.options.emptyColorFill, type: "empty-fill", uid: a2.uid }, null, 8, ["color", "uid"])) : (0, i.createCommentVNode)("", true), a2.isLoaderColorGradient ? ((0, i.openBlock)(), (0, i.createBlock)(s2, { key: 4, color: r3.options.loader.color, type: "loader", uid: a2.uid }, null, 8, ["color", "uid"])) : (0, i.createCommentVNode)("", true)]), ((0, i.openBlock)(), (0, i.createBlock)((0, i.resolveDynamicComponent)(a2.circleType), { options: a2.computedOptions }, null, 8, ["options"]))])], 8, P)), r3.options.dot.size ? ((0, i.openBlock)(), (0, i.createBlock)(c2, { key: 0, options: a2.computedOptions }, null, 8, ["options"])) : (0, i.createCommentVNode)("", true)], 2);
        }
        var I = ["offset", "stop-color", "stop-opacity"];
        function A(t3, e3, r3, n2, o2, a2) {
          return (0, i.openBlock)(), (0, i.createBlock)((0, i.resolveDynamicComponent)(a2.gradientComponent), { id: "ep-".concat(r3.type, "-gradient-").concat(r3.uid), x1: "0%", y1: "100%", x2: "0%", y2: "0%", "area-hidden": "true" }, { default: (0, i.withCtx)(function() {
            return [((0, i.openBlock)(true), (0, i.createElementBlock)(i.Fragment, null, (0, i.renderList)(r3.color.colors, function(t4, e4) {
              return (0, i.openBlock)(), (0, i.createElementBlock)("stop", { key: e4, offset: "".concat(t4.offset, "%"), "stop-color": "".concat(t4.color), "stop-opacity": "".concat(a2.isValidNumber(t4.opacity) ? t4.opacity : 1) }, null, 8, I);
            }), 128))];
          }), _: 1 }, 8, ["id"]);
        }
        var D = { name: "Gradient", props: { color: { type: Object, required: true }, type: { type: String, required: true }, uid: { type: Number, required: true } }, methods: { isValidNumber: function(t3) {
          return h2(t3);
        } }, computed: { gradientComponent: function() {
          return this.color.radial ? "radialGradient" : "linearGradient";
        } } }, L = n(3744);
        const M = (0, L.Z)(D, [["render", A]]);
        var R = M, z = ["fill", "d"], B = ["stroke-width", "stroke", "d", "stroke-linecap", "stroke-dasharray"], V = ["d", "fill"], G = { key: 0 }, q = ["stroke-width", "d", "stroke", "stroke-dasharray", "stroke-linecap"];
        function $(t3, e3, r3, n2, o2, a2) {
          var s2 = (0, i.resolveComponent)("half-circle-loader"), c2 = (0, i.resolveComponent)("fade-in-transition");
          return (0, i.openBlock)(), (0, i.createElementBlock)("g", { class: "ep-half-circle", style: (0, i.normalizeStyle)({ transitionDuration: t3.styles.transitionDuration, transitionTimingFunction: t3.styles.transitionTimingFunction, transform: "rotate(".concat(t3.angle, "deg)") }) }, ["transparent" !== t3.options.emptyColorFill ? ((0, i.openBlock)(), (0, i.createElementBlock)("path", { key: 0, fill: t3.emptyColorFill, class: (0, i.normalizeClass)(["ep-half-circle--empty__fill", { "ep-circle--nodata": !t3.dataIsAvailable }]), d: a2.emptyFillPath, style: (0, i.normalizeStyle)({ transition: t3.styles.transition }) }, null, 14, z)) : (0, i.createCommentVNode)("", true), (0, i.createElementVNode)("path", { "stroke-width": t3.options.emptyThickness, fill: "transparent", stroke: t3.emptyColor, class: (0, i.normalizeClass)(["ep-half-circle--empty", { "ep-circle--nodata": !t3.dataIsAvailable }]), d: a2.emptyPath, "stroke-linecap": t3.options.line, "stroke-dasharray": t3.emptyDasharray, style: (0, i.normalizeStyle)({ transitionDuration: t3.animationDuration, transitionTimingFunction: t3.styles.transitionTimingFunction }) }, null, 14, B), "transparent" !== t3.options.colorFill ? ((0, i.openBlock)(), (0, i.createElementBlock)("path", { key: 1, class: "ep-half-circle--progress__fill", d: a2.fillPath, fill: t3.colorFill, style: (0, i.normalizeStyle)({ transition: t3.styles.transition }) }, null, 12, V)) : (0, i.createCommentVNode)("", true), (0, i.createVNode)(c2, null, { default: (0, i.withCtx)(function() {
            return [t3.isLoading ? ((0, i.openBlock)(), (0, i.createElementBlock)("g", G, [(0, i.createVNode)(s2, { options: d(d({}, t3.options), t3.options.loader) }, null, 8, ["options"])])) : (0, i.createCommentVNode)("", true)];
          }), _: 1 }), (0, i.createElementVNode)("path", { "stroke-width": t3.options.thickness, class: (0, i.normalizeClass)(["ep-half-circle--progress ep-circle--progress", t3.animationClass]), d: a2.path, fill: "transparent", stroke: t3.color, "stroke-dasharray": a2.circumference, "stroke-linecap": t3.options.line, style: (0, i.normalizeStyle)(t3.styles) }, null, 14, q)], 4);
        }
        n(8674);
        function H(t3, e3, r3, n2, o2, i2, a2) {
          try {
            var s2 = t3[i2](a2), c2 = s2.value;
          } catch (u2) {
            return void r3(u2);
          }
          s2.done ? e3(c2) : Promise.resolve(c2).then(n2, o2);
        }
        function U(t3) {
          return function() {
            var e3 = this, r3 = arguments;
            return new Promise(function(n2, o2) {
              var i2 = t3.apply(e3, r3);
              function a2(t4) {
                H(i2, n2, o2, a2, s2, "next", t4);
              }
              function s2(t4) {
                H(i2, n2, o2, a2, s2, "throw", t4);
              }
              a2(void 0);
            });
          };
        }
        n(5666), n(2564);
        var Z = function(t3) {
          return t3 / 2;
        }, W = function(t3) {
          return Math.max(t3.thickness, t3.dot.size);
        }, Y = function(t3) {
          return Z(t3.size) - Z(W(t3));
        }, X = function(t3) {
          var e3 = t3.size, r3 = t3.emptyThickness;
          return Z(e3) - Z(r3);
        }, K = function(t3) {
          return W(t3) < t3.emptyThickness ? X(t3) : Y(t3);
        }, J = function(t3) {
          if (0 === t3.index)
            return 0;
          for (var e3 = h2(t3.gap) ? t3.gap : t3.globalGap, r3 = [], n2 = 0; n2 < t3.previousCircles.length; n2++) {
            var o2 = t3.previousCircles[n2], i2 = o2.dot ? o2.dot.size : t3.globalDot.size, a2 = h2(o2.thickness) ? o2.thickness : t3.globalThickness, s2 = h2(o2.gap) ? o2.gap : t3.globalGap, c2 = Math.max(i2, a2);
            r3.push(n2 > 0 ? c2 + s2 : c2);
          }
          return r3.reduce(function(t4, e4) {
            return t4 + e4;
          }) + e3;
        }, Q = function(t3) {
          return K(t3);
        }, tt = function(t3) {
          return pt(t3) - (Z(t3.emptyThickness) + Z(t3.thickness) + t3.lineMode.offset);
        }, et = function(t3) {
          return t3.emptyThickness <= t3.thickness ? Y(t3) : X(t3) - Z(t3.emptyThickness) + Z(t3.thickness);
        }, rt = function(t3) {
          return pt(t3) + Z(t3.emptyThickness);
        }, nt = function(t3) {
          return pt(t3) - Z(t3.emptyThickness);
        }, ot = function(t3) {
          return K(t3);
        }, it = function(t3) {
          var e3 = Z(t3.thickness) + t3.emptyThickness + t3.lineMode.offset;
          return Z(t3.dot.size) > e3 ? X(t3) - (Z(t3.dot.size) - e3) : X(t3);
        }, at = function(t3) {
          var e3 = t3.dot.size - t3.thickness;
          return e3 > 0 ? X(t3) - Z(e3) : X(t3);
        }, st = function(t3) {
          return Y(t3) - (Z(t3.thickness) + Z(t3.emptyThickness) + t3.lineMode.offset);
        }, ct = function(t3) {
          return t3.emptyThickness <= t3.thickness ? Y(t3) - Z(t3.thickness) + Z(t3.emptyThickness) : X(t3);
        }, ut = function(t3) {
          return t3.emptyThickness < Z(W(t3)) ? X(t3) - (Z(W(t3)) - t3.emptyThickness) : X(t3);
        }, ft = function(t3) {
          return X(t3) - Z(W(t3));
        }, lt = function(t3) {
          var e3 = { multiple: function() {
            return Y(t3) - J(t3);
          }, center: function() {
            return Q(t3);
          }, in: function() {
            return tt(t3);
          }, "out-over": function() {
            return et(t3);
          }, bottom: function() {
            return nt(t3);
          }, top: function() {
            return rt(t3);
          } }, r3 = e3[t3.lineMode.mode];
          return r3 ? r3() : Y(t3);
        }, pt = function(t3) {
          var e3 = { multiple: function() {
            return Y(t3) - J(t3);
          }, center: function() {
            return ot(t3);
          }, in: function() {
            return it(t3);
          }, "in-over": function() {
            return at(t3);
          }, out: function() {
            return st(t3);
          }, "out-over": function() {
            return ct(t3);
          }, bottom: function() {
            return ut(t3);
          }, top: function() {
            return ft(t3);
          } }, r3 = e3[t3.lineMode.mode];
          return r3 ? r3() : X(t3);
        }, dt = function(t3, e3, r3) {
          var n2 = t3.position, o2 = t3.offset;
          return "center" === n2 ? r3 : "out" === n2 ? r3 - o2 - e3 / 2 : r3 + e3 / 2;
        }, ht = function() {
          var t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 400;
          return new Promise(function(e3) {
            return setTimeout(function() {
              return e3();
            }, t3);
          });
        }, vt = { name: "CircleMixin", props: { options: { type: Object, required: true } }, data: function() {
          return { isInitialized: false };
        }, computed: { progress: function() {
          return parseFloat(this.options.progress || 0);
        }, progressOffset: function() {
          var t3 = this.circumference - this.progress / 100 * this.circumference;
          return Math.abs(this.circumference - t3) < 1 ? this.circumference - 0.5 : t3;
        }, radius: function() {
          return lt(this.options);
        }, fillRadius: function() {
          return dt(this.options.linePosition, this.options.thickness, this.radius);
        }, emptyRadius: function() {
          return pt(this.options);
        }, emptyFillRadius: function() {
          return dt(this.options.emptyLinePosition, this.options.emptyThickness, this.emptyRadius);
        }, dataIsAvailable: function() {
          return h2(this.progress) && !this.options.noData;
        }, animationClass: function() {
          return ["animation__".concat(!this.options.loading && this.dataIsAvailable && this.isInitialized ? this.options.animation.type : "none")];
        }, animationDuration: function() {
          return "".concat(this.options.animation.duration, "ms");
        }, color: function() {
          return Array.isArray(this.options.color.colors) ? "url(#ep-progress-gradient-".concat(this.options.uid, ")") : this.options.color;
        }, emptyColor: function() {
          return Array.isArray(this.options.emptyColor.colors) ? "url(#ep-empty-gradient-".concat(this.options.uid, ")") : this.options.emptyColor;
        }, colorFill: function() {
          return Array.isArray(this.options.colorFill.colors) ? "url(#ep-progress-fill-gradient-".concat(this.options.uid, ")") : this.options.colorFill;
        }, emptyColorFill: function() {
          return Array.isArray(this.options.emptyColorFill.colors) ? "url(#ep-empty-fill-gradient-".concat(this.options.uid, ")") : this.options.emptyColorFill;
        }, angle: function() {
          return h2(this.options.angle) ? this.options.angle : -90;
        }, transformOrigin: function() {
          return "50% 50%";
        }, emptyDasharray: function() {
          return this.options.dash.count && this.options.dash.spacing ? "".concat(2 * Math.PI * this.emptyRadius * this.getDashPercent(), ",\n              ").concat(2 * Math.PI * this.emptyRadius * this.getDashSpacingPercent()).trim() : this.options.dash;
        }, strokeDashOffset: function() {
          return this.dataIsAvailable && !this.options.loading && this.isInitialized ? this.progressOffset : this.circumference;
        }, styles: function() {
          return { transition: "".concat(this.animationDuration, ", opacity 0.3s"), strokeDashoffset: this.strokeDashOffset, transitionTimingFunction: "ease-in-out", transformOrigin: this.transformOrigin, opacity: this.options.loading || !this.dataIsAvailable ? 0 : 1, "--ep-circumference": this.circumference, "--ep-negative-circumference": this.getNegativeCircumference(), "--ep-double-circumference": this.getDoubleCircumference(), "--ep-stroke-offset": this.progressOffset, "--ep-loop-stroke-offset": this.getLoopOffset(), "--ep-bounce-out-stroke-offset": this.getBounceOutOffset(), "--ep-bounce-in-stroke-offset": this.getBounceInOffset(), "--ep-reverse-stroke-offset": this.getReverseOffset(), "--ep-loading-stroke-offset": 0.2 * this.circumference, "animation-duration": this.animationDuration };
        }, isLoading: function() {
          return (this.options.determinate || this.options.loading) && this.dataIsAvailable;
        } }, methods: { getDashSpacingPercent: function() {
          return this.options.dash.spacing / this.options.dash.count;
        }, getDashPercent: function() {
          return (1 - this.options.dash.spacing) / this.options.dash.count;
        }, getNegativeCircumference: function() {
          return -1 * this.circumference;
        }, getDoubleCircumference: function() {
          return 2 * this.circumference;
        }, getLoopOffset: function() {
          return this.getNegativeCircumference() - (this.circumference - this.progressOffset);
        }, getReverseOffset: function() {
          return this.getDoubleCircumference() + this.progressOffset;
        }, getBounceOutOffset: function() {
          return this.progressOffset < 100 ? 0 : this.progressOffset - 100;
        }, getBounceInOffset: function() {
          return this.circumference - this.progressOffset < 100 ? this.progressOffset : this.progressOffset + 100;
        } }, mounted: function() {
          var t3 = this;
          return U(regeneratorRuntime.mark(function e3() {
            return regeneratorRuntime.wrap(function(e4) {
              while (1)
                switch (e4.prev = e4.next) {
                  case 0:
                    if (t3.options.loading) {
                      e4.next = 3;
                      break;
                    }
                    return e4.next = 3, ht(t3.options.animation.delay);
                  case 3:
                    t3.isInitialized = true;
                  case 4:
                  case "end":
                    return e4.stop();
                }
            }, e3);
          }))();
        } };
        function mt(t3, e3, r3, n2, o2, a2) {
          return (0, i.openBlock)(), (0, i.createBlock)(i.Transition, { mode: "out-in", name: "fade", appear: "" }, { default: (0, i.withCtx)(function() {
            return [(0, i.renderSlot)(t3.$slots, "default", {}, void 0, true)];
          }), _: 3 });
        }
        var gt = { name: "FadeInTransition" };
        n(4624);
        const yt = (0, L.Z)(gt, [["render", mt], ["__scopeId", "data-v-873ef638"]]);
        var bt = yt, kt = ["stroke-width", "d", "stroke", "stroke-dasharray", "stroke-linecap"];
        function xt(t3, e3, r3, n2, o2, a2) {
          return (0, i.openBlock)(), (0, i.createElementBlock)("g", { class: "ep-half-circle--loader__container", style: (0, i.normalizeStyle)({ opacity: a2.opacity }) }, [(0, i.createElementVNode)("path", { "stroke-width": t3.options.thickness, class: "ep-half-circle--loader animation__loading", d: a2.path, fill: "transparent", stroke: a2.halfLoaderColor, "stroke-dasharray": a2.circumference, "stroke-linecap": t3.options.line, style: (0, i.normalizeStyle)({ transitionTimingFunction: t3.styles.transitionTimingFunction, transitionDuration: "".concat(t3.styles["animation-duration"], "ms"), transformOrigin: t3.styles.transformOrigin, animationDuration: a2.animationDurationStyle, "--ep-loading-stroke-offset": t3.styles["--ep-loading-stroke-offset"], "--ep-circumference": t3.styles["--ep-circumference"], "--ep-negative-circumference": t3.styles["--ep-negative-circumference"] }) }, null, 12, kt)], 4);
        }
        var wt = { name: "HalfCircleLoader", mixins: [vt], computed: { circumference: function() {
          return 2 * this.radius * Math.PI / 2;
        }, path: function() {
          return " M ".concat(this.position, ", ").concat(this.options.size / 2, " a ").concat(this.radius, ",").concat(this.radius, " 0 1,1 ").concat(2 * this.radius, ",0");
        }, position: function() {
          return this.options.size / 2 - this.radius;
        }, opacity: function() {
          return this.options.opacity && this.options.opacity >= 0 ? this.options.opacity : 0.55;
        }, animationDuration: function() {
          return this.options.duration && this.options.duration >= 0 ? this.options.duration : 1e3;
        }, animationDurationStyle: function() {
          return "".concat(this.animationDuration, "ms");
        }, halfLoaderColor: function() {
          return Array.isArray(this.options.loader.color.colors) ? "url(#ep-loader-gradient-".concat(this.options.uid, ")") : this.options.color;
        } } };
        n(9904);
        const St = (0, L.Z)(wt, [["render", xt], ["__scopeId", "data-v-0af4dce4"]]);
        var _t = St, Et = { name: "HalfCircleProgress", components: { HalfCircleLoader: _t, FadeInTransition: bt }, mixins: [vt], computed: { circumference: function() {
          return 2 * this.radius * Math.PI / 2;
        }, path: function() {
          return this.getPath(this.radius);
        }, fillPath: function() {
          return this.getPath(this.fillRadius);
        }, emptyPath: function() {
          return this.getPath(this.emptyRadius);
        }, emptyFillPath: function() {
          return this.getPath(this.emptyFillRadius);
        } }, methods: { getPosition: function(t3) {
          return this.options.size / 2 - t3;
        }, getPath: function(t3) {
          return " M ".concat(this.getPosition(t3), ", ").concat(this.options.size / 2, " a ").concat(t3, ",").concat(t3, " 0 1,1 ").concat(2 * t3, ",0");
        } } };
        n(9536);
        const Ot = (0, L.Z)(Et, [["render", $], ["__scopeId", "data-v-58d6f8b2"]]);
        var Ct = Ot, Tt = ["r", "cx", "cy", "fill"], jt = ["r", "cx", "cy", "stroke", "stroke-dasharray", "stroke-width"], Pt = ["r", "cx", "cy", "fill"], Ft = { key: 0 }, Nt = ["r", "cx", "cy", "stroke", "stroke-width", "stroke-linecap", "stroke-dasharray"];
        function It(t3, e3, r3, n2, o2, a2) {
          var s2 = (0, i.resolveComponent)("circle-loader"), c2 = (0, i.resolveComponent)("fade-in-transition");
          return (0, i.openBlock)(), (0, i.createElementBlock)("g", { class: "ep-circle", style: (0, i.normalizeStyle)({ transitionDuration: t3.styles.transitionDuration, transitionTimingFunction: t3.styles.transitionTimingFunction, transform: "rotate(".concat(t3.angle, "deg)") }) }, ["transparent" !== t3.options.emptyColorFill ? ((0, i.openBlock)(), (0, i.createElementBlock)("circle", { key: 0, class: (0, i.normalizeClass)(["ep-circle--empty__fill", { "ep-circle--nodata": !t3.dataIsAvailable }]), r: t3.emptyFillRadius, cx: a2.position, cy: a2.position, fill: t3.emptyColorFill, style: (0, i.normalizeStyle)({ transitionDuration: t3.animationDuration, transitionTimingFunction: t3.styles.transitionTimingFunction }) }, null, 14, Tt)) : (0, i.createCommentVNode)("", true), (0, i.createElementVNode)("circle", { class: (0, i.normalizeClass)(["ep-circle--empty", { "ep-circle--nodata": !t3.dataIsAvailable }]), r: t3.emptyRadius, cx: a2.position, cy: a2.position, stroke: t3.emptyColor, "stroke-dasharray": t3.emptyDasharray, fill: "transparent", style: (0, i.normalizeStyle)({ transitionDuration: t3.animationDuration, transitionTimingFunction: t3.styles.transitionTimingFunction }), "stroke-width": t3.options.emptyThickness }, null, 14, jt), "transparent" !== t3.options.colorFill ? ((0, i.openBlock)(), (0, i.createElementBlock)("circle", { key: 1, class: (0, i.normalizeClass)(["ep-circle--progress__fill", { "ep-circle--nodata": !t3.dataIsAvailable }]), r: t3.fillRadius, cx: a2.position, cy: a2.position, fill: t3.colorFill, style: (0, i.normalizeStyle)({ transition: t3.styles.transition }) }, null, 14, Pt)) : (0, i.createCommentVNode)("", true), (0, i.createVNode)(c2, null, { default: (0, i.withCtx)(function() {
            return [t3.isLoading ? ((0, i.openBlock)(), (0, i.createElementBlock)("g", Ft, [(0, i.createVNode)(s2, { options: d(d({}, t3.options), t3.options.loader) }, null, 8, ["options"])])) : (0, i.createCommentVNode)("", true)];
          }), _: 1 }), (0, i.createElementVNode)("circle", { class: (0, i.normalizeClass)(["ep-circle--progress", t3.animationClass]), r: t3.radius, cx: a2.position, cy: a2.position, fill: "transparent", stroke: t3.color, "stroke-width": t3.options.thickness, "stroke-linecap": t3.options.line, "stroke-dasharray": a2.circumference, style: (0, i.normalizeStyle)(t3.styles) }, null, 14, Nt)], 4);
        }
        var At = ["r", "cx", "cy", "stroke", "stroke-width", "stroke-linecap", "stroke-dasharray"];
        function Dt(t3, e3, r3, n2, o2, a2) {
          return (0, i.openBlock)(), (0, i.createElementBlock)("g", { class: "ep-circle--loader__container", style: (0, i.normalizeStyle)({ opacity: a2.opacity }) }, [(0, i.createElementVNode)("circle", { class: "ep-circle--loader animation__loading", r: t3.radius, cx: a2.position, cy: a2.position, fill: "transparent", stroke: a2.loaderColor, "stroke-width": t3.options.thickness, "stroke-linecap": t3.options.line, "stroke-dasharray": a2.circumference, style: (0, i.normalizeStyle)({ transition: "all", transitionTimingFunction: t3.styles.transitionTimingFunction, transitionDuration: "".concat(t3.styles["animation-duration"], "ms"), transformOrigin: t3.styles.transformOrigin, animationDuration: a2.animationDurationStyle, "--ep-loading-stroke-offset": t3.styles["--ep-loading-stroke-offset"], "--ep-circumference": t3.styles["--ep-circumference"] }) }, null, 12, At)], 4);
        }
        var Lt = { name: "CircleLoader", mixins: [vt], computed: { position: function() {
          return this.options.size / 2;
        }, circumference: function() {
          return 2 * this.radius * Math.PI;
        }, opacity: function() {
          return this.options.opacity && this.options.opacity >= 0 ? this.options.opacity : 0.55;
        }, animationDuration: function() {
          return this.options.duration && this.options.duration >= 0 ? this.options.duration : 1e3;
        }, animationDurationStyle: function() {
          return "".concat(2 * this.animationDuration, "ms, ").concat(this.animationDuration, "ms");
        }, loaderColor: function() {
          return Array.isArray(this.options.loader.color.colors) ? "url(#ep-loader-gradient-".concat(this.options.uid, ")") : this.options.color;
        } } };
        const Mt = (0, L.Z)(Lt, [["render", Dt]]);
        var Rt = Mt, zt = { name: "CircleProgress", components: { CircleLoader: Rt, FadeInTransition: bt }, mixins: [vt], computed: { position: function() {
          return this.options.size / 2;
        }, circumference: function() {
          return 2 * this.radius * Math.PI;
        } } };
        n(298);
        const Bt = (0, L.Z)(zt, [["render", It], ["__scopeId", "data-v-016e1ca5"]]);
        var Vt = Bt;
        function Gt(t3, e3, r3, n2, o2, a2) {
          return (0, i.openBlock)(), (0, i.createElementBlock)("div", { class: (0, i.normalizeClass)(["ep-circle--progress__dot-container", a2.dotContainerClasses]), style: (0, i.normalizeStyle)(a2.dotContainerStyle) }, [(0, i.createElementVNode)("div", null, [(0, i.createElementVNode)("span", { class: (0, i.normalizeClass)(["ep-circle--progress__dot", { "ep-hidden": a2.isHidden }]), style: (0, i.normalizeStyle)(a2.dotStyle) }, null, 6)])], 6);
        }
        var qt = { name: "CircleDot", mixins: [vt], computed: { dotContainerSize: function() {
          return 2 * this.radius + this.dotSize;
        }, dotContainerRotation: function() {
          return this.isInitialized && !this.options.loading && this.dataIsAvailable ? this.dotEnd : this.dotStart;
        }, dotContainerFullRotationDeg: function() {
          return this.options.half ? 180 : 360;
        }, dotSize: function() {
          return this.options.dot.size;
        }, dotColor: function() {
          return this.options.dot.color;
        }, globalDotSize: function() {
          return this.globalDot.size;
        }, dotContainerStyle: function() {
          return d({ width: "".concat(this.dotContainerSize, "px"), height: "".concat(this.dotContainerSize, "px"), transform: "rotate(".concat(this.dotContainerRotation, "deg)"), transitionDuration: this.options.loading || !this.dataIsAvailable ? "0s" : this.animationDuration, transitionTimingFunction: "ease-in-out", "animation-duration": this.animationDuration, "--ep-dot-start": "".concat(this.dotStart, "deg"), "--ep-dot-end": "".concat(this.dotEnd, "deg"), "--ep-dot-360": "".concat(this.dotStart + this.dotContainerFullRotationDeg, "deg") }, this.dotContainerAnimationStyle);
        }, dotContainerClasses: function() {
          return [this.animationClass, !this.options.half || "ep-half-circle-progress__dot"];
        }, dotContainerAnimationStyle: function() {
          var t3 = { loop: { opacity: this.options.half ? 0 : 1, "--ep-dot-loop-end": "".concat(this.dotStart + this.dotContainerFullRotationDeg + this.dotEnd, "deg") }, bounce: { opacity: 0, "animation-duration": "".concat(this.options.animation.duration + 10 * this.options.animation.duration / 100, "ms") } };
          return t3[this.options.animation.type];
        }, dotStyle: function() {
          return d(d({ borderRadius: "".concat(this.dotSize / 2, "px"), width: "".concat(this.dotSize, "px"), backgroundColor: this.dotColor }, this.options.dot), {}, { transitionDuration: this.options.loading || !this.dataIsAvailable ? "0s" : this.animationDuration, height: "".concat(this.dotSize, "px") });
        }, dotStart: function() {
          return this.options.half ? this.angle - 90 : this.angle + 90;
        }, dotEnd: function() {
          var t3 = this.calculateProgress();
          return this.dotStart + t3 * this.dotContainerFullRotationDeg / 100;
        }, isHidden: function() {
          return !this.isInitialized || this.options.loading || !this.dataIsAvailable;
        } }, methods: { calculateProgress: function() {
          return this.options.half && this.progress < 0 ? this.progress - 100 : this.progress;
        } } };
        n(5340);
        const $t = (0, L.Z)(qt, [["render", Gt], ["__scopeId", "data-v-12292afe"]]);
        var Ht = $t, Ut = { name: "CircleContainer", components: { CircleDot: Ht, CircleProgress: Vt, HalfCircleProgress: Ct, Gradient: R }, props: { options: { type: Object, required: true } }, computed: { computedOptions: function() {
          return d(d({}, this.options), {}, { uid: this.uid });
        }, circleType: function() {
          return this.options.half ? "half-circle-progress" : "circle-progress";
        }, isColorGradient: function() {
          return Array.isArray(this.options.color.colors);
        }, isColorFillGradient: function() {
          return Array.isArray(this.options.colorFill.colors);
        }, isEmptyColorGradient: function() {
          return Array.isArray(this.options.emptyColor.colors);
        }, isEmptyColorFillGradient: function() {
          return Array.isArray(this.options.emptyColorFill.colors);
        }, isLoaderColorGradient: function() {
          return Array.isArray(this.options.loader.color.colors);
        }, uid: function() {
          return this.$.uid;
        } } };
        n(2371);
        const Zt = (0, L.Z)(Ut, [["render", N]]);
        var Wt = Zt, Yt = { class: "ep-legend--value__counter" };
        function Xt(t3, e3, r3, n2, o2, a2) {
          return (0, i.openBlock)(), (0, i.createElementBlock)("span", Yt, [(0, i.renderSlot)(t3.$slots, "default", { counterTick: a2.counterProps })]);
        }
        function Kt(t3) {
          if (Array.isArray(t3))
            return k(t3);
        }
        function Jt(t3) {
          if ("undefined" !== typeof Symbol && null != t3[Symbol.iterator] || null != t3["@@iterator"])
            return Array.from(t3);
        }
        function Qt() {
          throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        function te(t3) {
          return Kt(t3) || Jt(t3) || x(t3) || Qt();
        }
        n(2023), n(9600), n(3290), n(6977);
        var ee = { name: "Counter", props: { value: { type: [Number, String], required: true }, animation: { type: Object, required: true }, loading: { type: Boolean, required: true } }, data: function() {
          return { start: 0, startTime: 0, elapsed: 0, currentValue: 0, raf: null, previousCountStepValue: 0 };
        }, watch: { value: function() {
          this.start = this.currentValue, this.reset(), this.raf = requestAnimationFrame(this.count);
        } }, computed: { end: function() {
          return parseFloat(this.value.toString().replace(",", "."));
        }, difference: function() {
          return Math.abs(this.end - this.start);
        }, currentDifference: function() {
          return Math.abs(this.end - this.currentValue);
        }, oneStepDifference: function() {
          return 0 === this.duration ? this.difference : this.difference / this.duration;
        }, delimiter: function() {
          return this.value.toString().includes(",") ? "," : ".";
        }, formattedValue: function() {
          if (v(this.value) && !this.value.includes("-")) {
            var t3 = this.value.toString().replace(/\s/g, "").split(this.delimiter), e3 = S(t3, 1), r3 = e3[0];
            r3 = te(r3).fill("0").join("");
            var n2 = this.currentValue.toFixed(this.decimalsCount).replace(".", this.delimiter).split(this.delimiter), o2 = S(n2, 2), i2 = o2[0], a2 = o2[1];
            return "".concat(r3.slice(i2.length)).concat(i2).concat(a2 ? this.delimiter + a2 : "");
          }
          return this.currentValue.toFixed(this.decimalsCount).replace(".", this.delimiter);
        }, delay: function() {
          return this.animation.delay;
        }, duration: function() {
          return this.animation.duration;
        }, countProgress: function() {
          return 100 * Math.abs(this.currentDifference - this.difference) / (this.difference || 1);
        }, decimalsCount: function() {
          return v(this.value) || this.value % 1 !== 0 ? (this.value.toString().replace(/\s/g, "").split(this.delimiter)[1] || "").length : 0;
        }, counterProps: function() {
          return { currentValue: parseFloat(this.formattedValue), countProgress: this.countProgress, currentFormattedValue: this.formattedValue, currentRawValue: this.currentValue, duration: this.duration, previousCountStepValue: this.previousCountStepValue, start: this.start, end: this.end, difference: this.difference, currentDifference: this.currentDifference, oneStepDifference: this.oneStepDifference, startTime: this.startTime, elapsed: this.elapsed };
        } }, methods: { count: function(t3) {
          this.startTime || (this.startTime = t3), this.elapsed = t3 - this.startTime, this.end >= this.start ? this.countUp() : this.countDown(), this.elapsed < this.duration && this.difference > 0.1 && (cancelAnimationFrame(this.raf), this.raf = requestAnimationFrame(this.count)), this.elapsed >= this.duration && (this.currentValue = this.end, this.reset());
        }, countDown: function() {
          var t3 = Math.min(this.oneStepDifference * (this.elapsed || 1), this.difference);
          this.currentValue -= t3 - this.previousCountStepValue, this.previousCountStepValue = t3;
        }, countUp: function() {
          var t3 = Math.min(this.oneStepDifference * (this.elapsed || 1), this.difference);
          this.currentValue += t3 - this.previousCountStepValue, this.previousCountStepValue = t3;
        }, reset: function() {
          this.startTime = 0, this.previousCountStepValue = 0, cancelAnimationFrame(this.raf);
        } }, mounted: function() {
          var t3 = this;
          this.loading ? this.raf = requestAnimationFrame(this.count) : setTimeout(function() {
            t3.raf = requestAnimationFrame(t3.count);
          }, this.delay);
        } };
        const re = (0, L.Z)(ee, [["render", Xt]]);
        var ne = re, oe = function(t3, e3) {
          var r3 = t3.trim().split(" "), n2 = e3 ? "multiple" : r3[0];
          return { mode: n2, offset: m(r3[1]) || 0 };
        }, ie = function(t3) {
          var e3 = t3.trim().split(" ");
          return { type: e3[0], duration: h2(e3[1]) ? parseFloat(e3[1]) : 1e3, delay: h2(e3[2]) ? parseFloat(e3[2]) : 400 };
        }, ae = function(t3) {
          var e3 = t3.trim().split(" "), r3 = "strict" === e3[0];
          return r3 ? { count: parseInt(e3[1], 10), spacing: parseFloat(e3[2]) } : t3;
        }, se = function(t3, e3) {
          var r3 = 0, n2 = "white", o2 = {};
          if ("object" !== _(t3)) {
            var i2 = t3.toString().trim().split(" ");
            r3 = h2(i2[0]) ? i2[0] : 0, n2 = i2[1] || "white";
          } else
            r3 = t3.size || 0, o2 = t3;
          return d(d({}, o2), {}, { size: ce(r3, e3), color: n2 });
        }, ce = function(t3, e3) {
          var r3 = parseFloat(t3);
          return t3.toString().includes("%") ? r3 * e3 / 100 : r3;
        }, ue = function(t3) {
          var e3 = t3.toString().split(" "), r3 = S(e3, 2), n2 = r3[0], o2 = r3[1];
          return { position: n2, offset: parseFloat(o2) || 0 };
        }, fe = function(t3, e3) {
          return d(d({}, t3), {}, { color: t3.color || e3.color, line: t3.line || e3.line, lineMode: oe(t3.lineMode || e3.lineMode, e3.multiple), thickness: ce(t3.thickness || e3.thickness, e3.size) });
        }, le = function(t3) {
          return d(d({}, t3), {}, { thickness: ce(t3.thickness, t3.size), emptyThickness: ce(t3.emptyThickness, t3.size), globalThickness: ce(t3.globalThickness, t3.size), dot: se(t3.dot, t3.size), globalDot: se(t3.globalDot, t3.size), dash: ae(t3.dash), lineMode: oe(t3.lineMode, t3.multiple), linePosition: ue(t3.linePosition), emptyLinePosition: ue(t3.emptyLinePosition), animation: ie(t3.animation), loader: fe(t3.loader, t3) });
        }, pe = { name: "VueEllipseProgress", components: { Counter: ne, CircleContainer: Wt }, props: j, data: function() {
          return { legendHeight: null };
        }, watch: { hideLegend: function() {
          this.updateLegendHeight();
        } }, computed: { computedLegend: function() {
          return this.loading || this.noData ? 0 : this.legend ? this.legend : m(this.progress) || 0;
        }, shouldHideLegendValue: function() {
          return !this.isDataAvailable || this.loading || this.hideLegend;
        }, isDataAvailable: function() {
          return h2(this.progress) && !this.noData;
        }, isMultiple: function() {
          return this.data.length > 1;
        }, isHTML: function() {
          return /<[a-z/][\s\S]*>/i.test((this.legendFormatter && this.legendFormatter(g) || "").toString().trim());
        }, circlesData: function() {
          var t3 = this;
          return this.isMultiple ? this.data.map(function(e3) {
            return d(d(d({}, t3.$props), e3), {}, { multiple: true, emptyThickness: h2(e3.thickness) ? e3.thickness : t3.$props.thickness, data: void 0 });
          }) : [this.$props];
        }, normalizedCircles: function() {
          for (var t3 = [], e3 = [], r3 = 0; r3 < this.circlesData.length; r3++) {
            var n2 = this.circlesData[r3], o2 = le(d(d({ index: r3 }, n2), {}, { globalDot: this.dot, globalGap: this.gap, globalThickness: this.thickness, previousCircles: [].concat(e3) }));
            t3.push(o2);
            var i2 = t3[r3], a2 = i2.gap, s2 = i2.thickness, c2 = i2.dot;
            e3.push({ gap: a2, thickness: s2, dot: c2 });
          }
          return t3;
        } }, methods: { updateLegendHeight: function() {
          var t3 = this;
          this.$nextTick(function() {
            var e3, r3;
            t3.legendHeight = t3.hideLegend ? 0 : null !== (e3 = null === (r3 = t3.$refs.legend) || void 0 === r3 ? void 0 : r3.clientHeight) && void 0 !== e3 ? e3 : 0;
          });
        } }, mounted: function() {
          this.updateLegendHeight();
        } };
        n(5221);
        const de = (0, L.Z)(pe, [["render", f], ["__scopeId", "data-v-a7ff9eba"]]);
        var he = de, ve = function(t3) {
          var e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "ve-progress";
          return t3.component(e3, he);
        }, me = ve, ge = me;
      }(), o;
    }();
  });
})(veprogress_umd_min);
const veProgress = /* @__PURE__ */ getDefaultExportFromCjs(veprogress_umd_min.exports);
const routes = [
  { path: "/", component: HomePage, name: "homepage" },
  { path: "/races/:raceid/:racealias", component: RaceImages, name: "racedetails" }
];
const router = createRouter({
  history: createWebHistory(),
  routes
});
createApp(RunningApp).use(Paginate).use(veProgress).use(router).mount("#app");
