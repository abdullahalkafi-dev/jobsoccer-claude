import { getTranslations } from "next-intl/server";
import { StaticPage, SUPPORT_EMAIL } from "@/components/shared/StaticPage";

export async function generateMetadata() {
  const t = await getTranslations("pages");
  return { title: t("terms.metaTitle") };
}

export default async function TermsPage() {
  const t = await getTranslations("pages");
  return (
    <StaticPage title={t("terms.title")} intro={t("terms.intro")}>
      <p>
        {t.rich("terms.question", {
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
