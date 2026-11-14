import { getTranslations } from "next-intl/server";
import { StaticPage } from "@/components/shared/StaticPage";

export async function generateMetadata() {
  const t = await getTranslations("pages");
  return { title: t("about.metaTitle") };
}

export default async function AboutPage() {
  const t = await getTranslations("pages");
  return (
    <StaticPage title={t("about.title")} intro={t("about.intro")}>
      <p>{t("about.p1")}</p>
      <p>{t("about.p2")}</p>
      <p>{t("about.p3")}</p>
    </StaticPage>
  );
}
