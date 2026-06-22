import React from 'react';

export default function Logo({ size = 40, showBackground = true, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200" 
      width={size} 
      height={size} 
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Background Rounded Square */}
      {showBackground && (
        <rect width="200" height="200" rx="55" fill="#FAF9F6" />
      )}
      
      {/* Left Leg (Cream Capsule) */}
      <rect 
        x="72" 
        y="42" 
        width="28" 
        height="90" 
        rx="14" 
        transform="rotate(-30 86 87)" 
        fill="#F3EFE9" 
      />
      
      {/* Right Leg (Purple/Blue Capsule) */}
      <rect 
        x="98" 
        y="32" 
        width="28" 
        height="110" 
        rx="14" 
        transform="rotate(30 112 87)" 
        fill="#919BFC" 
      />
      
      {/* Dark Blue Teardrop */}
      <path 
        d="M90 92 C90 92 72 120 72 138 C72 150 80 158 92 158 C104 158 112 150 112 138 C112 120 90 92 90 92 Z" 
        fill="#0C1126" 
      />
    </svg>
  );
}
