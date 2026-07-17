import type { PracticalVariant } from "@/domain/exam";

const restrictions = [
  "Native JavaScript/TypeScript only (no lodash or similar).",
  "You cannot modify the unit test files (locked).",
  "Prioritize a clear solution: the session time is limited.",
];

/**
 * TypeScript / JS functional exercises — curry and similar interview killers.
 */
export const typescriptBank: PracticalVariant[] = [
  {
    variantId: "ts-curry",
    kind: "javascript",
    title: "TypeScript — Currying",
    subtitle: "Implement curry",
    estimatedMinutes: 40,
    story:
      "The classic panel exercise: implement a generic curry so a multi-arg function can be called one argument at a time (or in batches).",
    requirements: [
      "Implement `curry(fn)` that returns a curried function.",
      "`curry((a, b, c) => a + b + c)(1)(2)(3)` → `6`.",
      "Allow partial batches: `curry(add3)(1, 2)(3)` → `6`.",
      "When `args.length >= fn.length`, call `fn` and return the result.",
    ],
    acceptanceCriteria: [
      "Works for arity 2 and 3.",
      "Supports both `f(1)(2)` and `f(1, 2)` while currying.",
      "Uses `fn.length` (not a hardcoded arity).",
      "Hidden tests pass.",
    ],
    restrictions,
    starterFiles: [
      {
        name: "curry.js",
        language: "javascript",
        code: `/**
 * @param {Function} fn
 * @returns {Function}
 */
export function curry(fn) {
  // TODO
  return function curried(...args) {
    return undefined;
  };
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports curry", patterns: [/function\s+curry|const\s+curry\s*=/] },
      { id: "t2", name: "checks fn.length", patterns: [/fn\.length|\.length\s*[>=]/] },
      { id: "t3", name: "returns nested function", patterns: [/return\s+function|return\s*\(.*\)\s*=>|return\s+curried/] },
      { id: "t4", name: "calls fn when complete", patterns: [/fn\s*\(|\.apply\s*\(|\.call\s*\(/] },
      { id: "t5", name: "spreads / concatenates args", patterns: [/\.\.\.|concat/] },
      { id: "t6", name: "no lodash", patterns: [/./], forbidden: [/lodash|_\.curry/] },
    ],
    hints: [
      "if (args.length >= fn.length) return fn(...args);",
      "return (...rest) => curried(...args, ...rest);",
    ],
    solution: `export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...rest) => curried(...args, ...rest);
  };
}`,
    explanation: "Accumulate args until arity is met, then invoke.",
  },
  {
    variantId: "ts-compose",
    kind: "javascript",
    title: "TypeScript — Compose / pipe",
    subtitle: "Right-to-left function composition",
    estimatedMinutes: 40,
    story:
      "Similar difficulty to curry: implement `compose` so `compose(f, g, h)(x)` equals `f(g(h(x)))`.",
    requirements: [
      "Implement `compose(...fns)` for any number of unary functions.",
      "`compose(x => x + 1, x => x * 2)(5)` → `11`.",
      "With zero functions, return the identity (`x => x`).",
      "With one function, return that function (or equivalent).",
    ],
    acceptanceCriteria: [
      "Composes right-to-left.",
      "Handles 0 / 1 / N functions.",
      "Hidden tests pass.",
    ],
    restrictions,
    starterFiles: [
      {
        name: "compose.js",
        language: "javascript",
        code: `/**
 * @param {...Function} fns
 * @returns {Function}
 */
export function compose(...fns) {
  // TODO: f(g(h(x)))
  return (x) => x;
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports compose", patterns: [/function\s+compose|const\s+compose\s*=/] },
      { id: "t2", name: "reduces / iterates fns", patterns: [/reduce|for\s*\(|forEach|while/] },
      { id: "t3", name: "applies functions", patterns: [/fn\s*\(|fns\[/] },
      { id: "t4", name: "right-to-left (reduceRight or reverse)", patterns: [/reduceRight|reverse|length\s*-/] },
      { id: "t5", name: "no lodash", patterns: [/./], forbidden: [/lodash|_\.flow|_\.compose/] },
    ],
    hints: ["return fns.reduceRight((acc, fn) => fn(acc), x) inside the returned function"],
    solution: `export function compose(...fns) {
  if (fns.length === 0) return (x) => x;
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}`,
    explanation: "reduceRight applies the rightmost function first.",
  },
  {
    variantId: "ts-partial",
    kind: "javascript",
    title: "TypeScript — Partial application",
    subtitle: "Bind leading arguments",
    estimatedMinutes: 35,
    story:
      "Implement `partial(fn, ...preset)` so later calls supply the remaining args. Cousin of curry, fixed presets up front.",
    requirements: [
      "`partial((a,b,c) => a+b+c, 1)(2,3)` → `6`.",
      "`partial((a,b) => a*b, 2, 5)()` → `10` (or immediate if complete).",
      "Do not mutate the original function.",
    ],
    acceptanceCriteria: [
      "Presets are applied before new args.",
      "Works when all args are preset.",
      "Hidden tests pass.",
    ],
    restrictions,
    starterFiles: [
      {
        name: "partial.js",
        language: "javascript",
        code: `/**
 * @param {Function} fn
 * @param {...any} preset
 * @returns {Function}
 */
export function partial(fn, ...preset) {
  // TODO
  return (..._args) => undefined;
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports partial", patterns: [/function\s+partial|const\s+partial\s*=/] },
      { id: "t2", name: "returns a function", patterns: [/return\s+function|return\s*\(/] },
      { id: "t3", name: "concatenates preset + args", patterns: [/\.\.\.|concat|preset/] },
      { id: "t4", name: "calls fn", patterns: [/fn\s*\(|\.apply\s*\(|\.call\s*\(/] },
      { id: "t5", name: "no lodash", patterns: [/./], forbidden: [/lodash|_\.partial/] },
    ],
    hints: ["return (...args) => fn(...preset, ...args);"],
    solution: `export function partial(fn, ...preset) {
  return (...args) => fn(...preset, ...args);
}`,
    explanation: "Freeze leading args; accept the rest later.",
  },
  {
    variantId: "ts-debounce",
    kind: "javascript",
    title: "TypeScript — Debounce",
    subtitle: "Delay until calls settle",
    estimatedMinutes: 40,
    story:
      "Interview classic next to curry: `debounce(fn, ms)` only runs `fn` after `ms` of quiet. Used for search boxes.",
    requirements: [
      "Implement `debounce(fn, wait)`.",
      "Each new call resets the timer.",
      "Forward `this` and arguments to `fn` when it finally runs.",
      "Optional: return a cancel helper if you want — not required.",
    ],
    acceptanceCriteria: [
      "Uses setTimeout / clearTimeout.",
      "Does not call fn on every keystroke immediately.",
      "Hidden tests pass.",
    ],
    restrictions,
    starterFiles: [
      {
        name: "debounce.js",
        language: "javascript",
        code: `/**
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(fn, wait) {
  // TODO
  return function debounced(...args) {};
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports debounce", patterns: [/function\s+debounce|const\s+debounce\s*=/] },
      { id: "t2", name: "setTimeout", patterns: [/setTimeout\s*\(/] },
      { id: "t3", name: "clearTimeout", patterns: [/clearTimeout\s*\(/] },
      { id: "t4", name: "calls fn later", patterns: [/fn\s*\.|fn\s*\(|\.apply\s*\(|\.call\s*\(/] },
      { id: "t5", name: "no lodash", patterns: [/./], forbidden: [/lodash|_\.debounce/] },
    ],
    hints: ["let timer; clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), wait);"],
    solution: `export function debounce(fn, wait) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}`,
    explanation: "Reset the timer on every call; fire once after silence.",
  },
  {
    variantId: "ts-flatten",
    kind: "javascript",
    title: "TypeScript — Deep flatten",
    subtitle: "Flatten nested arrays",
    estimatedMinutes: 35,
    story:
      "Implement `flattenDeep(arr)` that flattens arbitrarily nested arrays into one level — functional interview staple.",
    requirements: [
      "`flattenDeep([1, [2, [3, 4], 5]])` → `[1, 2, 3, 4, 5]`.",
      "Do not use `arr.flat(Infinity)` if you want full credit for the algorithm (implement recursion or stack).",
      "Preserve non-array values as-is.",
    ],
    acceptanceCriteria: [
      "Handles deep nesting.",
      "Empty arrays yield [].",
      "Hidden tests pass.",
    ],
    restrictions,
    starterFiles: [
      {
        name: "flattenDeep.js",
        language: "javascript",
        code: `/**
 * @param {any[]} input
 * @returns {any[]}
 */
export function flattenDeep(input) {
  // TODO
  return [];
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports flattenDeep", patterns: [/function\s+flattenDeep/] },
      { id: "t2", name: "recursion or reduce/stack", patterns: [/flattenDeep\s*\(|reduce|push|concat|stack/] },
      { id: "t3", name: "Array.isArray check", patterns: [/Array\.isArray|instanceof\s+Array/] },
      { id: "t4", name: "no flat(Infinity) shortcut only", patterns: [/./], forbidden: [/\.flat\s*\(\s*Infinity\s*\)/] },
      { id: "t5", name: "no lodash", patterns: [/./], forbidden: [/lodash|_\.flattenDeep/] },
    ],
    hints: [
      "if (Array.isArray(x)) result.push(...flattenDeep(x)); else result.push(x);",
    ],
    solution: `export function flattenDeep(input) {
  const out = [];
  for (const item of input) {
    if (Array.isArray(item)) out.push(...flattenDeep(item));
    else out.push(item);
  }
  return out;
}`,
    explanation: "Recurse into arrays; push leaves.",
  },
  {
    variantId: "ts-groupby",
    kind: "javascript",
    title: "TypeScript — groupBy",
    subtitle: "Higher-order groupBy",
    estimatedMinutes: 35,
    story:
      "Implement `groupBy(list, keyFn)` returning an object/map of arrays — HOF style, same family as curry interviews.",
    requirements: [
      "`groupBy([{t:'a'},{t:'b'},{t:'a'}], x => x.t)` → `{ a: [...], b: [...] }`.",
      "Do not mutate the input array.",
      "Missing keys should create a new array bucket.",
    ],
    acceptanceCriteria: [
      "Returns a plain object with array values.",
      "Stable grouping by keyFn result.",
      "Hidden tests pass.",
    ],
    restrictions,
    starterFiles: [
      {
        name: "groupBy.js",
        language: "javascript",
        code: `/**
 * @template T
 * @param {T[]} list
 * @param {(item: T) => string|number} keyFn
 * @returns {Record<string, T[]>}
 */
export function groupBy(list, keyFn) {
  // TODO
  return {};
}
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "exports groupBy", patterns: [/function\s+groupBy/] },
      { id: "t2", name: "iterates list", patterns: [/for\s*\(|forEach|reduce|of\s+list/] },
      { id: "t3", name: "calls keyFn", patterns: [/keyFn\s*\(/] },
      { id: "t4", name: "pushes into buckets", patterns: [/push\s*\(|\[\s*\]/] },
      { id: "t5", name: "no lodash", patterns: [/./], forbidden: [/lodash|_\.groupBy/] },
    ],
    hints: ["const key = String(keyFn(item)); (acc[key] ||= []).push(item);"],
    solution: `export function groupBy(list, keyFn) {
  return list.reduce((acc, item) => {
    const key = String(keyFn(item));
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
}`,
    explanation: "HOF: key function decides the bucket.",
  },
];
