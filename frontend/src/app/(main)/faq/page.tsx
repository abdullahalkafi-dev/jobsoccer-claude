import { StaticPage, SUPPORT_EMAIL } from "@/components/shared/StaticPage";

export const metadata = { title: "FAQ | JOBSOCCER" };

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: "What is the Profile Quality Score?",
    a: "A score out of 100 that shows how complete, verified and up to date your profile is. You see the number; employers see stars and a level. It does not measure your professional ability.",
  },
  {
    q: "What is the video interview?",
    a: "You answer the same set of questions as every other candidate for your position, in one video of up to 6:30 minutes. The answers are transcribed, summarised and scored by AI to help employers review them. Scores support, and never replace, the employer's judgment.",
  },
  {
    q: "Is the methodology video required?",
    a: "No, it is optional for on-field and office staff. Adding it gives you extra Profile Quality points and helps you stand out.",
  },
  {
    q: "What are the video requirements?",
    a: "MP4 or MOV, at least 720p, up to 600 MB, recorded with a fixed camera in a quiet place. You may record your answers separately and combine them into one video before uploading.",
  },
  {
    q: "Can I replace my videos?",
    a: "Your interview and methodology videos are locked for 3 months after you submit them. After that you can upload an updated version.",
  },
  {
    q: "Who can see my contact details?",
    a: "Employers see your contact details only after you accept their access request.",
  },
  {
    q: "How do I get verified?",
    a: "Use \"Add Verification Badge\" on your profile to request identity verification, and upload a document for your licences, education or work history. Verified items add points to your score.",
  },
];

export default function FaqPage() {
  return (
    <StaticPage title="Frequently Asked Questions">
      {QUESTIONS.map((item) => (
        <div key={item.q}>
          <h2 className="text-lg font-semibold text-gray-900">{item.q}</h2>
          <p className="mt-1 text-gray-700">{item.a}</p>
        </div>
      ))}
      <p>
        More questions? Write to{" "}
        <a className="font-semibold underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </StaticPage>
  );
}
