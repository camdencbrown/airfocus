import Link from "next/link";
import {
  LayoutGrid,
  Target,
  MessageSquare,
  TrendingUp,
  CalendarRange,
  Users,
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "Board & List Views",
    description:
      "Organize work your way with flexible board, table, list, and timeline views. Drag-and-drop to reprioritize instantly.",
  },
  {
    icon: TrendingUp,
    title: "Priority Scoring",
    description:
      "Built-in RICE, ICE, Value/Effort, and MoSCoW frameworks. Make data-driven decisions about what to build next.",
  },
  {
    icon: Target,
    title: "OKR Tracking",
    description:
      "Set objectives and measurable key results. Track progress in real-time and keep your team aligned on goals.",
  },
  {
    icon: MessageSquare,
    title: "Feedback Collection",
    description:
      "Capture feedback from users, customers, and stakeholders. Vote, tag, and link feedback to your roadmap.",
  },
  {
    icon: CalendarRange,
    title: "Timeline & Roadmaps",
    description:
      "Visualize your product roadmap on a timeline. Communicate plans clearly with stakeholders and the team.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Comments, activity logs, and real-time updates. Everyone stays in sync with what matters most.",
  },
];

const stats = [
  { value: "10x", label: "Faster prioritization" },
  { value: "100%", label: "Team alignment" },
  { value: "50%", label: "Less time in meetings" },
  { value: "3x", label: "Shipping velocity" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              F
            </div>
            <span className="text-lg font-semibold">Focus</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-8">
            <Zap className="h-3 w-3 text-primary" />
            Product management, reimagined
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Product decisions,
            <br />
            <span className="text-primary">made clear.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Focus is the strategic product management platform that helps teams
            prioritize what matters, track OKRs, collect feedback, and ship the
            right features with confidence.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Free forever for small teams. No credit card required.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need to ship great products
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From ideation to delivery, Focus gives your team the tools to make
            better product decisions together.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How Focus works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to better product management.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Capture everything",
                description:
                  "Collect ideas, feedback, and feature requests from every channel. Nothing gets lost.",
              },
              {
                step: "02",
                title: "Prioritize with data",
                description:
                  "Score and rank with proven frameworks. Let data drive your roadmap decisions.",
              },
              {
                step: "03",
                title: "Align and ship",
                description:
                  "Track OKRs, share roadmaps, and keep everyone focused on what moves the needle.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
          <blockquote className="text-xl font-medium max-w-2xl mx-auto">
            &ldquo;Focus transformed how our product team works. We went from endless debates
            to data-driven decisions in a matter of days.&rdquo;
          </blockquote>
          <div className="mt-4 text-sm text-muted-foreground">
            Product teams everywhere
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl bg-primary p-12 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-white/5" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to focus on what matters?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
              Join thousands of product teams who use Focus to build better
              products, faster.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-primary px-8 py-3.5 text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
              >
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Setup in 2 minutes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
              F
            </div>
            <span className="text-sm font-medium">Focus</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> SOC 2 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> 99.9% Uptime
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Focus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
