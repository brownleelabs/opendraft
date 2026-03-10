interface PaginationDotsProps {
  activeDot: 1 | 2 | 3;
}

const SCREEN_LABELS: Record<1 | 2 | 3, string> = {
  1: "home",
  2: "create draft",
  3: "conversation",
};

/**
 * Three dots in a horizontal row, centered. One dot is active (filled navy);
 * the others are unfilled with navy border. Indicates which screen you're on
 * (1 = home, 2 = create, 3 = conversation). Not swipeable.
 */
export function PaginationDots({ activeDot }: PaginationDotsProps) {
  const dotBase =
    "size-2 shrink-0 rounded-full border-2 border-[#1B2A4A] transition-colors";
  const activeClass = "bg-[#1B2A4A]";
  const inactiveClass = "bg-transparent";

  return (
    <div
      className="flex items-center justify-center gap-2 py-2"
      role="group"
      aria-label={`Screen ${activeDot} of 3: ${SCREEN_LABELS[activeDot]}. Position indicator.`}
      title={`Screen position: ${SCREEN_LABELS[activeDot]}`}
    >
      <span
        className={`${dotBase} ${activeDot === 1 ? activeClass : inactiveClass}`}
        aria-current={activeDot === 1 ? "true" : undefined}
      />
      <span
        className={`${dotBase} ${activeDot === 2 ? activeClass : inactiveClass}`}
        aria-current={activeDot === 2 ? "true" : undefined}
      />
      <span
        className={`${dotBase} ${activeDot === 3 ? activeClass : inactiveClass}`}
        aria-current={activeDot === 3 ? "true" : undefined}
      />
    </div>
  );
}
