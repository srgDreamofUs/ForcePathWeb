import { useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { normalizeStability } from '../utils/normalizeStability';
import { StepResult } from '../api/client';

interface StabilityGraphProps {
  results: StepResult[];
  inputHeight?: number;
}

export default function StabilityGraph({ results, inputHeight = 1 }: StabilityGraphProps) {
  const { t } = useLanguage();

  // Prepare data points
  const points = useMemo(() => {
    const data = [
      { label: t.step, height: inputHeight },
      ...results.map(r => ({ label: `${r.step + 1}`, height: r.current_height }))
    ];

    return data.map((d, i) => ({
      ...d,
      x: i * (100 / (data.length - 1 || 1)),
      y: normalizeStability(d.height), // 0 to 1
      displayValue: normalizeStability(d.height).toFixed(2)
    }));
  }, [results, inputHeight, t]);

  // Generate path for cubic bezier curve
  const pathData = useMemo(() => {
    if (points.length < 2) return '';

    // Map normalized y (0-1) to SVG coordinates (100-0)
    const mapY = (val: number) => 100 - (val * 100);

    let d = `M ${points[0].x} ${mapY(points[0].y)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      // Control points for smooth curve
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = mapY(p0.y);
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = mapY(p1.y);

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${mapY(p1.y)}`;
    }
    return d;
  }, [points]);

  return (
    <div className="w-full rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_rgba(31,38,135,0.10)] p-6 transition-all duration-300 hover:scale-[1.01] hover:bg-white/30 hover:shadow-xl mt-8">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">{t.stabilityScore}</h3>
        <p className="text-xs text-slate-600">{t.stabilitySubtitle}</p>
      </div>

      <div className="relative w-full h-[320px] pt-6 pb-8 px-4">
        {/* SVG Graph Layer */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((val) => (
            <line
              key={val}
              x1="0"
              y1={100 - (val * 100)}
              x2="100"
              y2={100 - (val * 100)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7a8bff" />
              <stop offset="100%" stopColor="#ff7fc4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Curve */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            filter="url(#glow)"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* HTML Text & Point Overlay Layer (Prevents distortion and overflow) */}
        <div className="absolute inset-x-4 top-6 bottom-8 pointer-events-none">
          {points.map((p, i) => (
            <div key={i} style={{ left: `${p.x}%`, top: `${100 - (p.y * 100)}%` }} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">

              {/* Point Marker (HTML for fixed aspect ratio) */}
              <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#7a8bff] shadow-sm mb-1" />

              {/* Value Label */}
              <span
                className="mb-2 text-xs font-bold text-slate-500 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap"
                style={{ transform: 'translateY(-8px)' }}
              >
                {p.displayValue}
              </span>

              {/* X-Axis Label (Positioned at bottom of container) */}
              <span
                className="absolute top-[calc(100%_+_20px)] text-xs font-medium text-slate-500 whitespace-nowrap"
                style={{ top: `calc(${p.y * 100}% + 24px)` }}
              >
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}