export type StudyExample = {
  title: string;
  code: string;
  language?: "javascript" | "typescript" | "css" | "sql" | "html" | "text";
  note?: string;
};

export const TOPIC_EXAMPLES: Record<string, StudyExample[]> = {
  "js-types-equality": [
    {
      title: "=== vs ==",
      language: "javascript",
      code: `0 === false   // false
0 == false    // true (coerción)
Number.isNaN(NaN) // true
NaN === NaN       // false`,
      note: "En el examen casi siempre gana ===.",
    },
    {
      title: "typeof y spread en string",
      language: "javascript",
      code: `typeof null        // "object" (histórico)
[...'abc'].length  // 3`,
    },
  ],
  "js-const-immutability": [
    {
      title: "const no congela el arreglo",
      language: "javascript",
      code: `const movs = [{ id: 1, amount: 10 }];
movs.push({ id: 2, amount: 5 }); // OK
// movs = []                      // Error

const next = movs.map(m => ({ ...m, ok: true })); // copia nueva`,
    },
    {
      title: "Spread superficial",
      language: "javascript",
      code: `const base = { cuenta: '123', meta: { moneda: 'COP' } };
const copy = { ...base, cuenta: '456' };
copy.meta.moneda = 'USD'; // base.meta también cambia`,
      note: "structuredClone(base) copia profundo.",
    },
  ],
  "js-map-filter-reduce": [
    {
      title: "Pipeline típico de movimientos",
      language: "javascript",
      code: `const raw = [
  { id: 'a', amount: '100', date: '2024-01-02' },
  { id: 'b', amount: 'x', date: '2024-01-01' },
];

const clean = raw
  .filter(m => !Number.isNaN(Number(m.amount)))
  .map(m => ({ ...m, amount: Number(m.amount) }))
  .reduce((sum, m) => sum + m.amount, 0); // 100`,
    },
    {
      title: "Agrupar con reduce",
      language: "javascript",
      code: `const byCat = items.reduce((acc, item) => {
  const key = item.category;
  acc[key] = acc[key] ?? [];
  acc[key].push(item);
  return acc;
}, {});`,
    },
  ],
  "js-find-some-every": [
    {
      title: "Validaciones rápidas",
      language: "javascript",
      code: `const movs = [{ amount: -50 }, { amount: 200 }];

movs.find(m => m.amount < 0);   // { amount: -50 }
movs.some(m => m.amount < 0);    // true
movs.every(m => m.amount > 0);   // false`,
    },
    {
      title: "includes vs find",
      language: "javascript",
      code: `[1, 2, 3].includes(2);           // true
[{ id: 1 }].includes({ id: 1 }); // false (referencia distinta)`,
    },
  ],
  "js-sort-slice-spread": [
    {
      title: "Ordenar sin mutar",
      language: "javascript",
      code: `const dates = ['2024-03-01', '2024-01-15'];
const sorted = [...dates].sort((a, b) => new Date(a) - new Date(b));`,
    },
    {
      title: "Rest en parámetros",
      language: "javascript",
      code: `function sum(first, ...rest) {
  return rest.reduce((a, n) => a + n, first);
}
sum(10, 1, 2, 3); // 16`,
    },
  ],
  "js-flatmap-chaining": [
    {
      title: "flatMap en tags",
      language: "javascript",
      code: `const users = [
  { name: 'Ana', tags: ['vip', 'ahorros'] },
  { name: 'Luis', tags: ['credito'] },
];
const allTags = users.flatMap(u => u.tags);
// ['vip', 'ahorros', 'credito']`,
    },
    {
      title: "Encadenar transformaciones",
      language: "javascript",
      code: `const total = payments
  .filter(p => p.status === 'ok')
  .map(p => p.amount)
  .reduce((a, n) => a + n, 0);`,
    },
  ],
  "js-closures-scope": [
    {
      title: "Closure contador",
      language: "javascript",
      code: `function makeCounter() {
  let n = 0;
  return () => ++n;
}
const next = makeCounter();
next(); // 1
next(); // 2`,
    },
    {
      title: "Debounce wrapper",
      language: "javascript",
      code: `function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}`,
    },
  ],
  "js-event-loop": [
    {
      title: "Orden microtask vs macrotask",
      language: "javascript",
      code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 1, 4, 3, 2`,
    },
    {
      title: "Promise.all vs allSettled",
      language: "javascript",
      code: `const p1 = Promise.resolve(1);
const p2 = Promise.reject(new Error('fail'));

await Promise.allSettled([p1, p2]);
// [{ status:'fulfilled', value:1 }, { status:'rejected', ... }]`,
    },
  ],
  "js-async-await": [
    {
      title: "try/catch con fetch",
      language: "javascript",
      code: `async function loadAccount(id) {
  try {
    const res = await fetch(\`/api/accounts/\${id}\`);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.error('No se pudo cargar', err);
    return null;
  }
}`,
    },
    {
      title: "Paralelo con Promise.all",
      language: "javascript",
      code: `const [user, movements] = await Promise.all([
  fetchUser(id),
  fetchMovements(id),
]);`,
    },
  ],
  "js-collections-pure": [
    {
      title: "Set para IDs únicos",
      language: "javascript",
      code: `const ids = ['tx1', 'tx2', 'tx1'];
const unique = [...new Set(ids)]; // ['tx1', 'tx2']`,
    },
    {
      title: "?? vs ||",
      language: "javascript",
      code: `const fee = 0;
fee || 10;  // 10 (0 es falsy)
fee ?? 10;  // 0  (solo null/undefined)`,
    },
  ],
  "js-objects-destructuring": [
    {
      title: "Destructuring movimiento",
      language: "javascript",
      code: `const mov = { id: 'm1', amount: 5000, meta: { currency: 'COP' } };
const { amount, meta: { currency } } = mov;
const [first, ...rest] = [1, 2, 3];`,
    },
    {
      title: "Arrow y this",
      language: "javascript",
      code: `const obj = {
  value: 42,
  classic: function () { return this.value; },
  arrow: () => this?.value, // this NO es obj
};
obj.classic(); // 42`,
    },
  ],
  "js-security-http": [
    {
      title: "Evitar XSS",
      language: "javascript",
      code: `// Malo: interpreta HTML
el.innerHTML = userInput;

// Mejor
el.textContent = userInput;`,
    },
    {
      title: "AbortController",
      language: "javascript",
      code: `const ctrl = new AbortController();
fetch('/api/saldo', { signal: ctrl.signal });
// ctrl.abort(); // cancela la petición`,
    },
  ],
  "css-box-model": [
    {
      title: "border-box global",
      language: "css",
      code: `*, *::before, *::after {
  box-sizing: border-box;
}

.card {
  width: 100%;
  padding: 1rem;
  border: 1px solid #333;
}`,
      note: "Con border-box el width incluye padding y border.",
    },
    {
      title: "Margin colapsado",
      language: "css",
      code: `.a { margin-bottom: 24px; }
.b { margin-top: 16px; }
/* Separación real ≈ 24px, no 40px */`,
    },
  ],
  "css-display-flow": [
    {
      title: "block vs inline-block",
      language: "css",
      code: `.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.hidden { display: none; }
.invisible { visibility: hidden; }`,
    },
    {
      title: "Semántica básica",
      language: "html",
      code: `<main>
  <section>
    <h2>Movimientos</h2>
    <p>Últimos 30 días</p>
  </section>
</main>`,
    },
  ],
  "css-flexbox": [
    {
      title: "Barra de acciones",
      language: "css",
      code: `.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}`,
    },
    {
      title: "Formulario en columna",
      language: "css",
      code: `.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 420px;
}`,
    },
  ],
  "css-grid": [
    {
      title: "Cards responsive",
      language: "css",
      code: `.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}`,
    },
    {
      title: "Área hero + sidebar",
      language: "css",
      code: `.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
}`,
    },
  ],
  "css-position-z": [
    {
      title: "Sticky header de tabla",
      language: "css",
      code: `.table-head th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #0c0c0e;
}`,
    },
    {
      title: "Banner OTP fijo abajo",
      language: "css",
      code: `.otp-banner {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  padding: 1rem;
}`,
    },
  ],
  "css-units-typography": [
    {
      title: "rem para escala",
      language: "css",
      code: `html { font-size: 16px; }
body { font-size: 1rem; }
h1 { font-size: 1.75rem; }
.small { font-size: 0.875rem; }`,
    },
    {
      title: "clamp fluido",
      language: "css",
      code: `.title {
  font-size: clamp(1.25rem, 2vw + 1rem, 2rem);
}`,
    },
  ],
  "css-specificity-cascade": [
    {
      title: "Especificidad en acción",
      language: "css",
      code: `button { color: gray; }
.btn-primary { color: white; }
#pay { color: lime; } /* gana si aplica al mismo elemento */`,
    },
    {
      title: "Evitar !important",
      language: "css",
      code: `/* Mejor subir claridad del selector */
.card .amount { font-weight: 600; }`,
    },
  ],
  "css-pseudo-media": [
    {
      title: "Estados interactivos",
      language: "css",
      code: `.btn:hover { background: #27272a; }
.btn:focus-visible {
  outline: 2px solid #fafafa;
  outline-offset: 2px;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }`,
    },
    {
      title: "Mobile first",
      language: "css",
      code: `.list { display: flex; flex-direction: column; gap: 0.5rem; }

@media (min-width: 768px) {
  .list { flex-direction: row; flex-wrap: wrap; }
}`,
    },
  ],
  "css-overflow-scroll": [
    {
      title: "Lista con scroll interno",
      language: "css",
      code: `.movements {
  max-height: 360px;
  overflow-y: auto;
  overscroll-behavior: contain;
}`,
    },
    {
      title: "Texto truncado",
      language: "css",
      code: `.label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 12rem;
}`,
    },
  ],
  "a11y-html": [
    {
      title: "Botón real vs div",
      language: "html",
      code: `<!-- Bien -->
<button type="button">Transferir</button>

<!-- Evitar -->
<div onclick="...">Transferir</div>`,
    },
    {
      title: "aria-live para errores",
      language: "html",
      code: `<p id="otp-error" aria-live="polite" role="status"></p>`,
      note: "Anuncia cambios sin mover el foco del input.",
    },
  ],
  "css-exam-rules": [
    {
      title: "CSS puro sin utilidades",
      language: "css",
      code: `.summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid #3f3f46;
  border-radius: 8px;
}`,
      note: "En la prueba no uses Tailwind ni BDS del cliente.",
    },
    {
      title: "Mobile-first stack",
      language: "css",
      code: `.transfer-form label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.875rem;
}`,
    },
  ],
  "ng-lifecycle-hooks": [
    {
      title: "ngOnInit + ngOnDestroy",
      language: "typescript",
      code: `@Component({ /* ... */ })
export class MovementsComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.api.stream().subscribe();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}`,
    },
    {
      title: "Evitar lógica pesada en constructor",
      language: "typescript",
      code: `constructor(private http: HttpClient) {}

ngOnInit() {
  this.loadMovements();
}`,
    },
  ],
  "ng-onchanges-afterview": [
    {
      title: "Reaccionar a @Input",
      language: "typescript",
      code: `ngOnChanges(changes: SimpleChanges) {
  if (changes['accountId'] && !changes['accountId'].firstChange) {
    this.reload();
  }
}`,
    },
    {
      title: "ViewChild en AfterViewInit",
      language: "typescript",
      code: `@ViewChild('otpInput') otp?: ElementRef<HTMLInputElement>;

ngAfterViewInit() {
  this.otp?.nativeElement.focus();
}`,
    },
  ],
  "ng-signals": [
    {
      title: "signal + computed",
      language: "typescript",
      code: `count = signal(0);
double = computed(() => this.count() * 2);

increment() {
  this.count.update(v => v + 1);
}`,
      note: "En template: {{ count() }}",
    },
    {
      title: "input signal (Angular moderno)",
      language: "typescript",
      code: `items = input.required<Movement[]>();
total = computed(() =>
  this.items().reduce((a, m) => a + m.amount, 0)
);`,
    },
  ],
  "ng-change-detection": [
    {
      title: "OnPush + nueva referencia",
      language: "typescript",
      code: `@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() items: Item[] = [];
}

// Padre
this.items = [...this.items, newItem];`,
    },
    {
      title: "trackBy en *ngFor",
      language: "html",
      code: `<div *ngFor="let m of movements; trackBy: trackById">
  {{ m.id }}
</div>`,
      note: "trackById = (_: number, m: Movement) => m.id;",
    },
  ],
  "ng-inputs-outputs": [
    {
      title: "@Output con EventEmitter",
      language: "typescript",
      code: `@Output() save = new EventEmitter<string>();

onSubmit(value: string) {
  this.save.emit(value);
}`,
    },
    {
      title: "Padre escucha",
      language: "html",
      code: `<app-otp-input (save)="handleOtp($event)" />`,
    },
  ],
  "ng-templates-events": [
    {
      title: "ng-template + outlet",
      language: "html",
      code: `<ng-template #tab let-label="label">
  <button>{{ label }}</button>
</ng-template>

<ng-container *ngTemplateOutlet="tab; context: { label: 'Cuentas' }" />`,
    },
    {
      title: "HostListener",
      language: "typescript",
      code: `@HostListener('document:keydown.escape')
onEsc() {
  this.close();
}`,
    },
  ],
  "ng-rxjs-subjects": [
    {
      title: "BehaviorSubject estado",
      language: "typescript",
      code: `private filter$ = new BehaviorSubject('');
filtered$ = combineLatest([this.all$, this.filter$]).pipe(
  map(([items, q]) => items.filter(i => i.name.includes(q)))
);`,
    },
    {
      title: "async pipe",
      language: "html",
      code: `<li *ngFor="let m of movements$ | async">{{ m.amount }}</li>`,
      note: "Desuscribe solo al destruir el componente.",
    },
  ],
  "ng-directives-pipes": [
    {
      title: "*ngIf / ngClass",
      language: "html",
      code: `<p *ngIf="error" class="error">{{ error }}</p>
<button [ngClass]="{ active: selected, disabled: loading }">
  Filtrar
</button>`,
    },
    {
      title: "Pipe de moneda",
      language: "html",
      code: `{{ amount | currency:'COP':'symbol-narrow':'1.0-0' }}`,
    },
  ],
  "sql-select-where": [
    {
      title: "Movimientos por cuenta y fecha",
      language: "sql",
      code: `SELECT id, amount, created_at
FROM movements
WHERE account_id = 42
  AND created_at BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY created_at DESC
LIMIT 50;`,
    },
    {
      title: "LIKE y DISTINCT",
      language: "sql",
      code: `SELECT DISTINCT category
FROM movements
WHERE description LIKE '%transfer%';`,
    },
  ],
  "sql-joins": [
    {
      title: "INNER JOIN",
      language: "sql",
      code: `SELECT c.name, a.balance
FROM customers c
INNER JOIN accounts a ON a.customer_id = c.id;`,
    },
    {
      title: "LEFT JOIN (conserva clientes sin cuenta)",
      language: "sql",
      code: `SELECT c.name, a.balance
FROM customers c
LEFT JOIN accounts a ON a.customer_id = c.id;`,
    },
  ],
  "sql-null-coalesce": [
    {
      title: "IS NULL y COALESCE",
      language: "sql",
      code: `SELECT name, COALESCE(nickname, name) AS display_name
FROM customers
WHERE deleted_at IS NULL;`,
    },
    {
      title: "COUNT con NULL",
      language: "sql",
      code: `SELECT COUNT(*) FROM movements;      -- todas las filas
SELECT COUNT(note) FROM movements; -- ignora note NULL`,
    },
  ],
  "sql-group-agg": [
    {
      title: "Gasto por categoría",
      language: "sql",
      code: `SELECT category, SUM(amount) AS total
FROM movements
WHERE amount < 0
GROUP BY category
HAVING SUM(amount) < -100000;`,
    },
    {
      title: "Duplicados",
      language: "sql",
      code: `SELECT reference, COUNT(*) AS c
FROM transfers
GROUP BY reference
HAVING COUNT(*) > 1;`,
    },
  ],
  "sql-case-subquery": [
    {
      title: "CASE WHEN",
      language: "sql",
      code: `SELECT id,
  CASE
    WHEN amount > 0 THEN 'ingreso'
    WHEN amount < 0 THEN 'egreso'
    ELSE 'neutro'
  END AS tipo
FROM movements;`,
    },
    {
      title: "EXISTS",
      language: "sql",
      code: `SELECT c.name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM accounts a WHERE a.customer_id = c.id
);`,
    },
  ],
  "sql-window-functions": [
    {
      title: "Saldo acumulado",
      language: "sql",
      code: `SELECT id, amount,
  SUM(amount) OVER (
    PARTITION BY account_id
    ORDER BY created_at
    ROWS UNBOUNDED PRECEDING
  ) AS running_balance
FROM movements;`,
    },
    {
      title: "ROW_NUMBER ranking",
      language: "sql",
      code: `SELECT customer_id, amount,
  ROW_NUMBER() OVER (
    PARTITION BY customer_id ORDER BY amount DESC
  ) AS rn
FROM payments;`,
    },
  ],
  "sql-set-ops-views": [
    {
      title: "UNION ALL",
      language: "sql",
      code: `SELECT id, 'debit' AS src FROM debits
UNION ALL
SELECT id, 'credit' AS src FROM credits;`,
    },
    {
      title: "Vista reutilizable",
      language: "sql",
      code: `CREATE VIEW active_accounts AS
SELECT a.*, c.name
FROM accounts a
JOIN customers c ON c.id = a.customer_id
WHERE a.status = 'active';`,
    },
  ],
  "sql-integrity-safety": [
    {
      title: "Transacción",
      language: "sql",
      code: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;`,
    },
    {
      title: "Parámetros (anti inyección)",
      language: "sql",
      code: `-- App usa placeholders, nunca concatena input:
SELECT * FROM users WHERE email = $1;`,
      note: "Nunca: \"... WHERE email = '\" + input + \"'\"",
    },
  ],
  "prac-js-patterns": [
    {
      title: "Normalizar movimientos",
      language: "javascript",
      code: `export function normalizeMovements(movements) {
  return [...movements]
    .filter(m => Number.isFinite(Number(m.amount)))
    .map(m => ({ ...m, amount: Number(m.amount) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, m) => {
      const running = (acc.at(-1)?.runningBalance ?? 0) + m.amount;
      acc.push({ ...m, runningBalance: running });
      return acc;
    }, []);
}`,
    },
    {
      title: "Retry con backoff",
      language: "javascript",
      code: `async function retry(fn, times = 3, delay = 200) {
  for (let i = 0; i < times; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === times - 1) throw e;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}`,
    },
  ],
  "prac-sql-queries": [
    {
      title: "Movimientos en rango",
      language: "sql",
      code: `SELECT *
FROM movements
WHERE account_id = :accountId
  AND created_at >= :from
  AND created_at < :to
ORDER BY created_at;`,
    },
    {
      title: "Clientes con saldo y último movimiento",
      language: "sql",
      code: `SELECT c.name, a.balance, MAX(m.created_at) AS last_movement
FROM customers c
JOIN accounts a ON a.customer_id = c.id
LEFT JOIN movements m ON m.account_id = a.id
GROUP BY c.id, c.name, a.balance;`,
    },
  ],
  "exam-structure": [
    {
      title: "Las 5 fases",
      language: "text",
      code: `1. MCQ Fundamentos (JS / navegador)
2. MCQ Web + SQL conceptos
3. Práctica JS o SQL (sorteo)
4. Práctica CSS (sin frameworks)
5. Práctica Angular (sin ReactiveForms)

Meta: ≥ 70% ponderado · 180 min · 10 slots de historial`,
    },
    {
      title: "Anti-repetición entre slots",
      language: "text",
      code: `Cada corrida nueva prioriza preguntas y variantes
que NO usaste en slots anteriores. Cuando el banco
se agota, recicla contenido.`,
    },
  ],
};
