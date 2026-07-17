import type { McqQuestion } from "@/domain/exam";

/**
 * HTML + CSS MCQ bank — Grid-heavy (per interview feedback), plus Flex and core theory.
 */
export const mcqHtmlCssBank: McqQuestion[] = [
  // —— Grid (priority) ——
  {
    id: "css-grid-three-cols",
    prompt: "Which creates three equal columns?",
    options: [
      {
        id: "a",
        label: "grid-template-columns: 1fr 1fr 1fr",
        layout: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "6px",
          items: [{ label: "1" }, { label: "2" }, { label: "3" }],
        },
      },
      {
        id: "b",
        label: "grid-template-columns: 100px",
        layout: {
          display: "grid",
          gridTemplateColumns: "100px",
          gap: "6px",
          items: [{ label: "1" }, { label: "2" }, { label: "3" }],
        },
      },
      {
        id: "c",
        label: "grid-template-rows: repeat(3, 1fr)",
        layout: {
          display: "grid",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: "6px",
          items: [{ label: "1" }, { label: "2" }, { label: "3" }],
        },
      },
      { id: "d", label: "columns: 3 (CSS multi-column, not Grid)" },
    ],
    answerId: "a",
    explanation: "Three 1fr column tracks share width equally.",
  },
  {
    id: "css-grid-autofit-minmax",
    prompt: "`grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))` mainly:",
    options: [
      {
        id: "a",
        label: "Creates as many fluid columns ≥180px as fit, stretching to fill the row",
      },
      { id: "b", label: "Always fixes exactly two 180px columns" },
      { id: "c", label: "Is invalid unless used with Flexbox" },
      { id: "d", label: "Disables gap forever" },
    ],
    answerId: "a",
    explanation: "auto-fit + minmax is the classic responsive card grid.",
  },
  {
    id: "css-grid-autofill-vs-fit",
    prompt: "Key difference between auto-fill and auto-fit with empty tracks?",
    options: [
      {
        id: "a",
        label: "auto-fit collapses empty tracks so items can grow; auto-fill keeps empty columns",
      },
      { id: "b", label: "They are identical in all cases" },
      { id: "c", label: "auto-fill only works with %; auto-fit only with px" },
      { id: "d", label: "auto-fit disables media queries" },
    ],
    answerId: "a",
    explanation: "Classic Grid interview trap on empty tracks.",
  },
  {
    id: "css-grid-span-two",
    prompt: "Make a hero span two columns on a 3-column grid:",
    options: [
      {
        id: "a",
        label: "grid-column: span 2",
        layout: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "6px",
          items: [
            { label: "Hero", style: { gridColumn: "span 2" } },
            { label: "Side" },
            { label: "A" },
            { label: "B" },
            { label: "C" },
          ],
        },
      },
      { id: "b", label: "flex-grow: 2" },
      { id: "c", label: "width: 66% always spans tracks" },
      { id: "d", label: "grid-row: 2 / 2" },
    ],
    answerId: "a",
    explanation: "grid-column: span 2 (or 1 / 3) spans tracks.",
  },
  {
    id: "css-grid-areas",
    prompt: "Named areas for header / nav+main / footer?",
    options: [
      {
        id: "a",
        label: "grid-template-areas + matching grid-area on children",
        code: `.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
}
.header { grid-area: header; }`,
      },
      { id: "b", label: "Only float + clear" },
      { id: "c", label: "justify-items: area-name" },
      { id: "d", label: "grid-area on the container alone" },
    ],
    answerId: "a",
    explanation: "Template strings define areas; children opt in with grid-area.",
  },
  {
    id: "css-grid-gap",
    prompt: "`gap: 16px 8px` on a grid means:",
    options: [
      { id: "a", label: "row-gap 16px, column-gap 8px" },
      { id: "b", label: "column-gap 16px, row-gap 8px" },
      { id: "c", label: "margin 16px and padding 8px" },
      { id: "d", label: "Invalid — gap takes one value only" },
    ],
    answerId: "a",
    explanation: "Two-value gap is row then column.",
  },
  {
    id: "css-grid-row-lines",
    prompt: "Place an item from row line 1 to 3 (span two rows):",
    options: [
      { id: "a", label: "grid-row: 1 / 3" },
      { id: "b", label: "grid-row: 1 / 2" },
      { id: "c", label: "align-self: 1 / 3" },
      { id: "d", label: "flex-row: span 2" },
    ],
    answerId: "a",
    explanation: "Lines are start / end: 1 / 3 spans two rows.",
  },
  {
    id: "css-grid-vs-flex",
    prompt: "Page shell: full-width header/footer + sidebar + main with named regions. Prefer?",
    options: [
      { id: "a", label: "CSS Grid with template areas" },
      { id: "b", label: "Only float left on every section" },
      { id: "c", label: "position: absolute for all regions" },
      { id: "d", label: "table-cell layout" },
    ],
    answerId: "a",
    explanation: "2D page shells are Grid’s strength; Flex is great for 1D rows.",
  },
  {
    id: "css-grid-fr-minmax",
    prompt: "`minmax(200px, 1fr)` as a track size means:",
    options: [
      {
        id: "a",
        label: "At least 200px, can grow to take a fraction of free space",
      },
      { id: "b", label: "Exactly 200px always" },
      { id: "c", label: "At most 200px, never larger" },
      { id: "d", label: "Only valid inside Flexbox" },
    ],
    answerId: "a",
    explanation: "minmax sets a floor and lets fr grow.",
  },
  {
    id: "css-grid-implicit-rows",
    prompt: "Extra items beyond explicit rows — which property sizes new rows?",
    options: [
      { id: "a", label: "grid-auto-rows" },
      { id: "b", label: "grid-template-areas only" },
      { id: "c", label: "align-content: rows" },
      { id: "d", label: "flex-auto-rows" },
    ],
    answerId: "a",
    explanation: "Implicit rows use grid-auto-rows (and auto-flow).",
  },

  // —— Flex ——
  {
    id: "css-flex-justify-center",
    prompt: "Which `justify-content` centers items on the main axis (row)?",
    options: [
      {
        id: "a",
        label: "center",
        layout: {
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          items: [{ label: "A" }, { label: "B" }, { label: "C" }],
        },
      },
      {
        id: "b",
        label: "flex-start",
        layout: {
          display: "flex",
          justifyContent: "flex-start",
          gap: "8px",
          items: [{ label: "A" }, { label: "B" }, { label: "C" }],
        },
      },
      {
        id: "c",
        label: "space-between",
        layout: {
          display: "flex",
          justifyContent: "space-between",
          items: [{ label: "A" }, { label: "B" }, { label: "C" }],
        },
      },
      {
        id: "d",
        label: "flex-end",
        layout: {
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          items: [{ label: "A" }, { label: "B" }, { label: "C" }],
        },
      },
    ],
    answerId: "a",
    explanation: "justify-content: center on a row flex container.",
  },
  {
    id: "css-flex-align-items",
    prompt: "Center items on the cross axis in a row flex container?",
    options: [
      { id: "a", label: "align-items: center" },
      { id: "b", label: "justify-content: center (always vertical)" },
      { id: "c", label: "align-content: baseline only" },
      { id: "d", label: "place-self on the container" },
    ],
    answerId: "a",
    explanation: "Cross-axis alignment is align-items.",
  },
  {
    id: "css-flex-grow",
    prompt: "Item A should take leftover space; B and C stay content-sized:",
    options: [
      {
        id: "a",
        label: "A { flex-grow: 1 } · B,C { flex-grow: 0 }",
        layout: {
          display: "flex",
          gap: "6px",
          items: [
            { label: "A", style: { flexGrow: "1" } },
            { label: "B" },
            { label: "C" },
          ],
        },
      },
      { id: "b", label: "order: 99 on A" },
      { id: "c", label: "align-self: stretch on B only" },
      { id: "d", label: "justify-self: flex-end on A (valid in flex)" },
    ],
    answerId: "a",
    explanation: "flex-grow distributes free space; justify-self is for Grid.",
  },
  {
    id: "css-flex-shrink",
    prompt: "On a narrow viewport, which resists shrinking most?",
    codeLang: "css",
    code: `.a { flex: 1 1 200px; }
.b { flex: 1 0 200px; }
.c { flex: 1 3 200px; }`,
    options: [
      { id: "a", label: "B — flex-shrink: 0" },
      { id: "b", label: "C — highest shrink means it stays widest" },
      { id: "c", label: "A — shrink 1 always wins over 0" },
      { id: "d", label: "All three always keep exactly 200px" },
    ],
    answerId: "a",
    explanation: "flex-shrink: 0 prevents shrinking. Higher factors shrink more.",
  },

  // —— HTML / CSS theory ——
  {
    id: "html-semantic-nav",
    prompt: "Preferred semantic element for primary site navigation?",
    options: [
      { id: "a", label: "<nav>" },
      { id: "b", label: "<div class='nav'>" },
      { id: "c", label: "<span>" },
      { id: "d", label: "<b>" },
    ],
    answerId: "a",
    explanation: "<nav> exposes a navigation landmark.",
  },
  {
    id: "html-picture-srcset",
    prompt: "When prefer `<picture>` + `<source>` over only `srcset` on `<img>`?",
    options: [
      {
        id: "a",
        label: "Art direction — different crops/files per breakpoint or format",
      },
      { id: "b", label: "Always — srcset on img is deprecated" },
      { id: "c", label: "Only for SVG icons" },
      { id: "d", label: "Required for loading='lazy'" },
    ],
    answerId: "a",
    explanation: "picture = alternate assets; srcset = density/width variants.",
  },
  {
    id: "html-lazy-loading",
    prompt: "Native lazy-load for below-the-fold images?",
    options: [
      { id: "a", label: '<img src="x.jpg" alt="…" loading="lazy" />' },
      { id: "b", label: '<img src="x.jpg" lazy="true" />' },
      { id: "c", label: '<img loading="eager" /> for below-fold' },
      { id: "d", label: "Impossible without IntersectionObserver" },
    ],
    answerId: "a",
    explanation: 'loading="lazy" is the native attribute.',
  },
  {
    id: "html-a11y-button",
    prompt: "Icon-only “Close” control must have, at minimum:",
    options: [
      {
        id: "a",
        label: "Accessible name (aria-label / sr-only text) and be keyboard-focusable",
      },
      { id: "b", label: "Only a background-image, no name" },
      { id: "c", label: "div + onclick (divs are focusable by default)" },
      { id: "d", label: "title alone is always enough for AT" },
    ],
    answerId: "a",
    explanation: "Prefer <button> with an accessible name.",
  },
  {
    id: "css-box-border-box",
    prompt: "With `box-sizing: border-box`, width: 200px includes:",
    options: [
      { id: "a", label: "Content + padding + border (inside the 200px)" },
      { id: "b", label: "Only content; padding always adds outside" },
      { id: "c", label: "Only margin" },
      { id: "d", label: "Nothing — width is ignored" },
    ],
    answerId: "a",
    explanation: "border-box folds padding/border into the declared width.",
  },
  {
    id: "css-position-absolute",
    prompt: "`position: absolute; top:0; left:0` is positioned relative to:",
    options: [
      {
        id: "a",
        label: "Nearest positioned ancestor (not static), else the initial containing block",
      },
      { id: "b", label: "Always the viewport only" },
      { id: "c", label: "Always <body> even with a relative parent" },
      { id: "d", label: "The previous sibling" },
    ],
    answerId: "a",
    explanation: "Absolute looks up for a positioned containing block.",
  },
  {
    id: "css-zindex-stacking",
    prompt: "Why might `z-index: 9999` still paint under another element?",
    options: [
      {
        id: "a",
        label: "A parent stacking context has a lower z-index than the other element’s context",
      },
      { id: "b", label: "z-index only works on position: static" },
      { id: "c", label: "9999 is reserved by the browser" },
      { id: "d", label: "z-index is ignored in Grid forever" },
    ],
    answerId: "a",
    explanation: "Children cannot escape a lower parent stacking context.",
  },
  {
    id: "css-em-vs-rem",
    prompt: "`rem` is calculated relative to:",
    options: [
      { id: "a", label: "The parent element's font-size" },
      { id: "b", label: "The root font-size (html)" },
      { id: "c", label: "The viewport width" },
      { id: "d", label: "The body's line-height" },
    ],
    answerId: "b",
    explanation: "rem = root em; em uses the parent.",
  },
  {
    id: "css-media-mobile-first",
    prompt: "Mobile-first responsive CSS usually means:",
    options: [
      {
        id: "a",
        label: "Base styles for small screens; enhance with min-width media queries",
      },
      { id: "b", label: "Only max-width: 9999px everywhere" },
      { id: "c", label: "A separate .mobi.html site is mandatory" },
      { id: "d", label: "Avoid media queries; use JS resize only" },
    ],
    answerId: "a",
    explanation: "min-width breakpoints progressively enhance upward.",
  },
  {
    id: "css-specificity-rank",
    prompt: "Highest specificity among `#id`, `.class`, and `element`?",
    options: [
      { id: "a", label: "element" },
      { id: "b", label: ".class" },
      { id: "c", label: "#id" },
      { id: "d", label: "All equal" },
    ],
    answerId: "c",
    explanation: "IDs beat classes and type selectors.",
  },
];
