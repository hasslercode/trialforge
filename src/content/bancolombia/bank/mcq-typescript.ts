import type { McqQuestion } from "@/domain/exam";

/**
 * TypeScript MCQ — interview-style reasoning: types, utilities, HOFs, currying.
 */
export const mcqTypescriptBank: McqQuestion[] = [
  {
    id: "ts-curry-complete",
    prompt: "Complete the curry so `add(1)(2)` returns 3.",
    codeLang: "ts",
    code: `function curry(fn) {
  // ?
}

const add = curry((a: number, b: number) => a + b);
add(1)(2); // 3`,
    options: [
      {
        id: "a",
        label: "Return a function that collects args until `fn.length` is reached, then call `fn`",
        code: `return function curried(...args) {
  if (args.length >= fn.length) return fn(...args);
  return (...rest) => curried(...args, ...rest);
};`,
      },
      {
        id: "b",
        label: "Always call fn immediately with the first argument only",
        code: `return (a) => fn(a);`,
      },
      {
        id: "c",
        label: "Use Function.prototype.bind once and ignore remaining args",
        code: `return fn.bind(null);`,
      },
      {
        id: "d",
        label: "Wrap in Promise.resolve so add(1)(2) awaits automatically",
        code: `return async (...args) => fn(...args);`,
      },
    ],
    answerId: "a",
    explanation:
      "Classic curry accumulates arguments until arity is satisfied, then invokes the original function.",
  },
  {
    id: "ts-closure-result",
    prompt: "What does this print?",
    codeLang: "ts",
    code: `function makeCounter() {
  let n = 0;
  return () => ++n;
}
const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b(), a());`,
    options: [
      { id: "a", label: "1 2 1 3" },
      { id: "b", label: "1 2 3 4" },
      { id: "c", label: "0 1 0 2" },
      { id: "d", label: "1 1 1 1" },
    ],
    answerId: "a",
    explanation: "Each makeCounter() call creates its own closed-over `n`. a and b are independent.",
  },
  {
    id: "ts-hof-map",
    prompt: "Which snippet is a higher-order function?",
    options: [
      {
        id: "a",
        label: "A function that takes/returns functions",
        code: `const withLog = (fn) => (...args) => {
  console.log(args);
  return fn(...args);
};`,
      },
      {
        id: "b",
        label: "Any function that returns a number",
        code: `const double = (n: number) => n * 2;`,
      },
      {
        id: "c",
        label: "A class with private fields",
        code: `class Account { #bal = 0 }`,
      },
      {
        id: "d",
        label: "An interface with methods",
        code: `interface Repo { save(): void }`,
      },
    ],
    answerId: "a",
    explanation: "HOFs operate on functions (decorate, compose, partial apply).",
  },
  {
    id: "ts-generic-identity",
    prompt: "Which generic preserves the argument type?",
    codeLang: "ts",
    code: `identity("hola"); // should be string, not unknown`,
    options: [
      { id: "a", label: `function identity<T>(value: T): T { return value; }` },
      { id: "b", label: `function identity(value: any): any { return value; }` },
      { id: "c", label: `function identity(value: unknown): string { return String(value); }` },
      { id: "d", label: `function identity<T>(value: T): unknown { return value; }` },
    ],
    answerId: "a",
    explanation: "`<T>(value: T): T` keeps inference. any/unknown widen or lose type info.",
  },
  {
    id: "ts-keyof-typeof",
    prompt: "What is the type of `keys`?",
    codeLang: "ts",
    code: `const roles = { admin: 1, user: 2 } as const;
type RoleKey = keyof typeof roles;
const keys: RoleKey = /* ? */;`,
    options: [
      { id: "a", label: `"admin" | "user"` },
      { id: "b", label: `string` },
      { id: "c", label: `1 | 2` },
      { id: "d", label: `keyof string` },
    ],
    answerId: "a",
    explanation: "`typeof roles` is the object type; `keyof` yields its property names. `as const` keeps literal keys.",
  },
  {
    id: "ts-infer-return",
    prompt: "What does `ReturnType` use under the hood conceptually?",
    codeLang: "ts",
    code: `type ReturnType<T> = T extends (...args: any) => infer R ? R : never;`,
    options: [
      {
        id: "a",
        label: "Conditional type + `infer` to extract the function return type",
      },
      { id: "b", label: "Mapped type that renames every property to R" },
      { id: "c", label: "Runtime reflection via `typeof` operator" },
      { id: "d", label: "Only works with arrow functions, not methods" },
    ],
    answerId: "a",
    explanation: "`infer R` introduces a type variable from the matched function signature.",
  },
  {
    id: "ts-mapped-readonly",
    prompt: "What does this mapped type produce for `{ a: number; b: string }`?",
    codeLang: "ts",
    code: `type Freeze<T> = { readonly [K in keyof T]: T[K] };`,
    options: [
      { id: "a", label: `{ readonly a: number; readonly b: string }` },
      { id: "b", label: `{ a?: number; b?: string }` },
      { id: "c", label: `{ a: Readonly<number>; b: Readonly<string> }` },
      { id: "d", label: `never` },
    ],
    answerId: "a",
    explanation: "Maps each key to the same value type with a readonly modifier — same idea as Readonly<T>.",
  },
  {
    id: "ts-conditional-exclude",
    prompt: "What is `Exclude<'a'|'b'|'c', 'a'>`?",
    options: [
      { id: "a", label: `"b" | "c"` },
      { id: "b", label: `"a"` },
      { id: "c", label: `"a" | "b" | "c"` },
      { id: "d", label: `never` },
    ],
    answerId: "a",
    explanation: "Exclude removes members of a union that are assignable to the second type parameter.",
  },
  {
    id: "ts-partial-pick",
    prompt: "You need a PATCH DTO: only `email` and `phone`, both optional. Best utility combo?",
    codeLang: "ts",
    code: `type User = { id: string; email: string; phone: string; role: string };`,
    options: [
      { id: "a", label: `Partial<Pick<User, 'email' | 'phone'>>` },
      { id: "b", label: `Pick<Partial<User>, 'id'>` },
      { id: "c", label: `Required<Omit<User, 'role'>>` },
      { id: "d", label: `Record<'email' | 'phone', User>` },
    ],
    answerId: "a",
    explanation: "Pick narrows fields; Partial makes them optional. Perfect for PATCH bodies.",
  },
  {
    id: "ts-omit-vs-pick",
    prompt: "For a public profile API you must hide `passwordHash` and `ssn`. Clearest type?",
    codeLang: "ts",
    code: `type User = {
  id: string;
  name: string;
  passwordHash: string;
  ssn: string;
};`,
    options: [
      { id: "a", label: `Omit<User, 'passwordHash' | 'ssn'>` },
      { id: "b", label: `Partial<User>` },
      { id: "c", label: `Pick<User, 'passwordHash'>` },
      { id: "d", label: `Readonly<User>` },
    ],
    answerId: "a",
    explanation: "Omit removes sensitive keys while keeping the rest required.",
  },
  {
    id: "ts-record-map",
    prompt: "Type a dictionary from currency code to rate number:",
    options: [
      { id: "a", label: `Record<string, number>` },
      { id: "b", label: `Pick<string, number>` },
      { id: "c", label: `Partial<number>` },
      { id: "d", label: `Omit<string, number>` },
    ],
    answerId: "a",
    explanation: "Record<K,V> builds an object type with keys K and values V.",
  },
  {
    id: "ts-readonly-array",
    prompt: "What fails to compile?",
    codeLang: "ts",
    code: `function total(xs: ReadonlyArray<number>) {
  // which line is illegal?
}`,
    options: [
      { id: "a", label: `xs.push(1)` },
      { id: "b", label: `xs.map((n) => n * 2)` },
      { id: "c", label: `xs.reduce((a, b) => a + b, 0)` },
      { id: "d", label: `xs.filter((n) => n > 0)` },
    ],
    answerId: "a",
    explanation: "ReadonlyArray forbids mutating methods like push/splice; map/filter/reduce are fine.",
  },
  {
    id: "ts-result-code-narrow",
    prompt: "After this check, what is the type of `value` inside the if?",
    codeLang: "ts",
    code: `type Result = { ok: true; value: number } | { ok: false; error: string };
function handle(r: Result) {
  if (r.ok) {
    // typeof r.value ?
  }
}`,
    options: [
      { id: "a", label: "number — discriminated union narrows on `ok`" },
      { id: "b", label: "number | undefined" },
      { id: "c", label: "string" },
      { id: "d", label: "any" },
    ],
    answerId: "a",
    explanation: "Literal `ok: true` discriminates the union so `value` is available.",
  },
  {
    id: "ts-satisfies-vs-as",
    prompt: "Why prefer `satisfies` over `as` when validating a config object?",
    options: [
      {
        id: "a",
        label: "satisfies checks assignability while preserving literal inference; `as` can lie",
      },
      { id: "b", label: "satisfies erases all types at compile time harder than `as`" },
      { id: "c", label: "as is deprecated and no longer parses" },
      { id: "d", label: "satisfies only works with classes" },
    ],
    answerId: "a",
    explanation: "`as` forces a type; `satisfies` validates without widening away literals.",
  },
  {
    id: "ts-partial-apply-output",
    prompt: "What is logged?",
    codeLang: "ts",
    code: `const multiply = (a: number) => (b: number) => a * b;
const double = multiply(2);
console.log(double(5));`,
    options: [
      { id: "a", label: "10" },
      { id: "b", label: "7" },
      { id: "c", label: "undefined" },
      { id: "d", label: "TypeError at runtime" },
    ],
    answerId: "a",
    explanation: "Partial application via curried arrow functions: 2 * 5 = 10.",
  },
  {
    id: "ts-utility-required",
    prompt: "`Required<Partial<User>>` is equivalent to:",
    options: [
      { id: "a", label: "User with all properties required again" },
      { id: "b", label: "User with all properties optional" },
      { id: "c", label: "never" },
      { id: "d", label: "Readonly<User>" },
    ],
    answerId: "a",
    explanation: "Partial makes optional; Required removes optionality — back to required fields.",
  },
  {
    id: "ts-keyof-constraint",
    prompt: "Which generic constrains K to keys of T?",
    options: [
      { id: "a", label: `function pluck<T, K extends keyof T>(obj: T, key: K): T[K]` },
      { id: "b", label: `function pluck<T, K>(obj: T, key: K): T` },
      { id: "c", label: `function pluck<T>(obj: T, key: string): any` },
      { id: "d", label: `function pluck(obj: object, key: keyof any): unknown` },
    ],
    answerId: "a",
    explanation: "`K extends keyof T` plus indexed access `T[K]` is the standard pluck pattern.",
  },
  {
    id: "ts-infer-awaited",
    prompt: "What is `Awaited<Promise<Promise<string>>>`?",
    options: [
      { id: "a", label: "string" },
      { id: "b", label: "Promise<string>" },
      { id: "c", label: "Promise<Promise<string>>" },
      { id: "d", label: "unknown" },
    ],
    answerId: "a",
    explanation: "Awaited recursively unwraps Promise-like types to the resolved value.",
  },
];
