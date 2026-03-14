import React from 'react';

export default function Logo({ className = "w-10 h-10", color = "text-white" }) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${color}`}
      aria-hidden="true"
    >
      <rect x="8" y="8" width="112" height="112" rx="30" fill="currentColor" fillOpacity="0.1" />

      {/* Outer legal shield */}
      <path
        d="M64 18L31 32V58C31 79 45.8 97.5 64 104C82.2 97.5 97 79 97 58V32L64 18Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Inner frame */}
      <path
        d="M64 29L41 39V57C41 71.5 50.5 84.2 64 89.5C77.5 84.2 87 71.5 87 57V39L64 29Z"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Scale beam and pillar */}
      <line x1="64" y1="37" x2="64" y2="74" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="49" y1="44" x2="79" y2="44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

      {/* Left bowl */}
      <line x1="54" y1="44" x2="50" y2="53" stroke="currentColor" strokeWidth="2.2" />
      <line x1="42" y1="53" x2="58" y2="53" stroke="currentColor" strokeWidth="2.2" />
      <path d="M43 53H57L50 61L43 53Z" fill="none" stroke="currentColor" strokeWidth="2.2" />

      {/* Right bowl */}
      <line x1="74" y1="44" x2="78" y2="53" stroke="currentColor" strokeWidth="2.2" />
      <line x1="70" y1="53" x2="86" y2="53" stroke="currentColor" strokeWidth="2.2" />
      <path d="M71 53H85L78 61L71 53Z" fill="none" stroke="currentColor" strokeWidth="2.2" />

      {/* Link signature at base */}
      <rect x="50" y="78" width="14" height="10" rx="5" stroke="currentColor" strokeWidth="3.1" />
      <rect x="63" y="78" width="14" height="10" rx="5" stroke="currentColor" strokeWidth="3.1" />
    </svg>
  );
}
