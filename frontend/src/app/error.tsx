"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("pages");

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("error.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("error.description")}
        </p>
        {error.message && (
          <p className="mt-2 text-xs text-muted-foreground break-words">
            {error.message}
          </p>
        )}
        <div className="mt-6">
          <button
            onClick={() => reset()}
            className="cursor-pointer inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-amber-300"
          >
            {t("error.tryAgain")}
          </button>
          <p className="mt-4 text-sm text-muted-foreground">
            {t.rich("error.orGoHome", {
              link: (chunks) => (
                <Link href="/" className="underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
