"use client";
import React from "react";

export function FssaiLogo({ className = "h-8" }: { className?: string }) {
  return (
    <img
      src="/fssai.png"
      alt="FSSAI Certified"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

export function GmpLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src="/gmp.png"
      alt="GMP Certified"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

export function FsscLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src="/fssc.png"
      alt="FSSC 22000 Certified"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

export function IsoLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src="/iso.svg"
      alt="ISO Certified"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

export function HaccpLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src="/haccp.svg"
      alt="HACCP Certified"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

interface CertLogoProps {
  label: string;
  className?: string;
}

export function CertLogo({ label, className }: CertLogoProps) {
  const cleanLabel = label.toUpperCase();

  // We assign custom, visually balanced heights to match the FSSAI logo weight
  if (cleanLabel.includes("FSSAI")) {
    return <FssaiLogo className={`h-8 ${className || ""}`} />;
  }
  if (cleanLabel.includes("GMP")) {
    return <GmpLogo className={`h-11 ${className || ""}`} />;
  }
  if (cleanLabel.includes("FSSC") || cleanLabel.includes("22000")) {
    return <FsscLogo className={`h-11 ${className || ""}`} />;
  }
  if (cleanLabel.includes("ISO")) {
    return <IsoLogo className={`h-11 ${className || ""}`} />;
  }
  if (cleanLabel.includes("HACCP")) {
    return <HaccpLogo className={`h-11 ${className || ""}`} />;
  }

  // Fallback
  return (
    <div className="inline-flex items-center gap-1 shrink-0 border border-[#E8E2D9] rounded-lg px-2.5 py-0.5 bg-[#FCFAF6] h-7">
      <span className="text-[11px] font-bold text-[#001c54]">{label}</span>
      <span className="text-[9px] text-[#EB9220] font-semibold">Certified</span>
    </div>
  );
}
