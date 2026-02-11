'use client';

import { CardContent, CardTitle } from '@/components/ui/card';
import { Building2, HardHat, ClipboardList, Briefcase } from 'lucide-react';
import { useT } from '@/components/locale-provider';

const teamKeys = [
  { icon: Building2, titleKey: 'landing.forTeams.gcTitle', descKey: 'landing.forTeams.gcDesc' },
  { icon: HardHat, titleKey: 'landing.forTeams.subTitle', descKey: 'landing.forTeams.subDesc' },
  { icon: ClipboardList, titleKey: 'landing.forTeams.pmTitle', descKey: 'landing.forTeams.pmDesc' },
  { icon: Briefcase, titleKey: 'landing.forTeams.ownerTitle', descKey: 'landing.forTeams.ownerDesc' },
];

export function LandingForTeams() {
  const t = useT();
  return (
    <section className="border-b border-border/60 bg-muted/20 py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-8">
        <h2 className="landing-heading text-center text-foreground">
          {t('landing.forTeams.heading')}
        </h2>
        <p className="landing-subheading mx-auto mt-5 text-center">
          {t('landing.forTeams.subheading')}
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamKeys.map((team) => {
            const Icon = team.icon;
            return (
              <div key={team.titleKey} className="landing-card group p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                  <Icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-lg font-semibold">{t(team.titleKey)}</CardTitle>
                <CardContent className="p-0 pt-3">
                  <p className="text-muted-foreground leading-relaxed">
                    {t(team.descKey)}
                  </p>
                </CardContent>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
