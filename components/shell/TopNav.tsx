import Link from "next/link";
import { Settings } from "lucide-react";

export interface TopNavProps {
  onInfoTap?: () => void;
}

const navIconClass =
  "flex size-10 min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-full text-white transition-transform duration-100 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B2A4A]";

/**
 * Fixed header. Navy background, "OpenDraft" wordmark centered in white serif.
 * Left: Settings (gear). Right: ① info opens InfoModal when onInfoTap is provided.
 * Same on every screen. No back button, no hamburger menu.
 */
export function TopNav({ onInfoTap }: TopNavProps) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-10 flex h-14 items-center justify-between bg-[#1B2A4A] px-4"
      role="banner"
    >
      <Link
        href="/settings"
        className={navIconClass}
        aria-label="Settings"
      >
        <Settings className="size-5" aria-hidden />
      </Link>
      <h1 className="flex-1 text-center font-serif text-lg font-semibold tracking-tight text-white">
        <Link
          href="/"
          className="text-white no-underline hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B2A4A] rounded"
          aria-label="OpenDraft home"
        >
          OpenDraft
        </Link>
      </h1>
      <button
        type="button"
        onClick={() => onInfoTap?.()}
        className={navIconClass}
        aria-label="Info"
        aria-disabled={onInfoTap == null}
      >
        {/* Circled digit one (U+2460) */}
        ①
      </button>
    </header>
  );
}
