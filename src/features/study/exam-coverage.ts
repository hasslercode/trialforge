export type ExamCoverageKind = "mcq" | "practical" | "both" | "meta";

export type ExamCoverage = {
  kind: ExamCoverageKind;
  /** ID del banco que evalúa 1:1 este tema (MCQ o variantId). */
  primaryId: string;
  /** Dónde sale en el simulacro. */
  session: "s1-mcq" | "s2-mcq" | "s3-logic" | "s4-css" | "s5-angular" | "meta";
  label: string;
};

export const TOPIC_EXAM_COVERAGE: Record<string, ExamCoverage> = {
  "js-types-equality": {
    kind: "mcq",
    primaryId: "f-strict-equality",
    session: "s1-mcq",
    label: "MCQ · Sesión 1",
  },
  "js-const-immutability": {
    kind: "mcq",
    primaryId: "f-immutability",
    session: "s1-mcq",
    label: "MCQ · Sesión 1",
  },
  "js-map-filter-reduce": {
    kind: "both",
    primaryId: "f-map-filter-diff",
    session: "s1-mcq",
    label: "MCQ + Práctica JS",
  },
  "js-find-some-every": {
    kind: "both",
    primaryId: "f-find-some-every",
    session: "s1-mcq",
    label: "MCQ + Práctica JS",
  },
  "js-sort-slice-spread": {
    kind: "both",
    primaryId: "f-sort-slice-copy",
    session: "s1-mcq",
    label: "MCQ + Práctica JS",
  },
  "js-flatmap-chaining": {
    kind: "mcq",
    primaryId: "f-array-flatmap",
    session: "s1-mcq",
    label: "MCQ · Sesión 1",
  },
  "js-closures-scope": {
    kind: "mcq",
    primaryId: "f-closure",
    session: "s1-mcq",
    label: "MCQ · Sesión 1",
  },
  "js-event-loop": {
    kind: "mcq",
    primaryId: "f-event-loop",
    session: "s1-mcq",
    label: "MCQ · Sesión 1",
  },
  "js-async-await": {
    kind: "both",
    primaryId: "f-async-await",
    session: "s1-mcq",
    label: "MCQ + Práctica JS",
  },
  "js-collections-pure": {
    kind: "mcq",
    primaryId: "f-set-unique",
    session: "s1-mcq",
    label: "MCQ · Sesión 1",
  },
  "js-objects-destructuring": {
    kind: "mcq",
    primaryId: "f-destructuring",
    session: "s1-mcq",
    label: "MCQ · Sesión 1",
  },
  "js-security-http": {
    kind: "meta",
    primaryId: "f-pure-function",
    session: "meta",
    label: "Estudio · fuera del MCQ Bancolombia",
  },
  "ts-generics-utilities": {
    kind: "mcq",
    primaryId: "ts-partial-pick",
    session: "s1-mcq",
    label: "MCQ · TypeScript",
  },
  "ts-hof-curry-closures": {
    kind: "mcq",
    primaryId: "ts-curry-complete",
    session: "s1-mcq",
    label: "MCQ · TypeScript",
  },
  "css-box-model": {
    kind: "mcq",
    primaryId: "css-box-border-box",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-display-flow": {
    kind: "mcq",
    primaryId: "css-display-inline-block",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-flexbox": {
    kind: "both",
    primaryId: "css-flex-justify-center",
    session: "s2-mcq",
    label: "MCQ + Práctica CSS",
  },
  "css-grid": {
    kind: "both",
    primaryId: "css-grid-autofit-minmax",
    session: "s2-mcq",
    label: "MCQ + Práctica CSS",
  },
  "css-position-z": {
    kind: "mcq",
    primaryId: "css-position-sticky-req",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-units-typography": {
    kind: "mcq",
    primaryId: "css-em-vs-rem",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-specificity-cascade": {
    kind: "mcq",
    primaryId: "css-specificity-rank",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-pseudo-media": {
    kind: "mcq",
    primaryId: "css-media-mobile-first",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-overflow-scroll": {
    kind: "both",
    primaryId: "css-overflow-list",
    session: "s2-mcq",
    label: "MCQ + Práctica CSS",
  },
  "a11y-html": {
    kind: "mcq",
    primaryId: "html-a11y-label",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-exam-rules": {
    kind: "meta",
    primaryId: "css-flex-vs-grid-choice",
    session: "meta",
    label: "Meta · reglas del simulacro",
  },
  "ng-lifecycle-hooks": {
    kind: "both",
    primaryId: "ng-code-async-pipe",
    session: "s2-mcq",
    label: "MCQ + Práctica Angular",
  },
  "ng-onchanges-afterview": {
    kind: "both",
    primaryId: "ng-code-onchange-ref",
    session: "s2-mcq",
    label: "MCQ + Práctica Angular",
  },
  "ng-signals": {
    kind: "practical",
    primaryId: "ng-todo-tabs",
    session: "s5-angular",
    label: "Práctica Angular · estudio",
  },
  "ng-change-detection": {
    kind: "mcq",
    primaryId: "ng-code-onchange-ref",
    session: "s2-mcq",
    label: "MCQ · Angular",
  },
  "ng-inputs-outputs": {
    kind: "both",
    primaryId: "ng-output-emit-html",
    session: "s2-mcq",
    label: "MCQ + Práctica Angular",
  },
  "ng-templates-events": {
    kind: "mcq",
    primaryId: "ng-html-match-login",
    session: "s2-mcq",
    label: "MCQ · Angular",
  },
  "ng-rxjs-subjects": {
    kind: "mcq",
    primaryId: "ng-code-async-pipe",
    session: "s2-mcq",
    label: "MCQ · Angular",
  },
  "ng-directives-pipes": {
    kind: "both",
    primaryId: "ng-ui-ngif-ngfor",
    session: "s2-mcq",
    label: "MCQ + Práctica Angular",
  },
  "ng-guards-routing": {
    kind: "mcq",
    primaryId: "ng-guard-canactivate-scenario",
    session: "s2-mcq",
    label: "MCQ · Angular Guards",
  },
  "ng-code-templates": {
    kind: "mcq",
    primaryId: "ng-html-match-login",
    session: "s2-mcq",
    label: "MCQ · Angular código/UI",
  },
  "sql-select-where": {
    kind: "practical",
    primaryId: "sql-account-movements",
    session: "s3-logic",
    label: "Práctica SQL · (MCQ SQL eliminado)",
  },
  "sql-joins": {
    kind: "practical",
    primaryId: "sql-customers-with-balance",
    session: "s3-logic",
    label: "Práctica SQL · (MCQ SQL eliminado)",
  },
  "sql-null-coalesce": {
    kind: "practical",
    primaryId: "sql-account-movements",
    session: "s3-logic",
    label: "Práctica SQL · (MCQ SQL eliminado)",
  },
  "sql-group-agg": {
    kind: "practical",
    primaryId: "sql-spend-by-category",
    session: "s3-logic",
    label: "Práctica SQL · (MCQ SQL eliminado)",
  },
  "sql-case-subquery": {
    kind: "practical",
    primaryId: "sql-customers-with-balance",
    session: "s3-logic",
    label: "Práctica SQL · (MCQ SQL eliminado)",
  },
  "sql-window-functions": {
    kind: "practical",
    primaryId: "sql-running-balance",
    session: "s3-logic",
    label: "Práctica SQL",
  },
  "sql-set-ops-views": {
    kind: "practical",
    primaryId: "sql-duplicate-transfers",
    session: "s3-logic",
    label: "Práctica SQL · (MCQ SQL eliminado)",
  },
  "sql-integrity-safety": {
    kind: "practical",
    primaryId: "sql-account-movements",
    session: "s3-logic",
    label: "Práctica SQL · (MCQ SQL eliminado)",
  },
  "prac-js-patterns": {
    kind: "practical",
    primaryId: "js-normalize-movements",
    session: "s3-logic",
    label: "Práctica · Sesión 3",
  },
  "prac-sql-queries": {
    kind: "practical",
    primaryId: "sql-account-movements",
    session: "s3-logic",
    label: "Práctica · Sesión 3",
  },
  "aws-compute-apis": {
    kind: "mcq",
    primaryId: "aws-lambda-apigw",
    session: "s2-mcq",
    label: "MCQ · AWS",
  },
  "aws-data-storage": {
    kind: "mcq",
    primaryId: "aws-rds-managed-db",
    session: "s2-mcq",
    label: "MCQ · AWS",
  },
  "aws-network-ops": {
    kind: "mcq",
    primaryId: "aws-elb-autoscaling",
    session: "s2-mcq",
    label: "MCQ · AWS",
  },
  "eng-clean-code": {
    kind: "meta",
    primaryId: "js-normalize-movements",
    session: "meta",
    label: "Estudio · fuera del MCQ Bancolombia",
  },
  "eng-solid": {
    kind: "meta",
    primaryId: "js-normalize-movements",
    session: "meta",
    label: "Estudio · fuera del MCQ Bancolombia",
  },
  "eng-patterns-gof": {
    kind: "meta",
    primaryId: "js-normalize-movements",
    session: "meta",
    label: "Estudio · fuera del MCQ Bancolombia",
  },
  "eng-clean-arch": {
    kind: "meta",
    primaryId: "js-normalize-movements",
    session: "meta",
    label: "Estudio · fuera del MCQ Bancolombia",
  },
  "eng-unit-tests": {
    kind: "meta",
    primaryId: "js-normalize-movements",
    session: "meta",
    label: "Estudio · fuera del MCQ Bancolombia",
  },
  "eng-sonarqube": {
    kind: "meta",
    primaryId: "js-normalize-movements",
    session: "meta",
    label: "Estudio · fuera del MCQ Bancolombia",
  },
  "eng-fluid-attacks": {
    kind: "meta",
    primaryId: "js-normalize-movements",
    session: "meta",
    label: "Estudio · fuera del MCQ Bancolombia",
  },
  "exam-structure": {
    kind: "meta",
    primaryId: "ts-curry-complete",
    session: "meta",
    label: "Meta · estructura del simulacro",
  },
};

export const COVERAGE_KIND_LABEL: Record<ExamCoverageKind, string> = {
  mcq: "Evaluado en MCQ",
  practical: "Evaluado en práctica",
  both: "MCQ + práctica",
  meta: "Fuera del MCQ / meta",
};
