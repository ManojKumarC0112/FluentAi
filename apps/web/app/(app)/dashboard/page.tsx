'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Flame, Trophy, Star, Zap, Mic, ArrowRight, BarChart3,
    MessageSquare, BookOpen, TrendingUp, Target, Clock
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const weeklyData = [
    { day: 'Mon', score: 7.2 }, { day: 'Tue', score: 7.8 },
    { day: 'Wed', score: 7.5 }, { day: 'Thu', score: 8.1 },
    { day: 'Fri', score: 8.4 }, { day: 'Sat', score: 7.9 },
    { day: 'Sun', score: 8.6 },
]

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

const recentSessions = [
    { mode: '💬', topic: 'Career Goals', date: 'Today', fluency: 8.4, duration: '12 min' },
    { mode: '💼', topic: 'Mock Interview - SDE', date: 'Yesterday', fluency: 7.9, duration: '18 min' },
    { mode: '🎓', topic: 'IELTS Part 2 - City', date: '2d ago', fluency: 8.1, duration: '8 min' },
]

const badges = [
    { icon: '🔥', name: 'Week Streak', desc: '7 days' },
    { icon: '🎯', name: 'Sharpshooter', desc: '90% grammar' },
    { icon: '💬', name: 'Chatterbox', desc: '100 conversations' },
    { icon: '⚡', name: 'Speed Talker', desc: '150 WPM avg' },
]

const practiceCards = [
    { mode: 'normal_chat', label: 'Quick Chat', emoji: '💬', desc: 'Free conversation', color: 'from-violet to-violet-light' },
    { mode: 'interview', label: 'Interview Prep', emoji: '💼', desc: 'Ace your next interview', color: 'from-blue-500 to-violet' },
    { mode: 'ielts', label: 'IELTS Practice', emoji: '🎓', desc: 'Band score prep', color: 'from-emerald-500 to-teal-600' },
    { mode: 'roleplay', label: 'Role Play', emoji: '🎭', desc: 'Real-world scenarios', color: 'from-gold to-orange-500' },
]

export default function DashboardPage() {
    const { getToken, isLoaded } = useAuth()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!isLoaded) return;
            try {
                const token = await getToken()
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/analytics/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (err) {
                console.error("Failed to fetch dashboard:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [isLoaded])

    if (loading || !data) return <div className="p-8 text-white/50 text-center animate-pulse">Loading Dashboard Dashboard...</div>

    return (
        <div className="p-6 md:p-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Good evening, {data.user.name} 👋</h1>
                    <p className="text-white/40 text-sm mt-1">You&apos;re on a {data.stats.streak}-day streak. Don&apos;t break it!</p>
                </div>
                <Link href="/conversation" className="btn-primary self-start md:self-auto">
                    <Mic className="w-4 h-4" /> Start Practicing <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: Flame, label: 'Day Streak', value: data.stats.streak, sub: '+3 from last week', color: 'from-orange-500 to-gold', iconColor: 'text-orange-400' },
                    { icon: Zap, label: 'Total XP', value: data.stats.xp, sub: '+120 today', color: 'from-violet to-violet-light', iconColor: 'text-violet-glow' },
                    { icon: MessageSquare, label: 'Conversations', value: data.stats.conversationsCompleted, sub: 'This month', color: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-400' },
                    { icon: Star, label: 'Avg. Fluency', value: data.recentScores.fluency, sub: '+0.4 this week', color: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-400' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="font-heading font-bold text-2xl text-white">{stat.value}</div>
                        <div className="text-white/50 text-sm mt-0.5">{stat.label}</div>
                        <div className="text-white/25 text-xs mt-1">{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Fluency chart */}
                <div className="lg:col-span-2 glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-heading font-semibold text-white">Fluency This Week</h2>
                            <p className="text-white/35 text-xs mt-0.5">Daily average score</p>
                        </div>
                        <span className="badge-green">↑ +0.4</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={data.weeklyProgress || []}>
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[6, 10]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#0F1A3E', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, color: '#fff' }}
                                formatter={(v: number) => [v.toFixed(1), 'Score']} />
                            <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#7C3AED', strokeWidth: 0, r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Today's goal */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-gold" />
                        <h2 className="font-heading font-semibold text-white">Today&apos;s Goal</h2>
                    </div>
                    <div className="text-center my-4">
                        <div className="relative w-32 h-32 mx-auto">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progressGrad)" strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.6)}`}
                                    strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop stopColor="#7C3AED" /><stop offset="1" stopColor="#F59E0B" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="font-heading font-bold text-2xl text-white">9</div>
                                <div className="text-white/40 text-xs">/ 15 min</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {[
                            { label: 'Speaking time', done: true },
                            { label: 'Grammar practice', done: true },
                            { label: 'Vocab review', done: false },
                        ].map((item) => (
                            <div key={item.label} className={`flex items-center gap-2 text-sm ${item.done ? 'text-white/60' : 'text-white/30'}`}>
                                <div className={`w-2 h-2 rounded-full ${item.done ? 'bg-emerald-400' : 'bg-white/15'}`} />
                                {item.label}
                            </div>
                        ))}
                    </div>
                    <Link href="/conversation" className="btn-primary w-full justify-center mt-5 py-2.5 text-sm">
                        <Clock className="w-4 h-4" /> Continue Practice
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Start Practice */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Mic className="w-5 h-5 text-violet-glow" />
                        <h2 className="font-heading font-semibold text-white">Start a Session</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {practiceCards.map((card) => (
                            <Link key={card.mode} href={`/conversation?mode=${card.mode}`}
                                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/15 transition-all duration-200 group">
                                <div className="text-2xl mb-2">{card.emoji}</div>
                                <div className="font-semibold text-white text-sm group-hover:text-violet-glow transition-colors">{card.label}</div>
                                <div className="text-white/35 text-xs mt-0.5">{card.desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent sessions */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            <h2 className="font-heading font-semibold text-white">Recent Sessions</h2>
                        </div>
                        <Link href="/history" className="text-white/35 text-xs hover:text-white transition-colors">View all →</Link>
                    </div>
                    <div className="space-y-3">
                        {recentSessions.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer">
                                <div className="text-2xl">{s.mode}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white text-sm font-medium truncate">{s.topic}</div>
                                    <div className="text-white/35 text-xs">{s.date} · {s.duration}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-heading font-semibold text-sm text-violet-glow">{s.fluency}</div>
                                    <div className="text-white/30 text-xs">fluency</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-gold" />
                    <h2 className="font-heading font-semibold text-white">Recent Achievements</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {badges.map((b) => (
                        <div key={b.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center hover:border-gold/30 transition-colors">
                            <div className="text-3xl mb-2">{b.icon}</div>
                            <div className="text-white text-sm font-semibold">{b.name}</div>
                            <div className="text-white/35 text-xs mt-0.5">{b.desc}</div>
                        </div>
                    ))}
                </div>
                <Link href="/profile" className="flex items-center gap-2 justify-center mt-4 text-white/30 hover:text-white/60 text-sm transition-colors">
                    <TrendingUp className="w-4 h-4" /> View all achievements →
                </Link>
            </div>
        </div>
    )
}
