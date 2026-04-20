import { ReactNode } from "react";

export default function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-6 py-20">
      <h2 className="mb-6 text-3xl font-semibold md:text-4xl">{title}</h2>
      {children}
    </section>
  );
}
