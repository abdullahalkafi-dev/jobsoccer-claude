import { StaticPage, SUPPORT_EMAIL } from "@/components/shared/StaticPage";

export const metadata = { title: "Terms of Use | JOBSOCCER" };

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Use" intro="Our Terms of Use are being finalised and will be published here.">
      <p>
        If you have a question in the meantime, write to{" "}
        <a className="font-semibold underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </StaticPage>
  );
}
