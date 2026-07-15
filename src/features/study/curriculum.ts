/** Currículo de estudio alineado al banco Bancolombia (MCQ + prácticas). */

export type StudyTopic = {
  id: string;
  title: string;
  /** Explicación “como a un niño de 8 años”. */
  kidAnalogy: string;
  summary: string;
  keyPoints: string[];
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

export const studyTracks: StudyTrack[] = [
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
          "map/filter/reducen creando colecciones nuevas.",
          "Spread de objetos: `{...obj, x: 1}` copia superficial.",
          "JSON.parse(JSON.stringify) vs structuredClone.",
        ],
        bankLinks: ["f-const-let", "f-immutability", "f-spread-object", "f-json-clone", "f-structured-clone"],
        remember: "Nuevo arreglo = no mutar al cliente.",
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
        id: "js-collections-pure",
        title: "Set, Map, reduce y pureza",
        kidAnalogy:
          "Set es una caja donde cada sticker solo puede estar una vez. Map es un diccionario de llaves → valores. Una función pura es un robot que, con la misma pregunta, siempre da la misma respuesta y no ensucia la cocina.",
        summary: "Estructuras de colección modernas y funciones sin efectos secundarios.",
        keyPoints: [
          "Set = unicidad; Map = claves de cualquier tipo.",
          "WeakMap no impide el GC de las claves-objeto.",
          "reduce acumula (sumas, groups, running balance).",
          "flatMap = map + flatten un nivel.",
          "nullish `??` vs OR `||` (0 y '' son válidos con ??).",
          "optional chaining `?.` evita crashes en null.",
        ],
        bankLinks: [
          "f-set-unique",
          "f-map-vs-object",
          "f-weakmap",
          "f-array-reduce",
          "f-array-flatmap",
          "f-pure-function",
          "f-nullish",
          "f-optional-chaining",
        ],
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
    ],
  },
  {
    id: "web-css",
    order: 2,
    title: "Web, CSS y accesibilidad",
    emoji: "🎨",
    tagline: "Layout, semántica y UI usable.",
    ink: "#3d2c0a",
    fill: "#ffe8a3",
    topics: [
      {
        id: "css-layout",
        title: "Flex, Grid y caja",
        kidAnalogy:
          "Flex es poner amigos en fila (o columna) y decidir cómo se aprietan. Grid es una mesa con casillas. `box-sizing: border-box` significa que el borde y el padding cuentan dentro del tamaño… ¡como medir la caja con la cinta ya puesta!",
        summary: "Herramientas de layout que pedirá el banco CSS práctico.",
        keyPoints: [
          "flex + gap para listas y forms.",
          "grid + auto-fit / minmax para cards responsive.",
          "em vs rem: rem ancla al root; em al padre.",
          "specificity: inline > id > class > elemento.",
          "position sticky: se ‘pega’ al scrollarse.",
        ],
        bankLinks: [
          "w-flex-gap",
          "w-grid-autofit",
          "w-box-sizing",
          "w-em-vs-rem",
          "w-css-specificity",
          "w-position-sticky",
          "css-account-summary",
          "css-product-cards",
        ],
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
        ],
        bankLinks: ["w-a11y-button", "w-semantic-html", "w-aria-live", "css-transfer-form", "css-otp-banner"],
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
        bankLinks: ["w-no-bds", "w-pure-css-no-tailwind", "w-locked-specs", "css-movements-list"],
      },
    ],
  },
  {
    id: "angular",
    order: 3,
    title: "Angular (sin ReactiveForms)",
    emoji: "🅰️",
    tagline: "Componentes, cambio de detección y plantillas.",
    ink: "#3b0f1a",
    fill: "#ffb3c1",
    topics: [
      {
        id: "ng-change-detection",
        title: "OnPush, trackBy y ciclo de vida",
        kidAnalogy:
          "OnPush es un guardia perezoso: solo revisa si le cambian la cajita de afuera (inputs) o si le dices ‘mira’. trackBy es poner nombre a cada amigo en la fila para no re-preguntar a todos cuando llega uno nuevo.",
        summary: "Rendimiento de listas y detección de cambios.",
        keyPoints: [
          "ChangeDetectionStrategy.OnPush.",
          "trackBy evita recrear DOM en *ngFor.",
          "ngOnChanges cuando cambian @Input.",
          "async pipe se suscribe/desuscribe solo.",
        ],
        bankLinks: ["w-onpush", "w-trackby", "w-ngonchanges", "w-ngfor-async", "ng-transaction-filter"],
      },
      {
        id: "ng-templates-events",
        title: "Templates, HostListener y Subjects",
        kidAnalogy:
          "TemplateRef es un molde de plastilina. HostListener es ‘cuando toquen la puerta de este componente…’. Subject solo grita ahora; BehaviorSubject siempre recuerda la última frase.",
        summary: "APIs de plantilla y RxJS básicas para el examen.",
        keyPoints: [
          "Sin ReactiveForms (restricción del banco).",
          "HttpClient para APIs; no reinventar XHR.",
          "Subject vs BehaviorSubject.",
          "ng-template / TemplateRef para tabs y contenido condicional.",
        ],
        bankLinks: [
          "w-no-reactive-forms",
          "w-template-ref",
          "w-hostlistener",
          "w-subject-vs-behavior",
          "w-httpclient",
          "ng-todo-tabs",
          "ng-tabs-products",
          "ng-otp-input",
          "ng-checklist-groups",
        ],
        remember: "Forms ‘a mano’ con ngModel o bindings — no FormGroup.",
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
        id: "sql-select-join",
        title: "SELECT, JOIN y NULL",
        kidAnalogy:
          "SELECT es pedir columnas de una hoja. INNER JOIN es ‘solo amigos que existen en ambas listas’. LEFT JOIN guarda a todos de la izquierda aunque no tengan pareja a la derecha (ahí hay NULL, como un asiento vacío).",
        summary: "Lectura de datos y relaciones entre tablas.",
        keyPoints: [
          "SELECT · WHERE · ORDER BY · LIMIT · DISTINCT.",
          "INNER vs LEFT JOIN.",
          "NULL no se compara con `=`; usa IS NULL / COALESCE.",
          "Aliasses (`AS`) aclaran columnas.",
        ],
        bankLinks: [
          "sql-select-basic",
          "sql-join-inner",
          "sql-left-join",
          "sql-null",
          "sql-order-limit",
          "sql-distinct",
          "sql-alias",
          "sql-coalesce",
          "sql-between",
          "sql-like",
        ],
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
          "CASE WHEN para categorías.",
          "Subqueries y EXISTS.",
        ],
        bankLinks: [
          "sql-group-by",
          "sql-having",
          "sql-aggregate-count",
          "sql-avg",
          "sql-case",
          "sql-subquery",
          "sql-exists",
          "sql-union",
          "sql-window",
        ],
      },
      {
        id: "sql-integrity-safety",
        title: "Claves, transacciones e inyección",
        kidAnalogy:
          "PRIMARY KEY es el documento de identidad. FOREIGN KEY es ‘este hijo debe apuntar a un papá real’. Una transacción es un paquete: COMMIT sella; ROLLBACK deshace. La inyección SQL es un bully que escribe misterios en tu formulario: por eso usamos parámetros, no strings a mano.",
        summary: "Integridad, ACID básico y seguridad.",
        keyPoints: [
          "PK / UNIQUE / FK.",
          "Índices aceleran búsqueda (EXPLAIN).",
          "BEGIN · COMMIT · ROLLBACK.",
          "Normalización: menos duplicados.",
          "Nunca concatenar input en SQL.",
          "DELETE/UPDATE siempre con WHERE consciente.",
        ],
        bankLinks: [
          "sql-pk-unique",
          "sql-fk",
          "sql-index",
          "sql-explain",
          "sql-transaction",
          "sql-commit-rollback",
          "sql-normalization",
          "sql-view",
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
          "js-normalize-movements",
          "js-group-transactions",
          "js-retry-payment",
          "js-format-currency",
          "js-unique-sorted-ids",
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
    id: "exam-meta",
    order: 6,
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
          "S1/S2: MCQ · S3: JS o SQL · S4: CSS · S5: Angular.",
          "Hasta 5 corridas; cada slot mezcla preguntas distintas.",
          "En celular: solo teoría; código en PC.",
        ],
        bankLinks: ["w-pass-70", "w-exam-hours", "w-sessions-count"],
      },
    ],
  },
];

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
