"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ChevronRight,
  Globe,
  Users,
  Clock,
  Target,
  GraduationCap,
  Briefcase,
  Award,
  Building2,
  TrendingUp,
  Zap,
  Star,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const brandStyles = {
    "--brand-red": "#B91C1C",
    "--lms-teal": "#0F766E",
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen bg-white text-slate-900 font-['Montserrat']"
      style={brandStyles}
    >
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/tuftS-logo.png"
                alt="Tufts Management School"
                width={200}
                height={56}
                className="h-14 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="#programs"
                className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 hover:text-[color:var(--lms-teal)] transition-colors"
              >
                Programs
              </a>
              <a
                href="#about"
                className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 hover:text-[color:var(--lms-teal)] transition-colors"
              >
                About Us
              </a>
              <a
                href="#testimonials"
                className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 hover:text-[color:var(--lms-teal)] transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 hover:text-[color:var(--lms-teal)] transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Authentication Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button
                asChild
                variant="outline"
                className="border-2 border-[color:var(--lms-teal)] text-[color:var(--lms-teal)] hover:bg-[color:var(--lms-teal)] hover:text-white font-semibold"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-[color:var(--lms-teal)] text-white font-semibold shadow-lg hover:opacity-90"
              >
                <Link href="/apply">Apply Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-3 border-t border-slate-200">
              <a
                href="#programs"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Programs
              </a>
              <a
                href="#about"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </a>
              <a
                href="#testimonials"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="px-4 pt-4 space-y-2 border-t border-slate-200">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-2 border-[color:var(--lms-teal)] text-[color:var(--lms-teal)] font-semibold"
                >
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-[color:var(--lms-teal)] text-white font-semibold hover:opacity-90"
                >
                  <Link href="/apply">Apply Now</Link>
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[78vh] min-h-[520px] w-full">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/images/hero-bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-y-0 left-0 w-full sm:w-[62%] lg:w-[52%] bg-[linear-gradient(90deg,rgba(15,118,110,0.92),rgba(15,118,110,0.7),rgba(15,118,110,0.1),transparent)]" />

          <div className="relative z-10 h-full">
            <div className="absolute bottom-8 left-4 sm:bottom-10 sm:left-8 lg:bottom-12 lg:left-12 text-white">
              <div className="max-w-xl space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  <Globe size={16} className="text-white" />
                  <span>Accredited, career-ready, globally connected.</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
                  Build leadership skill with accredited programs and a modern
                  digital campus.
                </h1>

                <p className="text-base text-white/90 leading-relaxed">
                  U.K. degree pathways, executive education, and professional
                  certifications for ambitious professionals across Nigeria and
                  Africa.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-1.5">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[color:var(--lms-teal)] text-white text-sm px-6 h-11 rounded-xl shadow-lg hover:opacity-90 transition-all w-full sm:w-auto"
                  >
                    <Link href="/apply">
                      Apply Now <ChevronRight className="ml-2" size={16} />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border border-white/70 text-white hover:bg-white/10 text-sm px-6 h-11 rounded-xl transition-all w-full sm:w-auto bg-transparent"
                  >
                    <Link href="/signin">Sign In</Link>
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 text-white/90">
                  <div>
                    <p className="text-2xl font-semibold">500+</p>
                    <p className="text-xs">Professionals Upskilled</p>
                  </div>
                  <div className="h-10 w-px bg-white/30"></div>
                  <div>
                    <p className="text-2xl font-semibold">UK</p>
                    <p className="text-xs">Accredited Pathways</p>
                  </div>
                  <div className="h-10 w-px bg-white/30"></div>
                  <div>
                    <p className="text-2xl font-semibold">100%</p>
                    <p className="text-xs">Career-focused delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accreditation Banner */}
      <section className="py-16 bg-[color:var(--lms-teal)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-2xl font-semibold text-white mb-2">
              Accredited by Leading U.K. Awarding Bodies
            </p>
            <p className="text-white/75 text-lg">
              With European University Degree Partnerships
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-16">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-3 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all">
                <Award className="text-white/90" size={48} />
              </div>
              <p className="font-bold text-white text-lg">Qualifi</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-3 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all">
                <Award className="text-white/90" size={48} />
              </div>
              <p className="font-bold text-white text-lg">ATHE</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-3 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all">
                <Award className="text-white/90" size={48} />
              </div>
              <p className="font-bold text-white text-lg">OTHM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Categories */}
      <section id="programs" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-semibold text-slate-900 mb-6">
              Programs built for momentum
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Select a pathway that matches your career goals, leadership stage,
              and the pace of your professional life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Degree Pathway Programs */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-slate-200 group hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(185,28,28,0.12)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap
                  className="text-[color:var(--brand-red)]"
                  size={32}
                />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Degree Pathway Programs
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                U.K. accredited pathways to MBA, DBA, LLM, and PhD
                qualifications
              </p>
              <div className="text-[color:var(--brand-red)] font-semibold flex items-center">
                View Programs <ChevronRight size={20} />
              </div>
            </div>

            {/* Executive Education */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-slate-200 group hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(15,118,110,0.12)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="text-[color:var(--lms-teal)]" size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Executive Education
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Leadership development and management training for executives
              </p>
              <div className="text-[color:var(--lms-teal)] font-semibold flex items-center">
                Explore Programs <ChevronRight size={20} />
              </div>
            </div>

            {/* Professional Certifications */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-slate-200 group hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(185,28,28,0.12)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="text-[color:var(--brand-red)]" size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Professional Certifications
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Industry-recognized certifications in management and
                entrepreneurship
              </p>
              <div className="text-[color:var(--brand-red)] font-semibold flex items-center">
                Browse Certifications <ChevronRight size={20} />
              </div>
            </div>

            {/* Corporate Training */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-slate-200 group hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(15,118,110,0.12)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="text-[color:var(--lms-teal)]" size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Corporate Training
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Customized training solutions for organizations and public
                sector
              </p>
              <div className="text-[color:var(--lms-teal)] font-semibold flex items-center">
                Request Training <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Experience */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-semibold text-slate-900 mb-6">
              Learning built around working professionals
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Flexible delivery, high-touch support, and practical application
              so you can progress without putting your career on hold.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-[rgba(15,118,110,0.12)] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Clock className="text-[color:var(--lms-teal)]" size={28} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                    Blended Learning Model
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Combine online instruction with intensive boot camps and
                    in-person workshops. Learn at your pace without pausing your
                    career.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-[rgba(185,28,28,0.12)] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Users
                      className="text-[color:var(--brand-red)]"
                      size={28}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                    Small Cohort Advantage
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Modest class sizes ensure personalized attention,
                    mentorship, and meaningful peer engagement throughout your
                    program.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-[rgba(15,118,110,0.12)] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Target
                      className="text-[color:var(--lms-teal)]"
                      size={28}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                    Practical Application
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Case studies, simulations, and real-world business projects
                    prepare you to apply what you learn immediately.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-[rgba(185,28,28,0.12)] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Globe
                      className="text-[color:var(--brand-red)]"
                      size={28}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                    Global Exposure
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    International exchange opportunities and global networking
                    connect you with professionals and institutions worldwide.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-lg">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/images/a-group-of-three-african-american-students.jpg"
                  alt="Professionals collaborating with a laptop"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,118,110,0.2),rgba(185,28,28,0.2))]" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Cohort Support
                  </p>
                  <p className="text-base font-semibold text-[color:var(--brand-red)]">
                    Dedicated Advisors
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    LMS Access
                  </p>
                  <p className="text-base font-semibold text-[color:var(--lms-teal)]">
                    24/7 Learning Hub
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-semibold text-slate-900 mb-6">
              Why professionals choose Tufts Management School
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Globally Accredited",
                desc: "U.K. degree pathway programs recognized internationally",
                icon: Globe,
              },
              {
                title: "Flexible Delivery",
                desc: "Blended learning designed for working professionals",
                icon: Clock,
              },
              {
                title: "Expert Faculty",
                desc: "Academics and industry practitioners with real-world experience",
                icon: Users,
              },
              {
                title: "Accelerated Pathways",
                desc: "Affordable programs with efficient timelines",
                icon: Zap,
              },
              {
                title: "Career Focused",
                desc: "Practical skills and credentials employers value",
                icon: TrendingUp,
              },
              {
                title: "African Relevance",
                desc: "Local context with global standards",
                icon: Target,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-[rgba(15,118,110,0.12)] flex items-center justify-center">
                    <item.icon
                      className="text-[color:var(--lms-teal)]"
                      size={24}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg mb-2">
                    {item.title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-semibold text-slate-900 mb-6">
              Stories from our alumni
            </h2>
            <p className="text-xl text-slate-600">
              Real professionals. Real results. Real impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-[color:var(--lms-teal)] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  MV
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xl">
                    M. Victor
                  </h4>
                  <p className="text-slate-600">Business Executive</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="text-[color:var(--brand-red)]"
                        fill="#B91C1C"
                        size={16}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed italic">
                "Tufts Management School programs expanded my business and gave
                our leadership team clearer, faster decision-making. I recommend
                this institution to CEOs and executives."
              </p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-[color:var(--brand-red)] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  AM
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xl">
                    A. Mohammed
                  </h4>
                  <p className="text-slate-600">Program Graduate</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="text-[color:var(--brand-red)]"
                        fill="#B91C1C"
                        size={16}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed italic">
                "The faculty delivers deep insight with clarity and
                professionalism. The learning experience is engaging,
                disciplined, and immediately useful."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.4),transparent_60%)]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-semibold mb-8">
            Ready for your next career move?
          </h2>
          <p className="text-2xl mb-12 text-slate-600">
            Join professionals building credibility, leadership, and global
            recognition through accredited management education.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[color:var(--lms-teal)] text-white text-xl px-12 py-8 rounded-xl shadow-2xl hover:opacity-90 transition-all"
            >
              <Link href="/apply">
                Apply Now <ChevronRight className="ml-2" size={24} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-slate-300 text-slate-700 hover:border-[color:var(--lms-teal)] hover:text-[color:var(--lms-teal)] text-xl px-12 py-8 rounded-xl transition-all"
            >
              <Link href="/signin">Sign In to Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-[color:var(--lms-teal)] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-white/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* About Column */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">About</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Vision & Mission
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Accreditation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Our Story
                  </a>
                </li>
              </ul>
            </div>

            {/* Programs Column */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">
                Programs
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Degree Pathways
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Executive Education
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Professional Certifications
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Corporate Training
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/signin"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Student Portal
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Application Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-white">Contact</h3>
              <ul className="space-y-3 text-white/70">
                <li>Lagos, Nigeria</li>
                <li>
                  <a
                    href="mailto:info@tuftsmanagementedu.org"
                    className="hover:text-white transition-colors"
                  >
                    info@tuftsmanagementedu.org
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+234"
                    className="hover:text-white transition-colors"
                  >
                    +234 XXX XXX XXXX
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-white/60 text-sm">
                © 2024 Tufts Management School. All rights reserved.
              </p>
              <div className="flex space-x-8 text-sm">
                <a
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
