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
  GraduationCap,
  Layers3,
  LockKeyhole,
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
import { isSupabaseConfigured, supabase } from './lib/supabase'

type MembershipTier = 'Explorer' | 'Guide' | 'Group'

type RegistrationForm = {
  name: string
  email: string
  phone: string
  rank: string
  password: string
  membership_tier: MembershipTier
}

type SuccessState = {
  name: string
  email: string
  password: string
  membership_tier: MembershipTier
}

const initialForm: RegistrationForm = {
  name: '',
  email: '',
  phone: '',
  rank: '',
  password: '',
  membership_tier: 'Guide',
}

const tiers = [
  {
    name: 'Explorer',
    badge: 'Explorer',
    price: '₹199',
    summary: 'Find the right college yourself',
    perks: [
      'Full college search + filters',
      'Branch, fees, district, caste filters',
      'Detailed college profiles',
      'Cut-off history (3 years)',
      'Save up to 10 colleges',
      'Photo gallery + reviews',
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
    price: '₹399',
    summary: 'Expert hand-holding for CAP',
    perks: [
      'Everything in Explorer',
      'AI college recommendations',
      'Safe / moderate / reach scoring',
      'Personal CAP preference list',
      'Counsellor-reviewed + optimised',
      'PDF download of final list',
      'Priority WhatsApp support',
    ],
    cta: 'Get Guide',
    highlighted: true,
  },
  {
    name: 'Group',
    badge: 'Group - 3 friends',
    price: '₹299 / student',
    priceNote: '₹897 total · save ₹300 vs 3x Guide',
    summary: '',
    perks: [
      'Everything in Guide plan',
      'All 3 students get full access',
      'Separate profiles per student',
      'Individual CAP lists for each',
      'One payment by any member',
      'Share invite link to friends',
      'Priority WhatsApp support',
    ],
    cta: 'Get Group plan',
    footerNote: 'Min 3 students · max 5 students',
  },
] satisfies Array<{
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
}>

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
  'The counselling flow gave me a clear view of which colleges to focus on.',
  'Having one account for registration and college search made everything simpler.',
  'The preference planning support helped me avoid random CAP choices.',
]

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [form, setForm] = useState<RegistrationForm>(initialForm)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
  const [error, setError] = useState('')
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

    if (!isSupabaseConfigured) {
      setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env before registering students.')
      return
    }

    setStatus('submitting')

    try {
      const rank = Number.parseInt(form.rank, 10)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            rank,
            category: null,
            region: null,
            membership_tier: form.membership_tier,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.session && data.user) {
        const { error: profileError } = await supabase.from('students').upsert(
          {
            id: data.user.id,
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            rank,
            category: null,
            region: null,
            membership_tier: form.membership_tier,
          },
          { onConflict: 'id' },
        )

        if (profileError) {
          throw profileError
        }
      }

      navigate('/success', {
        state: {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          membership_tier: form.membership_tier,
        } satisfies SuccessState,
      })
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-blue-950/10 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-blue-950 text-white">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold leading-none text-blue-950">Margdarshak khoj</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">MHT-CET</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            <a href="#how" className="transition hover:text-blue-950">How it works</a>
            <a href="#features" className="transition hover:text-blue-950">Benefits</a>
            <a href="#pricing" className="transition hover:text-blue-950">Pricing</a>
            <a href="#register" className="rounded-md bg-orange-500 px-4 py-2.5 text-white shadow-sm transition hover:bg-orange-600">
              Register
            </a>
          </div>

          <button
            className="grid size-10 place-items-center rounded-md border border-slate-200 text-blue-950 md:hidden"
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
              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-blue-950 sm:text-5xl lg:text-6xl">
                Margdarshak khoj
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Register once, explore colleges confidently, and get ready for smarter MHT-CET CAP preference planning.
              </p>
              <div className="mt-6 max-w-2xl rounded-md border-l-4 border-orange-500 bg-blue-50 px-5 py-4 shadow-sm">
                <p className="text-lg font-black leading-7 text-blue-950">
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
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-center sm:text-left">
                <Stat value="3" label="Connected apps" />
                <Stat value="1" label="Supabase login" />
                <Stat value="CAP" label="Ready workflow" />
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
                    <p className="text-sm font-bold text-blue-950">College Explorer</p>
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

        <section id="how" className="border-y border-blue-950/10 bg-blue-950 py-16 text-white sm:py-20">
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
                    <p className="font-bold text-blue-950">Selected tier: {selectedTier.name} {selectedTier.price}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{selectedTier.summary}</p>
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
              </div>

              {error ? (
                <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'submitting' ? 'Creating account...' : 'Register and continue'}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                Passwords are handled by Supabase Auth. The public students table stores profile and membership data only.
              </p>
            </form>
          </div>
        </section>

        <section className="border-y border-blue-950/10 bg-slate-50 py-16">
          <SectionHeading eyebrow="Testimonials" title="Student feedback placeholders" />
          <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-5 md:grid-cols-3 lg:px-8">
            {testimonials.map((quote, index) => (
              <article key={quote} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex gap-1 text-orange-500" aria-label="5 star rating">
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <Star key={starIndex} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-5 leading-7 text-slate-700">"{quote}"</p>
                <p className="mt-6 text-sm font-bold text-blue-950">Student placeholder {index + 1}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-blue-950 px-5 py-14 text-white">
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
          <p className="font-semibold text-blue-950">Margdarshak khoj for MHT-CET Counselling</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2"><PhoneCall className="size-4" /> Counsellor contact</span>
            <span className="inline-flex items-center gap-2"><MapPin className="size-4" /> Maharashtra admissions</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SuccessPage() {
  const location = useLocation()
  const details = location.state as SuccessState | null

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-3xl rounded-md border border-slate-200 bg-white p-6 shadow-xl shadow-blue-950/5 sm:p-10">
        <div className="grid size-14 place-items-center rounded-md bg-green-100 text-green-700">
          <Check className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-black text-blue-950 sm:text-4xl">Registration successful</h1>
        <p className="mt-4 leading-8 text-slate-600">
          The student can use these login details for App 1 when College Explorer is connected to the same Supabase project.
        </p>

        {details ? (
          <div className="mt-8 grid gap-4 rounded-md border border-blue-100 bg-blue-50 p-5">
            <Credential label="Name" value={details.name} />
            <Credential label="Email / App 1 login" value={details.email} />
            <Credential label="Password" value={details.password} secret />
            <Credential label="Membership" value={details.membership_tier} />
          </div>
        ) : (
          <div className="mt-8 rounded-md border border-orange-200 bg-orange-50 p-5 text-sm font-semibold text-orange-800">
            Login details are shown immediately after registration. Return to the landing page to register another student.
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-blue-950 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
            Back to landing page
          </Link>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-blue-950/15 bg-white px-5 py-3 text-sm font-bold text-blue-950 hover:border-blue-950/30">
            Register another student
          </a>
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
      <h2 className={`mt-3 text-3xl font-black leading-tight sm:text-4xl ${isDark ? 'text-white' : 'text-blue-950'}`}>
        {title}
      </h2>
      {text ? <p className={`mt-4 leading-8 ${isDark ? 'text-blue-100' : 'text-slate-600'}`}>{text}</p> : null}
    </div>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-bold text-blue-950">
      {label}
      {children}
    </label>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3">
      <p className="text-xl font-black text-blue-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  )
}

function Credential({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:items-center">
      <span className="text-sm font-bold text-blue-950">{label}</span>
      <span className="rounded-md bg-white px-3 py-2 font-mono text-sm text-slate-700">
        {secret ? value : value}
      </span>
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
