import type { SlotDifficulty as SlotDifficultyType } from "@/types/analytics";

const SLOT_NAMES: Record<number, string> = {
  1: "Specific Harm / User Pain",
  2: "The Gap / User Story",
  3: "Mechanism / Specific Feature",
  4: "Enforcement / Target Company",
  5: "Jurisdiction / Existing Landscape",
  6: "Precedent / Value Prop",
  7: "Political Landscape / Risks",
};

function DifficultyBadge({
  slotNumber,
  dropRate,
}: {
  slotNumber: number;
  dropRate: number | null;
}) {
  if (slotNumber === 1 || dropRate === null) {
    return (
      <span className="rounded px-2 py-0.5 text-xs text-[#6B7280] bg-[#E5E7EB]">
        —
      </span>
    );
  }
  const pct = dropRate * 100;
  if (pct < 10) {
    return (
      <span
        className="rounded px-2 py-0.5 text-xs font-medium bg-[#D1FAE5] text-[#065F46]"
      >
        Easy
      </span>
    );
  }
  if (pct <= 30) {
    return (
      <span
        className="rounded px-2 py-0.5 text-xs font-medium bg-[#FEF3C7] text-[#92400E]"
      >
        Moderate
      </span>
    );
  }
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-medium bg-[#FEE2E2] text-[#991B1B]"
    >
      Hard
    </span>
  );
}

export function SlotDifficulty({ slots }: { slots: SlotDifficultyType[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Slot #
            </th>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Slot Name
            </th>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Fill Count
            </th>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Drop Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {slots.map((row) => (
            <tr
              key={row.slot_number}
              className="even:bg-[#FAF8F3] odd:bg-white"
            >
              <td className="border-b border-[#E5E7EB] px-3 py-3 text-[#1B2A4A]">
                {row.slot_number}
              </td>
              <td className="border-b border-[#E5E7EB] px-3 py-3 text-[#1B2A4A]">
                {SLOT_NAMES[row.slot_number] ?? `Slot ${row.slot_number}`}
              </td>
              <td className="border-b border-[#E5E7EB] px-3 py-3 font-mono text-[#1B2A4A] tabular-nums">
                {row.fill_count}
              </td>
              <td className="border-b border-[#E5E7EB] px-3 py-3">
                <DifficultyBadge
                  slotNumber={row.slot_number}
                  dropRate={row.drop_rate}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
