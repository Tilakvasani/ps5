"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#051124] text-white">
        <div className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="max-w-lg rounded-3xl border border-white/10 bg-[#09142A]/80 p-8 shadow-2xl">
            <h1 className="text-4xl font-black tracking-tight text-white">Something went wrong</h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              An unexpected error occurred while loading the page. You can try again or return to the home page.
            </p>
            <pre className="mt-6 rounded-2xl bg-[#0C1E39] p-4 text-xs text-slate-400 overflow-x-auto">
              {error?.message}
            </pre>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-2xl bg-[#FF5C00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E04B00]"
              >
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
