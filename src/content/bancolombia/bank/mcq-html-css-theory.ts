import type { McqQuestion } from "@/domain/exam";

/**
 * Independent HTML + CSS theory bank (semantics, a11y, box model, positioning).
 */
export const mcqHtmlCssTheoryBank: McqQuestion[] = [
  {
    id: "html-semantic-article",
    prompt: "For a self-contained news card (title, author, body) reused in feeds, prefer:",
    options: [
      { id: "a", label: "<article>" },
      { id: "b", label: "<div class='article'>" },
      { id: "c", label: "<span>" },
      { id: "d", label: "<b>" },
    ],
    answerId: "a",
    explanation: "<article> communicates an independent piece of content to AT and SEO.",
  },
  {
    id: "html-picture-srcset",
    prompt: "When do you reach for `<picture>` + `<source>` instead of only `srcset` on `<img>`?",
    options: [
      {
        id: "a",
        label: "Art direction — different crops/files per breakpoint or format (WebP/AVIF)",
      },
      { id: "b", label: "Always — srcset on img is deprecated" },
      { id: "c", label: "Only for SVGs" },
      { id: "d", label: "When you need lazy loading (picture is required for loading='lazy')" },
    ],
    answerId: "a",
    explanation: "srcset handles density/width variants of the same image; picture handles alternate assets.",
  },
  {
    id: "html-srcset-widths",
    prompt: "`srcset=\"hero-400.jpg 400w, hero-800.jpg 800w\"` tells the browser:",
    options: [
      {
        id: "a",
        label: "Intrinsic widths so it can pick a file based on viewport and sizes",
      },
      { id: "b", label: "Always download both files" },
      { id: "c", label: "Force 400px CSS width" },
      { id: "d", label: "Disable caching" },
    ],
    answerId: "a",
    explanation: "w descriptors declare source widths; combined with sizes for responsive selection.",
  },
  {
    id: "html-lazy-loading",
    prompt: "Correct native lazy-load for below-the-fold images?",
    options: [
      { id: "a", label: '<img src="x.jpg" alt="…" loading="lazy" />' },
      { id: "b", label: '<img src="x.jpg" lazy="true" />' },
      { id: "c", label: '<img src="x.jpg" loading="eager" /> for below-fold (wrong — eager loads immediately)' },
      { id: "d", label: "Only possible with IntersectionObserver — no native attribute" },
    ],
    answerId: "a",
    explanation: "loading=\"lazy\" is the native attribute. Keep meaningful alt text.",
  },
  {
    id: "html-a11y-label",
    prompt: "Icon-only button for “Close dialog” must have:",
    options: [
      {
        id: "a",
        label: "Accessible name via aria-label / visually hidden text, and be focusable",
      },
      { id: "b", label: "Only a background-image, no name" },
      { id: "c", label: "div + onclick (divs are focusable by default)" },
      { id: "d", label: "title attribute only — enough for screen readers always" },
    ],
    answerId: "a",
    explanation: "WCAG: operable + accessible name. Prefer <button> with aria-label.",
  },
  {
    id: "html-seo-heading",
    prompt: "SEO/a11y heading practice on a product page:",
    options: [
      {
        id: "a",
        label: "One clear h1 for the page topic; nest h2/h3 without skipping for style",
      },
      { id: "b", label: "Multiple random h1s for keywords" },
      { id: "c", label: "Only use div with font-size for titles" },
      { id: "d", label: "Put all text in h1 and style with CSS later" },
    ],
    answerId: "a",
    explanation: "Logical heading outline helps AT and crawlers; style with CSS, not fake levels.",
  },
  {
    id: "html-main-landmark",
    prompt: "Primary page content landmark:",
    options: [
      { id: "a", label: "<main>" },
      { id: "b", label: "<div id='main'>" },
      { id: "c", label: "<section> always equals main" },
      { id: "d", label: "<aside>" },
    ],
    answerId: "a",
    explanation: "One <main> per page is the primary landmark.",
  },
  {
    id: "css-box-model-content",
    prompt: "With `box-sizing: content-box`, width: 200px, padding: 20px, border: 2px — used layout width is:",
    options: [
      { id: "a", label: "244px (200 + 40 + 4)" },
      { id: "b", label: "200px" },
      { id: "c", label: "220px" },
      { id: "d", label: "202px" },
    ],
    answerId: "a",
    explanation: "content-box: width is content only; padding and border add outside.",
  },
  {
    id: "css-box-border-box",
    prompt: "Same numbers with `border-box` — layout width is:",
    options: [
      { id: "a", label: "200px total including padding and border" },
      { id: "b", label: "244px" },
      { id: "c", label: "160px content only forced" },
      { id: "d", label: "Infinity — border-box ignores width" },
    ],
    answerId: "a",
    explanation: "border-box includes padding+border inside the declared width.",
  },
  {
    id: "css-position-relative-absolute",
    prompt: "Absolutely positioned child with `top:0; left:0` positions relative to:",
    options: [
      {
        id: "a",
        label: "Nearest positioned ancestor (not static), else the initial containing block",
      },
      { id: "b", label: "Always the viewport only" },
      { id: "c", label: "Always the <body> even if a relative parent exists" },
      { id: "d", label: "The previous sibling" },
    ],
    answerId: "a",
    explanation: "Absolute looks up for relative/absolute/fixed/sticky containing block.",
  },
  {
    id: "css-zindex-stacking",
    prompt: "Why might `z-index: 9999` on a child still paint under another element?",
    options: [
      {
        id: "a",
        label: "Parent creates a stacking context with a lower z-index than the other element’s context",
      },
      { id: "b", label: "z-index only works on static position" },
      { id: "c", label: "9999 is reserved by the browser" },
      { id: "d", label: "z-index is ignored in Flex and Grid forever" },
    ],
    answerId: "a",
    explanation: "Stacking contexts trap z-index; children cannot escape a lower parent context.",
  },
  {
    id: "css-display-inline-block",
    prompt: "`display: inline-block` compared to `inline`:",
    options: [
      {
        id: "a",
        label: "Flows with text but accepts width/height and vertical margins more predictably",
      },
      { id: "b", label: "Identical to block" },
      { id: "c", label: "Removes the element from accessibility tree" },
      { id: "d", label: "Only valid inside Grid" },
    ],
    answerId: "a",
    explanation: "inline-block is the classic hybrid for chips/buttons in text flow.",
  },
  {
    id: "css-display-none-vs-hidden",
    prompt: "`display: none` vs `visibility: hidden`:",
    options: [
      {
        id: "a",
        label: "none removes from layout; hidden keeps space but hides visually",
      },
      { id: "b", label: "They are identical" },
      { id: "c", label: "hidden removes from layout; none keeps space" },
      { id: "d", label: "none is only for animations" },
    ],
    answerId: "a",
    explanation: "Also: display:none typically hides from AT; visibility:hidden often still exposed depending on context.",
  },
  {
    id: "css-media-mobile-first",
    prompt: "Mobile-first responsive approach usually means:",
    options: [
      {
        id: "a",
        label: "Base styles for small screens; `@media (min-width: …)` enhance upward",
      },
      {
        id: "b",
        label: "Only `@media (max-width: 9999px)` everywhere",
      },
      {
        id: "c",
        label: "Separate .mobi.html site mandatory",
      },
      {
        id: "d",
        label: "Avoid media queries; use JS resize only",
      },
    ],
    answerId: "a",
    explanation: "min-width breakpoints progressively enhance from the narrow base.",
  },
  {
    id: "css-position-sticky-req",
    prompt: "`position: sticky` fails often because:",
    options: [
      {
        id: "a",
        label: "An ancestor has overflow hidden/auto clipping, or missing top/left threshold",
      },
      { id: "b", label: "sticky requires Grid parent" },
      { id: "c", label: "sticky is not supported in any evergreen browser" },
      { id: "d", label: "You must set z-index: -1" },
    ],
    answerId: "a",
    explanation: "Sticky needs a threshold (top/etc.) and a scrolling ancestor that doesn’t clip oddly.",
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
    explanation: "rem = root em. em resolves against the parent font-size.",
  },
  {
    id: "css-specificity-rank",
    prompt: "Of `#id`, `.class`, and `element`, the highest specificity belongs to:",
    options: [
      { id: "a", label: "element" },
      { id: "b", label: ".class" },
      { id: "c", label: "#id" },
      { id: "d", label: "All are equal" },
    ],
    answerId: "c",
    explanation: "IDs outrank classes and type selectors (ignoring !important / inline).",
  },
  {
    id: "css-overflow-list",
    prompt: "Internal scrolling in a long list without breaking the outer layout:",
    options: [
      { id: "a", label: "max-height + overflow-y: auto" },
      { id: "b", label: "display: none on the parent" },
      { id: "c", label: "position: fixed on each item" },
      { id: "d", label: "float: left on all children" },
    ],
    answerId: "a",
    explanation: "Bound the container height and allow overflow scrolling.",
  },
];
