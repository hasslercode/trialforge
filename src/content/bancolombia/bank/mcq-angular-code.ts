import type { McqQuestion } from "@/domain/exam";

/**
 * Angular MCQ — code analysis, template matching, UI outcomes, and guards.
 * Prioritizes reasoning over memorization (Bancolombia-style).
 */
export const mcqAngularCodeBank: McqQuestion[] = [
  {
    id: "ng-code-output-bind",
    prompt: "What does the console print when the button is clicked?",
    codeLang: "ts",
    code: `@Component({
  selector: 'app-login',
  template: \`
    <input [(ngModel)]="email" />
    <button (click)="login()">Go</button>
  \`
})
export class LoginComponent {
  email = 'a@b.co';
  login() {
    console.log(this.email.toUpperCase());
  }
}`,
    options: [
      { id: "a", label: "`A@B.CO` (two-way binding updates `email` before click)" },
      { id: "b", label: "`undefined` because `email` is not an `@Input`" },
      { id: "c", label: "`a@b.co` — `[(ngModel)]` only reads, never writes" },
      { id: "d", label: "Throws: `ngModel` cannot bind to a string property" },
    ],
    answerId: "a",
    explanation:
      "Banana-in-a-box updates the component property. Clicking reads the current value and uppercases it.",
  },
  {
    id: "ng-html-match-login",
    prompt: "Which template correctly wires property binding, event binding, and interpolation for this component?",
    codeLang: "ts",
    code: `@Component({ selector: 'app-login', templateUrl: './login.html' })
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  login() {
    console.log(this.email, this.password);
  }
}`,
    options: [
      {
        id: "a",
        label: "Option A",
        code: `<input [value]="email" (input)="email = $event.target.value" />
<input [value]="password" (input)="password = $event.target.value" />
<button (click)="login()" [disabled]="loading">{{ loading ? '...' : 'Login' }}</button>`,
      },
      {
        id: "b",
        label: "Option B",
        code: `<input {{email}} />
<input {{password}} />
<button onclick="login()">Login</button>`,
      },
      {
        id: "c",
        label: "Option C",
        code: `<input (value)="email" [click]="login()" />
<button [loading]="loading">Login</button>`,
      },
      {
        id: "d",
        label: "Option D",
        code: `<input [(ngModel)]="email" />
<input FormControlName="password" />
<button (submit)="login()">{{loading}}</button>`,
      },
    ],
    answerId: "a",
    explanation:
      "A uses `[value]` + `(input)` (or ngModel), `(click)`, `[disabled]`, and interpolation. B uses HTML onclick; C swaps binding directions; D mixes invalid form APIs.",
  },
  {
    id: "ng-html-match-list",
    prompt: "Given this component, which HTML renders the list and emits a selection?",
    codeLang: "ts",
    code: `@Component({ selector: 'app-matches', templateUrl: './matches.html' })
export class MatchesComponent {
  @Input() matches: { id: string; home: string; away: string }[] = [];
  @Output() select = new EventEmitter<string>();

  trackById(_: number, m: { id: string }) {
    return m.id;
  }
}`,
    options: [
      {
        id: "a",
        label: "Option A",
        code: `<li *ngFor="let m of matches; trackBy: trackById"
    (click)="select.emit(m.id)">
  {{ m.home }} vs {{ m.away }}
</li>`,
      },
      {
        id: "b",
        label: "Option B",
        code: `<li *ngFor="let m of matches" [click]="select(m.id)">
  {{ m.home }} vs {{ m.away }}
</li>`,
      },
      {
        id: "c",
        label: "Option C",
        code: `<li ngFor="matches as m" (select)="m.id">
  [m.home] vs [m.away]
</li>`,
      },
      {
        id: "d",
        label: "Option D",
        code: `<li *ngIf="matches" (click)="select = m.id">
  {{ matches.home }}
</li>`,
      },
    ],
    answerId: "a",
    explanation:
      "Correct *ngFor + trackBy, interpolation, and Output via select.emit. B uses [click] (property) instead of (click); C/D are invalid Angular syntax.",
  },
  {
    id: "ng-ui-ngif-ngfor",
    prompt: "With `items = ['A','B']` and `show = false`, what is the visual outcome?",
    codeLang: "html",
    code: `<p *ngIf="show">Header</p>
<ul>
  <li *ngFor="let item of items">{{ item }}</li>
</ul>`,
    options: [
      { id: "a", label: "Only the list with A and B — Header is not in the DOM" },
      { id: "b", label: "Header + A + B" },
      { id: "c", label: "Empty screen — *ngIf hides the entire template" },
      { id: "d", label: "Header is hidden with CSS (display:none) but still mounted" },
    ],
    answerId: "a",
    explanation: "*ngIf removes the node when false; *ngFor still renders the list independently.",
  },
  {
    id: "ng-ui-disabled-bind",
    prompt: "What does the user see when `canSubmit` is false?",
    codeLang: "html",
    code: `<button [disabled]="!canSubmit">Transfer</button>
<span>{{ canSubmit ? 'Ready' : 'Blocked' }}</span>`,
    options: [
      {
        id: "a",
        label: "Disabled Transfer button and text “Blocked”",
        layout: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          items: [
            { label: "Transfer", style: { opacity: "0.45", borderStyle: "dashed" } },
            { label: "Blocked" },
          ],
        },
      },
      {
        id: "b",
        label: "Enabled Transfer button and text “Ready”",
        layout: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          items: [{ label: "Transfer" }, { label: "Ready" }],
        },
      },
      {
        id: "c",
        label: "No button — [disabled] destroys the element",
        layout: {
          display: "flex",
          items: [{ label: "(empty)" }],
        },
      },
      {
        id: "d",
        label: "Button with label “false”",
        layout: {
          display: "flex",
          items: [{ label: "false" }],
        },
      },
    ],
    answerId: "a",
    explanation: "`[disabled]=\"!canSubmit\"` disables when canSubmit is false; interpolation shows Blocked.",
  },
  {
    id: "ng-code-onchange-ref",
    prompt: "With OnPush, which parent update will refresh the child view?",
    codeLang: "ts",
    code: `@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`{{ user.name }}\`
})
export class ChildComponent {
  @Input() user!: { name: string };
}

// Parent:
this.user.name = 'Ana';           // (1)
this.user = { ...this.user, name: 'Ana' }; // (2)`,
    options: [
      { id: "a", label: "Only (2) — new object reference triggers OnPush" },
      { id: "b", label: "Only (1) — mutating fields always marks the view dirty" },
      { id: "c", label: "Both equally, because @Input always deep-compares" },
      { id: "d", label: "Neither — OnPush ignores @Input forever" },
    ],
    answerId: "a",
    explanation: "OnPush checks input identity by reference (plus events/async/marks). Mutating the same object does not notify.",
  },
  {
    id: "ng-code-async-pipe",
    prompt: "What is wrong with this subscription pattern in a long-lived component?",
    codeLang: "ts",
    code: `ngOnInit() {
  this.http.get<Match[]>('/api/matches').subscribe((data) => {
    this.matches = data;
  });
}`,
    options: [
      {
        id: "a",
        label: "No unsubscribe / async pipe — risk of leaks if the component is destroyed mid-request",
      },
      { id: "b", label: "HttpClient cannot be used inside ngOnInit" },
      { id: "c", label: "subscribe is forbidden; only promises are allowed" },
      { id: "d", label: "Nothing — Angular auto-cancels every HTTP call" },
    ],
    answerId: "a",
    explanation:
      "Prefer async pipe or takeUntilDestroyed. HttpClient completes, but the habit of unmanaged subscriptions is graded in interviews.",
  },
  {
    id: "ng-guard-canactivate-scenario",
    prompt:
      "A banking app must block `/transfer` if the session JWT is missing or expired, and redirect to `/login` while preserving the intended URL. Which guard fits best?",
    options: [
      {
        id: "a",
        label: "CanActivate — return UrlTree to /login with returnUrl query when token is invalid",
      },
      {
        id: "b",
        label: "CanDeactivate — runs before leaving a route, ideal for auth gates",
      },
      {
        id: "c",
        label: "Resolve — loads JWT from localStorage into the route snapshot",
      },
      {
        id: "d",
        label: "CanMatch — only for lazy modules; cannot redirect",
      },
    ],
    answerId: "a",
    explanation:
      "CanActivate decides if navigation proceeds and can return a UrlTree redirect. CanDeactivate is for unsaved changes; Resolve prefetches data; CanMatch can also gate lazy routes but redirect-with-returnUrl is the classic CanActivate pattern.",
  },
  {
    id: "ng-guard-candeactivate-form",
    prompt:
      "User fills a transfer form on `/transfer/new` and clicks a sidebar link. You must ask “Discard changes?” only if the form is dirty. Which approach is correct?",
    options: [
      {
        id: "a",
        label: "CanDeactivate on the component — confirm when form.dirty === true",
      },
      {
        id: "b",
        label: "CanActivate on the destination route — it runs before leaving the form",
      },
      {
        id: "c",
        label: "Resolve that returns false when dirty",
      },
      {
        id: "d",
        label: "CanMatch that compares FormControl values in the router config",
      },
    ],
    answerId: "a",
    explanation: "CanDeactivate is specifically for “may I leave this route?” checks against component state.",
  },
  {
    id: "ng-guard-canmatch-lazy",
    prompt:
      "Two lazy routes share the path `admin`, but only users with role ADMIN should load `AdminModule`; others should never download that chunk. Best guard?",
    options: [
      {
        id: "a",
        label: "CanMatch — prevents matching (and thus downloading) the lazy route for non-admins",
      },
      {
        id: "b",
        label: "CanDeactivate on AdminComponent — blocks download before navigation",
      },
      {
        id: "c",
        label: "Resolve that throws if role !== ADMIN (bundle still downloads)",
      },
      {
        id: "d",
        label: "CanActivateChild is the only guard that affects lazy loading",
      },
    ],
    answerId: "a",
    explanation:
      "CanMatch runs during route matching; a failed match skips the lazy load. CanActivate runs after the route matched (chunk may already load). Resolve loads data after activation starts.",
  },
  {
    id: "ng-guard-resolve-prefetch",
    prompt:
      "The match detail page must not flash empty state: data from `GET /matches/:id` should be ready when the component constructs. Which guard/resolver pattern?",
    options: [
      {
        id: "a",
        label: "Resolve — map route param to HTTP and expose data via ActivatedRoute",
      },
      {
        id: "b",
        label: "CanActivate that assigns to a global variable then returns true",
      },
      {
        id: "c",
        label: "CanDeactivate that prefetches the next page",
      },
      {
        id: "d",
        label: "CanMatch that returns the Match DTO instead of a boolean",
      },
    ],
    answerId: "a",
    explanation: "Resolve prefetches and attaches data to the route; the component reads route.snapshot.data.",
  },
  {
    id: "ng-guard-order-trap",
    prompt:
      "Navigation to a lazy feature: CanMatch returns true, CanActivate returns UrlTree(/login), Resolve is configured. What happens?",
    options: [
      {
        id: "a",
        label: "Redirect to /login — CanActivate blocks; Resolve does not run",
      },
      {
        id: "b",
        label: "Resolve still runs, then redirect",
      },
      {
        id: "c",
        label: "CanMatch true forces activation regardless of CanActivate",
      },
      {
        id: "d",
        label: "Angular ignores UrlTree and activates the component",
      },
    ],
    answerId: "a",
    explanation: "Failed CanActivate (false/UrlTree) cancels navigation; resolvers do not execute.",
  },
  {
    id: "ng-code-input-mutation",
    prompt: "What is the main problem in this child component?",
    codeLang: "ts",
    code: `@Component({
  selector: 'app-badge',
  template: \`<span>{{ label }}</span>\`
})
export class BadgeComponent {
  @Input() label = '';

  ngOnInit() {
    this.label = this.label.trim().toUpperCase();
  }
}`,
    options: [
      {
        id: "a",
        label: "Mutating an @Input breaks one-way data flow; parent state can desync",
      },
      { id: "b", label: "ngOnInit cannot read @Input values" },
      { id: "c", label: "toUpperCase is not allowed in Angular templates or classes" },
      { id: "d", label: "Inputs must be signals; classic @Input is deprecated and throws" },
    ],
    answerId: "a",
    explanation: "Treat inputs as read-only from the child; derive a local field or use a pipe/computed.",
  },
  {
    id: "ng-code-ngfor-trackby",
    prompt: "The list re-renders and inputs lose focus on every poll refresh. Data IDs are stable. Fix?",
    codeLang: "html",
    code: `<div *ngFor="let m of matches">
  <input [value]="m.score" />
</div>`,
    options: [
      {
        id: "a",
        label: "Add `trackBy` so Angular reuses DOM nodes with the same id",
      },
      { id: "b", label: "Replace *ngFor with *ngIf" },
      { id: "c", label: "Wrap every item in ChangeDetectionStrategy.Default" },
      { id: "d", label: "Disable Zone.js for the list" },
    ],
    answerId: "a",
    explanation: "Without trackBy, identity is by index/object reference; polling replaces arrays and recreates DOM.",
  },
  {
    id: "ng-twoway-vs-oneway",
    prompt: "Which binding is two-way?",
    options: [
      { id: "a", label: `[(ngModel)]="email"` },
      { id: "b", label: `[value]="email"` },
      { id: "c", label: `(click)="save()"` },
      { id: "d", label: `{{ email }}` },
    ],
    answerId: "a",
    explanation: "[()] combines property + event. [] is one-way in; () is events out; {{ }} is interpolation.",
  },
  {
    id: "ng-output-emit-html",
    prompt: "Parent template must handle the child's save event. Correct syntax?",
    codeLang: "ts",
    code: `// child
@Output() save = new EventEmitter<string>();`,
    options: [
      { id: "a", label: `<app-otp (save)="onSave($event)" />` },
      { id: "b", label: `<app-otp [save]="onSave($event)" />` },
      { id: "c", label: `<app-otp on-save="onSave()" />` },
      { id: "d", label: `<app-otp {{save}}="onSave" />` },
    ],
    answerId: "a",
    explanation: "Outputs bind with (event). Using [save] would try to set an input named save.",
  },
  {
    id: "ng-code-subscribe-leak-guard",
    prompt: "A CanActivate guard does this. What is the risk?",
    codeLang: "ts",
    code: `canActivate(): boolean {
  this.auth.user$.subscribe((u) => (this.ok = !!u));
  return this.ok;
}`,
    options: [
      {
        id: "a",
        label: "Returns before the async value arrives — often false even for logged-in users",
      },
      { id: "b", label: "Guards cannot inject services" },
      { id: "c", label: "user$ is not allowed inside guards" },
      { id: "d", label: "Returning boolean is illegal; must return Promise only" },
    ],
    answerId: "a",
    explanation: "Guards should return Observable/Promise of boolean|UrlTree, or use firstValueFrom — not fire-and-forget subscribe.",
  },
  {
    id: "ng-ui-interpolation-vs-bind",
    prompt: "For setting an image URL from `avatarUrl`, which is preferred and why?",
    options: [
      {
        id: "a",
        label: '<img [src]="avatarUrl" /> — property binding avoids string parsing quirks',
      },
      {
        id: "b",
        label: '<img src="{{avatarUrl}}" /> — required for all dynamic URLs',
      },
      {
        id: "c",
        label: '<img (src)="avatarUrl" /> — event binding loads assets',
      },
      {
        id: "d",
        label: "<img src={avatarUrl} /> — JSX style is valid in Angular templates",
      },
    ],
    answerId: "a",
    explanation: "Property binding is the idiomatic choice for element properties; interpolation in attributes works but is less precise.",
  },
];
