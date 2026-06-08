import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Check,
  ChevronRight,
  ClipboardList,
  FileSearch,
  GraduationCap,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserPlus,
  X,
} from 'lucide-react'
import heroImage from './assets/hero-counselling.png'
import paymentQr from './assets/payment-qr.png'

type MembershipTier = 'Explorer' | 'Guide'
type Category = 'General' | 'OBC' | 'SC' | 'ST' | 'VJ' | 'NT1' | 'NT2' | 'NT3' | 'EWS'

type RegistrationForm = {
  name: string
  email: string
  phone: string
  rank: string
  password: string
  membership_tier: MembershipTier
  category: Category
  district: string
}

type SuccessState = {
  name: string
  email: string
  membership_tier: MembershipTier
  invite_code?: string
}

type ToastState = {
  message: string
  tone: 'error'
}

const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

const initialForm: RegistrationForm = {
  name: '',
  email: '',
  phone: '',
  rank: '',
  password: '',
  membership_tier: 'Guide',
  category: 'General',
  district: '',
}

const categories: Category[] = ['General', 'OBC', 'SC', 'ST', 'VJ', 'NT1', 'NT2', 'NT3', 'EWS']

const districts = [
  'Ahmednagar',
  'Akola',
  'Amravati',
  'Aurangabad',
  'Beed',
  'Bhandara',
  'Buldhana',
  'Chandrapur',
  'Dhule',
  'Gadchiroli',
  'Gondia',
  'Hingoli',
  'Jalgaon',
  'Jalna',
  'Kolhapur',
  'Latur',
  'Mumbai',
  'Nagpur',
  'Nanded',
  'Nashik',
  'Osmanabad',
  'Palghar',
  'Parbhani',
  'Pune',
  'Raigad',
  'Ratnagiri',
  'Sangli',
  'Satara',
  'Sindhudurg',
  'Solapur',
  'Thane',
  'Wardha',
  'Washim',
  'Yavatmal',
]

const tiers: Array<{
  name: MembershipTier
  badge: string
  price: string
  priceNote?: string
  summary: string
  perks: string[]
  lockedPerks?: string[]
  cta: string
  footerNote?: string
  highlighted?: boolean
}> = [
  {
    name: 'Explorer',
    badge: 'Explorer',
    price: '₹199',
    summary: 'Find the right college yourself',
    perks: [
      'College search and filters',
      'Detailed college profiles',
      'Cut-off history',
      'Save up to 10 colleges',
    ],
    lockedPerks: [
      'AI college recommendations',
      'Personal CAP list by counsellor',
      '1-on-1 guidance session',
    ],
    cta: 'Get Explorer',
  },
  {
    name: 'Guide',
    badge: 'Most popular',
    price: '₹299',
    summary: 'Expert hand-holding for CAP',
    perks: [
      'Everything in Explorer',
      'AI college recommendations',
      'Personal CAP list prepared by counsellor',
      'PDF download',
      'WhatsApp support',
    ],
    cta: 'Get Guide',
    highlighted: true,
  },
]

const features = [
  {
    icon: Search,
    title: 'College discovery',
    text: 'Students get a shared account for the upcoming College Explorer app.',
  },
  {
    icon: BarChart3,
    title: 'Rank-led planning',
    text: 'Rank, category, region, and membership data are ready for counselling workflows.',
  },
  {
    icon: ClipboardList,
    title: 'CAP ready',
    text: 'The same backend can power shortlist creation and preference list generation.',
  },
  {
    icon: ShieldCheck,
    title: 'One secure login',
    text: 'Supabase Auth keeps passwords out of profile tables and works across apps.',
  },
]

const steps = [
  {
    icon: UserPlus,
    title: 'Register',
    text: 'Create your account with rank, phone, email, and preferred membership tier.',
  },
  {
    icon: Layers3,
    title: 'Explore',
    text: 'Use the same login for College Explorer when App 1 is connected.',
  },
  {
    icon: BookOpenCheck,
    title: 'Plan CAP',
    text: 'Your details flow into the counselling dashboard for preference list planning.',
  },
]

