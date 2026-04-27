import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] flex items-center justify-center px-6">
      <div className="text-center">
        <h1
          className="text-[10rem] font-black leading-none"
          style={{
            background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </h1>
        <h2 className="text-2xl font-display font-black text-[#111827] mt-2">
          Page not found
        </h2>
        <p className="text-[#6B7280] mt-2 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block bg-[#F47C41] hover:bg-[#d9673a] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
