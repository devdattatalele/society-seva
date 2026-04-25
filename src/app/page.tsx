"use client";

import { useState, useEffect } from "react";
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
  ChevronUp,
  Star,
  Menu,
  X,
  ArrowRight,
  Play,
  Shield,
  Clock,
  Headphones,
  Zap,
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
    rating: 5,
  },
  {
    name: "Priya Deshmukh",
    role: "Treasurer, Green Valley Society",
    location: "Kothrud, Pune",
    text: "We switched from Excel sheets to Society Seva and haven't looked back. The interest calculation alone saved us from so many disputes. At ₹999, it's an absolute steal.",
    rating: 5,
  },
  {
    name: "Sunil Sharma",
    role: "Chairman, Sunrise Apartments",
    location: "Gurgaon, Haryana",
    text: "The bank reconciliation feature is brilliant. We can now match every transaction and present clean books at the AGM. Our members are impressed with the transparency.",
    rating: 5,
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

/* ─────────────── component ─────────────── */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* smooth anchor helper */
  function scrollTo(id: string) {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      {/* ──────── NAVBAR ──────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-xl font-bold tracking-tight transition-colors ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
              >
                Society Seva
              </span>
            </button>

            {/* desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {["features", "pricing", "testimonials", "contact"].map((s) => (
                <button
                  key={s}
                  onClick={() => scrollTo(s)}
                  className={`text-sm font-medium capitalize transition-colors hover:text-purple-500 ${
                    scrolled ? "text-gray-600" : "text-white/80 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors hover:text-purple-500 ${
                  scrolled ? "text-gray-600" : "text-white/80 hover:text-white"
                }`}
              >
                Login
              </Link>
              <Link
                href="/login"
                className="bg-white text-purple-700 px-5 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl hover:bg-purple-50 transition-all"
              >
                Free Demo
              </Link>
            </div>

            {/* mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-xl animate-in">
            <div className="px-4 py-4 space-y-2">
              {["features", "pricing", "testimonials", "contact"].map((s) => (
                <button
                  key={s}
                  onClick={() => scrollTo(s)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 font-medium capitalize hover:bg-purple-50 transition"
                >
                  {s}
                </button>
              ))}
              <Link
                href="/login"
                className="block px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-purple-50 transition"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="block text-center mt-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Free Demo
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ──────── HERO ──────── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        {/* subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 text-sm text-purple-100">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>One-time purchase &mdash; No subscription fees</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Complete Society
            <br />
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 bg-clip-text text-transparent">
              Management & Accounting
            </span>
            <br />
            Software
          </h1>

          <p className="mt-6 md:mt-8 text-lg md:text-xl text-purple-100/90 max-w-2xl mx-auto leading-relaxed">
            Manage members, generate bills, track payments, reconcile bank
            accounts, and get 20+ financial reports &mdash; all for a one-time
            price of{" "}
            <span className="font-bold text-white">just ₹999</span>.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-full text-lg font-bold shadow-2xl shadow-purple-900/30 hover:shadow-purple-900/50 hover:bg-purple-50 transition-all"
            >
              Start Free Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => scrollTo("features")}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all"
            >
              <Play className="w-5 h-5" />
              Watch Video
            </button>
          </div>
        </div>
      </section>

      {/* ──────── STATS BAR ──────── */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl shadow-purple-500/10 border border-purple-100/50 grid grid-cols-2 md:grid-cols-4 divide-x divide-purple-100">
            {[
              { value: "500+", label: "Societies" },
              { value: "50,000+", label: "Members Managed" },
              { value: "₹10Cr+", label: "Transactions Processed" },
              { value: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label} className="py-6 md:py-8 text-center px-2">
                <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs md:text-sm text-gray-500 mt-1 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FEATURES ──────── */}
      <section id="features" className="py-20 md:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything Your Society Needs
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              From member management to financial reporting &mdash; a complete
              solution built for cooperative housing societies.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors duration-300">
                  <f.icon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── HOW IT WORKS ──────── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-purple-50/50 to-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Get Started in 3 Simple Steps
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Go from sign-up to fully operational in under an hour &mdash; no
              technical skills required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {/* connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-purple-200" />
                )}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-purple-500/25 mb-6">
                  <s.icon className="w-10 h-10 text-white" />
                </div>
                <span className="inline-block text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full mb-3">
                  STEP {s.step}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── REPORTS SHOWCASE ──────── */}
      <section className="py-20 md:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            {/* decorative */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block text-sm font-semibold text-purple-200 bg-white/10 px-4 py-1.5 rounded-full mb-4">
                  Reports
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                  20+ Ready-Made Financial Reports
                </h2>
                <p className="text-purple-100/80 text-lg leading-relaxed mb-6">
                  Generate audit-ready reports with a single click. No more
                  manual calculations or Excel formulas &mdash; everything is
                  automated and accurate.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-full font-bold hover:bg-purple-50 transition shadow-lg"
                >
                  Explore Reports
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {reports.map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white hover:bg-white/20 transition"
                  >
                    <ClipboardList className="w-4 h-4 text-purple-300 flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── PRICING ──────── */}
      <section
        id="pricing"
        className="py-20 md:py-28 bg-gradient-to-b from-white to-purple-50/50 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No monthly fees. No hidden charges. One payment, lifetime access.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative bg-white border-2 border-purple-200 rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-500/10">
              {/* badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold px-6 py-1.5 rounded-full shadow-lg">
                  BEST VALUE
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Complete Suite
                </h3>
                <p className="text-gray-500 text-sm">
                  Everything you need to run your society
                </p>
                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    ₹999
                  </span>
                  <span className="text-gray-400 font-medium">/one-time</span>
                </div>
                <p className="text-sm text-green-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Lifetime access &mdash; no recurring fees
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {pricingIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/login"
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                Buy Now &mdash; ₹999
              </Link>

              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
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
      </section>

      {/* ──────── TESTIMONIALS ──────── */}
      <section id="testimonials" className="py-20 md:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Trusted by Society Committees
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Hear from secretaries and treasurers who manage their societies
              with Society Seva.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {t.name}
                      </div>
                      <div className="text-xs text-gray-500">
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
      <section className="py-20 md:py-28 bg-gradient-to-b from-purple-50/40 to-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.q}
                  </span>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-purple-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-purple-600" />
                    )}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── CTA BANNER ──────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                Ready to Simplify Your Society Management?
              </h2>
              <p className="text-purple-100 text-lg max-w-xl mx-auto mb-8">
                Join 500+ societies that trust Society Seva for hassle-free
                billing, accounting, and member management.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-full text-lg font-bold shadow-2xl hover:bg-purple-50 transition-all"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => scrollTo("pricing")}
                  className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all"
                >
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── FOOTER ──────── */}
      <footer id="contact" className="bg-gray-900 text-gray-400 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            {/* brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Society Seva
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                India&apos;s most affordable society management and accounting
                software. Built for cooperative housing societies.
              </p>
              <div className="flex gap-3">
                {["Tw", "Fb", "In"].map((s) => (
                  <span
                    key={s}
                    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 hover:bg-purple-600 hover:text-white transition cursor-pointer"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                {["Features", "Pricing", "Reports", "Demo"].map((l) => (
                  <li key={l}>
                    <button
                      onClick={() =>
                        scrollTo(l.toLowerCase() === "demo" ? "features" : l.toLowerCase())
                      }
                      className="hover:text-purple-400 transition"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {["About Us", "Blog", "Careers", "Privacy Policy", "Terms of Service"].map(
                  (l) => (
                    <li key={l}>
                      <button className="hover:text-purple-400 transition">
                        {l}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span>support@societyseva.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span>Mumbai, Maharashtra, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
            <p>&copy; 2026 Society Seva. All Rights Reserved.</p>
            <p className="mt-2 md:mt-0">
              Made with{" "}
              <span className="text-purple-400">&#9829;</span> for Indian
              Housing Societies
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
