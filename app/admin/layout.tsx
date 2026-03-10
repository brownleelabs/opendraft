export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white">
      <header className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <span
          className="font-serif text-[#1B2A4A] text-xl"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          OpenDraft Admin
        </span>
        <a
          href="https://opendraft.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1B2A4A] text-sm hover:underline"
        >
          opendraft.dev ↗
        </a>
      </header>
      <main className="w-full max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}
