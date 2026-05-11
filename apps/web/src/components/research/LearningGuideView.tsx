"use client";

interface LearningGuideData {
  title: string;
  sections: { heading: string; content: string }[];
}

export function LearningGuideView({ data }: { data: LearningGuideData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{data.title}</h2>
      {data.sections.map((section, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">{section.heading}</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
}
