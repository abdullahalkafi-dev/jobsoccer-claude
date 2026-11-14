import { useTranslations } from "next-intl";

const PreRecordedVideoInterviewSection = () => {
  const t = useTranslations("candidates.preRecorded");
  return (
  <section className="my-8">
    <div className="py-8 text-center bg-primary">
      <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900">
        {t("title")}
      </h2>
    </div>

    <div className="max-w-6xl mx-auto py-10 md:py-14 px-4 md:px-8 lg:px-16 space-y-8 text-gray-900">
      <p className="leading-relaxed">
        {t("intro")}
      </p>

      <ul className="list-disc pl-8 ">
        <li>
          {t("bullet")}
        </li>
      </ul>
    </div>
  </section>
  );
};

export default PreRecordedVideoInterviewSection;
