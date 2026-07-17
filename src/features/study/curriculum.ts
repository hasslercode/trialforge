/** Currículo de estudio alineado al banco Bancolombia (MCQ + prácticas). */

import { TOPIC_EXAMPLES, type StudyExample } from "./examples-data";
import { TOPIC_EXAM_COVERAGE, type ExamCoverage } from "./exam-coverage";

export type { StudyExample };
export type { ExamCoverage };

export type StudyTopic = {
  id: string;
  title: string;
  /** Explicación “como a un niño de 8 años”. */
  kidAnalogy: string;
  summary: string;
  keyPoints: string[];
  /** Ejemplos concretos para practicar el tema. */
  examples: StudyExample[];
  /** Cómo se evalúa 1:1 en el simulacro. */
  examCoverage: ExamCoverage;
  /** Qué del banco entrena este tema. */
  bankLinks: string[];
  /** Mini ejemplo o frase memorable. */
  remember?: string;
};

export type StudyTrack = {
  id: string;
  order: number;
  title: string;
  emoji: string;
  tagline: string;
  /** Color de sticky Excalidraw-ish */
  ink: string;
  fill: string;
  topics: StudyTopic[];
};

type RawStudyTopic = Omit<StudyTopic, "examples" | "examCoverage">;
type RawStudyTrack = Omit<StudyTrack, "topics"> & { topics: RawStudyTopic[] };

