import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F1FAFF] flex items-center justify-center px-6">
      <div className="text-center">
        <h1
          className="text-[10rem] font-black leading-none"
          style={{
            background: "#45B08C",
            }}
        >
          404
        </h1>
        <h2 className="text-2xl font-black text-[#1D3557] mt-2">
          Page not found
        </h2>
        <p className="text-[#4A6A82] mt-2 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block bg-[#45B08C] hover:bg-[#389475] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
