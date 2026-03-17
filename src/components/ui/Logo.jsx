import React from 'react';
import logoLL from '../../assets/logo.png';

export default function Logo({ className = 'w-10 h-10', color = '' }) {
  return (
    <img
      src={logoLL}
      alt="LegalLink logo"
      className={`${className} ${color} object-contain`}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}
