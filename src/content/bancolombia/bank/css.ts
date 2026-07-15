import type { PracticalVariant } from "@/domain/exam";

const cssRestrictions = [
  "No CSS frameworks (Bootstrap, Tailwind, etc.).",
  "Do not use the bank design system (BDS).",
  "Do not modify the HTML (locked in the real platform).",
  "Test files / visual snapshots are locked.",
];

export const cssBank: PracticalVariant[] = [
  {
    variantId: "css-account-summary",
    kind: "css",
    title: "Pure CSS — Layout",
    subtitle: "Responsive account summary",
    estimatedMinutes: 40,
    story:
      "Build the account summary layout from scratch. Fixed HTML; CSS only. From 320px to desktop, without frameworks or BDS.",
    requirements: [
      "Style `.summary`, `.summary__card`, and `.summary__balance`.",
      "Responsive layout with native Grid or Flexbox.",
      "The main balance must stand out.",
    ],
    acceptanceCriteria: [
      "On mobile, the cards stack.",
      "On desktop, 2-3 fluid columns.",
      "No horizontal overflow at 320px.",
    ],
    restrictions: cssRestrictions,
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<section class="summary">
  <article class="summary__card summary__card--primary">
    <p class="summary__label">Available balance</p>
    <p class="summary__balance">$ 4.250.000</p>
  </article>
  <article class="summary__card">
    <p class="summary__label">Monthly income</p>
    <p class="summary__value">$ 3.100.000</p>
  </article>
  <article class="summary__card">
    <p class="summary__label">Monthly expenses</p>
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
      { id: "t1", name: "grid/flex in .summary", patterns: [/\.summary\s*\{[\s\S]*?(display\s*:\s*(grid|flex)|grid-template)/] },
      { id: "t2", name: "responsive columns", patterns: [/grid-template-columns|flex-wrap|auto-fit|minmax|media/] },
      { id: "t3", name: "styles cards", patterns: [/\.summary__card\s*\{[\s\S]*?\}/] },
      { id: "t4", name: "highlights balance", patterns: [/\.summary__balance\s*\{[\s\S]*?\}/] },
      { id: "t5", name: "no frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["repeat(auto-fit, minmax(220px, 1fr))", "Separate the primary card with a different color."],
    solution: `.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.summary__card { background: #f5f5f5; border-radius: 12px; padding: 20px; }
.summary__card--primary { background: #1a1a1a; color: #fff; }
.summary__balance { font-size: 2rem; font-weight: 700; }`,
    explanation: "Grid + minmax covers the responsive behavior.",
  },
  {
    variantId: "css-transfer-form",
    kind: "css",
    title: "Pure CSS — Layout",
    subtitle: "Transfer form",
    estimatedMinutes: 40,
    story:
      "You must lay out a clear transfer form that is usable on mobile. CSS only; HTML is locked.",
    requirements: [
      "Style `.transfer`, labels, inputs, and the primary button.",
      "Stack fields with consistent spacing.",
      "Full-width button on mobile; right-aligned on desktop (>=768px).",
    ],
    acceptanceCriteria: [
      "Inputs have legible typography and comfortable padding.",
      "Visible :focus states.",
      "No frameworks.",
    ],
    restrictions: cssRestrictions,
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<form class="transfer">
  <label class="transfer__field">Destination account<input name="to" type="text" /></label>
  <label class="transfer__field">Amount<input name="amount" type="text" /></label>
  <label class="transfer__field">Description<input name="note" type="text" /></label>
  <button class="transfer__submit" type="submit">Transfer</button>
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
      { id: "t1", name: "form layout", patterns: [/\.transfer\s*\{[\s\S]*?(display\s*:\s*(flex|grid)|flex-direction)/] },
      { id: "t2", name: "styles inputs", patterns: [/\.transfer__field[\s\S]*?input|\.transfer__field input/] },
      { id: "t3", name: "styles button", patterns: [/\.transfer__submit\s*\{[\s\S]*?\}/] },
      { id: "t4", name: "focus visible", patterns: [/:focus/] },
      { id: "t5", name: "desktop media query", patterns: [/@media/] },
      { id: "t6", name: "no frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["flex-direction: column + gap.", "@media (min-width: 768px) aligns the button."],
    solution: `.transfer { display: flex; flex-direction: column; gap: 12px; max-width: 420px; }
.transfer__field { display: flex; flex-direction: column; gap: 6px; font-size: 0.875rem; }
.transfer__field input { padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px; }
.transfer__field input:focus { outline: 2px solid #333; }
.transfer__submit { padding: 12px; width: 100%; border: 0; border-radius: 8px; background: #111; color: #fff; }
@media (min-width: 768px) { .transfer__submit { width: auto; align-self: flex-end; } }`,
    explanation: "Form column + focus + breakpoint for the CTA.",
  },
  {
    variantId: "css-movements-list",
    kind: "css",
    title: "Pure CSS — Layout",
    subtitle: "Movements list",
    estimatedMinutes: 40,
    story:
      "Movements list with the amount aligned to the right despite variable-length titles.",
    requirements: [
      "Each `.movement` is a row (flex or grid).",
      "The title can truncate; the amount must not wrap.",
      "Subtle separators between rows.",
    ],
    acceptanceCriteria: [
      "Amount aligned consistently.",
      "No position:absolute for the amount.",
      "Hidden tests pass.",
    ],
    restrictions: [...cssRestrictions, "Do not use position:absolute for the amount."],
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<ul class="movements">
  <li class="movement"><span class="movement__title">PSE supermarket payment</span><span class="movement__amount">-$ 85.400</span></li>
  <li class="movement"><span class="movement__title">Incoming transfer</span><span class="movement__amount">+$ 200.000</span></li>
  <li class="movement"><span class="movement__title">March account maintenance fee</span><span class="movement__amount">-$ 12.900</span></li>
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
      { id: "t1", name: "flex/grid row", patterns: [/\.movement\s*\{[\s\S]*?display\s*:\s*(flex|grid)/] },
      { id: "t2", name: "title with ellipsis or min-width 0", patterns: [/ellipsis|min-width\s*:\s*0|overflow\s*:\s*hidden/] },
      { id: "t3", name: "amount no wrap", patterns: [/white-space\s*:\s*nowrap|flex-shrink\s*:\s*0/] },
      { id: "t4", name: "no absolute for amount", patterns: [/./], forbidden: [/\.movement__amount\s*\{[\s\S]*?position\s*:\s*absolute/] },
      { id: "t5", name: "no frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["display:flex; justify-content:space-between;", "title: flex:1; min-width:0; text-overflow:ellipsis;"],
    solution: `.movements { list-style: none; margin: 0; padding: 0; }
.movement { display: flex; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
.movement__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.movement__amount { flex-shrink: 0; white-space: nowrap; font-weight: 600; }`,
    explanation: "Flex + ellipsis avoids absolute.",
  },
  {
    variantId: "css-product-cards",
    kind: "css",
    title: "Pure CSS — Layout",
    subtitle: "Financial product cards",
    estimatedMinutes: 40,
    story:
      "Three products (account, card, loan) in equal-height cards with the CTA at the bottom.",
    requirements: [
      "Responsive grid for `.products`.",
      "Each `.product` uses flex column and the button sticks to the bottom (`margin-top: auto`).",
      "Same visual height in a row.",
    ],
    acceptanceCriteria: [
      "CTAs aligned on desktop.",
      "No frameworks or BDS.",
    ],
    restrictions: cssRestrictions,
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<section class="products">
  <article class="product"><h3>Savings account</h3><p>No management fee for the first year.</p><button>Apply</button></article>
  <article class="product"><h3>Credit card</h3><p>Cashback at partner businesses.</p><button>Apply</button></article>
  <article class="product"><h3>Personal loan</h3><p>Digital disbursement in minutes.</p><button>Apply</button></article>
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
      { id: "t1", name: "grid in .products", patterns: [/\.products\s*\{[\s\S]*?(display\s*:\s*grid|grid-template)/] },
      { id: "t2", name: "product flex column", patterns: [/\.product\s*\{[\s\S]*?display\s*:\s*flex[\s\S]*?flex-direction\s*:\s*column/] },
      { id: "t3", name: "CTA at the bottom with margin-top auto", patterns: [/margin-top\s*:\s*auto/] },
      { id: "t4", name: "no frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["products: display:grid; gap; auto-fit.", "product button { margin-top: auto; }"],
    solution: `.products { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.product { display: flex; flex-direction: column; gap: 8px; padding: 20px; border: 1px solid #ddd; border-radius: 12px; min-height: 220px; }
.product button { margin-top: auto; padding: 10px 14px; }`,
    explanation: "Grid equalizes columns; margin-top:auto pushes the CTA.",
  },
  {
    variantId: "css-otp-banner",
    kind: "css",
    title: "Pure CSS — Layout",
    subtitle: "OTP verification banner",
    estimatedMinutes: 35,
    story:
      "Security banner with an icon, message, and actions. It must read well on mobile.",
    requirements: [
      "`.otp` in flex; stacks on narrow screens.",
      "Styles for `.otp__actions` with gap.",
      "Sufficient text/background contrast.",
    ],
    acceptanceCriteria: [
      "Media query or flex-wrap for mobile.",
      "No frameworks.",
    ],
    restrictions: cssRestrictions,
    starterFiles: [
      {
        name: "index.html",
        language: "html",
        code: `<aside class="otp">
  <div class="otp__icon" aria-hidden="true">!</div>
  <div class="otp__body">
    <strong>Verify your identity</strong>
    <p>We sent a code to your registered mobile phone.</p>
  </div>
  <div class="otp__actions">
    <button type="button" class="otp__secondary">Resend</button>
    <button type="button" class="otp__primary">Continue</button>
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
      { id: "t1", name: "flex in .otp", patterns: [/\.otp\s*\{[\s\S]*?display\s*:\s*flex/] },
      { id: "t2", name: "actions with gap or flex", patterns: [/\.otp__actions\s*\{[\s\S]*?(display\s*:\s*flex|gap)/] },
      { id: "t3", name: "responsive wrap/media", patterns: [/flex-wrap|@media|flex-direction\s*:\s*column/] },
      { id: "t4", name: "primary styles", patterns: [/\.otp__primary\s*\{[\s\S]*?\}/] },
      { id: "t5", name: "no frameworks", patterns: [/./], forbidden: [/@tailwind|bootstrap|bds-/i] },
    ],
    hints: ["align-items:center; gap:16px; flex-wrap:wrap;", "On mobile, flex-direction:column."],
    solution: `.otp { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 16px; background: #111; color: #fff; border-radius: 12px; }
.otp__actions { display: flex; gap: 8px; margin-left: auto; }
.otp__primary { background: #fff; color: #111; border: 0; padding: 8px 14px; border-radius: 8px; }
.otp__secondary { background: transparent; color: #fff; border: 1px solid #666; padding: 8px 14px; border-radius: 8px; }
@media (max-width: 600px) { .otp { flex-direction: column; align-items: stretch; } .otp__actions { margin-left: 0; } }`,
    explanation: "Flex + wrap/media for the security banner.",
  },
];
