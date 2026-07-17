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
    kind: "mcq",
    primaryId: "f-xss-textcontent",
    session: "s1-mcq",
    label: "MCQ · Sesión 1",
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
    primaryId: "w-box-sizing",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-display-flow": {
    kind: "mcq",
    primaryId: "w-display-flow",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-flexbox": {
    kind: "both",
    primaryId: "w-flex-gap",
    session: "s2-mcq",
    label: "MCQ + Práctica CSS",
  },
  "css-grid": {
    kind: "both",
    primaryId: "w-grid-autofit",
    session: "s2-mcq",
    label: "MCQ + Práctica CSS",
  },
  "css-position-z": {
    kind: "mcq",
    primaryId: "w-position-sticky",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-units-typography": {
    kind: "mcq",
    primaryId: "w-em-vs-rem",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-specificity-cascade": {
    kind: "mcq",
    primaryId: "w-css-specificity",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-pseudo-media": {
    kind: "mcq",
    primaryId: "w-pseudo-media",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-overflow-scroll": {
    kind: "both",
    primaryId: "w-overflow-scroll",
    session: "s2-mcq",
    label: "MCQ + Práctica CSS",
  },
  "a11y-html": {
    kind: "mcq",
    primaryId: "w-a11y-button",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "css-exam-rules": {
    kind: "mcq",
    primaryId: "w-pure-css-no-tailwind",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "ng-lifecycle-hooks": {
    kind: "both",
    primaryId: "w-ngoninit",
    session: "s2-mcq",
    label: "MCQ + Práctica Angular",
  },
  "ng-onchanges-afterview": {
    kind: "both",
    primaryId: "w-afterviewinit",
    session: "s2-mcq",
    label: "MCQ + Práctica Angular",
  },
  "ng-signals": {
    kind: "mcq",
    primaryId: "w-signals",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "ng-change-detection": {
    kind: "mcq",
    primaryId: "w-onpush",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "ng-inputs-outputs": {
    kind: "both",
    primaryId: "w-input-output",
    session: "s2-mcq",
    label: "MCQ + Práctica Angular",
  },
  "ng-templates-events": {
    kind: "mcq",
    primaryId: "w-template-ref",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "ng-rxjs-subjects": {
    kind: "mcq",
    primaryId: "w-subject-vs-behavior",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "ng-directives-pipes": {
    kind: "both",
    primaryId: "w-ngif-directive",
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
    kind: "mcq",
    primaryId: "sql-select-basic",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "sql-joins": {
    kind: "mcq",
    primaryId: "sql-join-inner",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "sql-null-coalesce": {
    kind: "mcq",
    primaryId: "sql-null",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "sql-group-agg": {
    kind: "mcq",
    primaryId: "sql-group-by",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "sql-case-subquery": {
    kind: "mcq",
    primaryId: "sql-case",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "sql-window-functions": {
    kind: "both",
    primaryId: "sql-window",
    session: "s2-mcq",
    label: "MCQ + Práctica SQL",
  },
  "sql-set-ops-views": {
    kind: "mcq",
    primaryId: "sql-union",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
  },
  "sql-integrity-safety": {
    kind: "mcq",
    primaryId: "sql-injection",
    session: "s2-mcq",
    label: "MCQ · Sesión 2",
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
    kind: "mcq",
    primaryId: "eng-clean-naming-intent",
    session: "s2-mcq",
    label: "MCQ · Ingeniería",
  },
  "eng-solid": {
    kind: "mcq",
    primaryId: "eng-solid-srp-component",
    session: "s2-mcq",
    label: "MCQ · Ingeniería",
  },
  "eng-patterns-gof": {
    kind: "mcq",
    primaryId: "eng-pattern-strategy-validation",
    session: "s2-mcq",
    label: "MCQ · Ingeniería",
  },
  "eng-clean-arch": {
    kind: "mcq",
    primaryId: "eng-architecture-layering",
    session: "s2-mcq",
    label: "MCQ · Ingeniería",
  },
  "eng-unit-tests": {
    kind: "mcq",
    primaryId: "eng-testing-aaa-structure",
    session: "s2-mcq",
    label: "MCQ · Ingeniería",
  },
  "eng-sonarqube": {
    kind: "mcq",
    primaryId: "eng-sonarqube-coverage-gate",
    session: "s2-mcq",
    label: "MCQ · Ingeniería",
  },
  "eng-fluid-attacks": {
    kind: "mcq",
    primaryId: "eng-appsec-fluid-attacks-sdlc",
    session: "s2-mcq",
    label: "MCQ · Ingeniería",
  },
  "exam-structure": {
    kind: "meta",
    primaryId: "w-pass-70",
    session: "meta",
    label: "Meta · Reglas del simulacro",
  },
};

export const COVERAGE_KIND_LABEL: Record<ExamCoverageKind, string> = {
  mcq: "Evaluado en MCQ",
  practical: "Evaluado en práctica",
  both: "MCQ + práctica",
  meta: "Reglas del examen",
};
