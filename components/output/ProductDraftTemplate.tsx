"use client";

export interface ProductDraftTemplateProps {
  slot1: string; // User Pain and Evidence
  slot2: string; // User Story and Happy Path
  slot3: string; // Specific Feature
  slot4: string; // Target Company and Success Metric
  slot5: string; // Existing Landscape
  slot6: string; // Value Proposition and OKR Alignment
  slot7: string; // Risks and Non-Goals
  targetCompany?: string;
}

/**
 * Renders the Silicon Valley Handoff draft structure from filled slot content.
 * Pure display component — no state, no API, no logic.
 */
export function ProductDraftTemplate({
  slot1,
  slot2,
  slot3,
  slot4,
  slot5,
  slot6,
  slot7,
  targetCompany,
}: ProductDraftTemplateProps) {
  return (
    <article
      className="font-serif text-[#1B2A4A] space-y-6 px-4 py-6"
      aria-label="Draft product proposal"
    >
      <h1 className="text-lg font-semibold tracking-wide uppercase">
        Draft Product Proposal
      </h1>
      {targetCompany && (
        <p className="text-sm font-medium">To: {targetCompany}</p>
      )}

      {/* I. Executive Summary — slot1 (User Pain and Evidence) */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          I. Executive Summary
        </h2>
        <p className="text-sm leading-relaxed">{slot1}</p>
      </section>

      {/* II. The Problem Statement — slot1 */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          II. The Problem Statement
        </h2>
        <p className="text-sm leading-relaxed">{slot1}</p>
      </section>

      {/* III. User Story & Happy Path — slot2 */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          III. User Story & Happy Path
        </h2>
        <p className="text-sm leading-relaxed">{slot2}</p>
      </section>

      {/* IV. Functional Requirements — slot3 (Specific Feature) */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          IV. Functional Requirements
        </h2>
        <p className="text-sm leading-relaxed">{slot3}</p>
      </section>

      {/* V. Business Case — slot4 (Target Company and Success Metric) + slot6 (Value Proposition and OKR Alignment) */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          V. Business Case
        </h2>
        <p className="text-sm leading-relaxed mb-2">{slot4}</p>
        <p className="text-sm leading-relaxed">{slot6}</p>
      </section>

      {/* VI. Landscape & Risk — slot5 (Existing Landscape) + slot7 (Risks and Non-Goals) */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          VI. Landscape & Risk
        </h2>
        <p className="text-sm leading-relaxed mb-2">{slot5}</p>
        <p className="text-sm leading-relaxed">{slot7}</p>
      </section>

      <footer className="pt-4 border-t border-[#E5E5E5] text-xs text-[#1B2A4A]/80">
        Submitted by: Anonymous — OpenDraft
      </footer>
    </article>
  );
}
