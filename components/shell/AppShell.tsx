import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Outermost wrapper for every screen. Sets cream background, single centered
 * column, and vertical slot structure: TopNav → main content → BottomNav.
 * No logic, no state, no API calls — visual container only.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh min-h-screen flex-col bg-[#FAF8F3]">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded bg-[#1B2A4A] px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1B2A4A]"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col min-h-0">
        {/* TopNav slot */}
        <header className="flex-shrink-0" aria-label="Top navigation" />
        {/* Main content */}
        <main id="main-content" className="min-h-0 flex-1 overflow-auto" tabIndex={-1}>
          {children}
        </main>
        {/* BottomNav slot — fixed at bottom of viewport */}
        <footer
          className="flex-shrink-0"
          aria-label="Bottom navigation"
        />
      </div>
    </div>
  );
}