const rawStudyTracks: RawStudyTrack[] = [
  {
    id: "js-fundamentos",
    order: 1,
    title: "JavaScript fundamentos",
    emoji: "🧩",
    tagline: "Cómo piensa el lenguaje (y el navegador).",
    ink: "#1e3a5f",
    fill: "#a8d4ff",
    topics: [
      {
        id: "js-types-equality",
        title: "Tipos, igualdad y NaN",
        kidAnalogy:
          "Imagina cajas con juguetes. `===` pregunta: ¿es la misma caja del mismo tipo? `==` a veces cambia el juguete de caja antes de comparar… y se confunde. `NaN` es como un juguete roto: nunca es igual ni a sí mismo.",
        summary:
          "Dominar `===`, `typeof`, el caso raro de `typeof null` y por qué `Number.isNaN` es más seguro que `x === NaN`.",
        keyPoints: [
          "`===` no hace coerción; preférelo en código de examen.",
          '`typeof null` es históricamente "object" — trampa clásica.',
          "`NaN` nunca es igual a sí mismo; usa `Number.isNaN`.",
          "Spread en strings: `[...'abc']` → tres letras.",
        ],
        bankLinks: ["f-strict-equality", "f-nan", "f-typeof-null", "f-spread-length", "f-bignumber"],
        remember: "Si dudas: === y Number.isNaN.",
      },
      {
        id: "js-const-immutability",
        title: "const, let e inmutabilidad",
        kidAnalogy:
          "`const` es una etiqueta pegada a una caja: no puedes cambiar la etiqueta por otra caja, pero sí puedes sacar o meter cosas adentro. Para no tocar la caja original, haces una copia con map/filter.",
        summary:
          "const bloquea reasignación, no mutación. En apps bancarias, no mutes arreglos de movimientos.",
        keyPoints: [
          "`const arr` aún permite `arr.push`.",
          "map/filter/reduce crean colecciones nuevas.",
          "Spread de objetos: `{...obj, x: 1}` copia superficial.",
          "JSON.parse(JSON.stringify) vs structuredClone.",
        ],
        bankLinks: ["f-const-let", "f-immutability", "f-spread-object", "f-json-clone", "f-structured-clone"],
        remember: "Nuevo arreglo = no mutar al cliente.",
      },
      {
        id: "js-map-filter-reduce",
        title: "map, filter y reduce",
        kidAnalogy:
          "Tienes una fila de caramelos. `map` le pone un sticker nuevo a cada uno (misma cantidad). `filter` deja pasar solo los que cumplen la regla. `reduce` los mete todos en una bolsa y al final te da un solo resultado (suma, objeto, string…).",
        summary:
          "Los tres caballos de batalla del front/JS puro. Casi todo el banco de algoritmos se reduce a ellos + sort.",
        keyPoints: [
          "`map(fn)` → nuevo array del mismo length; transforma cada ítem.",
          "`filter(fn)` → nuevo array; solo los que devuelven true.",
          "`reduce((acc, item) => …, inicial)` → un acumulador.",
          "Cadena típica: filter inválidos → map tipos → reduce totales.",
          "No mutan el array original (a diferencia de sort/splice/push).",
          "reduce puede agrupar: `acc[key] = […]` o usar un Map.",
        ],
        bankLinks: [
          "f-array-reduce",
          "f-immutability",
          "f-pure-function",
          "js-normalize-movements",
          "js-group-transactions",
        ],
        remember: "map transforma · filter selecciona · reduce resume.",
      },
      {
        id: "js-find-some-every",
        title: "find, some, every, includes",
        kidAnalogy:
          "`find` busca al primer amigo con gorra roja. `some` pregunta: ¿hay al menos uno? `every` pregunta: ¿todos? `includes` es ‘¿está este sticker en la caja?’.",
        summary: "Búsqueda y predicados sobre arrays sin escribir for.",
        keyPoints: [
          "`find` → el elemento o undefined.",
          "`findIndex` → índice o -1.",
          "`some` / `every` → boolean.",
          "`includes` para primitivos; para objetos compara por referencia.",
          "Útil para validar montos, IDs o flags en movimientos.",
        ],
        bankLinks: ["f-pure-function", "js-unique-sorted-ids", "js-normalize-movements"],
        remember: "some = ¿alguien? · every = ¿todos?",
      },
      {
        id: "js-sort-slice-spread",
        title: "sort, slice, spread y rest",
        kidAnalogy:
          "`sort` reordena la fila… ¡pero empuja a los niños originales! Por eso primero clones con `[...arr]` o `slice()`. Spread es sacar todo de una caja a otra; rest es ‘el resto de caramelos’ en parámetros.",
        summary: "Ordenar sin mutar y manejar colecciones con sintaxis moderna.",
        keyPoints: [
          "`sort` MUTA; usa `[...arr].sort((a,b) => …)`.",
          "Comparador fechas: `new Date(a) - new Date(b)`.",
          "`slice(start, end)` copia; `splice` muta (casi nunca en examen).",
          "`[...arr]`, `{...obj}`, `fn(...args)`.",
          "Rest: `function f(a, ...rest)`.",
        ],
        bankLinks: ["f-spread-length", "f-spread-object", "js-normalize-movements", "js-unique-sorted-ids"],
        remember: "Antes de sort: clona.",
      },
      {
        id: "js-flatmap-chaining",
        title: "flat, flatMap y encadenar",
        kidAnalogy:
          "Si cada niño trae una bolsita de stickers, `flatMap` es: abre cada bolsita y junta todo en una sola fila. Encadenar es pasar la fila de estación en estación (filter → map → reduce).",
        summary: "Aplanar un nivel y componer pipelines legibles.",
        keyPoints: [
          "`flat(1)` aplana un nivel; `flatMap(fn)` = map + flat(1).",
          "Prefiere cadenas cortas y nombres claros.",
          "Si el pipeline crece, extrae funciones puras con nombre.",
        ],
        bankLinks: ["f-array-flatmap", "f-array-reduce", "js-group-transactions"],
      },
      {
        id: "js-closures-scope",
        title: "Closures, TDZ y scope",
        kidAnalogy:
          "Una función es un niño que se lleva la mochila del cuarto donde nació. Aunque salga al patio, todavía tiene lo que guardó ahí. Eso es un closure. La TDZ es cuando quieres usar un juguete antes de sacarlo de la caja.",
        summary: "Closures capturan el entorno léxico. let/const tienen zona muerta temporal (TDZ).",
        keyPoints: [
          "Una función “recuerda” variables del scope externo.",
          "Útil para factories, debounce wrappers y estado privado.",
          "Acceder a let/const antes de la declaración → ReferenceError (TDZ).",
          "Módulos export/import son scope de módulo.",
        ],
        bankLinks: ["f-closure", "f-tdz", "f-module-export", "f-module-import", "f-debounce"],
      },
      {
        id: "js-event-loop",
        title: "Event loop, microtasks y abort",
        kidAnalogy:
          "El navegador es un chef con una cola: primero termina el plato que cocina (call stack), luego sirve los postres rapiditos (microtasks: Promise), y después los pedidos normales (macrotasks: setTimeout). AbortController es apagar el microondas a mitad.",
        summary:
          "Orden: sync → microtasks → macrotasks. Promise.then va antes que setTimeout(0).",
        keyPoints: [
          "`Promise.all` falla al primer rechazo; `allSettled` espera todos.",
          "`Promise.race` se queda con el primero que termine.",
          "fetch + AbortController cancela peticiones.",
          "No bloquear el hilo principal con loops pesados.",
        ],
        bankLinks: [
          "f-event-loop",
          "f-microtask",
          "f-allsettled",
          "f-promise-race",
          "f-fetch-abort",
        ],
        remember: "Microtask antes que el timer.",
      },
      {
        id: "js-async-await",
        title: "async/await y manejo de errores",
        kidAnalogy:
          "`async` es un niño que promete traer algo después. `await` es sentarse a esperar ese regalo sin salir corriendo. Si se cae, `try/catch` es el casco: atrapas el golpe.",
        summary: "Sintaxis sobre Promises; errores y cancelación.",
        keyPoints: [
          "`async` siempre retorna Promise.",
          "`await` pausa esa función async (no todo el hilo).",
          "try/catch alrededor de awaits que pueden fallar.",
          "Paraleliza con `Promise.all` cuando no dependan entre sí.",
          "Combina con AbortSignal en fetch.",
        ],
        bankLinks: ["f-allsettled", "f-fetch-abort", "js-retry-payment", "f-event-loop"],
        remember: "await en serie = más lento; all = en paralelo.",
      },
      {
        id: "js-collections-pure",
        title: "Set, Map y funciones puras",
        kidAnalogy:
          "Set es una caja donde cada sticker solo puede estar una vez. Map es un diccionario de llaves → valores. Una función pura es un robot que, con la misma pregunta, siempre da la misma respuesta y no ensucia la cocina.",
        summary: "Estructuras de colección modernas y pureza.",
        keyPoints: [
          "Set = unicidad; Map = claves de cualquier tipo.",
          "WeakMap no impide el GC de las claves-objeto.",
          "nullish `??` vs OR `||` (0 y '' son válidos con ??).",
          "optional chaining `?.` evita crashes en null.",
        ],
        bankLinks: [
          "f-set-unique",
          "f-map-vs-object",
          "f-weakmap",
          "f-pure-function",
          "f-nullish",
          "f-optional-chaining",
          "js-unique-sorted-ids",
        ],
      },
      {
        id: "js-objects-destructuring",
        title: "Objetos, destructuring y this",
        kidAnalogy:
          "Destructuring es abrir la lonchera y sacar solo el jugo y el sándwich: `const { amount, date } = mov`. `this` es ‘¿quién me llamó?’ — a veces se confunde si prestas la función a otro.",
        summary: "Extraer datos sin mutar y pitfalls de this/arrow.",
        keyPoints: [
          "`const { a, b: renombre } = obj`.",
          "`const [first, ...rest] = arr`.",
          "Default: `const { x = 0 } = obj`.",
          "Arrow functions no tienen this propio (heredan).",
          "Object.keys / values / entries para recorrer.",
        ],
        bankLinks: ["f-spread-object", "f-optional-chaining", "js-group-transactions"],
      },
      {
        id: "js-security-http",
        title: "HTTP, XSS, CORS y CSP",
        kidAnalogy:
          "401 es ‘no me mostraste tu carnet’. XSS es que un malo te haga pegar un sticker venenoso en la página. textContent pega texto ‘tonto’ (seguro); innerHTML puede pegar códigos mágicos peligrosos. CORS es el portero: ‘¿vienes de un sitio amigo?’.",
        summary: "Errores HTTP y defensa básica del front bancario.",
        keyPoints: [
          "401 Unauthorized · 403 Forbidden · 404 Not found · 500 server.",
          "Evita XSS: textContent / frameworks que escapan.",
          "CORS lo define el servidor con headers.",
          "CSP limita de dónde puede venir JS/CSS.",
          "Idempotencia: repetir la misma acción no debe inventar cobros.",
          "aria-label ayuda a lectores de pantalla.",
        ],
        bankLinks: [
          "f-http-401",
          "f-xss-textcontent",
          "f-cors",
          "f-csp",
          "f-idempotent",
          "f-aria-label",
          "f-event-delegation",
          "f-virtualization",
        ],
      },
      {
        id: "ts-generics-utilities",
        title: "TypeScript: generics y Utility Types",
        kidAnalogy:
          "Un genérico es un molde de galleta: la forma es la misma, el sabor (tipo) cambia. Partial es ‘puedes traer solo algunos ingredientes’. Pick elige; Omit esconde el secreto.",
        summary:
          "Partial, Pick, Omit, Record, Readonly, keyof/typeof e infer — tipado de entrevistas reales.",
        keyPoints: [
          "`identity<T>(v: T): T` preserva el tipo.",
          "`keyof typeof obj` para uniones de claves literales.",
          "`Partial` / `Required` / `Readonly` / `Pick` / `Omit` / `Record`.",
          "Conditional types + `infer` (ReturnType, Awaited).",
          "Discriminated unions para Result ok/error.",
        ],
        bankLinks: ["ts-curry", "ts-compose", "ts-partial"],
        remember: "La práctica del panel es implementar curry / compose / partial.",
      },
      {
        id: "ts-hof-curry-closures",
        title: "TypeScript: HOFs, curry y closures",
        kidAnalogy:
          "Curry es partir una suma en dos viajes: primero dejas el 2, luego alguien trae el 5. Un HOF es una máquina que recibe otra máquina. Closure es la mochila que se lleva la función.",
        summary: "Ejercicios de código del panel: curry, compose, partial, debounce, flatten, groupBy.",
        keyPoints: [
          "Curry acumula args hasta `fn.length`.",
          "compose: f(g(h(x))) de derecha a izquierda.",
          "partial fija argumentos iniciales.",
          "debounce resetea el timer en cada llamada.",
        ],
        bankLinks: ["ts-curry", "ts-compose", "ts-partial", "ts-debounce", "ts-flatten", "ts-groupby"],
        remember: "add(1)(2) no es magia: es curry.",
      },
    ],
  },
  {
    id: "web-css",
    order: 2,
    title: "CSS profundo",
    emoji: "🎨",
    tagline: "Layout, cascada, responsive y detalle de UI.",
    ink: "#3d2c0a",
    fill: "#ffe8a3",
    topics: [
      {
        id: "css-box-model",
        title: "Box model y box-sizing",
        kidAnalogy:
          "Cada cosa en la página es una cajita: contenido, relleno (padding), borde y margen. Con `border-box` mides la caja ya con cinta y cartón puestos: width incluye padding+border.",
        summary: "Entender tamaño real de elementos — base de todo layout.",
        keyPoints: [
          "content → padding → border → margin.",
          "`box-sizing: border-box` casi siempre.",
          "margin colapsa entre hermanos verticales.",
          "width 100% + padding sin border-box = overflow.",
        ],
        bankLinks: ["css-box-border-box"],
        remember: "border-box = width que ves = lo que pediste.",
      },
      {
        id: "css-display-flow",
        title: "display: block, inline, none",
        kidAnalogy:
          "block es un ladrillo que quiere toda la fila. inline es un sticker que se pega al lado del texto. inline-block es un sticker con tamaño propio. none es ‘desapareció del juego’.",
        summary: "Flujo normal del documento antes de flex/grid.",
        keyPoints: [
          "block: div, p, section · ocupa ancho disponible.",
          "inline: span, a · ignora width/height clásicos.",
          "inline-block: mezcla útil para botones chicos.",
          "`display: none` vs `visibility: hidden` (espacio).",
        ],
        bankLinks: ["css-flex-justify-center", "css-box-border-box"],
      },
      {
        id: "css-flexbox",
        title: "Flexbox a fondo",
        kidAnalogy:
          "Flex es una fila (o columna) de amigos. Tú decides la dirección, si se envuelven, cómo se reparte el espacio libre y si se estiran. `gap` es el espacio entre amigos sin pelearse con margins.",
        summary: "Eje principal/cruzado, alineación y wrapping.",
        keyPoints: [
          "`display: flex` + `flex-direction` row/column.",
          "`justify-content` (eje principal) · `align-items` (cruzado).",
          "`flex-wrap: wrap` para responsive.",
          "`flex-grow` / `flex-shrink` / `flex-basis` / `order`.",
          "`align-self` para un hijo rebelde.",
        ],
        bankLinks: [
          "css-flex-justify-center",
          "css-flex-align-items",
          "css-flex-grow",
          "css-flex-shrink",
        ],
        remember: "justify = principal · align = cruzado.",
      },
      {
        id: "css-grid",
        title: "CSS Grid y auto-fit",
        kidAnalogy:
          "Grid es una mesa con filas y columnas. `minmax(240px, 1fr)` dice: cada casilla al menos 240px y reparte lo que sobre. `auto-fit` llena huecos solos cuando la ventana se hace angosta.",
        summary: "Layouts 2D: cards, dashboards, product grids — tema clave en Bancolombia.",
        keyPoints: [
          "`grid-template-columns: repeat(auto-fit, minmax(...))`.",
          "auto-fit vs auto-fill (tracks vacíos).",
          "`fr` = fracción del espacio libre.",
          "`grid-column: span 2` / `grid-row: 1 / 3`.",
          "Áreas con `grid-template-areas`.",
        ],
        bankLinks: [
          "css-grid-autofit-minmax",
          "css-grid-three-cols",
          "css-grid-span-two",
          "css-grid-areas",
          "css-grid-autofill-vs-fit",
        ],
        remember: "Si dudas en layout 2D: Grid.",
      },
      {
        id: "css-position-z",
        title: "position, sticky y z-index",
        kidAnalogy:
          "`relative` es moverte un poquito sin dejar tu asiento. `absolute` es pegarte a la pared del cuarto padre. `fixed` es pegarte a la ventana del salón. `sticky` es un cartel que se pega al techo cuando scrolleas. z-index es quién queda encima en el montón de papeles.",
        summary: "Sacar elementos del flujo y capas.",
        keyPoints: [
          "sticky necesita top/bottom y un ancestro scrolleable.",
          "absolute se ancla al nearest positioned ancestor.",
          "z-index solo aplica a positioned / flex-items / etc.",
          "Stacking context: un padre con z-index bajo atrapa a sus hijos.",
        ],
        bankLinks: ["css-position-absolute", "css-zindex-stacking"],
      },
      {
        id: "css-units-typography",
        title: "Unidades: rem, em, %, vw",
        kidAnalogy:
          "`rem` mide con la regla del director (html). `em` mide con la regla de tu papá (el padre). `%` es ‘tanto de mi papá’. `vw` es pedazo de la ventana. En bancos: tipografía legible > trucos raros.",
        summary: "Elegir unidades predecibles para UI bancaria.",
        keyPoints: [
          "rem para font-size y spacing consistente.",
          "em crece en cascada (cuidar botones anidados).",
          "% respecto al padre; vh/vw respecto al viewport.",
          "clamp(min, preferido, max) para tipografía fluid.",
        ],
        bankLinks: ["css-em-vs-rem"],
      },
      {
        id: "css-specificity-cascade",
        title: "Especificidad y cascada",
        kidAnalogy:
          "Si dos reglas pelean, gana la más ‘específica’ (como un nombre y apellido vs solo nombre). IDs pegan fuerte; !important es gritar — casi nunca. Cascada = orden + origen + especificidad.",
        summary: "Por qué tu CSS ‘no aplica’ y cómo depurarlo.",
        keyPoints: [
          "inline > id > class/atributo > elemento.",
          "Misma especificidad → gana la que va después.",
          "Evita !important; mejora selectores o estructura.",
          "Clases BEM-ish ayudan sin frameworks.",
        ],
        bankLinks: ["css-specificity-rank"],
        remember: "Si no aplica: inspecciona qué regla ganó.",
      },
      {
        id: "css-pseudo-media",
        title: "Pseudo-clases y media queries",
        kidAnalogy:
          "`:hover` es cuando el mouse hace cosquillas. `:focus` es cuando el teclado apunta. `:nth-child` elige el 2º, 3º… Media query es ‘si la ventana es angosta, apila las cajas’.",
        summary: "Estados interactivos y responsive sin JS.",
        keyPoints: [
          ":hover, :focus-visible, :disabled, :checked.",
          ":nth-child / :not() para listas.",
          "`@media (max-width: 768px)` mobile-first invertido o min-width.",
          "Prefiere mobile-first con min-width.",
        ],
        bankLinks: ["css-media-mobile-first"],
      },
      {
        id: "css-overflow-scroll",
        title: "Overflow, scroll y listas largas",
        kidAnalogy:
          "Si los caramelos no caben en la caja, overflow decide: ¿se desbordan, se cortan o aparece una ruedita (scroll)? En movimientos bancarios sueles querer scroll vertical limpio.",
        summary: "Contener contenido sin romper el layout.",
        keyPoints: [
          "`overflow: auto` / `hidden` / `scroll`.",
          "min-height: 0 en flex children para permitir scroll.",
          "text-overflow: ellipsis + white-space: nowrap.",
          "overscroll-behavior para no ‘tirar’ la página.",
        ],
        bankLinks: ["css-movements-list", "f-virtualization", "css-account-summary"],
      },
      {
        id: "a11y-html",
        title: "HTML semántico y a11y",
        kidAnalogy:
          "Un botón es un botón de verdad (como un timbre), no un div disfrazado: el teclado y el lector de pantalla saben usarlo. aria-live es un megáfono que anuncia cambios (‘¡OTP incorrecto!’) sin mover el foco.",
        summary: "Semántica y ARIA mínimas del examen web.",
        keyPoints: [
          "button para acciones; a para navegación.",
          "landmarks: header, main, nav, form.",
          "aria-live para mensajes dinámicos.",
          "Labels asociados a inputs (forms de transferencia).",
          "Contraste suficiente; no depender solo del color.",
        ],
        bankLinks: ["html-a11y-button", "html-semantic-nav", "html-lazy-loading", "html-picture-srcset"],
      },
      {
        id: "css-exam-rules",
        title: "Reglas CSS del simulacro",
        kidAnalogy:
          "En el examen te piden pintar con lápices normales: sin cajas mágicas (Tailwind/BDS). Solo CSS puro, como cuando dibujas a mano en el cuaderno.",
        summary: "Restricciones explícitas del cliente en MCQ y prácticas.",
        keyPoints: [
          "Sin frameworks CSS / sin BDS / sin Tailwind en la prueba.",
          "Specs bloqueadas: no editar tests.",
          "Pensar mobile-first: stacks, gaps, tipografía legible.",
        ],
        bankLinks: ["css-grid-vs-flex"],
      },
    ],
  },
  {
    id: "angular",
    order: 3,
    title: "Angular (sin ReactiveForms)",
    emoji: "🅰️",
    tagline: "Ciclo de vida, signals, templates y Rx.",
    ink: "#3b0f1a",
    fill: "#ffb3c1",
    topics: [
      {
        id: "ng-lifecycle-hooks",
        title: "ngOnInit, ngOnDestroy y ciclo de vida",
        kidAnalogy:
          "Un componente es un personaje de teatro. `ngOnInit` es cuando sale al escenario y se presenta. `ngOnDestroy` es cuando se va y debe apagar las luces (cancelar timers y suscripciones). Si no apaga, deja ‘fantasmas’ gastando batería.",
        summary: "Hooks esenciales: setup al montar y cleanup al destruir.",
        keyPoints: [
          "`ngOnInit`: lógica de inicio (fetch, estado inicial).",
          "`ngOnDestroy`: unsubscribe, clearInterval, removeListener.",
          "Constructor: inyección DI, no side-effects pesados.",
          "Orden típico: constructor → ngOnChanges → ngOnInit → … → destroy.",
          "Implementa interfaces `OnInit`, `OnDestroy` para tipado.",
        ],
        bankLinks: ["ng-sports-results", "ng-movies-catalog", "ng-ngoninit-load"],
        remember: "Init arma · Destroy limpia.",
      },
      {
        id: "ng-onchanges-afterview",
        title: "ngOnChanges, AfterViewInit, AfterContentInit",
        kidAnalogy:
          "`ngOnChanges` es cuando te cambian las instrucciones del papel (Inputs). `AfterViewInit` es ‘ya pintaron mi escenografía interna (ViewChild)’. `AfterContentInit` es ‘ya llegaron los niños que metieron en mi proyector (ng-content)’.",
        summary: "Reaccionar a Inputs y al DOM interno proyectado.",
        keyPoints: [
          "ngOnChanges(changes: SimpleChanges) en cada cambio de @Input.",
          "Útil para recalcular cuando llega un id de cuenta.",
          "AfterViewInit: seguro leer @ViewChild.",
          "AfterContentInit: contenido proyectado listo.",
          "No asumas ViewChild disponible en ngOnInit.",
        ],
        bankLinks: ["ng-employee-directory", "ng-product-catalog"],
      },
      {
        id: "ng-signals",
        title: "Signals (señales)",
        kidAnalogy:
          "Una señal es una cajita mágica: cuando cambias lo de adentro, Angular avisa solo a quien mira esa cajita. `computed` es una cajita que se arma sola con otras. `effect` es ‘cada vez que cambie, haz esta tarea’.",
        summary: "Modelo reactivo moderno de Angular (zoneless-friendly).",
        keyPoints: [
          "`signal(valor)` · `set` / `update` para cambiar.",
          "`computed(() => …)` deriva estado sin mutar a mano.",
          "`effect(() => …)` side-effects; limpia en destroy automático en muchos casos.",
          "Leer en template: `{{ count() }}` — son funciones.",
          "Inputs/outputs signal-based en versiones recientes (`input()`, `output()`).",
          "Convive con RxJS; no sustituye HttpClient de golpe.",
        ],
        bankLinks: ["ng-trackby-why", "ng-sports-results"],
        remember: "signal() se lee como función: count().",
      },
      {
        id: "ng-change-detection",
        title: "OnPush, trackBy y detección de cambios",
        kidAnalogy:
          "OnPush es un guardia perezoso: solo revisa si le cambian la cajita de afuera (inputs) o si le dices ‘mira’. trackBy es poner nombre a cada amigo en la fila para no re-preguntar a todos cuando llega uno nuevo.",
        summary: "Rendimiento de listas y detección de cambios.",
        keyPoints: [
          "ChangeDetectionStrategy.OnPush.",
          "trackBy evita recrear DOM en *ngFor.",
          "Con OnPush: nuevas referencias (inmutabilidad) o marks.",
          "async pipe se suscribe/desuscribe solo.",
          "Signals + OnPush encajan muy bien.",
        ],
        bankLinks: ["ng-trackby-why", "ng-ngfor"],
      },
      {
        id: "ng-inputs-outputs",
        title: "@Input, @Output y two-way",
        kidAnalogy:
          "@Input es lo que el papá le pasa al niño (‘aquí tienes la lista’). @Output es el niño gritando hacia arriba (‘¡terminé!’) con un EventEmitter. Two-way es banana-box `[()]` — conversación en ambos sentidos.",
        summary: "Comunicación padre ↔ hijo sin shared globals.",
        keyPoints: [
          "@Input() items / input() signal-based.",
          "@Output() save = new EventEmitter() / output().",
          "No mutes @Input del padre desde el hijo.",
          "Patterns de tabs/filtros/OTP usan inputs+outputs.",
        ],
        bankLinks: ["ng-input", "ng-output", "ng-output-template"],
      },
      {
        id: "ng-templates-events",
        title: "Templates, HostListener y DI",
        kidAnalogy:
          "TemplateRef es un molde de plastilina. HostListener es ‘cuando toquen la puerta de este componente…’. Inyectar un Service es pedir al banco de juguetes compartido: todos usan el mismo carrito.",
        summary: "Plantillas, eventos de host e inyección de dependencias.",
        keyPoints: [
          "Sin ReactiveForms (restricción del banco).",
          "HttpClient vía inject()/constructor.",
          "providedIn: 'root' para servicios singleton.",
          "ng-template / TemplateRef / ngTemplateOutlet.",
          "@HostListener('document:click') con cuidado.",
        ],
        bankLinks: ["ng-click", "ng-disabled", "ng-httpclient", "ng-sports-results"],
        remember: "Forms ‘a mano’ con ngModel o bindings — no FormGroup.",
      },
      {
        id: "ng-rxjs-subjects",
        title: "RxJS: Observable, Subject, async pipe",
        kidAnalogy:
          "Un Observable es un canal de radio. Subject es un micrófono: tú hablas y todos escuchan. BehaviorSubject siempre recuerda la última canción. El async pipe enciende/apaga el radio solo cuando el componente está en escena.",
        summary: "Streams para HTTP, filtros y estado compartido ligero.",
        keyPoints: [
          "Subject vs BehaviorSubject (valor inicial / replay 1).",
          "switchMap para búsquedas (cancela la anterior).",
          "async pipe evita unsubscribe manual.",
          "No anides subscribe dentro de subscribe.",
          "combineLatest / withLatestFrom para filtros + data.",
        ],
        bankLinks: ["ng-async-pipe", "ng-httpclient", "ng-sports-results"],
      },
      {
        id: "ng-directives-pipes",
        title: "*ngIf, *ngFor, ngClass y pipes",
        kidAnalogy:
          "*ngIf es ‘¿existe el monstruo? si no, no lo dibujes’. *ngFor es ‘dibuja uno por cada amigo’. Un pipe es un traductor mágico en el template: fecha bonita, moneda COP.",
        summary: "Directivas estructurales y transformación en vista.",
        keyPoints: [
          "*ngIf / @if · *ngFor / @for con track.",
          "ngClass / ngStyle vs class bindings.",
          "Pures pipes cachean; impure se ejecutan más.",
          "Currency/Date pipe vs formatters JS propios.",
        ],
        bankLinks: ["ng-ngif", "ng-ngfor", "ng-trackby-why"],
      },
      {
        id: "ng-guards-routing",
        title: "Guards: CanActivate, CanDeactivate, CanMatch, Resolve",
        kidAnalogy:
          "CanActivate es el portero de la discoteca. CanDeactivate pregunta ‘¿seguro sales sin guardar?’. CanMatch decide si ni siquiera abres la puerta del módulo lazy. Resolve trae la pizza antes de sentarte a la mesa.",
        summary: "Escenarios de auth, formularios sucios, lazy load y prefetch — con distractores reales.",
        keyPoints: [
          "CanActivate → boolean | UrlTree | Observable (auth + returnUrl).",
          "CanDeactivate → confirmar salida si form.dirty.",
          "CanMatch → evita descargar chunks no autorizados.",
          "Resolve → datos listos en ActivatedRoute.data.",
          "No hagas subscribe fire-and-forget dentro del guard.",
        ],
        bankLinks: ["ng-httpclient", "ng-service-inject"],
        remember: "Auth gate ≠ leave confirmation ≠ lazy match ≠ prefetch.",
      },
      {
        id: "ng-code-templates",
        title: "Angular: código, HTML y UI",
        kidAnalogy:
          "Te muestran el .ts y te preguntan qué HTML encaja, o qué se ve en pantalla. Es como emparejar piezas de un rompecabezas: binding, *ngIf y eventos deben cuadrar.",
        summary: "Preguntas basadas en código: bindings, listas, outputs y resultado visual.",
        keyPoints: [
          "[prop] / (event) / [(ngModel)] / {{ interp }}.",
          "Elegir template correcto para un component.ts.",
          "Interpretar UI con *ngIf / [disabled].",
          "No mutar @Input; usar trackBy en listas.",
        ],
        bankLinks: ["ng-interp", "ng-click", "ng-ngif", "ng-ngfor", "ng-twoway"],
      },
    ],
  },
  {
    id: "sql-theory",
    order: 4,
    title: "SQL — conceptos",
    emoji: "🗄️",
    tagline: "Preguntarle cosas a una tabla gigante.",
    ink: "#0f2f1f",
    fill: "#b8f0d0",
    topics: [
      {
        id: "sql-select-where",
        title: "SELECT, WHERE, ORDER, LIMIT",
        kidAnalogy:
          "SELECT es pedir columnas de la hoja. WHERE es ‘solo las filas que cumplan’. ORDER BY las ordena. LIMIT es ‘tráeme solo las primeras N’ — útil cuando hay millones de movimientos.",
        summary: "Lectura básica y filtros fila a fila.",
        keyPoints: [
          "SELECT cols FROM tabla WHERE … ORDER BY … LIMIT …",
          "DISTINCT quita duplicados de la proyección.",
          "BETWEEN, LIKE, IN, AND/OR, paréntesis.",
          "Alias AS para names legibles.",
        ],
        bankLinks: [
          "sql-select-basic",
          "sql-order-limit",
          "sql-distinct",
          "sql-alias",
          "sql-between",
          "sql-like",
          "sql-account-movements",
        ],
      },
      {
        id: "sql-joins",
        title: "INNER JOIN y LEFT JOIN",
        kidAnalogy:
          "INNER JOIN es ‘solo amigos que existen en ambas listas’. LEFT JOIN guarda a todos de la izquierda aunque no tengan pareja a la derecha (ahí hay NULL, como un asiento vacío). RIGHT/FULL existen, pero LEFT+INNER cubren el 90%.",
        summary: "Relacionar tablas (clientes, cuentas, movimientos).",
        keyPoints: [
          "ON define la condición de empareje.",
          "LEFT: conserva izquierda; rellena NULL a la derecha.",
          "Multi-join: clientes → cuentas → movimientos.",
          "Cuidado con el fan-out (duplicar filas).",
        ],
        bankLinks: [
          "sql-join-inner",
          "sql-left-join",
          "sql-customers-with-balance",
          "sql-account-movements",
        ],
        remember: "INNER = intersección · LEFT = conserva izquierda.",
      },
      {
        id: "sql-null-coalesce",
        title: "NULL, COALESCE e IS NULL",
        kidAnalogy:
          "NULL no es cero ni texto vacío: es ‘no sé’. Preguntar `= NULL` es como preguntarle al viento. Usas `IS NULL`. COALESCE es ‘si está vacío, usa este plan B’.",
        summary: "Tratar ausencia de datos sin errores lógicos.",
        keyPoints: [
          "Comparaciones con NULL → UNKNOWN (filtra WHERE).",
          "`IS NULL` / `IS NOT NULL`.",
          "`COALESCE(a, b, c)` primer no-nulo.",
          "COUNT(col) ignora NULL; COUNT(*) cuenta filas.",
        ],
        bankLinks: ["sql-null", "sql-coalesce", "sql-left-join", "sql-aggregate-count"],
      },
      {
        id: "sql-group-agg",
        title: "GROUP BY, HAVING y agregados",
        kidAnalogy:
          "Agrupas caramelos por color (GROUP BY) y cuentas cuántos hay (COUNT). HAVING es el filtro después de agrupar: ‘solo colores con más de 10’. WHERE filtra antes de hacer los montoncitos.",
        summary: "Agregaciones y filtros post-grupo.",
        keyPoints: [
          "COUNT / SUM / AVG / MIN / MAX.",
          "HAVING vs WHERE.",
          "Todas las cols del SELECT no agregadas van en GROUP BY.",
          "Detectar duplicados: GROUP BY … HAVING COUNT(*) > 1.",
        ],
        bankLinks: [
          "sql-group-by",
          "sql-having",
          "sql-aggregate-count",
          "sql-avg",
          "sql-spend-by-category",
          "sql-duplicate-transfers",
        ],
      },
      {
        id: "sql-case-subquery",
        title: "CASE, subqueries y EXISTS",
        kidAnalogy:
          "CASE es un ‘si esto / si aquello’ dentro del SELECT. Una subquery es una pregunta dentro de otra. EXISTS es ‘¿hay al menos un amigo allá?’ — responde sí/no sin traer toda la lista.",
        summary: "Lógica condicional y consultas anidadas.",
        keyPoints: [
          "CASE WHEN … THEN … ELSE … END.",
          "Subquery en WHERE / SELECT / FROM.",
          "EXISTS suele ser más claro que IN para existencia.",
          "Correlacionadas: usan fila de afuera.",
        ],
        bankLinks: ["sql-case", "sql-subquery", "sql-exists", "sql-customers-with-balance"],
      },
      {
        id: "sql-window-functions",
        title: "Funciones ventana (OVER)",
        kidAnalogy:
          "Imagina numerar a los niños en cada fila sin aplastarlos en un solo montón. OVER() mira vecinos: ‘suma acumulada hasta aquí’, ‘fila anterior’, ‘ranking del más gastador’… sin perder el detalle fila a fila.",
        summary: "Running totals, rankings y LAG/LEAD — clave en banca.",
        keyPoints: [
          "`SUM(amount) OVER (ORDER BY date)` running balance.",
          "PARTITION BY categoría/cuenta.",
          "ROW_NUMBER / RANK / DENSE_RANK.",
          "LAG/LEAD para comparar con movimiento anterior.",
          "Diferencia vs GROUP BY: no colapsa filas.",
        ],
        bankLinks: ["sql-window", "sql-running-balance", "sql-customers-with-balance"],
        remember: "Ventana = agrega mirando, no aplasta filas.",
      },
      {
        id: "sql-set-ops-views",
        title: "UNION, vistas y EXPLAIN",
        kidAnalogy:
          "UNION junta dos listas (sin duplicados; UNION ALL las deja todas). Una VIEW es un ‘atajo guardado’ de una pregunta. EXPLAIN es pedirle al maestro cómo pensaría resolver el examen — ves si usa índice o barre todo.",
        summary: "Combinar resultados y entender el plan.",
        keyPoints: [
          "UNION elimina dups; UNION ALL es más barato.",
          "VIEW no guarda datos (generalmente); guarda la query.",
          "EXPLAIN / EXPLAIN ANALYZE según motor.",
          "Índices: ayudan WHERE/JOIN; cuestan en writes.",
        ],
        bankLinks: ["sql-union", "sql-view", "sql-explain", "sql-index"],
      },
      {
        id: "sql-integrity-safety",
        title: "Claves, transacciones e inyección",
        kidAnalogy:
          "PRIMARY KEY es el documento de identidad. FOREIGN KEY es ‘este hijo debe apuntar a un papá real’. Una transacción es un paquete: COMMIT sella; ROLLBACK deshace. La inyección SQL es un bully que escribe misterios en tu formulario: por eso usamos parámetros, no strings a mano.",
        summary: "Integridad, ACID básico y seguridad.",
        keyPoints: [
          "PK / UNIQUE / FK.",
          "BEGIN · COMMIT · ROLLBACK.",
          "Normalización: menos duplicados.",
          "Nunca concatenar input en SQL.",
          "DELETE/UPDATE siempre con WHERE consciente.",
        ],
        bankLinks: [
          "sql-pk-unique",
          "sql-fk",
          "sql-index",
          "sql-transaction",
          "sql-commit-rollback",
          "sql-normalization",
          "sql-injection",
          "sql-delete-where",
          "sql-update",
        ],
      },
    ],
  },
  {
    id: "practice-js-sql",
    order: 5,
    title: "Práctica JS & SQL",
    emoji: "🛠️",
    tagline: "Lo que te pedirán en el editor (sesión 3).",
    ink: "#1a1a40",
    fill: "#c4b5fd",
    topics: [
      {
        id: "prac-js-patterns",
        title: "Patrones JS del banco",
        kidAnalogy:
          "Te dan una bolsa de boletos revueltos. Debes limpiarlos, ordenarlos y sumar el ‘monedero’ sin romper la bolsa original. A veces reintentas un pago como cuando el ascensor falla: esperas un poquito más cada vez (backoff).",
        summary: "Variantes JS: normalizar, agrupar, retry, formato COP, IDs únicos.",
        keyPoints: [
          "Filtrar inválidos · mapear tipos · sort · running balance.",
          "Group by categoría con Map o reduce.",
          "Retry con delay creciente (no bombardear la API).",
          "Formato moneda: miles y decimales COP.",
          "IDs únicos + sort numérico/lexicográfico.",
          "Sin lodash; tests ocultos por patrones.",
        ],
        bankLinks: [
          "ts-curry",
          "ts-compose",
          "ts-partial",
          "ts-debounce",
          "ts-flatten",
          "ts-groupby",
        ],
      },
      {
        id: "prac-sql-queries",
        title: "Consultas SQL del banco",
        kidAnalogy:
          "Es como pedir reportes a la biblioteca del banco: movimientos de una cuenta entre dos fechas, cuánto gastó cada ‘cajón’ (categoría), quién tiene plata y cuándo movió por última vez, boletos duplicados, y el saldo que va creciendo fila a fila (ventana).",
        summary: "Variantes SQL prácticas alineadas a banca.",
        keyPoints: [
          "Filtros por cuenta + rango de fechas.",
          "GROUP BY categoría (gastos).",
          "JOIN clientes ↔ cuentas + último movimiento.",
          "Detectar duplicados (GROUP BY HAVING COUNT > 1).",
          "Window functions para saldo acumulado.",
        ],
        bankLinks: [
          "sql-account-movements",
          "sql-spend-by-category",
          "sql-customers-with-balance",
          "sql-duplicate-transfers",
          "sql-running-balance",
        ],
      },
    ],
  },
  {
    id: "aws-architecture",
    order: 6,
    title: "AWS · decisiones de arquitectura",
    emoji: "☁️",
    tagline: "Escenarios reales: qué servicio encaja y por qué.",
    ink: "#0f2744",
    fill: "#93c5fd",
    topics: [
      {
        id: "aws-compute-apis",
        title: "Compute: Lambda, EC2, ECS/EKS",
        kidAnalogy:
          "Lambda es un microondas: lo enciendes solo cuando llega el plato. EC2/ECS son una cocina siempre abierta. EKS es una cocina con un manual Kubernetes enorme.",
        summary: "Elegir compute según carga continua vs spiky y ops.",
        keyPoints: [
          "API spiky → API Gateway + Lambda.",
          "Proceso siempre-on / WebSockets → EC2 o ECS.",
          "Contenedores sin gestionar VMs → ECS Fargate.",
          "EKS cuando el equipo necesita Kubernetes de verdad.",
        ],
        bankLinks: [
          "aws-lambda-apigw",
          "aws-api-nodejs-always-on",
          "aws-ecs-vs-eks",
          "aws-ecs-fargate-api",
          "aws-amplify-vs-ecs",
        ],
      },
      {
        id: "aws-data-storage",
        title: "Datos: RDS, DynamoDB, S3",
        kidAnalogy:
          "RDS es un archivador con carpetas y relaciones. DynamoDB es un casillero rapidísimo por llave. S3 es la bodega de cajas (PDFs, imágenes, builds).",
        summary: "Relacional vs key-value vs objetos.",
        keyPoints: [
          "Backups/HA SQL → RDS.",
          "Sesiones/KV a escala → DynamoDB.",
          "Archivos/estáticos → S3 (+ CloudFront).",
          "JOINs complejos de reporting → RDS/Aurora, no Dynamo por fuerza.",
        ],
        bankLinks: [
          "aws-rds-managed-db",
          "aws-dynamodb-session",
          "aws-dynamodb-vs-rds",
          "aws-s3-static-assets",
          "aws-s3-vs-ebs",
        ],
      },
      {
        id: "aws-network-ops",
        title: "Red, escala, mensajería y ops",
        kidAnalogy:
          "Route 53 es la guía telefónica. ELB reparte la fila. Auto Scaling abre más cajas. SNS es el megáfono; SQS es la bandeja de pendientes. VPC es el barrio cerrado del banco.",
        summary: "DNS, load balancing, colas, IAM y observabilidad.",
        keyPoints: [
          "Route 53 failover · CloudFront edge TLS.",
          "ELB + Auto Scaling ante picos.",
          "SNS fan-out · SQS desacopla workers.",
          "IAM least privilege · CloudWatch alarms · VPC privada para DB.",
        ],
        bankLinks: [
          "aws-route53-dns",
          "aws-elb-autoscaling",
          "aws-cloudfront-https",
          "aws-sns-fanout",
          "aws-sqs-decouple",
          "aws-iam-least-privilege",
          "aws-cloudwatch-alarms",
          "aws-vpc-private-db",
        ],
      },
    ],
  },
  {
    id: "eng-practices",
    order: 7,
    title: "Ingeniería & calidad",
    emoji: "🧭",
    tagline: "Clean code, arquitectura y calidad para construir sin perderse.",
    ink: "#1d2b53",
    fill: "#c7d2fe",
    topics: [
      {
        id: "eng-clean-code",
        title: "Clean Code",
        kidAnalogy:
          "Es como ordenar tu cuarto antes de invitar amigos: si cada juguete tiene nombre claro y está en su caja, cualquiera encuentra lo que necesita sin tropezarse.",
        summary:
          "Código legible, pequeño y mantenible: nombres claros, funciones cortas, poco duplicado y condiciones fáciles de entender.",
        keyPoints: [
          "Nombra variables por intención: `isLoading`, `totalAmount`, `selectedAccount`.",
          "Funciones pequeñas: una tarea, un nivel de abstracción.",
          "Evita duplicación; extrae helpers cuando la regla se repite de verdad.",
          "Prefiere early returns para reducir `else` y anidación.",
          "Comentarios explican el porqué; el código debe explicar el qué.",
        ],
        bankLinks: [
          "eng-clean-naming-intent",
          "eng-clean-function-size",
          "eng-clean-comments-why",
          "eng-clean-boy-scout-rule",
          "eng-clean-dry-kiss-yagni",
        ],
        remember: "Si un compañero lo entiende rápido, el código ya empezó bien.",
      },
      {
        id: "eng-solid",
        title: "SOLID",
        kidAnalogy:
          "Imagina robots de LEGO: uno barre, otro cocina y otro prende la luz. Si cada robot hace su trabajo y se conectan con piezas estándar, puedes cambiar uno sin romper toda la ciudad.",
        summary:
          "Principios para diseñar piezas con responsabilidades claras, extensibles y poco acopladas.",
        keyPoints: [
          "SRP: una clase/módulo debe tener una razón principal para cambiar.",
          "OCP: extiende comportamiento sin abrir y romper lo existente.",
          "LSP: un reemplazo debe comportarse como promete su contrato.",
          "ISP: interfaces pequeñas; no obligues a depender de métodos que no usas.",
          "DIP: módulos de alto nivel dependen de abstracciones, no detalles concretos.",
        ],
        bankLinks: [
          "eng-solid-srp-component",
          "eng-solid-ocp-pricing",
          "eng-solid-lsp-substitution",
          "eng-solid-isp-fat-interface",
          "eng-solid-dip-frontend",
          "eng-solid-common-god-component",
          "eng-solid-common-switch-violation",
        ],
        remember: "SOLID baja el ‘si toco aquí, explota allá’.",
      },
      {
        id: "eng-patterns-gof",
        title: "Patrones de diseño (GoF) aplicados a frontend",
        kidAnalogy:
          "Son recetas de cocina para problemas repetidos. No inventas una bicicleta nueva: eliges la receta correcta, como Strategy para cambiar la salsa sin cambiar toda la pizza.",
        summary:
          "Patrones útiles en frontend cuando simplifican variaciones, eventos, creación de objetos o adaptación de APIs.",
        keyPoints: [
          "Strategy: intercambia algoritmos (formatos, validaciones, filtros) sin `if` gigantes.",
          "Observer: eventos, stores y streams notifican cambios a suscriptores.",
          "Factory: centraliza creación de objetos/componentes según tipo.",
          "Adapter: traduce una API externa al formato que la UI espera.",
          "Facade: expone una puerta simple sobre lógica o servicios complejos.",
        ],
        bankLinks: [
          "eng-pattern-strategy-validation",
          "eng-pattern-observer-state",
          "eng-pattern-factory-creation",
          "eng-pattern-adapter-api",
          "eng-pattern-decorator-crosscutting",
          "eng-pattern-singleton-pitfall",
          "eng-pattern-facade-http",
        ],
        remember: "Patrón útil = menos ramas y contratos más claros.",
      },
      {
        id: "eng-clean-arch",
        title: "Arquitectura limpia (UI, Domain, Infra) en frontend",
        kidAnalogy:
          "Es una lonchera con pisos: arriba va la UI bonita, en medio las reglas del juego y abajo los cables que hablan con internet. La salsa de abajo no debe mojar las reglas del medio.",
        summary:
          "Separar presentación, reglas de negocio e infraestructura para que la UI cambie sin ensuciar el dominio.",
        keyPoints: [
          "UI: componentes, estado visual, eventos del usuario.",
          "Domain: entidades, reglas y casos de uso sin depender del framework.",
          "Infra: HTTP, storage, SDKs y mappers hacia datos externos.",
          "Las dependencias apuntan hacia el dominio; detalles externos quedan afuera.",
          "Repositorios/adapters esconden APIs para que los casos de uso sean testeables.",
        ],
        bankLinks: [
          "eng-architecture-layering",
          "eng-architecture-dependency-rule",
          "eng-architecture-ui-http-details",
          "eng-architecture-infrastructure-adapters",
        ],
        remember: "La regla del negocio no debería saber si vive en Angular, React o fetch.",
      },
      {
        id: "eng-unit-tests",
        title: "Tests unitarios",
        kidAnalogy:
          "Cada test es probar una pieza de LEGO antes de meterla al castillo. Si la rueda gira sola, luego es más fácil saber por qué el carro completo no anda.",
        summary:
          "Pruebas pequeñas, rápidas y deterministas para validar funciones, componentes o casos de uso aislados.",
        keyPoints: [
          "AAA: Arrange, Act, Assert para ordenar la intención del test.",
          "Testea comportamiento observable, no detalles internos frágiles.",
          "Mocks/stubs aíslan red, reloj, storage y dependencias lentas.",
          "Incluye bordes: vacío, error, duplicados, límites numéricos.",
          "Cobertura sirve si protege reglas importantes; 100% sin asserts buenos no vale.",
        ],
        bankLinks: [
          "eng-testing-aaa-structure",
          "eng-testing-what-to-test",
          "eng-testing-mocks-vs-stubs",
          "eng-testing-pure-functions",
          "eng-testing-avoid-implementation",
        ],
        remember: "Un buen test falla por una regla rota, no por un detalle cosmético.",
      },
      {
        id: "eng-sonarqube",
        title: "SonarQube",
        kidAnalogy:
          "SonarQube es un detector de humo para el código: no cocina por ti, pero te avisa si hay olor a quemado, cables repetidos o una puerta de seguridad mal cerrada.",
        summary:
          "Análisis estático para code smells, bugs, duplicación, cobertura, security hotspots y quality gates.",
        keyPoints: [
          "Quality Gate define si el cambio puede pasar según reglas de calidad.",
          "Code smells señalan mantenibilidad; no siempre son bugs inmediatos.",
          "Duplicación alta aumenta costo de cambios y riesgo de inconsistencias.",
          "Coverage ayuda a ver zonas sin pruebas, especialmente en código nuevo.",
          "Security hotspots requieren revisión humana antes de marcar como seguro.",
        ],
        bankLinks: [
          "eng-sonarqube-coverage-gate",
          "eng-sonarqube-code-smells",
          "eng-sonarqube-cognitive-complexity",
          "eng-sonarqube-fix-blockers",
        ],
        remember: "Sonar no reemplaza criterio; lo enfoca.",
      },
      {
        id: "eng-fluid-attacks",
        title: "Fluid Attacks / seguridad continua",
        kidAnalogy:
          "Es como tener guardianes revisando el parque todos los días: buscan huecos en la reja, juguetes peligrosos y puertas abiertas antes de que entre alguien malo.",
        summary:
          "Seguridad continua con análisis, hallazgos priorizados, remediación y prevención de vulnerabilidades en el ciclo de desarrollo.",
        keyPoints: [
          "SAST/DAST revisan código y comportamiento para encontrar riesgos temprano.",
          "Prioriza vulnerabilidades por severidad, impacto y exposición real.",
          "Corrige la causa raíz; no tapes solo el mensaje de la herramienta.",
          "Evita secretos en repositorios, logs o bundles del frontend.",
          "La seguridad continua entra al pipeline, no al final con afán.",
        ],
        bankLinks: [
          "eng-appsec-fluid-attacks-sdlc",
          "eng-appsec-xss-output-encoding",
          "eng-appsec-secrets-client",
          "eng-appsec-dependency-scanning",
        ],
        remember: "Seguridad tarde = apagar incendio; continua = revisar la reja cada día.",
      },
    ],
  },
  {
    id: "exam-meta",
    order: 8,
    title: "Cómo funciona el simulacro",
    emoji: "🗺️",
    tagline: "Reglas del juego para no perder puntos bobos.",
    ink: "#2a2118",
    fill: "#e7d5c4",
    topics: [
      {
        id: "exam-structure",
        title: "Fases, tiempo y umbral",
        kidAnalogy:
          "Es una carrera de 5 estaciones. Tienes reloj (180 min). Al final suman puntos con peso distinto. Si sacas al menos 70 en el total ponderado… pasaste el parque.",
        summary: "Meta del examen y estructura de sesiones.",
        keyPoints: [
          "5 fases · ~180 minutos · aprobar ≥ 70%.",
          "Orden en TrialForge (mobile → desktop): 5 AWS → 5 HTML/CSS → 5 Angular MCQ → Angular API → TypeScript.",
          "Hasta 15 slots de práctica; prioriza contenido no visto.",
          "En celular: las 3 fases MCQ; prácticas de código en PC.",
        ],
        bankLinks: ["aws-rds-managed-db", "ng-sports-results", "ts-curry"],
      },
    ],
  },
];

