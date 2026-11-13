import { StaticPage, SUPPORT_EMAIL } from "@/components/shared/StaticPage";

export const metadata = { title: "Privacy Policy | JOBSOCCER" };

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" intro="Our Privacy Policy is being finalised and will be published here.">
      <p>
        If you have a question about your data in the meantime, write to{" "}
        <a className="font-semibold underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </StaticPage>
  );
}
