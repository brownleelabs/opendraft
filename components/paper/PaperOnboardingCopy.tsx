/**
 * Static onboarding copy for Screen 2 (Draft Initiation). Renders inside Paper.
 * Serif font, navy text; "green text box below" in forest green to link to InputField.
 * No logic, no state, no API.
 */
export function PaperOnboardingCopy() {
  return (
    <p className="px-4 py-4 font-serif text-[#1B2A4A]">
      To get started, describe the change you want to see in the{" "}
      <span className="text-[#2D5016]">green text box below</span> ↓
    </p>
  );
}