function attachExamples(tracks: RawStudyTrack[]): Array<Omit<StudyTrack, "topics"> & { topics: Omit<StudyTopic, "examCoverage">[] }> {
  return tracks.map((track) => ({
    ...track,
    topics: track.topics.map((topic) => ({
      ...topic,
      examples: TOPIC_EXAMPLES[topic.id] ?? [],
    })),
  }));
}

const SECONDARY_BANK_LINKS: Record<string, string[]> = {
  "ng-lifecycle-hooks": ["ng-ngoninit-load", "ng-movies-catalog"],
  "js-map-filter-reduce": ["ts-groupby"],
  "js-find-some-every": ["ts-groupby"],
  "js-sort-slice-spread": ["ts-flatten"],
  "js-async-await": ["ng-sports-results"],
  "css-flexbox": ["css-flex-grow", "css-flex-shrink"],
  "css-grid": ["css-grid-span-two", "css-grid-areas"],
  "css-overflow-scroll": ["css-grid-vs-flex"],
  "ng-onchanges-afterview": ["ng-employee-directory"],
  "ng-inputs-outputs": ["ng-output", "ng-output-template"],
  "ng-directives-pipes": ["ng-ngif", "ng-trackby-why"],
  "sql-window-functions": ["sql-running-balance"],
  "ts-hof-curry-closures": ["ts-compose", "ts-partial"],
  "prac-js-patterns": ["ts-debounce", "ts-flatten"],
};

