"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  IndianRupee,
  Building2,
  Calculator,
  BarChart3,
  BookOpen,
  Award,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Shield,
  Clock,
  Headphones,
  ClipboardList,
  UserPlus,
  Settings,
  Receipt,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

/* ─────────────── data ─────────────── */

const features = [
  {
    icon: Users,
    title: "Member Management",
    desc: "Complete member directory with flat details, ownership history, nominees, and document management.",
  },
  {
    icon: FileText,
    title: "Auto Bill Generation",
    desc: "Generate monthly maintenance bills automatically with customizable tariffs, due dates, and late fees.",
  },
  {
    icon: IndianRupee,
    title: "Receipt & Payments",
    desc: "Track every rupee with digital receipts, online payment integration, and payment reminders.",
  },
  {
    icon: Building2,
    title: "Bank Reconciliation",
    desc: "Match bank statements with your books effortlessly. Auto-reconcile and flag mismatches instantly.",
  },
  {
    icon: Calculator,
    title: "Interest Calculation",
    desc: "Auto-calculate simple & compound interest on late payments with configurable slabs and grace periods.",
  },
  {
    icon: BarChart3,
    title: "20+ Reports",
    desc: "Trial Balance, Balance Sheet, Income & Expenditure, Outstanding, Ageing, and many more at one click.",
  },
  {
    icon: BookOpen,
    title: "Journal Voucher",
    desc: "Record adjustments, corrections, and non-cash entries with full double-entry journal voucher support.",
  },
  {
    icon: Award,
    title: "Share Certificate",
    desc: "Issue, transfer, and manage share certificates digitally with complete audit trail and history.",
  },
];

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register Your Society",
    desc: "Sign up and enter your society details — name, address, registration number, and bank information.",
  },
  {
    icon: Settings,
    step: "02",
    title: "Setup Members & Tariffs",
    desc: "Add members, configure flat types, set maintenance charges, and define billing schedules in minutes.",
  },
  {
    icon: Receipt,
    step: "03",
    title: "Start Billing & Accounting",
    desc: "Generate bills, collect payments, track expenses, and get instant financial reports — all automated.",
  },
];

const reports = [
  "Trial Balance",
  "Balance Sheet",
  "Income & Expenditure",
  "Outstanding Report",
  "Member Ledger",
  "Receipt Register",
  "Payment Register",
  "Bank Book",
  "Cash Book",
  "Ageing Analysis",
  "Interest Report",
  "Defaulter List",
];

const testimonials = [
  {
    name: "Rajesh Mehta",
    role: "Secretary, Shanti Niketan CHS",
    location: "Andheri West, Mumbai",
    text: "Society Seva has transformed how we manage our 120-flat society. Bill generation that used to take 2 days now happens in 2 minutes. The accounting reports are exactly what our auditor needs.",
  },
  {
    name: "Priya Deshmukh",
    role: "Treasurer, Green Valley Society",
    location: "Kothrud, Pune",
    text: "We switched from Excel sheets to Society Seva and haven't looked back. The interest calculation alone saved us from so many disputes. At ₹999, it's an absolute steal.",
  },
  {
    name: "Sunil Sharma",
    role: "Chairman, Sunrise Apartments",
    location: "Gurgaon, Haryana",
    text: "The bank reconciliation feature is brilliant. We can now match every transaction and present clean books at the AGM. Our members are impressed with the transparency.",
  },
];

const faqs = [
  {
    q: "Is Society Seva a one-time purchase or subscription?",
    a: "Society Seva is a one-time purchase at just ₹999. There are no monthly or annual fees. You get lifetime access to all features, updates, and basic support included in the price.",
  },
  {
    q: "Can I try Society Seva before purchasing?",
    a: "Yes! We offer a fully functional free demo with sample data pre-loaded. You can explore every feature, generate reports, and test the billing system before making any purchase.",
  },
  {
    q: "How many members/flats can we manage?",
    a: "There is no limit on the number of members or flats. Whether your society has 10 flats or 1,000, Society Seva handles it smoothly without any additional cost.",
  },
  {
    q: "Is our society's financial data safe?",
    a: "Absolutely. All data is encrypted at rest and in transit. We use bank-grade security with regular backups. Your data is stored on secure cloud servers with 99.9% uptime guarantee.",
  },
  {
    q: "Do we need technical knowledge to use the software?",
    a: "Not at all. Society Seva is designed for non-technical users. The interface is intuitive and in simple English. We also provide video tutorials and phone support to help you get started.",
  },
  {
    q: "Can we migrate data from our existing system?",
    a: "Yes. You can import member data from Excel sheets. Our support team can also assist with opening balance entry and initial setup to ensure a smooth transition from your existing system.",
  },
];

