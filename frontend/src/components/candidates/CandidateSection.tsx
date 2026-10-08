import CandidateCard from "@/components/cards/CandidateCard";
import { Button } from "@/components/ui/button";
import { ICandidate } from "@/types/user";
import Link from "next/link";

interface CandidateSectionProps {
  title: string;
  candidates?: ICandidate[];
  searchRole: string;
}

const CandidateSection: React.FC<CandidateSectionProps> = ({
  title,
  candidates,
  searchRole,
}) => {
  if (!candidates || candidates.length === 0) return null;

  return (
    <section className="my-8">
      <div className="flex items-center justify-between py-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
        <Button
          asChild
          className="bg-yellow-300  hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3"
        >
          <Link
            href={`/candidates/search?role=${encodeURIComponent(searchRole)}`}
          >
            See All
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {candidates.map((candidate) => (
          <CandidateCard key={candidate._id} candidate={candidate} />
        ))}
      </div>
    </section>
  );
};

export default CandidateSection;
