export interface TopNavProps {
  onInfoTap?: () => void;
}

/**
 * Fixed header. Navy background, "OpenDraft" wordmark centered in white serif.
 * Circled ① info button top right opens InfoModal when onInfoTap is provided.
 * Same on every screen. No back button, no hamburger menu.
 */
export function TopNav({ onInfoTap }: TopNavProps) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-10 flex h-14 items-center justify-between bg-[#1B2A4A] px-4"
      role="banner"
    >
      {/* Spacer for visual balance so wordmark is centered */}
      <div className="w-10 flex-shrink-0" aria-hidden />
      <h1 className="flex-1 text-center font-serif text-lg font-semibold tracking-tight text-white">
        OpenDraft
      </h1>
      <button
        type="button"
        onClick={onInfoTap}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1B2A4A]"
        aria-label="Info"
      >
        {/* Circled digit one (U+2460) */}
        ①
      </button>
    </header>
  );
}
