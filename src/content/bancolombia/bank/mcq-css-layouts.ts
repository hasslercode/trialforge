import type { McqQuestion } from "@/domain/exam";

/**
 * CSS Flexbox + Grid with visual layout options (Bancolombia-style).
 */
export const mcqCssLayoutsBank: McqQuestion[] = [
  {
    id: "css-flex-justify-center",
    prompt: "Which `justify-content` produces this horizontal result on a row flex container?",
    codeLang: "css",
    code: `.row { display: flex; /* justify-content: ? */ }`,
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
    explanation: "justify-content: center packs items along the main axis in the middle.",
  },
  {
    id: "css-flex-align-items",
    prompt: "Container is taller than items. Which `align-items` centers them vertically?",
    options: [
      {
        id: "a",
        label: "align-items: center",
        layout: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          items: [
            { label: "1", style: { height: "28px" } },
            { label: "2", style: { height: "40px" } },
            { label: "3", style: { height: "22px" } },
          ],
        },
      },
      {
        id: "b",
        label: "align-items: stretch (default visual when heights unset)",
        layout: {
          display: "flex",
          alignItems: "stretch",
          gap: "8px",
          items: [{ label: "1" }, { label: "2" }, { label: "3" }],
        },
      },
      {
        id: "c",
        label: "justify-content: center (vertical on a row?)",
        layout: {
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          items: [{ label: "1" }, { label: "2" }, { label: "3" }],
        },
      },
      {
        id: "d",
        label: "align-items: flex-end",
        layout: {
          display: "flex",
          alignItems: "flex-end",
          gap: "8px",
          items: [
            { label: "1", style: { height: "28px" } },
            { label: "2", style: { height: "40px" } },
            { label: "3", style: { height: "22px" } },
          ],
        },
      },
    ],
    answerId: "a",
    explanation: "On a row flex container, cross-axis centering is align-items: center.",
  },
  {
    id: "css-flex-align-self",
    prompt: "Only item B should stick to the bottom of a row flex container. What do you set on B?",
    options: [
      { id: "a", label: "align-self: flex-end" },
      { id: "b", label: "justify-self: flex-end (valid in flex)" },
      { id: "c", label: "align-items: flex-end on B" },
      { id: "d", label: "flex-end: true" },
    ],
    answerId: "a",
    explanation: "align-self overrides align-items for one item. justify-self is for Grid, not Flex.",
  },
  {
    id: "css-flex-grow",
    prompt: "A fills leftover space; B and C stay content-sized. Correct?",
    codeLang: "css",
    code: `.a { flex-grow: /* ? */ }
.b, .c { flex-grow: 0 }`,
    options: [
      {
        id: "a",
        label: "flex-grow: 1 on A",
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
      {
        id: "b",
        label: "flex-grow: 0 on A and 1 on B/C",
        layout: {
          display: "flex",
          gap: "6px",
          items: [
            { label: "A" },
            { label: "B", style: { flexGrow: "1" } },
            { label: "C", style: { flexGrow: "1" } },
          ],
        },
      },
      { id: "c", label: "order: 99 on A" },
      { id: "d", label: "flex-basis: 0 on B and C only" },
    ],
    answerId: "a",
    explanation: "flex-grow distributes free space. A with grow 1 expands; siblings with 0 do not.",
  },
  {
    id: "css-flex-shrink-basis",
    prompt: "Narrow viewport: which item resists shrinking most?",
    codeLang: "css",
    code: `.a { flex: 1 1 200px; }
.b { flex: 1 0 200px; }
.c { flex: 1 3 200px; }`,
    options: [
      { id: "a", label: "B — flex-shrink: 0" },
      { id: "b", label: "C — highest shrink factor means it stays widest" },
      { id: "c", label: "A — shrink 1 always wins over 0" },
      { id: "d", label: "All three always keep exactly 200px" },
    ],
    answerId: "a",
    explanation: "flex-shrink: 0 prevents shrinking. Higher shrink factors shrink more, not less.",
  },
  {
    id: "css-flex-order",
    prompt: "DOM order is A B C. Visual order should be C A B. Minimal change?",
    options: [
      { id: "a", label: "C { order: -1 } (A and B default 0)" },
      { id: "b", label: "A { order: 2 }; B { order: 3 }; C { order: 1 } is the only way" },
      { id: "c", label: "justify-content: order(C,A,B)" },
      { id: "d", label: "float: left on C" },
    ],
    answerId: "a",
    explanation: "Lower order values appear first. Default is 0, so -1 pulls C to the start.",
  },
  {
    id: "css-grid-template-cols",
    prompt: "Which rule creates three equal columns?",
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
      { id: "d", label: "columns: 3 (multi-column, not Grid)" },
    ],
    answerId: "a",
    explanation: "Three 1fr tracks share width equally. Rows alone stack vertically.",
  },
  {
    id: "css-grid-autofit-minmax",
    prompt: "`grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))` mainly:",
    options: [
      {
        id: "a",
        label: "Creates as many fluid columns ≥180px as fit, stretching to fill the row",
      },
      {
        id: "b",
        label: "Always fixes exactly two columns of 180px",
      },
      {
        id: "c",
        label: "Is invalid unless used with Flexbox",
      },
      {
        id: "d",
        label: "Collapses all columns to 0 when there is free space (auto-fit never stretches)",
      },
    ],
    answerId: "a",
    explanation:
      "auto-fit collapses empty tracks and lets fr grow; minmax sets the responsive minimum.",
  },
  {
    id: "css-grid-autofill-vs-fit",
    prompt: "Difference between auto-fill and auto-fit with empty tracks?",
    options: [
      {
        id: "a",
        label: "auto-fit collapses empty tracks so items can grow; auto-fill keeps empty columns",
      },
      {
        id: "b",
        label: "They are identical in all browsers forever",
      },
      {
        id: "c",
        label: "auto-fill only works with px; auto-fit only with %",
      },
      {
        id: "d",
        label: "auto-fit disables gap",
      },
    ],
    answerId: "a",
    explanation: "Classic interview trap: auto-fit vs auto-fill empty-track behavior.",
  },
  {
    id: "css-grid-area-span",
    prompt: "Make the hero span two columns on a 3-column grid:",
    codeLang: "css",
    code: `.hero { /* ? */ }`,
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
      { id: "c", label: "width: 66% inside Grid always spans tracks" },
      { id: "d", label: "grid-row: 2 / 2" },
    ],
    answerId: "a",
    explanation: "grid-column: span 2 (or 1 / 3) spans tracks. Width % does not change track placement.",
  },
  {
    id: "css-grid-named-area",
    prompt: "Which defines named areas for a holy-grail layout?",
    options: [
      {
        id: "a",
        label: "grid-template-areas with matching grid-area on children",
        code: `.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
}
.header { grid-area: header; }`,
      },
      {
        id: "b",
        label: "Only float + clear",
      },
      {
        id: "c",
        label: "justify-items: area-name",
      },
      {
        id: "d",
        label: "grid-area on the container alone, no template",
      },
    ],
    answerId: "a",
    explanation: "Named areas require template-areas strings plus grid-area on items.",
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
    explanation: "Two-value gap is row then column (same order as margin shorthand’s block/inline feel).",
  },
  {
    id: "css-grid-row-placement",
    prompt: "Place an item from row line 1 to 3 (span two rows):",
    options: [
      { id: "a", label: "grid-row: 1 / 3" },
      { id: "b", label: "grid-row: 1 / 2" },
      { id: "c", label: "align-self: 1 / 3" },
      { id: "d", label: "flex-row: span 2" },
    ],
    answerId: "a",
    explanation: "Grid lines are inclusive start / exclusive end: 1 / 3 spans two rows.",
  },
  {
    id: "css-flex-vs-grid-choice",
    prompt:
      "Dashboard: header full width, sidebar + content, footer full width, overlapping regions named. Prefer?",
    options: [
      { id: "a", label: "CSS Grid with template areas" },
      { id: "b", label: "Only float left on every section" },
      { id: "c", label: "position: absolute for all regions" },
      { id: "d", label: "table-cell layout" },
    ],
    answerId: "a",
    explanation: "Two-dimensional page shells are Grid’s strength; Flex is better for 1D toolbars/lists.",
  },
];
