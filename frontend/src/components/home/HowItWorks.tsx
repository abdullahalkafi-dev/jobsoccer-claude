import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const STEPS = [1, 2, 3] as const;

export function HowItWorks() {
  const t = useTranslations("home");
  return (
    <section className="bg-white py-8 lg:py-16">
      {/* Yellow Banner Header */}
      <div className="py-8 text-center bg-primary">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
          {t("how.title")}
        </h2>
      </div>

      {/* Content */}
      <div className="bg-[#F7F6F2]">
        <div className="container mx-auto px-4 py-8 lg:py-16">
          {/* Section Intro */}
          <div className="text-center mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {t("how.subtitle")}
            </h3>
            <p className="text-gray-600 max-w-xl mx-auto">
              {t("how.intro")}
            </p>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* For Candidates */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100 uppercase tracking-wide">
                {t("how.forCandidates")}
              </h4>
              <div className="space-y-8">
                {STEPS.map((n, index) => (
                  <div key={index} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-extrabold text-gray-900 text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        {t("how.step", { number: n })}
                      </p>
                      <h5 className="font-bold text-gray-900 mb-1">
                        {t(`how.candidate.step${n}.title`)}
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t(`how.candidate.step${n}.text`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Employers */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100 uppercase tracking-wide">
                {t("how.forEmployers")}
              </h4>
              <div className="space-y-8">
                {STEPS.map((n, index) => (
                  <div key={index} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-extrabold text-gray-900 text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        {t("how.step", { number: n })}
                      </p>
                      <h5 className="font-bold text-gray-900 mb-1">
                        {t(`how.employer.step${n}.title`)}
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t(`how.employer.step${n}.text`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <p className="text-gray-700 font-semibold mb-6 text-lg">
              {t("how.ready")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:scale-105 transition-transform duration-200 text-gray-900 font-semibold px-8"
              >
                <Link href="/signup">{t("how.signUpCandidate")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:scale-105 transition-transform duration-200 text-gray-900 font-semibold px-8"
              >
                <Link href="/signup">{t("how.signUpEmployer")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
