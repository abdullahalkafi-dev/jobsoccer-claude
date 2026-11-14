import { getTranslations } from "next-intl/server";
import { StaticPage, SUPPORT_EMAIL } from "@/components/shared/StaticPage";

export async function generateMetadata() {
  const t = await getTranslations("pages");
  return { title: t("contact.metaTitle") };
}

export default async function ContactPage() {
  const t = await getTranslations("pages");
  const email = () => (
    <a className="font-semibold underline" href={`mailto:${SUPPORT_EMAIL}`}>
      {SUPPORT_EMAIL}
    </a>
  );
  return (
    <StaticPage title={t("contact.title")} intro={t("contact.intro")}>
      <p>{t.rich("contact.writeUs", { email })}</p>
      <p>{t("contact.accessibility")}</p>
    </StaticPage>
  );
}
