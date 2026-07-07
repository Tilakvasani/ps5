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



export function IsoLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src="/iso.png"
      alt="ISO 9001:2015 Certified"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

export function HaccpLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src="/haccp.png"
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

  if (cleanLabel.includes("FSSAI")) {
    return <FssaiLogo className={className || "h-8"} />;
  }
  if (cleanLabel.includes("GMP")) {
    return <GmpLogo className={className || "h-11"} />;
  }

  if (cleanLabel.includes("ISO")) {
    return <IsoLogo className={className || "h-11"} />;
  }
  if (cleanLabel.includes("HACCP")) {
    return <HaccpLogo className={className || "h-11"} />;
  }

  // Fallback — dark navy card style
  return (
    <div
      className="inline-flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 h-8"
      style={{
        background: "#0C1E39",
        border: "1.5px solid #0C1E39",
      }}
    >
      <span style={{ fontSize: "11px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.5px" }}>{label}</span>
      <span style={{ fontSize: "9px", color: "var(--or)", fontWeight: 800 }}>CERTIFIED</span>
    </div>
  );
}