const pricingIncludes = [
  "Unlimited Members & Flats",
  "Auto Bill Generation",
  "Receipt & Payment Tracking",
  "20+ Financial Reports",
  "Bank Reconciliation",
  "Interest Calculation",
  "Share Certificate Management",
  "Lifetime Free Updates",
  "Email & Phone Support",
  "Data Backup & Security",
];

/* ─────────────── Dashboard Mockup ─────────────── */

function DashboardMockup() {
  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Browser chrome */}
      <div className="bg-slate-700 rounded-t-xl px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-slate-600 rounded-md px-3 py-1 text-xs text-slate-300 text-center">
            societyseva.app/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="bg-slate-100 rounded-b-xl flex overflow-hidden" style={{ height: 280 }}>
        {/* Mini sidebar */}
        <div className="w-14 bg-[#1e3a5f] flex flex-col items-center py-3 gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 mb-2" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-6 h-6 rounded ${i === 0 ? "bg-teal-400" : "bg-white/15"}`} />
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 p-3 overflow-hidden">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Members", value: "142", color: "bg-teal-500" },
              { label: "Collected", value: "₹8.2L", color: "bg-blue-500" },
              { label: "Pending", value: "₹1.4L", color: "bg-amber-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-lg p-2 shadow-sm">
                <div className={`w-6 h-1.5 rounded-full ${s.color} mb-1.5`} />
                <div className="text-[11px] font-bold text-slate-800">{s.value}</div>
                <div className="text-[9px] text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-lg p-2 shadow-sm mb-3">
            <div className="text-[9px] font-semibold text-slate-500 mb-2">Monthly Collection</div>
            <div className="flex items-end gap-1.5 h-16">
              {[65, 80, 55, 90, 70, 85, 95, 60, 75, 88, 72, 92].map((h, i) => (
                <div key={i} className="flex-1 bg-teal-400 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Mini table */}
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-[9px] font-semibold text-slate-500 mb-1.5">Recent Bills</div>
            {[1, 2, 3].map((r) => (
              <div key={r} className="flex items-center gap-2 py-1 border-b border-slate-50 last:border-0">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full" />
                <div className="w-8 h-1.5 bg-teal-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── component ─────────────── */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function scrollTo(id: string) {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden">
      {/* ──────── NAVBAR ──────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Society Seva
              </span>
            </button>

            <div className="hidden md:flex items-center gap-8">
              {["features", "pricing", "testimonials", "contact"].map((s) => (
                <button
                  key={s}
                  onClick={() => scrollTo(s)}
                  className="text-sm font-medium capitalize text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {s}
                </button>
              ))}
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                Free Demo
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100">
            <div className="px-5 py-4 space-y-1">
              {["features", "pricing", "testimonials", "contact"].map((s) => (
                <button
                  key={s}
                  onClick={() => scrollTo(s)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-slate-700 font-medium capitalize hover:bg-slate-50 transition"
                >
                  {s}
                </button>
              ))}
              <Link
                href="/login"
                className="block px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="block text-center mt-2 bg-teal-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Free Demo
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ──────── HERO ──────── */}
      <section className="pt-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-900/30 border border-teal-700/40 rounded-full px-4 py-1.5 mb-6 text-sm text-teal-300">
                <CheckCircle2 className="w-4 h-4" />
                One-time purchase &mdash; No subscription fees
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                Complete Society Management & Accounting Software
              </h1>

              <p className="mt-5 text-base lg:text-lg text-slate-300 leading-relaxed max-w-lg">
                Manage members, generate bills, track payments, reconcile bank
                accounts, and get 20+ financial reports &mdash; all for a one-time
                price of <span className="font-semibold text-white">just ₹999</span>.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-7 py-3 rounded-lg text-base font-semibold hover:bg-teal-700 transition-colors"
                >
                  Start Free Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => scrollTo("features")}
                  className="inline-flex items-center justify-center gap-2 border border-slate-600 text-slate-300 px-7 py-3 rounded-lg text-base font-medium hover:bg-slate-800 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right — dashboard mockup */}
            <div className="hidden md:block">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ──────── STATS BAR ──────── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
            {[
              { value: "500+", label: "Societies" },
              { value: "50,000+", label: "Members Managed" },
              { value: "₹10Cr+", label: "Transactions Processed" },
              { value: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label} className="py-6 md:py-8 text-center px-2">
                <div className="text-2xl md:text-3xl font-bold text-teal-700">
                  {s.value}
                </div>
                <div className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FEATURES ──────── */}
      <section id="features" className="py-16 md:py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2">
              Features
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Everything Your Society Needs
            </h2>
            <p className="mt-3 text-base text-slate-500">
              From member management to financial reporting &mdash; a complete
              solution built for cooperative housing societies.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── HOW IT WORKS ──────── */}
      <section className="py-16 md:py-24 bg-slate-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2">
              How It Works
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Get Started in 3 Simple Steps
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Go from sign-up to fully operational in under an hour &mdash; no
              technical skills required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-slate-300" />
                )}
                <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-5">
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <span className="inline-block text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full mb-3">
                  STEP {s.step}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-slate-500 leading-relaxed max-w-xs mx-auto text-sm">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── REPORTS SHOWCASE ──────── */}
      <section className="py-16 md:py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl p-8 md:p-14">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-sm font-semibold text-teal-400 uppercase tracking-wide mb-2">
                  Reports
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
                  20+ Ready-Made Financial Reports
                </h2>
                <p className="text-slate-300 text-base leading-relaxed mb-6">
                  Generate audit-ready reports with a single click. No more
                  manual calculations or Excel formulas &mdash; everything is
                  automated and accurate.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition text-sm"
                >
                  Explore Reports
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {reports.map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200"
                  >
                    <ClipboardList className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── PRICING ──────── */}
      <section id="pricing" className="py-16 md:py-24 bg-slate-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2">
              Pricing
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-3 text-base text-slate-500">
              No monthly fees. No hidden charges. One payment, lifetime access.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Teal top accent */}
              <div className="h-1.5 bg-teal-600" />

              <div className="p-7 md:p-9">
                <div className="text-center mb-7">
                  <span className="inline-block text-xs font-bold text-teal-700 bg-teal-50 px-4 py-1 rounded-full mb-4 uppercase tracking-wide">
                    Best Value
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Complete Suite
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Everything you need to run your society
                  </p>
                  <div className="mt-5 flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-slate-900">
                      ₹999
                    </span>
                    <span className="text-slate-400 font-medium">/one-time</span>
                  </div>
                  <p className="text-sm text-teal-600 font-medium mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Lifetime access &mdash; no recurring fees
                  </p>
                </div>

                <div className="space-y-3 mb-7">
                  {pricingIncludes.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/login"
                  className="block w-full text-center bg-teal-600 text-white py-3.5 rounded-lg font-semibold text-base hover:bg-teal-700 transition-colors"
                >
                  Buy Now &mdash; ₹999
                </Link>

                <div className="mt-5 flex items-center justify-center gap-5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Secure Payment
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Instant Access
                  </span>
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5" /> Free Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── TESTIMONIALS ──────── */}
      <section id="testimonials" className="py-16 md:py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2">
              Testimonials
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Trusted by Society Committees
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Hear from secretaries and treasurers who manage their societies
              with Society Seva.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white border border-slate-200 rounded-xl p-7"
              >
                <div className="text-4xl text-slate-200 font-serif leading-none mb-3">&ldquo;</div>
                <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                  {t.text}
                </p>
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {t.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.role} &middot; {t.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FAQ ──────── */}
      <section className="py-16 md:py-24 bg-slate-50 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2">
              FAQ
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-slate-900 pr-4 text-sm">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 -mt-1">
                    <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── CTA BANNER ──────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="bg-[#1e3a5f] rounded-2xl p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
              Ready to Simplify Your Society Management?
            </h2>
            <p className="text-slate-300 text-base max-w-xl mx-auto mb-8">
              Join 500+ societies that trust Society Seva for hassle-free
              billing, accounting, and member management.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-7 py-3 rounded-lg text-base font-semibold hover:bg-teal-700 transition-colors"
              >
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => scrollTo("pricing")}
                className="inline-flex items-center gap-2 border border-slate-400 text-white px-7 py-3 rounded-lg text-base font-medium hover:bg-white/10 transition-colors"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── FOOTER ──────── */}
      <footer id="contact" className="bg-slate-900 text-slate-400 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
            {/* brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  Society Seva
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                India&apos;s most affordable society management and accounting
                software. Built for cooperative housing societies.
              </p>
            </div>

            {/* links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                {["Features", "Pricing", "Reports", "Demo"].map((l) => (
                  <li key={l}>
                    <button
                      onClick={() =>
                        scrollTo(l.toLowerCase() === "demo" ? "features" : l.toLowerCase())
                      }
                      className="hover:text-teal-400 transition"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                {["About Us", "Blog", "Privacy Policy", "Terms of Service"].map(
                  (l) => (
                    <li key={l}>
                      <button className="hover:text-teal-400 transition">
                        {l}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* contact */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" />
                  <span>support@societyseva.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" />
                  <span>Mumbai, Maharashtra, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-7 flex flex-col md:flex-row items-center justify-between text-sm">
            <p>&copy; 2026 Society Seva. All Rights Reserved.</p>
            <p className="mt-2 md:mt-0">
              Made with <span className="text-teal-400">&#9829;</span> for Indian
              Housing Societies
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
