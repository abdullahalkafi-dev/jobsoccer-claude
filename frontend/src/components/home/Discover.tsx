"use client";

import { CareerPathsDiagram } from "./CareerPathsDiagram";
import { diagramAnimations } from "../../lib/animations";

export function Discover() {
  return (
    <section className=" bg-white py-12">
      {/* Animation Styles */}
      <style jsx>{diagramAnimations}</style>

      {/* Header */}
      <header className="py-8 text-center bg-primary">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900">
          What You Will Discover Here
        </h2>
      </header>
      <div className="container mx-auto px-4">
        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-24 items-center justify-center">
          {/* Left Image with Gradient Background */}
          <div>
            <p className="lg:text-lg max-w-md ml-auto text-gray-700">
              JOBSOCCER is the first platform built exclusively for the soccer
              world. Whether you&lsquo;re a player looking for your next club, a coach
              seeking new opportunities, or an organization searching for the
              right talent everything you need is in one place. No more relying
              on personal contacts or word of mouth. Just a smarter, fairer way
              to connect soccer professionals worldwide.
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