const testimonials = [
  {
    quote: 'The counselling flow gave me a clear view of which colleges to focus on.',
    author: 'Aditya Kulkarni',
  },
  {
    quote: 'Having one account for registration and college search made everything simpler.',
    author: 'Neha Deshmukh',
  },
  {
    quote: 'The preference planning support helped me avoid random CAP choices.',
    author: 'Rohan Patil',
  },
]

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [form, setForm] = useState<RegistrationForm>(initialForm)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
  const [error, setError] = useState('')
  const [toast, setToast] = useState<ToastState | null>(null)
  const navigate = useNavigate()

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.name === form.membership_tier) ?? tiers[1],
    [form.membership_tier],
  )

  const updateForm = <K extends keyof RegistrationForm>(field: K, value: RegistrationForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const registerStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setToast(null)

    if (!isSupabaseConfigured) {
      const message = 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env before registering students.'
      setError(message)
      setToast({ message, tone: 'error' })
      return
    }

    setStatus('submitting')

    try {
      const rank = Number.parseInt(form.rank, 10)
      const { supabase } = await import('./lib/supabaseClient')

      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            rank,
            category: form.category,
            district: form.district,
            region: form.district,
            membership_tier: form.membership_tier,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      navigate('/success', {
        state: {
          name: form.name.trim(),
          email: form.email.trim(),
          membership_tier: form.membership_tier,
        } satisfies SuccessState,
      })
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Registration failed. Please try again.'
      setError(message)
      setToast({ message, tone: 'error' })
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <header className="sticky top-0 z-40 border-b border-blue-950/10 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-[#185FA5] text-white">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <span className="text-lg font-black tracking-wide text-[#185FA5]">Margdarshak</span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <a href="#how" className="transition hover:text-[#185FA5]">How it works</a>
            <a href="#features" className="transition hover:text-[#185FA5]">Benefits</a>
            <a href="#pricing" className="transition hover:text-[#185FA5]">Pricing</a>
            <a href="#register" className="rounded-md bg-orange-500 px-4 py-2.5 text-white shadow-sm transition hover:bg-orange-600">
              Register
            </a>
          </div>

          <button
            className="grid size-10 place-items-center rounded-md border border-slate-200 text-[#185FA5] md:hidden"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="grid gap-3 text-sm font-semibold text-slate-700">
              <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#register" onClick={() => setMobileMenuOpen(false)} className="rounded-md bg-orange-500 px-4 py-3 text-center text-white">
                Register now
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top">
        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:py-16 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
                <Sparkles className="size-4 text-orange-500" aria-hidden="true" />
                Built for Maharashtra engineering admissions
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-[#185FA5] sm:text-5xl lg:text-6xl">
                Margdarshak
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Register once, explore colleges confidently, and get ready for smarter MHT-CET CAP preference planning.
              </p>
              <div className="mt-6 max-w-2xl rounded-md border-l-4 border-orange-500 bg-blue-50 px-5 py-4 shadow-sm">
                <p className="text-lg font-black leading-7 text-[#185FA5]">
                  Got a strong percentile? We help you turn it into the best college admit possible.
                </p>
                <p className="mt-3 font-bold leading-7 text-slate-700">
                  Got a lower percentile? This is not the end. Your career is just beginning, and the right college strategy
                  can still open the right doors.
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  Choose your college carefully. The next four years can shape your skills, confidence, network, and career path.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#register" className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600">
                  Start membership <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a href="#pricing" className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-950/15 bg-white px-5 py-3.5 text-sm font-bold text-blue-950 transition hover:border-blue-950/30">
                  View pricing <ChevronRight className="size-4" aria-hidden="true" />
                </a>
              </div>

            </div>

            <div className="relative">
              <img
                src={heroImage}
                alt="Student reviewing college counselling options on a laptop"
                className="aspect-[16/10] w-full rounded-md object-cover shadow-2xl shadow-blue-950/20"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-md bg-white/95 p-4 shadow-xl backdrop-blur sm:left-auto sm:w-80">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#185FA5]">College Explorer</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Shared login ready for App 1</p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-md bg-orange-100 text-orange-600">
                    <LockKeyhole className="size-5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-[#185FA5]/10 bg-[#185FA5] py-16 text-white sm:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="A simple path from registration to CAP planning"
            tone="dark"
          />
          <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-5 md:grid-cols-3 lg:px-8">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-md border border-white/15 bg-white/8 p-6">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 place-items-center rounded-md bg-orange-500 text-white">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-orange-200">Step {index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 leading-7 text-blue-100">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="bg-white py-16 sm:py-20">
          <SectionHeading
            eyebrow="Benefits"
            title="Built around the full counselling journey"
            text="The landing site starts the student record correctly, so the explorer and CAP dashboard can reuse the same Supabase backend later."
          />
          <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <span className="grid size-11 place-items-center rounded-md bg-blue-50 text-blue-950">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-blue-950">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="bg-slate-50 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Pricing"
            title="Choose the right plan before CAP pressure begins"
            text="Whether you want to explore independently or need expert CAP hand-holding, pick the support level that matches your decision."
          />
          <div className="mx-auto mt-10 grid max-w-7xl gap-5 px-5 lg:grid-cols-3 lg:px-8">
            {tiers.map((tier) => (
              <article
                key={tier.name}
                className={`flex rounded-md border p-6 shadow-xl ${
                  tier.highlighted
                    ? 'border-blue-500 bg-slate-900 shadow-blue-950/20'
                    : 'border-slate-700 bg-slate-900 shadow-blue-950/10'
                }`}
              >
                <div className="flex w-full flex-col">
                  <div>
                    <span className={`inline-flex rounded-md px-3 py-1 text-sm font-black ${
                      tier.highlighted ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800'
                    }`}>
                      {tier.badge}
                    </span>
                    <p className="mt-4 text-3xl font-black leading-none text-white">{tier.price}</p>
                    {tier.priceNote ? <p className="mt-2 text-sm font-bold text-slate-400">{tier.priceNote}</p> : null}
                    {tier.summary ? <p className="mt-2 text-lg font-bold leading-6 text-slate-300">{tier.summary}</p> : null}
                  </div>

                  <div className="my-6 h-px bg-slate-700" />

                  <ul className="grid gap-3">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex gap-3 text-base font-bold leading-6 text-slate-100">
                        <Check className="mt-1 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  {tier.lockedPerks ? (
                    <>
                      <div className="my-6 h-px bg-slate-700" />
                      <ul className="grid gap-3">
                        {tier.lockedPerks.map((perk) => (
                          <li key={perk} className="flex gap-3 text-base font-bold leading-6 text-slate-500">
                            <LockKeyhole className="mt-1 size-4 shrink-0" aria-hidden="true" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  <div className="mt-auto pt-8">
                    <a
                      href="#register"
                      onClick={() => updateForm('membership_tier', tier.name)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-500 px-4 py-3 text-base font-black text-white transition hover:border-orange-400 hover:bg-orange-500"
                    >
                      {tier.cta} {tier.name === 'Guide' ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
                    </a>
                    {tier.footerNote ? <p className="mt-3 text-center text-sm font-bold text-slate-400">{tier.footerNote}</p> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="register" className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Student registration</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-blue-950 sm:text-4xl">
                Create the shared student account
              </h2>
              <p className="mt-4 leading-8 text-slate-600">
                This creates the Supabase Auth user and stores the counselling profile in the students table.
              </p>
              <div className="mt-8 rounded-md border border-blue-100 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <BadgeCheck className="mt-1 size-5 shrink-0 text-blue-950" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-[#185FA5]">Selected tier: {selectedTier.name} {selectedTier.price}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {selectedTier.summary || 'Expert guidance for your CAP process.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={registerStudent} className="rounded-md border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" id="name">
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(event) => updateForm('name', event.target.value)}
                    className="input"
                    placeholder="Aarav Patil"
                  />
                </Field>
                <Field label="Email" id="email">
                  <input
                    id="email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => updateForm('email', event.target.value)}
                    className="input"
                    placeholder="student@example.com"
                  />
                </Field>
                <Field label="Phone" id="phone">
                  <input
                    id="phone"
                    required
                    inputMode="tel"
                    minLength={10}
                    value={form.phone}
                    onChange={(event) => updateForm('phone', event.target.value)}
                    className="input"
                    placeholder="9876543210"
                  />
                </Field>
                <Field label="MHT-CET rank" id="rank">
                  <input
                    id="rank"
                    required
                    type="number"
                    min="1"
                    value={form.rank}
                    onChange={(event) => updateForm('rank', event.target.value)}
                    className="input"
                    placeholder="12450"
                  />
                </Field>
                <Field label="Password" id="password">
                  <input
                    id="password"
                    required
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(event) => updateForm('password', event.target.value)}
                    className="input"
                    placeholder="Minimum 8 characters"
                  />
                </Field>
                <Field label="Membership tier" id="tier">
                  <select
                    id="tier"
                    value={form.membership_tier}
                    onChange={(event) => updateForm('membership_tier', event.target.value as MembershipTier)}
                    className="input"
                  >
                    {tiers.map((tier) => (
                      <option key={tier.name} value={tier.name}>
                        {tier.name} {tier.price}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Category" id="category">
                  <select
                    id="category"
                    required
                    value={form.category}
                    onChange={(event) => updateForm('category', event.target.value as Category)}
                    className="input"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="District" id="district">
                  <select
                    id="district"
                    required
                    value={form.district}
                    onChange={(event) => updateForm('district', event.target.value)}
                    className="input"
                  >
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {error ? (
                <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#185FA5] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#134f89] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'submitting' ? 'Creating account...' : 'Register and continue'}
                {status === 'submitting' ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4" aria-hidden="true" />
                )}
              </button>

            </form>
          </div>
        </section>

        <section className="border-y border-blue-950/10 bg-slate-50 py-16">
          <SectionHeading eyebrow="Testimonials" title="Trusted by students across Maharashtra" />
          <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-5 md:grid-cols-3 lg:px-8">
            {testimonials.map((item) => (
              <article key={item.author} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex gap-1 text-orange-500" aria-label="5 star rating">
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <Star key={starIndex} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-5 leading-7 text-slate-700">"{item.quote}"</p>
                <p className="mt-6 text-sm font-bold text-blue-950">{item.author}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#185FA5] px-5 py-14 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-300">Ready for CAP?</p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Start with the right student record.</h2>
            </div>
            <a href="#register" className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600">
              Register student <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p className="text-base font-black tracking-wide text-[#185FA5]">Margdarshak</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="tel:+917264030382" className="inline-flex items-center gap-2 transition hover:text-[#185FA5]">
              <PhoneCall className="size-4" /> +91 72640 30382
            </a>
            <a href="mailto:margdarshakcontact@gmail.com" className="inline-flex items-center gap-2 transition hover:text-[#185FA5]">
              <Mail className="size-4" /> margdarshakcontact@gmail.com
            </a>
            <span className="inline-flex items-center gap-2 text-slate-500">
              <MapPin className="size-4" /> Maharashtra admissions
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SuccessPage() {
  const location = useLocation()
  const details = location.state as SuccessState | null

  const amount = details?.membership_tier === 'Explorer' ? 199 : 299

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-3xl rounded-md border border-slate-200 bg-white p-6 shadow-xl shadow-blue-950/5 sm:p-10">
        <div className="grid size-14 place-items-center rounded-md bg-green-100 text-green-700">
          <Check className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-black text-blue-950 sm:text-4xl">Registration successful</h1>
        <p className="mt-4 leading-8 text-slate-600">
          Your Margdarshak account is ready. Complete the payment below to activate your account.
        </p>

        {details ? (
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_240px] items-start">
            <div className="grid gap-4 rounded-md border border-blue-100 bg-blue-50 p-5">
              <Credential label="Name" value={details.name} />
              <Credential label="Email" value={details.email} />
              <Credential label="Selected plan" value={details.membership_tier} />
              <Credential label="Payment Amount" value={`₹${amount}`} />
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border border-orange-200 bg-orange-50/40 p-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700 mb-3">UPI QR Code</p>
              <img
                src={paymentQr}
                alt="UPI Payment QR Code"
                className="size-[160px] rounded-md border border-slate-200 shadow-md bg-white p-2"
              />
              <p className="mt-3 text-xs font-bold text-slate-700">Scan to pay ₹{amount}</p>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No registration details to show"
            message="Registration details are shown immediately after signup. Return to the landing page to register another student."
          />
        )}

        <div className="mt-6 rounded-md border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-700">Next Steps</p>
          <div className="mt-3 text-sm font-semibold leading-6 text-orange-900 space-y-2">
            <p>1. Scan the QR code above or pay directly to UPI ID: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-orange-200">omkarjadhawar9@okaxis</strong></p>
            <p>2. Send a screenshot of the payment receipt via WhatsApp to <a href="https://wa.me/917264030382" target="_blank" rel="noreferrer" className="underline font-bold text-blue-950">+91 72640 30382</a></p>
            <p>3. Once the admin confirms your payment receipt, your credentials will be unlocked and you can access Margdarshak Khoj.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={import.meta.env.VITE_KHOJ_PORTAL_URL || 'https://khoj.margdarshak.in'}
            className="inline-flex items-center justify-center rounded-md bg-blue-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-900 shadow-sm"
          >
            Open Margdarshak Khoj
          </a>
          <Link to="/" className="inline-flex items-center justify-center rounded-md border border-blue-950/15 bg-white px-5 py-3.5 text-sm font-bold text-blue-950 hover:border-blue-950/30">
            Register another student
          </Link>
        </div>
      </div>
    </main>
  )
}

function SectionHeading({
  eyebrow,
  title,
  text,
  tone = 'light',
}: {
  eyebrow: string
  title: string
  text?: string
  tone?: 'light' | 'dark'
}) {
  const isDark = tone === 'dark'

  return (
    <div className="mx-auto max-w-3xl px-5 text-center">
      <p className={`text-sm font-bold uppercase tracking-[0.18em] ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl font-black leading-tight sm:text-4xl ${isDark ? 'text-white' : 'text-[#185FA5]'}`}>
        {title}
      </h2>
      {text ? <p className={`mt-4 leading-8 ${isDark ? 'text-blue-100' : 'text-slate-600'}`}>{text}</p> : null}
    </div>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-bold text-[#185FA5]">
      {label}
      {children}
    </label>
  )
}



function Credential({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:items-center">
      <span className="text-sm font-bold text-[#185FA5]">{label}</span>
      <span className="rounded-md bg-white px-3 py-2 font-mono text-sm text-slate-700">
        {secret ? value : value}
      </span>
    </div>
  )
}

function Toast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  if (!toast) return null

  return (
    <div
      className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-md border border-red-200 bg-white p-4 shadow-2xl shadow-slate-950/10"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-red-50 text-red-600">
          <X className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-red-700">Supabase error</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Close notification"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="mt-8 rounded-md border border-orange-200 bg-orange-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-white text-orange-600">
          <FileSearch className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="font-black text-orange-900">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-orange-800">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/success" element={<SuccessPage />} />
    </Routes>
  )
}
