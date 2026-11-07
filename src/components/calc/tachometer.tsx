import { useEffect, useRef, useState } from "react";

type Props = {
  /** 現在値 (x1000 rpm) */
  value: number;
  max?: number;
  redline?: number;
  size?: number;
};

// 針は 225° (左下) から -45° (右下) まで時計回りに 270° 掃引
const START = 135; // SVG 角度 (0=右, 時計回り): 左下
const SWEEP = 270;

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

const Tachometer = ({ value, max = 50, redline = 40, size = 420 }: Props) => {
  const colorOf = (v: number) =>
    v >= redline ? "#ff3b30" : "#ff9d2e";
  const majorStep = max > 20 ? 5 : 1;
  // 針をなめらかに追従させる
  const [shown, setShown] = useState(0);
  const target = useRef(0);
  target.current = Math.min(max, Math.max(0, value));
  useEffect(() => {
    let id = 0;
    const tick = () => {
      setShown((s) => {
        const d = target.current - s;
        return Math.abs(d) < 0.001 ? target.current : s + d * 0.15;
      });
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const C = 200;
  const R = 170;
  const angleOf = (v: number) => START + (v / max) * SWEEP;
  const needleAngle = angleOf(shown);

  const ticks = [];
  for (let i = 0; i <= (max / majorStep) * 5; i++) {
    const v = (i / 5) * majorStep;
    const major = i % 5 === 0;
    const col = colorOf(v);
    const a = angleOf(v);
    const [x0, y0] = polar(C, C, R - (major ? 22 : 12), a);
    const [x1, y1] = polar(C, C, R, a);
    ticks.push(
      <line
        key={i}
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        stroke={col}
        strokeWidth={major ? 4 : 1.8}
        strokeLinecap="round"
      />
    );
    if (major) {
      const [tx, ty] = polar(C, C, R - 42, a);
      ticks.push(
        <text
          key={`t${i}`}
          x={tx}
          y={ty}
          fill={col}
          fontSize="24"
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
        >
          {v}
        </text>
      );
    }
  }

  const [nx, ny] = polar(C, C, R - 8, needleAngle);
  const [tx, ty] = polar(C, C, -34, needleAngle); // 尾
  const display = Math.round(shown * 1000);

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      style={{ maxWidth: "100%", height: "auto" }}
      role="img"
      aria-label={`回転数 ${Math.round(value * 1000)} rpm`}
    >
      <defs>
        <radialGradient id="face" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#23262e" />
          <stop offset="100%" stopColor="#0c0d11" />
        </radialGradient>
        <linearGradient id="bezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5b616e" />
          <stop offset="50%" stopColor="#1a1c22" />
          <stop offset="100%" stopColor="#4a4f5a" />
        </linearGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={C} cy={C} r={196} fill="url(#bezel)" />
      <circle cx={C} cy={C} r={188} fill="url(#face)" />

      {/* レッドゾーン帯 */}
      <path
        d={arcPath(C, C, R + 8, angleOf(redline), angleOf(max))}
        stroke="#ff3b30"
        strokeWidth={10}
        fill="none"
        filter="url(#glow)"
      />

      {ticks}

      <text
        x={C}
        y={C - 70}
        textAnchor="middle"
        fill="#e8eaf0"
        fontSize="26"
        fontWeight="800"
        letterSpacing="3"
        style={{ fontStyle: "italic" }}
      >
        MINI4WD
        <tspan fill="#ff3b30"> ●</tspan>
      </text>
      <text
        x={C}
        y={C + 70}
        textAnchor="middle"
        fill="#ff9d2e"
        fontSize="14"
        letterSpacing="1"
      >
        x1000r/min
      </text>

      {/* デジタル表示 */}
      <rect x={C - 62} y={C + 90} width={124} height={42} rx={8} fill="#07080b" stroke="#2a2d36" />
      <text
        x={C}
        y={C + 112}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ff9d2e"
        fontSize="28"
        fontWeight="700"
        style={{ fontFamily: "ui-monospace, monospace" }}
      >
        {display.toLocaleString()}
      </text>

      {/* 針 */}
      <g filter="url(#glow)">
        <line
          x1={tx}
          y1={ty}
          x2={nx}
          y2={ny}
          stroke="#ff2d1f"
          strokeWidth={5}
          strokeLinecap="round"
        />
      </g>
      <circle cx={C} cy={C} r={18} fill="#14151a" stroke="#3a3e48" strokeWidth={3} />
      <circle cx={C} cy={C} r={5} fill="#ff2d1f" />
    </svg>
  );
};

export default Tachometer;
