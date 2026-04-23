type Props = {
  color: string;
  className?: string;
};

export function ShoeMark({ color, className }: Props) {
  return (
    <svg
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`g-${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <path
        d="M8 44 C 18 44 22 28 38 28 C 54 28 60 36 78 36 C 96 36 104 30 110 32 L 112 44 C 112 50 108 54 100 54 L 16 54 C 10 54 8 50 8 44 Z"
        fill={`url(#g-${color.replace("#", "")})`}
      />
      <circle cx="42" cy="42" r="3" fill="white" opacity="0.85" />
      <circle cx="56" cy="42" r="3" fill="white" opacity="0.85" />
      <circle cx="70" cy="42" r="3" fill="white" opacity="0.85" />
      <path
        d="M16 56 L 104 56"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
