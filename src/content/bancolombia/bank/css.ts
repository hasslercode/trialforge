import type { PracticalVariant } from "@/domain/exam";

const cssRestrictions = [
  "No frameworks CSS (Bootstrap, Tailwind, etc.).",
  "No usar el sistema de diseño del banco (BDS).",
  "No modificar el HTML (bloqueado en la plataforma real).",
  "Archivos de prueba / snapshot visual bloqueados.",
];

export const cssBank: PracticalVariant[] = [
  {
    variantId: "css-account-summary",
    kind: "css",
    title: "CSS puro — Maquetación",
    subtitle: "Resumen de cuenta responsive",
    estimatedMinutes: 40,
    story:
      "Maquetar el resumen de cuenta desde cero. HTML fijado; solo CSS. De 320px a desktop, sin frameworks ni BDS.",
    requirements: [
      "Estiliza `.summary`, `.summary__card` y `.summary__balance`.",
      "Layout responsive con Grid o Flexbox nativo.",
      "El saldo principal debe destacarse.",
    ],
    acceptanceCriteria: [
      "En móvil las tarjetas apilan.",
      "En desktop 2–3 columnas fluidas.",
      "Sin overflow horizontal en 320px.",
    ],
    restrictions: cssRestrictions,
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<section class="summary">
  <article class="summary__card summary__card--primary">
    <p class="summary__label">Saldo disponible</p>
    <p class="summary__balance">$ 4.250.000</p>
  </article>
  <article class="summary__card">
    <p class="summary__label">Ingresos del mes</p>
    <p class="summary__value">$ 3.100.000</p>
  </article>
  <article class="summary__card">
    <p class="summary__label">Gastos del mes</p>
    <p class="summary__value">$ 1.420.000</p>
  </article>
</section>
`,
      },
      {
        name: "summary.css",
        language: "css",
        code: `.summary { /* TODO */ }
.summary__card { /* TODO */ }
.summary__card--primary { /* TODO */ }
.summary__label { /* TODO */ }
.summary__balance { /* TODO */ }
.summary__value { /* TODO */ }
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "grid/flex en .summary", patterns: [/\.summary\s*\{[\s\S]*?(display\s*:\s*(grid|flex)|grid-template)/] },
      { id: "t2", name: "columnas responsive", patterns: [/grid-template-columns|flex-wrap|auto-fit|minmax|media/] },
      { id: "t3", name: "estiliza tarjetas", patterns: [/\.summary__card\s*\{[\s\S]*?\}/] },
      { id: "t4", name: "destaca saldo", patterns: [/\.summary__balance\s*\{[\s\S]*?\}/] },
      { id: "t5", name: "sin frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["repeat(auto-fit, minmax(220px, 1fr))", "Separa la tarjeta primary con color distinto."],
    solution: `.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.summary__card { background: #f5f5f5; border-radius: 12px; padding: 20px; }
.summary__card--primary { background: #1a1a1a; color: #fff; }
.summary__balance { font-size: 2rem; font-weight: 700; }`,
    explanation: "Grid + minmax cubre el responsive.",
  },
  {
    variantId: "css-transfer-form",
    kind: "css",
    title: "CSS puro — Maquetación",
    subtitle: "Formulario de transferencia",
    estimatedMinutes: 40,
    story:
      "Debes maquetar un formulario de transferencia claro y usable en móvil. Solo CSS; HTML bloqueado.",
    requirements: [
      "Estiliza `.transfer`, labels, inputs y el botón primario.",
      "Campos apilados con espaciado consistente.",
      "Botón full-width en móvil; alineado a la derecha en desktop (≥768px).",
    ],
    acceptanceCriteria: [
      "Inputs con tipografía legible y padding cómodo.",
      "Estados :focus visibles.",
      "Sin frameworks.",
    ],
    restrictions: cssRestrictions,
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<form class="transfer">
  <label class="transfer__field">Cuenta destino<input name="to" type="text" /></label>
  <label class="transfer__field">Monto<input name="amount" type="text" /></label>
  <label class="transfer__field">Descripción<input name="note" type="text" /></label>
  <button class="transfer__submit" type="submit">Transferir</button>
</form>
`,
      },
      {
        name: "transfer.css",
        language: "css",
        code: `.transfer { /* TODO */ }
.transfer__field { /* TODO */ }
.transfer__field input { /* TODO */ }
.transfer__submit { /* TODO */ }
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "layout del form", patterns: [/\.transfer\s*\{[\s\S]*?(display\s*:\s*(flex|grid)|flex-direction)/] },
      { id: "t2", name: "estiliza inputs", patterns: [/\.transfer__field[\s\S]*?input|\.transfer__field input/] },
      { id: "t3", name: "estiliza botón", patterns: [/\.transfer__submit\s*\{[\s\S]*?\}/] },
      { id: "t4", name: "focus visible", patterns: [/:focus/] },
      { id: "t5", name: "media query desktop", patterns: [/@media/] },
      { id: "t6", name: "sin frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["flex-direction: column + gap.", "@media (min-width: 768px) alinea el botón."],
    solution: `.transfer { display: flex; flex-direction: column; gap: 12px; max-width: 420px; }
.transfer__field { display: flex; flex-direction: column; gap: 6px; font-size: 0.875rem; }
.transfer__field input { padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px; }
.transfer__field input:focus { outline: 2px solid #333; }
.transfer__submit { padding: 12px; width: 100%; border: 0; border-radius: 8px; background: #111; color: #fff; }
@media (min-width: 768px) { .transfer__submit { width: auto; align-self: flex-end; } }`,
    explanation: "Form column + focus + breakpoint para el CTA.",
  },
  {
    variantId: "css-movements-list",
    kind: "css",
    title: "CSS puro — Maquetación",
    subtitle: "Listado de movimientos",
    estimatedMinutes: 40,
    story:
      "Lista de movimientos con monto alineado a la derecha pese a títulos de largo variable.",
    requirements: [
      "Cada `.movement` es una fila (flex o grid).",
      "Título puede truncarse; el monto no debe romperse.",
      "Separadores sutiles entre filas.",
    ],
    acceptanceCriteria: [
      "Monto alineado consistentemente.",
      "Sin position:absolute para el precio.",
      "Tests ocultos pasan.",
    ],
    restrictions: [...cssRestrictions, "No usar position:absolute para el monto."],
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<ul class="movements">
  <li class="movement"><span class="movement__title">Pago PSE supermercado</span><span class="movement__amount">-$ 85.400</span></li>
  <li class="movement"><span class="movement__title">Transferencia recibida</span><span class="movement__amount">+$ 200.000</span></li>
  <li class="movement"><span class="movement__title">Comisión manejo de cuenta mes marzo</span><span class="movement__amount">-$ 12.900</span></li>
</ul>
`,
      },
      {
        name: "movements.css",
        language: "css",
        code: `.movements { /* TODO */ }
.movement { /* TODO */ }
.movement__title { /* TODO */ }
.movement__amount { /* TODO */ }
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "fila flex/grid", patterns: [/\.movement\s*\{[\s\S]*?display\s*:\s*(flex|grid)/] },
      { id: "t2", name: "title con ellipsis o min-width 0", patterns: [/ellipsis|min-width\s*:\s*0|overflow\s*:\s*hidden/] },
      { id: "t3", name: "amount no wrap", patterns: [/white-space\s*:\s*nowrap|flex-shrink\s*:\s*0/] },
      { id: "t4", name: "sin absolute para monto", patterns: [/./], forbidden: [/\.movement__amount\s*\{[\s\S]*?position\s*:\s*absolute/] },
      { id: "t5", name: "sin frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["display:flex; justify-content:space-between;", "title: flex:1; min-width:0; text-overflow:ellipsis;"],
    solution: `.movements { list-style: none; margin: 0; padding: 0; }
.movement { display: flex; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
.movement__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.movement__amount { flex-shrink: 0; white-space: nowrap; font-weight: 600; }`,
    explanation: "Flex + ellipsis evita absolute.",
  },
  {
    variantId: "css-product-cards",
    kind: "css",
    title: "CSS puro — Maquetación",
    subtitle: "Cards de productos financieros",
    estimatedMinutes: 40,
    story:
      "Tres productos (cuenta, tarjeta, crédito) en cards de igual altura con CTA al fondo.",
    requirements: [
      "Grid responsive de `.products`.",
      "Cada `.product` usa flex column y el botón pega abajo (`margin-top: auto`).",
      "Misma altura visual en una fila.",
    ],
    acceptanceCriteria: [
      "CTA alineados en desktop.",
      "Sin frameworks ni BDS.",
    ],
    restrictions: cssRestrictions,
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<section class="products">
  <article class="product"><h3>Cuenta de ahorros</h3><p>Sin cuota de manejo el primer año.</p><button>Solicitar</button></article>
  <article class="product"><h3>Tarjeta crédito</h3><p>Cashback en comercios aliados.</p><button>Solicitar</button></article>
  <article class="product"><h3>Crédito libre</h3><p>Desembolso digital en minutos.</p><button>Solicitar</button></article>
</section>
`,
      },
      {
        name: "products.css",
        language: "css",
        code: `.products { /* TODO */ }
.product { /* TODO */ }
.product button { /* TODO */ }
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "grid en .products", patterns: [/\.products\s*\{[\s\S]*?(display\s*:\s*grid|grid-template)/] },
      { id: "t2", name: "product flex column", patterns: [/\.product\s*\{[\s\S]*?display\s*:\s*flex[\s\S]*?flex-direction\s*:\s*column/] },
      { id: "t3", name: "CTA abajo con margin-top auto", patterns: [/margin-top\s*:\s*auto/] },
      { id: "t4", name: "sin frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["products: display:grid; gap; auto-fit.", "product button { margin-top: auto; }"],
    solution: `.products { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.product { display: flex; flex-direction: column; gap: 8px; padding: 20px; border: 1px solid #ddd; border-radius: 12px; min-height: 220px; }
.product button { margin-top: auto; padding: 10px 14px; }`,
    explanation: "Grid iguala columnas; margin-top:auto empuja el CTA.",
  },
  {
    variantId: "css-otp-banner",
    kind: "css",
    title: "CSS puro — Maquetación",
    subtitle: "Banner de verificación OTP",
    estimatedMinutes: 35,
    story:
      "Banner de seguridad con ícono, mensaje y acciones. Debe leerse bien en mobile.",
    requirements: [
      "`.otp` en flex; apila en pantallas angostas.",
      "Estilos para `.otp__actions` con gap.",
      "Contraste suficiente texto/fondo.",
    ],
    acceptanceCriteria: [
      "Media query o flex-wrap para mobile.",
      "Sin frameworks.",
    ],
    restrictions: cssRestrictions,
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<aside class="otp">
  <div class="otp__icon" aria-hidden="true">!</div>
  <div class="otp__body">
    <strong>Verifica tu identidad</strong>
    <p>Enviamos un código a tu celular registrado.</p>
  </div>
  <div class="otp__actions">
    <button type="button" class="otp__secondary">Reenviar</button>
    <button type="button" class="otp__primary">Continuar</button>
  </div>
</aside>
`,
      },
      {
        name: "otp.css",
        language: "css",
        code: `.otp { /* TODO */ }
.otp__icon { /* TODO */ }
.otp__body { /* TODO */ }
.otp__actions { /* TODO */ }
.otp__primary { /* TODO */ }
.otp__secondary { /* TODO */ }
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "flex en .otp", patterns: [/\.otp\s*\{[\s\S]*?display\s*:\s*flex/] },
      { id: "t2", name: "actions con gap o flex", patterns: [/\.otp__actions\s*\{[\s\S]*?(display\s*:\s*flex|gap)/] },
      { id: "t3", name: "responsive wrap/media", patterns: [/flex-wrap|@media|flex-direction\s*:\s*column/] },
      { id: "t4", name: "estilos primary", patterns: [/\.otp__primary\s*\{[\s\S]*?\}/] },
      { id: "t5", name: "sin frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["align-items:center; gap:16px; flex-wrap:wrap;", "En mobile flex-direction:column."],
    solution: `.otp { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 16px; background: #111; color: #fff; border-radius: 12px; }
.otp__actions { display: flex; gap: 8px; margin-left: auto; }
.otp__primary { background: #fff; color: #111; border: 0; padding: 8px 14px; border-radius: 8px; }
.otp__secondary { background: transparent; color: #fff; border: 1px solid #666; padding: 8px 14px; border-radius: 8px; }
@media (max-width: 600px) { .otp { flex-direction: column; align-items: stretch; } .otp__actions { margin-left: 0; } }`,
    explanation: "Flex + wrap/media para el banner de seguridad.",
  },
];
