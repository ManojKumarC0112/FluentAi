'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mic, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { GoalType, DifficultyLevel } from '@/lib/types'

const goals: { value: GoalType; label: string; emoji: string; desc: string }[] = [
    { value: 'daily_conversation', label: 'Daily Conversation', emoji: '💬', desc: 'Speak fluently in everyday situations' },
    { value: 'job_interview', label: 'Job Interview', emoji: '💼', desc: 'Ace interviews and land your dream job' },
    { value: 'ielts_toefl', label: 'IELTS / TOEFL', emoji: '🎓', desc: 'Prepare for English proficiency exams' },
    { value: 'business_english', label: 'Business English', emoji: '📊', desc: 'Communicate professionally at work' },
    { value: 'pronunciation', label: 'Pronunciation', emoji: '🔊', desc: 'Speak clearly and be understood' },
    { value: 'general_fluency', label: 'General Fluency', emoji: '🌟', desc: 'Overall improvement in speaking' },
]

const levels: { value: DifficultyLevel; label: string; desc: string; color: string }[] = [
    { value: 'A1', label: 'Beginner', desc: 'Just starting out', color: 'from-red-500 to-rose-600' },
    { value: 'A2', label: 'Elementary', desc: 'Know basic phrases', color: 'from-orange-500 to-amber-600' },
    { value: 'B1', label: 'Intermediate', desc: 'Can hold simple conversations', color: 'from-yellow-500 to-gold' },
    { value: 'B2', label: 'Upper-Int.', desc: 'Comfortable in most situations', color: 'from-emerald-500 to-teal-600' },
    { value: 'C1', label: 'Advanced', desc: 'Near-fluent speaker', color: 'from-blue-500 to-violet' },
    { value: 'C2', label: 'Mastery', desc: 'Perfect your English', color: 'from-violet to-purple-600' },
]

const dailyGoals = [5, 10, 15, 20, 30]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [goal, setGoal] = useState<GoalType | null>(null)
    const [level, setLevel] = useState<DifficultyLevel | null>(null)
    const [dailyGoal, setDailyGoal] = useState(15)

    const steps = ['Your Goal', 'Your Level', 'Daily Target']

    const canProceed = [!!goal, !!level, true]

    const handleFinish = async () => {
        // Save to Supabase profile
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet/8 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl">
                {/* Logo */}
                <div className="flex items-center gap-2.5 justify-center mb-10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet to-violet-light flex items-center justify-center shadow-glow-violet">
                        <Mic className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-heading font-bold text-xl text-white">FluentAI</span>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${i < step ? 'bg-violet text-white' : i === step ? 'bg-violet/30 border border-violet text-violet-glow' : 'bg-white/[0.06] text-white/30'
                                }`}>
                                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                            </div>
                            <span className={`text-xs ${i === step ? 'text-white/70' : 'text-white/25'}`}>{s}</span>
                            {i < steps.length - 1 && <div className="flex-1 h-px bg-white/[0.08]" />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass rounded-2xl p-8">

                        {/* Step 0: Goal */}
                        {step === 0 && (
                            <>
                                <h2 className="font-heading text-2xl font-bold text-white mb-1">What&apos;s your goal?</h2>
                                <p className="text-white/40 text-sm mb-6">We&apos;ll personalize your learning path based on this.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {goals.map((g) => (
                                        <button key={g.value} onClick={() => setGoal(g.value)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${goal === g.value
                                                    ? 'bg-violet/20 border-violet/50 shadow-glow-violet'
                                                    : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/15'
                                                }`}>
                                            <div className="text-2xl mb-2">{g.emoji}</div>
                                            <div className="font-semibold text-white text-sm mb-0.5">{g.label}</div>
                                            <div className="text-white/40 text-xs">{g.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Step 1: Level */}
                        {step === 1 && (
                            <>
                                <h2 className="font-heading text-2xl font-bold text-white mb-1">What&apos;s your English level?</h2>
                                <p className="text-white/40 text-sm mb-6">Be honest — we&apos;ll adapt to your level and help you grow.</p>
                                <div className="space-y-3">
                                    {levels.map((l) => (
                                        <button key={l.value} onClick={() => setLevel(l.value)}
                                            className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all duration-200 text-left ${level === l.value
                                                    ? 'bg-violet/20 border-violet/50'
                                                    : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07]'
                                                }`}>
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center flex-shrink-0`}>
                                                <span className="text-white text-xs font-bold">{l.value}</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white text-sm">{l.label}</div>
                                                <div className="text-white/40 text-xs">{l.desc}</div>
                                            </div>
                                            {level === l.value && <Check className="w-4 h-4 text-violet-glow ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Step 2: Daily goal */}
                        {step === 2 && (
                            <>
                                <h2 className="font-heading text-2xl font-bold text-white mb-1">Set your daily goal</h2>
                                <p className="text-white/40 text-sm mb-6">Consistency is the key to fluency. Start small and build up.</p>
                                <div className="grid grid-cols-5 gap-3 mb-8">
                                    {dailyGoals.map((m) => (
                                        <button key={m} onClick={() => setDailyGoal(m)}
                                            className={`py-3 rounded-xl border text-center text-sm font-semibold transition-all duration-200 ${dailyGoal === m
                                                    ? 'bg-violet/20 border-violet/50 text-violet-glow'
                                                    : 'bg-white/[0.03] border-white/[0.07] text-white/60 hover:bg-white/[0.07]'
                                                }`}>
                                            {m}
                                            <div className="text-xs font-normal text-white/30 mt-0.5">min</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="glass rounded-xl p-4 text-center">
                                    <div className="text-white/40 text-sm">Your commitment</div>
                                    <div className="font-heading font-bold text-3xl gradient-text-violet mt-1">{dailyGoal} min/day</div>
                                    <div className="text-white/30 text-xs mt-1">
                                        {dailyGoal <= 10 ? '🌱 Great start!' : dailyGoal <= 20 ? '🔥 Solid commitment!' : '⚡ Power learner!'}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                    <button onClick={() => step > 0 && setStep(step - 1)}
                        className={`btn-ghost ${step === 0 ? 'invisible' : ''}`}>
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    {step < 2 ? (
                        <button onClick={() => setStep(step + 1)} disabled={!canProceed[step]} className="btn-primary">
                            Continue <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={handleFinish} className="btn-primary px-8">
                            Start Learning 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
