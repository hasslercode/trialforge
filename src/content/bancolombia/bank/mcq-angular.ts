import type { McqQuestion } from "@/domain/exam";

/**
 * Angular MCQ — last panel phase: straightforward, not tricky “cascaritas”.
 * Covers bindings, lists, HTTP, inputs/outputs at interview-easy level.
 */
export const mcqAngularBank: McqQuestion[] = [
  {
    id: "ng-interp",
    prompt: "Show the component property `title` in the template:",
    options: [
      { id: "a", label: "{{ title }}" },
      { id: "b", label: "[[ title ]]" },
      { id: "c", label: "{ title }" },
      { id: "d", label: "$title" },
    ],
    answerId: "a",
    explanation: "Interpolation uses double curly braces.",
  },
  {
    id: "ng-click",
    prompt: "Wire a button click to `reload()`?",
    options: [
      { id: "a", label: '<button (click)="reload()">Reload</button>' },
      { id: "b", label: '<button [click]="reload()">Reload</button>' },
      { id: "c", label: '<button onclick="reload()">Reload</button>' },
      { id: "d", label: '<button {{click}}="reload()">Reload</button>' },
    ],
    answerId: "a",
    explanation: "Events use (eventName). [click] would be a property binding.",
  },
  {
    id: "ng-disabled",
    prompt: "Disable the button while `loading` is true:",
    options: [
      { id: "a", label: '<button [disabled]="loading">Save</button>' },
      { id: "b", label: '<button (disabled)="loading">Save</button>' },
      { id: "c", label: '<button disabled="loading">Save</button> (always string “loading”)' },
      { id: "d", label: '<button #disabled="loading">Save</button>' },
    ],
    answerId: "a",
    explanation: "Property binding [disabled] evaluates the expression.",
  },
  {
    id: "ng-ngif",
    prompt: "`*ngIf=\"error\"` when error is an empty string:",
    options: [
      { id: "a", label: "The block is not rendered (falsy)" },
      { id: "b", label: "The block always renders" },
      { id: "c", label: "Angular throws because *ngIf needs a boolean only" },
      { id: "d", label: "It becomes *ngFor automatically" },
    ],
    answerId: "a",
    explanation: "*ngIf uses truthiness; '' is falsy so the view is removed.",
  },
  {
    id: "ng-ngfor",
    prompt: "List `items` with *ngFor:",
    options: [
      { id: "a", label: '<li *ngFor="let item of items">{{ item.name }}</li>' },
      { id: "b", label: '<li *ngIf="let item of items">{{ item.name }}</li>' },
      { id: "c", label: '<li [ngFor]="items">{{ item.name }}</li>' },
      { id: "d", label: '<li ng-repeat="item in items">{{ item.name }}</li>' },
    ],
    answerId: "a",
    explanation: "*ngFor is the Angular list directive (ng-repeat was AngularJS).",
  },
  {
    id: "ng-input",
    prompt: "Receive a list from the parent component:",
    options: [
      { id: "a", label: "@Input() matches: Match[]" },
      { id: "b", label: "@Output() matches: Match[]" },
      { id: "c", label: "@Injectable() matches: Match[]" },
      { id: "d", label: "@HostBinding() matches: Match[]" },
    ],
    answerId: "a",
    explanation: "@Input is parent → child data.",
  },
  {
    id: "ng-output",
    prompt: "Emit a selected id to the parent:",
    options: [
      { id: "a", label: "@Output() select = new EventEmitter<string>()" },
      { id: "b", label: "@Input() select = new EventEmitter<string>()" },
      { id: "c", label: "window.parent.select(id)" },
      { id: "d", label: "document.emit('select')" },
    ],
    answerId: "a",
    explanation: "@Output + EventEmitter sends events upward.",
  },
  {
    id: "ng-output-template",
    prompt: "Parent listens to the child’s `select` output:",
    options: [
      { id: "a", label: '<app-list (select)="onSelect($event)" />' },
      { id: "b", label: '<app-list [select]="onSelect($event)" />' },
      { id: "c", label: '<app-list on-select="onSelect()" />' },
      { id: "d", label: '<app-list {{select}}="onSelect" />' },
    ],
    answerId: "a",
    explanation: "Outputs bind with (eventName).",
  },
  {
    id: "ng-httpclient",
    prompt: "Standard Angular way to call REST APIs?",
    options: [
      { id: "a", label: "HttpClient (@angular/common/http)" },
      { id: "b", label: "jquery.ajax inside components" },
      { id: "c", label: "Only raw XMLHttpRequest with no DI" },
      { id: "d", label: "localStorage.fetch" },
    ],
    answerId: "a",
    explanation: "HttpClient is the framework HTTP API.",
  },
  {
    id: "ng-ngoninit-load",
    prompt: "Best lifecycle hook to start the initial API load?",
    options: [
      { id: "a", label: "ngOnInit" },
      { id: "b", label: "ngOnDestroy" },
      { id: "c", label: "After the HTML file’s onclick attribute" },
      { id: "d", label: "Only inside @Output setters" },
    ],
    answerId: "a",
    explanation: "ngOnInit is the usual place for initial fetching.",
  },
  {
    id: "ng-twoway",
    prompt: "Two-way binding syntax with ngModel:",
    options: [
      { id: "a", label: '[(ngModel)]="query"' },
      { id: "b", label: '[()]ngModel="query"' },
      { id: "c", label: '{{ngModel}}="query"' },
      { id: "d", label: '(ngModel])="query"' },
    ],
    answerId: "a",
    explanation: "Banana-in-a-box [(ngModel)] is two-way.",
  },
  {
    id: "ng-async-pipe",
    prompt: "`matches$ | async` in the template:",
    options: [
      { id: "a", label: "Subscribes and shows the latest value (unsubscribes on destroy)" },
      { id: "b", label: "Converts Observable to Promise at compile time" },
      { id: "c", label: "Disables change detection" },
      { id: "d", label: "Only works with strings" },
    ],
    answerId: "a",
    explanation: "async pipe manages the subscription for you.",
  },
  {
    id: "ng-selector",
    prompt: "`@Component({ selector: 'app-matches' })` means you render it as:",
    options: [
      { id: "a", label: "<app-matches></app-matches>" },
      { id: "b", label: "<div component='app-matches'>" },
      { id: "c", label: "A CSS class .app-matches only" },
      { id: "d", label: "A route path automatically" },
    ],
    answerId: "a",
    explanation: "selector is the custom element tag.",
  },
  {
    id: "ng-trackby-why",
    prompt: "Why add `trackBy` on *ngFor when polling refreshes the array?",
    options: [
      {
        id: "a",
        label: "Reuse DOM nodes for stable ids instead of recreating every row",
      },
      { id: "b", label: "It enables Reactive Forms" },
      { id: "c", label: "It replaces HttpClient" },
      { id: "d", label: "Required for *ngIf to work" },
    ],
    answerId: "a",
    explanation: "trackBy improves list diffing when references change.",
  },
  {
    id: "ng-service-inject",
    prompt: "Typical way to use a service inside a component?",
    options: [
      { id: "a", label: "Constructor injection (or inject())" },
      { id: "b", label: "new MyService() in every method without DI" },
      { id: "c", label: "Put the service class in the HTML file" },
      { id: "d", label: "Import it only in styles.css" },
    ],
    answerId: "a",
    explanation: "Angular DI provides services via the constructor / inject().",
  },
  {
    id: "ng-loading-pattern",
    prompt: "While HttpClient is in flight, UX usually toggles:",
    options: [
      { id: "a", label: "A loading flag set true before subscribe and false on next/error" },
      { id: "b", label: "document.write('loading')" },
      { id: "c", label: "window.alert on every byte" },
      { id: "d", label: "Disable Zone.js globally" },
    ],
    answerId: "a",
    explanation: "Simple loading boolean around the async call — same as the API+list exercise.",
  },
];
