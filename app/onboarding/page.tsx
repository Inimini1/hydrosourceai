'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    id: 'userType',
    title: 'Who are you?',
    subtitle: 'Helps us tailor your HydroSource experience',
    options: [
      { value: 'homeowner', label: 'Homeowner', desc: 'I manage my own pool', icon: '🏡' },
      { value: 'professional', label: 'Pool Pro', desc: 'I service pools for clients', icon: '🔧' },
      { value: 'property_manager', label: 'Property Manager', desc: 'I oversee multiple properties', icon: '🏢' },
    ],
  },
  {
    id: 'numPools',
    title: 'How many pools?',
    subtitle: 'Total pools you manage or maintain',
    options: [
      { value: '1', label: 'Just 1', desc: 'Single pool', icon: '1️⃣' },
      { value: '2-5', label: '2-5 pools', desc: 'Small portfolio', icon: '🏊' },
      { value: '6-20', label: '6-20 pools', desc: 'Growing portfolio', icon: '📋' },
      { value: '20+', label: '20+ pools', desc: 'Large operation', icon: '🏗️' },
    ],
  },
  {
    id: 'experienceLevel',
    title: 'Pool chemistry experience?',
    subtitle: "We will adjust how detailed our explanations are",
    options: [
      { value: 'beginner', label: 'New to this', desc: 'Just learning the basics', icon: '🌱' },
      { value: 'intermediate', label: 'Some experience', desc: 'Know the basics, still learning', icon: '📚' },
      { value: 'expert', label: 'Seasoned pro', desc: 'Deep chemistry knowledge', icon: '🎓' },
    ],
  },
  {
    id: 'primaryGoal',
    title: "What is your main goal?",
    subtitle: "We will prioritize recommendations around this",
    options: [
      { value: 'crystal_clear_water', label: 'Crystal clear water', desc: 'Perfect water quality always', icon: '💎' },
      { value: 'save_money', label: 'Save on chemicals', desc: 'Minimum effective dosing', icon: '💰' },
      { value: 'safety', label: 'Keep it safe', desc: 'Swimmer health and safety first', icon: '🛡️' },
      { value: 'easy_maintenance', label: 'Easy maintenance', desc: 'Simple, low-effort routine', icon: '✅' },
    ],
  },
  {
    id: 'testFrequency',
    title: 'How often do you test?',
    subtitle: "We will set smart reminder timing",
    options: [
      { value: 'daily', label: 'Daily', desc: 'Every day or near-daily', icon: '📅' },
      { value: 'twice_weekly', label: 'Twice a week', desc: 'Most common for homeowners', icon: '🗓️' },
      { value: 'weekly', label: 'Once a week', desc: 'Minimum recommended', icon: '📆' },
      { value: 'less_often', label: 'Less often', desc: 'When something looks wrong', icon: '🔍' },
    ],
  },
  {
    id: 'mainChallenge',
    title: 'Biggest pool challenge?',
    subtitle: "We will make sure every analysis addresses this",
    options: [
      { value: 'algae', label: 'Algae keeps coming back', desc: 'Green or mustard algae issues', icon: '🟢' },
      { value: 'cloudy_water', label: 'Cloudy water', desc: 'Hard to keep it clear', icon: '☁️' },
      { value: 'chemical_cost', label: 'High chemical costs', desc: 'Spending too much on chems', icon: '💸' },
      { value: 'ph_swings', label: 'pH keeps changing', desc: 'Unstable chemistry readings', icon: '📊' },
      { value: 'none', label: 'No major issues', desc: 'Just want to optimize', icon: '😊' },
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const current = STEPS[step]
  const progress = (step / STEPS.length) * 100

  function select(value: string) {
    const updated = { ...answers, [current.id]: value }
    setAnswers(updated)
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 220)
    } else {
      finish(updated)
    }
  }

  async function finish(finalAnswers: Record<string, string>) {
    setLoading(true)
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers),
      })
    } catch {}
    router.push('/dashboard')
  }

  async function skip() {
    setLoading(true)
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
    } catch {}
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0a1f44 50%, #003380 100%)' }}>
        <div className="w-12 h-12 border-4 border-white/20 rounded-full animate-spin mb-5"
          style={{ borderTopColor: '#00C9B1' }} />
        <p className="text-white font-semibold text-lg">Personalising your experience...</p>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>This only takes a second</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0a1f44 60%, #003380 100%)' }}>

      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: 'rgba(255,255,255,0.10)' }}>
        <div className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00C9B1, #006FFF)' }} />
      </div>

      <div className="px-6 pt-8 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-lg">HydroSource</span>
          <span className="font-bold text-lg" style={{ color: '#00C9B1' }}>AI</span>
          <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,201,177,0.2)', color: '#00C9B1', border: '1px solid rgba(0,201,177,0.3)' }}>
            BETA
          </span>
        </div>
        <button onClick={skip} className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Skip for now
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-1.5 mb-10">
          {STEPS.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                background: i <= step ? '#00C9B1' : 'rgba(255,255,255,0.18)',
              }} />
          ))}
        </div>

        <div className="mb-8 animate-in">
          <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#00C9B1' }}>
            STEP {step + 1} OF {STEPS.length}
          </p>
          <h1 className="font-display font-bold text-white text-2xl mb-2">{current.title}</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{current.subtitle}</p>
        </div>

        <div className="space-y-3 animate-in">
          {current.options.map((opt) => {
            const selected = answers[current.id] === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 border"
                style={selected
                  ? { background: 'rgba(0,201,177,0.12)', borderColor: '#00C9B1', boxShadow: '0 0 0 1px #00C9B1' }
                  : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)' }}
              >
                <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{opt.desc}</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={selected ? { borderColor: '#00C9B1', background: '#00C9B1' } : { borderColor: 'rgba(255,255,255,0.2)' }}>
                  {selected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="mt-6 text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}
