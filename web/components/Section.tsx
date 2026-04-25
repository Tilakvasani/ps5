import { ReactNode } from "react";

export default function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
      <div className="mb-16">
        <h2 className="text-sm font-black uppercase tracking-[0.6em] text-white/30">{title}</h2>
        <div className="mt-4 h-px w-24 bg-gradient-to-r from-pink-500 to-transparent" />
      </div>
      {children}
    </section>
  );
}
