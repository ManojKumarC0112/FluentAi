'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Mic, MessageSquare, BarChart3, Trophy, Star, ArrowRight,
    CheckCircle2, Zap, Globe2, Brain, Volume2, ChevronRight
} from 'lucide-react'

const features = [
    { icon: Mic, title: 'Voice Conversations', desc: 'Talk naturally with AI. Real-time speech recognition and natural responses.', color: 'from-violet to-violet-light' },
    { icon: Brain, title: 'AI Grammar Coach', desc: 'Instant corrections with natural explanations after every response.', color: 'from-blue-500 to-violet' },
    { icon: BarChart3, title: 'Fluency Analytics', desc: 'Track grammar, vocabulary, WPM, and confidence scores over time.', color: 'from-emerald-500 to-teal-500' },
    { icon: Volume2, title: 'Pronunciation Feedback', desc: 'Identify mispronunciations and filler words in your speech.', color: 'from-gold to-orange-500' },
    { icon: Trophy, title: 'Gamification', desc: 'Streaks, XP, badges, and daily challenges to keep you motivated.', color: 'from-pink-500 to-rose-500' },
    { icon: Globe2, title: '7 Conversation Modes', desc: 'Chat, interview, IELTS, roleplay, debate, storytelling, and presentation.', color: 'from-cyan-500 to-blue-500' },
]

const modes = [
    { label: 'Normal Chat', emoji: '💬', desc: 'Free conversation practice' },
    { label: 'Mock Interview', emoji: '💼', desc: 'Job interview coaching' },
    { label: 'IELTS Practice', emoji: '🎓', desc: 'Band score preparation' },
    { label: 'Role Play', emoji: '🎭', desc: 'Real-world scenarios' },
    { label: 'Debate', emoji: '⚡', desc: 'Argument & persuasion' },
    { label: 'Storytelling', emoji: '📖', desc: 'Narrative expression' },
    { label: 'Presentation', emoji: '🎯', desc: 'Public speaking practice' },
]

const stats = [
    { value: '50K+', label: 'Active Learners' },
    { value: '2M+', label: 'Conversations' },
    { value: '4.9★', label: 'User Rating' },
    { value: '89%', label: 'Fluency Improvement' },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-navy-950 overflow-hidden">
            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-violet/8 rounded-full blur-[100px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet to-violet-light flex items-center justify-center shadow-glow-violet">
                        <Mic className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-heading font-bold text-xl text-white">FluentAI</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
                    <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#modes" className="hover:text-white transition-colors">Practice Modes</Link>
                    <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/sign-in" className="btn-ghost text-sm">Sign In</Link>
                    <Link href="/sign-up" className="btn-primary text-sm">
                        Start Free <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="badge-violet mb-6 inline-flex">
                        <Zap className="w-3 h-3" /> Powered by Gemini 2.5 Flash
                    </div>

                    <h1 className="font-heading text-5xl md:text-7xl font-bold leading-[1.08] mb-6">
                        Speak English with
                        <br />
                        <span className="gradient-text">Confidence</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Your personal AI speaking coach. Have real conversations, get instant grammar feedback, and track your fluency progress — all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/sign-up" className="btn-primary px-8 py-4 text-base">
                            Start Speaking Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/sign-in" className="btn-secondary px-8 py-4 text-base">
                            Watch Demo
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/30">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free forever tier</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Works on all devices</span>
                    </div>
                </motion.div>

                {/* Live demo preview card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
                    className="mt-16 max-w-2xl mx-auto"
                >
                    <div className="glass rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-violet/5 to-transparent pointer-events-none" />
                        {/* Mock conversation UI */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 rounded-full bg-red-400/80" />
                            <div className="w-3 h-3 rounded-full bg-gold/80" />
                            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                            <span className="text-white/30 text-xs ml-2">Live Conversation</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-violet/30 flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
                                <div className="bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/80 max-w-xs text-left">
                                    Tell me about your career goals. What excites you about your field?
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-sm">👤</div>
                                <div className="bg-violet/20 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white/90 max-w-xs text-left border border-violet/20">
                                    I goed to many interviews last year and learned a lot...
                                </div>
                            </div>
                            {/* Grammar feedback */}
                            <div className="glass rounded-xl p-3 border border-gold/20 text-left">
                                <p className="text-xs text-gold-light font-semibold mb-1">✏️ Grammar Correction</p>
                                <p className="text-xs text-white/50"><span className="text-red-400 line-through">goed</span> → <span className="text-emerald-400">went</span></p>
                                <p className="text-xs text-white/40 mt-1">Past tense of "go" is irregular: went, not goed.</p>
                            </div>
                        </div>

                        {/* Score preview */}
                        <div className="grid grid-cols-4 gap-3 mt-6">
                            {[['Fluency', '8.2', 'text-violet-glow'], ['Grammar', '7.8', 'text-blue-400'], ['Vocab', '7.1', 'text-emerald-400'], ['Confidence', '8.5', 'text-gold-light']].map(([label, score, color]) => (
                                <div key={label} className="text-center">
                                    <div className={`font-heading font-bold text-xl ${color}`}>{score}</div>
                                    <div className="text-white/40 text-xs mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Stats */}
            <section className="relative z-10 py-16 px-6 border-y border-white/[0.06]">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                            <div className="font-heading font-bold text-4xl gradient-text-violet mb-1">{stat.value}</div>
                            <div className="text-white/40 text-sm">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Everything you need to <span className="gradient-text">speak fluently</span></h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">Not just a chatbot — a complete speaking coach that watches, listens, and helps you improve.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-hover p-6">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-glow-violet`}>
                                <f.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-heading font-semibold text-lg text-white mb-2">{f.title}</h3>
                            <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Practice Modes */}
            <section id="modes" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">7 Ways to <span className="gradient-text">Practice</span></h2>
                    <p className="text-white/40 text-lg">From casual chat to IELTS exam prep — every mode is designed for real speaking improvement.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {modes.map((mode, i) => (
                        <motion.div key={mode.label} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                            className="glass-hover p-5 cursor-pointer group">
                            <div className="text-3xl mb-3">{mode.emoji}</div>
                            <div className="font-semibold text-white text-sm mb-1 group-hover:text-violet-glow transition-colors">{mode.label}</div>
                            <div className="text-white/40 text-xs">{mode.desc}</div>
                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-violet-glow mt-3 transition-colors" />
                        </motion.div>
                    ))}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.42 }}
                        className="glass p-5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-violet/40 transition-colors">
                        <Star className="w-8 h-8 text-violet/40 mb-2" />
                        <div className="text-white/30 text-sm">More modes coming soon</div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet/10 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="font-heading text-4xl md:text-5xl font-bold mb-4">
                            Ready to speak with <span className="gradient-text">confidence</span>?
                        </div>
                        <p className="text-white/40 mb-8 text-lg">Join 50,000+ learners improving their English every day.</p>
                        <Link href="/sign-up" className="btn-primary px-10 py-4 text-base">
                            Start for Free Today
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.06] py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet to-violet-light flex items-center justify-center">
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-heading font-bold text-white">FluentAI</span>
                    </div>
                    <p className="text-white/30 text-sm">© 2026 FluentAI. Built with ❤️ for English learners everywhere.</p>
                    <div className="flex gap-6 text-sm text-white/30">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
