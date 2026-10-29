"use client";

import { House, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <section className="wii-panel max-w-lg p-8 text-center">
        <h1 className="text-2xl font-extrabold text-wii-ink-strong">Something went wrong</h1>
        <p className="mt-3 leading-relaxed">
          This channel couldn&apos;t be loaded right now. Please try again in a moment.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="wii-button">
            <House aria-hidden="true" size={18} />
            Menu
          </Link>
          <button type="button" onClick={reset} className="wii-button wii-button-primary">
            <RefreshCw aria-hidden="true" size={18} />
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
