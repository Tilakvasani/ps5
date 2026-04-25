"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { store } from "./store";

gsap.registerPlugin(ScrollTrigger);

export function useScrollStory() {
  useEffect(() => {
    // Sync scroll progress to global store
    ScrollTrigger.create({
      trigger: "main",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        store.scrollProgress = self.progress;
      },
    });

    // Hero Animations
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    heroTl
      .to("#hero-title", { y: -100, opacity: 0, scale: 0.8, ease: "none" })
      .to("#hero-sub", { y: -50, opacity: 0, ease: "none" }, 0)
      .to("#hero-tag", { y: -150, opacity: 0, ease: "none" }, 0)
      .to("#hero-cta-wrapper", { y: -30, opacity: 0, ease: "none" }, 0);

    // Section Transitions (Change Theme Color in Store)
    const sections = [
      { id: "#molecular", color: "#4de1ff" }, // Cyan
      { id: "#technology", color: "#ffd74a" }, // Yellow
      { id: "#shop", color: "#ff4d77" }, // Pink (Back to original)
    ];

    sections.forEach((s) => {
      ScrollTrigger.create({
        trigger: s.id,
        start: "top center",
        onEnter: () => { store.themeColor = s.color; },
        onEnterBack: () => { store.themeColor = s.color; },
      });
    });

    // Fade in sections
    const sectionElements = document.querySelectorAll("section");
    sectionElements.forEach((section) => {
      if (section.id === "hero") return;

      gsap.from(section, {
        opacity: 0,
        y: 100,
        scale: 0.95,
        duration: 1.5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none reverse",
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);
}
