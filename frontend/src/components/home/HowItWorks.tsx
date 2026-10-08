import Link from "next/link";
import { Button } from "@/components/ui/button";

const candidateSteps = [
  {
    step: "Step 1",
    title: "Create Your Profile",
    description:
      "Sign up and build your dynamic professional profile. Add your experience, skills, certifications and upload your video showcase. Let your profile do the talking.",
  },
  {
    step: "Step 2",
    title: "Get Discovered or Apply",
    description:
      "Browse hundreds of job listings across every level of the game. Apply directly or let our AI match you with the right opportunities based on your profile.",
  },
  {
    step: "Step 3",
    title: "Connect and Get Hired",
    description:
      "Message clubs, agents and employers directly. Watch interview requests come to you. Your next soccer career move starts here.",
  },
];

const employerSteps = [
  {
    step: "Step 1",
    title: "Create Your Organization Profile",
    description:
      "Set up your club, academy, agency or university profile. Tell the soccer world who you are and what you're looking for.",
  },
  {
    step: "Step 2",
    title: "Post Jobs or Search Talent",
    description:
      "Post your openings on our job board or browse our global database of verified candidates — players, coaches, analysts, office staff and more.",
  },
  {
    step: "Step 3",
    title: "Shortlist, Watch & Hire",
    description:
      "Review video interviews, shortlist your favorites, request access to full profiles and connect directly with the talent that fits your vision.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-8 lg:py-16">
      {/* Yellow Banner Header */}
      <div className="py-8 text-center bg-primary">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
          How It Works
        </h2>
      </div>

      {/* Content */}
      <div className="bg-[#F7F6F2]">
        <div className="container mx-auto px-4 py-8 lg:py-16">
          {/* Section Intro */}
          <div className="text-center mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Getting Started is Simple
            </h3>
            <p className="text-gray-600 max-w-xl mx-auto">
              Whether you&apos;re looking for your next opportunity or your next
              signing you&apos;re three steps away.
            </p>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* For Candidates */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100 uppercase tracking-wide">
                For Candidates
              </h4>
              <div className="space-y-8">
                {candidateSteps.map((item, index) => (
                  <div key={index} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-extrabold text-gray-900 text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        {item.step}
                      </p>
                      <h5 className="font-bold text-gray-900 mb-1">
                        {item.title}
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Employers */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100 uppercase tracking-wide">
                For Employers
              </h4>
              <div className="space-y-8">
                {employerSteps.map((item, index) => (
                  <div key={index} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center font-extrabold text-gray-900 text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        {item.step}
                      </p>
                      <h5 className="font-bold text-gray-900 mb-1">
                        {item.title}
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <p className="text-gray-700 font-semibold mb-6 text-lg">
              Ready to get started?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:scale-105 transition-transform duration-200 text-gray-900 font-semibold px-8"
              >
                <Link href="/signup">
                  Sign Up as a Candidate
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:scale-105 transition-transform duration-200 text-gray-900 font-semibold px-8"
              >
                <Link href="/signup">Sign Up as an Employer</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
