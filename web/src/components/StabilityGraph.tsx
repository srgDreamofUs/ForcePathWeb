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
      { label: t.input, height: inputHeight },
      ...results.map(r => ({ label: `${r.step}`, height: r.current_height }))
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

    // Map normalized y (0-1) to SVG coordinates (60-0)
    // We want 1 (stable) to be at top (0) and 0 (unstable) to be at bottom (60)
    const mapY = (val: number) => 60 - (val * 50) - 5; // Padding 5px top/bottom

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

  const mapY = (val: number) => 60 - (val * 50) - 5;

  return (
    <div className="w-full rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_rgba(31,38,135,0.10)] p-6 transition-all duration-300 hover:scale-[1.01] hover:bg-white/30 hover:shadow-xl mt-8">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">{t.stabilityScore}</h3>
        <p className="text-xs text-slate-600">{t.stabilitySubtitle}</p>
      </div>

      <div className="relative w-full aspect-[5/3] md:aspect-[5/2] max-h-[320px]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((val) => (
            <line
              key={val}
              x1="0"
              y1={mapY(val)}
              x2="100"
              y2={mapY(val)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.2"
              strokeDasharray="2 2"
            />
          ))}

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7a8bff" />
              <stop offset="100%" stopColor="#ff7fc4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
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
            strokeWidth="1.5"
            filter="url(#glow)"
            strokeLinecap="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={mapY(p.y)}
                r="1.5"
                fill="white"
                stroke="#7a8bff"
                strokeWidth="0.5"
              />
              {/* Labels */}
              <text
                x={p.x}
                y={mapY(p.y) - 4}
                textAnchor="middle"
                fontSize="3"
                fill="#475569"
                fontWeight="600"
              >
                {p.displayValue}
              </text>
              <text
                x={p.x}
                y={65}
                textAnchor="middle"
                fontSize="2.5"
                fill="#64748b"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}