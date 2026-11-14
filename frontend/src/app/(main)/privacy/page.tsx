import { getTranslations } from "next-intl/server";
import { StaticPage, SUPPORT_EMAIL } from "@/components/shared/StaticPage";

export async function generateMetadata() {
  const t = await getTranslations("pages");
  return { title: t("privacy.metaTitle") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("pages");
  return (
    <StaticPage title={t("privacy.title")} intro={t("privacy.intro")}>
      <p>
        {t.rich("privacy.question", {
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
