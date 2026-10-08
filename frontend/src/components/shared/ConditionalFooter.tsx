"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter = pathname === "/messages";

  if (hideFooter) return null;

  return <Footer />;
}
