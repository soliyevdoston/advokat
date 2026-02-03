import React from 'react';

export default function Logo({ className = "w-10 h-10", color = "text-white" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        d="M50 10L10 30V50C10 75 50 95 50 95C50 95 90 75 90 50V30L50 10Z" 
        className={color === "text-white" ? "fill-white/20 stroke-white" : "fill-[var(--color-primary)]/10 stroke-[var(--color-primary)]"}
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M50 25V75M30 35L50 25L70 35M30 55L50 75L70 55" 
        className={color === "text-white" ? "stroke-white" : "stroke-[var(--color-primary)]"}
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
