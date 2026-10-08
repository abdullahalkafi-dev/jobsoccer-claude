"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
    
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-5xl">
          {error.message ? error.message : "Something went wrong!"}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Oops, it looks like something went wrong while trying to load the
          page.
        </p>
        <div className="mt-6">
          <button
            onClick={() => reset()}
            className="cursor-pointer inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-amber-300"
          >
            Try Again
          </button>
          <p className="mt-4 text-sm text-muted-foreground">
            Or you can{" "}
            <Link href="/" className="underline">
              go back to the homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
