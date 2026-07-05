import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--dk)" }}>
      <div className="text-center">
        <h1
          className="text-[10rem] font-black leading-none"
          style={{
            color: "var(--or)",
            letterSpacing: "-0.05em",
          }}
        >
          404
        </h1>
        <h2 className="text-2xl font-black mt-2" style={{ color: "#627d98" }}>
          Page not found
        </h2>
        <p className="mt-2 max-w-sm mx-auto" style={{ color: "#8F9CAE" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="zbtn-or mt-8 inline-block"
          style={{ padding: "12px 32px" }}
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}

