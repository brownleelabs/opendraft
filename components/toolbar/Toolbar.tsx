"use client";

export interface ToolbarProps {
  left?: React.ReactNode;
  centerLeft?: React.ReactNode;
  centerRight?: React.ReactNode;
  right?: React.ReactNode;
}

export function Toolbar({ left, centerLeft, centerRight, right }: ToolbarProps) {
  return (
    <div
      className="flex w-full flex-row items-center justify-between border-y border-[#E5E5E5] bg-white px-4 py-2"
      role="toolbar"
    >
      <div>{left}</div>
      <div>{centerLeft}</div>
      <div>{centerRight}</div>
      <div>{right}</div>
    </div>
  );
}
