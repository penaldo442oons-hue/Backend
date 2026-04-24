import { Link } from "react-router-dom";
import WelpLogo from "../components/WelpLogo";

const features = [
  {
    title: "AI workspace",
    desc: "Replit-style chat plus structured output: summaries, solutions, code, and next steps.",
  },
  {
    title: "Human expert support",
    desc: "Escalate complex projects to admins for custom handling and guidance.",
  },
  {
    title: "Smart escalation",
    desc: "Requests move to admins when AI reaches limits, scope is complex, or help is requested.",
  },
  {
    title: "Free demo, then plans",
    desc: "Try the workspace on a time-limited demo, then choose Starter or Pro when you are ready.",
  },
];

const testimonials = [
  {
    name: "Amina K.",
    role: "Startup Founder",
    quote:
      "The AI preview saved time, and the admin team stepped in exactly when I needed custom support.",
  },
  {
    name: "Daniel M.",
    role: "Product Manager",
    quote:
      "Fast, clear, and professional. I liked being able to choose between AI and a real expert.",
  },
  {
    name: "Grace W.",
    role: "Agency Owner",
    quote:
      "The hybrid flow makes it easy to handle both simple and complex client work.",
  },
];

const pricing = [
  {
    plan: "Starter",
    price: "$19",
    note: "After your demo: more AI runs and exports for individuals.",
  },
  {
    plan: "Pro",
    price: "$49",
    note: "After your demo: priority usage and team-friendly limits.",
  },
  {
    plan: "Human Expert",
    price: "Custom",
    note: "For complex projects, meetings, and full admin support.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#06111f] text-white">
      <header className="border-b border-white/10 bg-[#06111f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex shrink-0 items-center py-1">
            <WelpLogo className="h-9 max-w-[min(200px,48vw)] md:h-10" />
          </Link>
          <nav className="hidden gap-6 md:flex text-white/80">
            <a href="#services" className="hover:text-[#8ec5ff]">Services</a>
            <a href="#ai" className="hover:text-[#8ec5ff]">AI</a>
            <a href="#human" className="hover:text-[#8ec5ff]">Human Support</a>
            <a href="#pricing" className="hover:text-[#8ec5ff]">Pricing</a>
            <a href="#testimonials" className="hover:text-[#8ec5ff]">Testimonials</a>
          </nav>
          <div className="flex gap-3">
            <Link to="/login" className="rounded-xl border border-[#8ec5ff]/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
              Sign In
            </Link>
            <Link to="/register" className="rounded-xl bg-[#8ec5ff] px-4 py-2 text-sm font-medium text-[#06111f]">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <span className="mb-4 inline-flex rounded-full bg-[#8ec5ff]/15 px-4 py-2 text-sm font-medium text-[#8ec5ff]">
              AI-powered services backed by real experts
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Fast AI automation with human support when it matters most.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">
              Submit requests through AI for quick results, or route your project to a human admin for custom work, complex tasks, and premium support.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="rounded-xl bg-[#8ec5ff] px-6 py-3 font-medium text-[#06111f]">
                Get Started
              </Link>
              <Link to="/login" className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/10">
                Sign in
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-white/75">
              <div><div className="text-2xl font-bold text-[#8ec5ff]">24/7</div>AI availability</div>
              <div><div className="text-2xl font-bold text-[#8ec5ff]">3x</div>revision attempts</div>
              <div><div className="text-2xl font-bold text-[#8ec5ff]">Fast</div>expert escalation</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b1d33] p-6 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" alt="Team collaborating on digital work" className="mb-5 h-64 w-full rounded-2xl object-cover" />
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-3 text-sm font-medium text-slate-500">Live request preview</div>
              <div className="rounded-xl bg-[#0b1d33] p-4 text-white">
                <p className="text-sm font-medium text-[#8ec5ff]">AI Assistant</p>
                <p className="mt-2 text-sm text-white/90">
                  I can generate a website draft, document, design concept, or technical plan. Would you like a quick preview first?
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white">Approve</button>
                <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800">Request Improvements</button>
                <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800">Contact Admin</button>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-[#0b1d33] py-20 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold">Services we offer</h2>
            <p className="mt-3 max-w-2xl text-white/70">
              Choose AI for speed, or human support for custom handling and high-value work.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((item) => (
                <div key={item.title} className="rounded-2xl bg-[#102846] p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-[#8ec5ff]">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ai" className="py-20 bg-[#06111f]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-[#8ec5ff]">AI capabilities</h2>
              <p className="mt-4 text-white/75">
                Our AI assistant helps with website generation, document creation, design generation, and technical planning. It can ask clarifying questions, generate previews, and support multiple improvement attempts before escalation.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0b1d33] p-6">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80" alt="People discussing strategy" className="mb-4 h-56 w-full rounded-2xl object-cover" />
              <ul className="space-y-4 text-white/80">
                <li>• Clarifying questions before processing</li>
                <li>• Full output on every run — no paywall unlock</li>
                <li>• Retry limit for revisions</li>
                <li>• Automatic escalation when needed</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="human" className="bg-[#0b1d33] py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white p-6 text-slate-900">
              <img src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80" alt="Professional meeting" className="mb-4 h-56 w-full rounded-2xl object-cover" />
              <h2 className="text-3xl font-bold">Human expert services</h2>
              <p className="mt-4 text-slate-700">
                Users can submit a direct request to an admin for projects that require personalized consultation, live communication, or deeper technical handling.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#102846] p-6">
              <h3 className="text-xl font-semibold text-[#8ec5ff]">Direct request form fields</h3>
              <ul className="mt-4 space-y-2 text-white/75">
                <li>Project type</li>
                <li>Detailed description</li>
                <li>Budget</li>
                <li>Timeline</li>
                <li>Contact email</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 bg-[#06111f]">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold text-[#8ec5ff]">Portfolio and credibility</h2>
            <p className="mt-3 text-white/75">
              Show completed work, delivery speed, satisfaction metrics, and verified client results.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-2xl border border-white/10 bg-[#0b1d33] p-6">
                  <p className="text-white/80">“{t.quote}”</p>
                  <div className="mt-4">
                    <div className="font-semibold text-[#8ec5ff]">{t.name}</div>
                    <div className="text-sm text-white/60">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#0b1d33] py-20 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-bold">Pricing overview</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {pricing.map((item) => (
                <div key={item.plan} className="rounded-2xl bg-white p-6 text-slate-900 shadow-sm">
                  <h3 className="text-xl font-semibold">{item.plan}</h3>
                  <div className="mt-4 text-3xl font-bold">{item.price}</div>
                  <p className="mt-2 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#06111f]">
          <div className="mx-auto max-w-4xl rounded-3xl bg-[#0b1d33] px-6 py-16 text-center text-white shadow-2xl border border-white/10">
            <h2 className="text-3xl font-bold text-[#8ec5ff]">Ready to start your project?</h2>
            <p className="mt-4 text-white/75">
              Create an account, choose AI or admin support, and begin your request in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/register" className="rounded-xl bg-[#8ec5ff] px-6 py-3 font-medium text-[#06111f]">
                Create Account
              </Link>
              <Link to="/login" className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/10">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}