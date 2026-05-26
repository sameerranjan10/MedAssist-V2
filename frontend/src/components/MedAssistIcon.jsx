export default function MedAssistIcon({
  size = 200,
  uid = "main",
}) {
  const p = `ma-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${p}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0038C0" />
          <stop offset="50%" stopColor="#0063FF" />
          <stop offset="100%" stopColor="#00B4DC" />
        </linearGradient>

        <linearGradient
          id={`${p}-chest`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#0048D0" />
          <stop offset="100%" stopColor="#0090C8" />
        </linearGradient>

        <radialGradient id={`${p}-iglow`} cx="40%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#80C8FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0038C0" stopOpacity="0" />
        </radialGradient>

        <clipPath id={`${p}-clip`}>
          <rect x="0" y="0" width="200" height="200" rx="100" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect
        x="0"
        y="0"
        width="200"
        height="200"
        rx="100"
        fill={`url(#${p}-bg)`}
      />

        <g clipPath={`url(#${p}-clip)`}>
          {/* Glow */}
          <rect
            x="0"
            y="0"
            width="200"
            height="200"
            fill={`url(#${p}-iglow)`}
          >
            <animate attributeName="opacity" values="0.6; 1; 0.6" dur="4s" repeatCount="indefinite" />
          </rect>

          {/* Glass Effect */}
          <ellipse
            cx="78"
            cy="60"
            rx="75"
            ry="50"
            fill="white"
            fillOpacity="0.08"
            transform="rotate(-18, 78, 60)"
          >
            <animate attributeName="fill-opacity" values="0.05; 0.12; 0.05" dur="3s" repeatCount="indefinite" />
          </ellipse>

          {/* Dark Depth */}
          <ellipse
            cx="155"
            cy="158"
            rx="70"
            ry="55"
            fill="#001060"
            fillOpacity="0.15"
          />

          {/* Medical Symbol */}
          <g>
            {/* Cross Vertical */}
            <rect
              x="86"
              y="40"
              width="28"
              height="90"
              rx="8"
              fill="white"
            />

            {/* Cross Horizontal */}
            <rect
              x="38"
              y="84"
              width="124"
              height="28"
              rx="8"
              fill="white"
            />

            {/* ECG Line */}
            <path
              d="M38,98 L60,98 L68.5,87 L76,110 L83.5,98 L162,98"
              stroke="#0060D8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray="150"
              strokeDashoffset="150"
            >
              <animate attributeName="stroke-dashoffset" values="150;0;150" dur="4s" ease="ease-in-out" repeatCount="indefinite" />
            </path>

            {/* Connector */}
            <rect
              x="90"
              y="125"
              width="20"
              height="16"
              fill="white"
            />

            {/* Stethoscope Outer */}
            <circle cx="100" cy="153" r="17" fill="white" />

            {/* Inner Gradient */}
            <circle
              cx="100"
              cy="153"
              r="10.5"
              fill={`url(#${p}-chest)`}
            />

            {/* Center Dot */}
            <circle cx="100" cy="153" r="4.5" fill="white">
              <animate attributeName="opacity" values="1; 0.3; 1" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="r" values="4.5; 5.5; 4.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Border Highlight */}
          <rect
            x="1.5"
            y="1.5"
            width="197"
            height="197"
            rx="98.5"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.2"
          />
        </g>
    </svg>
  );
}
