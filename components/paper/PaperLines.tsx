/**
 * Horizontal ruled lines for empty paper state (Screen 1). Like a blank piece of
 * lined paper. Repeating linear gradient — light blue-gray (#E8EDF4) every 28px.
 * Purely decorative background. No props, no state, no logic.
 */
export function PaperLines() {
  return (
    <div
      className="h-full w-full bg-[repeating-linear-gradient(to_bottom,#E8EDF4_0px,#E8EDF4_1px,transparent_1px,transparent_28px)]"
      aria-hidden
    />
  );
}
