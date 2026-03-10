/**
 * Static onboarding copy for home (intro + CTA) and draft initiation.
 * Serif font, navy text; "green text box below" in forest green to link to InputField.
 * No logic, no state, no API.
 */
export function PaperOnboardingCopy() {
  return (
    <div className="px-4 py-4 font-serif text-[#1B2A4A] space-y-4">
      <p>
        OpenDraft helps you turn an idea into a structured proposal — for a
        lawmaker or a company. You describe what you want to change; we ask
        questions until it&apos;s ready to send. When you&apos;re done, your
        draft is published and can be sent to the right person.
      </p>
      <p>
        To get started, describe the change you want to see in the{" "}
        <span className="text-[#2D5016]">green text box below</span> ↓
      </p>
    </div>
  );
}
