import type { PracticalVariant } from "@/domain/exam";

const angularRestrictions = [
  "ReactiveFormsModule / FormControl / FormBuilder are forbidden.",
  "Manual capture with $event or #templateRef.",
  "Do not modify unit test files (locked).",
  "Do not use NgRx or global state.",
];

export const angularBank: PracticalVariant[] = [
  {
    variantId: "ng-sports-results",
    kind: "angular",
    title: "Angular — API + list",
    subtitle: "Consume sports results API and render the list",
    estimatedMinutes: 50,
    story:
      "First exercise of the real Bancolombia-style panel: call an API of sports match results and list them in the UI (home, away, score). Manual templates only — no Reactive Forms.",
    requirements: [
      "On init, load matches from a service/HttpClient (`GET /api/matches` or injected stub).",
      "Render a list with *ngFor (home vs away, score).",
      "Show a loading flag while the request is in flight.",
      "Show an error message if the request fails.",
      "Optional: filter by team name with a native input (#query or $event).",
    ],
    acceptanceCriteria: [
      "List renders after data arrives.",
      "Loading / error states are handled.",
      "No ReactiveFormsModule / FormControl.",
      "Hidden tests pass.",
    ],
    restrictions: angularRestrictions,
    starterFiles: [
      {
        name: "matches.service.ts",
        language: "typescript",
        code: `import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type Match = {
  id: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
};

/** In the real test this hits HttpClient. Here we stub the API. */
@Injectable({ providedIn: 'root' })
export class MatchesService {
  getMatches(): Observable<Match[]> {
    return of([
      { id: '1', home: 'Nacional', away: 'Millonarios', homeScore: 2, awayScore: 1 },
      { id: '2', home: 'América', away: 'Cali', homeScore: 0, awayScore: 0 },
      { id: '3', home: 'Junior', away: 'Santa Fe', homeScore: 1, awayScore: 3 },
    ]).pipe(delay(300));
  }
}
`,
      },
      {
        name: "sports-board.component.ts",
        language: "typescript",
        code: `import { Component, OnInit } from '@angular/core';
import { MatchesService, Match } from './matches.service';

@Component({
  selector: 'app-sports-board',
  templateUrl: './sports-board.component.html',
})
export class SportsBoardComponent implements OnInit {
  matches: Match[] = [];
  loading = false;
  error = '';
  query = '';

  constructor(private matchesService: MatchesService) {}

  ngOnInit() {
    // TODO: load matches from MatchesService
  }

  get visible(): Match[] {
    // TODO: optional filter by home/away using this.query
    return this.matches;
  }
}
`,
      },
      {
        name: "sports-board.component.html",
        language: "html",
        code: `<section class="sports">
  <h1>Resultados</h1>
  <input type="search" placeholder="Filtrar equipo" />
  <!-- loading / error -->
  <ul>
    <!-- *ngFor matches: home vs away — score -->
  </ul>
</section>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "ngOnInit loads data", patterns: [/ngOnInit\s*\(/, /getMatches\s*\(/] },
      { id: "t2", name: "subscribe or async handling", patterns: [/\.subscribe\s*\(|async/] },
      { id: "t3", name: "loading flag", patterns: [/loading\s*=/] },
      { id: "t4", name: "*ngFor list", patterns: [/\*ngFor/] },
      { id: "t5", name: "template shows scores / teams", patterns: [/homeScore|awayScore|\.home|\.away/] },
      { id: "t6", name: "no Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormBuilder|FormControl|formControlName/] },
    ],
    hints: [
      "this.loading = true; this.matchesService.getMatches().subscribe({ next, error, complete })",
      "*ngFor=\"let m of visible\"",
    ],
    solution: `ngOnInit() {
  this.loading = true;
  this.matchesService.getMatches().subscribe({
    next: (data) => { this.matches = data; this.loading = false; },
    error: () => { this.error = 'No se pudieron cargar los partidos'; this.loading = false; },
  });
}
get visible() {
  const q = this.query.trim().toLowerCase();
  if (!q) return this.matches;
  return this.matches.filter(m =>
    m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q));
}`,
    explanation: "Http/service load in ngOnInit + *ngFor list + optional filter.",
  },
  {
    variantId: "ng-todo-tabs",
    kind: "angular",
    title: "Angular — Components",
    subtitle: "Task list with tabs (To-Do)",
    estimatedMinutes: 50,
    story:
      "To-Do with Pending / Completed / All tabs. 100% manual capture.",
    requirements: [
      "Component with an internal list and all | pending | done tabs.",
      "Add from a native input (#taskInput or $event).",
      "Toggle done and filter by tab.",
    ],
    acceptanceCriteria: [
      "No ReactiveFormsModule.",
      "Tabs filter correctly.",
      "Hidden tests pass.",
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
  // TODO: filter by tab, add items, toggle done
}
`,
      },
      {
        name: "todo-board.component.html",
        language: "html",
        code: `<section class="todo">
  <nav class="todo__tabs"><!-- all / pending / done --></nav>
  <div class="todo__form">
    <input type="text" placeholder="New task" />
    <button type="button">Add</button>
  </div>
  <ul class="todo__list"><!-- render list here --></ul>
</section>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "filtering by tab", patterns: [/filteredTodos|activeTab\s*===\s*['"]pending['"]|filter\s*\(.*done/] },
      { id: "t2", name: "addTodo", patterns: [/addTodo\s*\(/] },
      { id: "t3", name: "toggle", patterns: [/toggle\s*\(/] },
      { id: "t4", name: "template ref or $event", patterns: [/#taskInput|\$event|taskInput\.value/] },
      { id: "t5", name: "no Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormBuilder|FormControl|formControlName/] },
      { id: "t6", name: "*ngFor", patterns: [/\*ngFor/] },
    ],
    hints: ["Getter filteredTodos based on activeTab.", "addTodo(taskInput.value); taskInput.value=''"],
    solution: `get filteredTodos() {
  if (this.activeTab === 'pending') return this.todos.filter(t => !t.done);
  if (this.activeTab === 'done') return this.todos.filter(t => t.done);
  return this.todos;
}`,
    explanation: "Local state + manual capture + tabs.",
  },
  {
    variantId: "ng-transaction-filter",
    kind: "angular",
    title: "Angular — Components",
    subtitle: "Transaction filter",
    estimatedMinutes: 45,
    story:
      "Component that filters a transaction list by text without coupling to the parent with Reactive Forms.",
    requirements: [
      "@Input() transactions.",
      "Native search input (#query or $event).",
      "Case-insensitive list filtered by description.",
      "Optional @Output() filtered when it changes.",
    ],
    acceptanceCriteria: [
      "No FormControl.",
      "Filter updates as you type.",
      "Hidden tests pass.",
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
  // TODO: filter transactions as the user types
}
`,
      },
      {
        name: "tx-filter.component.html",
        language: "html",
        code: `<section>
  <input type="search" placeholder="Search transaction" />
  <ul>
    <!-- render filtered results -->
  </ul>
</section>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "@Input transactions", patterns: [/@Input\(\)\s*transactions/] },
      { id: "t2", name: "filters description", patterns: [/toLowerCase\s*\(|\.includes\s*\(|\.filter\s*\(/] },
      { id: "t3", name: "template ref or input event", patterns: [/#queryInput|\$event|\(input\)|\(keyup\)/] },
      { id: "t4", name: "*ngFor", patterns: [/\*ngFor/] },
      { id: "t5", name: "no Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormControl|formControlName/] },
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
    explanation: "Native input + filter getter.",
  },
  {
    variantId: "ng-tabs-products",
    kind: "angular",
    title: "Angular — Components",
    subtitle: "Products grouped in tabs",
    estimatedMinutes: 50,
    story:
      "Group financial products into tabs by type (accounts, cards, loans) and allow marking favorites.",
    requirements: [
      "activeTab: 'accounts' | 'cards' | 'loans'.",
      "Filtered list by type.",
      "Immutable toggleFavorite(id).",
      "Manual capture if you add an alias (#nameInput).",
    ],
    acceptanceCriteria: [
      "Changing the tab updates the list.",
      "No Reactive Forms.",
      "Hidden tests pass.",
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
    { id: 1, name: 'Savings', kind: 'accounts', favorite: false },
    { id: 2, name: 'Visa Gold', kind: 'cards', favorite: true },
    { id: 3, name: 'Personal loan', kind: 'loans', favorite: false },
  ];
  // TODO: filter by product kind and favorite mutation
}
`,
      },
      {
        name: "products-board.component.html",
        language: "html",
        code: `<nav><!-- tabs --></nav>
<ul><!-- render products for active tab --></ul>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "activeTab / filtered", patterns: [/get\s+filtered|filtered\s*\(|filter\s*\(.*kind/] },
      { id: "t2", name: "setTab or tab change", patterns: [/setTab\s*\(|activeTab\s*=\s*tab|activeTab\s*=\s*kind/] },
      { id: "t3", name: "toggleFavorite", patterns: [/toggleFavorite\s*\(/] },
      { id: "t4", name: "*ngFor", patterns: [/\*ngFor/] },
      { id: "t5", name: "no Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormBuilder|FormControl/] },
    ],
    hints: ["filtered = products.filter(p => p.kind === activeTab)", "immutable map in toggleFavorite"],
    solution: `get filtered() { return this.products.filter(p => p.kind === this.activeTab); }
toggleFavorite(id: number) {
  this.products = this.products.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p);
}`,
    explanation: "Tabs by kind + immutable favorites.",
  },
  {
    variantId: "ng-otp-input",
    kind: "angular",
    title: "Angular — Components",
    subtitle: "Manual OTP capture",
    estimatedMinutes: 45,
    story:
      "Component that captures a 6-digit OTP code with a native input and validates before emitting.",
    requirements: [
      "Read the value with #otpInput or $event.",
      "submitOtp(value) only if /^\\d{6}$/.",
      "@Output() completed = EventEmitter<string>.",
      "Show a local error message without Reactive Forms.",
    ],
    acceptanceCriteria: [
      "Does not emit if the code is invalid.",
      "No FormControl.",
      "Hidden tests pass.",
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
  // TODO: validate and emit the OTP code
}
`,
      },
      {
        name: "otp.component.html",
        language: "html",
        code: `<input maxlength="6" inputmode="numeric" placeholder="Code" />
<button type="button">Confirm</button>
<p *ngIf="error">{{ error }}</p>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "submitOtp", patterns: [/submitOtp\s*\(/] },
      { id: "t2", name: "validates 6 digits", patterns: [/\\d\{6\}|length\s*===\s*6|test\s*\(/] },
      { id: "t3", name: "EventEmitter completed", patterns: [/completed\.emit\s*\(/] },
      { id: "t4", name: "template ref or $event", patterns: [/#otpInput|\$event|otpInput\.value/] },
      { id: "t5", name: "no Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormControl|formControlName/] },
    ],
    hints: ["if (!/^\\d{6}$/.test(value)) { this.error = '...'; return; }", "this.completed.emit(value)"],
    solution: `submitOtp(value: string) {
  if (!/^\\d{6}$/.test(value.trim())) { this.error = 'Invalid code'; return; }
  this.error = '';
  this.completed.emit(value.trim());
}`,
    explanation: "Local validation + emit; manual capture.",
  },
  {
    variantId: "ng-checklist-groups",
    kind: "angular",
    title: "Angular — Components",
    subtitle: "Checklist by groups / tabs",
    estimatedMinutes: 50,
    story:
      "Onboarding checklist (Documents / Data / Confirmation). Mark items and show progress by tab.",
    requirements: [
      "Tabs: docs | data | confirm.",
      "Items with done boolean; toggleItem(id).",
      "Getter progress: { done, total } for the active tab.",
      "No Reactive Forms.",
    ],
    acceptanceCriteria: [
      "Progress reflects the active tab.",
      "Immutable toggle.",
      "Hidden tests pass.",
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
    { id: 1, tab: 'docs', label: 'ID card', done: false },
    { id: 2, tab: 'docs', label: 'Selfie', done: false },
    { id: 3, tab: 'data', label: 'Address', done: false },
    { id: 4, tab: 'confirm', label: 'Accept terms', done: false },
  ];
  // TODO: filter by tab and mark checklist items
}
`,
      },
      {
        name: "checklist.component.html",
        language: "html",
        code: `<nav><!-- tabs --></nav>
<p><!-- progress.done / progress.total --></p>
<ul><!-- render checklist items --></ul>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "activeTab + visible", patterns: [/get\s+visible|visible\s*\(|filter\s*\(.*tab/] },
      { id: "t2", name: "progress", patterns: [/get\s+progress|progress\s*[:=]/] },
      { id: "t3", name: "toggleItem", patterns: [/toggleItem\s*\(/] },
      { id: "t4", name: "*ngFor", patterns: [/\*ngFor/] },
      { id: "t5", name: "no Reactive Forms", patterns: [/./], forbidden: [/ReactiveFormsModule|FormBuilder|FormControl/] },
    ],
    hints: ["visible = items.filter(i => i.tab === activeTab)", "progress counts done in visible"],
    solution: `get visible() { return this.items.filter(i => i.tab === this.activeTab); }
get progress() {
  const list = this.visible;
  return { done: list.filter(i => i.done).length, total: list.length };
}
toggleItem(id: number) {
  this.items = this.items.map(i => i.id === id ? { ...i, done: !i.done } : i);
}`,
    explanation: "Groups in tabs + local progress.",
  },
];
