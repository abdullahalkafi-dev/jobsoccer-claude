"use client";

import Image from "next/image";
import line from "@/assets/line.png";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import bg from "@/assets/hero-banner.webp";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("home");
  const { user, token } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user && !!token;

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2  gap-8 items-center">
          {/* Left Content */}
          <div className="hidden md:block space-y-8 text-center lg:text-left pt-15">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                <span className="relative inline-block">
                  {t("hero.line1a")}
                  <Image
                    src={line}
                    alt={t("hero.underlineAlt")}
                    className="absolute -bottom-2 left-0 w-full h-auto"
                  />
                </span>{" "}
                {t("hero.line1b")}
              </h1>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                {t("hero.line2")}
              </h1>
            </div>

            {!isAuthenticated && (
              <div className="flex flex-row gap-2 justify-center lg:justify-start">
                <Button
                  asChild
                  className=" md:min-w-[200px] bg-yellow-300 hover:scale-105 transition-transform duration-200"
                >
                  <Link href="/signup">{t("hero.signUp")}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Right Image */}
          <div
            className="relative pt-15"
            style={{
              background:
                "radial-gradient(circle,rgba(230, 161, 101, 1) 21%, rgba(255, 255, 255, 1) 76%)",
            }}
          >
            <div className="absolute inset-0 rounded-lg pt-8" />
            <div className="relative z-10">
              <Image
                src={bg}
                alt={t("hero.imageAlt")}
                className="h-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
