import { getTranslations } from "next-intl/server";
import { StaticPage, SUPPORT_EMAIL } from "@/components/shared/StaticPage";

export async function generateMetadata() {
  const t = await getTranslations("pages");
  return { title: t("faq.metaTitle") };
}

const QUESTION_KEYS = ["quality", "video", "methodology", "requirements", "replace", "contact", "verified"] as const;

export default async function FaqPage() {
  const t = await getTranslations("pages");
  return (
    <StaticPage title={t("faq.title")}>
      {QUESTION_KEYS.map((key) => (
        <div key={key}>
          <h2 className="text-lg font-semibold text-gray-900">{t(`faq.items.${key}.q`)}</h2>
          <p className="mt-1 text-gray-700">{t(`faq.items.${key}.a`)}</p>
        </div>
      ))}
      <p>
        {t.rich("faq.more", {
          email: () => (
            <a className="font-semibold underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          ),
        })}
      </p>
    </StaticPage>
  );
}
