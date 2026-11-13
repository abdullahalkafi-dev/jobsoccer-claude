import { StaticPage } from "@/components/shared/StaticPage";

export const metadata = { title: "About Us | JOBSOCCER" };

export default function AboutPage() {
  return (
    <StaticPage
      title="About Us"
      intro="JOBSOCCER is the recruitment platform built specifically for soccer."
    >
      <p>
        Using AI-powered matching, video analysis and performance data, we help employers hire faster and more
        efficiently, while giving candidates worldwide the visibility and fair chance they deserve.
      </p>
      <p>
        Clubs, academies, schools, universities and agents post jobs and search candidates. Players, coaches and
        office staff build a profile, record a video interview and get discovered.
      </p>
      <p>
        Every candidate for the same position answers the same questions, so everyone is evaluated on equal terms. The
        AI assessment supports, and never replaces, the employer&apos;s own judgment.
      </p>
    </StaticPage>
  );
}
