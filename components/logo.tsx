"use client";

import Image from "next/image";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
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
 * Sizes:
 * - "sm": h-8 (compact, mobile navigation)
 * - "md": h-12 (standard, icon usage)
 * - "lg": h-20 (large, page headers)
 * - "xl": h-32 (extra large, hero sections)
 */
export function Logo({
  variant = "icon",
  size = "md",
  className = "",
  alt = "eduvia",
}: LogoProps) {
  // Size mappings: { tailwindClass, intrinsicWidth, intrinsicHeight }
  const sizeMap = {
    sm: { height: "h-8", width: 32, heightPx: 32 },
    md: { height: "h-12", width: 48, heightPx: 48 },
    lg: { height: "h-20", width: 240, heightPx: 90 },
    xl: { height: "h-32", width: 300, heightPx: 110 },
  };

  const sizeConfig = sizeMap[size];

  // Icon logo (full size variants to maintain aspect ratio)
  if (variant === "icon") {
    return (
      <Image
        src="/assets/eduvia_logo_only.png"
        alt={alt}
        width={sizeConfig.width}
        height={sizeConfig.heightPx}
        className={`${sizeConfig.height} w-auto ${className}`}
        priority
      />
    );
  }

  // Full text logo with tagline
  return (
    <Image
      src="/assets/eduvia_title_only.png"
      alt={`${alt} - Campus. Connect. Succeed.`}
      width={sizeConfig.width}
      height={sizeConfig.heightPx}
      className={`${sizeConfig.height} w-auto ${className}`}
      priority
    />
  );
}

/**
 * Responsive Logo Component
 * Automatically switches between full and icon based on screen width
 * Full: desktop (md and up), Icon: mobile (below md)
 */
export function ResponsiveLogo({
  size = "md",
  className = "",
  alt = "eduvia",
}: Omit<LogoProps, "variant">) {
  return (
    <>
      {/* Icon for mobile */}
      <div className="md:hidden">
        <Logo variant="icon" size={size} className={className} alt={alt} />
      </div>
      {/* Full text for desktop */}
      <div className="hidden md:block">
        <Logo variant="full" size={size} className={className} alt={alt} />
      </div>
    </>
  );
}
