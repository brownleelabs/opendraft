interface AIResponseBlockProps {
  understood: string;
  question: string;
}

/**
 * Renders the AI response between Paper and InputField. Exactly two parts:
 * Understood: [sentence] and Question: "[question]". Both props required;
 * if either is empty after trim, returns null. Structured form feel, not chat bubble.
 */
export function AIResponseBlock({ understood, question }: AIResponseBlockProps) {
  if (understood.trim() === "" || question.trim() === "") {
    return null;
  }

  return (
    <div className="border border-gray-200 border-l-4 border-l-[#2D5016] bg-white px-4 py-3 text-[#1B2A4A] shadow-sm">
      <p className="mb-2">
        <span className="font-normal">Understood: </span>
        <span>{understood}</span>
      </p>
      <p>
        <span className="font-semibold">Question: </span>
        <span className="font-medium">"{question}"</span>
      </p>
    </div>
  );
}
