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
    <div className="border border-gray-200 border-l-4 border-l-[#2D5016] bg-white px-4 py-3 shadow-sm">
      <p className="mb-2 font-medium text-[#1B2A4A]">
        <span>Understood: </span>
        <span>{understood}</span>
      </p>
      <p className="font-medium text-[#2D5016]">
        <span>Question: </span>
        <span>&quot;{question}&quot;</span>
      </p>
    </div>
  );
}
