import {
  Cloud,
  Network,
  Container,
  KeyRound,
  Globe2,
  ShieldAlert,
  Lock,
  Database,
  Users,
  GitBranch,
  Activity,
  Wallet,
  Timer,
} from "lucide-react";

type Pillar = {
  id: string;
  node: string;
  title: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  bullets: string[];
};

const PILLARS: Pillar[] = [
  {
    id: "01",
    node: "OUTPOST · ACCOUNT",
    title: "Account model",
    blurb: "One AWS account dedicated to the sprint. Cleanest blast-radius boundary for cost, IAM, logs, and cleanup.",
    icon: Cloud,
    bullets: [
      "Dedicated Jungle Sandbox account",
      "Optional Demo account for customer-facing layer",
      "Sits under Organizations / Control Tower if available",
    ],
  },
  {
    id: "02",
    node: "OUTPOST · NETWORK",
    title: "Network shape",
    blurb: "One VPC across two AZs. Public, private app, and private data subnets — the classic three-tier shape.",
    icon: Network,
    bullets: [
      "Public: ALB, NAT Gateway, WAF",
      "Private app: ECS Fargate, Lambda",
      "Private data: RDS, ElastiCache, internal APIs",
    ],
  },
  {
    id: "03",
    node: "OUTPOST · RUNTIME",
    title: "Runtime",
    blurb: "ECS on Fargate as the default. No servers to babysit, fast deploys, easy per-team isolation.",
    icon: Container,
    bullets: [
      "1 cluster, 1 service per team",
      "1 ALB with host/path-based routing",
      "S3 + CloudFront for static frontends",
    ],
  },
  {
    id: "04",
    node: "BASE CAMP · ACCESS",
    title: "Builder access",
    blurb: "IAM Identity Center with federated roles. No long-lived users. Permissions boundaries do the heavy lifting.",
    icon: KeyRound,
    bullets: [
      "Roles: Jungle-Admin / Team-Builder / ReadOnly",
      "Allow ECS, ECR, Logs, S3, Lambda, DynamoDB, Bedrock",
      "Deny IAM creation outside approved templates",
    ],
  },
  {
    id: "05",
    node: "DMZ · INGRESS",
    title: "Beta customer ingress",
    blurb: "Real beta customers only ever hit the front door. Backends stay private.",
    icon: Globe2,
    bullets: [
      "Route 53 → team1.jungle.yourdomain.com",
      "Public ALB + AWS WAF + ACM TLS",
      "No SSH, no RDP, no bastion",
    ],
  },
  {
    id: "06",
    node: "DMZ · EGRESS",
    title: "Egress controls",
    blurb: "Sandbox shouldn't become an accidental data-exfil carnival. Watch what leaves.",
    icon: ShieldAlert,
    bullets: [
      "NAT Gateway for outbound",
      "VPC endpoints for S3, ECR, Logs, Secrets, STS",
      "VPC Flow Logs + optional Network Firewall",
    ],
  },
  {
    id: "07",
    node: "BASE CAMP · SECRETS",
    title: "Secrets & config",
    blurb: "Centralized credential retrieval. No GitHub secrets sprawl per team.",
    icon: Lock,
    bullets: [
      "Secrets Manager for credentials",
      "SSM Parameter Store for non-secret config",
      "Team prefixes: /jungle/team-7/*",
    ],
  },
  {
    id: "08",
    node: "STREAMS · DATA",
    title: "Data policy",
    blurb: "Synthetic, public, or scrubbed only. No production PII. No live customer data without approval.",
    icon: Database,
    bullets: [
      "Buckets: public-assets / team-artifacts / approved-datasets",
      "Aurora Serverless v2 only on approval",
      "Default to DynamoDB for team storage",
    ],
  },
  {
    id: "09",
    node: "OUTPOST · ISOLATION",
    title: "Per-team isolation",
    blurb: "Every team gets their own clean slice. Tagged for support, billing, and ruthless cleanup.",
    icon: Users,
    bullets: [
      "1 service · 1 IAM role · 1 subdomain",
      "1 S3 prefix · 1 DynamoDB namespace · 1 log group",
      "Tags: Event=Jungle, Team=N, TTL=2026-08-15",
    ],
  },
  {
    id: "10",
    node: "OUTPOST · CI/CD",
    title: "CI / CD",
    blurb: "Brutally simple. GitHub Actions deploy via OIDC into the sandbox account. No root flamethrowers handed out.",
    icon: GitBranch,
    bullets: [
      "GitHub OIDC → sandbox role",
      "Reusable workflow template",
      "Targets: ECS, S3/CloudFront, Lambda, API Gateway",
    ],
  },
  {
    id: "11",
    node: "BASE CAMP · OBSERVABILITY",
    title: "Observability",
    blurb: "One war-room dashboard. Per-team health, errors, restarts, spend, top WAF blocks.",
    icon: Activity,
    bullets: [
      "CloudWatch Logs + dashboards",
      "ALB access logs + VPC Flow Logs",
      "Optional X-Ray tracing",
    ],
  },
  {
    id: "12",
    node: "BASE CAMP · COST",
    title: "Cost controls",
    blurb: "Sprints have a talent for burning cash on forgotten GPUs and NAT traffic. Cap it up front.",
    icon: Wallet,
    bullets: [
      "Budgets at event / team / service level",
      "SCPs block giant EC2, public RDS, multi-region sprawl",
      "Anomaly alerts wired to organizers",
    ],
  },
  {
    id: "13",
    node: "STREAMS · LIFECYCLE",
    title: "Environment lifecycle",
    blurb: "All infra from CDK or Terraform. Nightly cleanup. Full teardown 24–72h after the sprint unless retained.",
    icon: Timer,
    bullets: [
      "Templates per team stack",
      "Nightly orphaned-resource sweep",
      "Auto-teardown by TTL tag",
    ],
  },
];

