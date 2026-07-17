import type { McqQuestion } from "@/domain/exam";

/**
 * Simple Angular MCQs — last phase of the Bancolombia-style panel
 * (“nada del otro mundo”).
 */
export const mcqAngularSimpleBank: McqQuestion[] = [
  {
    id: "ng-simple-interpolation",
    prompt: "How do you show the `name` property in a template?",
    options: [
      { id: "a", label: "{{ name }}" },
      { id: "b", label: "[[ name ]]" },
      { id: "c", label: "{ name }" },
      { id: "d", label: "$(( name ))" },
    ],
    answerId: "a",
    explanation: "Interpolation uses double curly braces.",
  },
  {
    id: "ng-simple-event-binding",
    prompt: "Correct event binding for a click handler?",
    options: [
      { id: "a", label: '<button (click)="save()">Save</button>' },
      { id: "b", label: '<button [click]="save()">Save</button>' },
      { id: "c", label: '<button onclick="save()">Save</button>' },
      { id: "d", label: '<button {{click}}="save()">Save</button>' },
    ],
    answerId: "a",
    explanation: "Events use (eventName). [click] would be a property binding.",
  },
  {
    id: "ng-simple-property-binding",
    prompt: "Bind a disabled state from the component?",
    options: [
      { id: "a", label: '<button [disabled]="isLoading">Go</button>' },
      { id: "b", label: '<button (disabled)="isLoading">Go</button>' },
      { id: "c", label: '<button disabled="{{ }}isLoading">Go</button>' },
      { id: "d", label: '<button #disabled="isLoading">Go</button>' },
    ],
    answerId: "a",
    explanation: "Property binding uses [property]=\"expression\".",
  },
  {
    id: "ng-simple-ngif",
    prompt: "`*ngIf=\"showError\"` does what?",
    options: [
      { id: "a", label: "Adds/removes the element from the DOM based on showError" },
      { id: "b", label: "Always keeps the element and only changes CSS opacity" },
      { id: "c", label: "Creates a FormControl named showError" },
      { id: "d", label: "Loops over showError as an array" },
    ],
    answerId: "a",
    explanation: "*ngIf is a structural directive that mounts/unmounts the view.",
  },
  {
    id: "ng-simple-ngfor",
    prompt: "Render a list of matches?",
    options: [
      { id: "a", label: '<li *ngFor="let m of matches">{{ m.home }}</li>' },
      { id: "b", label: '<li *ngIf="let m of matches">{{ m.home }}</li>' },
      { id: "c", label: '<li [ngFor]="matches">{{ m.home }}</li>' },
      { id: "d", label: '<li ng-repeat="m in matches">{{ m.home }}</li>' },
    ],
    answerId: "a",
    explanation: "*ngFor is the Angular list directive (ng-repeat was AngularJS).",
  },
  {
    id: "ng-simple-input",
    prompt: "Pass data from parent to child?",
    options: [
      { id: "a", label: "@Input() matches: Match[]" },
      { id: "b", label: "@Output() matches: Match[]" },
      { id: "c", label: "@ViewChild() matches: Match[]" },
      { id: "d", label: "@Injectable() matches: Match[]" },
    ],
    answerId: "a",
    explanation: "@Input receives data downward from the parent.",
  },
  {
    id: "ng-simple-output",
    prompt: "Notify the parent that a match was selected?",
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
    id: "ng-simple-httpclient",
    prompt: "Standard way to call a REST API in Angular?",
    options: [
      { id: "a", label: "HttpClient from @angular/common/http" },
      { id: "b", label: "jquery.ajax inside the component" },
      { id: "c", label: "Only XMLHttpRequest with no DI" },
      { id: "d", label: "localStorage.fetch" },
    ],
    answerId: "a",
    explanation: "HttpClient is the framework HTTP API.",
  },
  {
    id: "ng-simple-ngoninit",
    prompt: "Best place to trigger the initial API load?",
    options: [
      { id: "a", label: "ngOnInit" },
      { id: "b", label: "ngOnDestroy" },
      { id: "c", label: "The HTML file constructor attribute" },
      { id: "d", label: "Only inside @Input setters forever" },
    ],
    answerId: "a",
    explanation: "ngOnInit is the usual hook for initial data loading.",
  },
  {
    id: "ng-simple-twoway",
    prompt: "Two-way binding syntax?",
    options: [
      { id: "a", label: '[(ngModel)]="email"' },
      { id: "b", label: '[()]ngModel="email"' },
      { id: "c", label: '{{ngModel}}="email"' },
      { id: "d", label: '(ngModel])="email"' },
    ],
    answerId: "a",
    explanation: "Banana-in-a-box [(ngModel)] is two-way binding.",
  },
  {
    id: "ng-simple-component-decorator",
    prompt: "What does `@Component({ selector: 'app-matches' })` define?",
    options: [
      { id: "a", label: "The custom HTML tag used to render the component" },
      { id: "b", label: "The HTTP base URL for the component" },
      { id: "c", label: "A CSS class applied globally" },
      { id: "d", label: "The database table name" },
    ],
    answerId: "a",
    explanation: "selector is the element tag (e.g. <app-matches>).",
  },
  {
    id: "ng-simple-async-pipe",
    prompt: "In a template, `| async` on an Observable:",
    options: [
      { id: "a", label: "Subscribes and unwraps the latest value (and cleans up)" },
      { id: "b", label: "Converts JSON to TypeScript types at compile time" },
      { id: "c", label: "Forces change detection Off" },
      { id: "d", label: "Only works with strings" },
    ],
    answerId: "a",
    explanation: "The async pipe manages the subscription for you.",
  },
];
