"use client";

export interface PolicyDraftTemplateProps {
  slot1: string; // Specific Harm
  slot2: string; // Gap and Consequences
  slot3: string; // Proposed Mechanism
  slot4: string; // Enforcement
  slot5: string; // Jurisdiction
  slot6: string; // Precedent and Fiscal Note
  slot7: string; // Political Landscape
  title?: string; // Optional bill title
}

/**
 * Renders the Legislative Launchpad draft structure from filled slot content.
 * Pure display component — no state, no API, no logic.
 */
export function PolicyDraftTemplate({
  slot1,
  slot2,
  slot3,
  slot4,
  slot5,
  slot6,
  slot7,
  title,
}: PolicyDraftTemplateProps) {
  return (
    <article
      className="font-serif text-[#1B2A4A] space-y-6 px-4 py-6"
      aria-label="Draft policy proposal"
    >
      <h1 className="text-lg font-semibold tracking-wide uppercase">
        Draft Policy Proposal
      </h1>

      {/* I. Title & Summary */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          I. Title & Summary
        </h2>
        {title && (
          <p className="font-semibold mb-2">{title}</p>
        )}
        <p className="text-sm leading-relaxed">{slot1}</p>
      </section>

      {/* II. The Problem (Findings) — slot1 (Specific Harm) + slot2 (Gap and Consequences) */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          II. The Problem (Findings)
        </h2>
        <p className="text-sm leading-relaxed mb-2">{slot1}</p>
        <p className="text-sm leading-relaxed">{slot2}</p>
      </section>

      {/* III. The Solution (Statutory Changes) */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          III. The Solution (Statutory Changes)
        </h2>
        <p className="text-sm leading-relaxed mb-2">{slot3}</p>
        <p className="text-sm leading-relaxed">{slot4}</p>
      </section>

      {/* IV. Impact & Feasibility */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          IV. Impact & Feasibility
        </h2>
        <p className="text-sm leading-relaxed mb-2">{slot5}</p>
        <p className="text-sm leading-relaxed">{slot6}</p>
      </section>

      {/* V. Political Landscape */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">
          V. Political Landscape
        </h2>
        <p className="text-sm leading-relaxed">{slot7}</p>
      </section>

      <footer className="pt-4 border-t border-[#E5E5E5] text-xs text-[#1B2A4A]/80">
        Submitted by: Anonymous — OpenDraft
      </footer>
    </article>
  );
}
