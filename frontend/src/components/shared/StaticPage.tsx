import React from "react";

/** Simple centred text page used by About, FAQ, Contact, Terms and Privacy. */
export function StaticPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-12 min-h-[60vh]">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        {intro && <p className="text-gray-700 text-lg mb-8">{intro}</p>}
        <div className="space-y-6 text-gray-800 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export const SUPPORT_EMAIL = "info@jobsoccer.com";
