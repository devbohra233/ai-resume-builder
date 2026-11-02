export default function ScoreRing({ value = 0, size = 96, stroke = 7, label = 'ATS', className }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const color = clamped >= 80 ? '#2f6b54' : clamped >= 60 ? '#b07d22' : '#bd6540';

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e9e3d4" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
          style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="font-display leading-none text-ink" style={{ fontSize: size * 0.29 }}>
          {clamped}
        </span>
        {label ? (
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-faint">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
