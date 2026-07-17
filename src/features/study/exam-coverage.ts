export type ExamCoverageKind = "mcq" | "practical" | "both" | "meta";

export type ExamCoverage = {
  kind: ExamCoverageKind;
  primaryId: string;
  session: "s1-angular" | "s2-aws" | "s3-html-css" | "s4-typescript" | "s5-angular-mcq" | "meta";
  label: string;
};

export const TOPIC_EXAM_COVERAGE: Record<string, ExamCoverage> = {
  "js-types-equality": { kind: "meta", primaryId: "ts-curry", session: "meta", label: "Estudio · apoyo JS" },
  "js-const-immutability": { kind: "meta", primaryId: "ts-groupby", session: "meta", label: "Estudio · apoyo JS" },
  "js-map-filter-reduce": { kind: "practical", primaryId: "ts-groupby", session: "s4-typescript", label: "Práctica TS · HOF" },
  "js-find-some-every": { kind: "meta", primaryId: "ts-groupby", session: "meta", label: "Estudio · apoyo JS" },
  "js-sort-slice-spread": { kind: "meta", primaryId: "ts-flatten", session: "meta", label: "Estudio · apoyo JS" },
  "js-flatmap-chaining": { kind: "practical", primaryId: "ts-flatten", session: "s4-typescript", label: "Práctica · flatten" },
  "js-closures-scope": { kind: "practical", primaryId: "ts-curry", session: "s4-typescript", label: "Práctica · curry" },
  "js-event-loop": { kind: "practical", primaryId: "ts-debounce", session: "s4-typescript", label: "Práctica · debounce" },
  "js-async-await": { kind: "practical", primaryId: "ng-sports-results", session: "s1-angular", label: "Angular API · async" },
  "js-collections-pure": { kind: "practical", primaryId: "ts-groupby", session: "s4-typescript", label: "Práctica · groupBy" },
  "js-objects-destructuring": { kind: "meta", primaryId: "ts-partial", session: "meta", label: "Estudio · apoyo JS" },
  "js-security-http": { kind: "meta", primaryId: "aws-waf-edge", session: "meta", label: "Estudio · apoyo" },
  "ts-generics-utilities": { kind: "practical", primaryId: "ts-curry", session: "s4-typescript", label: "Práctica · TypeScript" },
  "ts-hof-curry-closures": { kind: "practical", primaryId: "ts-curry", session: "s4-typescript", label: "Práctica · curry / HOF" },
  "css-box-model": { kind: "mcq", primaryId: "css-box-border-box", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "css-display-flow": { kind: "mcq", primaryId: "css-flex-justify-center", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "css-flexbox": { kind: "mcq", primaryId: "css-flex-justify-center", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "css-grid": { kind: "mcq", primaryId: "css-grid-autofit-minmax", session: "s3-html-css", label: "MCQ · Grid" },
  "css-position-z": { kind: "mcq", primaryId: "css-position-absolute", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "css-units-typography": { kind: "mcq", primaryId: "css-em-vs-rem", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "css-specificity-cascade": { kind: "mcq", primaryId: "css-specificity-rank", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "css-pseudo-media": { kind: "mcq", primaryId: "css-media-mobile-first", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "css-overflow-scroll": { kind: "mcq", primaryId: "css-grid-vs-flex", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "a11y-html": { kind: "mcq", primaryId: "html-a11y-button", session: "s3-html-css", label: "MCQ · HTML/CSS" },
  "css-exam-rules": { kind: "meta", primaryId: "css-grid-vs-flex", session: "meta", label: "Meta · panel" },
  "ng-lifecycle-hooks": { kind: "both", primaryId: "ng-sports-results", session: "s1-angular", label: "Práctica + MCQ Angular" },
  "ng-onchanges-afterview": { kind: "practical", primaryId: "ng-movies-catalog", session: "s1-angular", label: "Práctica Angular" },
  "ng-signals": { kind: "meta", primaryId: "ng-interp", session: "meta", label: "Estudio Angular" },
  "ng-change-detection": { kind: "mcq", primaryId: "ng-trackby-why", session: "s5-angular-mcq", label: "MCQ · Angular" },
  "ng-inputs-outputs": { kind: "mcq", primaryId: "ng-input", session: "s5-angular-mcq", label: "MCQ · Angular" },
  "ng-templates-events": { kind: "mcq", primaryId: "ng-click", session: "s5-angular-mcq", label: "MCQ · Angular" },
  "ng-rxjs-subjects": { kind: "practical", primaryId: "ng-sports-results", session: "s1-angular", label: "Práctica Angular · HTTP" },
  "ng-directives-pipes": { kind: "mcq", primaryId: "ng-ngfor", session: "s5-angular-mcq", label: "MCQ · Angular" },
  "ng-guards-routing": { kind: "meta", primaryId: "ng-httpclient", session: "meta", label: "Estudio · extra" },
  "ng-code-templates": { kind: "mcq", primaryId: "ng-interp", session: "s5-angular-mcq", label: "MCQ · Angular" },
  "sql-select-where": { kind: "meta", primaryId: "sql-account-movements", session: "meta", label: "Estudio SQL · fuera del panel" },
  "sql-joins": { kind: "meta", primaryId: "sql-customers-with-balance", session: "meta", label: "Estudio SQL · fuera del panel" },
  "sql-null-coalesce": { kind: "meta", primaryId: "sql-account-movements", session: "meta", label: "Estudio SQL · fuera del panel" },
  "sql-group-agg": { kind: "meta", primaryId: "sql-spend-by-category", session: "meta", label: "Estudio SQL · fuera del panel" },
  "sql-case-subquery": { kind: "meta", primaryId: "sql-customers-with-balance", session: "meta", label: "Estudio SQL · fuera del panel" },
  "sql-window-functions": { kind: "meta", primaryId: "sql-running-balance", session: "meta", label: "Estudio SQL · fuera del panel" },
  "sql-set-ops-views": { kind: "meta", primaryId: "sql-duplicate-transfers", session: "meta", label: "Estudio SQL · fuera del panel" },
  "sql-integrity-safety": { kind: "meta", primaryId: "sql-account-movements", session: "meta", label: "Estudio SQL · fuera del panel" },
  "prac-js-patterns": { kind: "practical", primaryId: "ts-curry", session: "s4-typescript", label: "Práctica · curry / HOF" },
  "prac-sql-queries": { kind: "meta", primaryId: "sql-account-movements", session: "meta", label: "Estudio SQL · fuera del panel" },
  "aws-compute-apis": { kind: "mcq", primaryId: "aws-lambda-apigw", session: "s2-aws", label: "MCQ · AWS" },
  "aws-data-storage": { kind: "mcq", primaryId: "aws-rds-managed-db", session: "s2-aws", label: "MCQ · AWS" },
  "aws-network-ops": { kind: "mcq", primaryId: "aws-elb-asg", session: "s2-aws", label: "MCQ · AWS" },
  "eng-clean-code": { kind: "meta", primaryId: "ts-compose", session: "meta", label: "Estudio · fuera del panel" },
  "eng-solid": { kind: "meta", primaryId: "ts-compose", session: "meta", label: "Estudio · fuera del panel" },
  "eng-patterns-gof": { kind: "meta", primaryId: "ts-compose", session: "meta", label: "Estudio · fuera del panel" },
  "eng-clean-arch": { kind: "meta", primaryId: "ts-compose", session: "meta", label: "Estudio · fuera del panel" },
  "eng-unit-tests": { kind: "meta", primaryId: "ts-compose", session: "meta", label: "Estudio · fuera del panel" },
  "eng-sonarqube": { kind: "meta", primaryId: "ts-compose", session: "meta", label: "Estudio · fuera del panel" },
  "eng-fluid-attacks": { kind: "meta", primaryId: "aws-waf-edge", session: "meta", label: "Estudio · fuera del panel" },
  "exam-structure": { kind: "meta", primaryId: "ts-curry", session: "meta", label: "Meta · estructura del panel" },
};

export const COVERAGE_KIND_LABEL: Record<ExamCoverageKind, string> = {
  mcq: "Evaluado en MCQ",
  practical: "Evaluado en práctica",
  both: "MCQ + práctica",
  meta: "Fuera del panel / estudio",
};
