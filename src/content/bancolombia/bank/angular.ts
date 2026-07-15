import type { PracticalVariant } from "@/domain/exam";

const angularRestrictions = [
  "Prohibido ReactiveFormsModule / FormControl / FormBuilder.",
  "Captura manual con $event o #templateRef.",
  "No modificar los archivos de prueba unitaria (bloqueados).",
  "No uses NgRx ni estado global.",
];

export const angularBank: PracticalVariant[] = [
  {
    variantId: "ng-todo-tabs",
    kind: "angular",
    title: "Angular — Componentes",
    subtitle: "Lista de tareas con pestañas (To-Do)",
    estimatedMinutes: 50,
    story:
      "To-Do con pestañas Pendientes / Completadas / Todas. Captura 100% manual.",
    requirements: [
      "Componente con lista interna y pestañas all | pending | done.",
      "Agregar desde input nativo (#taskInput o $event).",
      "Toggle de done y filtrado por pestaña.",
    ],
    acceptanceCriteria: [
      "Sin ReactiveFormsModule.",
      "Pestañas filtran bien.",
      "Tests ocultos pasan.",
    ],
    restrictions: angularRestrictions,
    starterFiles: [
      {
        name: "todo-board.component.ts",
        language: "typescript",
        code: `import { Component } from '@angular/core';
type Todo = { id: number; title: string; done: boolean };
type Tab = 'all' | 'pending' | 'done';
@Component({ selector: 'app-todo-board', templateUrl: './todo-board.component.html' })
export class TodoBoardComponent {
  todos: Todo[] = [];
  activeTab: Tab = 'all';
  private seq = 1;
  // TODO: filteredTodos, setTab, addTodo, toggle
}
`,
      },
      {
        name: "todo-board.component.html",
        language: "html",
        code: `<section class="todo">
  <nav class="todo__tabs"><!-- all / pending / done --></nav>
  <div class="todo__form">
    <input #taskInput type="text" placeholder="Nueva tarea" />
    <button type="button">Agregar</button>
  </div>
  <ul class="todo__list"><!-- *ngFor --></ul>
</section>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "filtrado por tab", patterns: [/activeTab|filteredTodos|pending|done/] },
      { id: "t2", name: "addTodo", patterns: [/addTodo\s*\(/] },
      { id: "t3", name: "toggle", patterns: [/toggle\s*\(/] },
      { id: "t4", name: "template ref o $event", patterns: [/#taskInput|\$event|taskInput\.value/] },
      { id: "t5", name: "sin Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormBuilder|FormControl|formControlName/] },
      { id: "t6", name: "*ngFor", patterns: [/\*ngFor/] },
    ],
    hints: ["Getter filteredTodos según activeTab.", "addTodo(taskInput.value); taskInput.value=''"],
    solution: `get filteredTodos() {
  if (this.activeTab === 'pending') return this.todos.filter(t => !t.done);
  if (this.activeTab === 'done') return this.todos.filter(t => t.done);
  return this.todos;
}`,
    explanation: "Estado local + captura manual + tabs.",
  },
  {
    variantId: "ng-transaction-filter",
    kind: "angular",
    title: "Angular — Componentes",
    subtitle: "Filtro de transacciones",
    estimatedMinutes: 45,
    story:
      "Componente que filtra una lista de transacciones por texto sin acoplarse al padre con Reactive Forms.",
    requirements: [
      "@Input() transactions.",
      "Input nativo de búsqueda (#query o $event).",
      "Lista filtrada case-insensitive por description.",
      "@Output() filtered opcional al cambiar.",
    ],
    acceptanceCriteria: [
      "Sin FormControl.",
      "Filtro reactivo al escribir.",
      "Tests ocultos pasan.",
    ],
    restrictions: angularRestrictions,
    starterFiles: [
      {
        name: "tx-filter.component.ts",
        language: "typescript",
        code: `import { Component, EventEmitter, Input, Output } from '@angular/core';
type Tx = { id: string; description: string; amount: number };
@Component({ selector: 'app-tx-filter', templateUrl: './tx-filter.component.html' })
export class TxFilterComponent {
  @Input() transactions: Tx[] = [];
  @Output() filtered = new EventEmitter<Tx[]>();
  query = '';
  // TODO: get visible(): Tx[]
  // TODO: onQuery(value: string)
}
`,
      },
      {
        name: "tx-filter.component.html",
        language: "html",
        code: `<section>
  <input #queryInput type="search" placeholder="Buscar movimiento" />
  <ul>
    <!-- *ngFor de visible -->
  </ul>
</section>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "@Input transactions", patterns: [/@Input\(\)\s*transactions/] },
      { id: "t2", name: "filtra description", patterns: [/description|includes|toLowerCase|filter/] },
      { id: "t3", name: "template ref o input event", patterns: [/#queryInput|\$event|\(input\)|\(keyup\)/] },
      { id: "t4", name: "*ngFor", patterns: [/\*ngFor/] },
      { id: "t5", name: "sin Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormControl|formControlName/] },
    ],
    hints: ["(input)=\"onQuery(queryInput.value)\"", "visible = transactions.filter(...)"],
    solution: `get visible() {
  const q = this.query.trim().toLowerCase();
  return this.transactions.filter(t => t.description.toLowerCase().includes(q));
}
onQuery(value: string) {
  this.query = value;
  this.filtered.emit(this.visible);
}`,
    explanation: "Input nativo + getter de filtrado.",
  },
  {
    variantId: "ng-tabs-products",
    kind: "angular",
    title: "Angular — Componentes",
    subtitle: "Productos agrupados en pestañas",
    estimatedMinutes: 50,
    story:
      "Agrupa productos financieros en pestañas por tipo (cuentas, tarjetas, créditos) y permite marcar favoritos.",
    requirements: [
      "activeTab: 'accounts' | 'cards' | 'loans'.",
      "Lista filtrada por tipo.",
      "toggleFavorite(id) inmutable.",
      "Captura manual si agregas un alias (#nameInput).",
    ],
    acceptanceCriteria: [
      "Cambio de pestaña actualiza la lista.",
      "Sin Reactive Forms.",
      "Tests ocultos pasan.",
    ],
    restrictions: angularRestrictions,
    starterFiles: [
      {
        name: "products-board.component.ts",
        language: "typescript",
        code: `import { Component } from '@angular/core';
type Kind = 'accounts' | 'cards' | 'loans';
type Product = { id: number; name: string; kind: Kind; favorite: boolean };
@Component({ selector: 'app-products-board', templateUrl: './products-board.component.html' })
export class ProductsBoardComponent {
  activeTab: Kind = 'accounts';
  products: Product[] = [
    { id: 1, name: 'Ahorros', kind: 'accounts', favorite: false },
    { id: 2, name: 'Visa Gold', kind: 'cards', favorite: true },
    { id: 3, name: 'Libre inversión', kind: 'loans', favorite: false },
  ];
  // TODO: filtered, setTab, toggleFavorite
}
`,
      },
      {
        name: "products-board.component.html",
        language: "html",
        code: `<nav><!-- tabs --></nav>
<ul><!-- *ngFor filtered --></ul>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "activeTab / filtered", patterns: [/activeTab|filtered/] },
      { id: "t2", name: "setTab o cambio de tab", patterns: [/setTab|activeTab\s*=/] },
      { id: "t3", name: "toggleFavorite", patterns: [/toggleFavorite/] },
      { id: "t4", name: "*ngFor", patterns: [/\*ngFor/] },
      { id: "t5", name: "sin Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormBuilder|FormControl/] },
    ],
    hints: ["filtered = products.filter(p => p.kind === activeTab)", "map inmutable en toggleFavorite"],
    solution: `get filtered() { return this.products.filter(p => p.kind === this.activeTab); }
toggleFavorite(id: number) {
  this.products = this.products.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p);
}`,
    explanation: "Pestañas por kind + favoritos inmutables.",
  },
  {
    variantId: "ng-otp-input",
    kind: "angular",
    title: "Angular — Componentes",
    subtitle: "Captura OTP manual",
    estimatedMinutes: 45,
    story:
      "Componente que captura un código OTP de 6 dígitos con input nativo y valida antes de emitir.",
    requirements: [
      "Leer valor con #otpInput o $event.",
      "submitOtp(value) solo si /^\\d{6}$/.",
      "@Output() completed = EventEmitter<string>.",
      "Mostrar mensaje de error local sin Reactive Forms.",
    ],
    acceptanceCriteria: [
      "No emite si el código es inválido.",
      "Sin FormControl.",
      "Tests ocultos pasan.",
    ],
    restrictions: angularRestrictions,
    starterFiles: [
      {
        name: "otp.component.ts",
        language: "typescript",
        code: `import { Component, EventEmitter, Output } from '@angular/core';
@Component({ selector: 'app-otp', templateUrl: './otp.component.html' })
export class OtpComponent {
  @Output() completed = new EventEmitter<string>();
  error = '';
  // TODO: submitOtp(value: string)
}
`,
      },
      {
        name: "otp.component.html",
        language: "html",
        code: `<input #otpInput maxlength="6" inputmode="numeric" placeholder="Código" />
<button type="button">Confirmar</button>
<p *ngIf="error">{{ error }}</p>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "submitOtp", patterns: [/submitOtp\s*\(/] },
      { id: "t2", name: "valida 6 dígitos", patterns: [/\\d\{6\}|length\s*===\s*6|test\s*\(/] },
      { id: "t3", name: "EventEmitter completed", patterns: [/completed\.emit|EventEmitter/] },
      { id: "t4", name: "template ref o $event", patterns: [/#otpInput|\$event|otpInput\.value/] },
      { id: "t5", name: "sin Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormControl|formControlName/] },
    ],
    hints: ["if (!/^\\d{6}$/.test(value)) { this.error = '...'; return; }", "this.completed.emit(value)"],
    solution: `submitOtp(value: string) {
  if (!/^\\d{6}$/.test(value.trim())) { this.error = 'Código inválido'; return; }
  this.error = '';
  this.completed.emit(value.trim());
}`,
    explanation: "Validación local + emit; captura manual.",
  },
  {
    variantId: "ng-checklist-groups",
    kind: "angular",
    title: "Angular — Componentes",
    subtitle: "Checklist por grupos / pestañas",
    estimatedMinutes: 50,
    story:
      "Checklist de onboarding (Documentos / Datos / Confirmación). Marca ítems y muestra progreso por pestaña.",
    requirements: [
      "Tabs: docs | data | confirm.",
      "Ítems con done boolean; toggleItem(id).",
      "Getter progress: { done, total } de la pestaña activa.",
      "Sin Reactive Forms.",
    ],
    acceptanceCriteria: [
      "Progreso refleja la pestaña activa.",
      "Toggle inmutable.",
      "Tests ocultos pasan.",
    ],
    restrictions: angularRestrictions,
    starterFiles: [
      {
        name: "checklist.component.ts",
        language: "typescript",
        code: `import { Component } from '@angular/core';
type Tab = 'docs' | 'data' | 'confirm';
type Item = { id: number; tab: Tab; label: string; done: boolean };
@Component({ selector: 'app-checklist', templateUrl: './checklist.component.html' })
export class ChecklistComponent {
  activeTab: Tab = 'docs';
  items: Item[] = [
    { id: 1, tab: 'docs', label: 'Cédula', done: false },
    { id: 2, tab: 'docs', label: 'Selfie', done: false },
    { id: 3, tab: 'data', label: 'Dirección', done: false },
    { id: 4, tab: 'confirm', label: 'Aceptar términos', done: false },
  ];
  // TODO: visible, progress, setTab, toggleItem
}
`,
      },
      {
        name: "checklist.component.html",
        language: "html",
        code: `<nav><!-- tabs --></nav>
<p><!-- progress.done / progress.total --></p>
<ul><!-- *ngFor visible --></ul>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "activeTab + visible", patterns: [/activeTab|visible/] },
      { id: "t2", name: "progress", patterns: [/progress/] },
      { id: "t3", name: "toggleItem", patterns: [/toggleItem/] },
      { id: "t4", name: "*ngFor", patterns: [/\*ngFor/] },
      { id: "t5", name: "sin Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormBuilder|FormControl/] },
    ],
    hints: ["visible = items.filter(i => i.tab === activeTab)", "progress cuenta done en visible"],
    solution: `get visible() { return this.items.filter(i => i.tab === this.activeTab); }
get progress() {
  const list = this.visible;
  return { done: list.filter(i => i.done).length, total: list.length };
}
toggleItem(id: number) {
  this.items = this.items.map(i => i.id === id ? { ...i, done: !i.done } : i);
}`,
    explanation: "Grupos en tabs + progreso local.",
  },
];
