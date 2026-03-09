import { clsx } from "clsx";
import { BookOpen, Home, Pencil } from "lucide-react";

type BottomNavVariant = "default" | "active";

interface BottomNavProps {
  variant: BottomNavVariant;
  fixed?: boolean;
  className?: string;
}

/**
 * Fixed bottom nav. Two variants:
 * - default (Screen 1): left/right placeholders, center Home icon
 * - active (Screen 3): Pencil (previous drafts), Home (reset), BookOpen (public feed)
 * White background, light gray top border. Icons from lucide-react.
 */
export function BottomNav({ variant, fixed = true, className }: BottomNavProps) {
  const iconClassName = "size-6 text-[#1B2A4A]";

  return (
    <nav
      className={clsx(
        "bottom-0 left-0 right-0 z-10 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-4",
        fixed && "fixed",
        className
      )}
      role="navigation"
      aria-label="Bottom navigation"
    >
      {/* Left slot */}
      <div className="flex w-1/3 items-center justify-start">
        {variant === "default" ? (
          <span className="size-10" aria-hidden />
        ) : (
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-md transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] focus:ring-offset-2"
            aria-label="Previous drafts"
          >
            <Pencil className={iconClassName} />
          </button>
        )}
      </div>

      {/* Center slot — Home */}
      <div className="flex w-1/3 items-center justify-center">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] focus:ring-offset-2"
          aria-label="Home"
        >
          <Home className={iconClassName} />
        </button>
      </div>

      {/* Right slot */}
      <div className="flex w-1/3 items-center justify-end">
        {variant === "default" ? (
          <span className="size-10" aria-hidden />
        ) : (
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-md transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] focus:ring-offset-2"
            aria-label="Public feed"
          >
            <BookOpen className={iconClassName} />
          </button>
        )}
      </div>
    </nav>
  );
}
