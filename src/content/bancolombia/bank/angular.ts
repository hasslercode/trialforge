import type { PracticalVariant } from "@/domain/exam";

const angularRestrictions = [
  "ReactiveFormsModule / FormControl / FormBuilder are forbidden.",
  "Manual capture with $event or #templateRef.",
  "Do not modify unit test files (locked).",
  "Do not use NgRx or global state.",
];

function apiListVariant(opts: {
  variantId: string;
  subtitle: string;
  story: string;
  entity: string;
  serviceFile: string;
  serviceClass: string;
  componentFile: string;
  componentClass: string;
  selector: string;
  typeName: string;
  typeFields: string;
  stubData: string;
  listFieldsHint: string;
  filterFields: string;
}): PracticalVariant {
  const {
    variantId,
    subtitle,
    story,
    entity,
    serviceFile,
    serviceClass,
    componentFile,
    componentClass,
    selector,
    typeName,
    typeFields,
    stubData,
    listFieldsHint,
    filterFields,
  } = opts;

  return {
    variantId,
    kind: "angular",
    title: "Angular — API + list",
    subtitle,
    estimatedMinutes: 50,
    story,
    requirements: [
      `On init, load ${entity} from ${serviceClass} (Observable / subscribe or async pipe).`,
      `Render the list with *ngFor showing: ${listFieldsHint}.`,
      "Show a loading flag while the request is in flight.",
      "Show an error message if the request fails.",
      "Filter the list with a native input (#query or $event) — no Reactive Forms.",
    ],
    acceptanceCriteria: [
      "List renders after data arrives.",
      "Loading and error states are handled.",
      "Filter updates the visible list.",
      "No ReactiveFormsModule / FormControl.",
      "Hidden tests pass.",
    ],
    restrictions: angularRestrictions,
    starterFiles: [
      {
        name: serviceFile,
        language: "typescript",
        code: `import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export type ${typeName} = {
${typeFields}
};

/** In the real test this is HttpClient. Here the API is stubbed. */
@Injectable({ providedIn: 'root' })
export class ${serviceClass} {
  getAll(): Observable<${typeName}[]> {
    return of([
${stubData}
    ]).pipe(delay(300));
  }
}
`,
      },
      {
        name: `${componentFile}.ts`,
        language: "typescript",
        code: `import { Component, OnInit } from '@angular/core';
import { ${serviceClass}, ${typeName} } from './${serviceFile.replace(/\.ts$/, "")}';

@Component({
  selector: '${selector}',
  templateUrl: './${componentFile}.html',
})
export class ${componentClass} implements OnInit {
  items: ${typeName}[] = [];
  loading = false;
  error = '';
  query = '';

  constructor(private api: ${serviceClass}) {}

  ngOnInit() {
    // TODO: load from api.getAll()
  }

  get visible(): ${typeName}[] {
    // TODO: filter by ${filterFields} using this.query
    return this.items;
  }
}
`,
      },
      {
        name: `${componentFile}.html`,
        language: "html",
        code: `<section class="board">
  <h1>${subtitle}</h1>
  <input type="search" placeholder="Filter…" />
  <!-- loading / error -->
  <ul>
    <!-- *ngFor: ${listFieldsHint} -->
  </ul>
</section>
`,
      },
    ],
    hiddenTests: [
      { id: "t1", name: "ngOnInit loads data", patterns: [/ngOnInit\s*\(/, /getAll\s*\(/] },
      { id: "t2", name: "subscribe or async", patterns: [/\.subscribe\s*\(|async/] },
      { id: "t3", name: "loading flag", patterns: [/loading\s*=/] },
      { id: "t4", name: "*ngFor list", patterns: [/\*ngFor/] },
      { id: "t5", name: "filter / visible", patterns: [/visible|filter\s*\(|query/] },
      {
        id: "t6",
        name: "no Reactive Forms",
        patterns: [/./],
        forbidden: [/ReactiveFormsModule|FormBuilder|FormControl|formControlName/],
      },
    ],
    hints: [
      "this.loading = true; this.api.getAll().subscribe({ next, error })",
      `*ngFor="let item of visible"`,
      `Filter with toLowerCase().includes(query) on ${filterFields}`,
    ],
    solution: `ngOnInit() {
  this.loading = true;
  this.api.getAll().subscribe({
    next: (data) => { this.items = data; this.loading = false; },
    error: () => { this.error = 'Load failed'; this.loading = false; },
  });
}`,
    explanation: `Classic panel exercise: service/API → ngOnInit → *ngFor list → optional filter.`,
  };
}

/** Angular practical bank — consume API + list (+ filter). */
export const angularBank: PracticalVariant[] = [
  apiListVariant({
    variantId: "ng-sports-results",
    subtitle: "Sports match results",
    story:
      "Consume a sports results API and list matches (home, away, score). Same shape as the real Bancolombia-style first exercise.",
    entity: "matches",
    serviceFile: "matches.service.ts",
    serviceClass: "MatchesService",
    componentFile: "sports-board.component",
    componentClass: "SportsBoardComponent",
    selector: "app-sports-board",
    typeName: "Match",
    typeFields: `  id: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;`,
    stubData: `      { id: '1', home: 'Nacional', away: 'Millonarios', homeScore: 2, awayScore: 1 },
      { id: '2', home: 'América', away: 'Cali', homeScore: 0, awayScore: 0 },
      { id: '3', home: 'Junior', away: 'Santa Fe', homeScore: 1, awayScore: 3 },`,
    listFieldsHint: "home vs away — score",
    filterFields: "home / away",
  }),
  apiListVariant({
    variantId: "ng-movies-catalog",
    subtitle: "Movies catalog",
    story: "Load movies from an API and list title, year, and rating. Filter by title.",
    entity: "movies",
    serviceFile: "movies.service.ts",
    serviceClass: "MoviesService",
    componentFile: "movies-board.component",
    componentClass: "MoviesBoardComponent",
    selector: "app-movies-board",
    typeName: "Movie",
    typeFields: `  id: string;
  title: string;
  year: number;
  rating: number;`,
    stubData: `      { id: '1', title: 'Inception', year: 2010, rating: 8.8 },
      { id: '2', title: 'Interstellar', year: 2014, rating: 8.6 },
      { id: '3', title: 'Arrival', year: 2016, rating: 7.9 },`,
    listFieldsHint: "title · year · rating",
    filterFields: "title",
  }),
  apiListVariant({
    variantId: "ng-employee-directory",
    subtitle: "Employee directory",
    story: "HR directory: fetch employees and list name, role, and team. Filter by name or team.",
    entity: "employees",
    serviceFile: "employees.service.ts",
    serviceClass: "EmployeesService",
    componentFile: "employees-board.component",
    componentClass: "EmployeesBoardComponent",
    selector: "app-employees-board",
    typeName: "Employee",
    typeFields: `  id: string;
  name: string;
  role: string;
  team: string;`,
    stubData: `      { id: '1', name: 'Ana Ruiz', role: 'Frontend', team: 'Digital' },
      { id: '2', name: 'Luis Pérez', role: 'Backend', team: 'Core' },
      { id: '3', name: 'Marta Gómez', role: 'QA', team: 'Digital' },`,
    listFieldsHint: "name · role · team",
    filterFields: "name / team",
  }),
  apiListVariant({
    variantId: "ng-product-catalog",
    subtitle: "Product catalog",
    story: "E-commerce style list: load products (name, price, category) and filter by name/category.",
    entity: "products",
    serviceFile: "products.service.ts",
    serviceClass: "ProductsService",
    componentFile: "products-board.component",
    componentClass: "ProductsBoardComponent",
    selector: "app-products-board",
    typeName: "Product",
    typeFields: `  id: string;
  name: string;
  price: number;
  category: string;`,
    stubData: `      { id: '1', name: 'Debit card', price: 0, category: 'Cards' },
      { id: '2', name: 'Savings account', price: 0, category: 'Accounts' },
      { id: '3', name: 'Travel insurance', price: 49000, category: 'Insurance' },`,
    listFieldsHint: "name · price · category",
    filterFields: "name / category",
  }),
  apiListVariant({
    variantId: "ng-news-feed",
    subtitle: "News feed",
    story: "Load news items (title, author, date) from an API and list them. Filter by title/author.",
    entity: "articles",
    serviceFile: "news.service.ts",
    serviceClass: "NewsService",
    componentFile: "news-board.component",
    componentClass: "NewsBoardComponent",
    selector: "app-news-board",
    typeName: "Article",
    typeFields: `  id: string;
  title: string;
  author: string;
  date: string;`,
    stubData: `      { id: '1', title: 'Rates update', author: 'Economy desk', date: '2026-07-01' },
      { id: '2', title: 'App redesign', author: 'Product', date: '2026-07-10' },
      { id: '3', title: 'Security tips', author: 'Fraud team', date: '2026-07-12' },`,
    listFieldsHint: "title · author · date",
    filterFields: "title / author",
  }),
  apiListVariant({
    variantId: "ng-branch-locator",
    subtitle: "Branch locator",
    story: "Banking flavor: load branches (city, address, open) and list them. Filter by city.",
    entity: "branches",
    serviceFile: "branches.service.ts",
    serviceClass: "BranchesService",
    componentFile: "branches-board.component",
    componentClass: "BranchesBoardComponent",
    selector: "app-branches-board",
    typeName: "Branch",
    typeFields: `  id: string;
  city: string;
  address: string;
  open: boolean;`,
    stubData: `      { id: '1', city: 'Medellín', address: 'Cra 43A #1', open: true },
      { id: '2', city: 'Bogotá', address: 'Calle 72 #10', open: true },
      { id: '3', city: 'Cali', address: 'Av 6N #28', open: false },`,
    listFieldsHint: "city · address · open/closed",
    filterFields: "city / address",
  }),
];
