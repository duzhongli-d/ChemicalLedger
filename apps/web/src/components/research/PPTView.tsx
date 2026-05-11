"use client";

interface PPTData {
  title: string;
  slides: { title: string; bulletPoints: string[] }[];
}

export function PPTView({ data }: { data: PPTData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{data.title}</h2>
      <div className="grid gap-4">
        {data.slides.map((slide, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl p-4 bg-white"
          >
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              {index + 1}. {slide.title}
            </h3>
            <ul className="space-y-2">
              {slide.bulletPoints.map((point, pIndex) => (
                <li key={pIndex} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
