import { Candidates } from "@/components/home/Canditates";
import { Discover } from "@/components/home/Discover";
import { Features } from "@/components/home/Features";
import FindYourNextJob from "@/components/home/FindYourNextJob";
import { GlobalProfile } from "@/components/home/GlobalProfile";
import { HeroSection } from "@/components/home/HeroSection";
import { JobCategories } from "@/components/home/JobCategories";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StatsBanner } from "@/components/home/StatsBanner";
import { JobSearch } from "@/components/search/JobSearch";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <JobSearch />
      <FindYourNextJob />
      <Discover />
      <JobCategories />
      <Features />
      <Candidates />
      <StatsBanner />
      <HowItWorks />
      <GlobalProfile />
    </main>
  );
}
