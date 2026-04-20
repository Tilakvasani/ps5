"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollStory() {
  useEffect(() => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=700",
        scrub: 1,
        pin: true
      }
    });

    timeline
      .to("#hero-title", { y: -30, opacity: 0.6, duration: 1 })
      .to("#hero-sub", { y: -20, opacity: 0.3, duration: 1 }, 0)
      .to("#hero-cta", { y: -10, opacity: 0.1, duration: 1 }, 0.1);

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, []);
}
