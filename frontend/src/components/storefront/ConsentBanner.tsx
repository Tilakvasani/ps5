"use client";

import { useState, useEffect } from "react";
import { Shield, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ConsentPreferences {
  ad_storage: boolean;
  ad_user_data: boolean;
  ad_personalization: boolean;
  analytics_storage: boolean;
}

export default function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Read the stored consent values from localStorage
    const saved = localStorage.getItem("zupwell-consent");
    if (!saved) {
      setIsVisible(true);
    }

    // Expose a global function to let the footer reopen the banner
    (window as any).showConsentBanner = () => {
      setIsVisible(true);
    };

    return () => {
      delete (window as any).showConsentBanner;
    };
  }, []);

  const updateConsent = (granted: boolean) => {
    const state = granted ? "granted" : "denied";
    const updated = {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    };

    // Trigger update in Google tag
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", updated);
    }

    // Save choices to localStorage
    localStorage.setItem("zupwell-consent", JSON.stringify(updated));
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    updateConsent(true);
  };

  const handleCancel = () => {
    updateConsent(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[9999] max-w-md w-auto md:w-[380px] rounded-2xl border text-white shadow-2xl transition-all duration-300 animate-fade-in-up"
      style={{
        background: "rgba(5, 17, 36, 0.95)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(255, 92, 0, 0.3)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 92, 0, 0.15)",
      }}
    >
      <div className="p-6">
        {/* Banner Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center animate-pulse"
            style={{ background: "rgba(255, 92, 0, 0.15)", border: "1px solid var(--or)" }}
          >
            <Shield className="w-5 h-5 text-[#FF5C00]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-white m-0">
              Cookie Consent
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              Consent Mode v2 Compliant
            </span>
          </div>
        </div>

        {/* Banner Content */}
        <p className="text-xs text-gray-300 leading-relaxed mb-5">
          We use cookies to optimize your experience, deliver personalized advertisements, and analyze storefront traffic. By clicking <strong>Accept All</strong>, you agree to our use of tracking scripts. You can change these preferences at any time in the footer. Read our{" "}
          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-0.5 text-[#FF5C00] hover:underline font-semibold"
          >
            Privacy Policy <ExternalLink size={10} />
          </Link>
          .
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide uppercase text-gray-300 border border-slate-700 bg-slate-900/50 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 text-center py-2.5 px-4 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200"
            style={{
              background: "var(--or)",
              color: "#FFFFFF",
              boxShadow: "0 0 10px rgba(255, 92, 0, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 92, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "0 0 10px rgba(255, 92, 0, 0.3)";
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