const GOVERNANCE = [
  "Build fast — but only inside the sandbox account",
  "Synthetic, public, or approved data only",
  "All public traffic enters through the shared ALB",
  "No public databases. No manual IAM by teams.",
  "Everything tagged with team and TTL",
  "Beta customers only see demo URLs — never the AWS console",
];

export function Architecture() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* Soft jungle wash */}
      <div
        aria-hidden
        className="absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, oklch(0.22 0.1 150 / 0.4), transparent 55%), radial-gradient(ellipse at 80% 90%, oklch(0.18 0.08 150 / 0.5), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-3 font-mono text-xs tracking-[0.4em] text-neon">
            // 04 — UNDER THE CANOPY
          </div>
          <h2 className="font-display text-4xl font-black text-gradient-headline glint sm:text-5xl">
            DMZ on AWS
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground/80">
            A dedicated AWS sandbox that behaves like a modern cloud DMZ. Public
            demo entry points at the edge. Private workloads behind them.
            Isolated team resources. Short-lived infrastructure. Strict
            separation from production.
          </p>
          <p className="mx-auto mt-3 max-w-xl font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
            Speed and realism — without exposing production
          </p>
        </div>

        {/* Architecture diagram (ASCII-ish HUD) */}
        <div className="hud-corners mb-16 rounded-md border border-border bg-card/40 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold">
              TARGET ARCHITECTURE
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
              1 ACCOUNT · 1 VPC · 2 AZ
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Tier
              label="DMZ · Public"
              tone="ember"
              items={["Route 53", "ALB + WAF", "ACM TLS", "CloudFront"]}
            />
            <Tier
              label="Outposts · Private App"
              tone="neon"
              items={["ECS Fargate", "Lambda (VPC)", "API Gateway", "ECR"]}
            />
            <Tier
              label="Streams · Private Data"
              tone="gold"
              items={["DynamoDB", "Aurora Serverless v2", "S3 (tagged)", "ElastiCache"]}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Lane
              label="Builder lane"
              path="GitHub OIDC → IAM Identity Center → Team Role → ECS / S3 / Lambda"
            />
            <Lane
              label="Beta customer lane"
              path="Browser → Route 53 → WAF → ALB → Team Service (private)"
            />
          </div>
        </div>

        {/* Pillar grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <article
              key={p.id}
              className="module-card group relative overflow-hidden rounded-md border border-border bg-card/55 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="module-icon text-neon transition-all">
                  <p.icon className="h-6 w-6" strokeWidth={1.4} />
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-gold/70">
                  {p.id} · {p.node}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.blurb}
              </p>
              <ul className="mt-4 space-y-1.5">
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 font-mono text-[11px] leading-relaxed text-foreground/80"
                  >
                    <span className="mt-[6px] inline-block h-1 w-1 flex-shrink-0 rounded-full bg-neon" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </article>
          ))}
        </div>

        {/* Governance one-pager */}
        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="hud-corners rounded-md border border-border bg-card/40 p-6 backdrop-blur-sm">
            <div className="mb-3 font-mono text-[11px] tracking-[0.3em] text-gold">
              GOVERNANCE · ONE-PAGER
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Six rules of the jungle
            </h3>
            <ul className="mt-5 space-y-3">
              {GOVERNANCE.map((g, i) => (
                <li key={g} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-neon">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/85">
                    {g}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hud-corners rounded-md border border-border bg-card/40 p-6 backdrop-blur-sm">
            <div className="mb-3 font-mono text-[11px] tracking-[0.3em] text-gold">
              WHY THIS COMPROMISE
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Friction removed. Risk bounded.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
              You get real internet-facing demos for beta customers, private
              backends, fast onboarding, decent security posture, easy
              teardown, and low operator overhead.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              You don&apos;t get perfect enterprise segregation — but that
              isn&apos;t the point of a two-day sprint. The point is to remove
              friction without creating a clown car of unbounded risk.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              <Stat k="Account" v="1" />
              <Stat k="VPC" v="1" />
              <Stat k="AZ" v="2" />
              <Stat k="Cluster" v="ECS Fargate" />
              <Stat k="Ingress" v="ALB + WAF" />
              <Stat k="Teardown" v="≤72h" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tier({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "ember" | "neon" | "gold";
}) {
  const toneCls =
    tone === "ember"
      ? "border-ember/40 text-ember"
      : tone === "gold"
        ? "border-gold/40 text-gold"
        : "border-neon/40 text-neon";
  return (
    <div className={`rounded-sm border bg-background/50 p-4 ${toneCls}`}>
      <div className="mb-3 font-mono text-[10px] tracking-[0.3em] uppercase">
        {label}
      </div>
      <ul className="space-y-1.5 font-mono text-[11px] text-foreground/85">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="opacity-60">›</span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Lane({ label, path }: { label: string; path: string }) {
  return (
    <div className="rounded-sm border border-border/70 bg-background/40 p-3">
      <div className="font-mono text-[10px] tracking-[0.25em] text-gold/80 uppercase">
        {label}
      </div>
      <div className="mt-1 font-mono text-[11px] leading-relaxed text-foreground/85">
        {path}
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-background/40 p-2">
      <div className="text-[9px] text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-[11px] text-foreground">{v}</div>
    </div>
  );
}
