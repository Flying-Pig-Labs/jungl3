import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PasswordGate, hasAccess } from "@/components/PasswordGate";
import { Hero } from "@/components/sections/Hero";
import { ConceptSection } from "@/components/sections/Concept";
import { SystemModules } from "@/components/sections/SystemModules";
import { IdeaEngine } from "@/components/sections/IdeaEngine";
import { CTASection } from "@/components/sections/CTA";
import { Architecture } from "@/components/sections/Architecture";
import { Footer } from "@/components/sections/Footer";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to the Jungl3 — Hack in a DMZ with real beta customers" },
      {
        name: "description",
        content:
          "A hidden sandbox innovation system. Pre-wired infrastructure, simulated traffic, and real beta customers. Summer 2026.",
      },
      { property: "og:title", content: "Welcome to the Jungl3" },
      {
        property: "og:description",
        content: "Hack in a DMZ with real beta customers. Summer 2026.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasAccess()) setUnlocked(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <main className="relative z-10">
        <Hero />
        <ConceptSection />
        <SystemModules />
        <IdeaEngine />
        <Architecture />
        <CTASection />
        <Footer onLockOut={() => setUnlocked(false)} />
      </main>
    </div>
  );
}
