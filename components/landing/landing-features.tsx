'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileStack,
  Radio,
  FileEdit,
  Package,
  Bell,
  Webhook,
  LayoutTemplate,
  Calendar,
  Search,
  Bot,
  MessageCircle,
} from 'lucide-react';
import { useT } from '@/components/locale-provider';

const featureKeys = [
  { icon: FileStack, titleKey: 'landing.features.feature1Title', descKey: 'landing.features.feature1Desc' },
  { icon: Radio, titleKey: 'landing.features.feature2Title', descKey: 'landing.features.feature2Desc' },
  { icon: FileEdit, titleKey: 'landing.features.feature3Title', descKey: 'landing.features.feature3Desc' },
  { icon: Bot, titleKey: 'landing.features.feature4Title', descKey: 'landing.features.feature4Desc' },
  { icon: LayoutTemplate, titleKey: 'landing.features.feature5Title', descKey: 'landing.features.feature5Desc' },
  { icon: Calendar, titleKey: 'landing.features.feature6Title', descKey: 'landing.features.feature6Desc' },
  { icon: Search, titleKey: 'landing.features.feature7Title', descKey: 'landing.features.feature7Desc' },
  { icon: Bell, titleKey: 'landing.features.feature8Title', descKey: 'landing.features.feature8Desc' },
  { icon: Webhook, titleKey: 'landing.features.feature9Title', descKey: 'landing.features.feature9Desc' },
  { icon: Package, titleKey: 'landing.features.feature10Title', descKey: 'landing.features.feature10Desc' },
  { icon: MessageCircle, titleKey: 'landing.features.feature11Title', descKey: 'landing.features.feature11Desc' },
];

export function LandingFeatures() {
  const t = useT();
  return (
    <section
      id="features"
      className="border-b border-border/60 py-20 sm:py-28 lg:py-32 bg-muted/30"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-8">
        <h2 id="features-heading" className="landing-heading text-center text-foreground">
          {t('landing.features.heading')}
        </h2>
        <p className="landing-subheading mx-auto mt-5 text-center">
          {t('landing.features.subheading')}
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.titleKey} className="landing-card group p-6 sm:p-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                  <Icon className="h-6 w-6" />
                </div>
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-lg font-semibold leading-snug sm:text-xl">
                    {t(f.titleKey)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {t(f.descKey)}
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
