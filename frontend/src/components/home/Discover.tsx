"use client";

import { CareerPathsDiagram } from "./CareerPathsDiagram";
import { diagramAnimations } from "../../lib/animations";
import { useTranslations } from "next-intl";

export function Discover() {
  const t = useTranslations("home");
  return (
    <section className=" bg-white py-12">
      {/* Animation Styles */}
      <style jsx>{diagramAnimations}</style>

      {/* Header */}
      <header className="py-8 text-center bg-primary">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900">
          {t("discover.title")}
        </h2>
      </header>
      <div className="container mx-auto px-4">
        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-24 items-center justify-center">
          {/* Left Image with Gradient Background */}
          <div>
            <p className="lg:text-lg max-w-md ml-auto text-gray-700">
              {t("discover.text")}
            </p>
          </div>

          {/* Right Animated Diagram */}
          <div className="pt-10">
            <CareerPathsDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
