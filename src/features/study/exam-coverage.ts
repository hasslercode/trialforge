export type ExamCoverageKind = "mcq" | "practical" | "both" | "meta";

export type ExamCoverage = {
  kind: ExamCoverageKind;
  /** ID del banco que evalúa 1:1 este tema (MCQ o variantId). */
  primaryId: string;
  /** Dónde sale en el simulacro Bancolombia. */
  session: "s1-angular" | "s2-aws" | "s3-html-css" | "s4-typescript" | "s5-angular-mcq" | "meta";
  label: string;
};

export const TOPIC_EXAM_COVERAGE: Record<string, ExamCoverage> = {
  "js-types-equality": {
    kind: "meta",
    primaryId: "f-strict-equality",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-const-immutability": {
    kind: "meta",
    primaryId: "f-immutability",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-map-filter-reduce": {
    kind: "meta",
    primaryId: "f-map-filter-diff",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-find-some-every": {
    kind: "meta",
    primaryId: "f-find-some-every",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-sort-slice-spread": {
    kind: "meta",
    primaryId: "f-sort-slice-copy",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-flatmap-chaining": {
    kind: "meta",
    primaryId: "f-array-flatmap",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-closures-scope": {
    kind: "both",
    primaryId: "js-curry",
    session: "s4-typescript",
    label: "Práctica curry · closures",
  },
  "js-event-loop": {
    kind: "meta",
    primaryId: "f-event-loop",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-async-await": {
    kind: "practical",
    primaryId: "ng-sports-results",
    session: "s1-angular",
    label: "Angular API · async",
  },
  "js-collections-pure": {
    kind: "meta",
    primaryId: "f-set-unique",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-objects-destructuring": {
    kind: "meta",
    primaryId: "f-destructuring",
    session: "meta",
    label: "Estudio · apoyo JS",
  },
  "js-security-http": {
    kind: "meta",
    primaryId: "f-pure-function",
    session: "meta",
    label: "Estudio · apoyo",
  },
  "ts-generics-utilities": {
    kind: "practical",
    primaryId: "js-curry",
    session: "s4-typescript",
    label: "Práctica · TypeScript curry",
  },
  "ts-hof-curry-closures": {
    kind: "practical",
    primaryId: "js-curry",
    session: "s4-typescript",
    label: "Práctica · TypeScript curry",
  },
  "css-box-model": {
    kind: "mcq",
    primaryId: "css-box-border-box",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "css-display-flow": {
    kind: "mcq",
    primaryId: "css-display-inline-block",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "css-flexbox": {
    kind: "mcq",
    primaryId: "css-flex-justify-center",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "css-grid": {
    kind: "mcq",
    primaryId: "css-grid-autofit-minmax",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS (Grid)",
  },
  "css-position-z": {
    kind: "mcq",
    primaryId: "css-position-sticky-req",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "css-units-typography": {
    kind: "mcq",
    primaryId: "css-em-vs-rem",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "css-specificity-cascade": {
    kind: "mcq",
    primaryId: "css-specificity-rank",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "css-pseudo-media": {
    kind: "mcq",
    primaryId: "css-media-mobile-first",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "css-overflow-scroll": {
    kind: "mcq",
    primaryId: "css-overflow-list",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "a11y-html": {
    kind: "mcq",
    primaryId: "html-a11y-label",
    session: "s3-html-css",
    label: "MCQ · HTML/CSS",
  },
  "css-exam-rules": {
    kind: "meta",
    primaryId: "css-flex-vs-grid-choice",
    session: "meta",
    label: "Meta · reglas del simulacro",
  },
  "ng-lifecycle-hooks": {
    kind: "both",
    primaryId: "ng-sports-results",
    session: "s1-angular",
    label: "Práctica Angular + MCQ",
  },
  "ng-onchanges-afterview": {
    kind: "practical",
    primaryId: "ng-sports-results",
    session: "s1-angular",
    label: "Práctica Angular",
  },
  "ng-signals": {
    kind: "meta",
    primaryId: "ng-todo-tabs",
    session: "meta",
    label: "Estudio Angular",
  },
  "ng-change-detection": {
    kind: "mcq",
    primaryId: "ng-simple-ngoninit",
    session: "s5-angular-mcq",
    label: "MCQ · Angular",
  },
  "ng-inputs-outputs": {
    kind: "mcq",
    primaryId: "ng-simple-input",
    session: "s5-angular-mcq",
    label: "MCQ · Angular",
  },
  "ng-templates-events": {
    kind: "mcq",
    primaryId: "ng-simple-event-binding",
    session: "s5-angular-mcq",
    label: "MCQ · Angular",
  },
  "ng-rxjs-subjects": {
    kind: "practical",
    primaryId: "ng-sports-results",
    session: "s1-angular",
    label: "Práctica Angular · HTTP",
  },
  "ng-directives-pipes": {
    kind: "mcq",
    primaryId: "ng-simple-ngfor",
    session: "s5-angular-mcq",
    label: "MCQ · Angular",
  },
  "ng-guards-routing": {
    kind: "meta",
    primaryId: "ng-guard-canactivate-scenario",
    session: "meta",
    label: "Estudio · guards (extra)",
  },
  "ng-code-templates": {
    kind: "mcq",
    primaryId: "ng-simple-interpolation",
    session: "s5-angular-mcq",
    label: "MCQ · Angular",
  },
  "sql-select-where": {
    kind: "meta",
    primaryId: "sql-account-movements",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "sql-joins": {
    kind: "meta",
    primaryId: "sql-customers-with-balance",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "sql-null-coalesce": {
    kind: "meta",
    primaryId: "sql-account-movements",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "sql-group-agg": {
    kind: "meta",
    primaryId: "sql-spend-by-category",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "sql-case-subquery": {
    kind: "meta",
    primaryId: "sql-customers-with-balance",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "sql-window-functions": {
    kind: "meta",
    primaryId: "sql-running-balance",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "sql-set-ops-views": {
    kind: "meta",
    primaryId: "sql-duplicate-transfers",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "sql-integrity-safety": {
    kind: "meta",
    primaryId: "sql-account-movements",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "prac-js-patterns": {
    kind: "practical",
    primaryId: "js-curry",
    session: "s4-typescript",
    label: "Práctica · curry",
  },
  "prac-sql-queries": {
    kind: "meta",
    primaryId: "sql-account-movements",
    session: "meta",
    label: "Estudio SQL · fuera del panel",
  },
  "aws-compute-apis": {
    kind: "mcq",
    primaryId: "aws-lambda-apigw",
    session: "s2-aws",
    label: "MCQ · AWS",
  },
  "aws-data-storage": {
    kind: "mcq",
    primaryId: "aws-rds-managed-db",
    session: "s2-aws",
    label: "MCQ · AWS",
  },
  "aws-network-ops": {
    kind: "mcq",
    primaryId: "aws-elb-autoscaling",
    session: "s2-aws",
    label: "MCQ · AWS",
  },
  "eng-clean-code": {
    kind: "meta",
    primaryId: "js-curry",
    session: "meta",
    label: "Estudio · fuera del panel",
  },
  "eng-solid": {
    kind: "meta",
    primaryId: "js-curry",
    session: "meta",
    label: "Estudio · fuera del panel",
  },
  "eng-patterns-gof": {
    kind: "meta",
    primaryId: "js-curry",
    session: "meta",
    label: "Estudio · fuera del panel",
  },
  "eng-clean-arch": {
    kind: "meta",
    primaryId: "js-curry",
    session: "meta",
    label: "Estudio · fuera del panel",
  },
  "eng-unit-tests": {
    kind: "meta",
    primaryId: "js-curry",
    session: "meta",
    label: "Estudio · fuera del panel",
  },
  "eng-sonarqube": {
    kind: "meta",
    primaryId: "js-curry",
    session: "meta",
    label: "Estudio · fuera del panel",
  },
  "eng-fluid-attacks": {
    kind: "meta",
    primaryId: "js-curry",
    session: "meta",
    label: "Estudio · fuera del panel",
  },
  "exam-structure": {
    kind: "meta",
    primaryId: "js-curry",
    session: "meta",
    label: "Meta · estructura del panel",
  },
};

export const COVERAGE_KIND_LABEL: Record<ExamCoverageKind, string> = {
  mcq: "Evaluado en MCQ",
  practical: "Evaluado en práctica",
  both: "MCQ + práctica",
  meta: "Fuera del panel / estudio",
};
