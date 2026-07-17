import type { CSSProperties } from "react";
import type { McqLayoutPreview, McqOption } from "@/domain/exam";

export function McqCodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <pre className="mcq-code-block mt-3 overflow-x-auto" data-lang={lang ?? "code"}>
      <code>{code.trim()}</code>
    </pre>
  );
}

export function McqLayoutPreviewView({ layout }: { layout: McqLayoutPreview }) {
  const containerStyle: CSSProperties = {
    display: layout.display,
    justifyContent: layout.justifyContent,
    alignItems: layout.alignItems,
    flexDirection: layout.flexDirection as CSSProperties["flexDirection"],
    flexWrap: layout.flexWrap as CSSProperties["flexWrap"],
    gap: layout.gap ?? "6px",
    gridTemplateColumns: layout.gridTemplateColumns,
    gridTemplateRows: layout.gridTemplateRows,
    minHeight: 72,
    padding: 8,
  };

  return (
    <div className="mcq-layout-preview mt-2" style={containerStyle} aria-hidden>
      {layout.items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="mcq-layout-item"
          style={item.style as CSSProperties | undefined}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function McqOptionBody({ option }: { option: McqOption }) {
  return (
    <>
      {option.label ? <span className="block leading-6 text-[var(--exam-text)]">{option.label}</span> : null}
      {option.code ? <McqCodeBlock code={option.code} /> : null}
      {option.layout ? <McqLayoutPreviewView layout={option.layout} /> : null}
    </>
  );
}
