import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hero } from "@/components/sections/Hero";
// DemoVideo is now embedded inside CTASection
import { ConceptSection } from "@/components/sections/Concept";
import { SystemModules } from "@/components/sections/SystemModules";
import { CTASection } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/Nav";
import { RequestAccessModal } from "@/components/RequestAccessModal";
// Temporarily unrendered while the page is reframed for CTO audience:
// import { IdeaEngine } from "@/components/sections/IdeaEngine";
// import { Architecture } from "@/components/sections/Architecture";
// import { PasswordGate, hasAccess } from "@/components/PasswordGate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Jungl3 — A pre-built application that installs into your AWS account",
      },
      {
        name: "description",
        content:
          "Jungl3 is a pre-built, operational application delivered as an AWS Marketplace listing. Teams start by shaping a running system instead of scaffolding a new one.",
      },
      { property: "og:title", content: "Jungl3" },
      {
        property: "og:description",
        content:
          "A pre-built, operational application that installs into your AWS account.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [requestOpen, setRequestOpen] = useState(false);
  const openRequest = () => setRequestOpen(true);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Nav onRequestAccess={openRequest} />
      <main className="relative z-10">
        <Hero onRequestAccess={openRequest} />
        <ConceptSection />
        <SystemModules />
        <CTASection onRequestAccess={openRequest} />
        <Footer onRequestAccess={openRequest} />
      </main>
      <RequestAccessModal open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