function attachCoverage(
  tracks: Array<Omit<StudyTrack, "topics"> & { topics: Omit<StudyTopic, "examCoverage">[] }>,
): StudyTrack[] {
  return tracks.map((track) => ({
    ...track,
    topics: track.topics.map((topic) => {
      const examCoverage = TOPIC_EXAM_COVERAGE[topic.id];
      if (!examCoverage) {
        throw new Error(`Falta cobertura 1:1 para tema de estudio: ${topic.id}`);
      }
      const extra = SECONDARY_BANK_LINKS[topic.id] ?? [];
      const bankLinks = [
        examCoverage.primaryId,
        ...extra,
        ...topic.bankLinks.filter((id) => id !== examCoverage.primaryId && !extra.includes(id)),
      ];
      return { ...topic, examCoverage, bankLinks };
    }),
  }));
}

export const studyTracks: StudyTrack[] = attachCoverage(attachExamples(rawStudyTracks));

export function getTrack(trackId: string) {
  return studyTracks.find((t) => t.id === trackId);
}

export function getTopic(trackId: string, topicId: string) {
  const track = getTrack(trackId);
  return track?.topics.find((t) => t.id === topicId);
}

export function allTopicIds() {
  return studyTracks.flatMap((t) => t.topics.map((topic) => `${t.id}::${topic.id}`));
}

export const STUDY_STORAGE_KEY = "trialforge-study-v1";
