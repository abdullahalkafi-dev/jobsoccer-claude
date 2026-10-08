import Image from "next/image";
import brainIcon from "@/assets/home/ai_brain.svg";
import videoIcon from "@/assets/home/video.svg";
import global from "@/assets/home/global.svg";
import security from "@/assets/home/security.svg";
import chart from "@/assets/home/chart.svg";
import profile from "@/assets/home/profile.svg";
import footbal from "@/assets/home/footbal.svg";
import job from "@/assets/home/job.svg";

export function Features() {
  const features = [
    {
      icon: footbal,
      title: "Specialized in Soccer Staffing",
      lists: [
        "Unlike generic job boards, JOBSOCCER is built 100% for the soccer ecosystem. Every feature, every tool, every connection is designed with the beautiful game in mind.",
      ],
    },
    {
      icon: brainIcon,
      title: "AI-Powered Talent Matching",
      lists: [
        "Our smart algorithm analyzes profiles, skills and requirements to connect the right candidates with the right employers faster and more accurately than any manual search.",
      ],
    },
    {
      icon: videoIcon,
      title: "AI Video Interview Evaluation",
      lists: [
        "Go beyond the CV. Candidates upload their pre-video interviews that showcase their personality, communication and real-world skills, giving employers a true picture before the first meeting.",
      ],
    },
    {
      icon: security,
      title: "AI Profile Quality Score",
      lists: [
        "Our AI evaluates every profile for completeness and strength, helping candidates present their best selves and giving employers confidence in what they see.",
      ],
    },
    {
      icon: job,
      title: "AI Powered Job Suggestions",
      lists: [
        "No more endless scrolling. JOBSOCCER delivers personalized job recommendations directly to players and staff based on their profile, experience and preferences.",
      ],
    },
    {
      icon: chart,
      title: "AI Data-Driven Market Insights",
      lists: [
        "Stay ahead of the game. Our AI tracks rising talent trends, in-demand roles and regional opportunities so clubs and candidates always know where the market is heading.",
      ],
    },
    {
      icon: global,
      title: "Global Access & Visibility",
      lists: [
        "Your next opportunity shouldn't depend on who you know. JOBSOCCER gives equal visibility to candidates from every country, every league and every level of the game.",
      ],
    },
    {
      icon: profile,
      title: "Fair, Transparent and Structured Process",
      lists: [
        "A clear, structured application system that reduces bias, promo.",
      ],
    },
  ];

  return (
    <section className="bg-[#F7F6F2]">
      <div className="py-8 text-center bg-primary">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900">
          Why is Jobsoccer unique?
        </h2>
      </div>
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            return (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <Image
                      src={feature.icon}
                      alt={feature.title + " icon"}
                      width={40}
                      height={40}
                    />
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.lists.map((item, idx) => (
                          <span key={idx} className="block mb-1">
                            {item}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
