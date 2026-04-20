"use client";

import dynamic from "next/dynamic";
import Section from "@/components/Section";
import { useScrollStory } from "@/lib/useScrollStory";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

export default function HomePage() {
  useScrollStory();

  return (
    <main className="pb-24">
      <section id="hero" className="mx-auto max-w-6xl px-6 pt-12">
        <div className="glass p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">3D Skin Nutrition</p>
          <h1 id="hero-title" className="mt-4 text-4xl font-bold md:text-6xl">
            Fruits transform into your daily glow.
          </h1>
          <p id="hero-sub" className="mt-4 max-w-2xl text-white/75">
            A premium, Apple-style product narrative with 3D storytelling, cart, payments, and dashboard-ready APIs.
          </p>
          <button
            id="hero-cta"
            className="mt-6 rounded-full bg-gradient-to-r from-glowPink to-glowLemon px-6 py-3 font-semibold text-black"
          >
            Start Building
          </button>
          <div className="mt-8">
            <HeroScene />
          </div>
        </div>
      </section>

      <Section id="product" title="Product Details">
        <div className="glass grid gap-4 p-6 md:grid-cols-3">
          <div>
            <h3 className="font-semibold">Ingredients</h3>
            <p className="text-white/70">Vitamin C, collagen support blend, hydration complex.</p>
          </div>
          <div>
            <h3 className="font-semibold">Benefits</h3>
            <p className="text-white/70">Glow support, skin texture care, daily nutrition ritual.</p>
          </div>
          <div>
            <h3 className="font-semibold">Nutrition</h3>
            <p className="text-white/70">Zero added sugar, daily tablet format, clinically inspired mix.</p>
          </div>
        </div>
      </Section>

      <Section id="shop" title="Shop + Checkout">
        <div className="glass p-6">
          <p className="text-white/75">Cart, authentication, Razorpay checkout and order APIs are scaffolded in the FastAPI backend.</p>
        </div>
      </Section>
    </main>
  );
}
