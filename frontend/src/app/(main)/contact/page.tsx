import { StaticPage, SUPPORT_EMAIL } from "@/components/shared/StaticPage";

export const metadata = { title: "Contact | JOBSOCCER" };

export default function ContactPage() {
  return (
    <StaticPage title="Contact" intro="Questions, feedback or need help with your profile? We are happy to help.">
      <p>
        Write to us at{" "}
        <a className="font-semibold underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <p>
        Candidates who need an adjustment for accessibility reasons when recording their video can also contact us at
        the same address.
      </p>
    </StaticPage>
  );
}
