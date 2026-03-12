export function RobotMascot({ state = "idle" }) {
  const eyeAnim  = state === "thinking" ? "animate-pulse" : "";
  const bodyAnim = state === "thinking" ? "animate-bounce" : "";

  return (
    <svg
      viewBox="0 0 80 100"
      className={`w-16 h-20 select-none ${bodyAnim}`}
      style={{ filter: "drop-shadow(0 4px 16px #6366f144)" }}
    >
      {/* antenna */}
      <line x1="40" y1="8" x2="40" y2="18" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="6" r="4" fill="#6366f1" className={state === "thinking" ? "animate-ping" : ""} />

      {/* head */}
      <rect x="14" y="18" width="52" height="38" rx="10" fill="#f8f9ff" stroke="#6366f1" strokeWidth="2.5" />

      {/* eyes */}
      <circle cx="29" cy="34" r="7" fill="#e0e7ff" />
      <circle cx="29" cy="34" r={state === "thinking" ? "3" : "4"} fill="#6366f1" className={eyeAnim} />
      <circle cx="51" cy="34" r="7" fill="#e0e7ff" />
      <circle cx="51" cy="34" r={state === "thinking" ? "3" : "4"} fill="#6366f1" className={eyeAnim} />

      {/* mouth */}
      {state === "done"  && <path d="M28 46 Q40 54 52 46" stroke="#6366f1" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {state === "error" && <path d="M28 52 Q40 44 52 52" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {state !== "done"  && state !== "error" && <rect x="29" y="44" width="22" height="5" rx="2.5" fill="#c7d2fe" />}

      {/* body */}
      <rect x="18" y="58" width="44" height="28" rx="8" fill="#f1f5ff" stroke="#6366f1" strokeWidth="2" />
      <circle cx="40" cy="70" r="5" fill={state === "thinking" ? "#6366f1" : "#e0e7ff"} className={state === "thinking" ? "animate-pulse" : ""} />

      {/* arms */}
      <rect x="4"  y="62" width="12" height="7" rx="3.5" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="64" y="62" width="12" height="7" rx="3.5" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />

      {/* legs */}
      <rect x="24" y="87" width="12" height="10" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="44" y="87" width="12" height="10" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
    </svg>
  );
}
