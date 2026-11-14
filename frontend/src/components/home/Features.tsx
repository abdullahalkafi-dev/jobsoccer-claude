import Image from "next/image";
import { useTranslations } from "next-intl";
import brainIcon from "@/assets/home/ai_brain.svg";
import videoIcon from "@/assets/home/video.svg";
import global from "@/assets/home/global.svg";
import security from "@/assets/home/security.svg";
import chart from "@/assets/home/chart.svg";
import profile from "@/assets/home/profile.svg";
import footbal from "@/assets/home/footbal.svg";
import job from "@/assets/home/job.svg";

export function Features() {
  const t = useTranslations("home");
  

  const features = [
    { icon: footbal, title: t("features.staffing.title"), text: t("features.staffing.text") },
    { icon: brainIcon, title: t("features.matching.title"), text: t("features.matching.text") },
    { icon: videoIcon, title: t("features.video.title"), text: t("features.video.text") },
    { icon: security, title: t("features.quality.title"), text: t("features.quality.text") },
    { icon: job, title: t("features.suggestions.title"), text: t("features.suggestions.text") },
    { icon: chart, title: t("features.insights.title"), text: t("features.insights.text") },
    { icon: global, title: t("features.global.title"), text: t("features.global.text") },
    { icon: profile, title: t("features.fair.title"), text: t("features.fair.text") },
  ];

  return (
    <section className="bg-[#F7F6F2]">
      <div className="py-8 text-center bg-primary">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900">
          {t("features.title")}
        </h2>
      </div>
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            return (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={40}
                      height={40}
                    />
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        <span className="block mb-1">{feature.text}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
