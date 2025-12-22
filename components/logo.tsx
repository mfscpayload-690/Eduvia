"use client";

import Image from "next/image";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alt?: string;
}

/**
 * Logo Component - Centralized branding
 * 
 * Variants:
 * - "full": Complete logo with "Eduvia — Campus. Connect. Succeed." text
 * - "icon": Icon-only lowercase "e" mark
 * 
 * Sizes (constrained max-height):
 * - "sm": h-6 (24px - compact navbar on mobile)
 * - "md": h-8 (32px - standard navbar)
 * - "lg": h-10 (40px - larger displays)
 * - "xl": h-16 (64px - large displays)
 * - "2xl": h-24 (96px - hero sections, login page)
 */
export function Logo({
  variant = "icon",
  size = "md",
  className = "",
  alt = "eduvia",
}: LogoProps) {
  // Size mappings with constrained heights
  const sizeMap = {
    sm: "h-6",   // 24px - mobile navbar
    md: "h-8",   // 32px - desktop navbar  
    lg: "h-10",  // 40px - larger displays
    xl: "h-16",  // 64px - large displays
    "2xl": "h-24", // 96px - hero/login
  };

  const sizeClass = sizeMap[size];

  // Icon logo
  if (variant === "icon") {
    return (
      <Image
        src="/assets/eduvia_logo_only.png"
        alt={alt}
        width={200}
        height={200}
        className={`${sizeClass} w-auto object-contain ${className}`}
        priority
      />
    );
  }

  // Full text logo with tagline
  return (
    <Image
      src="/assets/eduvia_title_only.png"
      alt={`${alt} - Campus. Connect. Succeed.`}
      width={400}
      height={150}
      className={`${sizeClass} w-auto object-contain ${className}`}
      priority
    />
  );
}

/**
 * Responsive Logo Component
 * Shows full logo with tagline on all screen sizes
 * Properly sized for navbar context
 */
export function ResponsiveLogo({
  className = "",
  alt = "eduvia",
}: { className?: string; alt?: string }) {
  return (
    <>
      {/* Logo for mobile navbar */}
      <div className="md:hidden">
        <Logo variant="full" size="md" className={className} alt={alt} />
      </div>
      {/* Larger logo for desktop navbar */}
      <div className="hidden md:block">
        <Logo variant="full" size="lg" className={className} alt={alt} />
      </div>
    </>
  );
}
