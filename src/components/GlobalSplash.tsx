"use client";

import { useState, useEffect } from "react";
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";

export default function GlobalSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const skip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => setContentVisible(true), 50);
    }, 800);
  };

  useEffect(() => {
    // Begin fade-out with 800ms before actually unmounting the splash
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 14200);
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      // Slight delay before revealing content so fade-in starts after splash gone
      setTimeout(() => setContentVisible(true), 50);
    }, 15000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {/* Splash overlay */}
      {showSplash && (
        <div
          className="fixed inset-0 z-[9999] bg-[#0A0E1A] flex flex-col items-center justify-center"
          style={{
            transition: "opacity 0.8s ease",
            opacity: isFadingOut ? 0 : 1,
          }}
        >
          <ParticleTextEffect words={["WELCOME", "TO", "RISKCANVAS"]} stopped={isFadingOut} />
          <div
            className="absolute bottom-16 flex flex-col items-center gap-3"
            style={{
              transition: "opacity 0.4s ease",
              opacity: isFadingOut ? 0 : 1,
            }}
          >
            <svg className="animate-spin h-6 w-6 text-[#5B6BF8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-[#8B92A5] text-xs font-mono tracking-widest">LOADING</span>
          </div>
          {/* Skip button — top right corner */}
          <button
            onClick={skip}
            className="absolute top-6 right-8 text-[#8B92A5] hover:text-white text-xs font-mono tracking-widest uppercase transition-colors duration-200 flex items-center gap-1.5 group"
            style={{ opacity: isFadingOut ? 0 : 1, transition: "opacity 0.4s ease" }}
          >
            Skip Animation
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Main app content — fades in after splash */}
      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
          visibility: showSplash ? "hidden" : "visible",
        }}
      >
        {children}
      </div>
    </>
  );
}
