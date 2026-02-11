import {
  LandingNav,
  LandingHero,
  LandingProblem,
  LandingSolution,
  LandingForTeams,
  LandingFeatures,
  LandingHowItWorks,
  LandingOpenSource,
  LandingCta,
  LandingFooter,
} from './index';

export function LandingView() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LandingProblem />
        <LandingSolution />
        <LandingForTeams />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingOpenSource />
        <LandingCta />
        <LandingFooter />
      </main>
    </div>
  );
}
